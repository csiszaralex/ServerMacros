import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedDnsRecors() {
  //   await prisma.dns_records.createMany({
  //     data: [
  //       { name: 'csalex.dev' },
  //       { name: 'csalex.in' },
  //       { name: 'black.csalex.dev' },
  //       { name: 'dev.csalex.dev' },
  //       { name: 'alex.csalex.dev', ip: '152.66.181.110' },
  //     ],
  //   });
}
async function seedIp() {
  await prisma.ips.create({
    data: { ip: '0.0.0.0' },
  });
}

async function seedBackupTypes() {
  await prisma.backup_types.createMany({
    data: [
      {
        name: 'full',
        cron: '0 2 * * 6',
        keep_count: 2,
        dir: '/',
        exclude: '/dev;/proc;/sys;/tmp;/run;/mnt;/media;/lost+found;/backup',
        enabled: false,
      },
      {
        name: 'personal',
        cron: '0 2 * * */2',
        keep_count: 3,
        dir: '/home/pi',
        exclude: '',
        enabled: false,
      },
    ],
  });
}

async function main() {
  seedDnsRecors();
  seedIp();
  seedBackupTypes();
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
