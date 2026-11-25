import { CategoryType } from "../enums";

export interface TransactionCategory {
  id: string;
  nameVi?: string;
  nameEn?: string | null;
  name?: string;
  type?: string | undefined;
  icon?: string | undefined;
  color?: string | undefined;
}

export interface Category {
  id: string;
  nameVi: string;
  nameEn: string;
  name?: string;
  type: CategoryType | "INCOME" | "EXPENSE";
  icon?: string | null;
  color?: string | null;
  userId?: string | null;
  parentId?: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  parent?: Category | null;
  children?: Category[];
}

export interface SystemCategoryItem {
  id: string;
  nameVi: string;
  nameEn: string;
  name?: string;
  type: "INCOME" | "EXPENSE";
  icon: string;
  color: string;
  isSystem: boolean;
  createdAt: string;
}

export interface CreateCategoryInput {
  nameVi: string;
  nameEn?: string;
  name?: string;
  type: CategoryType | "INCOME" | "EXPENSE";
  icon?: string;
  color?: string;
  parentId?: string;
  isSystem?: boolean;
}

export interface UpdateCategoryInput {
  nameVi?: string;
  nameEn?: string;
  name?: string;
  type?: CategoryType | "INCOME" | "EXPENSE";
  icon?: string;
  color?: string;
  parentId?: string;
}
