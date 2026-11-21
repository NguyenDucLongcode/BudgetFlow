"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  X,
  Wallet as WalletIcon,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Pencil,
  Trash2,
  Hash,
  Paperclip,
  Bookmark,
  ExternalLink,
} from "lucide-react";
import { CategoryIconBadge } from "@/src/utils/category-icons";
import { TransactionType, TransactionStatus } from "@/src/types/enums";
import type { Transaction } from "@/src/types/api";

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  onClose: () => void;
  onEdit: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  locale?: string;
}

export function TransactionDetailModal({
  transaction,
  onClose,
  onEdit,
  onDelete,
  locale = "vi",
}: TransactionDetailModalProps) {
  if (!transaction) return null;

  const isIncome = transaction.type === TransactionType.INCOME;
  const isPending = transaction.status === TransactionStatus.PENDING;
  const amt = Number(transaction.amount);
  const cat = transaction.category;
  const isVi = locale === "vi";

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      return format(new Date(dateStr), "HH:mm - dd/MM/yyyy", ...(isVi ? [{ locale: vi }] : []));
    } catch {
      return dateStr;
    }
  };

  // Trích xuất tags từ transaction hoặc metadata
  const tags: Array<{ id?: string; name: string }> =
    (transaction.tags && transaction.tags.length > 0)
      ? transaction.tags
      : Array.isArray((transaction.metadata as any)?.tags)
      ? (transaction.metadata as any).tags.map((t: any) =>
          typeof t === "string" ? { name: t } : t
        )
      : [];

  // Trích xuất attachments từ transaction hoặc metadata
  const attachments: Array<{ id?: string; fileName?: string; fileUrl?: string; name?: string; url?: string }> =
    (transaction.attachments && transaction.attachments.length > 0)
      ? transaction.attachments
      : Array.isArray((transaction.metadata as any)?.attachments)
      ? (transaction.metadata as any).attachments
      : [];

  const handleDelete = () => {
    if (onDelete && transaction) {
      const id = transaction.id;
      onClose();
      onDelete(id);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl rounded-3xl border border-slate-700 bg-[#0F172A] shadow-2xl overflow-hidden z-10 animate-in fade-in-0 zoom-in-95 duration-200 my-4">
        {/* Top Accent Gradient Bar */}
        <div
          className={`h-2 w-full ${
            isIncome
              ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500"
              : "bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500"
          }`}
        />

        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-20 cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Hero */}
        <div className="px-6 sm:px-8 pt-7 pb-6 border-b border-slate-800 bg-slate-900/60">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <CategoryIconBadge
                name={cat?.name}
                icon={cat?.icon}
                color={cat?.color}
                isIncome={isIncome}
                size="lg"
              />
              <div>
                <span
                  className={`inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-1 ${
                    isIncome
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  {isIncome ? "Khoản thu nhập" : "Khoản chi tiêu"}
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  {cat?.name || (isIncome ? "Thu nhập" : "Chi tiêu")}
                </h2>
              </div>
            </div>

            {/* Số tiền lớn rõ ràng */}
            <div className="text-left sm:text-right">
              <div
                className={`text-3xl sm:text-4xl font-black tracking-tight ${
                  isIncome ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isIncome ? "+" : "-"}
                {amt.toLocaleString("en-US")}
                <span className="text-lg font-bold ml-1.5 opacity-80 text-slate-300">
                  {transaction.currency}
                </span>
              </div>
            </div>
          </div>

          {/* Status Banner */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-medium">Trạng thái:</span>
              {isPending ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Clock className="w-3.5 h-3.5" />
                  Giao dịch dự kiến (Chưa trừ/cộng số dư ví)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Đã hoàn thành (Số dư ví đã cập nhật)
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>{formatDate(transaction.date)}</span>
            </div>
          </div>
        </div>

        {/* Modal Body - 2 Columns Grid */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Card 1: Thông tin Ví & Danh mục */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <WalletIcon className="w-4 h-4 text-sky-400" />
                Tài khoản & Danh mục
              </h3>

              <div className="space-y-2.5">
                <div>
                  <span className="text-xs text-slate-500 block">Ví thực hiện</span>
                  <span className="text-base font-semibold text-slate-100 flex items-center gap-2 mt-0.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    {transaction.wallet?.name || "—"}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Danh mục</span>
                  <span className="text-base font-semibold text-slate-100 flex items-center gap-2 mt-0.5">
                    {cat?.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                    {cat?.name || "Chưa phân loại"}
                  </span>
                </div>

                {transaction.reference && (
                  <div>
                    <span className="text-xs text-slate-500 block">Mã tham chiếu (Ref)</span>
                    <span className="text-sm font-mono font-medium text-indigo-300 mt-0.5 block bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60">
                      {transaction.reference}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: Nội dung & Mô tả */}
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" />
                Mô tả & Ghi chú
              </h3>

              <div className="space-y-2.5">
                <div>
                  <span className="text-xs text-slate-500 block">Tiêu đề / Mô tả</span>
                  <p className="text-base font-semibold text-slate-100 mt-0.5">
                    {transaction.description || <span className="text-slate-500 italic">Không có mô tả</span>}
                  </p>
                </div>

                <div>
                  <span className="text-xs text-slate-500 block">Ghi chú chi tiết</span>
                  <p className="text-sm text-slate-300 mt-0.5 whitespace-pre-wrap">
                    {transaction.note || <span className="text-slate-500 italic">Không có ghi chú thêm</span>}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tags (nếu có) */}
          {tags.length > 0 && (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-purple-400" />
                Thẻ (Tags)
              </h3>
              <div className="flex flex-wrap gap-2 pt-1">
                {tags.map((tag, idx) => (
                  <span
                    key={tag.id || idx}
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30"
                  >
                    <Hash className="w-3 h-3 text-purple-400" />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File đính kèm (nếu có) */}
          {attachments.length > 0 && (
            <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                Tệp đính kèm ({attachments.length})
              </h3>
              <div className="divide-y divide-slate-800 max-h-36 overflow-y-auto">
                {attachments.map((att, idx) => {
                  const fileName = att.fileName || att.name || `Tệp đính kèm #${idx + 1}`;
                  const fileUrl = att.fileUrl || att.url;
                  return (
                    <div
                      key={att.id || idx}
                      className="py-2 flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="text-slate-200 font-medium truncate">{fileName}</span>
                      {fileUrl && (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                        >
                          <span>Mở</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Audit Timestamps */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800 text-xs text-slate-500">
            <div>
              <span>Ngày tạo: </span>
              <span className="text-slate-400 font-medium">{formatDate(transaction.createdAt)}</span>
            </div>
            <div>
              <span>Cập nhật lần cuối: </span>
              <span className="text-slate-400 font-medium">{formatDate(transaction.updatedAt)}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer (Đóng / Chỉnh sửa / Xóa) */}
        <div className="px-6 sm:px-8 py-5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          {/* Nút Xóa */}
          {onDelete ? (
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 border border-rose-500/30 transition-all cursor-pointer shadow-sm"
            >
              <Trash2 className="w-4 h-4" />
              <span>Xóa giao dịch</span>
            </button>
          ) : (
            <div />
          )}

          {/* Nút Đóng & Chỉnh sửa */}
          <div className="flex items-center gap-3 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700/60"
            >
              Đóng
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                onEdit(transaction);
              }}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              <Pencil className="w-4 h-4" />
              <span>Chỉnh sửa</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
