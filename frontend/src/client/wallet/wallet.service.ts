import { browserApiClient } from "@/src/lib/bff";
import type {
  Wallet,
  CreateWalletInput,
  UpdateWalletInput,
  WalletQueryParams,
  ApiResponse,
} from "@/src/types";

interface WalletListWrapper {
  wallets?: Wallet[];
}

class WalletService {
  async getWallets(params?: WalletQueryParams): Promise<Wallet[]> {
    const res = await browserApiClient.get<ApiResponse<Wallet[]> | Wallet[] | WalletListWrapper>(
      "/wallets",
      params as Record<string, unknown>,
    );
    const rawData = res.data;

    // Trích xuất linh hoạt mảng dữ liệu, tránh trường hợp bị lồng object
    if (Array.isArray(rawData)) {
      return rawData;
    }
    if (typeof rawData === "object" && rawData !== null) {
      if ("data" in rawData) {
        const inner = (rawData as ApiResponse<Wallet[] | WalletListWrapper>).data;
        if (Array.isArray(inner)) {
          return inner;
        }
        if (typeof inner === "object" && inner !== null && "wallets" in inner && Array.isArray((inner as WalletListWrapper).wallets)) {
          return (inner as WalletListWrapper).wallets!;
        }
      }
      if ("wallets" in rawData && Array.isArray((rawData as WalletListWrapper).wallets)) {
        return (rawData as WalletListWrapper).wallets!;
      }
    }
    return [];
  }

  async getWallet(id: string): Promise<Wallet> {
    const res = await browserApiClient.get<ApiResponse<Wallet> | Wallet>(`/wallets/${id}`);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Wallet>).data
      : (rawData as Wallet);
  }

  async createWallet(data: CreateWalletInput): Promise<Wallet> {
    const res = await browserApiClient.post<ApiResponse<Wallet> | Wallet>("/wallets", data);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Wallet>).data
      : (rawData as Wallet);
  }

  async updateWallet(id: string, data: UpdateWalletInput): Promise<Wallet> {
    // Loại bỏ hoàn toàn trường type nếu có trước khi gửi lên API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type: _type, ...cleanData } = data as UpdateWalletInput & { type?: unknown };
    const res = await browserApiClient.patch<ApiResponse<Wallet> | Wallet>(`/wallets/${id}`, cleanData);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Wallet>).data
      : (rawData as Wallet);
  }

  async deleteWallet(id: string): Promise<void> {
    await browserApiClient.delete<ApiResponse<null>>(`/wallets/${id}`);
  }

  async setDefault(id: string): Promise<Wallet> {
    const res = await browserApiClient.patch<ApiResponse<Wallet> | Wallet>(`/wallets/${id}/set-default`);
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Wallet>).data
      : (rawData as Wallet);
  }

  async archiveWallet(id: string): Promise<Wallet> {
    const res = await browserApiClient.patch<ApiResponse<Wallet> | Wallet>(`/wallets/${id}`, { isArchived: true });
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Wallet>).data
      : (rawData as Wallet);
  }

  async unarchiveWallet(id: string): Promise<Wallet> {
    const res = await browserApiClient.patch<ApiResponse<Wallet> | Wallet>(`/wallets/${id}`, { isArchived: false });
    const rawData = res.data;
    return typeof rawData === "object" && rawData !== null && "data" in rawData
      ? (rawData as ApiResponse<Wallet>).data
      : (rawData as Wallet);
  }
}

export const walletService = new WalletService();
