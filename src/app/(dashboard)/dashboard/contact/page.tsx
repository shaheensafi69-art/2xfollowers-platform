import React from 'react';

export default function ContactPage() {
  const phoneNumber = "447476620282";
  const telegramUsername = "safipayltd";

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 bg-white">
      <div className="max-w-3xl w-full text-center">
        {/* هدر صفحه با استایل 2X Followers */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter mb-4">
            <span className="text-emerald-600">SUPPORT</span>
            <span className="text-slate-900 ml-2">CENTER</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium">
            How can we help you today? Select a platform to start chatting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* WhatsApp Card */}
          <a 
            href={`https://wa.me/${phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-10 border border-slate-100 rounded-3xl bg-slate-50 hover:bg-white hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 flex flex-col items-center"
          >
            <div className="p-5 bg-emerald-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform text-emerald-600">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.6-16.5-14.7-27.6-32.8-30.8-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">WhatsApp Chat</h3>
            <p className="text-slate-500 font-medium text-sm text-center">
              Direct message to our experts
            </p>
          </a>

          {/* Telegram Card */}
          <a 
            href={`https://t.me/${telegramUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-10 border border-slate-100 rounded-3xl bg-slate-50 hover:bg-white hover:border-blue-500 hover:shadow-2xl hover:shadow-blue-100 transition-all duration-300 flex flex-col items-center"
          >
            <div className="p-5 bg-blue-100 rounded-2xl mb-6 group-hover:scale-110 transition-transform text-blue-600">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="48" width="48" xmlns="http://www.w3.org/2000/svg">
                <path d="M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L232.8 283.5 130.9 251c-22.2-6.9-22.7-22.2 4.6-32.8l400.1-154.2c18.5-6.9 34.8 4.2 28.3 34.6z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-1">Telegram Support</h3>
            <p className="text-slate-500 font-medium text-sm text-center">
              Join our community or chat
            </p>
          </a>
        </div>

        {/* Support Note */}
        <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-emerald-50 rounded-full border border-emerald-100">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-emerald-700 text-sm font-bold">
            Average response time: <span className="text-emerald-900">15 Minutes</span>
          </p>
        </div>
      </div>
    </div>
  );
}