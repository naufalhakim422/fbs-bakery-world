'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/language-context';
import { ShieldCheck, RefreshCw, CheckCircle2, Lock, Sparkles, X, Check } from 'lucide-react';

interface BotChallengeProps {
  onVerified: (verified: boolean) => void;
}

export const BotChallenge: React.FC<BotChallengeProps> = ({ onVerified }) => {
  const { t, language } = useLanguage();
  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Human-easy addition challenge (e.g. 5 + 3)
  const [challenge, setChallenge] = useState({
    num1: 5,
    num2: 3,
    correctAnswer: 8,
    options: [6, 8, 10, 12]
  });

  const generateEasyChallenge = () => {
    const a = Math.floor(2 + Math.random() * 8);
    const b = Math.floor(1 + Math.random() * 8);
    const correct = a + b;
    
    // Generate 4 options with the correct one included
    const wrong1 = correct + 2;
    const wrong2 = Math.max(1, correct - 2);
    const wrong3 = correct + 3;
    const opts = Array.from(new Set([correct, wrong1, wrong2, wrong3])).sort(() => Math.random() - 0.5);

    setChallenge({
      num1: a,
      num2: b,
      correctAnswer: correct,
      options: opts
    });
    setSelectedOption(null);
    setErrorMsg('');
  };

  useEffect(() => {
    generateEasyChallenge();
  }, []);

  const handleCheckboxClick = () => {
    if (isVerified) return;
    setIsChecked(true);
    setIsModalOpen(true);
    generateEasyChallenge();
  };

  const handleSelectOption = (opt: number) => {
    setSelectedOption(opt);
    setErrorMsg('');

    if (opt === challenge.correctAnswer) {
      // SUCCESS! Mark verified, show green checkmark, close modal
      setIsVerified(true);
      setIsModalOpen(false);
      onVerified(true);
    } else {
      setErrorMsg(language === 'EN' ? 'Incorrect answer. Please choose the correct number or click Refresh.' : language === 'MS' ? 'Jawapan salah. Sila pilih nombor yang betul atau tekan Semula.' : 'Pilihan salah. Silakan coba pilih jawaban yang benar atau tekan Refresh Soal.');
      onVerified(false);
    }
  };

  return (
    <div className="space-y-2 my-3">
      
      {/* CAPTCHA CHECKBOX CARD WITH PROMINENT GREEN CHECKMARK */}
      <div 
        onClick={handleCheckboxClick}
        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between shadow-sm select-none ${
          isVerified
            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-md ring-2 ring-emerald-400'
            : 'bg-stone-50 border-stone-300 hover:border-[#800020] text-stone-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
            isVerified ? 'bg-emerald-600 border-emerald-600 text-white shadow' : 'bg-white border-stone-400'
          }`}>
            {isVerified ? <Check className="w-5 h-5 stroke-[3]" /> : null}
          </div>
          <div>
            <span className="font-bold text-xs flex items-center gap-1.5">
              {isVerified ? (
                <span className="text-emerald-700 font-extrabold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {language === 'EN' ? 'HUMAN VERIFIED' : language === 'MS' ? 'DISAHKAN MANUSIA' : 'TERVERIFIKASI MANUSIA'}
                </span>
              ) : (
                language === 'EN' ? 'I am not a robot (Security Check)' : language === 'MS' ? 'Saya Bukan Robot (Semakan Keselamatan)' : 'Saya Bukan Robot (Verifikasi Keamanan)'
              )}
            </span>
            <span className="text-[10px] text-stone-500 block">
              {isVerified ? (language === 'EN' ? 'Security check completed ✓ You may proceed' : language === 'MS' ? 'Semakan keselamatan selesai ✓ Anda boleh meneruskan' : 'Pemeriksaan keamanan selesai ✓ Anda dapat melanjutkan') : (language === 'EN' ? 'Click checkbox above for quick 1-sec verification' : language === 'MS' ? 'Klik kotak di atas untuk pengesahan pantas 1-saat' : 'Klik kotak di atas untuk verifikasi cepat 1-detik')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-stone-400">
          <ShieldCheck className={`w-6 h-6 ${isVerified ? 'text-emerald-600' : 'text-[#800020]'}`} />
        </div>
      </div>

      {/* EASY 1-TAP MULTIPLE CHOICE MODAL WITH REFRESH BUTTON */}
      {isModalOpen && !isVerified && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl border-2 border-[#800020] animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2 text-[#800020]">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-serif font-bold text-sm">{language === 'EN' ? 'Human Verification' : language === 'MS' ? 'Pengesahan Manusia' : 'Verifikasi Manusia'}</h3>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setIsChecked(false); }}
                className="p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <p className="text-stone-600 font-medium">
                  {language === 'EN' ? 'What is the sum of this equation?' : language === 'MS' ? 'Berapakah jumlah penambahan ini?' : 'Berapakah hasil dari pertambahan ini?'}
                </p>
                {/* PROMINENT REFRESH BUTTON FOR OTHER QUESTIONS */}
                <button
                  type="button"
                  onClick={generateEasyChallenge}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-[#800020] rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors border border-stone-200"
                  title={language === 'EN' ? 'New Question' : language === 'MS' ? 'Soal Lain' : 'Ganti Soal'}
                >
                  <RefreshCw className="w-3.5 h-3.5" /> {language === 'EN' ? 'New Question' : language === 'MS' ? 'Soal Lain' : 'Ganti Soal'}
                </button>
              </div>

              {/* EASY QUESTION BOX */}
              <div className="p-4 bg-gradient-to-r from-[#800020] to-[#5A0015] text-white rounded-2xl text-center space-y-1 shadow-md relative">
                <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-wider block">
                  {language === 'EN' ? 'SECURITY QUESTION' : language === 'MS' ? 'SOALAN KESELAMATAN' : 'SOAL KEAMANAN'}
                </span>
                <div className="font-mono text-3xl font-black tracking-widest text-white">
                  {challenge.num1} + {challenge.num2} = ?
                </div>
              </div>

              {errorMsg && (
                <div className="p-2.5 bg-red-50 text-red-700 border border-red-200 text-[11px] rounded-xl text-center font-bold">
                  {errorMsg}
                </div>
              )}

              {/* 4 MULTIPLE CHOICE BUTTONS FOR EASY 1-TAP VERIFICATION */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                {challenge.options.map((opt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className="py-3 px-4 bg-stone-100 hover:bg-[#800020] hover:text-white text-stone-900 font-mono text-xl font-bold rounded-xl border border-stone-200 shadow-sm hover:scale-105 active:scale-95 transition-all"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* REFRESH FOOTER LINK */}
            <div className="pt-3 border-t border-stone-100 text-xs flex items-center justify-between text-stone-500">
              <button
                type="button"
                onClick={generateEasyChallenge}
                className="text-[#800020] font-bold hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> {language === 'EN' ? 'Refresh Question' : language === 'MS' ? 'Tukar Soalan' : 'Ganti Soal Pertanyaan'}
              </button>

              <span className="text-[10px] text-stone-400 flex items-center gap-0.5">
                <Lock className="w-3 h-3 text-[#800020]" /> Security Check
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
