'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { VideoPost } from '@/types';
import { compressImageFile } from '@/lib/image-compressor';
import { Video as VideoIcon, Plus, Upload, Trash2, Edit, CheckCircle2, X, PlayCircle, Search, Film, Clock, Eye } from 'lucide-react';
import { ConfirmModal } from '@/components/admin/confirm-modal';

export default function AdminVideosPage() {
  const { language, t } = useLanguage();
  const [videos, setVideos] = useState<VideoPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoPost | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    platform: 'YOUTUBE' as 'YOUTUBE' | 'TIKTOK' | 'FBS',
    embedUrl: '',
    thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
    duration: '',
    category: '',
    status: 'PUBLISHED' as 'PUBLISHED' | 'DRAFT',
    isFeatured: false,
  });

  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');

  useEffect(() => {
    setVideos(db.getVideos());
  }, []);

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setThumbnailPreview(compressed);
        setForm(prev => ({ ...prev, thumbnail: compressed }));
      } catch (err) {
        console.error('Error compressing thumbnail:', err);
      }
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          const dataUrl = reader.result as string;
          setForm(prev => ({ ...prev, embedUrl: dataUrl }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const openCreateModal = () => {
    setEditingVideo(null);
    setForm({
      title: '',
      description: '',
      platform: 'YOUTUBE',
      embedUrl: '',
      thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop',
      duration: '05:00',
      category: 'General',
      status: 'PUBLISHED',
      isFeatured: false,
    });
    setThumbnailPreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (v: VideoPost) => {
    setEditingVideo(v);
    setForm({
      title: v.title,
      description: v.description,
      platform: v.platform,
      embedUrl: v.embedUrl,
      thumbnail: v.thumbnail,
      duration: v.duration,
      category: v.category,
      status: v.status,
      isFeatured: v.isFeatured,
    });
    setThumbnailPreview(v.thumbnail);
    setIsModalOpen(true);
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;

    db.saveVideo({
      id: editingVideo?.id,
      ...form,
    });
    setVideos(db.getVideos());
    setIsModalOpen(false);
  };

  const handleDeleteVideo = (id: string) => {
    setDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteVideo = () => {
    if (deleteId) {
      db.deleteVideo(deleteId);
      setVideos(db.getVideos());
      setDeleteId(null);
    }
  };

  const filteredVideos = videos.filter(v => 
    v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Localized Labels
  const labels = {
    title: language === 'ID' ? 'Manajemen Video' : language === 'MS' ? 'Pengurusan Video' : 'Video Management',
    subtitle: language === 'ID' ? 'Kelola video tutorial, ulasan produk, dan promosi FBS.' : language === 'MS' ? 'Urus video tutorial, ulasan produk, dan promosi FBS.' : 'Manage video tutorials, product reviews, and FBS promotions.',
    addNew: language === 'ID' ? 'Tambah Video Baru' : language === 'MS' ? 'Tambah Video Baru' : 'Add New Video',
    searchPlaceholder: language === 'ID' ? 'Cari judul video atau kategori...' : language === 'MS' ? 'Cari tajuk video atau kategori...' : 'Search video title or category...',
    noVideos: language === 'ID' ? 'Belum ada video terdaftar.' : language === 'MS' ? 'Belum ada video berdaftar.' : 'No videos registered yet.',
    thTitle: language === 'ID' ? 'Judul & Detail' : language === 'MS' ? 'Tajuk & Butiran' : 'Title & Details',
    thPlatform: language === 'ID' ? 'Platform' : language === 'MS' ? 'Platform' : 'Platform',
    thStatus: language === 'ID' ? 'Status' : language === 'MS' ? 'Status' : 'Status',
    thAction: language === 'ID' ? 'Aksi' : language === 'MS' ? 'Tindakan' : 'Action',
    formTitle: language === 'ID' ? 'Judul Video' : language === 'MS' ? 'Tajuk Video' : 'Video Title',
    formDesc: language === 'ID' ? 'Deskripsi Singkat' : language === 'MS' ? 'Keterangan Ringkas' : 'Short Description',
    formPlatform: language === 'ID' ? 'Platform Video' : language === 'MS' ? 'Platform Video' : 'Video Platform',
    formEmbedUrl: language === 'ID' ? 'URL Embed / Link Video' : language === 'MS' ? 'URL Embed / Link Video' : 'Embed URL / Video Link',
    formDuration: language === 'ID' ? 'Durasi (e.g. 10:30)' : language === 'MS' ? 'Tempoh (e.g. 10:30)' : 'Duration (e.g. 10:30)',
    formCategory: language === 'ID' ? 'Kategori' : language === 'MS' ? 'Kategori' : 'Category',
    formThumbnail: language === 'ID' ? 'Thumbnail Video' : language === 'MS' ? 'Gambar Kecil Video' : 'Video Thumbnail',
    featured: language === 'ID' ? 'Video Pilihan (Featured)' : language === 'MS' ? 'Video Pilihan (Featured)' : 'Featured Video',
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Film className="w-6 h-6 text-[#800020]" /> {labels.title}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">{labels.subtitle}</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-serif font-bold text-xs rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-[#D4AF37]/40 flex-shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#800020] flex items-center justify-center font-bold text-base">+</div>
          <span>{labels.addNew}</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <input
          type="text"
          placeholder={labels.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs text-stone-800 focus:outline-none focus:border-[#800020] shadow-sm"
        />
        <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
      </div>

      {/* Videos List */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredVideos.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-10 text-center border border-stone-200 space-y-2">
            <Film className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="font-serif text-sm font-bold text-stone-800">{labels.noVideos}</h3>
          </div>
        ) : (
          filteredVideos.map(video => (
            <div key={video.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
              
              {/* Media Thumbnail */}
              <div className="relative aspect-[4/3] bg-black group border-b border-stone-100">
                <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                  <PlayCircle className="w-8 h-8 text-white/90 drop-shadow-lg" />
                </div>
                {video.isFeatured && (
                  <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#800020] text-[#D4AF37] text-[8px] font-bold rounded-full border border-[#D4AF37]/30">
                    FEATURED
                  </span>
                )}
              </div>

              {/* Text Info */}
              <div className="p-3 flex-1 space-y-1">
                <div className="flex items-center justify-between text-[8px] font-extrabold tracking-wider text-[#800020] uppercase">
                  <span>{video.category}</span>
                  <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200 text-[8px]">{video.platform}</span>
                </div>
                <h3 className="font-serif font-bold text-xs text-stone-900 line-clamp-2 leading-tight">{video.title}</h3>
                <p className="text-stone-500 text-[10px] line-clamp-2 leading-snug">{video.description}</p>
                <div className="text-[9px] text-stone-400 font-semibold">
                  {new Date(video.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-3 py-2 border-t border-stone-100 bg-stone-50/50 flex items-center justify-between">
                <span className={`px-2 py-0.5 text-[8px] font-bold rounded-full ${
                  video.status === 'PUBLISHED' 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                    : 'bg-stone-200 text-stone-800 border border-stone-300'
                }`}>
                  {video.status}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(video)}
                    className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-bold transition-all"
                    title="Edit"
                  >
                    <Edit className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => handleDeleteVideo(video.id)}
                    className="p-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg text-xs font-bold transition-all"
                    title="Hapus"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT VIDEO MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif text-xl font-bold text-[#800020] flex items-center gap-2">
                <VideoIcon className="w-5 h-5 text-[#D4AF37]" /> 
                {editingVideo ? (language === 'ID' ? 'Edit Video' : 'Kemaskini Video') : labels.addNew}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="space-y-4 text-xs">
              
              {/* Form Row: Title & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">{labels.formTitle} *</label>
                  <input 
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">{labels.formCategory} *</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Croissant, Cake, General"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                  />
                </div>
              </div>

              {/* Platform & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">{labels.formPlatform} *</label>
                  <select
                    value={form.platform}
                    onChange={(e) => setForm({ ...form, platform: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                  >
                    <option value="YOUTUBE">YouTube</option>
                    <option value="TIKTOK">TikTok</option>
                    <option value="FBS">Video Promosi / Direct Upload MP4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Status *</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold focus:outline-none focus:border-[#800020]"
                  >
                    <option value="PUBLISHED">PUBLISHED</option>
                    <option value="DRAFT">DRAFT</option>
                  </select>
                </div>
              </div>

              {/* Embed / Video Link or File Upload */}
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">{labels.formEmbedUrl} *</label>
                <div className="space-y-3">
                  <input 
                    type="text"
                    required
                    placeholder="Contoh link: https://www.youtube.com/watch?v=... atau https://vt.tiktok.com/..."
                    value={form.embedUrl.startsWith('data:video/') ? '[FILE VIDEO MP4 TER-UPLOAD]' : form.embedUrl}
                    onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-mono text-[11px] focus:outline-none focus:border-[#800020]"
                  />

                  {/* Dual Upload Box: Supports File Upload directly */}
                  <div className="border-2 border-dashed border-[#800020]/40 hover:border-[#800020] rounded-2xl p-4 bg-[#FFF8F0] text-center relative transition-all group cursor-pointer">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <Upload className="w-6 h-6 text-[#800020] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-[#800020] block text-xs">
                      📁 ATAU KLIK UNTUK UPLOAD FILE VIDEO (MP4 / WEBM)
                    </span>
                    <span className="text-[10px] text-stone-500 block mt-0.5">
                      Pilih berkas video dari Laptop/HP Anda untuk langsung di-upload tanpa perlu link YouTube.
                    </span>
                  </div>

                  {form.embedUrl.startsWith('data:video/') && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-between">
                      <span>✓ File Video Berhasil Di-upload!</span>
                      <button 
                        type="button" 
                        onClick={() => setForm({ ...form, embedUrl: '' })}
                        className="text-red-600 hover:underline text-[11px]"
                      >
                        Hapus Video
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Short Description */}
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">{labels.formDesc} *</label>
                <textarea
                  rows={3}
                  required
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              {/* Thumbnail Image Uploader */}
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">{labels.formThumbnail}</label>
                <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-4 text-center bg-stone-50 transition-colors relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-[#800020] mx-auto mb-1" />
                  <span className="font-bold text-stone-800 block text-xs">+ {t.common.upload} Thumbnail</span>
                </div>
                {thumbnailPreview && (
                  <div className="mt-3 relative h-28 aspect-video rounded-xl overflow-hidden border border-stone-300 mx-auto">
                    <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setThumbnailPreview(''); setForm(prev => ({ ...prev, thumbnail: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=800&auto=format&fit=crop' })); }}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              {/* Featured Checkbox */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-700">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                    className="rounded text-[#800020] w-4 h-4"
                  />
                  <span>{labels.featured}</span>
                </label>
              </div>

              {/* Action Buttons */}
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
        title={language === 'ID' ? 'Hapus Video?' : language === 'MS' ? 'Padam Video?' : 'Delete Video?'}
        message={language === 'ID' ? 'Video yang dihapus tidak dapat dipulihkan. Apakah Anda yakin?' : language === 'MS' ? 'Video yang dipadam tidak boleh dipulihkan. Adakah anda pasti?' : 'Deleted videos cannot be recovered. Are you sure?'}
        type="danger"
        onConfirm={executeDeleteVideo}
        onCancel={() => { setConfirmDeleteOpen(false); setDeleteId(null); }}
      />
    </div>
  );
}
