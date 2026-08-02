'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { useLanguage } from '@/lib/language-context';
import { ConfirmModal } from '@/components/admin/confirm-modal';
import { Voucher } from '@/types';
import { Tag, Plus, Sparkles, Trash2, Edit, CheckCircle2, X, Eye, EyeOff, Award, ShieldCheck, Percent, DollarSign } from 'lucide-react';

export default function AdminVouchersPage() {
  const { t } = useLanguage();
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [form, setForm] = useState({
    code: '',
    title: '',
    discountType: 'PERCENT' as 'PERCENT' | 'FIXED',
    discountValue: 10,
    minSpend: 50,
    targetTier: 'ALL' as 'ALL' | 'RETAIL' | 'VIP' | 'WHOLESALE',
    status: true,
    expiryDate: '2026-12-31',
  });

  useEffect(() => {
    setVouchers(db.getVouchers());
  }, []);

  const openCreateModal = () => {
    setEditingVoucher(null);
    setForm({
      code: '',
      title: '',
      discountType: 'PERCENT',
      discountValue: 10,
      minSpend: 50,
      targetTier: 'ALL',
      status: true,
      expiryDate: '2026-12-31',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (v: Voucher) => {
    setEditingVoucher(v);
    setForm({
      code: v.code,
      title: v.title,
      discountType: v.discountType,
      discountValue: v.discountValue,
      minSpend: v.minSpend,
      targetTier: v.targetTier,
      status: v.status,
      expiryDate: v.expiryDate || '2026-12-31',
    });
    setIsModalOpen(true);
  };

  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmSaveOpen(true);
  };

  const executeSaveVoucher = () => {
    let sanitizedDiscount = form.discountValue;
    if (form.discountType === 'PERCENT') {
      sanitizedDiscount = Math.min(100, Math.max(1, form.discountValue));
    } else if (form.discountType === 'FIXED') {
      sanitizedDiscount = Math.min(form.minSpend, Math.max(0, form.discountValue));
    }

    db.saveVoucher({
      id: editingVoucher?.id,
      ...form,
      discountValue: sanitizedDiscount,
    });
    setVouchers(db.getVouchers());
    setConfirmSaveOpen(false);
    setIsModalOpen(false);
  };

  const handleDeleteVoucher = (id: string) => {
    setPendingDeleteId(id);
    setConfirmDeleteOpen(true);
  };

  const executeDeleteVoucher = () => {
    if (pendingDeleteId) {
      db.deleteVoucher(pendingDeleteId);
      setVouchers(db.getVouchers());
      setPendingDeleteId(null);
    }
  };

  const handleToggleStatus = (id: string) => {
    db.toggleVoucherStatus(id);
    setVouchers(db.getVouchers());
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Top Header Bar */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Tag className="w-6 h-6 text-[#800020]" /> {t.adminVouchers.title}
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            {t.adminVouchers.subtitle}
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-3 bg-[#800020] hover:bg-[#6F1D1B] text-[#D4AF37] font-serif font-bold text-xs rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 border border-[#D4AF37]/40 flex-shrink-0"
        >
          <div className="w-6 h-6 rounded-full bg-[#D4AF37] text-[#800020] flex items-center justify-center font-bold text-base">
            +
          </div>
          <span>{t.adminVouchers.addNew}</span>
        </button>
      </div>

      {/* Vouchers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vouchers.length === 0 ? (
          <div className="col-span-3 bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <Tag className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-stone-800">{t.adminVouchers.noVouchers}</h3>
          </div>
        ) : (
          vouchers.map(v => (
            <div key={v.id} className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-sm space-y-4 flex flex-col justify-between relative overflow-hidden">
              
              <div className="space-y-3">
                {/* Header Row: Tier Badge & Code */}
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-1 text-[10px] font-black rounded-full uppercase flex items-center gap-1 ${
                    v.targetTier === 'VIP'
                      ? 'bg-[#800020] text-[#D4AF37]'
                      : v.targetTier === 'WHOLESALE'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    <Sparkles className="w-3 h-3" /> {v.targetTier === 'ALL' ? 'ALL CUSTOMERS' : `${v.targetTier} ONLY`}
                  </span>

                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    v.status ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                  }`}>
                    {v.status ? t.adminVouchers.statusActive : t.adminVouchers.statusInactive}
                  </span>
                </div>

                <div>
                  <div className="font-mono text-xl font-black text-[#800020] tracking-wider border-2 border-dashed border-[#800020]/30 px-3 py-1.5 rounded-xl bg-[#FFF8F0] inline-block mb-1">
                    {v.code}
                  </div>
                  <h3 className="font-serif font-bold text-base text-stone-900">{v.title}</h3>
                </div>

                <div className="space-y-1 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span className="text-stone-400">{t.adminVouchers.thDiscount}:</span>
                    <strong className="text-stone-900">
                      {v.discountType === 'PERCENT' ? `${v.discountValue}% OFF` : `RM ${v.discountValue}.00 OFF`}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">{t.adminVouchers.minSpend}:</span>
                    <strong className="text-stone-900">RM {v.minSpend}.00</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-400">Expiry Date:</span>
                    <strong className="text-stone-700">{v.expiryDate || 'No Expiry'}</strong>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(v)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> {t.common.edit}
                </button>

                <button
                  onClick={() => handleToggleStatus(v.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                    v.status ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
                  }`}
                >
                  {v.status ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {v.status ? 'Disable' : 'Enable'}
                </button>

                <button
                  onClick={() => handleDeleteVoucher(v.id)}
                  className="px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> {t.common.delete}
                </button>
              </div>

            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT VOUCHER MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-stone-200 animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h2 className="font-serif text-xl font-bold text-[#800020] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#D4AF37]" /> {editingVoucher ? t.adminVouchers.edit : t.adminVouchers.addNew}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-800">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSaveVoucher} className="space-y-4 text-xs">
              
              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminVouchers.voucherCode} <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. VIPBAKER20"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-mono text-sm font-black text-[#800020] focus:outline-none focus:border-[#800020] uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">
                  {t.adminVouchers.voucherTitle} <span className="text-red-600">*</span>
                </label>
                <input 
                  type="text"
                  required
                  placeholder="..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-stone-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">{t.adminVouchers.discountType}</label>
                  <select
                    value={form.discountType}
                    onChange={(e) => setForm({ ...form, discountType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  >
                    <option value="PERCENT">Percentage (%) OFF</option>
                    <option value="FIXED">Fixed Amount (RM) OFF</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">
                    {t.adminVouchers.discountValue} <span className="text-red-600">*</span>
                  </label>
                  <input 
                    type="number"
                    required
                    min="1"
                    value={form.discountValue}
                    onChange={(e) => setForm({ ...form, discountValue: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900 font-bold text-[#800020]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">{t.adminVouchers.minSpend}</label>
                  <input 
                    type="number"
                    required
                    min="0"
                    value={form.minSpend}
                    onChange={(e) => setForm({ ...form, minSpend: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 uppercase mb-1">Target Member Tier</label>
                  <select
                    value={form.targetTier}
                    onChange={(e) => setForm({ ...form, targetTier: e.target.value as any })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-stone-900 font-bold"
                  >
                    <option value="ALL">All Customers</option>
                    <option value="RETAIL">Retail Members Only</option>
                    <option value="VIP">VIP Members Only ⭐</option>
                    <option value="WHOLESALE">Wholesale B2B Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-700 uppercase mb-1">Expiry Date</label>
                <input 
                  type="date"
                  value={form.expiryDate}
                  onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
                  className="w-full px-3.5 py-2 border border-stone-300 rounded-xl text-stone-900 font-mono"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-800">
                  <input 
                    type="checkbox"
                    checked={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.checked })}
                    className="rounded text-[#800020] w-4 h-4"
                  />
                  <span>Publish</span>
                </label>
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
                  <CheckCircle2 className="w-4 h-4" /> {t.adminVouchers.saveBtn}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmDeleteOpen}
        title="Hapus Voucher?"
        message="Voucher yang dihapus tidak dapat dipulihkan. Apakah Anda yakin ingin menghapus voucher ini?"
        type="danger"
        onConfirm={executeDeleteVoucher}
        onCancel={() => { setConfirmDeleteOpen(false); setPendingDeleteId(null); }}
      />

      <ConfirmModal
        isOpen={confirmSaveOpen}
        title={editingVoucher ? 'Perbarui Voucher Diskon?' : 'Simpan Voucher Diskon Baru?'}
        message={editingVoucher ? 'Apakah Anda yakin ingin menyimpan perubahan voucher diskon ini?' : 'Apakah Anda yakin ingin membuat dan mengaktifkan voucher diskon baru ini?'}
        type="save"
        onConfirm={executeSaveVoucher}
        onCancel={() => setConfirmSaveOpen(false)}
      />
    </div>
  );
}
