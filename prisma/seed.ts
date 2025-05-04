import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function make_records() {
  await prisma.dns_domain.createMany({
    data: [
      { name: 'csalex.dev' },
      { name: 'csalex.in' },
      { name: 'black.csalex.dev' },
      { name: 'dev.csalex.dev' },
      { name: 'alex.csalex.dev', ip: '152.66.183.110' },
    ],
  });
}
async function make_ip() {
  await prisma.ips.create({
    data: {
      IP: '0.0.0.0',
    },
  });
}

async function make_backups_types() {
  await prisma.backup_type.createMany({
    data: [
      {
        name: 'Full',
        keep_count: 2,
        dir: '/',
        cron: '0 2 * * 6',
        active: false,
        exclude: [
          '/dev',
          '/proc',
          '/sys',
          '/tmp',
          '/run',
          '/mnt',
          '/media',
          '/lost+found',
          '/backup',
        ].join(';'),
      },
      {
        name: 'Personal',
        keep_count: 3,
        dir: '/home/pi',
        cron: '0 2 * * */2',
        active: false,
        exclude: '',
      },
      {
        name: 'Full_test',
        active: true,
        cron: '30 */2 * * * *',
        keep_count: 2,
        dir: '/home/pi/Documents/python',
        exclude: '',
      },
      {
        name: 'PerTest',
        active: true,
        cron: '* * * * *',
        keep_count: 5,
        dir: '/home/pi/Documents/test',
        exclude: '',
      },
    ],
  });
}

async function main() {
  make_records();
  make_ip();
  make_backups_types();
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
