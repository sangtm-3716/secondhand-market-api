import {
  ArgumentsHost,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { AppError } from './app-error';
import { ErrorCode } from './enums/error-code.enum';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let host: ArgumentsHost;
  let warn: jest.SpyInstance;
  let error: jest.SpyInstance;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    const req = { method: 'GET', url: '/v1/missing', path: '/v1/missing' };
    host = {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({ status }),
      }),
    } as unknown as ArgumentsHost;
    warn = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    error = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('maps NotFoundException to 404', () => {
    filter.catch(new NotFoundException('Post not found'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'NOT_FOUND',
        message: 'Post not found',
        path: '/v1/missing',
      }),
    );
    expect(warn).toHaveBeenCalled();
  });

  it('omits details for NotFoundException', () => {
    filter.catch(new NotFoundException('Post not found'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({ details: undefined }),
    );
  });

  it('maps unknown errors to 500 without leaking the message', () => {
    filter.catch(new Error('db exploded'), host);

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Unknown error',
      }),
    );
    expect(error).toHaveBeenCalled();
  });

  it('uses the custom code from AppError', () => {
    filter.catch(
      new AppError(
        ErrorCode.PostNotFound,
        'Post not found',
        HttpStatus.NOT_FOUND,
      ),
      host,
    );

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'POST_NOT_FOUND',
        message: 'Post not found',
        details: undefined,
      }),
    );
  });
});
