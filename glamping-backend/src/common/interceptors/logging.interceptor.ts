import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() === 'ws') {
      return next.handle();
    }

    const now = Date.now();
    const req = context
      .switchToHttp()
      .getRequest<{ method: string; url: string; ip: string }>();
    const { method, url, ip } = req;

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - now;
        this.logger.log(`${method} ${url} ${elapsed}ms - ${ip}`);
      }),
    );
  }
}
