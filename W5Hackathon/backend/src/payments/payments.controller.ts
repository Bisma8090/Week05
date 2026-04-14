import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post(':carId')
  @UseGuards(JwtAuthGuard)
  makePayment(@Param('carId') carId: string, @Request() req: any) {
    return this.paymentsService.makePayment(carId, req.user._id);
  }

  @Get('user/my-payments')
  @UseGuards(JwtAuthGuard)
  getUserPayments(@Request() req: any) {
    return this.paymentsService.getUserPayments(req.user._id);
  }

  @Get(':carId')
  @UseGuards(JwtAuthGuard)
  getPayment(@Param('carId') carId: string, @Request() req: any) {
    return this.paymentsService.getPayment(carId, req.user._id);
  }
}
