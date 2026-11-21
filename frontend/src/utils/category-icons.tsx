import {
  ShoppingBag,
  HeartPulse,
  Gamepad2,
  Banknote,
  Car,
  Utensils,
  Home,
  GraduationCap,
  Receipt,
  Gift,
  TrendingUp,
  Briefcase,
  PiggyBank,
  Coffee,
  Plane,
  Smartphone,
  Shield,
  Film,
  Music,
  Tag,
  type LucideIcon,
} from "lucide-react";

/**
 * Mapping các tên danh mục (tiếng Việt, tiếng Anh, không dấu) sang Lucide Icon
 */
export const CATEGORY_ICONS_MAP: Record<string, LucideIcon> = {
  // Ăn uống
  "ăn uống": Utensils,
  "an uong": Utensils,
  "food": Utensils,
  "dining": Utensils,
  "nhà hàng": Utensils,
  "cafe": Coffee,
  "cà phê": Coffee,
  "coffee": Coffee,
  "đồ uống": Coffee,

  // Mua sắm
  "mua sắm": ShoppingBag,
  "mua sam": ShoppingBag,
  "shopping": ShoppingBag,
  "quần áo": ShoppingBag,
  "siêu thị": ShoppingBag,

  // Nhà cửa
  "nhà cửa": Home,
  "nha cua": Home,
  "home": Home,
  "tiền nhà": Home,

  // Di chuyển
  "di chuyển": Car,
  "di chuyen": Car,
  "transport": Car,
  "xe": Car,
  "xăng xe": Car,
  "du lịch": Plane,
  "travel": Plane,

  // Giải trí
  "giải trí": Gamepad2,
  "giai tri": Gamepad2,
  "entertainment": Gamepad2,
  "games": Gamepad2,
  "chơi game": Gamepad2,
  "phim": Film,
  "movies": Film,
  "âm nhạc": Music,

  // Sức khỏe
  "sức khỏe": HeartPulse,
  "suc khoe": HeartPulse,
  "health": HeartPulse,
  "y tế": HeartPulse,
  "bệnh viện": HeartPulse,
  "thuốc": HeartPulse,

  // Giáo dục
  "giáo dục": GraduationCap,
  "giao duc": GraduationCap,
  "education": GraduationCap,
  "học tập": GraduationCap,
  "khóa học": GraduationCap,
  "sách": GraduationCap,

  // Hóa đơn
  "hóa đơn": Receipt,
  "hoa don": Receipt,
  "bill": Receipt,
  "bills": Receipt,
  "điện": Receipt,
  "nước": Receipt,
  "internet": Receipt,

  // Thu nhập / Lương
  "lương": Banknote,
  "luong": Banknote,
  "salary": Banknote,
  "income": Banknote,
  "tiền lương": Banknote,

  // Thưởng
  "thưởng": Gift,
  "thuong": Gift,
  "bonus": Gift,
  "quà tặng": Gift,
  "gift": Gift,

  // Đầu tư
  "đầu tư": TrendingUp,
  "dau tu": TrendingUp,
  "investment": TrendingUp,
  "cổ phiếu": TrendingUp,
  "crypto": TrendingUp,

  // Kinh doanh
  "kinh doanh": Briefcase,
  "business": Briefcase,
  "công việc": Briefcase,

  // Tiết kiệm
  "tiết kiệm": PiggyBank,
  "tiet kiem": PiggyBank,
  "savings": PiggyBank,

  // Công nghệ / Thiết bị
  "thiết bị": Smartphone,
  "điện thoại": Smartphone,
  "bảo hiểm": Shield,
};

/**
 * Mapping các Emoji phổ biến từ Seed DB sang Lucide Icon tương ứng
 */
export const EMOJI_TO_ICON_MAP: Record<string, LucideIcon> = {
  "🍔": Utensils,
  "🛍️": ShoppingBag,
  "🏠": Home,
  "🚗": Car,
  "🎬": Film,
  "💪": HeartPulse,
  "📚": GraduationCap,
  "📄": Receipt,
  "📌": Tag,
  "💰": Banknote,
  "🎁": Gift,
  "📈": TrendingUp,
  "💼": Briefcase,
  "☕": Coffee,
  "✈️": Plane,
  "📱": Smartphone,
};

/**
 * Lấy Icon component phù hợp cho danh mục
 */
export function getCategoryIcon(name?: string, iconField?: string): LucideIcon {
  // 1. Kiểm tra emoji trước
  if (iconField && EMOJI_TO_ICON_MAP[iconField]) {
    return EMOJI_TO_ICON_MAP[iconField];
  }

  // 2. Kiểm tra chuỗi iconField nếu khớp từ khóa
  if (iconField) {
    const iconKey = iconField.toLowerCase().trim();
    if (CATEGORY_ICONS_MAP[iconKey]) {
      return CATEGORY_ICONS_MAP[iconKey];
    }
  }

  // 3. Kiểm tra theo tên danh mục
  if (name) {
    const cleanName = name.toLowerCase().trim();
    if (CATEGORY_ICONS_MAP[cleanName]) {
      return CATEGORY_ICONS_MAP[cleanName];
    }

    // So khớp chuỗi con (substring)
    for (const [key, icon] of Object.entries(CATEGORY_ICONS_MAP)) {
      if (cleanName.includes(key)) {
        return icon;
      }
    }
  }

  // 4. Mặc định
  return Tag;
}

/**
 * Component hiển thị Category Icon với style đẹp mắt
 */
export function CategoryIconBadge({
  name,
  icon,
  color,
  isIncome,
  size = "md",
}: {
  name?: string | undefined;
  icon?: string | undefined;
  color?: string | undefined;
  isIncome?: boolean | undefined;
  size?: "sm" | "md" | "lg" | undefined;
}) {
  const IconComponent = getCategoryIcon(name, icon);

  const sizeClasses = {
    sm: "w-8 h-8 rounded-lg",
    md: "w-10 h-10 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
  }[size];

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  const bgStyle = color
    ? `${color}20`
    : isIncome
    ? "rgba(16, 185, 129, 0.15)"
    : "rgba(244, 63, 94, 0.15)";

  const textColor = color || (isIncome ? "#10B981" : "#F43F5E");

  return (
    <div
      className={`${sizeClasses} flex items-center justify-center shrink-0 shadow-sm border border-white/5`}
      style={{
        backgroundColor: bgStyle,
        color: textColor,
      }}
    >
      <IconComponent className={iconSizes} />
    </div>
  );
}
