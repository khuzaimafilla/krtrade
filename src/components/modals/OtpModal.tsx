'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Mail, ArrowRight, RotateCw } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  email: string;
  onSuccess: () => void;
  onClose: () => void;
}

export default function OtpModal({ isOpen, email, onSuccess, onClose }: OtpModalProps) {
  const { t } = useLanguage();
  const [otp, setOtp] = useState(['9', '8', '7', '6', '5', '4']); // Pre-filled high wealth OTP code for instant demo ease
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleChange = (val: string, index: number) => {
    if (val.length > 1) val = val[val.length - 1];
    const newOtp = [...otp];
    newOtp[index] = val;
    setOtp(newOtp);

    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setErrorMsg('Kode OTP harus 6-digit!');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl p-6 sm:p-8 relative text-center my-auto">
        <div className="w-12 h-12 rounded-2xl bg-[#E6F7F0] text-[#05C46B] flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>

        <h3 className="text-xl font-bold text-[#1E2923]">
          {t('otpTitle')}
        </h3>
        <p className="text-xs text-[#6B7C72] mt-1 mb-6 flex items-center justify-center gap-1">
          <Mail className="w-3.5 h-3.5" />
          <span>Dikirim ke <strong className="text-[#1E2923]">{email || 'filla@krtrade.com'}</strong></span>
        </p>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center space-x-2 sm:space-x-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                id={`otp-input-${idx}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, idx)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-extrabold text-[#1E2923] bg-[#F8FAF9] border border-[#E4E9E6] rounded-xl focus:border-[#05C46B] focus:bg-white outline-none shadow-sm transition-all"
              />
            ))}
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-[#FF4D4D]">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={isVerifying}
            className="w-full py-3.5 bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-[#05C46B]/25 transition-all flex items-center justify-center space-x-2"
          >
            {isVerifying ? (
              <RotateCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span>{t('verifyBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs text-[#6B7C72]">
            <button
              type="button"
              onClick={() => setOtp(['1', '2', '3', '4', '5', '6'])}
              className="text-[#05C46B] font-bold hover:underline"
            >
              {t('resendOtp')}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hover:underline font-semibold"
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
