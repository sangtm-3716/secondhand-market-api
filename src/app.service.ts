import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(
    @Inject('CURRENCY') private readonly currency: string,
    @Inject('PRICE_LIMIT') private readonly priceLimit: number,
  ) {}

  getBusinessData() {
    return { currency: this.currency, priceLimit: this.priceLimit };
  }

  getHello(): string {
    return 'Hello World!';
  }
}
