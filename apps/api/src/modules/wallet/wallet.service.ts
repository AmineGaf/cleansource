import { Injectable } from '@nestjs/common';
import type { WalletResponse } from '@cleansource/contracts';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async getForUser(userId: string): Promise<WalletResponse> {
    // Wallet is created on sign-up, but upsert keeps legacy users safe.
    const wallet = await this.prisma.wallet.upsert({
      where: { userId },
      create: { userId },
      update: {},
      include: {
        transactions: { orderBy: { createdAt: 'desc' }, take: 50 },
      },
    });

    return {
      balance: wallet.balance,
      transactions: wallet.transactions.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        reason: tx.reason,
        orderId: tx.orderId,
        createdAt: tx.createdAt.toISOString(),
      })),
    };
  }
}
