import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
        <div>
          <div className="text-2xl font-black italic tracking-tighter mb-4">
            <span className="text-emerald-600">2X</span> FOLLOWERS
          </div>
          <p className="text-slate-500 font-medium text-sm leading-relaxed">
            Leading SMM solutions for elite growth. Accelerate your social presence with the most reliable panel globally.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Quick Links</h4>
          <div className="flex flex-col gap-3 text-sm font-bold text-slate-500">
            <Link href="/services" className="hover:text-emerald-600">Services</Link>
            <Link href="/terms" className="hover:text-emerald-600">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-emerald-600">Privacy Policy</Link>
          </div>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 mb-6 uppercase tracking-widest text-xs">Company</h4>
          <p className="text-sm font-bold text-slate-500">  </p>
          <p className="text-xs text-slate-400 mt-2">  </p>
        </div>
      </div>
      <div className="text-center border-t border-slate-50 pt-8">
        <p className="text-xs font-bold text-slate-400">© 2026 2X FOLLOWERS. All Rights Reserved.</p>
      </div>
    </footer>
  );
}