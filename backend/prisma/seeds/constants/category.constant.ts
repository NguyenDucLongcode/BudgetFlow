import { CategoryType } from 'generated/prisma/enums';

export const SYSTEM_CATEGORIES = [
  // ===========================
  // Expense
  // ===========================

  {
    nameVi: 'Ăn uống',
    nameEn: 'Food & Dining',
    type: CategoryType.EXPENSE,
    icon: '🍔',
    color: '#FF6B6B',
  },

  {
    nameVi: 'Mua sắm',
    nameEn: 'Shopping',
    type: CategoryType.EXPENSE,
    icon: '🛍️',
    color: '#4ECDC4',
  },

  {
    nameVi: 'Nhà cửa',
    nameEn: 'Housing',
    type: CategoryType.EXPENSE,
    icon: '🏠',
    color: '#45B7D1',
  },

  {
    nameVi: 'Di chuyển',
    nameEn: 'Transportation',
    type: CategoryType.EXPENSE,
    icon: '🚗',
    color: '#96CEB4',
  },

  {
    nameVi: 'Giải trí',
    nameEn: 'Entertainment',
    type: CategoryType.EXPENSE,
    icon: '🎬',
    color: '#FFEAA7',
  },

  {
    nameVi: 'Sức khỏe',
    nameEn: 'Healthcare',
    type: CategoryType.EXPENSE,
    icon: '💪',
    color: '#DDA0DD',
  },

  {
    nameVi: 'Giáo dục',
    nameEn: 'Education',
    type: CategoryType.EXPENSE,
    icon: '📚',
    color: '#98D8C8',
  },

  {
    nameVi: 'Hóa đơn',
    nameEn: 'Bills & Utilities',
    type: CategoryType.EXPENSE,
    icon: '📄',
    color: '#F7DC6F',
  },

  {
    nameVi: 'Khác',
    nameEn: 'Other',
    type: CategoryType.EXPENSE,
    icon: '📌',
    color: '#95A5A6',
  },

  // ===========================
  // Income
  // ===========================

  {
    nameVi: 'Lương',
    nameEn: 'Salary',
    type: CategoryType.INCOME,
    icon: '💰',
    color: '#2ECC71',
  },

  {
    nameVi: 'Thưởng',
    nameEn: 'Bonus',
    type: CategoryType.INCOME,
    icon: '🎁',
    color: '#F1C40F',
  },

  {
    nameVi: 'Đầu tư',
    nameEn: 'Investment',
    type: CategoryType.INCOME,
    icon: '📈',
    color: '#3498DB',
  },

  {
    nameVi: 'Kinh doanh',
    nameEn: 'Business',
    type: CategoryType.INCOME,
    icon: '💼',
    color: '#9B59B6',
  },

  {
    nameVi: 'Khác',
    nameEn: 'Other',
    type: CategoryType.INCOME,
    icon: '📌',
    color: '#95A5A6',
  },
] as const;
