"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { settingService, SETTING_KEYS } from '@/services/setting.service';
import { Mail, Phone, MapPin, Facebook, MessageCircle, Loader2, CheckCircle2, AlertCircle, Server, User, Key, AtSign, Hash, AlertTriangle, CreditCard, Lock } from 'lucide-react';

/**
 * Trang cài đặt hệ thống.
 * Sidebar + header đã được layout chung (layout.tsx) cung cấp qua AdminNav,
 * nên ở đây chỉ cần render phần nội dung.
 */

/** Kiểu dữ liệu một hàng setting trả về từ backend. */
interface SettingRow {
  key: string;
  value: string;
}

/** Chuyển mảng { key, value } từ backend thành object dễ dùng. */
function toMap(rows: SettingRow[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

/** CSS class chung cho input field. */
const INPUT_CLS =
  'w-full px-4 py-2.5 border border-ink/15 rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none bg-surface-card text-ink transition-colors';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

  /* ─── State chung cho settings ─── */
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  /* ─── State riêng cho form liên hệ ─── */
  const [contactForm, setContactForm] = useState({
    [SETTING_KEYS.contactEmail]: '',
    [SETTING_KEYS.contactPhone]: '',
    [SETTING_KEYS.contactAddress]: '',
    [SETTING_KEYS.contactFacebook]: '',
    [SETTING_KEYS.contactZalo]: '',
  });
  const [contactSaving, setContactSaving] = useState(false);
  const [contactMsg, setContactMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ─── State riêng cho form SMTP ─── */
  const [smtpForm, setSmtpForm] = useState({
    [SETTING_KEYS.smtpHost]: '',
    [SETTING_KEYS.smtpPort]: '',
    [SETTING_KEYS.smtpUser]: '',
    [SETTING_KEYS.smtpPass]: '',
    [SETTING_KEYS.smtpFromName]: '',
    [SETTING_KEYS.smtpFromEmail]: '',
  });
  const [smtpSaving, setSmtpSaving] = useState(false);
  const [smtpMsg, setSmtpMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ─── State riêng cho form Thanh toán ─── */
  const [paymentForm, setPaymentForm] = useState({
    [SETTING_KEYS.payosClientId]: '',
    [SETTING_KEYS.payosApiKey]: '',
    [SETTING_KEYS.payosChecksumKey]: '',
    [SETTING_KEYS.sepayWebhookSecret]: '',
  });
  const [paymentSaving, setPaymentSaving] = useState(false);
  const [paymentMsg, setPaymentMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  /* ─── State riêng cho Bảo trì ─── */
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);

  /* ─── Tải settings từ backend ─── */
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await settingService.getAll();
      const data: SettingRow[] = res?.data?.data ?? res?.data ?? [];
      const map = toMap(data);
      setSettings(map);

      /* Điền dữ liệu vào form liên hệ */
      setContactForm({
        [SETTING_KEYS.contactEmail]: map[SETTING_KEYS.contactEmail] ?? '',
        [SETTING_KEYS.contactPhone]: map[SETTING_KEYS.contactPhone] ?? '',
        [SETTING_KEYS.contactAddress]: map[SETTING_KEYS.contactAddress] ?? '',
        [SETTING_KEYS.contactFacebook]: map[SETTING_KEYS.contactFacebook] ?? '',
        [SETTING_KEYS.contactZalo]: map[SETTING_KEYS.contactZalo] ?? '',
      });

      /* Điền dữ liệu vào form SMTP */
      setSmtpForm({
        [SETTING_KEYS.smtpHost]: map[SETTING_KEYS.smtpHost] ?? '',
        [SETTING_KEYS.smtpPort]: map[SETTING_KEYS.smtpPort] ?? '',
        [SETTING_KEYS.smtpUser]: map[SETTING_KEYS.smtpUser] ?? '',
        [SETTING_KEYS.smtpPass]: map[SETTING_KEYS.smtpPass] ?? '',
        [SETTING_KEYS.smtpFromName]: map[SETTING_KEYS.smtpFromName] ?? '',
        [SETTING_KEYS.smtpFromEmail]: map[SETTING_KEYS.smtpFromEmail] ?? '',
      });

      /* Điền dữ liệu vào form Thanh toán */
      setPaymentForm({
        [SETTING_KEYS.payosClientId]: map[SETTING_KEYS.payosClientId] ?? '',
        [SETTING_KEYS.payosApiKey]: map[SETTING_KEYS.payosApiKey] ?? '',
        [SETTING_KEYS.payosChecksumKey]: map[SETTING_KEYS.payosChecksumKey] ?? '',
        [SETTING_KEYS.sepayWebhookSecret]: map[SETTING_KEYS.sepayWebhookSecret] ?? '',
      });

      /* Cập nhật trạng thái bảo trì */
      setIsMaintenance(map[SETTING_KEYS.maintenanceMode] === 'true');
    } catch {
      /* Lỗi tải — không chặn giao diện, admin vẫn thấy form rỗng */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /* ─── Lưu thông tin liên hệ ─── */
  const handleContactSave = async () => {
    setContactSaving(true);
    setContactMsg(null);
    try {
      /* Chỉ gửi các field đã thay đổi so với giá trị hiện tại */
      const updates: Record<string, string> = {};
      for (const [key, value] of Object.entries(contactForm)) {
        if ((settings[key] ?? '') !== value) {
          updates[key] = value;
        }
      }
      if (Object.keys(updates).length === 0) {
        setContactMsg({ type: 'ok', text: 'Không có thay đổi nào.' });
        setContactSaving(false);
        return;
      }
      await settingService.update(updates);
      /* Cập nhật lại settings local */
      setSettings((prev) => ({ ...prev, ...updates }));
      setContactMsg({ type: 'ok', text: 'Đã lưu thông tin liên hệ!' });
    } catch {
      setContactMsg({ type: 'err', text: 'Chưa lưu được. Thử lại giúp mình.' });
    } finally {
      setContactSaving(false);
    }
  };

  /* Tự ẩn thông báo sau 4 giây */
  useEffect(() => {
    if (!contactMsg) return;
    const t = setTimeout(() => setContactMsg(null), 4000);
    return () => clearTimeout(t);
  }, [contactMsg]);

  /* ─── Cập nhật field liên hệ ─── */
  const updateContactField = (key: string, value: string) => {
    setContactForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ─── Lưu thông tin SMTP ─── */
  const handleSmtpSave = async () => {
    setSmtpSaving(true);
    setSmtpMsg(null);
    try {
      const updates: Record<string, string> = {};
      for (const [key, value] of Object.entries(smtpForm)) {
        if ((settings[key] ?? '') !== value) {
          updates[key] = value;
        }
      }
      if (Object.keys(updates).length === 0) {
        setSmtpMsg({ type: 'ok', text: 'Không có thay đổi nào.' });
        setSmtpSaving(false);
        return;
      }
      await settingService.update(updates);
      setSettings((prev) => ({ ...prev, ...updates }));
      setSmtpMsg({ type: 'ok', text: 'Đã lưu thông tin cấu hình Email!' });
    } catch {
      setSmtpMsg({ type: 'err', text: 'Chưa lưu được. Thử lại giúp mình.' });
    } finally {
      setSmtpSaving(false);
    }
  };

  /* ─── Bật/tắt bảo trì ─── */
  const toggleMaintenance = async () => {
    setMaintenanceSaving(true);
    try {
      const newValue = isMaintenance ? 'false' : 'true';
      await settingService.update({ [SETTING_KEYS.maintenanceMode]: newValue });
      setIsMaintenance(newValue === 'true');
      setSettings((prev) => ({ ...prev, [SETTING_KEYS.maintenanceMode]: newValue }));
    } catch {
      // Có thể hiển thị toast báo lỗi
    } finally {
      setMaintenanceSaving(false);
    }
  };

  useEffect(() => {
    if (!smtpMsg) return;
    const t = setTimeout(() => setSmtpMsg(null), 4000);
    return () => clearTimeout(t);
  }, [smtpMsg]);

  const updateSmtpField = (key: string, value: string) => {
    setSmtpForm((prev) => ({ ...prev, [key]: value }));
  };

  /* ─── Lưu thông tin Thanh toán ─── */
  const handlePaymentSave = async () => {
    setPaymentSaving(true);
    setPaymentMsg(null);
    try {
      const updates: Record<string, string> = {};
      for (const [key, value] of Object.entries(paymentForm)) {
        if ((settings[key] ?? '') !== value) {
          updates[key] = value;
        }
      }
      if (Object.keys(updates).length === 0) {
        setPaymentMsg({ type: 'ok', text: 'Không có thay đổi nào.' });
        setPaymentSaving(false);
        return;
      }
      await settingService.update(updates);
      setSettings((prev) => ({ ...prev, ...updates }));
      setPaymentMsg({ type: 'ok', text: 'Đã lưu cấu hình thanh toán!' });
    } catch {
      setPaymentMsg({ type: 'err', text: 'Chưa lưu được. Thử lại giúp mình.' });
    } finally {
      setPaymentSaving(false);
    }
  };

  useEffect(() => {
    if (!paymentMsg) return;
    const t = setTimeout(() => setPaymentMsg(null), 4000);
    return () => clearTimeout(t);
  }, [paymentMsg]);

  const updatePaymentField = (key: string, value: string) => {
    setPaymentForm((prev) => ({ ...prev, [key]: value }));
  };

  /** Các trường liên hệ để render form. */
  const contactFields = [
    {
      key: SETTING_KEYS.contactEmail,
      label: 'Email liên hệ',
      placeholder: 'admin@zoldify.com',
      icon: Mail,
      type: 'email' as const,
      hint: 'Email này sẽ hiển thị trên footer và trang bảo trì.',
    },
    {
      key: SETTING_KEYS.contactPhone,
      label: 'Số điện thoại',
      placeholder: '0123 456 789',
      icon: Phone,
      type: 'tel' as const,
      hint: 'Để trống nếu không muốn hiện trên footer.',
    },
    {
      key: SETTING_KEYS.contactAddress,
      label: 'Địa chỉ',
      placeholder: 'TP. Hồ Chí Minh, Việt Nam',
      icon: MapPin,
      type: 'text' as const,
      hint: 'Để trống nếu không muốn hiện trên footer.',
    },
    {
      key: SETTING_KEYS.contactFacebook,
      label: 'Facebook',
      placeholder: 'https://facebook.com/zoldify',
      icon: Facebook,
      type: 'url' as const,
      hint: 'Link trang Facebook của shop hoặc dự án.',
    },
    {
      key: SETTING_KEYS.contactZalo,
      label: 'Zalo',
      placeholder: 'https://zalo.me/zoldify',
      icon: MessageCircle,
      type: 'url' as const,
      hint: 'Link Zalo OA hoặc số Zalo.',
    },
  ];

  /** Các trường cấu hình SMTP để render form. */
  const smtpFields = [
    {
      key: SETTING_KEYS.smtpHost,
      label: 'Máy chủ SMTP (Host)',
      placeholder: 'smtp.gmail.com',
      icon: Server,
      type: 'text' as const,
      hint: 'Ví dụ: smtp.gmail.com hoặc smtp.sendgrid.net',
    },
    {
      key: SETTING_KEYS.smtpPort,
      label: 'Cổng (Port)',
      placeholder: '587',
      icon: Hash,
      type: 'text' as const,
      hint: 'Thường là 587 (TLS) hoặc 465 (SSL)',
    },
    {
      key: SETTING_KEYS.smtpUser,
      label: 'Tài khoản (Username)',
      placeholder: 'noreply@zoldify.com',
      icon: User,
      type: 'text' as const,
      hint: 'Tài khoản đăng nhập SMTP',
    },
    {
      key: SETTING_KEYS.smtpPass,
      label: 'Mật khẩu ứng dụng',
      placeholder: '••••••••',
      icon: Key,
      type: 'password' as const,
      hint: 'Mật khẩu ứng dụng (App Password) hoặc API Key',
    },
    {
      key: SETTING_KEYS.smtpFromName,
      label: 'Tên người gửi',
      placeholder: 'Zoldify',
      icon: AtSign,
      type: 'text' as const,
      hint: 'Tên hiển thị khi người dùng nhận email',
    },
    {
      key: SETTING_KEYS.smtpFromEmail,
      label: 'Email người gửi',
      placeholder: 'noreply@zoldify.com',
      icon: Mail,
      type: 'email' as const,
      hint: 'Email gửi đi (hiển thị trong phần From)',
    },
  ];

  /** Các trường cấu hình PayOS. */
  const payosFields = [
    {
      key: SETTING_KEYS.payosClientId,
      label: 'Client ID',
      placeholder: 'Nhập Client ID từ PayOS',
      icon: User,
      type: 'text' as const,
      hint: 'Client ID cung cấp bởi PayOS',
    },
    {
      key: SETTING_KEYS.payosApiKey,
      label: 'API Key',
      placeholder: 'Nhập API Key từ PayOS',
      icon: Key,
      type: 'password' as const,
      hint: 'API Key cung cấp bởi PayOS',
    },
    {
      key: SETTING_KEYS.payosChecksumKey,
      label: 'Checksum Key',
      placeholder: 'Nhập Checksum Key từ PayOS',
      icon: Lock,
      type: 'password' as const,
      hint: 'Checksum Key dùng để xác minh tính toàn vẹn dữ liệu',
    },
  ];

  /** Các trường cấu hình Sepay. */
  const sepayFields = [
    {
      key: SETTING_KEYS.sepayWebhookSecret,
      label: 'Webhook Secret',
      placeholder: 'Nhập Secret bảo mật từ Sepay',
      icon: Key,
      type: 'password' as const,
      hint: 'Mã bí mật dùng để xác minh nguồn gửi từ Sepay (để trống nếu fallback về .env)',
    },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Header trang */}
      <header className="h-[56px] bg-surface-card border-b border-ink/8 flex items-center justify-between px-6 flex-shrink-0">
        <h2 className="text-xl font-semibold text-ink">Cài đặt hệ thống</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-ink-muted">Admin</span>
        </div>
      </header>

      {/* Nội dung chính */}
      <main className="flex-1 overflow-y-auto p-6 bg-surface-sunken">
        <div className="max-w-6xl mx-auto">

          <div className="bg-surface-card rounded-xl shadow-sm border border-ink/8 overflow-hidden">
            {/* Tab Navigation */}
            <div className="border-b border-ink/8 overflow-x-auto">
              <nav className="flex min-w-max">
                {['general', 'contact', 'email', 'payment', 'maintenance'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 whitespace-nowrap ${activeTab === tab ? 'border-brand text-brand' : 'border-transparent text-ink-muted hover:text-ink'}`}
                  >
                    {tab === 'general' ? 'Thông tin chung' :
                      tab === 'contact' ? 'Liên hệ' :
                        tab === 'email' ? 'Email SMTP' :
                          tab === 'payment' ? 'Thanh toán' : 'Bảo trì'}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Contents */}
            <div className="p-6">

              {/* General Settings */}
              {activeTab === 'general' && (
                <form className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-muted mb-2">Tên Website</label>
                      <input type="text" defaultValue="Zoldify" className={INPUT_CLS} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-muted mb-2">Mô tả Website</label>
                      <input type="text" defaultValue="Chợ đồ cũ sinh viên" className={INPUT_CLS} />
                    </div>
                  </div>
                  <button type="button" className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition">Lưu thay đổi</button>
                </form>
              )}

              {/* ──────────────────────────────────────────────────────── */}
              {/*  Contact Settings — FORM LIÊN HỆ ĐỘNG                  */}
              {/* ──────────────────────────────────────────────────────── */}
              {activeTab === 'contact' && (
                <div className="space-y-6">
                  {/* Tiêu đề mô tả */}
                  <div className="pb-4 border-b border-ink/8">
                    <h3 className="text-lg font-semibold text-ink">Thông tin liên hệ</h3>
                    <p className="text-sm text-ink-muted mt-1">
                      Thông tin này sẽ hiển thị trên footer của trang chính Zoldify. Để trống trường nào thì mục đó sẽ không hiện.
                    </p>
                  </div>

                  {loading ? (
                    /* Trạng thái đang tải */
                    <div className="flex items-center justify-center py-12 gap-3 text-ink-muted">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Đang tải cài đặt…</span>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleContactSave();
                      }}
                      className="space-y-5"
                    >
                      {/* Render từng trường liên hệ */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {contactFields.map((field) => {
                          const Icon = field.icon;
                          return (
                            <div key={field.key}>
                              <label className="block text-sm font-medium text-ink-muted mb-2">
                                {field.label}
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
                                  <Icon className="w-4 h-4" />
                                </span>
                                <input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  value={contactForm[field.key] ?? ''}
                                  onChange={(e) => updateContactField(field.key, e.target.value)}
                                  className={`${INPUT_CLS} pl-10`}
                                />
                              </div>
                              <p className="text-xs text-ink-muted/70 mt-1.5">{field.hint}</p>
                            </div>
                          );
                        })}
                      </div>

                      {/* Nút lưu + thông báo */}
                      <div className="flex items-center gap-4 pt-2">
                        <button
                          type="submit"
                          disabled={contactSaving}
                          className="px-6 py-2.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {contactSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                          {contactSaving ? 'Đang lưu…' : 'Lưu thông tin liên hệ'}
                        </button>

                        {contactMsg && (
                          <span
                            className={`flex items-center gap-1.5 text-sm font-medium ${
                              contactMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {contactMsg.type === 'ok' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            {contactMsg.text}
                          </span>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Maintenance Settings */}
              {activeTab === 'maintenance' && (
                <div className="space-y-6">
                  <div className="p-6 border border-ink/8 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-ink">Chế độ bảo trì</h3>
                        <p className="text-sm text-ink-muted mt-1">
                          Khi bật, người dùng sẽ không thể truy cập website và API mua bán (ngoại trừ Admin).<br/>
                          Trạng thái: <strong className={isMaintenance ? 'text-red-600' : 'text-green-600'}>{isMaintenance ? 'ĐANG BẢO TRÌ' : 'ĐANG HOẠT ĐỘNG'}</strong>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={toggleMaintenance}
                        disabled={maintenanceSaving}
                        className={`px-6 py-2 text-white rounded-lg transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 ${
                          isMaintenance ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {maintenanceSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                        {isMaintenance ? 'TẮT bảo trì' : 'BẬT bảo trì'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ──────────────────────────────────────────────────────── */}
              {/*  Email SMTP Settings                                     */}
              {/* ──────────────────────────────────────────────────────── */}
              {activeTab === 'email' && (
                <div className="space-y-6">
                  {/* Tiêu đề mô tả */}
                  <div className="pb-4 border-b border-ink/8">
                    <h3 className="text-lg font-semibold text-ink">Cấu hình Email SMTP</h3>
                    <p className="text-sm text-ink-muted mt-1">
                      Sử dụng để gửi email thông báo, OTP, đặt lại mật khẩu cho người dùng. 
                      Để trống các trường để sử dụng cấu hình mặc định trong hệ thống.
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">
                        <strong className="font-semibold">Lưu ý quan trọng:</strong> Sau khi lưu cấu hình SMTP, bạn cần <strong>khởi động lại máy chủ backend</strong> để cấu hình mới có hiệu lực.
                      </p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12 gap-3 text-ink-muted">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Đang tải cài đặt…</span>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSmtpSave();
                      }}
                      className="space-y-5"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {smtpFields.map((field) => {
                          const Icon = field.icon;
                          return (
                            <div key={field.key}>
                              <label className="block text-sm font-medium text-ink-muted mb-2">
                                {field.label}
                              </label>
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
                                  <Icon className="w-4 h-4" />
                                </span>
                                <input
                                  type={field.type}
                                  placeholder={field.placeholder}
                                  value={smtpForm[field.key] ?? ''}
                                  onChange={(e) => updateSmtpField(field.key, e.target.value)}
                                  className={`${INPUT_CLS} pl-10`}
                                />
                              </div>
                              <p className="text-xs text-ink-muted/70 mt-1.5">{field.hint}</p>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex items-center gap-4 pt-2">
                        <button
                          type="submit"
                          disabled={smtpSaving}
                          className="px-6 py-2.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {smtpSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                          {smtpSaving ? 'Đang lưu…' : 'Lưu cấu hình Email'}
                        </button>

                        {smtpMsg && (
                          <span
                            className={`flex items-center gap-1.5 text-sm font-medium ${
                              smtpMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {smtpMsg.type === 'ok' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            {smtpMsg.text}
                          </span>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* ──────────────────────────────────────────────────────── */}
              {/*  Payment Settings                                        */}
              {/* ──────────────────────────────────────────────────────── */}
              {activeTab === 'payment' && (
                <div className="space-y-8">
                  {/* Tiêu đề mô tả */}
                  <div className="pb-4 border-b border-ink/8">
                    <h3 className="text-lg font-semibold text-ink">Cấu hình Thanh toán</h3>
                    <p className="text-sm text-ink-muted mt-1">
                      Quản lý các cổng thanh toán, API Keys, và Webhooks.
                    </p>
                    <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-3 text-amber-800">
                      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm">
                        <strong className="font-semibold">Lưu ý quan trọng:</strong> Sau khi thay đổi API Key, bạn cần <strong>khởi động lại máy chủ backend</strong> để tránh lỗi sai chữ ký khi tạo đơn hoặc nhận webhook do key cũ bị cache.
                      </p>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex items-center justify-center py-12 gap-3 text-ink-muted">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span className="text-sm">Đang tải cài đặt…</span>
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handlePaymentSave();
                      }}
                      className="space-y-8"
                    >
                      {/* --- PAYOS --- */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard className="w-5 h-5 text-brand" />
                          <h4 className="text-base font-semibold text-ink">Cổng thanh toán QR PayOS</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                          {payosFields.map((field) => {
                            const Icon = field.icon;
                            return (
                              <div key={field.key}>
                                <label className="block text-sm font-medium text-ink-muted mb-2">
                                  {field.label}
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
                                    <Icon className="w-4 h-4" />
                                  </span>
                                  <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={paymentForm[field.key] ?? ''}
                                    onChange={(e) => updatePaymentField(field.key, e.target.value)}
                                    className={`${INPUT_CLS} pl-10`}
                                  />
                                </div>
                                <p className="text-xs text-ink-muted/70 mt-1.5">{field.hint}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Phân cách */}
                      <hr className="border-ink/8" />

                      {/* --- SEPAY --- */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <CreditCard className="w-5 h-5 text-brand" />
                          <h4 className="text-base font-semibold text-ink">Chuyển khoản tự động Sepay</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                          {sepayFields.map((field) => {
                            const Icon = field.icon;
                            return (
                              <div key={field.key}>
                                <label className="block text-sm font-medium text-ink-muted mb-2">
                                  {field.label}
                                </label>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted">
                                    <Icon className="w-4 h-4" />
                                  </span>
                                  <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    value={paymentForm[field.key] ?? ''}
                                    onChange={(e) => updatePaymentField(field.key, e.target.value)}
                                    className={`${INPUT_CLS} pl-10`}
                                  />
                                </div>
                                <p className="text-xs text-ink-muted/70 mt-1.5">{field.hint}</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Nút lưu + thông báo */}
                      <div className="flex items-center gap-4 pt-2">
                        <button
                          type="submit"
                          disabled={paymentSaving}
                          className="px-6 py-2.5 bg-brand text-white rounded-lg hover:bg-brand/90 transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          {paymentSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                          {paymentSaving ? 'Đang lưu…' : 'Lưu cấu hình Thanh toán'}
                        </button>

                        {paymentMsg && (
                          <span
                            className={`flex items-center gap-1.5 text-sm font-medium ${
                              paymentMsg.type === 'ok' ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {paymentMsg.type === 'ok' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <AlertCircle className="w-4 h-4" />
                            )}
                            {paymentMsg.text}
                          </span>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
