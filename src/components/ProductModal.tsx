'use client';

import React, { useEffect, useState } from 'react';
import { X, Save, Loader2, ImageIcon } from 'lucide-react';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { uploadService } from '@/services/upload.service';
import { useToast } from '@/components/Toast';

export type ProductModalMode = 'add' | 'edit' | 'view';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mode: ProductModalMode;
  product?: any;
}

export default function ProductModal({ isOpen, onClose, onSuccess, mode, product }: ProductModalProps) {
  const { toast } = useToast();
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [form, setForm] = useState({
    name: '',
    price: '',
    category_id: '',
    description: '',
    stock: '0',
    brand: '',
    spec: '',
    condition: 'new',
    is_freeship: false,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isReadOnly = mode === 'view';

  // Load categories
  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await categoryService.getAll();
        const data = res.data?.data || res.data;
        setCategories(data?.result || []);
      } catch (err) {
        console.error(err);
        toast('Không tải được danh sách danh mục', 'error');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, [isOpen]);

  // Load product data when editing or viewing
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' || mode === 'view') {
        if (product) {
          setForm({
            name: product.name || '',
            price: product.price ? String(product.price) : '',
            category_id: product.category_id || product.category?.id || '',
            description: product.description || '',
            stock: product.stock !== undefined ? String(product.stock) : '0',
            brand: product.brand || '',
            spec: product.spec || '',
            condition: product.condition || 'new',
            is_freeship: !!product.is_freeship,
          });
          setImagePreview(product.image || '');
          setImageFile(null);
        }
      } else {
        // Reset form for "add"
        setForm({
          name: '',
          price: '',
          category_id: '',
          description: '',
          stock: '0',
          brand: '',
          spec: '',
          condition: 'new',
          is_freeship: false,
        });
        setImagePreview('');
        setImageFile(null);
      }
    }
  }, [isOpen, mode, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (isReadOnly) return;
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast('Ảnh quá lớn, tối đa 5MB', 'warning');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    if (isReadOnly) return;
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) {
      onClose();
      return;
    }

    if (!form.name.trim() || !form.price || !form.category_id) {
      toast('Vui lòng điền các trường bắt buộc (*)', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      let imageUrl = imagePreview; // Giữ nguyên ảnh cũ nếu không đổi

      if (imageFile) {
        setUploading(true);
        try {
          const uploadRes = await uploadService.upload(imageFile, 'products');
          imageUrl = uploadRes.data?.data?.url || uploadRes.data?.url || '';
        } catch (err) {
          console.error(err);
          toast('Lỗi tải ảnh lên, vẫn tiếp tục lưu.', 'warning');
        } finally {
          setUploading(false);
        }
      }

      const payload: any = {
        name: form.name.trim(),
        price: Number(form.price),
        category_id: Number(form.category_id),
        description: form.description.trim(),
        stock: Number(form.stock),
        brand: form.brand.trim(),
        spec: form.spec.trim(),
        condition: form.condition,
        is_freeship: form.is_freeship,
      };

      if (imageUrl && imageUrl !== imagePreview && imageFile) {
        payload.image = imageUrl;
      } else if (!imageFile && mode === 'edit') {
        // Nếu không chọn ảnh mới, không gửi trường image lên (hoặc gửi ảnh cũ tùy logic backend)
        // Thông thường PATCH request sẽ bỏ qua trường không gửi
        if (!imageUrl) payload.image = ''; // Nếu người dùng xóa ảnh
      } else if (mode === 'add' && imageUrl) {
        payload.image = imageUrl;
      }


      if (mode === 'add') {
        await productService.create(payload);
        toast('Thêm sản phẩm thành công!', 'success');
      } else if (mode === 'edit' && product) {
        await productService.update(product.id, payload);
        toast('Cập nhật sản phẩm thành công!', 'success');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Có lỗi xảy ra';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'add' ? 'Thêm Sản Phẩm' : mode === 'edit' ? 'Sửa Sản Phẩm' : 'Chi Tiết Sản Phẩm'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cột trái */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên sản phẩm {mode !== 'view' && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    required
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'}`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá (VNĐ) {mode !== 'view' && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      name="price"
                      type="number"
                      min="0"
                      value={form.price}
                      onChange={handleChange}
                      readOnly={isReadOnly}
                      required
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Danh mục {mode !== 'view' && <span className="text-red-500">*</span>}
                    </label>
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      required
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300 bg-white'}`}
                    >
                      <option value="">{loadingCategories ? 'Đang tải...' : '— Chọn —'}</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    readOnly={isReadOnly}
                    rows={4}
                    className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'}`}
                  />
                </div>
              </div>

              {/* Cột phải */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border" />
                      {!isReadOnly && (
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <label className={`flex flex-col items-center justify-center w-32 h-32 border-2 border-dashed rounded-xl ${isReadOnly ? 'bg-gray-50 border-gray-200' : 'border-gray-300 cursor-pointer hover:border-blue-400 hover:bg-blue-50'}`}>
                      <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-500">{isReadOnly ? 'Không có ảnh' : 'Tải ảnh lên'}</span>
                      {!isReadOnly && <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />}
                    </label>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số lượng</label>
                    <input
                      name="stock"
                      type="number"
                      min="0"
                      value={form.stock}
                      onChange={handleChange}
                      readOnly={isReadOnly}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thương hiệu</label>
                    <input
                      name="brand"
                      value={form.brand}
                      onChange={handleChange}
                      readOnly={isReadOnly}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'}`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tình trạng</label>
                    <select
                      name="condition"
                      value={form.condition}
                      onChange={handleChange}
                      disabled={isReadOnly}
                      className={`w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300 bg-white'}`}
                    >
                      <option value="new">Mới</option>
                      <option value="like_new">Như mới</option>
                      <option value="good">Tốt</option>
                      <option value="fair">Trung bình</option>
                      <option value="used">Đã sử dụng</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-6">
                    <label className={`flex items-center gap-2 ${isReadOnly ? '' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        name="is_freeship"
                        checked={form.is_freeship}
                        onChange={handleChange}
                        disabled={isReadOnly}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Miễn phí ship</span>
                    </label>
                  </div>
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
          >
            {isReadOnly ? 'Đóng' : 'Hủy'}
          </button>
          {!isReadOnly && (
            <button
              type="submit"
              form="product-form"
              disabled={submitting || uploading}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium disabled:opacity-60"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {uploading ? 'Đang tải ảnh...' : 'Đang lưu...'}</>
              ) : (
                <><Save className="w-4 h-4" /> Lưu Lại</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
