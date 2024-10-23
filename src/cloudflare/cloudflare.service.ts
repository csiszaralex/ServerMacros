import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { CreateDomainDto } from 'src/domain/dto/create_domain.dto';
import { cloudflareDNSRecord, cloudflareZone } from './interfaces/cloudflare.interface';
import { Record } from './interfaces/record.interface';
import { ZoneDetails } from './interfaces/zone_details.interface';

@Injectable()
export class CloudflareService {
  constructor(private readonly httpService: HttpService) {
    //TODO: cache domains
  }

  async getCurrentIp(): Promise<string> {
    const { data } = await firstValueFrom(
      this.httpService.get('https://api.ipify.org?format=json'),
    );
    return data.ip;
  }

  async getZones(): Promise<ZoneDetails[]> {
    const res = await firstValueFrom(
      this.httpService.get('https://api.cloudflare.com/client/v4/zones'),
    );
    const data: cloudflareZone[] = res.data.result;
    return data.map(zone => {
      return { name: zone.name, id: zone.id };
    });
  }

  async getDnsRecordsForZone(zone_id: string): Promise<Record[]> {
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
        proxied: record.proxied,
      };
    });
  }

  async getDnsRecordsForAllZones(): Promise<Record[]> {
    const zones = await this.getZones();
    const records: Record[] = [];
    for (const zone of zones) {
      records.push(...(await this.getDnsRecordsForZone(zone.id)));
    }
    return records;
  }

  async deleteDnsRecord(zone_id: string, record_id: string): Promise<void> {
    await firstValueFrom(
      this.httpService.delete(
        `https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${record_id}`,
      ),
    );
  }

  async createDnsRecord(
    createDomainDto: CreateDomainDto,
    zoneId: string,
  ): Promise<cloudflareDNSRecord> {
    const ip = createDomainDto.ip === 'dynamic' ? await this.getCurrentIp() : createDomainDto.ip;

    const res = await firstValueFrom(
      this.httpService.post(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
        name: createDomainDto.name,
        type: createDomainDto.type,
        content: ip,
        ttl: 1,
        proxied: createDomainDto.proxied === true,
      }),
    );
    return res.data.result;
  }

  async updateDnsIp(record: Record): Promise<void> {
    await firstValueFrom(
      this.httpService.put(
        `https://api.cloudflare.com/client/v4/zones/${record.zone_id}/dns_records/${record.id}`,
        {
          content: record.ip,
          type: record.type,
          name: record.name,
          ttl: 1,
          proxied: record.proxied,
        },
      ),
    );
  }
}
