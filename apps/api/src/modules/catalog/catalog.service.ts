import { Injectable } from '@nestjs/common';
import type { CatalogResponse } from '@cleansource/contracts';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async getCatalog(): Promise<CatalogResponse> {
    const [services, items, weightPackages] = await Promise.all([
      this.prisma.service.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.serviceItem.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.weightPackage.findMany({
        where: { isActive: true },
        orderBy: { kg: 'asc' },
      }),
    ]);

    return {
      services: services.map((service) => ({
        id: service.id,
        code: service.code,
        name: { ar: service.nameAr, en: service.nameEn },
        description: { ar: service.descAr, en: service.descEn },
        isActive: service.isActive,
        sortOrder: service.sortOrder,
      })),
      items: items.map((item) => ({
        id: item.id,
        serviceId: item.serviceId,
        name: { ar: item.nameAr, en: item.nameEn },
        price: item.price,
        isActive: item.isActive,
        sortOrder: item.sortOrder,
      })),
      weightPackages: weightPackages.map((pkg) => ({
        id: pkg.id,
        kg: pkg.kg,
        name: { ar: pkg.nameAr, en: pkg.nameEn },
        description: { ar: pkg.descAr, en: pkg.descEn },
        price: pkg.price,
        isActive: pkg.isActive,
      })),
    };
  }
}
