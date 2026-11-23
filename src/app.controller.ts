import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('app')
@Controller({ version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check: returns a greeting' })
  @ApiResponse({ status: 200, description: 'Returns "Hello World!"' })
  @ApiResponse({ status: 500, description: 'Unexpected server error' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('business')
  @ApiOperation({ summary: 'Get business settings (currency, price limit)' })
  @ApiResponse({ status: 200, description: 'Returns { currency, priceLimit }' })
  @ApiResponse({ status: 500, description: 'Unexpected server error' })
  getBusiness() {
    return this.appService.getBusinessData();
  }
}
