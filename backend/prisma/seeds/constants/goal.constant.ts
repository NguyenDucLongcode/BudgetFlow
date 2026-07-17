import { GoalPriority, GoalStatus } from 'generated/prisma/enums';

export const GOAL_SEED = {
  goals: [
    {
      name: 'Tiết kiệm du lịch Nhật Bản',
      targetAmount: 30000000,
      priority: GoalPriority.HIGH,
      status: GoalStatus.IN_PROGRESS,
      description: 'Dự kiến du lịch Nhật Bản vào cuối năm',
      notes: 'Cần tiết kiệm 30 triệu cho chuyến đi 7 ngày',
      icon: '✈️',
      color: '#FF6B6B',
    },
    {
      name: 'Mua laptop mới',
      targetAmount: 25000000,
      priority: GoalPriority.MEDIUM,
      status: GoalStatus.IN_PROGRESS,
      description: 'Laptop cho công việc và học tập',
      notes: 'Dự định mua MacBook Pro M4',
      icon: '💻',
      color: '#4ECDC4',
    },
    {
      name: 'Quỹ khẩn cấp',
      targetAmount: 50000000,
      priority: GoalPriority.URGENT,
      status: GoalStatus.IN_PROGRESS,
      description: 'Quỹ dự phòng cho các tình huống khẩn cấp',
      notes: 'Mục tiêu có 50 triệu dự phòng',
      icon: '🛡️',
      color: '#FFD93D',
    },
  ],
} as const;
