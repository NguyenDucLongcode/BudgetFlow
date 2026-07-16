export const CATEGORY = {
  // Số lượng category tối đa cho mỗi user (không tính system)
  MAX_CATEGORIES: 50,

  // Các category hệ thống mặc định
  SYSTEM_CATEGORIES: {
    EXPENSE: [
      { name: 'Ăn uống', icon: '🍔', color: '#FF6B6B' },
      { name: 'Mua sắm', icon: '🛍️', color: '#4ECDC4' },
      { name: 'Nhà cửa', icon: '🏠', color: '#45B7D1' },
      { name: 'Di chuyển', icon: '🚗', color: '#96CEB4' },
      { name: 'Giải trí', icon: '🎬', color: '#FFEAA7' },
      { name: 'Sức khỏe', icon: '💪', color: '#DDA0DD' },
      { name: 'Giáo dục', icon: '📚', color: '#98D8C8' },
      { name: 'Hóa đơn', icon: '📄', color: '#F7DC6F' },
      { name: 'Khác', icon: '📌', color: '#95A5A6' },
    ],
    INCOME: [
      { name: 'Lương', icon: '💰', color: '#2ECC71' },
      { name: 'Thưởng', icon: '🎁', color: '#F1C40F' },
      { name: 'Đầu tư', icon: '📈', color: '#3498DB' },
      { name: 'Kinh doanh', icon: '💼', color: '#9B59B6' },
      { name: 'Khác', icon: '📌', color: '#95A5A6' },
    ],
  },
} as const;
