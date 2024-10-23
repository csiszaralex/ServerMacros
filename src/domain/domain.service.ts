import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'nestjs-prisma';
import { CloudflareService } from 'src/cloudflare/cloudflare.service';
import { CreateDomainDto } from './dto/create_domain.dto';
import { DnsRecordWithoutIds } from './types/dnsRecordWithoutIds.type';

@Injectable()
export class DomainService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudflare: CloudflareService,
  ) {}

  async getLastIp(): Promise<string> {
    const last_ip = await this.prisma.ips.findFirst({
      orderBy: { id: 'desc' },
      select: { ip: true },
    });

    return last_ip.ip;
  }

  async syncDomains(): Promise<void> {
    const dbDomains = await this.prisma.dns_records.findMany();
    const cfDomains = await this.cloudflare.getDnsRecordsForAllZones();

    for (const dns of cfDomains) {
      if (!dbDomains.find(db => db.record_id === dns.id)) {
        let zone = await this.prisma.dns_zones.findFirst({ where: { zone_id: dns.zone_id } });
        if (!zone) {
          zone = await this.prisma.dns_zones.create({
            data: {
              zone_id: dns.zone_id,
              name: dns.name.split('.').slice(-2).join('.'),
            },
          });
        }
        await this.prisma.dns_records.create({
          data: {
            name: dns.name,
            type: dns.type,
            ip: dns.ip,
            zone_id: zone.id,
            record_id: dns.id,
            proxy: dns.proxied,
          },
        });
      }
    }
    for (const dns of dbDomains) {
      if (!cfDomains.find(cf => cf.id === dns.record_id)) {
        const zone = await this.prisma.dns_zones.findUnique({ where: { id: dns.zone_id } });
        await this.cloudflare.createDnsRecord(
          {
            ip: dns.ip,
            name: dns.name,
            proxied: dns.proxy,
            type: dns.type,
          },
          zone.zone_id,
        );
      }
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async checkDynamicDomains(): Promise<void> {
    const last_ip = await this.getLastIp();
    const ip = await this.cloudflare.getCurrentIp();
    if (last_ip === ip) return;

    const dynamicDns = await this.prisma.dns_records.findMany({
      where: { ip: 'dynamic' },
      include: { zone: true },
    });
    dynamicDns.forEach(async d => {
      await this.cloudflare.updateDnsIp({
        id: d.record_id,
        ip,
        name: d.name,
        proxied: d.proxy,
        type: d.type,
        zone_id: d.zone.zone_id,
      });
      await this.prisma.ips.create({ data: { ip } });
    });
  }

  async create(createDomainDto: CreateDomainDto): Promise<DnsRecordWithoutIds> {
    const { name, ip } = createDomainDto;
    const domain = await this.prisma.dns_records.findFirst({ where: { name } });
    if (domain) throw new ConflictException('Domain already exists');

    const zoneName = name.split('.').slice(-2).join('.');
    await this.syncDomains();
    const zone = await this.prisma.dns_zones.findUnique({ where: { name: zoneName } });
    if (!zone) throw new NotFoundException('Zone not found, please add it to cloudflare first');

    const newDns = await this.cloudflare.createDnsRecord(createDomainDto, zone.zone_id);
    const newDomain = await this.prisma.dns_records.create({
      data: {
        name: newDns.name,
        type: newDns.type,
        ip,
        zone_id: zone.id,
        record_id: newDns.id,
        proxy: newDns.proxied,
      },
    });
    delete newDomain.record_id;
    delete newDomain.zone_id;

    return newDomain;
  }
  async delete(id: number): Promise<never> {
    const domain = await this.prisma.dns_records.findUnique({
      where: { id },
      include: { zone: true },
    });
    if (!domain) throw new NotFoundException('Domain not found');
    await this.cloudflare.deleteDnsRecord(domain.zone.zone_id, domain.record_id);
    await this.prisma.dns_records.delete({ where: { id } });
    return;
  }

  async getAll(): Promise<DnsRecordWithoutIds[]> {
    await this.syncDomains();
    return (await this.prisma.dns_records.findMany()).map(record => {
      delete record.record_id;
      delete record.zone_id;
      return record;
    });
  }
}
