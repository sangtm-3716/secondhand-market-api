import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';
import { AppError } from './common/app-error';

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

  //TODO: remove after lesson complete
  @Get('app-error')
  @ApiOperation({ summary: 'Demo: always throws an AppError' })
  @ApiResponse({
    status: 404,
    description:
      'Always returned: { code: "POST_NOT_FOUND", message, path, timestamp }',
  })
  getAppError() {
    throw new AppError(
      'POST_NOT_FOUND',
      'post not found',
      HttpStatus.NOT_FOUND,
    );
  }

  @Get('common-error')
  @ApiOperation({ summary: 'Demo: always throws a plain Error' })
  @ApiResponse({
    status: 500,
    description:
      'Always returned: { code: "INTERNAL_SERVER_ERROR", message, path, timestamp }',
  })
  getCommonError() {
    throw new Error('common, everyday error');
  }
}
