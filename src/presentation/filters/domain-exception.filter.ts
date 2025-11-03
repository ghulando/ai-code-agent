import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ValidationError, CodexExecutionError, PathAccessError } from '../../domain/errors';

@Catch(ValidationError, CodexExecutionError, PathAccessError)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof ValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof CodexExecutionError) {
      status = HttpStatus.BAD_REQUEST;
      message = exception.message;
    } else if (exception instanceof PathAccessError) {
      status = HttpStatus.FORBIDDEN;
      message = exception.message;
    }

    response.status(status).json({
      error: exception.constructor.name,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
