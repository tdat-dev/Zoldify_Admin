"use client";

import React, { useState } from 'react';

/**
 * Trang cài đặt hệ thống.
 * Sidebar + header đã được layout chung (layout.tsx) cung cấp qua AdminNav,
 * nên ở đây chỉ cần render phần nội dung.
 */
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');

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
                      <input type="text" defaultValue="Zoldify" className="w-full px-4 py-2 border border-ink/15 rounded-lg focus:ring-2 focus:ring-brand outline-none bg-surface-card text-ink" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-ink-muted mb-2">Mô tả Website</label>
                      <input type="text" defaultValue="Chợ đồ cũ sinh viên" className="w-full px-4 py-2 border border-ink/15 rounded-lg focus:ring-2 focus:ring-brand outline-none bg-surface-card text-ink" />
                    </div>
                  </div>
                  <button type="button" className="px-6 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition">Lưu thay đổi</button>
                </form>
              )}

              {/* Maintenance Settings */}
              {activeTab === 'maintenance' && (
                <div className="space-y-6">
                  <div className="p-6 border border-ink/8 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-ink">Chế độ bảo trì</h3>
                        <p className="text-sm text-ink-muted mt-1">Khi bật, người dùng sẽ không thể truy cập website</p>
                      </div>
                      <button type="button" className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                        BẬT bảo trì
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Other Tabs Placeholder */}
              {(activeTab === 'contact' || activeTab === 'email' || activeTab === 'payment') && (
                <div className="text-ink-muted text-sm">Nội dung cài đặt cho {activeTab} đang được xây dựng...</div>
              )}
              
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
