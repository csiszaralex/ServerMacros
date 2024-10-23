import { DNS_TYPE } from '@prisma/client';

export interface Record {
  name: string;
  id: string;
  type: DNS_TYPE;
  zone_id: string;
  ip: string;
  proxied: boolean;
}
