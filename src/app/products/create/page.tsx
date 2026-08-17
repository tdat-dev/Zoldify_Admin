'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Loader2, Upload, X, ImageIcon } from 'lucide-react';
import { productService } from '@/services/product.service';
import { categoryService } from '@/services/category.service';
import { uploadService } from '@/services/upload.service';
import { useToast } from '@/components/Toast';

/**
 * Trang tạo sản phẩm mới trong khu quản trị.
 *
 * Form gửi dữ liệu theo đúng cấu trúc CreateProductDto của backend:
 * - name (bắt buộc), price (bắt buộc), category_id (bắt buộc)
 * - description, stock, brand, spec, condition, image, is_freeship (tùy chọn)
 */
export default function CreateProductPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Danh sách danh mục để chọn
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Trạng thái form
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

  // Upload ảnh
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  // Trạng thái submit
  const [submitting, setSubmitting] = useState(false);

  // Lấy danh sách danh mục khi mở trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.getAll();
        const data = res.data?.data || res.data;
        setCategories(data?.result || []);
      } catch (err) {
        console.error('Lỗi tải danh mục:', err);
        toast('Không tải được danh sách danh mục', 'error');
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Cập nhật form
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Xử lý chọn ảnh
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra kích thước (tối đa 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast('Ảnh quá lớn, tối đa 5MB', 'warning');
      return;
    }

    setImageFile(file);
    // Tạo preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // Xóa ảnh đã chọn
  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate bắt buộc
    if (!form.name.trim()) {
      toast('Vui lòng nhập tên sản phẩm', 'warning');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      toast('Vui lòng nhập giá hợp lệ', 'warning');
      return;
    }
    if (!form.category_id) {
      toast('Vui lòng chọn danh mục', 'warning');
      return;
    }

    setSubmitting(true);

    try {
      // Upload ảnh trước nếu có
      let imageUrl = '';
      if (imageFile) {
        setUploading(true);
        try {
          const uploadRes = await uploadService.upload(imageFile, 'products');
          // Upload trả về url trong data
          imageUrl = uploadRes.data?.data?.url || uploadRes.data?.url || '';
        } catch (err) {
          console.error('Lỗi upload ảnh:', err);
          toast('Không thể tải ảnh lên, sản phẩm sẽ được tạo không có ảnh', 'warning');
        } finally {
          setUploading(false);
        }
      }

      // Gọi API tạo sản phẩm
      const payload: any = {
        name: form.name.trim(),
        price: Number(form.price),
        category_id: Number(form.category_id),
      };

      // Thêm các trường tùy chọn nếu có giá trị
      if (form.description.trim()) payload.description = form.description.trim();
      if (form.stock) payload.stock = Number(form.stock);
      if (form.brand.trim()) payload.brand = form.brand.trim();
      if (form.spec.trim()) payload.spec = form.spec.trim();
      if (form.condition) payload.condition = form.condition;
      if (form.is_freeship) payload.is_freeship = true;
      if (imageUrl) payload.image = imageUrl;

      await productService.create(payload);
      toast('Tạo sản phẩm thành công!', 'success');

      // Phát sự kiện refresh thống kê dashboard
      window.dispatchEvent(new CustomEvent('admin-stats-refresh'));

      // Quay về danh sách sản phẩm
      router.push('/products');
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lỗi tạo sản phẩm';
      toast(Array.isArray(msg) ? msg[0] : msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-gray-50">
      {/* Nút quay lại */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Quay lại</span>
      </button>

      {/* Tiêu đề */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Thêm sản phẩm mới</h1>
        <p className="text-gray-600 text-sm mt-1">
          Điền thông tin sản phẩm để đăng bán trên sàn
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card: Thông tin cơ bản */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Thông tin cơ bản</h2>

          {/* Tên sản phẩm */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Tên sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="VD: iPhone 15 Pro Max 256GB"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              required
            />
          </div>

          {/* Giá & Danh mục */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Giá (VNĐ) <span className="text-red-500">*</span>
              </label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1000"
                value={form.price}
                onChange={handleChange}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                id="category_id"
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                required
              >
                <option value="">
                  {loadingCategories ? 'Đang tải...' : '— Chọn danh mục —'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Mô tả */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Mô tả sản phẩm
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả chi tiết về sản phẩm..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>
        </div>

        {/* Card: Ảnh sản phẩm */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Ảnh sản phẩm</h2>

          {imagePreview ? (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-xl border border-gray-200"
              />
              <button
                type="button"
                onClick={removeImage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition shadow-sm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition"
            >
              <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-xs text-gray-500 font-medium">Tải ảnh lên</span>
              <span className="text-xs text-gray-400 mt-0.5">Tối đa 5MB</span>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Card: Chi tiết sản phẩm */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Chi tiết</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Số lượng */}
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-gray-700 mb-1">
                Số lượng tồn kho
              </label>
              <input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Thương hiệu */}
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-1">
                Thương hiệu
              </label>
              <input
                id="brand"
                name="brand"
                type="text"
                value={form.brand}
                onChange={handleChange}
                placeholder="VD: Apple, Samsung, Nike..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Tình trạng */}
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                Tình trạng
              </label>
              <select
                id="condition"
                name="condition"
                value={form.condition}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              >
                <option value="new">Mới</option>
                <option value="like_new">Như mới</option>
                <option value="good">Tốt</option>
                <option value="fair">Trung bình</option>
                <option value="used">Đã sử dụng</option>
              </select>
            </div>

            {/* Miễn phí vận chuyển */}
            <div className="flex items-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="is_freeship"
                  checked={form.is_freeship}
                  onChange={handleChange}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition"
                />
                <span className="text-sm font-medium text-gray-700">Miễn phí vận chuyển</span>
              </label>
            </div>
          </div>

          {/* Thông số kỹ thuật */}
          <div>
            <label htmlFor="spec" className="block text-sm font-medium text-gray-700 mb-1">
              Thông số kỹ thuật
            </label>
            <textarea
              id="spec"
              name="spec"
              value={form.spec}
              onChange={handleChange}
              rows={3}
              placeholder="VD: Màn hình 6.7 inch, RAM 8GB, Pin 4441 mAh..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
            />
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition text-sm font-medium"
            disabled={submitting}
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting || uploading}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{uploading ? 'Đang tải ảnh...' : 'Đang tạo...'}</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Tạo sản phẩm</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
