import React from 'react';

export default function ContactPage() {
  const phoneNumber = "13252024023"; 
  const facebookLink = "https://www.facebook.com/share/1JBmzcnyrz/?mibextid=wwXIfr";
  const instagramLink = "https://www.instagram.com/2x_followers?igsh=MTg3MTJsczVmeW5hcQ==";

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4 sm:p-6 bg-white">
      <div className="max-w-4xl w-full text-center space-y-12">
        
        {/* هدر صفحه با استایل 2X Followers */}
        <div>
          <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4">
            <span className="text-emerald-600">SUPPORT</span>
            <span className="text-slate-900 ml-2">CENTER</span>
          </h1>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">
            Choose your preferred platform to connect with our elite support team. We are here to help you scale.
          </p>
        </div>

        {/* گرید ۴ تایی برای متدهای کانتکت */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
          
          {/* WhatsApp Card */}
          <a 
            href={`https://wa.me/${phoneNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-8 border border-slate-100 rounded-[2rem] bg-slate-50 hover:bg-white hover:border-emerald-500 hover:shadow-2xl hover:shadow-emerald-100 transition-all duration-300 flex flex-col items-center"
          >
            <div className="p-5 bg-emerald-100 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 text-emerald-600 shadow-sm">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="36" width="36" xmlns="http://www.w3.org/2000/svg">
                <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.4-8.6-44.6-27.6-16.5-14.7-27.6-32.8-30.8-38.4-3.2-5.6-.3-8.6 2.5-11.4 2.5-2.5 5.5-6.5 8.3-9.7 2.8-3.2 3.7-5.6 5.6-9.3 1.9-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.2 5.8 23.5 9.2 31.5 11.8 13.3 4.2 25.4 3.6 35 2.2 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">WhatsApp Support</h3>
            <p className="text-slate-400 font-bold text-xs text-center">Chat with our experts instantly</p>
          </a>

          {/* Direct Call Card */}
          <a 
            href={`tel:+${phoneNumber}`}
            className="group p-8 border border-slate-100 rounded-[2rem] bg-slate-50 hover:bg-white hover:border-slate-800 hover:shadow-2xl hover:shadow-slate-100 transition-all duration-300 flex flex-col items-center"
          >
            <div className="p-5 bg-slate-200 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300 text-slate-800 shadow-sm">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="36" width="36" xmlns="http://www.w3.org/2000/svg">
                <path d="M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6 1.3L24.29 23A24 24 0 0 0 4 46.5C4 302.38 209.62 508 465.5 508a24 24 0 0 0 23.5-20.3l21.6-98.3a24 24 0 0 0-13.21-27.6z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Direct Call</h3>
            <p className="text-slate-400 font-bold text-xs text-center">Call our hotline phone network</p>
          </a>

          {/* Facebook Card */}
          <a 
            href={facebookLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-8 border border-slate-100 rounded-[2rem] bg-slate-50 hover:bg-white hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-50 transition-all duration-300 flex flex-col items-center"
          >
            <div className="p-5 bg-blue-50 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 text-blue-600 shadow-sm">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 320 512" height="36" width="36" xmlns="http://www.w3.org/2000/svg">
                <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Facebook Page</h3>
            <p className="text-slate-400 font-bold text-xs text-center">Follow us or text via Messenger</p>
          </a>

          {/* Instagram Card */}
          <a 
            href={instagramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-8 border border-slate-100 rounded-[2rem] bg-slate-50 hover:bg-white hover:border-pink-600 hover:shadow-2xl hover:shadow-pink-50 transition-all duration-300 flex flex-col items-center"
          >
            <div className="p-5 bg-pink-50 rounded-2xl mb-4 group-hover:scale-110 group-hover:bg-gradient-to-tr group-hover:from-yellow-500 group-hover:via-pink-500 group-hover:to-purple-600 group-hover:text-white transition-all duration-300 text-pink-600 shadow-sm">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="36" width="36" xmlns="http://www.w3.org/2000/svg">
                <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
              </svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-1">Instagram</h3>
            <p className="text-slate-400 font-bold text-xs text-center">DM us or check our recent updates</p>
          </a>

        </div>

        {/* Support Note */}
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-50 rounded-full border border-emerald-100 shadow-sm">
          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
          <p className="text-emerald-700 text-sm font-bold">
            Average response time: <span className="text-emerald-900 ml-1">Under 15 Minutes</span>
          </p>
        </div>
        
      </div>
    </div>
  );
}