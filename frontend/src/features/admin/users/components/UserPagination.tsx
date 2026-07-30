"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/src/components";

interface UserPaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;

  onPageChange: (page: number) => void;
}

export function UserPagination({
  page,
  totalPages,
  totalItems: total,
  pageSize,
  onPageChange,
}: UserPaginationProps) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;

  const end = Math.min(page * pageSize, total);

  return (
    <div className="mt-5 flex items-center justify-between border-t pt-5">
      <p className="text-sm text-slate-500">
        Showing <strong>{start}</strong> - <strong>{end}</strong> of{" "}
        <strong>{total}</strong>
      </p>

      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={page === 1}
          leftIcon={<ChevronLeft size={16} />}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          disabled={page === totalPages}
          rightIcon={<ChevronRight size={16} />}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
