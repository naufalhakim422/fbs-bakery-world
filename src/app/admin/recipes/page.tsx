'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { Recipe } from '@/types';
import { compressImageFile } from '@/lib/image-compressor';
import { ChefHat, Clock, Plus, Trash2, Edit3, Image as ImageIcon, Video as VideoIcon, X, CheckCircle2, Upload, ExternalLink, PlayCircle, Sparkles } from 'lucide-react';

export default function AdminRecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    cookingTime: 35,
    coverImage: '',
    videoUrl: '',
    ingredientsText: '',
    instructionsText: '',
  });

  const [recipeGallery, setRecipeGallery] = useState<string[]>([]);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [videoPreview, setVideoPreview] = useState<string>('');

  useEffect(() => {
    setRecipes(db.getRecipes());
  }, []);

  const handleMultipleRecipeImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
      setRecipeGallery(prev => [...prev, ...list]);
      if (!form.coverImage) {
        setForm(prev => ({ ...prev, coverImage: list[0] }));
        setCoverPreview(list[0]);
      }
    }
  };

  const openCreateModal = () => {
    setEditingRecipe(null);
    setForm({
      title: '',
      slug: '',
      description: '',
      difficulty: 'Medium',
      cookingTime: 35,
      coverImage: '',
      videoUrl: '',
      ingredientsText: '200g Premium Flour\n100g Anchor Butter\n150g Belgian Chocolate Chips\n2 Eggs',
      instructionsText: 'Preheat oven to 180°C.\nMix butter and sugar until fluffy.\nFold flour and chocolate chips.\nBake for 25 minutes.',
    });
    setCoverPreview('');
    setVideoPreview('');
    setIsModalOpen(true);
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setForm({
      title: recipe.title,
      slug: recipe.slug,
      description: recipe.description,
      difficulty: recipe.difficulty,
      cookingTime: recipe.cookingTime,
      coverImage: recipe.coverImage,
      videoUrl: recipe.videoUrl || '',
      ingredientsText: recipe.ingredients.join('\n'),
      instructionsText: recipe.instructions.join('\n'),
    });
    setCoverPreview(recipe.coverImage);
    setVideoPreview(recipe.videoUrl || '');
    setIsModalOpen(true);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setCoverPreview(dataUrl);
        setForm(prev => ({ ...prev, coverImage: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setVideoPreview(dataUrl);
        setForm(prev => ({ ...prev, videoUrl: dataUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const handleSaveRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setConfirmSaveOpen(true);
  };

  const executeSaveRecipe = () => {
    const ingredientsList = form.ingredientsText
      .split('\n')
      .map(i => i.trim().replace(/^[•\-\*\d+\.\s]+/, '').trim())
      .filter(Boolean);

    const instructionsList = form.instructionsText
      .split('\n')
      .map(i => i.trim().replace(/^[•\-\*\d+\.\s]+/, '').trim())
      .filter(Boolean);

    const payload: Partial<Recipe> = {
      id: editingRecipe ? editingRecipe.id : undefined,
      title: form.title.trim(),
      slug: form.slug.trim() || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: form.description.trim(),
      difficulty: form.difficulty,
      cookingTime: Number(form.cookingTime) || 30,
      coverImage: form.coverImage || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop',
      videoUrl: form.videoUrl || '',
      ingredients: ingredientsList.length ? ingredientsList : ['100g Flour', '50g Butter'],
      instructions: instructionsList.length ? instructionsList : ['Mix ingredients well.', 'Bake for 30 minutes.'],
      relatedProductIds: ['prod-1', 'prod-3'],
    };

    db.saveRecipe(payload);
    setRecipes(db.getRecipes());
    setConfirmSaveOpen(false);
    setIsModalOpen(false);
  };

  const handleDeleteRecipe = (id: string, title: string) => {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteRecipe = () => {
    if (pendingDeleteId) {
      db.deleteRecipe(pendingDeleteId);
      setRecipes(db.getRecipes());
      setPendingDeleteId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Header with + CREATE NEW RECIPE Button */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#800020] mb-1">
            <ChefHat className="w-6 h-6" />
            <span className="text-xs font-bold uppercase tracking-widest">RECIPE & VIDEO TUTORIAL MANAGEMENT</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">Baking Recipe Center</h1>
          <p className="text-xs text-stone-500 mt-0.5">Manage step-by-step baking tutorials and upload video demonstrations.</p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold text-xs rounded-2xl shadow-lg transition-transform active:scale-95 flex items-center gap-2"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>CREATE NEW RECIPE</span>
        </button>
      </div>

      {/* Recipe Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recipes.map(recipe => (
          <div key={recipe.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4">
            
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden border border-stone-200 group">
                <img 
                  src={recipe.coverImage} 
                  alt={recipe.title} 
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                
                {recipe.videoUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-[#800020] text-[#D4AF37] text-xs font-bold rounded-full flex items-center gap-1.5 shadow-lg border border-[#D4AF37]/30">
                      <PlayCircle className="w-4 h-4 fill-[#D4AF37] text-[#800020]" /> VIDEO TUTORIAL AVAILABLE
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-md uppercase ${
                  recipe.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-800' :
                  recipe.difficulty === 'Hard' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {recipe.difficulty}
                </span>

                <span className="px-2.5 py-0.5 bg-stone-100 text-stone-700 text-xs font-bold rounded-md flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#800020]" /> {recipe.cookingTime} Mins
                </span>
              </div>

              <h3 className="font-serif font-bold text-xl text-stone-900">{recipe.title}</h3>
              <p className="text-stone-600 text-xs line-clamp-2">{recipe.description}</p>
            </div>

            <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
              <Link 
                href={`/recipes/${recipe.slug}`} 
                target="_blank" 
                className="text-xs font-bold text-[#800020] hover:underline flex items-center gap-1"
              >
                Preview Recipe <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(recipe)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit
                </button>

                <button
                  onClick={() => handleDeleteRecipe(recipe.id, recipe.title)}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* CREATE / EDIT RECIPE MODAL WITH VIDEO UPLOAD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-5 shadow-2xl border-2 border-[#800020] animate-scale-up max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-[#800020]">
                <ChefHat className="w-6 h-6" />
                <h3 className="font-serif font-bold text-lg">
                  {editingRecipe ? 'Edit Recipe & Video Tutorial' : 'Create New Recipe Tutorial'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipe} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Recipe Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fluffy Red Velvet Cupcake with Cream Cheese Frosting"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="fluffy-red-velvet"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={form.difficulty}
                    onChange={(e) => setForm({ ...form, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 font-bold bg-white"
                  >
                    <option value="Easy">Easy (Pemula)</option>
                    <option value="Medium">Medium (Sedang)</option>
                    <option value="Hard">Hard (Profesional)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    Baking Time (Mins)
                  </label>
                  <input
                    type="number"
                    value={form.cookingTime}
                    onChange={(e) => setForm({ ...form, cookingTime: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Short Summary / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Describe taste, texture, and secrets of this recipe..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-xl text-stone-900 focus:outline-none focus:border-[#800020]"
                />
              </div>

              {/* INGREDIENTS MULTILINE INPUT */}
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Ingredients List <span className="text-stone-400 font-normal">(1 Bahan Per Baris)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="250g Anchor Unsalted Butter&#10;200g Belgian Dark Chocolate 70%&#10;300g Semolina Flour&#10;4 Grade A Eggs"
                  value={form.ingredientsText}
                  onChange={(e) => setForm({ ...form, ingredientsText: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-xl text-stone-900 font-mono text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              {/* INSTRUCTIONS STEP-BY-STEP INPUT */}
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Step-by-Step Instructions <span className="text-stone-400 font-normal">(1 Langkah Per Baris)</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Preheat oven to 170°C and grease cake tin.&#10;Melt butter and chocolate in double boiler.&#10;Sift flour and mix dry ingredients.&#10;Bake for 35 minutes until golden brown."
                  value={form.instructionsText}
                  onChange={(e) => setForm({ ...form, instructionsText: e.target.value })}
                  className="w-full px-4 py-2 border border-stone-300 rounded-xl text-stone-900 font-mono text-xs focus:outline-none focus:border-[#800020]"
                />
              </div>

              {/* COVER IMAGE UPLOADER */}
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  Cover Photo Image <span className="text-stone-400 font-normal">(Upload File atau Paste URL)</span>
                </label>
                {coverPreview ? (
                  <div className="relative mb-2 rounded-2xl overflow-hidden border border-stone-200 group">
                    <img src={coverPreview} alt="Preview" className="w-full h-36 object-cover" />
                    <button
                      type="button"
                      onClick={() => { setCoverPreview(''); setForm({ ...form, coverImage: '' }); }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-3 text-center space-y-1 bg-stone-50 transition-colors">
                    <Upload className="w-6 h-6 text-stone-400 mx-auto" />
                    <div className="text-xs text-stone-600">
                      <label className="text-[#800020] font-bold cursor-pointer hover:underline">
                        <span>Pilih foto cover lokal</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Atau tempel URL foto cover..."
                  value={form.coverImage}
                  onChange={(e) => { setForm({ ...form, coverImage: e.target.value }); setCoverPreview(e.target.value); }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-[11px] mt-1"
                />
              </div>

              {/* VIDEO TUTORIAL FILE & URL UPLOADER */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <div className="flex items-center gap-2 text-[#800020] font-bold uppercase">
                  <VideoIcon className="w-4 h-4" />
                  <span>Upload Video Tutorial Baking (MP4 / WebM / URL)</span>
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
                  <div className="border-2 border-dashed border-stone-300 hover:border-[#800020] rounded-2xl p-4 text-center space-y-2 bg-white transition-colors">
                    <VideoIcon className="w-8 h-8 text-[#800020] mx-auto" />
                    <div className="text-xs text-stone-600">
                      <label className="text-[#800020] font-bold cursor-pointer hover:underline">
                        <span>Pilih file video MP4 / WebM lokal</span>
                        <input
                          type="file"
                          accept="video/*"
                          onChange={handleVideoFileChange}
                          className="hidden"
                        />
                      </label>
                      <span> atau masukkan link video tutorial di bawah</span>
                    </div>
                  </div>
                )}

                <input
                  type="text"
                  placeholder="Atau tempel link video (e.g. https://www.w3schools.com/html/mov_bbb.mp4)..."
                  value={form.videoUrl}
                  onChange={(e) => { setForm({ ...form, videoUrl: e.target.value }); setVideoPreview(e.target.value); }}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div className="pt-3 border-t border-stone-100 flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-3 bg-stone-100 text-stone-700 font-bold rounded-xl hover:bg-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> SAVE RECIPE & VIDEO
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Hapus Resep?"
        message="Resep yang dihapus tidak dapat dipulihkan. Apakah Anda yakin ingin menghapus resep ini?"
        type="danger"
        onConfirm={executeDeleteRecipe}
        onCancel={() => { setConfirmDeleteOpen(false); setPendingDeleteId(null); }}
      />

      <ConfirmModal
        isOpen={confirmSaveOpen}
        title={editingRecipe ? 'Perbarui Resep Baking?' : 'Simpan Resep Baking Baru?'}
        message={editingRecipe ? 'Apakah Anda yakin ingin menyimpan perubahan resep kue ini?' : 'Apakah Anda yakin ingin menyimpan dan mempublikasikan resep kue baru ini?'}
        type="save"
        onConfirm={executeSaveRecipe}
        onCancel={() => setConfirmSaveOpen(false)}
      />
    </div>
  );
}
