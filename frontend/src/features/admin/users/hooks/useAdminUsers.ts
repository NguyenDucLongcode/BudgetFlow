"use client";

import { useMemo, useState } from "react";

import { Role, UserStatus } from "@/src/types";
import { useUsers } from "@/src/client/admin/admin-user.hooks";

export function useAdminUsers() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [keyword, setKeyword] = useState("");
  const [role, setRole] = useState<Role | "ALL">("ALL");
  const [status, setStatus] = useState<UserStatus | "ALL">("ALL");

  const query = useMemo(
    () => ({
      page,
      limit,
      ...(keyword && { search: keyword }),
      ...(role !== "ALL" && { role }),
      ...(status !== "ALL" && { status }),
    }),
    [page, limit, keyword, role, status],
  );

  const { data, isLoading, isFetching, isError, error, refetch } =
    useUsers(query);

  const reset = () => {
    setKeyword("");
    setRole("ALL");
    setStatus("ALL");
    setPage(1);
  };

  return {
    // react-query
    isLoading,
    isFetching,
    isError,
    error,
    refetch,

    // data
    users: data?.data.users ?? [],
    counts: data?.data.counts,
    pagination: data?.data.pagination,

    // state
    page,
    limit,
    keyword,
    role,
    status,

    // actions
    setPage,

    setKeyword(value: string) {
      setKeyword(value);
      setPage(1);
    },

    setRole(value: Role | "ALL") {
      setRole(value);
      setPage(1);
    },

    setStatus(value: UserStatus | "ALL") {
      setStatus(value);
      setPage(1);
    },

    reset,
  };
}
