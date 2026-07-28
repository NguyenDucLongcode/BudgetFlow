import { authService } from "@/src/server/modules/auth/auth.service";

class RefreshHandler {
  private refreshing: Promise<void> | null = null;

  async refresh() {
    // tránh nhiều request cùng lúc cùng refresh
    if (!this.refreshing) {
      this.refreshing = authService
        .refresh()
        .then(() => {})
        .finally(() => {
          this.refreshing = null;
        });
    }

    return this.refreshing;
  }
}

export const refreshHandler = new RefreshHandler();
