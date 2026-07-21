import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  createSupportTicketSchema,
  type CreateSupportTicketDto,
} from '@cleansource/contracts';

import {
  CurrentUser,
  type JwtPayload,
} from '../../common/current-user.decorator';
import { JwtAuthGuard } from '../../common/jwt-auth.guard';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { SupportService } from './support.service';

@Controller('support/tickets')
@UseGuards(JwtAuthGuard)
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.supportService.list(user.sub);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body(new ZodValidationPipe(createSupportTicketSchema))
    dto: CreateSupportTicketDto,
  ) {
    return this.supportService.create(user.sub, dto);
  }
}
