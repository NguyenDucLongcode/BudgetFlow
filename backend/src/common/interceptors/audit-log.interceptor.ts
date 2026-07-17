import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { AuditLogService } from 'src/modules/audit/audit.service';
import { AUDIT_KEY, AuditOptions } from '../decorators/audit.decorator';
import { AuditAction } from 'generated/prisma/enums';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private readonly auditLogService: AuditLogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Lấy audit options từ decorator
    const auditOptions = this.reflector.get<AuditOptions>(
      AUDIT_KEY,
      context.getHandler(),
    );

    // Nếu không có decorator, skip
    if (!auditOptions) {
      return next.handle();
    }

    const { user, ip, headers } = request;
    const userAgent = headers['user-agent'];

    return next.handle().pipe(
      tap({
        next: (response) => {
          // Gọi log trong background, không chặn response
          this.logAudit({
            userId: user?.sub,
            action: auditOptions.action,
            entity: auditOptions.entity,
            entityId: this.extractEntityId(response),
            ipAddress: ip,
            userAgent,
            metadata: {
              method: request.method,
              url: request.url,
              statusCode: response?.statusCode || 200,
            },
          });
        },
        error: (error) => {
          // Log lỗi nếu cần
          this.logAudit({
            userId: user?.sub,
            action: auditOptions.action,
            entity: auditOptions.entity,
            ipAddress: ip,
            userAgent,
            metadata: {
              method: request.method,
              url: request.url,
              error: error.message,
              statusCode: error.status || 500,
            },
          });
        },
      }),
    );
  }

  private logAudit(data: {
    userId?: string;
    action: AuditAction; // 👈 SỬA: string → AuditAction
    entity: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, any>;
  }): void {
    this.auditLogService.log(data).catch((err) => {
      // Chỉ log lỗi trong development
      if (process.env.NODE_ENV === 'development') {
        console.error('Audit log failed:', err);
      }
    });
  }

  private extractEntityId(response: any): string | undefined {
    if (!response || typeof response !== 'object') {
      return undefined;
    }

    if (response.data?.id) {
      return String(response.data.id);
    }

    if (response.id) {
      return String(response.id);
    }

    return undefined;
  }
}
