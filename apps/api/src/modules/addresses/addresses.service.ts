import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type Address as DbAddress } from '@prisma/client';
import type {
  Address,
  CreateAddressDto,
  UpdateAddressDto,
} from '@cleansource/contracts';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<Address[]> {
    const addresses = await this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return addresses.map(toAddress);
  }

  async create(userId: string, dto: CreateAddressDto): Promise<Address> {
    const count = await this.prisma.address.count({ where: { userId } });

    const address = await this.prisma.$transaction(async (tx) => {
      // First address is always the default.
      const isDefault = dto.isDefault || count === 0;
      if (isDefault) {
        await tx.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }
      return tx.address.create({ data: { ...dto, userId, isDefault } });
    });

    return toAddress(address);
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateAddressDto,
  ): Promise<Address> {
    await this.ensureOwned(userId, id);

    const address = await this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.address.updateMany({
          where: { userId, id: { not: id } },
          data: { isDefault: false },
        });
      }
      return tx.address.update({ where: { id }, data: dto });
    });

    return toAddress(address);
  }

  async remove(userId: string, id: string): Promise<{ ok: true }> {
    await this.ensureOwned(userId, id);
    try {
      await this.prisma.address.delete({ where: { id } });
    } catch (error) {
      // FK violation — the address is referenced by past orders.
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new ConflictException('Address is used by existing orders');
      }
      throw error;
    }
    return { ok: true };
  }

  private async ensureOwned(userId: string, id: string): Promise<void> {
    const found = await this.prisma.address.findFirst({
      where: { id, userId },
      select: { id: true },
    });
    if (!found) throw new NotFoundException('Address not found');
  }
}

function toAddress(address: DbAddress): Address {
  return {
    id: address.id,
    userId: address.userId,
    label: address.label,
    street: address.street,
    building: address.building,
    apartment: address.apartment,
    driverNotes: address.driverNotes,
    latitude: address.latitude,
    longitude: address.longitude,
    isDefault: address.isDefault,
    createdAt: address.createdAt.toISOString(),
  };
}
