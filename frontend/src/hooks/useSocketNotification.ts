"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { transactionKeys } from "@/src/client/transaction/transactionKeys";

interface TransactionCompletedData {
  amount?: number | string;
  currency?: string;
  description?: string;
  transactionId?: string | number;
}

interface SocketNotification {
  title?: string;
  message?: string;
  type?: string;
  id?: string | number;
}

export function useSocketNotification(userId?: string | null) {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!userId) return;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8080";

    const socket = io(socketUrl, {
      query: { userId },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("[Socket] Connected to server, id:", socket.id);
      socket.emit("join", { userId });
    });

    socket.on("transaction_completed", (data: TransactionCompletedData) => {
      console.log("[Socket] Received transaction_completed:", data);
      const amount = data?.amount
        ? Number(data.amount).toLocaleString("vi-VN")
        : "";
      const currency = data?.currency || "VND";
      const desc = data?.description ? ` "${data.description}"` : "";

      toast.success(
        `Giao dịch dự kiến${desc} (${amount} ${currency}) đã được thực hiện. Số dư ví đã được cập nhật!`,
        {
          autoClose: 6000,
          toastId: `tx-completed-${data?.transactionId || Date.now()}`,
        },
      );

      // Tự động làm mới dữ liệu giao dịch và ví
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: ["wallets"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["budgets"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["statistics"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: false });

      queryClient.refetchQueries({ queryKey: ["budgets"], exact: false });
      queryClient.refetchQueries({ queryKey: ["budget-summary"], exact: false });
    });

    socket.on("notification", (notif: SocketNotification) => {
      console.log("[Socket] Received notification:", notif);
      if (notif?.title) {
        if (notif.type === "BUDGET") {
          toast.warning(`${notif.title}: ${notif.message}`, {
            autoClose: 7000,
            toastId: `budget-alert-${notif.id || Date.now()}`,
          });
        } else {
          toast.info(`${notif.title}: ${notif.message}`, {
            autoClose: 5000,
            toastId: `notif-${notif.id || Date.now()}`,
          });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["notifications"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["budgets"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["budget-summary"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["goals"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["wallets"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["transactions"], exact: false });
      queryClient.invalidateQueries({ queryKey: ["statistics"], exact: false });

      queryClient.refetchQueries({ queryKey: ["budgets"], exact: false });
      queryClient.refetchQueries({ queryKey: ["budget-summary"], exact: false });
      queryClient.refetchQueries({ queryKey: ["goals"], exact: false });
      queryClient.refetchQueries({ queryKey: ["wallets"], exact: false });
      queryClient.refetchQueries({ queryKey: ["transactions"], exact: false });
    });

    socket.on("disconnect", () => {
      console.log("[Socket] Disconnected from server");
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [userId, queryClient]);
}
