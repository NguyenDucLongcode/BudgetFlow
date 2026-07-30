"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { MoreHorizontal, Eye, Ban, Trash2 } from "lucide-react";

import { Button } from "@/src/components";

import type { UserSummary } from "../type";

interface UserRowActionsProps {
  user: UserSummary;

  onSuspend?: (user: UserSummary) => void;

  onDelete?: (user: UserSummary) => void;
}

export function UserRowActions({
  user,
  onSuspend,
  onDelete,
}: UserRowActionsProps) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      {/* size="icon" */}
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <Link
            href={`/admin/users/${user.id}`}
            className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <Eye size={16} />
            View detail
          </Link>

          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-amber-50 hover:text-amber-600"
            onClick={() => {
              setOpen(false);
              onSuspend?.(user);
            }}
          >
            <Ban size={16} />
            Suspend account
          </button>

          <button
            type="button"
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-red-50 hover:text-red-600"
            onClick={() => {
              setOpen(false);
              onDelete?.(user);
            }}
          >
            <Trash2 size={16} />
            Delete account
          </button>
        </div>
      )}
    </div>
  );
}
