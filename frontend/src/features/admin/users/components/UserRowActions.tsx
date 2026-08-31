"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import {
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle,
  Mail,
  Trash2,
} from "lucide-react";

import { Button } from "@/src/components";

import type { UserSummary } from "../type";
import { Role, UserStatus } from "@/src/types";

interface UserRowActionsProps {
  user: UserSummary;

  onSuspend?: (user: UserSummary) => void;
  onEnable?: (user: UserSummary) => void;
  onResendVerification?: (user: UserSummary) => void;
  onDelete?: (user: UserSummary) => void;
}

export function UserRowActions({
  user,
  onSuspend,
  onEnable,
  onResendVerification,
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

  const handleSuspend = () => {
    setOpen(false);
    onSuspend?.(user);
  };

  const handleEnable = () => {
    setOpen(false);
    onEnable?.(user);
  };

  const handleResendVerification = () => {
    setOpen(false);
    onResendVerification?.(user);
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete?.(user);
  };

  const isAdmin = user.role === Role.ADMIN;

  return (
    <div ref={ref} className="relative">
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
        <MoreHorizontal size={16} />
      </Button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          {/* View */}
          <Link
            href={`/admin/users/${user.id}`}
            className="flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-slate-50"
            onClick={() => setOpen(false)}
          >
            <Eye size={16} />
            View detail
          </Link>

          {/* ACTIVE */}
          {!isAdmin && user.status === UserStatus.ACTIVE && (
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-amber-50 hover:text-amber-600"
              onClick={handleSuspend}
            >
              <Ban size={16} />
              Suspend account
            </button>
          )}

          {/* SUSPENDED */}
          {!isAdmin && user.status === UserStatus.SUSPENDED && (
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-green-50 hover:text-green-600"
              onClick={handleEnable}
            >
              <CheckCircle size={16} />
              Enable account
            </button>
          )}

          {/* PENDING */}
          {!isAdmin && user.status === UserStatus.PENDING && (
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-blue-50 hover:text-blue-600"
              onClick={handleResendVerification}
            >
              <Mail size={16} />
              Resend verification
            </button>
          )}

          {/* Delete */}
          {!isAdmin && (
            <button
              type="button"
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors hover:bg-red-50 hover:text-red-600"
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              Delete account
            </button>
          )}
        </div>
      )}
    </div>
  );
}
