import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AddFilesFlagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    
    // Check if files are present (multer adds files to request.files or request.file)
    const hasFiles = (request.files && request.files.length > 0) || request.file;
    
    // Add flag to body if files are present
    if (hasFiles) {
      if (!request.body || typeof request.body !== 'object') {
        request.body = {};
      }
      request.body.__hasFiles = true;
    }
    
    return next.handle();
  }
}

