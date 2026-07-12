import { Body, Controller, Patch, UseGuards } from '@nestjs/common';
import {
  completeProfileSchema,
  type CompleteProfileDto,
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

  @Patch('me')
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(completeProfileSchema)) dto: CompleteProfileDto,
  ) {
    return this.usersService.updateProfile(user.sub, dto);
  }
}
