"use client";

import { UserX } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
        <UserX size={24} />
      </div>

      <h3 className="text-lg font-semibold">No users found</h3>

      <p className="mt-2 text-sm text-slate-500">
        Try changing your search or filters.
      </p>
    </div>
  );
}
