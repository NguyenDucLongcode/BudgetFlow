import { Button } from "@/src/components";
import { Download, UsersIcon } from "lucide-react";

export default function Header() {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
      <div>
        <h2 className="text-[22px] font-bold tracking-tight">
          User Management
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Search, filter, and manage all platform accounts.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <Button variant="outline" size="md" leftIcon={<Download size={16} />}>
          Export CSV
        </Button>

        <Button variant="primary" size="md" leftIcon={<UsersIcon size={16} />}>
          Add User
        </Button>
      </div>
    </div>
  );
}
