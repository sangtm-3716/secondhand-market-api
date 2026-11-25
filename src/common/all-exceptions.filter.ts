import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

function isRedundantNestBody(
  b: Record<string, unknown>,
  status: number,
): boolean {
  const { statusCode, message: _message, error, ...rest } = b;

  const isErrorSameAsStatus =
    error === undefined ||
    (typeof error === 'string' &&
      error.toUpperCase().replace(/ /g, '_') === HttpStatus[status]);

  return (
    Object.keys(rest).length === 0 &&
    isErrorSameAsStatus &&
    (statusCode === undefined || statusCode === status)
  );
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let code = HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';
    let message = 'Unknown error';
    let details: unknown;

    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      if (typeof body === 'string') {
        message = body;
      } else {
        const b = body as Record<string, unknown>;
        if (typeof b.code === 'string') code = b.code;
        else if (!isRedundantNestBody(b, status)) details = body;

        if (Array.isArray(b.message)) message = b.message.join('; ');
        else if (typeof b.message === 'string') message = b.message;
        else message = exception.message;
      }
    }

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} -> ${status} ${code}`,
        (exception as Error)?.stack,
      );
    } else {
      this.logger.warn(`${req.method} ${req.url} -> ${status} ${code}`);
    }

    res.status(status).json({
      code,
      message,
      details,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  }
}
