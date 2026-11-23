"use client";

import { flexRender } from "@tanstack/react-table";
import type {
  LegacyRow as Row,
  LegacyCell as Cell,
} from "@tanstack/react-table/legacy";
import type { AdminUserItem } from "../types";

interface UserRowProps {
  row: Row<AdminUserItem>;
}

export function UserRow({ row }: UserRowProps) {
  return (
    <tr
      key={row.id}
      className="border-b border-[#334155]/60 hover:bg-[#1E293B]/50 transition-colors"
    >
      {row.getVisibleCells().map((cell: Cell<AdminUserItem, unknown>) => (
        <td key={cell.id} className="px-4 py-3.5 text-xs text-slate-200">
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}
