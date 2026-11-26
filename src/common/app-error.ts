import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCode } from './enums/error-code.enum';

export class AppError extends HttpException {
  constructor(
    readonly code: ErrorCode,
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
  ) {
    super({ code, message }, status);
  }
}
