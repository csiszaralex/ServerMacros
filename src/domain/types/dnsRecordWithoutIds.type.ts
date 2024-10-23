import { dns_records } from '@prisma/client';

export type DnsRecordWithoutIds = Omit<dns_records, 'record_id' | 'zone_id'>;
