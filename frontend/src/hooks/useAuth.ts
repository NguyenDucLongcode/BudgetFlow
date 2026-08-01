import { useProfile } from "@/client/auth/auth.hooks";

export function useAuth() {
  const query = useProfile();

  return {
    user: query.data?.data,
    isAuthenticated: !!query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  };
}
