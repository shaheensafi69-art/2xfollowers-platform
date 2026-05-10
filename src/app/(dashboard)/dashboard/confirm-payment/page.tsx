"use client";
import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, ArrowLeft, Info, RefreshCw } from 'lucide-react';

function ConfirmPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const amountUSD = parseFloat(searchParams.get('amount') || "0");
  const serviceName = searchParams.get('serviceName');
  
  // نرخ ارز پیش‌فرض (مثلاً هر دلار ۸۵ افغانی - می‌توانید این را داینامیک کنید)
  const exchangeRate = 85; 
  const amountAFN = (amountUSD * exchangeRate).toLocaleString();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-8 border border-slate-100 text-center space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 italic tracking-tighter">
            <span className="text-emerald-600">HESAB</span>PAY PAYMENT
          </h1>
          <p className="text-slate-500 text-[10px] font-black mt-1 uppercase tracking-[0.3em]">Scan to Pay via App</p>
        </div>

        {/* QR Code Container */}
        <div className="relative aspect-square w-full bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-emerald-500/10 p-4 shadow-inner">
          <Image 
            src="/hesabpay.jpg" 
            alt="HesabPay QR Code" 
            fill 
            className="object-contain p-2"
          />
        </div>

        {/* Account Info */}
        <div className="bg-slate-900 text-white p-5 rounded-3xl shadow-lg">
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">Account Number / شماره حساب</p>
          <p className="text-2xl font-mono font-bold text-emerald-400 tracking-wider">+33753928913</p>
        </div>

        {/* Currency Conversion Display */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Total USD</p>
            <p className="text-xl font-black text-emerald-900">${amountUSD}</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
            <p className="text-[10px] font-black text-blue-600 uppercase mb-1">مبلغ به افغانی</p>
            <p className="text-xl font-black text-blue-900">{amountAFN} AFN</p>
          </div>
        </div>

        {/* Important Notice - Right to Left for Persian */}
        <div className="bg-amber-50 border border-amber-100 p-5 rounded-3xl text-right" dir="rtl">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-amber-200 rounded-lg text-amber-700 mt-1">
               <Info size={16} />
            </div>
            <div className="text-sm font-bold text-amber-900 leading-relaxed">
              <p className="mb-2 underline decoration-amber-300 decoration-2 underline-offset-4">نکته بسیار مهم:</p>
              <p>لطفاً در قسمت <span className="text-emerald-700 italic">Memo</span> حساب‌پی بنویسید که این پرداخت برای کدام سرویس است تا سفارش شما سریع‌تر تایید شود.</p>
              <hr className="my-3 border-amber-200" />
              <p dir="ltr" className="text-left text-[11px] text-amber-700 italic font-medium">
                Please mention the service name in the <span className="font-bold underline">Memo</span> section of your HesabPay app before sending.
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => router.push('/dashboard/orders')}
          className="w-full bg-slate-900 hover:bg-emerald-600 text-white py-6 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
        >
          <CheckCircle2 size={24} className="group-hover:animate-bounce" /> 
          <span>I HAVE PAID / پرداخت کردم</span>
        </button>

        <button 
          onClick={() => router.back()}
          className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 mx-auto hover:text-emerald-600 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function ConfirmPaymentPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-white">
        <RefreshCw className="animate-spin text-emerald-500 mb-4" size={40} />
        <p className="font-black italic text-slate-400 uppercase tracking-widest">Loading Gateway...</p>
      </div>
    }>
      <ConfirmPaymentContent />
    </Suspense>
  );
}