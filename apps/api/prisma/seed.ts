/**
 * Seeds the catalog with the exact services, items and prices from the
 * approved design (all prices in halalas).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sar = (amount: number) => amount * 100;

async function main() {
  // Services
  const washAndFold = await prisma.service.upsert({
    where: { code: 'WASH_AND_FOLD' },
    update: {},
    create: {
      code: 'WASH_AND_FOLD',
      nameAr: 'غسيل وكي',
      nameEn: 'Wash & Fold',
      descAr: 'غسيل وتجفيف وكي وطي',
      descEn: 'Wash, dry, iron & fold',
      sortOrder: 1,
    },
  });

  const dryClean = await prisma.service.upsert({
    where: { code: 'DRY_CLEAN' },
    update: {},
    create: {
      code: 'DRY_CLEAN',
      nameAr: 'تنظيف جاف',
      nameEn: 'Dry Clean',
      descAr: 'عناية فائقة بالملابس الحساسة والرسمية',
      descEn: 'Expert care for delicate & formal garments',
      sortOrder: 2,
    },
  });

  await prisma.service.upsert({
    where: { code: 'IRONING' },
    update: {},
    create: {
      code: 'IRONING',
      nameAr: 'كي الملابس',
      nameEn: 'Ironing',
      descAr: 'كي احترافي مع تغليف أنيق',
      descEn: 'Professional pressing, neatly packaged',
      sortOrder: 3,
    },
  });

  // Dry-clean items — prices from the design's service-detail screen
  const items: [string, string, number][] = [
    ['قميص', 'Shirt', 12],
    ['بنطال', 'Trousers', 14],
    ['ثوب', 'Thobe', 18],
    ['عباية', 'Abaya', 25],
    ['بدلة رسمية', 'Suit', 35],
  ];

  for (const [index, [nameAr, nameEn, price]] of items.entries()) {
    const existing = await prisma.serviceItem.findFirst({
      where: { serviceId: dryClean.id, nameEn },
    });
    if (!existing) {
      await prisma.serviceItem.create({
        data: { serviceId: dryClean.id, nameAr, nameEn, price: sar(price), sortOrder: index },
      });
    }
  }

  // Wash & fold per-piece
  const wfExisting = await prisma.serviceItem.findFirst({
    where: { serviceId: washAndFold.id, nameEn: 'Wash & iron (per piece)' },
  });
  if (!wfExisting) {
    await prisma.serviceItem.create({
      data: {
        serviceId: washAndFold.id,
        nameAr: 'غسيل وكي (للقطعة)',
        nameEn: 'Wash & iron (per piece)',
        price: sar(5),
        sortOrder: 0,
      },
    });
  }

  // Weight packages — 6 kg / 49 SAR and 12 kg / 89 SAR (client's brief)
  const packages = [
    {
      kg: 6,
      nameAr: 'باقة 6 كيلو',
      nameEn: '6 KG Package',
      descAr: 'تكفي شخصاً واحداً · ملابس 2–3 أيام',
      descEn: 'For one person · 2–3 days of clothes',
      price: sar(49),
    },
    {
      kg: 12,
      nameAr: 'باقة 12 كيلو',
      nameEn: '12 KG Package',
      descAr: 'مثالية للعائلة · وفّر 9 ر.س',
      descEn: 'Ideal for families · save 9 SAR',
      price: sar(89),
    },
  ];

  for (const pkg of packages) {
    const existing = await prisma.weightPackage.findFirst({ where: { kg: pkg.kg } });
    if (!existing) await prisma.weightPackage.create({ data: pkg });
  }

  // First-order promo from the design: CLEAN20 — 20% off
  await prisma.promoCode.upsert({
    where: { code: 'CLEAN20' },
    update: {},
    create: { code: 'CLEAN20', percentOff: 20, firstOrderOnly: true },
  });

  console.log('Seed complete.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
