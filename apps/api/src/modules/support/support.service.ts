import { Injectable } from '@nestjs/common';
import type {
  CreateSupportTicketDto,
  SupportTicket,
} from '@cleansource/contracts';
import { SupportProblemType } from '@cleansource/contracts';
import type { SupportTicket as DbSupportTicket } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SupportService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    dto: CreateSupportTicketDto,
  ): Promise<SupportTicket> {
    const ticket = await this.prisma.supportTicket.create({
      data: {
        reference: `ST-${Date.now().toString().slice(-6)}`,
        userId,
        orderId: dto.orderId,
        problemType: dto.problemType,
        description: dto.description,
      },
    });
    return toTicket(ticket);
  }

  async list(userId: string): Promise<SupportTicket[]> {
    const tickets = await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return tickets.map(toTicket);
  }
}

function toTicket(ticket: DbSupportTicket): SupportTicket {
  return {
    id: ticket.id,
    reference: ticket.reference,
    problemType: ticket.problemType as SupportProblemType,
    orderId: ticket.orderId,
    description: ticket.description,
    status: ticket.status,
    createdAt: ticket.createdAt.toISOString(),
  };
}
