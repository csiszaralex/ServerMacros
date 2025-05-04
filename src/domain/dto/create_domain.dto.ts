import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUrl, Matches, Max, Min } from 'class-validator';

export class CreateDomainDto {
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  name: string;

  @IsString()
  @IsEnum([
    'A',
    'AAAA',
    'CNAME',
    'TXT',
    'SRV',
    'LOC',
    'MX',
    'NS',
    'SPF',
    'CERT',
    'DNSKEY',
    'DS',
    'NAPTR',
    'SMIMEA',
    'SSHFP',
    'SVCB',
    'TLSA',
    'URI',
  ])
  type = 'A';

  @IsString()
  @Matches(
    /^((?:((([0-1]){0,1}[0-9][0-9]{0,1})|(2[0-4][0-9])|(25[0-5]))\.){3}((([0-1]){0,1}[0-9][0-9]{0,1})|(2[0-4][0-9])|(25[0-5]))|dynamic)$/,
  )
  ip = 'dynamic';

  @IsNumber()
  // @IsString()
  @Min(0)
  @Max(1)
  proxied = 0;
}
