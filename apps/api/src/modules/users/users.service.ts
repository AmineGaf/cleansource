import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  AuthUser,
  RegisterPushTokenDto,
  UpdateProfileDto,
} from '@cleansource/contracts';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.toAuthUser(user);
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<AuthUser> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: dto.fullName,
        email: dto.email,
        language: dto.language,
      },
    });
    return this.toAuthUser(user);
  }

  async registerPushToken(
    userId: string,
    dto: RegisterPushTokenDto,
  ): Promise<{ ok: true }> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { pushToken: dto.token },
    });
    return { ok: true };
  }

  private toAuthUser(user: {
    id: string;
    phone: string;
    fullName: string | null;
    email: string | null;
    language: 'ar' | 'en';
  }): AuthUser {
    return {
      id: user.id,
      phone: user.phone,
      fullName: user.fullName,
      email: user.email,
      language: user.language,
    };
  }
}
