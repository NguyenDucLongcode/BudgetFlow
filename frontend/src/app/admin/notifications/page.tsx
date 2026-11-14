"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { browserApiClient } from "@/src/lib/bff";
import { Button } from "@/src/components/ui/button";

interface HistoryItem {
  id: string;
  createdAt: string;
  user?: { name: string; email: string } | null;
  metadata: { title?: string; recipientCount?: number; targetRole?: string };
}

interface UserItem { id: string; name: string; email: string }

export default function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetRole, setTargetRole] = useState("ALL");
  const [specificUserId, setSpecificUserId] = useState("");
  const [feedback, setFeedback] = useState("");

  const usersQuery = useQuery({
    queryKey: ["admin", "users", "notification-targets"],
    queryFn: async () => {
      const response = await browserApiClient.get<{ users: UserItem[] }>("/admin/users", { page: "1", limit: "100", role: "USER" });
      return response.data.data.users ?? [];
    },
  });
  const historyQuery = useQuery({
    queryKey: ["admin", "notifications", "history"],
    queryFn: async () => {
      const response = await browserApiClient.get<{ data: HistoryItem[] }>("/admin/notifications/history", { page: "1", limit: "50" });
      return response.data.data.data ?? [];
    },
  });
  const sendMutation = useMutation({
    mutationFn: () => browserApiClient.post("/admin/notifications/broadcast", {
      title, message, type: "SYSTEM", targetRole,
      ...(targetRole === "USER" && specificUserId ? { specificUserId } : {}),
    }),
    onSuccess: async () => {
      setTitle(""); setMessage(""); setSpecificUserId("");
      setFeedback("Đã gửi thông báo thành công.");
      await queryClient.invalidateQueries({ queryKey: ["admin", "notifications", "history"] });
    },
    onError: () => setFeedback("Không thể gửi thông báo. Vui lòng kiểm tra dữ liệu."),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="text-sm text-slate-400">Gửi thông báo hệ thống đến người dùng.</p>
      </div>
      <section className="rounded-xl border border-[#334155] bg-[#1E293B] p-5">
        <div className="grid gap-4">
          <label className="text-sm text-slate-300">Tiêu đề<input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white" /></label>
          <label className="text-sm text-slate-300">Nội dung<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white" /></label>
          <label className="text-sm text-slate-300">Đối tượng<select value={targetRole} onChange={(e) => { setTargetRole(e.target.value); setSpecificUserId(""); }} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"><option value="ALL">Tất cả người dùng</option><option value="USER">User</option></select></label>
          {targetRole === "USER" && <label className="text-sm text-slate-300">User cụ thể (bỏ trống để gửi tất cả User)<select value={specificUserId} onChange={(e) => setSpecificUserId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-white"><option value="">Tất cả User</option>{usersQuery.data?.map((user) => <option key={user.id} value={user.id}>{user.name} ({user.email})</option>)}</select></label>}
          <div className="flex items-center gap-3"><Button onClick={() => sendMutation.mutate()} disabled={!title.trim() || !message.trim() || sendMutation.isPending}>Gửi thông báo</Button>{feedback && <span className="text-sm text-emerald-400">{feedback}</span>}</div>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border border-[#334155] bg-[#1E293B]">
        <div className="border-b border-[#334155] px-5 py-4 font-semibold text-white">Lịch sử gửi</div>
        {historyQuery.data?.map((item) => <div key={item.id} className="flex flex-wrap justify-between gap-3 border-b border-[#334155] px-5 py-4 text-sm last:border-0"><span className="text-white">{item.metadata?.title ?? "Thông báo hệ thống"}</span><span className="text-slate-400">{item.metadata?.recipientCount ?? 0} người nhận · {new Date(item.createdAt).toLocaleString("vi-VN")}</span></div>)}
        {!historyQuery.data?.length && <p className="p-5 text-sm text-slate-400">Chưa có lịch sử gửi.</p>}
      </section>
    </div>
  );
}
