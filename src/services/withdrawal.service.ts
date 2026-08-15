import http from '@/lib/http';

/**
 * Rút tiền.
 *
 * Gọi `/withdrawals/me` (tự thao tác trên tiền của mình).
 */
export const withdrawalService = {
  /** Người bán gửi lệnh rút. Tiền bị giữ ngay khi lệnh được ghi nhận. */
  create(data: {
    amount: number;
    bank_name: string;
    bank_account: string;
    bank_holder: string;
  }) {
    return http.post('/withdrawals', data);
  },

  /** Lịch sử rút của chính mình. */
  getMine(page = 1, limit = 20) {
    return http.get('/withdrawals/me', { params: { page, limit } });
  },

  /** Danh sách cho admin, lọc theo trạng thái nếu có. */
  adminList(page = 1, limit = 20, status?: string) {
    return http.get('/admin/withdrawals', { params: { page, limit, status } });
  },

  approve(id: number) {
    return http.patch(`/admin/withdrawals/${id}/approve`);
  },

  /** Lý do là bắt buộc ở tầng giao diện: người bán phải biết vì sao bị từ chối. */
  reject(id: number, note: string) {
    return http.patch(`/admin/withdrawals/${id}/reject`, { note });
  },

  /** Xác nhận đã chuyển khoản thật. Đây là lúc tiền rời khỏi hệ thống. */
  complete(id: number) {
    return http.patch(`/admin/withdrawals/${id}/complete`);
  },
};
