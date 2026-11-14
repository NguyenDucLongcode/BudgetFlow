import { useProfile } from "@/src/client/auth/auth.hooks";
import { Role } from "@/src/types/enums";
import { UserProfile } from "@/src/types/api";

export function useAuth() {
  const query = useProfile();
  const user = (query.data?.data as UserProfile) || null;

  return {
    user,
    isAuthenticated: !!user,
    role: (user?.role as Role) || null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
