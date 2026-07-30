"use client";

import { StatCard } from "@/src/components";
import { UserCounts } from "../type";
import { STATS } from "../constant";

interface UserStatsProps {
  counts: UserCounts;
}

export function UserStats({ counts }: UserStatsProps) {
  return (
    <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((item) => (
        <StatCard
          key={item.key}
          title={item.title}
          value={counts[item.key]}
          icon={item.icon}
          color={item.color}
        />
      ))}
    </section>
  );
}
