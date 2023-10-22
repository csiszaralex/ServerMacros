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

async function main() {
  make_records();
  make_ip();
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
