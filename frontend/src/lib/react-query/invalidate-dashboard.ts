import type { QueryClient } from "@tanstack/react-query";

const DASHBOARD_QUERY_KEYS = [
  ["dashboard-summary"],
  ["wallets"],
  ["transactions"],
  ["budgets"],
  ["budget-summary"],
  ["goals"],
  ["debts"],
  ["reports"],
  ["statistics"],
] as const;

export async function invalidateDashboardQueries(queryClient: QueryClient) {
  await Promise.all(
    DASHBOARD_QUERY_KEYS.map((queryKey) =>
      queryClient.invalidateQueries({ queryKey: [...queryKey], exact: false })
    )
  );
}
