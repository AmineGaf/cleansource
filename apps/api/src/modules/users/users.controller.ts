import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import {
  registerPushTokenSchema,
  updateProfileSchema,
  type RegisterPushTokenDto,
  type UpdateProfileDto,
} from '@cleansource/contracts';

import {
  CurrentUser,
  type JwtPayload,
} from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.getMe(user.sub);
  }

  @Patch('me')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }

  @Post('me/push-token')
  registerPushToken(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(registerPushTokenSchema))
    dto: RegisterPushTokenDto,
  ) {
    return this.usersService.registerPushToken(user.sub, dto);
  }
}
