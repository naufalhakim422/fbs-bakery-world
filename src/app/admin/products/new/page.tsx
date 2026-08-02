'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ProductVariant } from '@/types';
import { compressImageFile } from '@/lib/image-compressor';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { ArrowLeft, Save, Plus, Trash2, ShieldCheck, Sparkles, Upload, X } from 'lucide-react';

function AdminNewProductContent() {
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
        }
        if (existing.variants && existing.variants.length > 0) {
          setVariants(existing.variants);
        }
      }
    }
  }, [editId]);

  const handleMultipleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImageFile(files[i]);
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
      { variantName: 'New Size', weight: 1.0, price: 20.00, stock: 50, sku: `FBS-VAR-${Math.floor(100 + Math.random() * 900)}` }
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 1) {
      alert('Product must have at least 1 packaging size variant.');
      return;
    }
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const updated = [...variants];
    updated[index] = { ...updated[index], [field]: value };
    setVariants(updated);
  };

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.productName.trim() || isSubmitting) return;
    setConfirmSaveOpen(true);
  };

  const executeSaveProduct = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    db.saveProduct({
      id: editId ? db.getProductBySlug(editId)?.id : undefined,
      ...form,
      galleryImages,
      variants: variants.map((v, idx) => ({
        id: v.id || `var-${Date.now()}-${idx}`,
        productId: editId || `prod-${Date.now()}`,
        variantName: v.variantName || 'Standard',
        weight: isNaN(Number(v.weight)) ? 1.0 : Number(v.weight),
        price: isNaN(Number(v.price)) ? 0.0 : Number(v.price),
        stock: isNaN(Number(v.stock)) ? 0 : Number(v.stock),
        sku: v.sku || `FBS-VAR-${idx}`,
      })),
    });

    setConfirmSaveOpen(false);
    router.push('/admin/products');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Link 
          href="/admin/products" 
          className="inline-flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#800020] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Product Catalog
        </Link>
        <span className="px-3 py-1 bg-[#800020]/10 text-[#800020] text-xs font-bold rounded-full">
          {editId ? 'EDIT PRODUCT MODE' : 'CREATE NEW PRODUCT'}
        </span>
      </div>

      <form onSubmit={handleSubmitProduct} className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-sm space-y-6">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900">
            {editId ? `Edit Product: ${form.productName}` : 'Add New Baking Ingredient Product'}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Fill in product specifications, multiple high-res gallery images, and packaging size variants.
          </p>
        </div>

        {/* BASIC PRODUCT INFORMATION */}
        <div className="space-y-4 text-xs">
          <h3 className="font-serif font-bold text-sm text-[#800020] border-b border-stone-200 pb-2">
            1. Basic Product Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Product Title / Name <span className="text-red-600">*</span>
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. Semolina Flour Premium Grade"
                value={form.productName}
                onChange={(e) => setForm({ ...form, productName: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Product SKU / Code
              </label>
              <input 
                type="text"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl font-mono text-stone-900"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 uppercase mb-1">
                Brand / Manufacturer
              </label>
              <input 
                type="text"
                placeholder="e.g. Anchor, Beryls, Caputo"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full px-4 py-2 border border-stone-300 rounded-xl text-stone-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Short Description (Card Subtitle) <span className="text-red-600">*</span>
            </label>
            <input 
              type="text"
              required
              placeholder="e.g. High protein durum wheat semolina flour for artisan pasta & fluffy breads."
              value={form.shortDescription}
              onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Full Specifications & Usage Guide
            </label>
            <textarea
              rows={4}
              placeholder="Detailed ingredient composition, storage instructions, and baking recipes..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-stone-300 rounded-xl text-stone-900"
            />
          </div>
        </div>

        {/* MULTIPLE IMAGE GALLERY UPLOADER */}
        <div className="space-y-4 text-xs pt-4 border-t border-stone-200">
          <h3 className="font-serif font-bold text-sm text-[#800020] border-b border-stone-200 pb-2">
            2. High-Res Image Gallery
          </h3>

          <div>
            <label className="block font-bold text-stone-700 uppercase mb-1">
              Upload Multiple Product Photos <span className="text-red-600">*</span>
            </label>

            <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-6 text-center bg-stone-50 transition-colors relative">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleMultipleImagesUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-[#800020] mx-auto mb-1" />
              <span className="font-bold text-stone-800 block text-xs">+ Upload High-Res Product Photos</span>
              <span className="text-[10px] text-stone-500">Auto-compresses images for instant loading speed</span>
            </div>

            {galleryImages.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
                {galleryImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative h-24 rounded-xl overflow-hidden border border-stone-300 group">
                    <img src={imgUrl} alt="Product Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setGalleryImages(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs shadow"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-[#800020] text-white text-[9px] font-bold rounded">
                        MAIN COVER
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PACKAGING SIZE VARIANTS */}
        <div className="space-y-4 text-xs pt-4 border-t border-stone-200">
          <div className="flex items-center justify-between border-b border-stone-200 pb-2">
            <h3 className="font-serif font-bold text-sm text-[#800020]">
              3. Packaging Size & Price Variants
            </h3>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1 bg-stone-900 hover:bg-stone-800 text-[#D4AF37] font-bold text-xs rounded-lg flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Size Variant
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, index) => (
              <div key={index} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Variant Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1kg Pack or 25kg Sack"
                    value={v.variantName}
                    onChange={(e) => handleVariantChange(index, 'variantName', e.target.value)}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={v.weight}
                    onChange={(e) => handleVariantChange(index, 'weight', Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-stone-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Price (MYR)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={v.price}
                    onChange={(e) => handleVariantChange(index, 'price', Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-[#800020] font-serif font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase">Ready Stock</label>
                  <input
                    type="number"
                    required
                    value={v.stock}
                    onChange={(e) => handleVariantChange(index, 'stock', Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-stone-900 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(index)}
                    className="p-2 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BADGES & STATUS TOGGLES */}
        <div className="pt-4 border-t border-stone-200 flex flex-wrap items-center gap-6 text-xs font-bold text-stone-700">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isHalal}
              onChange={(e) => setForm({ ...form, isHalal: e.target.checked })}
              className="rounded text-[#800020] w-4 h-4"
            />
            <span>100% Halal Certified</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isBestSeller}
              onChange={(e) => setForm({ ...form, isBestSeller: e.target.checked })}
              className="rounded text-[#800020] w-4 h-4"
            />
            <span>Best Seller Showcase</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
              className="rounded text-[#800020] w-4 h-4"
            />
            <span>Featured on Homepage</span>
          </label>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end gap-3 pt-4">
          <Link
            href="/admin/products"
            className="px-6 py-3 border border-stone-300 text-stone-700 font-bold text-xs rounded-xl hover:bg-stone-100"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 bg-[#800020] hover:bg-[#6F1D1B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Product & Variants'}
          </button>
        </div>

      </form>

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
    <Suspense fallback={<div className="p-8 text-center text-stone-500">Loading editor...</div>}>
      <AdminNewProductContent />
    </Suspense>
  );
}
