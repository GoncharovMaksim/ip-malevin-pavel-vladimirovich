import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialWorkTypes = [
  { name: 'Кладка перегородок', unit: 'м³' },
  { name: 'Монтаж опалубки', unit: 'м²' },
  { name: 'Штукатурка стен', unit: 'м²' },
  { name: 'Армирование плит', unit: 'т' },
  { name: 'Заливка бетона', unit: 'м³' },
  { name: 'Монтаж металлоконструкций', unit: 'т' },
  { name: 'Укладка плитки', unit: 'м²' },
  { name: 'Монтаж окон', unit: 'шт' },
  { name: 'Покраска потолков', unit: 'м²' },
];

async function main() {
  for (const item of initialWorkTypes) {
    await prisma.workType.upsert({
      where: { name: item.name },
      update: {},
      create: item,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
