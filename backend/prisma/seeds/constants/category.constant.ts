import { CategoryType } from 'generated/prisma/enums';

export const SYSTEM_CATEGORIES = [
  // ===========================
  // Expense
  // ===========================

  {
    name: 'Ăn uống',
    type: CategoryType.EXPENSE,
    icon: '🍔',
    color: '#FF6B6B',
  },

  {
    name: 'Mua sắm',
    type: CategoryType.EXPENSE,
    icon: '🛍️',
    color: '#4ECDC4',
  },

  {
    name: 'Nhà cửa',
    type: CategoryType.EXPENSE,
    icon: '🏠',
    color: '#45B7D1',
  },

  {
    name: 'Di chuyển',
    type: CategoryType.EXPENSE,
    icon: '🚗',
    color: '#96CEB4',
  },

  {
    name: 'Giải trí',
    type: CategoryType.EXPENSE,
    icon: '🎬',
    color: '#FFEAA7',
  },

  {
    name: 'Sức khỏe',
    type: CategoryType.EXPENSE,
    icon: '💪',
    color: '#DDA0DD',
  },

  {
    name: 'Giáo dục',
    type: CategoryType.EXPENSE,
    icon: '📚',
    color: '#98D8C8',
  },

  {
    name: 'Hóa đơn',
    type: CategoryType.EXPENSE,
    icon: '📄',
    color: '#F7DC6F',
  },

  {
    name: 'Khác',
    type: CategoryType.EXPENSE,
    icon: '📌',
    color: '#95A5A6',
  },

  // ===========================
  // Income
  // ===========================

  {
    name: 'Lương',
    type: CategoryType.INCOME,
    icon: '💰',
    color: '#2ECC71',
  },

  {
    name: 'Thưởng',
    type: CategoryType.INCOME,
    icon: '🎁',
    color: '#F1C40F',
  },

  {
    name: 'Đầu tư',
    type: CategoryType.INCOME,
    icon: '📈',
    color: '#3498DB',
  },

  {
    name: 'Kinh doanh',
    type: CategoryType.INCOME,
    icon: '💼',
    color: '#9B59B6',
  },

  {
    name: 'Khác',
    type: CategoryType.INCOME,
    icon: '📌',
    color: '#95A5A6',
  },
] as const;
