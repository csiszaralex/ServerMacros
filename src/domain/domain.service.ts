import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { firstValueFrom } from 'rxjs';
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
  async get_dns_records(zone_id: string): Promise<Record[]> {
    const res = await firstValueFrom(
      this.httpService.get(`https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records`),
    );
    const data: cloudflareDNSRecord[] = res.data.result;
    return data.map(record => {
      return {
        name: record.name,
        id: record.id,
        type: record.type,
        zone_id,
        proxied: false,
      };
    });
  }
  async get_wanted_domains(): Promise<Record[]> {
    const zones = await this.get_zones();
    const wanted = await this.prisma.dns_domain.findMany();
    let records: Record[] = [];
    for (const zone of zones) {
      records.push(...(await this.get_dns_records(zone.id)));
    }
    records = records.filter(record => {
      for (const i in wanted) {
        if (wanted[i].name == record.name && wanted[i].type == record.type) {
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
      };
    });
    return records;
  }
  async update_dns_record(record: Record, ip: string) {
    await firstValueFrom(
      this.httpService.patch(
        `https://api.cloudflare.com/client/v4/zones/${record.zone_id}/dns_records/${record.id}`,
        {
          type: record.type,
          name: record.name,
          content: ip,
          ttl: 1,
          proxied: record.proxied,
        },
      ),
    );
  }
  async changed_ip(force = false) {
    const last_ip = await this.get_last_ip();
    const ip = await this.get_ip();
    if (last_ip === ip && !force) return;
    const domains = await this.get_wanted_domains();
    for (const domain of domains) {
      await this.update_dns_record(domain, ip);
    }
    await this.prisma.ips.create({ data: { IP: ip } });
  }
}
