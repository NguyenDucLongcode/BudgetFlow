import { useQuery } from "@tanstack/react-query";
import { categoryService } from "./category.service";

export function useCategories(type?: "INCOME" | "EXPENSE" | "ALL") {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: () => categoryService.getCategories(type),
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });
}
