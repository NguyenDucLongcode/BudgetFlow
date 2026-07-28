"use client";

import { cn } from "@/src/lib/utils"; // Nếu bạn có utils, hoặc tự tạo

interface BrandProps {
  // Cấu hình cơ bản
  name?: string;
  subtitle?: string;
  logo?: React.ReactNode;
  initial?: string;

  // Hiển thị
  showLogo?: boolean;
  showName?: boolean;
  showSubtitle?: boolean;

  // Kích thước
  size?: "sm" | "md" | "lg" | "xl";

  // Hình dạng logo
  logoShape?: "square" | "rounded" | "circle";

  // Màu sắc
  logoGradientFrom?: string;
  logoGradientTo?: string;
  nameColor?: string;
  subtitleColor?: string;

  // Layout
  direction?: "row" | "column";
  align?: "start" | "center" | "end";
  gap?: number;
  className?: string;

  // Sự kiện
  onClick?: () => void;
}

const sizeConfig = {
  sm: {
    logo: "w-8 h-8",
    logoText: "text-sm",
    name: "text-sm",
    subtitle: "text-xs",
    gap: "gap-2",
  },
  md: {
    logo: "w-10 h-10",
    logoText: "text-base",
    name: "text-base",
    subtitle: "text-xs",
    gap: "gap-3",
  },
  lg: {
    logo: "w-12 h-12",
    logoText: "text-xl",
    name: "text-xl",
    subtitle: "text-sm",
    gap: "gap-3",
  },
  xl: {
    logo: "w-16 h-16",
    logoText: "text-2xl",
    name: "text-2xl",
    subtitle: "text-base",
    gap: "gap-4",
  },
};

const shapeConfig = {
  square: "rounded-none",
  rounded: "rounded-xl",
  circle: "rounded-full",
};

export default function BrandLogo({
  name = "BudgetFlow",
  subtitle = "Personal Finance",
  logo,
  initial = "B",
  showLogo = true,
  showName = true,
  showSubtitle = true,
  size = "lg",
  logoShape = "rounded",
  logoGradientFrom = "from-indigo-600",
  logoGradientTo = "to-indigo-700",
  nameColor = "text-gray-900 dark:text-white",
  subtitleColor = "text-gray-500 dark:text-gray-400",
  direction = "row",
  align = "center",
  gap,
  className = "",
  onClick,
}: BrandProps) {
  const sizeStyles = sizeConfig[size];
  const shapeStyles = shapeConfig[logoShape];

  const containerClasses = cn(
    "flex",
    direction === "row" ? "flex-row" : "flex-col",
    `items-${align}`,
    gap ? `gap-${gap}` : sizeStyles.gap,
    className,
  );

  const logoContainerClasses = cn(
    sizeStyles.logo,
    shapeStyles,
    "bg-gradient-to-br",
    logoGradientFrom,
    logoGradientTo,
    "flex items-center justify-center",
    "shadow-lg shadow-indigo-500/30",
    "flex-shrink-0",
  );

  const logoTextClasses = cn("text-white font-bold", sizeStyles.logoText);

  const nameClasses = cn("font-bold", nameColor, sizeStyles.name);

  const subtitleClasses = cn(subtitleColor, sizeStyles.subtitle);

  const content = (
    <>
      {/* Logo */}
      {showLogo && (
        <div className={logoContainerClasses}>
          {logo || <span className={logoTextClasses}>{initial}</span>}
        </div>
      )}

      {/* Text */}
      <div className="flex flex-col">
        {showName && <h1 className={nameClasses}>{name}</h1>}
        {showSubtitle && <p className={subtitleClasses}>{subtitle}</p>}
      </div>
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={containerClasses}>
        {content}
      </button>
    );
  }

  return <div className={containerClasses}>{content}</div>;
}
