export const adminUserKeys = {
  all: ["admin", "users"] as const,

  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }) => [...adminUserKeys.all, "list", params] as const,

  detail: (userId: string) => [...adminUserKeys.all, "detail", userId] as const,
};
