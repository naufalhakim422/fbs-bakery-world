'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { recordAuditLog } from '@/lib/audit';
import { Product, ProductVariant } from '@/types';
import { compressImageFile } from '@/lib/image-compressor';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  Upload, 
  X, 
  AlertCircle, 
  Tag, 
  Image as ImageIcon,
  CheckCircle2,
  Package,
  Layers,
  FileText
} from 'lucide-react';
import { useLanguage } from '@/lib/language-context';

function AdminNewProductContent() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const categories = db.getCategories();

  const [isSlugManual, setIsSlugManual] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const [form, setForm] = useState({
    sku: `FBS-PROD-${Math.floor(1000 + Math.random() * 9000)}`,
    productName: '',
    slug: '',
    categoryId: categories[0]?.id || 'cat-1',
    brand: 'FBS Choice',
    shortDescription: '',
    description: '',
    mainImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
    isHalal: true,
    isFeatured: false,
    isBestSeller: false,
    totalSold: 0,
  });

  const [galleryImages, setGalleryImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop'
  ]);

  const [variants, setVariants] = useState<Partial<ProductVariant>[]>([
    { variantName: '1kg', weight: 1.0, price: 18.00, originalPrice: 0, isDiscountActive: false, stock: 100, sku: `FBS-VAR-1KG-${Math.floor(100 + Math.random() * 900)}` },
    { variantName: '5kg Commercial', weight: 5.0, price: 75.00, originalPrice: 0, isDiscountActive: false, stock: 40, sku: `FBS-VAR-5KG-${Math.floor(100 + Math.random() * 900)}` },
  ]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleProductNameChange = (name: string) => {
    setValidationError(null);
    if (!isSlugManual) {
      const autoSlug = generateSlug(name);
      setForm(prev => ({ ...prev, productName: name, slug: autoSlug }));
    } else {
      setForm(prev => ({ ...prev, productName: name }));
    }
  };

  useEffect(() => {
    if (editId) {
      const populateForm = (existing: Product) => {
        setForm({
          sku: existing.sku || `FBS-PROD-${Math.floor(1000 + Math.random() * 9000)}`,
          productName: existing.productName || '',
          slug: existing.slug || '',
          categoryId: existing.categoryId || categories[0]?.id || 'cat-1',
          brand: existing.brand || 'FBS Choice',
          shortDescription: existing.shortDescription || '',
          description: existing.description || '',
          mainImage: existing.mainImage || '',
          isHalal: existing.isHalal ?? true,
          isFeatured: existing.isFeatured ?? false,
          isBestSeller: existing.isBestSeller ?? false,
          totalSold: existing.totalSold || 0,
        });
        setIsSlugManual(true);
        if (existing.galleryImages && existing.galleryImages.length > 0) {
          setGalleryImages(existing.galleryImages);
        } else if (existing.mainImage) {
          setGalleryImages([existing.mainImage]);
        }
        if (existing.variants && existing.variants.length > 0) {
          setVariants(existing.variants.map((v: any) => ({
            ...v,
            isDiscountActive: v.isDiscountActive !== undefined
              ? Boolean(v.isDiscountActive)
              : Boolean(v.originalPrice && Number(v.originalPrice) > 0),
          })));
        }
      };

      const existingLocal = db.getProductBySlug(editId);
      if (existingLocal) {
        populateForm(existingLocal);
      }

      // Live fetch fresh data from Railway PostgreSQL DB to prevent stale memory
      fetch(`/api/products?slug=${encodeURIComponent(editId)}&t=${Date.now()}`, { cache: 'no-store' })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.product) {
            populateForm(data.product);
          }
        })
        .catch(() => {});
    } else {
      // COMPLETE RESET FOR CREATE NEW PRODUCT MODE
      setForm({
        sku: `FBS-PROD-${Math.floor(1000 + Math.random() * 9000)}`,
        productName: '',
        slug: '',
        categoryId: categories[0]?.id || 'cat-1',
        brand: 'FBS Choice',
        shortDescription: '',
        description: '',
        mainImage: '',
        isHalal: true,
        isFeatured: false,
        isBestSeller: false,
        totalSold: 0,
      });
      setGalleryImages([]);
      setVariants([
        { variantName: '1kg', weight: 1.0, price: 18.00, originalPrice: 0, isDiscountActive: false, stock: 100, sku: `FBS-VAR-1KG-${Math.floor(100 + Math.random() * 900)}` },
      ]);
      setIsSlugManual(false);
      setValidationError(null);
    }
  }, [editId]);

  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB limit before compression

    const list: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (!allowedTypes.includes(file.type.toLowerCase())) {
        alert(`Format file "${file.name}" tidak didukung. Harap upload gambar berformat JPG, PNG, WEBP, GIF, atau SVG.`);
        continue;
      }

      if (file.size > maxSizeBytes) {
        alert(`Ukuran file "${file.name}" melebihi batas 5MB. Harap pilih gambar dengan ukuran lebih kecil.`);
        continue;
      }

      try {
        const compressed = await compressImageFile(file);
        list.push(compressed);
      } catch (err) {
        console.warn('Failed to compress product gallery image file:', err);
      }
    }

    if (list.length > 0) {
      setGalleryImages(prev => [...prev, ...list]);
      if (!form.mainImage || form.mainImage.includes('unsplash')) {
        setForm(prev => ({ ...prev, mainImage: list[0] }));
      }
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { variantName: 'Kemasan Baru', weight: 1.0, price: 20.00, originalPrice: 0, isDiscountActive: false, stock: 50, sku: `FBS-VAR-${Math.floor(100 + Math.random() * 900)}` }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('Produk wajib memiliki minimal 1 varian kemasan.');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    let sanitized = value;
    if (typeof value === 'string' && (field === 'price' || field === 'weight' || field === 'stock' || field === 'originalPrice')) {
      if (value === '') {
        sanitized = '';
      } else {
        const cleanString = value.replace(/^0+(?=\d)/, '');
        sanitized = cleanString;
      }
    }
    updated[index] = { ...updated[index], [field]: sanitized };
    setVariants(updated);
  };

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    const cleanName = form.productName.trim();

    if (!cleanName) {
      setValidationError('Nama Produk wajib diisi.');
      return;
    }

    if (!form.mainImage || !form.mainImage.trim()) {
      setValidationError('Foto Utama Produk wajib diunggah atau dipilih.');
      return;
    }

    if (!variants || variants.length === 0) {
      setValidationError('Produk wajib memiliki minimal 1 varian kemasan.');
      return;
    }

    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.variantName || !v.variantName.trim()) {
        setValidationError(`Varian #${i + 1} membutuhkan Nama Varian.`);
        return;
      }
      const price = Number(v.price);
      if (isNaN(price) || price <= 0) {
        setValidationError(`Varian "${v.variantName}" harus memiliki harga lebih dari 0.`);
        return;
      }
      const stock = Number(v.stock);
      if (isNaN(stock) || stock < 0) {
        setValidationError(`Stok varian "${v.variantName}" tidak boleh bernilai negatif.`);
        return;
      }
    }

    setConfirmSaveOpen(true);
  };

  const executeSaveProduct = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const currentProd = editId ? db.getProductBySlug(editId) : undefined;
    const finalSlug = (form.slug || generateSlug(form.productName)).trim();

    const productPayload = {
      id: currentProd?.id || `prod-${Date.now()}`,
      ...form,
      slug: finalSlug,
      galleryImages: galleryImages.length > 0 ? galleryImages : [form.mainImage],
      variants: variants.map((v, idx) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        productId: currentProd?.id || `prod-${Date.now()}`,
        variantName: v.variantName || 'Standard',
        weight: isNaN(Number(v.weight)) ? 1.0 : Number(v.weight),
        price: Number(v.price),
        originalPrice: v.originalPrice ? Number(v.originalPrice) : 0,
        stock: Number(v.stock),
        sku: v.sku || `FBS-VAR-${idx}`,
      })),
    };

    try {
      const res = await fetch('/api/products', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productPayload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Server PostgreSQL Railway gagal menyimpan produk.');
      }

      db.saveProduct(productPayload);

      recordAuditLog(
        editId ? 'Edit Produk' : 'Tambah Produk Baru',
        'PRODUCT',
        `Product ${form.productName} (slug: ${finalSlug}) with ${variants.length} variants was ${editId ? 'updated' : 'created'}.`
      );

      setConfirmSaveOpen(false);
      router.push('/admin/products');
    } catch (apiErr: any) {
      console.error('[Admin Save Product API Error]', apiErr);
      setValidationError(`Gagal menyimpan ke server Railway: ${apiErr.message || 'Koneksi terganggu.'}`);
      setConfirmSaveOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 text-stone-900 font-sans pb-12">
      
      {/* REFINED OPERATIONAL HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link 
            href="/admin/products" 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#800020] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Kembali ke Katalog Produk
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-[#800020] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#800020] inline-block" />
            {editId ? 'MODUS EDIT PRODUK' : 'MODUS TAMBAH PRODUK BARU'}
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {editId ? `Edit Produk: ${form.productName || 'Tanpa Judul'}` : 'Tambah Produk Bahan Baking Baru'}
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Atur spesifikasi bahan baking, varian kemasan &amp; harga, foto galeri, serta status sertifikasi halal.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl transition-colors"
          >
            Batal
          </Link>
          <button
            type="button"
            onClick={handleSubmitProduct}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Produk & Varian'}
          </button>
        </div>
      </div>

      {/* VALIDATION ERROR BANNER */}
      {validationError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{validationError}</span>
          </div>
          <button type="button" onClick={() => setValidationError(null)} className="text-rose-500 hover:text-rose-900 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* FORM BODY */}
      <form onSubmit={handleSubmitProduct} className="space-y-6">
        
        {/* SECTION 1: INFORMASI DASAR PRODUK */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-stone-100 text-[#800020]">
              <Package className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-base font-bold text-stone-900">
              1. Informasi Dasar Produk
            </h3>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Nama Produk <span className="text-rose-600">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Tepung Semolina Durum Wheat Premium"
                  value={form.productName}
                  onChange={(e) => handleProductNameChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  URL Slug Produk <span className="text-rose-600">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="tepung-semolina-durum-wheat-premium"
                  value={form.slug}
                  onChange={(e) => {
                    setIsSlugManual(true);
                    setForm({ ...form, slug: generateSlug(e.target.value) });
                  }}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-mono text-xs focus:outline-none focus:border-[#800020]"
                />
                <span className="text-[10px] text-stone-400 mt-1 block">
                  Dibuat otomatis dari Nama Produk. Harus unik untuk SEO URL.
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Kategori Bahan <span className="text-rose-600">*</span>
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold bg-white focus:outline-none focus:border-[#800020]"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  SKU Utama / Kode Produk
                </label>
                <input 
                  type="text"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-mono text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Brand / Produsen
                </label>
                <input 
                  type="text"
                  placeholder="Contoh: Anchor, Beryls, Caputo, FBS Choice"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Ringkasan Singkat (Subtitle Kartu Produk) <span className="text-rose-600">*</span>
              </label>
              <input 
                type="text"
                required
                placeholder="Contoh: Tepung semolina kualitas tinggi untuk roti artisan & pasta Italia."
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Spesifikasi Lengkap &amp; Panduan Penggunaan
              </label>
              <textarea
                rows={4}
                placeholder="Rincian komposisi bahan baku, petunjuk penyimpanan, serta instruksi pemakaian..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: GALERI FOTO PRODUK */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-stone-100 text-[#800020]">
                <ImageIcon className="w-4 h-4" />
              </span>
              <h3 className="font-serif text-base font-bold text-stone-900">
                2. Galeri Foto Produk High-Res
              </h3>
            </div>
            <span className="text-[11px] text-stone-400">Auto-kompresi gambar otomatis</span>
          </div>

          <div className="space-y-4 text-xs">
            <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-6 text-center bg-stone-50/50 transition-colors relative cursor-pointer">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleImagesUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-7 h-7 text-[#800020] mx-auto mb-1.5" />
              <span className="font-bold text-stone-800 block text-xs">+ Unggah Foto Produk High-Res</span>
              <span className="text-[10px] text-stone-400">Pilih satu atau beberapa file foto (JPG, PNG, WEBP, maks 5MB)</span>
            </div>

            {galleryImages.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-1">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-stone-200 group bg-stone-50">
                    <img src={imgUrl} alt="Preview Foto Produk" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full text-xs shadow hover:bg-rose-700 transition-colors"
                      title="Hapus foto"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#800020] text-white text-[8px] font-bold rounded">
                        COVER UTAMA
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* SECTION 3: VARIAN KEMASAN & HARGA */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-stone-100 text-[#800020]">
                <Tag className="w-4 h-4" />
              </span>
              <div>
                <h3 className="font-serif text-base font-bold text-stone-900">
                  3. Varian Kemasan, Harga &amp; Stok Ready
                </h3>
                <p className="text-[11px] text-stone-500">
                  Kelola ukuran berat kemasan, harga jual runcit, harga promo diskon, dan persediaan stok.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-[#D4AF37] font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
            >
              <Plus className="w-3.5 h-3.5" /> Tambah Varian Kemasan
            </button>
          </div>

          <div className="space-y-3 text-xs">
            {variants.map((v, index) => {
              const curPrice = Number(v.price) || 0;
              const isDiscountOn = Boolean(v.isDiscountActive);
              const original = Number(v.originalPrice) || 0;
              const discountPct = isDiscountOn && original > curPrice && original > 0
                ? Math.round(((original - curPrice) / original) * 100)
                : 0;
              const saveAmount = isDiscountOn && original > curPrice ? original - curPrice : 0;

              return (
                <div key={index} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  
                  <div className="flex items-center justify-between border-b border-stone-200/60 pb-2">
                    <span className="font-mono text-[11px] font-bold text-[#800020]">
                      SLOT VARIAN #{index + 1}
                    </span>

                    <label className="flex items-center gap-2 cursor-pointer select-none bg-amber-50 px-3 py-1 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors">
                      <input
                        type="checkbox"
                        checked={isDiscountOn}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          handleVariantChange(index, 'isDiscountActive', checked);
                          if (checked && (!v.originalPrice || Number(v.originalPrice) === 0)) {
                            handleVariantChange(index, 'originalPrice', Math.round((curPrice * 1.25) * 100) / 100);
                          } else if (!checked) {
                            handleVariantChange(index, 'originalPrice', 0);
                          }
                        }}
                        className="rounded text-[#800020] w-3.5 h-3.5 focus:ring-[#800020]"
                      />
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#800020]" />
                        Aktifkan Mode Harga Promo / Diskon
                      </span>
                    </label>
                  </div>

                  <div className={`grid grid-cols-1 ${isDiscountOn ? 'sm:grid-cols-6' : 'sm:grid-cols-5'} gap-3 items-center`}>
                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                        Nama Varian <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Contoh: Kemasan 1kg"
                        value={v.variantName}
                        onChange={(e) => handleVariantChange(index, 'variantName', e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                        Berat (KG) <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.05"
                        required
                        value={v.weight ?? ''}
                        onChange={(e) => handleVariantChange(index, 'weight', e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
                      />
                    </div>

                    {isDiscountOn && (
                      <div>
                        <label className="block text-[10px] font-bold text-amber-800 uppercase mb-1">
                          Harga Coret (MYR)
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          required={isDiscountOn}
                          placeholder="32.00"
                          value={v.originalPrice ?? ''}
                          onChange={(e) => handleVariantChange(index, 'originalPrice', e.target.value)}
                          className="w-full px-3 py-2 border border-amber-300 bg-amber-50/50 rounded-xl text-stone-500 line-through font-serif font-bold focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-bold text-[#800020] uppercase mb-1">
                        {isDiscountOn ? 'Harga Promo (MYR)' : 'Harga Jual (MYR)'} <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        required
                        placeholder="26.00"
                        value={v.price ?? ''}
                        onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-[#800020] font-serif font-bold text-sm focus:outline-none focus:border-[#800020]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">
                        Stok Ready <span className="text-rose-600">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        value={v.stock ?? ''}
                        onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                        className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 font-mono focus:outline-none focus:border-[#800020]"
                      />
                    </div>

                    <div className="flex items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveVariant(index)}
                        className="p-2 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                        title="Hapus Varian"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {isDiscountOn && saveAmount > 0 && (
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded shadow-xs">
                        HEMAT {discountPct}% OFF
                      </span>
                      <span className="text-[11px] font-bold text-amber-900">
                        Potongan harga pelanggan: <span className="text-rose-700 font-bold">RM {saveAmount.toFixed(2)}</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 4: KLASIFIKASI & LENCANA PRODUK */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-stone-200 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-stone-100 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="font-serif text-base font-bold text-stone-900">
              4. Sertifikasi &amp; Lencana Keunggulan
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-bold text-stone-800">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isHalal}
                onChange={(e) => setForm({ ...form, isHalal: e.target.checked })}
                className="rounded text-[#800020] w-4 h-4 focus:ring-[#800020]"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                100% Sertifikasi Halal Resmi
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                className="rounded text-[#800020] w-4 h-4 focus:ring-[#800020]"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Best Seller Showcase
              </span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded text-[#800020] w-4 h-4 focus:ring-[#800020]"
              />
              <span>Tampilkan di Homepage Utama</span>
            </label>
          </div>
        </div>

        {/* BOTTOM ACTION BAR */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            href="/admin/products"
            className="px-5 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl transition-colors"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Menyimpan...' : 'Simpan Produk & Varian'}
          </button>
        </div>

      </form>

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmSaveOpen}
        title={editId ? 'Perbarui Data Produk?' : 'Simpan Produk Baru?'}
        message={editId ? 'Apakah Anda yakin ingin memperbarui data & varian produk ini?' : 'Apakah Anda yakin ingin menyimpan dan mempublikasikan produk baru ini?'}
        type="save"
        onConfirm={executeSaveProduct}
        onCancel={() => setConfirmSaveOpen(false)}
      />
    </div>
  );
}

export default function AdminNewProductPage() {
  return (
    <Suspense fallback={
      <div className="p-12 text-center text-xs text-stone-500 font-bold uppercase tracking-wider space-y-2">
        <div className="w-8 h-8 border-3 border-[#800020] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Memuat Form Editor Produk...</p>
      </div>
    }>
      <AdminNewProductContent />
    </Suspense>
  );
}
