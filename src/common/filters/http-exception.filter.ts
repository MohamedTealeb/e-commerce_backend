import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { errorResponse } from '../utils/response';
import { HttpStatusEnum } from '../enums/http-status.enum';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private getUserFriendlyMessage(status: number): string {
    if (status === HttpStatusEnum.BAD_REQUEST) {
      return 'INVALID_REQUEST';
    } else if (status === HttpStatusEnum.UNAUTHORIZED) {
      return 'UNAUTHORIZED';
    } else if (status === HttpStatusEnum.FORBIDDEN) {
      return 'FORBIDDEN';
    } else if (status === HttpStatusEnum.INVALID_REQUEST) {
      return 'INVALID_REQUEST';
    } else if (status === HttpStatusEnum.REQUEST_TIMEOUT) {
      return 'REQUEST_TIMEOUT';
    } else if (status === HttpStatusEnum.CONFLICT) {
      return 'CONFLICT';
    } else if (status >= HttpStatusEnum.INTERNAL_SERVER_ERROR) {
      return 'INTERNAL_SERVER_ERROR';
    }

    return 'INTERNAL_SERVER_ERROR';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status: number = HttpStatusEnum.INTERNAL_SERVER_ERROR;
    let cause = 'INTERNAL_SERVER_ERROR';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      if (typeof exceptionResponse === 'string') {
        cause = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        cause = responseObj.message || exception.message || 'An error occurred';
        
        // Handle array of messages
        if (Array.isArray(cause)) {
          cause = cause.join(', ');
        }
      } else {
        cause = exception.message || 'An error occurred';
      }
    } else if (exception instanceof Error) {
      cause = exception.message || 'An error occurred';
    }

    const errorMessage = this.getUserFriendlyMessage(status);

    const errorResponseObj = errorResponse({
      cause: cause, 
      errorMessage: errorMessage,
      status: status as number,
    });
    response.status(status).json(errorResponseObj);
  }
}

