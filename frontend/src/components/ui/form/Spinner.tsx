import { cn } from "@/src/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "size-4 border-2",
  md: "size-5 border-2",
  lg: "size-6 border-[3px]",
};

export default function Spinner({ size = "md", className }: SpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block animate-spin rounded-full border-current border-t-transparent",
        sizes[size],
        className,
      )}
    />
  );
}
