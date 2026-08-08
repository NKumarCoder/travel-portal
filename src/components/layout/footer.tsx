import Link from "next/link";
import { Compass, ShieldCheck, Headphones } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Flights", href: "/flights" },
    { label: "Hotels", href: "/hotels" },
    { label: "Buses", href: "/buses" },
    { label: "Activities", href: "/activities" },
    { label: "Packages", href: "/packages" },
    { label: "AI Planner", href: "/ai-planner" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Blog", href: "#" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Contact Us", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-slate-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 shadow-md shadow-emerald-950/50">
                <Compass className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Opti<span className="text-emerald-400">Travel</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm font-medium">
              AI-powered travel planning and ticket bookings for modern explorers. Compare and book flights, hotels, buses, and holiday packages seamlessly.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>100% Safe Payments</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Headphones className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h3 className="mb-3.5 text-xs font-extrabold uppercase tracking-wider text-white">Product</h3>
            <ul className="space-y-2.5 text-xs font-medium">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company links */}
          <div>
            <h3 className="mb-3.5 text-xs font-extrabold uppercase tracking-wider text-white">Company</h3>
            <ul className="space-y-2.5 text-xs font-medium">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="mb-3.5 text-xs font-extrabold uppercase tracking-wider text-white">Support</h3>
            <ul className="space-y-2.5 text-xs font-medium">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-slate-400 hover:text-emerald-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
          <p>© 2026 Opti Travel / TravelAI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-400 text-xs">
            <Link href="#" className="hover:text-emerald-400 transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Terms</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Cookies</Link>
            <Link href="#" className="hover:text-emerald-400 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

