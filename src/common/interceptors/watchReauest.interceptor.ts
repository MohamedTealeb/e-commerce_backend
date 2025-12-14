
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    console.log('Before...');

    const now = Date.now();
    return next
      .handle()
      .pipe(
        timeout(Number(process.env.REQUEST_TIMEOUT) || 30000), // 30 seconds default, configurable via env
        catchError(err => {
        if (err instanceof TimeoutError) {
          return throwError(() => new RequestTimeoutException('Request Timeout'));
        }
        return throwError(() => err);
      }),
        tap(() => console.log(`After... ${Date.now() - now}ms`)),
      );
  }
}
