"use client";
import { useState } from 'react';
import { DollarSign, Package, Settings, Bell } from 'lucide-react';

/**
 * اضافه کردن این خط باعث می‌شود نکس‌جی‌اس در زمان Build گیر ندهد 
 * و رندر صفحه را به زمان اجرا (وقتی کاربر وارد می‌شود) موکول کند.
 */
export const dynamic = 'force-dynamic';

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { title: "Account Balance", val: "$0", icon: DollarSign },
          { title: "Total Orders", val: "0", icon: Package },
          { title: "Active Services", val: "0", icon: Settings },
          { title: "Announcements", val: "Welcome", icon: Bell },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs uppercase">{stat.title}</p>
              <h3 className="font-bold text-lg text-slate-700">{stat.val}</h3>
            </div>
            <stat.icon className="text-emerald-500 opacity-50" />
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Category Icons */}
        <div className="col-span-1 lg:col-span-3 grid grid-cols-2 gap-3">
          {['Instagram', 'TikTok', 'Youtube', 'Facebook', 'Spotify', 'Twitch'].map((social) => (
            <button key={social} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-emerald-200 transition text-center">
              <div className="w-10 h-10 bg-slate-100 rounded-full mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">{social}</p>
            </button>
          ))}
        </div>

        {/* Center: New Order Form */}
        <div className="col-span-1 lg:col-span-5 bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6 uppercase">New Order</h2>
          <div className="space-y-4">
            <input placeholder="Search services..." className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
            <select className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none">
              <option>Instagram Followers - Quality</option>
            </select>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Quantity" className="p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
              <input placeholder="Link" className="p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500" />
            </div>
            <button className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold hover:bg-emerald-700 transition shadow-lg shadow-emerald-200">
              PLACE ORDER
            </button>
          </div>
        </div>

        {/* Right: Branding/Banner */}
        <div className="col-span-1 lg:col-span-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
          <div className="w-40 h-40 border-4 border-slate-100 rounded-full mb-6 flex items-center justify-center bg-slate-50">
             <span className="text-4xl font-black text-emerald-500">2X</span>
          </div>
          <h3 className="font-bold text-slate-800 text-center px-4 leading-relaxed uppercase tracking-tight">
            Elevate your reach, effortlessly
          </h3>
        </div>
      </div>
    </div>
  );
}