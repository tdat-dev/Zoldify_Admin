"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Loader2, ShieldAlert } from 'lucide-react';

/**
 * Cổng quyền cho toàn bộ app quản trị Zoldify (Cổng 3002).
 * Tự động hiển thị Form đăng nhập nếu chưa có phiên làm việc Admin.
 */
export function AdminGate({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = isAuthenticated ? 'Zoldify Admin' : 'Zoldify Admin - Đăng nhập';
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại Email và Mật khẩu.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-slate-100">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 shadow-xl border border-slate-200">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">Zoldify Admin</h1>
            <p className="mt-1 text-sm text-slate-500">
              Đăng nhập tài khoản Quản trị viên (Cổng 3002)
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Email Admin</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="admin_email_fake"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin(e as any)}
                  placeholder="admin@zoldify.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="admin_password_fake"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin(e as any)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white text-slate-800"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đăng nhập Admin'}
            </button>
          </div>

        </div>
      </main>
    );
  }

  if (user.role !== 'admin') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-slate-100">
        <div className="max-w-md w-full rounded-2xl bg-white p-8 text-center shadow-xl border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-slate-800">Không có quyền truy cập</h1>
          <p className="mt-2 text-sm text-slate-600">
            Tài khoản <strong className="text-slate-800">{user.email}</strong> (Role: <code className="bg-slate-100 px-1 rounded">{user.role}</code>) không phải là Quản trị viên.
          </p>
          <button
            onClick={logout}
            className="mt-5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded-xl transition-all"
          >
            Đăng xuất và thử lại
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}
