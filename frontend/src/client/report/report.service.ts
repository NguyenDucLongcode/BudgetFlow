import { browserApiClient } from "@/src/lib/bff";
import type { MonthlyReportResponse } from "@/src/types/api";

class ReportService {
  async getMonthlyReport(year: number, month: number): Promise<MonthlyReportResponse> {
    const res = await browserApiClient.get<MonthlyReportResponse>(
      "/reports/monthly",
      {
        params: { year, month },
      }
    );
    return res.data.data;
  }
}

export const reportService = new ReportService();
