import { Role } from "../enums";
import { User } from "../user";
import { PaginationResponse } from "./api.types";

export type UserCounts = {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  admins: number;
};

export type AdminPaginationUsersDto = {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  status?: string;
};

export interface AdminPaginatedResponse {
  users: User[];
  pagination: PaginationResponse;
  counts: UserCounts;
}
