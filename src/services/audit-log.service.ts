import http from '@/lib/http';
import type { ApiResponse, Paginated } from '@/api';

/**
 * Một dòng nhật ký thao tác admin, khớp entity AdminActionLog ở backend.
 * schema.d.ts của admin chưa sinh lại kiểu này nên khai tay ở đây.
 */
export interface AuditLog {
  id: number;
  admin_id: number;
  method: string;
  path: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  status_code: number | null;
  payload: Record<string, unknown> | null;
  created_at: string;
}

export const auditLogService = {
  /** Mới nhất trước; backend chặn tối đa 100 dòng mỗi trang. */
  getRecent(page = 1, limit = 8) {
    return http.get<ApiResponse<Paginated<AuditLog>>>('/admin/audit-logs', {
      params: { page, limit },
    });
  },
};
