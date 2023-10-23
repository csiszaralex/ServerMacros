import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { dns_domain } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { firstValueFrom } from 'rxjs';
import { CreateDomainDto } from './dto/create_domain.dto';
import { cloudflareDNSRecord, cloudflareZone } from './interfaces/cloudflare.interface';
import { Record } from './interfaces/record.interface';

@Injectable()
export class DomainService {
  constructor(private readonly prisma: PrismaService, private readonly httpService: HttpService) {}

  async get_last_ip(): Promise<string> {
    const last_ip = await this.prisma.ips.findFirst({
      orderBy: {
        id: 'desc',
      },
      select: {
        IP: true,
      },
    });

    return last_ip.IP;
  }
  async get_ip(): Promise<string> {
    //TODO random ip for testing
    const { data } = await firstValueFrom(
      this.httpService.get('https://api.ipify.org?format=json'),
    );
    return data.ip;
  }
  async get_zones(): Promise<{ name: string; id: string }[]> {
    const res = await firstValueFrom(
      this.httpService.get('https://api.cloudflare.com/client/v4/zones'),
    );
    const data: cloudflareZone[] = res.data.result;
    return data.map(zone => {
      return { name: zone.name, id: zone.id };
    });
  }
  async get_dns_records_for_zone(zone_id: string): Promise<Record[]> {
    const res = await firstValueFrom(
      this.httpService.get(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`),
    );
    const data: cloudflareDNSRecord[] = res.data.result;
    return data.map(record => {
      return {
        name: record.name,
        id: record.id,
        type: record.type,
        ip: record.content,
        zone_id,
        proxied: false,
      };
    });
  }
  async get_dns_records(): Promise<Record[]> {
    const zones = await this.get_zones();
    const records: Record[] = [];
    for (const zone of zones) {
      records.push(...(await this.get_dns_records_for_zone(zone.id)));
    }
    return records;
  }
  async get_wanted_domains(): Promise<Record[]> {
    const wanted = await this.prisma.dns_domain.findMany();
    let records = await this.get_dns_records();
    records = records.filter(record => {
      for (const i in wanted) {
        if (wanted[i].name == record.name && wanted[i].type == record.type) {
          if (wanted[i].ip != 'dynamic') {
            return record.ip != wanted[i].ip || record.proxied != wanted[i].proxy;
          }
          return true;
        }
      }
      return false;
    });

    records = records.map(record => {
      return {
        ...record,
        proxied: wanted.find(
          wanted_record => wanted_record.name == record.name && wanted_record.type == record.type,
        ).proxy,
        ip: wanted.find(
          wanted_record => wanted_record.name == record.name && wanted_record.type == record.type,
        ).ip,
      };
    });
    return records;
  }
  async update_dns_record(record: Record, ip: string): Promise<void> {
    await firstValueFrom(
      this.httpService.put(
        `https://api.cloudflare.com/client/v4/zones/${record.zone_id}/dns_records/${record.id}`,
        {
          content: record.ip == 'dynamic' ? ip : record.ip,
          type: record.type,
          name: record.name,
          ttl: 1,
          proxied: record.proxied,
        },
      ),
    );
  }
  async change_domains_if_needed(force = false): Promise<{ last_ip: string; ip: string }> {
    const last_ip = await this.get_last_ip();
    const ip = await this.get_ip();
    if (last_ip === ip && !force) return;
    const domains = await this.get_wanted_domains();
    for (const domain of domains) {
      await this.update_dns_record(domain, ip);
    }
    await this.prisma.ips.create({ data: { IP: ip } });
    return { last_ip, ip };
  }
  async create(createDomainDto: CreateDomainDto): Promise<dns_domain> {
    const { name, type, ip, proxied } = createDomainDto;
    const domain = await this.prisma.dns_domain.findFirst({ where: { name } });
    if (domain) throw new ConflictException('Domain already exists');

    const zones = await this.get_zones();
    const zone = zones.find(zone => name.endsWith(zone.name));
    if (!zone) throw new BadRequestException("You don't own this domain");
    const newDomain = await this.prisma.dns_domain.create({
      data: {
        name,
        type,
        ip,
        proxy: proxied == 1,
      },
    });
    const myIp = await this.get_last_ip();
    await firstValueFrom(
      this.httpService.post(`https://api.cloudflare.com/client/v4/zones/${zone.id}/dns_records`, {
        content: newDomain.ip == 'dynamic' ? myIp : newDomain.ip,
        type: newDomain.type,
        name: newDomain.name,
        proxied: newDomain.proxy,
      }),
    );

    return newDomain;
  }
  async delete(id: number): Promise<never> {
    const domain = await this.prisma.dns_domain.findUnique({ where: { id } });
    if (!domain) throw new NotFoundException('Domain not found');
    const records = await this.get_dns_records();
    const record = records.find(record => record.name == domain.name && record.type == domain.type);
    if (!record) throw new NotFoundException('Domain not found');
    await firstValueFrom(
      this.httpService.delete(
        `https://api.cloudflare.com/client/v4/zones/${record.zone_id}/dns_records/${record.id}`,
      ),
    );
    await this.prisma.dns_domain.delete({ where: { id } });
    return;
  }
  async getAll(): Promise<{ ip: string; name: string; proxy: boolean; type: string }[]> {
    return this.prisma.dns_domain.findMany({
      select: { id: false, ip: true, name: true, proxy: true, type: true },
    });
  }
}
