import { browserApiClient } from "@/src/lib/bff";
import type {
  Wallet,
  CreateWalletInput,
  UpdateWalletInput,
  WalletQueryParams,
} from "@/src/types/api";

class WalletService {
  async getWallets(params?: WalletQueryParams): Promise<Wallet[]> {
    const res = await browserApiClient.get<any>("/wallets", params as Record<string, unknown>);
    const rawData = res.data as any;

    // Trích xuất linh hoạt mảng dữ liệu, tránh trường hợp bị lồng object
    if (Array.isArray(rawData)) {
      return rawData;
    }
    if (Array.isArray(rawData?.data)) {
      return rawData.data;
    }
    if (Array.isArray(rawData?.data?.wallets)) {
      return rawData.data.wallets;
    }
    if (Array.isArray(rawData?.wallets)) {
      return rawData.wallets;
    }
    return [];
  }

  async getWallet(id: string): Promise<Wallet> {
    const res = await browserApiClient.get<any>(`/wallets/${id}`);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async createWallet(data: CreateWalletInput): Promise<Wallet> {
    const res = await browserApiClient.post<any>("/wallets", data);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async updateWallet(id: string, data: UpdateWalletInput): Promise<Wallet> {
    // Loại bỏ hoàn toàn trường type nếu có trước khi gửi lên API
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { type: _type, ...cleanData } = data as any;
    const res = await browserApiClient.patch<any>(`/wallets/${id}`, cleanData);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async deleteWallet(id: string): Promise<void> {
    await browserApiClient.delete<void>(`/wallets/${id}`);
  }

  async setDefault(id: string): Promise<Wallet> {
    const res = await browserApiClient.patch<any>(`/wallets/${id}/set-default`);
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async archiveWallet(id: string): Promise<Wallet> {
    const res = await browserApiClient.patch<any>(`/wallets/${id}`, { isArchived: true });
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }

  async unarchiveWallet(id: string): Promise<Wallet> {
    const res = await browserApiClient.patch<any>(`/wallets/${id}`, { isArchived: false });
    const rawData = res.data as any;
    return rawData?.data ?? rawData;
  }
}

export const walletService = new WalletService();
