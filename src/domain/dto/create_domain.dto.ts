import { DNS_TYPE } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsString, IsUrl, Validate } from 'class-validator';
import { IpValidator } from './validators/ip.validator';

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  name: string;

  @IsString()
  @IsEnum(DNS_TYPE)
  @Transform(({ value }) => value.toUpperCase())
  //TODO enable all DNS type and remove the list from here
  // @IsEnum([
  //   'A',
  //   'AAAA',
  //   'CNAME',
  //   'TXT',
  //   'SRV',
  //   'LOC',
  //   'MX',
  //   'NS',
  //   'SPF',
  //   'CERT',
  //   'DNSKEY',
  //   'DS',
  //   'NAPTR',
  //   'SMIMEA',
  //   'SSHFP',
  //   'SVCB',
  //   'TLSA',
  //   'URI',
  // ])
  type: DNS_TYPE = 'A';

  @IsString()
  @Validate(IpValidator, ['type'])
  ip = 'dynamic';

  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  proxied = false;
}
