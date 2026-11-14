import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Tất cả public endpoints đều không cần CSRF
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
