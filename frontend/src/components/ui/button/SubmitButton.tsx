"use client";

import { ArrowRight } from "lucide-react";
import Button from "./Button";

interface SubmitButtonProps {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  isValid?: boolean;
}

export default function SubmitButton({
  children,
  loadingText,
  className,
  disabled,
  isSubmitting,
  isValid = true, // Mặc định là true nếu không truyền
}: SubmitButtonProps) {
  // Disable khi: disabled=true, đang loading, hoặc form không valid
  const isDisabled = disabled || isSubmitting || !isValid;

  return (
    <Button
      type="submit"
      size="lg"
      className={className}
      loading={isSubmitting}
      loadingText={loadingText}
      disabled={isDisabled}
      rightIcon={!isSubmitting ? <ArrowRight size={18} /> : undefined}
    >
      {children}
    </Button>
  );
}
