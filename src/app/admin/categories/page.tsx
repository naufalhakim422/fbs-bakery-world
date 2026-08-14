'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { Category, Product } from '@/types';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Edit3, 
  Image as ImageIcon, 
  X, 
  CheckCircle2, 
  Upload, 
  Search, 
  Package, 
  ArrowUpDown,
  RefreshCw,
  Eye
} from 'lucide-react';
import { compressImageFile } from '@/lib/image-compressor';

export default function AdminCategoriesPage() {
  const { t, language } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [pendingDeleteName, setPendingDeleteName] = useState<string>('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    image: '',
    sortOrder: 1,
  });

  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    setCategories(db.getCategories());
    setProducts(db.getProducts());

    // Sync with live server API
    fetch(`/api/categories?t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  const productCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      if (p.categoryId) {
        map[p.categoryId] = (map[p.categoryId] || 0) + 1;
      }
      if (p.categoryName) {
        map[p.categoryName] = (map[p.categoryName] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  const filteredCategories = useMemo(() => {
    let result = categories.filter(c => {
      const q = search.toLowerCase();
      return (c.name || '').toLowerCase().includes(q) ||
        (c.slug || '').toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q);
    });

    return result.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories, search]);

  const openCreateModal = () => {
    setEditingCategory(null);
    setForm({
      name: '',
      slug: '',
      description: '',
      image: '',
      sortOrder: categories.length + 1,
    });
    setImagePreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      sortOrder: cat.sortOrder,
    });
    setImagePreview(cat.image);
    setIsModalOpen(true);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file, 800, 800, 0.75);
        setImagePreview(compressed);
        setForm(prev => ({ ...prev, image: compressed }));
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          setImagePreview(dataUrl);
          setForm(prev => ({ ...prev, image: dataUrl }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setConfirmSaveOpen(true);
  };

  const executeSaveCategory = async () => {
    const payload: Partial<Category> = {
      id: editingCategory ? editingCategory.id : `cat-${Date.now()}`,
      name: form.name.trim(),
      slug: form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: form.description.trim(),
      image: form.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      sortOrder: Number(form.sortOrder) || 1,
    };

    try {
      db.saveCategory(payload);
      setCategories(db.getCategories());
    } catch (dbErr) {
      console.warn('LocalStorage saveCategory warning:', dbErr);
    }

    try {
      await fetch('/api/categories', {
        method: editingCategory ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (apiErr) {
      console.warn('Category API sync warning:', apiErr);
    }

    setConfirmSaveOpen(false);
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setPendingDeleteId(id);
    setPendingDeleteName(name);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteCategory = () => {
    if (pendingDeleteId) {
      db.deleteCategory(pendingDeleteId);
      setCategories(db.getCategories());
      setPendingDeleteId(null);
      setPendingDeleteName('');
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto text-stone-900 font-sans pb-12">
      
      {/* REFINED OPERATIONAL HEADER */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#800020] uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-[#800020] inline-block" />
            FBS BAKERY WORLD • CATEGORY CMS
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Kategori Bahan Baking
          </h1>
          <p className="text-stone-500 text-xs sm:text-sm mt-1">
            Kelola pengelompokan produk, urutan prioritas kategori, foto sampul, dan hierarki navigasi.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Tambah Kategori Baru
        </button>
      </div>

      {/* SEARCH & SUMMARY TOOLBAR */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <input 
            type="text"
            placeholder="Cari berdasarkan nama kategori, slug, atau deskripsi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-xl text-xs text-stone-900 focus:outline-none focus:border-[#800020]"
          />
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-3 text-xs text-stone-600">
          <span className="font-medium">
            Total Kategori: <strong className="text-stone-900 font-serif">{categories.length}</strong>
          </span>
          <span className="text-stone-300">•</span>
          <span className="font-medium">
            Total Produk Terkategori: <strong className="text-[#800020] font-serif">{products.length}</strong>
          </span>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[#800020] font-bold hover:underline flex items-center gap-1 ml-2"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* CATEGORIES WORKSTATION DATA TABLE */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        
        {filteredCategories.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-lg font-bold text-stone-800">Kategori Tidak Ditemukan</h4>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Tidak ada kategori yang cocok dengan pencarian kata kunci "{search}".
            </p>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-[#800020] text-white text-xs font-bold rounded-xl shadow transition-colors"
            >
              + Tambah Kategori Baru
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 text-stone-500 border-b border-stone-200 uppercase tracking-wider text-[10px] font-bold">
                  <th className="p-3.5 w-16 text-center">Urutan</th>
                  <th className="p-3.5">Kategori &amp; Deskripsi</th>
                  <th className="p-3.5">Slug URL</th>
                  <th className="p-3.5">Jumlah Produk</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredCategories.map((cat) => {
                  const pCount = productCountMap[cat.id] || productCountMap[cat.name] || 0;
                  return (
                    <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                      
                      {/* Sort Order */}
                      <td className="p-3.5 text-center font-mono font-bold text-[#800020]">
                        #{cat.sortOrder || 1}
                      </td>

                      {/* Image & Title */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={cat.image} 
                            alt={cat.name} 
                            className="w-11 h-11 object-cover rounded-lg border border-stone-200 flex-shrink-0 bg-stone-50" 
                          />
                          <div className="max-w-[280px]">
                            <span className="font-serif font-bold text-stone-900 text-sm block">
                              {cat.name}
                            </span>
                            <span className="text-[11px] text-stone-500 block truncate" title={cat.description}>
                              {cat.description || 'Tidak ada deskripsi rincian.'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Slug */}
                      <td className="p-3.5 font-mono font-bold text-[#800020]">
                        {cat.slug}
                      </td>

                      {/* Product Count */}
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-800 rounded-md font-bold text-[11px] border border-stone-200">
                          <Package className="w-3.5 h-3.5 text-[#800020]" />
                          {pCount} Bahan Baking
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase">
                          🟢 AKTIF
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-stone-700 hover:text-[#800020] hover:bg-stone-100 rounded-lg transition-colors"
                            title="Edit Kategori"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id, cat.name)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Kategori"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-stone-200 space-y-4">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-[#800020]">
                <Layers className="w-5 h-5" />
                <h3 className="font-serif font-extrabold text-base text-stone-900">
                  {editingCategory ? `Edit Kategori: ${editingCategory.name}` : 'Tambah Kategori Bahan Baking Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Nama Kategori <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Olahan Susu & Kejuan"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Slug URL
                  </label>
                  <input
                    type="text"
                    placeholder="olahan-susu-dan-kejuan"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Urutan Prioritas
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-stone-900 focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Deskripsi Singkat Kategori
                </label>
                <textarea
                  rows={2}
                  placeholder="Koleksi keju premium, mentega butter, dan whipping cream berkualitas tinggi..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              {/* LOCAL IMAGE FILE UPLOADER & URL FALLBACK */}
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Foto Sampul Kategori
                </label>

                {imagePreview ? (
                  <div className="relative mb-2 rounded-xl overflow-hidden border border-stone-200 group bg-stone-50">
                    <img src={imagePreview} alt="Preview Sampul" className="w-full h-32 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setForm({ ...form, image: '' }); }}
                      className="absolute top-2 right-2 p-1 bg-rose-600 text-white rounded-full hover:bg-rose-700 shadow-sm"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-xl p-4 text-center space-y-1.5 bg-stone-50/50 transition-colors">
                    <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                    <label className="text-[#800020] font-bold cursor-pointer hover:underline block text-xs">
                      <span>Unggah File Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Atau masukkan URL Foto (https://...)"
                  value={form.image}
                  onChange={(e) => { setForm({ ...form, image: e.target.value }); setImagePreview(e.target.value); }}
                  className="w-full px-3 py-1.5 border border-stone-300 rounded-xl text-stone-900 mt-2 font-mono text-[11px] focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#800020] hover:bg-[#6F1D1B] text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" /> Simpan Kategori
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* CONFIRMATION MODALS */}
      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Hapus Kategori Produk?"
        message={`Apakah Anda yakin ingin menghapus kategori "${pendingDeleteName}"? Produk yang terkait dengan kategori ini tidak akan terhapus, tetapi akan membutuhkan pengelompokan ulang.`}
        type="danger"
        onConfirm={executeDeleteCategory}
        onCancel={() => { setConfirmDeleteOpen(false); setPendingDeleteId(null); setPendingDeleteName(''); }}
      />

      <ConfirmModal
        isOpen={confirmSaveOpen}
        title={editingCategory ? 'Perbarui Kategori Produk?' : 'Simpan Kategori Produk Baru?'}
        message={editingCategory ? 'Apakah Anda yakin ingin menyimpan perubahan data kategori ini?' : 'Apakah Anda yakin ingin menambahkan kategori produk baru ini ke katalog?'}
        type="save"
        onConfirm={executeSaveCategory}
        onCancel={() => setConfirmSaveOpen(false)}
      />
    </div>
  );
}
