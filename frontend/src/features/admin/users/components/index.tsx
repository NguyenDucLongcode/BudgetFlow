"use client";

import Header from "./UserPageHeader";
import { UserStats } from "./UserStats";
import { UserFilters } from "./UserFilters";
import { UserTable } from "./UserTable";
import { UserPagination } from "./UserPagination";

import { Card } from "@/src/components";
import { useAdminUsers } from "../hooks/useAdminUsers";

export default function UserPage() {
  const {
    // data
    users,
    counts,

    // pagination
    keyword,
    role,
    status,

    pagination,

    // state
    setKeyword,
    setRole,
    setStatus,
    setPage,

    reset, // actions

    isLoading, // react-query
  } = useAdminUsers();

  return (
    <div className="space-y-6">
      <Header />

      <UserStats
        counts={
          counts ?? {
            total: 0,
            active: 0,
            suspended: 0,
            admins: 0,
          }
        }
      />

      <Card padding="none">
        <UserFilters
          keyword={keyword}
          role={role}
          status={status}
          onKeywordChange={setKeyword}
          onRoleChange={setRole}
          onStatusChange={setStatus}
          onReset={reset}
        />

        <UserTable users={users} loading={isLoading} />
      </Card>

      <UserPagination
        page={pagination?.page ?? 1}
        totalPages={pagination?.totalPages ?? 1}
        totalItems={pagination?.total ?? 0}
        pageSize={pagination?.limit ?? 10}
        onPageChange={setPage}
      />
    </div>
  );
}
