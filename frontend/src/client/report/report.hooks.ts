import { useQuery } from "@tanstack/react-query";
import { reportService } from "./report.service";

export const reportKeys = {
  all: ["reports"] as const,
  monthly: (year: number, month: number) =>
    [...reportKeys.all, "monthly", year, month] as const,
};

export function useMonthlyReport(year: number, month: number) {
  return useQuery({
    queryKey: reportKeys.monthly(year, month),
    queryFn: () => reportService.getMonthlyReport(year, month),
    staleTime: 60 * 1000,
  });
}
