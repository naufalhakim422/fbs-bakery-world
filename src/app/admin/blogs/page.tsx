'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { Blog } from '@/types';
import { compressImageFile } from '@/lib/image-compressor';
import { BookOpen, User, Calendar, Plus, Upload, Trash2, Edit, CheckCircle2, X, Video as VideoIcon, PlayCircle, Sparkles } from 'lucide-react';

export default function AdminBlogsPage() {
  const { t } = useLanguage();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: 'Chef Ahmad, FBS Master Baker',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
    videoUrl: '',
  });

  const [blogGallery, setBlogGallery] = useState<string[]>([]);
  const [videoPreview, setVideoPreview] = useState<string>('');

  useEffect(() => {
    setBlogs(db.getBlogs());
  }, []);

  const handleMultipleBlogImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const list: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const compressed = await compressImageFile(files[i]);
        list.push(compressed);
      } catch (err) {}
    }

    if (list.length > 0) {
      setBlogGallery(prev => [...prev, ...list]);
      if (!form.image || form.image.includes('unsplash')) {
        setForm(prev => ({ ...prev, image: list[0] }));
      }
    }
  };

  const handleVideoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const dataUrl = reader.result as string;
          setVideoPreview(dataUrl);
          setForm(prev => ({ ...prev, videoUrl: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingBlog(null);
    setForm({
      title: '',
      excerpt: '',
      content: '',
      author: 'Chef Ahmad, FBS Master Baker',
      image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?q=80&w=800&auto=format&fit=crop',
      videoUrl: '',
    });
    setVideoPreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Blog) => {
    setEditingBlog(b);
    setForm({
      title: b.title,
      excerpt: b.excerpt,
      content: b.content,
      author: b.author,
      image: b.image,
      videoUrl: b.videoUrl || '',
    });
    setVideoPreview(b.videoUrl || '');
    setBlogGallery(b.galleryImages || []);
    setIsModalOpen(true);
  };

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const handleSaveBlog = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSaveOpen(true);
  };

  const executeSaveBlog = () => {
    db.saveBlog({
      id: editingBlog?.id,
      ...form,
      galleryImages: blogGallery,
    });
    setBlogs(db.getBlogs());
    setConfirmSaveOpen(false);
    setIsModalOpen(false);
  };

  const handleDeleteBlog = (id: string) => {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteBlog = () => {
    if (pendingDeleteId) {
      db.deleteBlog(pendingDeleteId);
      setBlogs(db.getBlogs());
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header with Prominent + CREATE NEW ARTICLE Button */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#800020]" /> {t.adminBlogs.title}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.adminBlogs.subtitle}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-serif font-bold text-xs rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-[#D4AF37]/40 flex-shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#800020] flex items-center justify-center font-bold text-base">
            +
          </div>
          <span>{t.adminBlogs.createNew}</span>
        </button>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-2 bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <BookOpen className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-800">{t.adminBlogs.noBlogs}</h3>
          </div>
        ) : (
          blogs.map(blog => (
            <div key={blog.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-3 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="space-y-3">
                <div className="relative h-48 rounded-2xl overflow-hidden border border-stone-200 group">
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  
                  {blog.videoUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="px-3 py-1.5 bg-[#800020] text-[#D4AF37] text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg border border-[#D4AF37]/30">
                        <PlayCircle className="w-4 h-4 fill-[#D4AF37] text-[#800020]" /> VIDEO DEMO ATTACHED
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span className="flex items-center gap-1 font-medium">
                    <User className="w-3.5 h-3.5 text-[#800020]" /> {blog.author}
                  </span>
                  <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <h3 className="font-serif font-bold text-xl text-stone-900 leading-snug">{blog.title}</h3>
                <p className="text-stone-600 text-xs line-clamp-3 leading-relaxed">{blog.excerpt}</p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <Link href={`/blog/${blog.slug}`} target="_blank" className="text-xs font-bold text-[#800020] hover:underline">
                  {t.common.readArticle} →
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(blog)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> {t.common.edit}
                  </button>
                  <button
                    onClick={() => handleDeleteBlog(blog.id)}
                    className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {t.common.delete}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT ARTICLE MODAL FORM WITH VIDEO UPLOAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif text-xl font-bold text-[#800020] flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#D4AF37]" /> {editingBlog ? t.adminBlogs.edit : t.adminBlogs.createNew}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveBlog} className="space-y-4 text-xs">
              
              {/* FILE UPLOAD BOX FOR COVER IMAGE */}
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">
                  {t.adminBlogs.blogImage} <span className="text-red-600">*</span>
                </label>

                <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-4 text-center bg-stone-50 transition-colors relative">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultipleBlogImagesUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#800020] mx-auto mb-1" />
                  <span className="font-bold text-stone-800 block text-xs">+ {t.common.upload}</span>
                </div>

                {blogGallery.length > 0 && (
                  <div className="mt-3 grid grid-cols-4 gap-2">
                    {blogGallery.map((imgUrl, idx) => (
                      <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-stone-300 group">
                        <img src={imgUrl} alt="Article Preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setBlogGallery(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full text-xs shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* VIDEO TUTORIAL UPLOADER FOR BLOG */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-[#800020] font-bold uppercase">
                  <VideoIcon className="w-4 h-4" />
                  <span>{t.adminBlogs.blogVideoUrl}</span>
                </div>

                {videoPreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-300 bg-black">
                    <video src={videoPreview} controls className="w-full max-h-48 object-contain" />
                    <button
                      type="button"
                      onClick={() => { setVideoPreview(''); setForm({ ...form, videoUrl: '' }); }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-3 text-center space-y-1 bg-white transition-colors">
                    <VideoIcon className="w-6 h-6 text-[#800020] mx-auto" />
                    <div className="text-xs text-stone-600">
                      <label className="text-[#800020] font-bold cursor-pointer hover:underline">
                        <span>Upload MP4 / WebM</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="URL (e.g. https://...)"
                  value={form.videoUrl}
                  onChange={(e) => { setForm({ ...form, videoUrl: e.target.value }); setVideoPreview(e.target.value); }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminBlogs.blogTitle} <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. 5 Secrets to Sifting Flour"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold text-sm focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminDashboard.customer}
                </label>
                <input 
                  type="text"
                  required
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminBlogs.blogExcerpt} <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="..."
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminBlogs.blogContent} <span className="text-red-600">*</span>
                </label>
                <textarea
                  rows={6}
                  required
                  placeholder="..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-sans"
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/2 py-3 bg-stone-100 text-stone-700 font-bold text-xs rounded-xl"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> {t.common.save}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Hapus Artikel Blog?"
        message="Artikel blog yang dihapus tidak dapat dipulihkan. Apakah Anda yakin?"
        type="danger"
        onConfirm={executeDeleteBlog}
        onCancel={() => { setConfirmDeleteOpen(false); setPendingDeleteId(null); }}
      />

      <ConfirmModal
        isOpen={confirmSaveOpen}
        title={editingBlog ? 'Perbarui Artikel Blog?' : 'Publikasikan Artikel Blog Baru?'}
        message={editingBlog ? 'Apakah Anda yakin ingin menyimpan perubahan artikel blog ini?' : 'Apakah Anda yakin ingin menyimpan dan mempublikasikan artikel blog baru ini?'}
        type="save"
        onConfirm={executeSaveBlog}
        onCancel={() => setConfirmSaveOpen(false)}
      />
    </div>
  );
}
