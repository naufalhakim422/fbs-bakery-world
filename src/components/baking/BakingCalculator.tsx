'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

export default function BakingCalculator() {
  const [activeTab, setActiveTab] = useState<'scaling' | 'unit'>('scaling');

  const [originalServings, setOriginalServings] = useState<number>(4);
  const [targetServings, setTargetServings] = useState<number>(12);

  const sampleIngredients = [
    { name: 'Tepung Kek Prima Top Finesse', baseGrams: 250 },
    { name: 'Cokelat Callebaut 811 Dark 54.5%', baseGrams: 200 },
    { name: 'Mentega Tulen Anchor Unsalted', baseGrams: 150 },
    { name: 'Gula Kaster Halus', baseGrams: 180 },
    { name: 'Serbuk Koko Alkalis Premium', baseGrams: 30 },
  ];

  const [convertValue, setConvertValue] = useState<number>(100);
  const [fromUnit, setFromUnit] = useState<'g' | 'kg' | 'oz' | 'lb' | 'cups'>('g');

  const calculateConverted = () => {
    let grams = convertValue;
    if (fromUnit === 'kg') grams = convertValue * 1000;
    if (fromUnit === 'oz') grams = convertValue * 28.3495;
    if (fromUnit === 'lb') grams = convertValue * 453.592;
    if (fromUnit === 'cups') grams = convertValue * 125;

    return {
      grams: grams.toFixed(1),
      kg: (grams / 1000).toFixed(3),
      oz: (grams / 28.3495).toFixed(2),
      lb: (grams / 453.592).toFixed(2),
      cups: (grams / 125).toFixed(2),
    };
  };

  const converted = calculateConverted();

  return (
    <div className="bg-white border border-[#EAE3D2] rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5EFE6] pb-6">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#D97706]">
            Alat Pembantu FBS Bakery
          </span>
          <h2 className="font-heading font-extrabold text-2xl text-[#1E293B] mt-0.5">
            Kalkulator Porsi & Pengiraan Bahan Bakeri
          </h2>
          <p className="text-xs text-[#64748B] mt-1 font-light">
            Sesuaikan porsi resep, ubah unit timbangan, dan hitung keperluan bahan bakeri.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[#FDFBF7] p-1.5 rounded-2xl border border-[#EAE3D2]">
          <button
            onClick={() => setActiveTab('scaling')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'scaling'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Porsi Resep
          </button>
          <button
            onClick={() => setActiveTab('unit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'unit'
                ? 'bg-[#1E293B] text-white shadow-sm'
                : 'text-[#64748B] hover:text-[#1E293B]'
            }`}
          >
            Konversi Unit
          </button>
        </div>
      </div>

      {activeTab === 'scaling' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FDFBF7] p-5 rounded-2xl border border-[#EAE3D2]">
            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Porsi Asli Resep
              </label>
              <input
                type="number"
                min={1}
                value={originalServings}
                onChange={(e) => setOriginalServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white border border-[#E2D9C8] rounded-xl px-4 py-2 text-xs font-bold text-[#1E293B]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">
                Sasaran Porsi Dihajatkan
              </label>
              <input
                type="number"
                min={1}
                value={targetServings}
                onChange={(e) => setTargetServings(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-white border border-[#E2D9C8] rounded-xl px-4 py-2 text-xs font-bold text-[#1E293B]"
              />
            </div>
          </div>

          <div className="space-y-2">
            {sampleIngredients.map((item, idx) => {
              const scaledGrams = ((item.baseGrams * targetServings) / originalServings).toFixed(1);
              return (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-[#EAE3D2] bg-white flex items-center justify-between gap-4 text-xs"
                >
                  <span className="font-semibold text-[#1E293B]">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[#94A3B8] line-through">{item.baseGrams}g</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#C86D51]" />
                    <span className="font-bold text-[#C86D51] text-sm">{scaledGrams}g</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'unit' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FDFBF7] p-5 rounded-2xl border border-[#EAE3D2]">
            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">Kuantiti Asal</label>
              <input
                type="number"
                value={convertValue}
                onChange={(e) => setConvertValue(parseFloat(e.target.value) || 0)}
                className="w-full bg-white border border-[#E2D9C8] rounded-xl px-4 py-2 text-xs font-bold text-[#1E293B]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#1E293B] block mb-1">Dari Unit</label>
              <select
                value={fromUnit}
                onChange={(e) => setFromUnit(e.target.value as any)}
                className="w-full bg-white border border-[#E2D9C8] rounded-xl px-4 py-2 text-xs font-bold text-[#1E293B]"
              >
                <option value="g">Gram (g)</option>
                <option value="kg">Kilogram (kg)</option>
                <option value="oz">Ounces (oz)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="cups">Cawan Tepung (Cups)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EAE3D2] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Gram (g)</span>
              <h4 className="font-heading font-bold text-xl text-[#1E293B] mt-1">{converted.grams}g</h4>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EAE3D2] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Kilogram (kg)</span>
              <h4 className="font-heading font-bold text-xl text-[#1E293B] mt-1">{converted.kg}kg</h4>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EAE3D2] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Ounces (oz)</span>
              <h4 className="font-heading font-bold text-xl text-[#1E293B] mt-1">{converted.oz}oz</h4>
            </div>
            <div className="p-4 rounded-2xl bg-[#FDFBF7] border border-[#EAE3D2] text-center">
              <span className="text-[10px] font-bold text-[#64748B] uppercase">Anggaran Cups</span>
              <h4 className="font-heading font-bold text-xl text-[#C86D51] mt-1">{converted.cups} cups</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
