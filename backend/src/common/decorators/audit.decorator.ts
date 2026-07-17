import { SetMetadata } from '@nestjs/common';
import { AuditAction } from 'generated/prisma/enums';

export const AUDIT_KEY = 'audit';

export interface AuditOptions {
  action: AuditAction;
  entity: string;
}

export const Audit = (options: AuditOptions) => SetMetadata(AUDIT_KEY, options);
