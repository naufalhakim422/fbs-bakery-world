'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { Category } from '@/types';
import { Layers, Plus, Trash2, Edit3, Image as ImageIcon, X, CheckCircle2, Upload, Sparkles } from 'lucide-react';

export default function AdminCategoriesPage() {
  const { t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

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
  }, []);

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

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImagePreview(dataUrl);
        setForm(prev => ({ ...prev, image: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    const payload: Partial<Category> = {
      id: editingCategory ? editingCategory.id : undefined,
      name: form.name.trim(),
      slug: form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: form.description.trim(),
      image: form.image || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=800&auto=format&fit=crop',
      sortOrder: Number(form.sortOrder) || 1,
    };

    db.saveCategory(payload);
    setCategories(db.getCategories());
    setIsModalOpen(false);
  };

  const handleDeleteCategory = (id: string, name: string) => {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteCategory = () => {
    if (pendingDeleteId) {
      db.deleteCategory(pendingDeleteId);
      setCategories(db.getCategories());
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header with + CREATE NEW CATEGORY Button */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#800020] mb-1">
            <Layers className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest">{t.adminNav.categories}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">{t.adminCategories.title}</h1>
          <p className="text-xs text-stone-500 mt-0.5">{t.adminCategories.subtitle}</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>{t.adminCategories.addNew}</span>
        </button>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            <div className="flex items-start gap-4">
              <img 
                src={cat.image} 
                alt={cat.name} 
                className="w-20 h-20 object-cover rounded-2xl border border-stone-200 flex-shrink-0 shadow-sm" 
              />
              <div className="space-y-1">
                <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-md uppercase">
                  Sort #{cat.sortOrder}
                </span>
                <h3 className="font-serif font-bold text-base text-stone-900">{cat.name}</h3>
                <p className="text-stone-500 text-xs line-clamp-2">{cat.description}</p>
                <span className="text-[10px] font-mono text-stone-400 block">{t.adminCategories.slugLabel}: {cat.slug}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2 text-xs">
              <button
                onClick={() => openEditModal(cat)}
                className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" /> {t.common.edit}
              </button>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> {t.common.delete}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE / EDIT CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-[#800020] animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-[#800020]">
                <Layers className="w-6 h-6" />
                <h3 className="font-serif font-bold text-lg">
                  {editingCategory ? t.adminCategories.editBtn : t.adminCategories.addNew}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminCategories.nameLabel} <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dairy & Cheese Supplies"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {t.adminCategories.slugLabel}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. dairy-and-cheese"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminCategories.descLabel}
                </label>
                <textarea
                  rows={2}
                  placeholder="..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              {/* LOCAL IMAGE FILE UPLOADER & DRAG-AND-DROP */}
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminCategories.imageLabel}
                </label>

                {imagePreview ? (
                  <div className="relative mb-2 rounded-2xl overflow-hidden border border-stone-200 group">
                    <img src={imagePreview} alt="Preview" className="w-full h-40 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImagePreview(''); setForm({ ...form, image: '' }); }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-4 text-center space-y-2 bg-stone-50 transition-colors">
                    <Upload className="w-8 h-8 text-stone-400 mx-auto" />
                    <div className="text-xs text-stone-600">
                      <label className="text-[#800020] font-bold cursor-pointer hover:underline">
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="URL..."
                  value={form.image}
                  onChange={(e) => { setForm({ ...form, image: e.target.value }); setImagePreview(e.target.value); }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 mt-2 font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200"
                >
                  {t.adminCategories.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> {t.adminCategories.saveBtn}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Hapus Kategori?"
        message="Kategori yang dihapus tidak dapat dipulihkan. Apakah Anda yakin ingin menghapus kategori ini?"
        type="danger"
        onConfirm={executeDeleteCategory}
        onCancel={() => { setConfirmDeleteOpen(false); setPendingDeleteId(null); }}
      />
    </div>
  );
}
