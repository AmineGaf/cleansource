import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderType, type CreateOrderDto } from '@cleansource/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from './pricing.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
  ) {}

  async create(userId: string, dto: CreateOrderDto) {
    // 1. Resolve the subtotal from the catalog (never trust client prices).
    let subtotal = 0;
    let orderItems: {
      serviceItemId: string;
      quantity: number;
      unitPrice: number;
    }[] = [];

    if (dto.type === OrderType.BY_WEIGHT) {
      const pkg = await this.prisma.weightPackage.findFirst({
        where: { id: dto.weightPackageId, isActive: true },
      });
      if (!pkg) throw new BadRequestException('Unknown weight package');
      subtotal = pkg.price;
    } else {
      const ids = dto.items.map((item) => item.serviceItemId);
      const catalogItems = await this.prisma.serviceItem.findMany({
        where: { id: { in: ids }, isActive: true },
      });
      const priceById = new Map(
        catalogItems.map((item) => [item.id, item.price]),
      );

      orderItems = dto.items.map((item) => {
        const unitPrice = priceById.get(item.serviceItemId);
        if (unitPrice === undefined) {
          throw new BadRequestException(
            `Unknown service item: ${item.serviceItemId}`,
          );
        }
        return {
          serviceItemId: item.serviceItemId,
          quantity: item.quantity,
          unitPrice,
        };
      });
      subtotal = orderItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      );
    }

    // 2. Promo + wallet.
    const promo = dto.promoCode
      ? await this.prisma.promoCode.findFirst({
          where: {
            code: dto.promoCode,
            isActive: true,
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
        })
      : null;
    if (dto.promoCode && !promo)
      throw new BadRequestException('Invalid promo code');

    const wallet = dto.useWalletCredit
      ? await this.prisma.wallet.findUnique({ where: { userId } })
      : null;

    const breakdown = this.pricing.compute({
      subtotal,
      promo,
      walletBalance: wallet?.balance ?? 0,
    });

    // 3. Persist atomically: order + items + wallet debit + first status event.
    return this.prisma.$transaction(async (tx) => {
      const reference = `CS-${Date.now().toString().slice(-6)}`;

      const order = await tx.order.create({
        data: {
          reference,
          userId,
          type: dto.type,
          addressId: dto.addressId,
          pickupDate: new Date(dto.pickup.date),
          pickupSlot: dto.pickup.code,
          paymentMethod: dto.paymentMethod,
          specialInstructions: dto.specialInstructions,
          weightPackageId:
            dto.type === OrderType.BY_WEIGHT ? dto.weightPackageId : undefined,
          promoCodeId: promo?.id,
          ...breakdown,
          items: { create: orderItems },
          statusEvents: { create: { status: 'PLACED' } },
        },
        include: { items: true },
      });

      if (wallet && breakdown.walletCreditUsed > 0) {
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            balance: { decrement: breakdown.walletCreditUsed },
            transactions: {
              create: {
                amount: -breakdown.walletCreditUsed,
                reason: 'ORDER_PAYMENT',
                orderId: order.id,
              },
            },
          },
        });
      }

      return order;
    });
  }

  listForUser(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true, address: true },
    });
  }

  async getForUser(userId: string, id: string) {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: true,
        address: true,
        statusEvents: true,
        driver: true,
        rating: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
}
