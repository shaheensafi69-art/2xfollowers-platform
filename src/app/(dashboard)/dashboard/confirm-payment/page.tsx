"use client";
import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { CheckCircle2, ArrowLeft, Info, RefreshCw, Send } from 'lucide-react';

function ConfirmPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const amountUSD = parseFloat(searchParams.get('amount') || "0");
  const serviceName = searchParams.get('serviceName');
  
  // نرخ ارز روز (دلار به افغانی)
  const exchangeRate = 85; 
  const amountAFN = (amountUSD * exchangeRate).toLocaleString();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      {/* باکس اصلی با ابعاد بزرگتر برای چیدمان دو ستونه */}
      <div className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl p-6 sm:p-10 border border-slate-100 space-y-8">
        
        {/* Header */}
        <div className="text-center border-b border-slate-100 pb-6">
          <h1 className="text-3xl font-black text-slate-900 italic tracking-tighter">
            <span className="text-emerald-600">HESAB</span>PAY PAYMENT
          </h1>
          <p className="text-slate-500 text-[11px] font-black mt-1 uppercase tracking-[0.3em]">
            Complete Your Manual Order
          </p>
        </div>

        {/* چیدمان دو ستونه: چپ (کیوآرکد و شماره) | راست (متن‌ها) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-start">
          
          {/* ستون سمت چپ: کیوآرکد، شماره حساب و مبالغ (۲ ستون از ۵ ستون) */}
          <div className="md:col-span-2 space-y-4 flex flex-col">
            {/* QR Code Container */}
            <div className="relative aspect-square w-full bg-slate-50 rounded-[2.5rem] overflow-hidden border-4 border-emerald-500/10 p-4 shadow-inner">
              <Image 
                src="/hesabpay.jpg" 
                alt="HesabPay QR Code" 
                fill 
                className="object-contain p-2"
              />
            </div>

            {/* Account Info */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl text-center shadow-lg">
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
                Account Number / شماره حساب
              </p>
              <p className="text-xl font-mono font-bold text-emerald-400 tracking-wider">+33753928913</p>
            </div>

            {/* Currency Conversion Display */}
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-2xl">
                <p className="text-[10px] font-black text-emerald-600 uppercase mb-1">Total USD</p>
                <p className="text-lg font-black text-emerald-900">${amountUSD}</p>
              </div>
              <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                <p className="text-[10px] font-black text-blue-600 uppercase mb-1">مبلغ به افغانی</p>
                <p className="text-lg font-black text-blue-900">{amountAFN} AFN</p>
              </div>
            </div>
          </div>

          {/* ستون سمت راست: توضیحات فارسی و انگلیسی (۳ ستون از ۵ ستون) */}
          <div className="md:col-span-3 space-y-5">
            
            {/* پیام ثبت موفق و راهنمای فیش - بخش فارسی (راست‌چین) */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] text-right space-y-2" dir="rtl">
              <div className="flex items-center gap-2 text-emerald-600 font-black mb-1">
                <CheckCircle2 size={18} />
                <h3 className="text-base">سفارش شما با موفقیت ثبت شد!</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                برای دریافت سرویس، لطفاً مبلغ مشخص‌شده را با اسکن <span className="font-bold text-slate-800">کد QR</span> یا تایپ <span className="font-bold text-slate-800">شماره حساب</span> به اکانت ما واریز کنید. سپس رسید یا فیش پرداخت خود را به <span className="font-bold text-emerald-600">پشتیبانی واتساپ</span> ما ارسال نمایید تا سفارش شما فوراً فعال و ارائه شود.
              </p>
            </div>

            {/* Order Confirmation & Receipt Guide - English Section (Left-to-Right) */}
            <div className="bg-slate-50 border border-slate-100 p-5 rounded-[2rem] text-left space-y-2" dir="ltr">
              <div className="flex items-center gap-2 text-emerald-600 font-black mb-1">
                <CheckCircle2 size={18} />
                <h3 className="text-base">Your order has been registered!</h3>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                To receive your service, please transfer the specified amount by scanning the <span className="font-bold text-slate-800">QR Code</span> or typing the <span className="font-bold text-slate-800">Account Number</span>. Afterwards, send your transfer receipt to our <span className="font-bold text-emerald-600">WhatsApp support team</span> so we can process and deliver your service instantly.
              </p>
            </div>

            {/* Important Notice for Memo - Combined Languages */}
            <div className="bg-amber-50 border border-amber-100 p-5 rounded-[2rem] space-y-3">
              <div className="flex items-start gap-3 text-right" dir="rtl">
                <div className="p-1 bg-amber-200 rounded-lg text-amber-700 mt-1 shrink-0">
                  <Info size={16} />
                </div>
                <div className="text-xs font-bold text-amber-900 leading-relaxed">
                  <span className="underline decoration-amber-300 decoration-2 underline-offset-4 font-black block mb-1">نکته بسیار مهم برای تفکیک اردر:</span>
                  لطفاً در قسمت <span className="text-emerald-700 italic font-black">Memo</span> حساب‌پی حتماً قید کنید که این پرداخت برای کدام سرویس است.
                </div>
              </div>
              
              <hr className="border-amber-200/60" />
              
              <div className="flex items-start gap-3 text-left" dir="ltr">
                <div className="p-1 bg-amber-200 rounded-lg text-amber-700 mt-0.5 shrink-0">
                  <Info size={14} />
                </div>
                <div className="text-[11px] font-bold text-amber-800 leading-relaxed">
                  <span className="font-black block text-amber-900">Important Memo Notice:</span>
                  Please make sure to mention the service name in the <span className="underline font-black text-emerald-700">Memo</span> section of your HesabPay app before completing the transfer.
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* دکمه‌های کنترل پایین صفحه */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="order-2 sm:order-1 text-slate-400 font-bold text-xs uppercase tracking-[0.2em] flex items-center gap-2 hover:text-slate-900 transition-colors py-2"
          >
            <ArrowLeft size={14} /> Back to order
          </button>

          <button 
            onClick={() => router.push('/dashboard/orders')}
            className="order-1 sm:order-2 w-full sm:w-auto bg-slate-900 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 group"
          >
            <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
            <span>GO TO ORDERS / رفتن به سفارشات</span>
          </button>
        </div>

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