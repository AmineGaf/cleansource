import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CANCELLABLE_STATUSES,
  OrderStatus,
  OrderType,
  type CancelOrderDto,
  type CreateOrderDto,
  type OrderDetail,
  type OrderRating,
  type OrderSummary,
  type RateOrderDto,
} from '@cleansource/contracts';

import { PrismaService } from '../../prisma/prisma.service';
import { PricingService } from './pricing.service';

/** Prisma include used everywhere the full order shape is needed. */
const detailInclude = {
  items: { include: { serviceItem: true } },
  address: true,
  statusEvents: { orderBy: { createdAt: 'asc' as const } },
  driver: true,
  rating: true,
} as const;

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricing: PricingService,
  ) {}

  async create(userId: string, dto: CreateOrderDto): Promise<OrderDetail> {
    // 0. The pickup address must belong to the customer.
    const address = await this.prisma.address.findFirst({
      where: { id: dto.addressId, userId },
      select: { id: true },
    });
    if (!address) throw new BadRequestException('Unknown address');

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
    const order = await this.prisma.$transaction(async (tx) => {
      const reference = `CS-${Date.now().toString().slice(-6)}`;

      const created = await tx.order.create({
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
        include: detailInclude,
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
                orderId: created.id,
              },
            },
          },
        });
      }

      return created;
    });

    return toDetail(order);
  }

  async listForUser(userId: string): Promise<OrderSummary[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { items: true } } },
    });
    return orders.map((order) => ({
      ...toSummary(order),
      itemsCount: order._count.items,
    }));
  }

  async getForUser(userId: string, id: string): Promise<OrderDetail> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: detailInclude,
    });
    if (!order) throw new NotFoundException('Order not found');
    return toDetail(order);
  }

  /** Customers may cancel only before pickup; wallet credit is refunded. */
  async cancel(
    userId: string,
    id: string,
    dto: CancelOrderDto,
  ): Promise<OrderDetail> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw new ConflictException('Order can no longer be cancelled');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status: OrderStatus.CANCELLED,
          cancelReason: dto.comment
            ? `${dto.reason}: ${dto.comment}`
            : dto.reason,
          statusEvents: { create: { status: OrderStatus.CANCELLED } },
        },
      });

      if (order.walletCreditUsed > 0) {
        await tx.wallet.update({
          where: { userId },
          data: {
            balance: { increment: order.walletCreditUsed },
            transactions: {
              create: {
                amount: order.walletCreditUsed,
                reason: 'REFUND',
                orderId: id,
              },
            },
          },
        });
      }
    });

    return this.getForUser(userId, id);
  }

  async rate(
    userId: string,
    id: string,
    dto: RateOrderDto,
  ): Promise<OrderRating> {
    const order = await this.prisma.order.findFirst({
      where: { id, userId },
      include: { rating: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== OrderStatus.DELIVERED) {
      throw new ConflictException('Only delivered orders can be rated');
    }
    if (order.rating) {
      throw new ConflictException('Order already rated');
    }

    const rating = await this.prisma.rating.create({
      data: {
        orderId: id,
        stars: dto.stars,
        compliments: dto.compliments,
        comment: dto.comment,
      },
    });

    return {
      stars: rating.stars,
      compliments: rating.compliments,
      comment: rating.comment,
    };
  }
}

// ─── Mappers: Prisma rows → @cleansource/contracts shapes ────────────────

interface OrderRow {
  id: string;
  reference: string;
  type: OrderType;
  status: OrderStatus;
  pickupDate: Date;
  pickupSlot: string;
  subtotal: number;
  discount: number;
  walletCreditUsed: number;
  vat: number;
  total: number;
  createdAt: Date;
}

function toSummary(order: OrderRow): OrderSummary {
  return {
    id: order.id,
    reference: order.reference,
    type: order.type,
    status: order.status,
    pickup: {
      code: order.pickupSlot,
      date: order.pickupDate.toISOString().slice(0, 10),
    },
    itemsCount: 0,
    total: order.total,
    createdAt: order.createdAt.toISOString(),
  };
}

function toDetail(
  order: OrderRow & {
    paymentMethod: OrderDetail['paymentMethod'];
    specialInstructions: string | null;
    cancelReason: string | null;
    address: {
      id: string;
      userId: string;
      label: 'HOME' | 'WORK' | 'OTHER';
      street: string;
      building: string | null;
      apartment: string | null;
      driverNotes: string | null;
      latitude: number | null;
      longitude: number | null;
      isDefault: boolean;
      createdAt: Date;
    };
    items: {
      id: string;
      serviceItemId: string;
      quantity: number;
      unitPrice: number;
      serviceItem: { nameAr: string; nameEn: string };
    }[];
    statusEvents: { id: string; status: OrderStatus; createdAt: Date }[];
    driver: {
      id: string;
      name: string;
      phone: string;
      rating: number;
    } | null;
    rating: {
      stars: number;
      compliments: string[];
      comment: string | null;
    } | null;
  },
): OrderDetail {
  return {
    ...toSummary(order),
    itemsCount: order.items.length,
    paymentMethod: order.paymentMethod,
    specialInstructions: order.specialInstructions,
    cancelReason: order.cancelReason,
    breakdown: {
      subtotal: order.subtotal,
      discount: order.discount,
      walletCreditUsed: order.walletCreditUsed,
      vat: order.vat,
      total: order.total,
    },
    address: {
      id: order.address.id,
      userId: order.address.userId,
      label: order.address.label,
      street: order.address.street,
      building: order.address.building,
      apartment: order.address.apartment,
      driverNotes: order.address.driverNotes,
      latitude: order.address.latitude,
      longitude: order.address.longitude,
      isDefault: order.address.isDefault,
      createdAt: order.address.createdAt.toISOString(),
    },
    items: order.items.map((item) => ({
      id: item.id,
      serviceItemId: item.serviceItemId,
      name: { ar: item.serviceItem.nameAr, en: item.serviceItem.nameEn },
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    statusEvents: order.statusEvents.map((event) => ({
      id: event.id,
      status: event.status,
      createdAt: event.createdAt.toISOString(),
    })),
    driver: order.driver
      ? {
          id: order.driver.id,
          name: order.driver.name,
          phone: order.driver.phone,
          rating: order.driver.rating,
        }
      : null,
    rating: order.rating
      ? {
          stars: order.rating.stars,
          compliments: order.rating.compliments,
          comment: order.rating.comment,
        }
      : null,
  };
}
