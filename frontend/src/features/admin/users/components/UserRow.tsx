"use client";

import Link from "next/link";
import { Eye } from "lucide-react";
import { Button } from "@/src/components";
import { formatDate, timeAgo } from "@/src/lib/utils";
import { UserRowActions } from "./UserRowActions";
import { User } from "@/src/types";
import { Avatar } from "@/src/components/common/Avatar";
import { Badge } from "@/src/components/ui/Badge/Badge";

interface UserTableRowProps {
  user: User;
}

const ROLE_VARIANT = {
  ADMIN: "info",
  USER: "neutral",
} as const;

const STATUS_VARIANT = {
  ACTIVE: "success",
  PENDING: "warning",
  SUSPENDED: "danger",
} as const;

export function UserTableRow({ user }: UserTableRowProps) {
  return (
    <tr className="transition-colors hover:bg-slate-50">
      {/* User */}
      <td className="px-6 py-4">
        <Link
          href={`/admin/users/${user.id}`}
          className="flex items-center gap-3"
        >
          <Avatar avatarUrl={user.avatar} name={user.name} size={36} />

          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{user.name}</p>

            <p className="truncate text-xs text-slate-500">{user.id}</p>
          </div>
        </Link>
      </td>

      {/* Email */}
      <td className="px-6 py-4">
        <span className="text-sm text-slate-700">{user.email}</span>
      </td>

      {/* Role */}
      <td className="px-6 py-4">
        <Badge variant={ROLE_VARIANT[user.role]}>{user.role}</Badge>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <Badge variant={STATUS_VARIANT[user.status]} dot>
          {user.status}
        </Badge>
      </td>

      {/* Created */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="text-sm text-slate-700">
            {formatDate(user.createdAt)}
          </span>

          <span className="text-xs text-slate-500">
            {timeAgo(user.createdAt)}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex justify-end gap-2">
          <Link href={`/admin/users/${user.id}`}>
            <Button variant="ghost" size="sm" leftIcon={<Eye size={15} />}>
              View
            </Button>
          </Link>

          <UserRowActions user={user} />
        </div>
      </td>
    </tr>
  );
}
