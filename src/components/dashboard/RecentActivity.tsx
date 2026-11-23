"use client";

import { useEffect, useState } from 'react';
import { Bell, History, Loader2, Settings, Users, Wallet } from 'lucide-react';
import { auditLogService, type AuditLog } from '@/services/audit-log.service';
import { describeAuditLog, formatRelativeTime } from './describe-audit-log';

const TARGET_ICONS: Record<string, typeof History> = {
  users: Users,
  withdrawals: Wallet,
  wallets: Wallet,
  settings: Settings,
  notifications: Bell,
};

/**
 * Ô "Hoạt động gần đây" ở trang Tổng quan: đọc nhật ký thao tác admin mà
 * backend tự ghi qua AdminAuditInterceptor (/admin/audit-logs).
 */
export function RecentActivity() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    const load = () => {
      auditLogService
        .getRecent(1, 8)
        .then((res) => {
          setLogs(res.data.data.result ?? []);
          setTotal(res.data.data.meta?.total ?? 0);
          setState('ready');
        })
        .catch(() => setState((s) => (s === 'ready' ? s : 'error')));
    };
    load();
    // Trang Tổng quan cũng tự làm mới số liệu mỗi 30 giây, giữ cùng nhịp.
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Hoạt động gần đây</h2>
        {state === 'ready' && total > 0 && (
          <span className="text-xs text-gray-600">{total.toLocaleString('vi-VN')} thao tác đã ghi</span>
        )}
      </div>

      {state === 'loading' && (
        <div className="flex-1 flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-gray-600" />
        </div>
      )}

      {state === 'error' && (
        <p className="flex-1 py-10 text-center text-sm text-gray-600">
          Không tải được nhật ký thao tác. Tải lại trang để thử lại.
        </p>
      )}

      {state === 'ready' && logs.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center py-10 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
          <History className="w-8 h-8 mb-3 text-gray-600" />
          <h3 className="text-gray-800 font-medium mb-1">Chưa có thao tác nào</h3>
          <p className="text-gray-600 text-sm max-w-xs">
            Khi quản trị viên khoá tài khoản, duyệt rút tiền hay đổi cài đặt, thao tác sẽ hiện ở đây.
          </p>
        </div>
      )}

      {state === 'ready' && logs.length > 0 && (
        <ul className="divide-y divide-gray-100">
          {logs.map((log) => {
            const view = describeAuditLog(log);
            const Icon = TARGET_ICONS[log.target_type ?? ''] ?? History;
            return (
              <li key={log.id} className="flex items-start gap-3 py-3">
                <div className="w-9 h-9 shrink-0 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {view.title}
                    {view.failed && <span className="ml-2 text-xs font-normal text-red-600">không thành công</span>}
                  </p>
                  {view.detail && <p className="text-xs text-gray-600 truncate">{view.detail}</p>}
                </div>
                <time dateTime={log.created_at} className="shrink-0 text-xs text-gray-600">
                  {formatRelativeTime(log.created_at)}
                </time>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
