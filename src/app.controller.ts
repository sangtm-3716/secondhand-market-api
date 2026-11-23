import { Controller, Get, HttpStatus } from '@nestjs/common';
import { AppService } from './app.service';
import { AppError } from './common/app-error';

@Controller({ version: '1' })
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('business')
  getBusiness() {
    return this.appService.getBusinessData();
  }
  //TODO: remove after lesson complete
  @Get('app-error')
  getAppError() {
    throw new AppError(
      'POST_NOT_FOUND',
      'post not found',
      HttpStatus.NOT_FOUND,
    );
  }

  @Get('common-error')
  getCommonError() {
    throw new Error('common, everyday error');
  }
}
