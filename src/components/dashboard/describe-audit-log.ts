import type { AuditLog } from '@/services/audit-log.service';

/**
 * Đổi một dòng nhật ký thô (method + action do backend tự đặt từ đường dẫn)
 * thành câu người đọc hiểu được trên trang Tổng quan.
 *
 * Tên action lấy từ đường dẫn bỏ id, ví dụ `admin.users.toggle-lock`, nên
 * bảng dưới đây khớp theo tên đó. Route nào chưa có trong bảng vẫn hiện được
 * nhờ câu dự phòng ở cuối, không bao giờ để trống.
 */
const ACTION_LABELS: Record<string, string> = {
  'admin.users.toggle-lock': 'Khoá hoặc mở tài khoản',
  'admin.users.lock': 'Khoá tài khoản',
  'admin.users.unlock': 'Mở khoá tài khoản',
  'admin.users.role': 'Đổi vai trò người dùng',
  'admin.withdrawals.approve': 'Duyệt lệnh rút tiền',
  'admin.withdrawals.reject': 'Từ chối lệnh rút tiền',
  'admin.withdrawals.complete': 'Xác nhận đã chuyển khoản lệnh rút',
  'wallets.topup': 'Nạp tiền vào ví',
  settings: 'Cập nhật cài đặt hệ thống',
  notifications: 'Gửi thông báo',
};

const TARGET_NAMES: Record<string, string> = {
  users: 'người dùng',
  withdrawals: 'lệnh rút tiền',
  settings: 'cài đặt',
  wallets: 'ví',
  products: 'tin đăng',
  categories: 'danh mục',
  orders: 'đơn hàng',
  notifications: 'thông báo',
};

const METHOD_VERBS: Record<string, string> = {
  POST: 'Tạo',
  PATCH: 'Cập nhật',
  PUT: 'Cập nhật',
  DELETE: 'Xoá',
};

const ROLE_NAMES: Record<string, string> = {
  admin: 'quản trị viên',
  seller: 'người bán',
  buyer: 'người mua',
};

export interface AuditLogView {
  title: string;
  detail: string | null;
  failed: boolean;
}

export function describeAuditLog(log: AuditLog): AuditLogView {
  const method = log.method.toUpperCase();
  const targetName = TARGET_NAMES[log.target_type ?? ''] ?? log.target_type ?? 'dữ liệu';
  const payload = log.payload ?? {};

  let title = ACTION_LABELS[log.action];
  if (!title && log.action === 'users' && method === 'POST') title = 'Tạo tài khoản';
  if (!title && log.action === 'admin.users') {
    title = method === 'DELETE' ? 'Xoá người dùng' : 'Sửa thông tin người dùng';
  }
  // Câu dự phòng: động từ theo method + tên đối tượng.
  if (!title) title = `${METHOD_VERBS[method] ?? method} ${targetName}`;

  const parts: string[] = [];
  if (log.target_id) parts.push(`#${log.target_id}`);
  if (typeof payload.email === 'string') parts.push(payload.email);
  if (typeof payload.role === 'string') {
    const role = ROLE_NAMES[payload.role] ?? payload.role;
    // Đổi vai trò thì nói "thành X"; tạo tài khoản thì vai trò chỉ là thông tin kèm.
    parts.push(log.action === 'admin.users.role' ? `thành ${role}` : `vai trò ${role}`);
  }

  return {
    title,
    detail: parts.length ? parts.join(' · ') : null,
    failed: (log.status_code ?? 200) >= 400,
  };
}

/** "5 phút trước", "3 giờ trước", quá 7 ngày thì hiện ngày tháng. */
export function formatRelativeTime(iso: string, now = Date.now()): string {
  const diff = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days <= 7) return `${days} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}
