import { cn } from "@/src/lib/utils/cn";

interface DividerProps {
  text?: React.ReactNode;
  className?: string;
  lineClassName?: string;
  textClassName?: string;
}

export default function Divider({
  text,
  className,
  lineClassName,
  textClassName,
}: DividerProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="absolute inset-0 flex items-center">
        <div
          className={cn(
            "w-full border-t border-slate-200 dark:border-slate-700",
            lineClassName,
          )}
        />
      </div>

      {text && (
        <div className="relative flex justify-center">
          <span
            className={cn(
              "bg-white px-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400",
              textClassName,
            )}
          >
            {text}
          </span>
        </div>
      )}
    </div>
  );
}
