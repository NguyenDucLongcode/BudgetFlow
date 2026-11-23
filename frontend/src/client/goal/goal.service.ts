import { browserApiClient } from "@/src/lib/bff";
import type {
  Goal,
  GoalContribution,
  CreateGoalInput,
  UpdateGoalInput,
  ContributeGoalInput,
  GoalQueryParams,
  GoalSummary,
  ApiResponse,
  PaginationResponse,
} from "@/src/types";

export interface PaginatedGoalsResponse {
  goals: Goal[];
  pagination: PaginationResponse;
}

class GoalService {
  async getGoals(
    params?: GoalQueryParams,
  ): Promise<PaginatedGoalsResponse> {
    const res = await browserApiClient.get<ApiResponse<Goal[]> | Goal[]>(
      "/goals",
      params as Record<string, unknown>,
    );
    const rawData = res.data;
    const isWrapped =
      typeof rawData === "object" && rawData !== null && "data" in rawData;
    const data: Goal[] = isWrapped
      ? (rawData as ApiResponse<Goal[]>).data
      : Array.isArray(rawData)
        ? (rawData as Goal[])
        : [];
    const pagination: PaginationResponse =
      isWrapped && (rawData as ApiResponse<Goal[]>).pagination
        ? (rawData as ApiResponse<Goal[]>).pagination!
        : {
            page: Number(params?.page) || 1,
            limit: Number(params?.limit) || 50,
            total: Array.isArray(data) ? data.length : 0,
            totalPages: 1,
          };

    return {
      goals: Array.isArray(data) ? data : [],
      pagination,
    };
  }

  async getGoal(id: string): Promise<Goal> {
    const res = await browserApiClient.get<ApiResponse<Goal> | Goal>(`/goals/${id}`);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<Goal>).data;
    }
    return rawData as Goal;
  }

  async createGoal(data: CreateGoalInput): Promise<Goal> {
    const res = await browserApiClient.post<ApiResponse<Goal> | Goal>("/goals", data);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<Goal>).data;
    }
    return rawData as Goal;
  }

  async updateGoal(id: string, data: UpdateGoalInput): Promise<Goal> {
    const res = await browserApiClient.patch<ApiResponse<Goal> | Goal>(`/goals/${id}`, data);
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<Goal>).data;
    }
    return rawData as Goal;
  }

  async deleteGoal(id: string): Promise<void> {
    await browserApiClient.delete(`/goals/${id}`);
  }

  async contribute(id: string, data: ContributeGoalInput): Promise<GoalContribution> {
    const res = await browserApiClient.post<ApiResponse<GoalContribution> | GoalContribution>(
      `/goals/${id}/contribute`,
      data,
    );
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<GoalContribution>).data;
    }
    return rawData as GoalContribution;
  }

  async getSummary(): Promise<GoalSummary> {
    const res = await browserApiClient.get<ApiResponse<GoalSummary> | GoalSummary>(
      "/goals/summary",
    );
    const rawData = res.data;
    if (typeof rawData === "object" && rawData !== null && "data" in rawData) {
      return (rawData as ApiResponse<GoalSummary>).data;
    }
    return rawData as GoalSummary;
  }
}

export const goalService = new GoalService();
