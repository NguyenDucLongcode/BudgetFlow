export const walletKeys = {
  all: ["wallets"] as const,
  lists: () => [...walletKeys.all, "list"] as const,
  list: (params?: Record<string, any>) => [...walletKeys.lists(), params] as const,
  details: () => [...walletKeys.all, "detail"] as const,
  detail: (id: string) => [...walletKeys.details(), id] as const,
};
