'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductVariant } from '@/types';
import { compressImageFile } from '@/lib/image-compressor';
import { ArrowLeft, Save, Plus, Trash2, ShieldCheck, Sparkles, Upload, X } from 'lucide-react';

export default function AdminNewProductPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');

  const categories = db.getCategories();

  const [form, setForm] = useState({
    sku: `FBS-PROD-${Math.floor(1000 + Math.random() * 9000)}`,
    productName: '',
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
    { variantName: '1kg', weight: 1.0, price: 18.00, stock: 100, sku: `FBS-VAR-1KG-${Math.floor(100 + Math.random() * 900)}` },
    { variantName: '5kg Commercial', weight: 5.0, price: 75.00, stock: 40, sku: `FBS-VAR-5KG-${Math.floor(100 + Math.random() * 900)}` },
  ]);

  useEffect(() => {
    if (editId) {
      const existing = db.getProductBySlug(editId);
      if (existing) {
        setForm({
          sku: existing.sku,
          productName: existing.productName,
          categoryId: existing.categoryId,
          brand: existing.brand,
          shortDescription: existing.shortDescription,
          description: existing.description,
          mainImage: existing.mainImage,
          isHalal: existing.isHalal,
          isFeatured: existing.isFeatured,
          isBestSeller: existing.isBestSeller,
          totalSold: existing.totalSold || 0,
        });
        if (existing.galleryImages && existing.galleryImages.length > 0) {
          setGalleryImages(existing.galleryImages);
        } else if (existing.mainImage) {
          setGalleryImages([existing.mainImage]);
        }
        setVariants(existing.variants || []);
      }
    }
  }, [editId]);

  const handleMultipleFilesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const uploadedList: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImageFile(files[i]);
        uploadedList.push(compressed);
      } catch (err) {}
    }

    if (uploadedList.length > 0) {
      setGalleryImages(prev => [...prev, ...uploadedList]);
      if (!form.mainImage || form.mainImage.includes('unsplash')) {
        setForm(prev => ({ ...prev, mainImage: uploadedList[0] }));
      }
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    const updated = galleryImages.filter((_, i) => i !== index);
    setGalleryImages(updated);
    if (updated.length > 0) {
      setForm(prev => ({ ...prev, mainImage: updated[0] }));
    }
  };

  const handleAddVariant = () => {
    setVariants([
      ...variants,
      { variantName: '25kg Wholesale', weight: 25.0, price: 300.00, stock: 15, sku: `FBS-VAR-25KG-${Math.floor(100 + Math.random() * 900)}` }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: string, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim()) {
      alert('Please enter product name');
      return;
    }

    const finalGallery = galleryImages.length > 0 ? galleryImages : [form.mainImage];

    const saved = db.saveProduct({
      ...(editId ? { id: editId } : {}),
      sku: form.sku,
      productName: form.productName,
      slug: form.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      categoryId: form.categoryId,
      brand: form.brand,
      shortDescription: form.shortDescription,
      description: form.description,
      mainImage: finalGallery[0] || form.mainImage,
      galleryImages: finalGallery,
      isHalal: form.isHalal,
      isFeatured: form.isFeatured,
      isBestSeller: form.isBestSeller,
      totalSold: Number(form.totalSold) || 0,
      status: true,
      variants: variants.map((v, i) => ({
        id: v.id || `var-${Date.now()}-${i}`,
        productId: editId || `prod-${Date.now()}`,
        variantName: v.variantName || '1kg',
        weight: Number(v.weight) || 1.0,
        price: Number(v.price) || 0,
        sku: v.sku || `${form.sku}-V${i}`,
        stock: Number(v.stock) || 0,
      })),
    });

    alert('Product saved successfully!');
    router.push('/admin/products');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      <div className="flex items-center justify-between">
        <Link href="/admin/products" className="inline-flex items-center gap-1 text-xs font-bold text-[#800020] hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Product List
        </Link>
        <h1 className="font-serif text-2xl font-bold text-stone-900">
          {editId ? 'Edit Product Specification' : 'Add New Baking Supply Item'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Basic Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs">
          <h2 className="font-serif text-lg font-bold text-[#800020] border-b border-stone-100 pb-2">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Product Name *</label>
              <input 
                type="text"
                required
                placeholder="e.g. Premium Semolina Flour Grade A"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Master SKU *</label>
              <input 
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Category *</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">Brand Name</label>
              <input 
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">Short Description</label>
            <input 
              type="text"
              placeholder="Brief summary shown on catalog cards..."
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">Full Detailed Description</label>
            <textarea
              rows={4}
              placeholder="Product origin, benefits, usage instructions..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          {/* MULTI-PHOTO GALLERY UPLOADER GRID */}
          <div className="space-y-3 pt-3 border-t border-stone-100">
            <div className="flex items-center justify-between">
              <label className="block font-bold text-[#800020] uppercase text-xs flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#D4AF37]" /> GALERI FOTO PRODUK MULTI-UPLOAD (UPLOAD BANYAK FOTO SEKALIGUS) *
              </label>
              <span className="text-[11px] font-bold text-stone-500">
                {galleryImages.length} Foto Diunggah
              </span>
            </div>

            {/* Box 1: File Uploader (Supports Multiple Files) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-4 text-center bg-stone-50 transition-colors relative flex flex-col items-center justify-center cursor-pointer group">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleMultipleFilesUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 text-[#800020] mb-1 group-hover:scale-110 transition-transform" />
                <span className="font-bold text-stone-800 block text-xs">+ Upload Banyak Foto Dari Perangkat</span>
                <span className="text-[10px] text-stone-500">Pilih sekaligus 2, 5, 10 foto. Otomatis dikompres & diproses</span>
              </div>

              {/* Box 2: Direct URL Input for Additional Photo */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 flex flex-col justify-center space-y-1.5">
                <label className="block text-[11px] font-bold text-stone-700">Tambah Link URL Foto Tambahan:</label>
                <div className="flex gap-2">
                  <input 
                    type="url"
                    id="new-product-url-input"
                    placeholder="https://images.unsplash.com/..."
                    className="flex-1 px-3 py-1.5 border border-stone-300 rounded-xl text-stone-900 text-xs focus:outline-none focus:border-[#800020]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('new-product-url-input') as HTMLInputElement;
                      if (input && input.value.trim()) {
                        setGalleryImages(prev => [...prev, input.value.trim()]);
                        input.value = '';
                      }
                    }}
                    className="px-3 py-1.5 bg-[#800020] text-white text-xs font-bold rounded-xl hover:bg-[#6F1D1B]"
                  >
                    + Tambah
                  </button>
                </div>
              </div>
            </div>

            {/* PREVIEW MULTI-IMAGE GRID SHOWCASE */}
            {galleryImages.length > 0 && (
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-stone-600 uppercase block">Pratinjau Foto Produk ({galleryImages.length} Foto):</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {galleryImages.map((imgUrl, idx) => (
                    <div key={idx} className="relative group rounded-2xl overflow-hidden border-2 border-stone-200 bg-stone-100 shadow-sm aspect-square">
                      <img src={imgUrl} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1 left-1 bg-[#800020] text-[#D4AF37] text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow">
                          FOTO UTAMA
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveGalleryImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all shadow"
                        title="Hapus foto ini"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, mainImage: imgUrl }))}
                        className="absolute bottom-1 left-1 right-1 py-0.5 bg-black/70 hover:bg-[#800020] text-white text-[9px] font-bold text-center rounded-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                        Jadikan Utama
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
              <input 
                type="checkbox"
                checked={form.isHalal}
                onChange={(e) => setForm({ ...form, isHalal: e.target.checked })}
                className="rounded text-[#800020]"
              />
              <span>100% Halal Certified</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
              <input 
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded text-[#800020]"
              />
              <span>Mark as Featured Product</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
              <input 
                type="checkbox"
                checked={form.isBestSeller}
                onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
                className="rounded text-[#800020]"
              />
              <span>Mark as Best Seller</span>
            </label>
          </div>

        </div>

        {/* Weight Variant Builder Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-2">
            <h2 className="font-serif text-lg font-bold text-[#800020]">
              2. Packaging Weight & Size Variants
            </h2>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-stone-900 text-white text-xs font-bold rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Size Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div key={idx} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Variant Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. 1kg"
                    value={v.variantName || ''}
                    onChange={(e) => handleVariantChange(idx, 'variantName', e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Weight (KG)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={v.weight || 1.0}
                    onChange={(e) => handleVariantChange(idx, 'weight', parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">MYR Price (RM)</label>
                  <input 
                    type="number"
                    step="0.1"
                    required
                    value={v.price || 0}
                    onChange={(e) => handleVariantChange(idx, 'price', parseFloat(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs font-bold text-[#800020]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Stock Quantity</label>
                  <input 
                    type="number"
                    required
                    value={v.stock || 0}
                    onChange={(e) => handleVariantChange(idx, 'stock', parseInt(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-lg text-xs"
                  />
                </div>

                <div className="flex items-center justify-end">
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveVariant(idx)}
                      className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                      title="Remove Variant"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-8 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save Product & Variants
          </button>
        </div>

      </form>

    </div>
  );
}
