"use client";

import { Search } from "lucide-react";

import { Button, TextField } from "@/src/components";
import { Select } from "@/src/components/ui/form/Select";

import { Role, UserStatus } from "@/src/types";

interface UserFiltersProps {
  keyword: string;
  role: Role | "ALL";
  status: UserStatus | "ALL";

  onKeywordChange: (value: string) => void;
  onRoleChange: (value: Role | "ALL") => void;
  onStatusChange: (value: UserStatus | "ALL") => void;
  onReset: () => void;
}

export function UserFilters({
  keyword,
  role,
  status,
  onKeywordChange,
  onRoleChange,
  onStatusChange,
  onReset,
}: UserFiltersProps) {
  return (
    <section className="mb-5 flex flex-wrap items-center gap-3">
      <div className="min-w-65 flex-1">
        <TextField
          placeholder="Search by name, email or ID..."
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          leftIcon={<Search size={16} />}
        />
      </div>

      <Select
        value={role}
        onChange={(value) => onRoleChange(value as Role | "ALL")}
        options={[
          {
            label: "All Roles",
            value: "ALL",
          },
          {
            label: "Admin",
            value: Role.ADMIN,
          },
          {
            label: "User",
            value: Role.USER,
          },
        ]}
        className="w-44"
      />

      <Select
        value={status}
        onChange={(value) => onStatusChange(value as UserStatus | "ALL")}
        options={[
          {
            label: "All Status",
            value: "ALL",
          },
          {
            label: "Active",
            value: UserStatus.ACTIVE,
          },
          {
            label: "Suspended",
            value: UserStatus.SUSPENDED,
          },
          {
            label: "Pending",
            value: UserStatus.PENDING,
          },
        ]}
        className="w-44"
      />

      <Button variant="ghost" onClick={onReset}>
        Reset
      </Button>
    </section>
  );
}
