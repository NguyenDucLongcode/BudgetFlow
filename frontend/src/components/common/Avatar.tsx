import { cn, initials } from "../../lib/utils";

interface AvatarProps {
  name: string;
  color?: string;
  size?: number;
  className?: string;
}

export function Avatar({
  name,
  color = "#10b981",
  size = 36,
  className,
}: AvatarProps) {
  return (
    <div
      className={cn("avatar", className)}
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}
