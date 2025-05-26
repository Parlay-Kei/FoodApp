import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-orange-100 text-navy py-8 mt-8 border-t border-orange-200">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-col items-start">
          <span className="text-xl font-bold flex items-center mb-1">
            <span className="mr-2">🍝</span> Megan&apos;s Munchees
          </span>
          <span className="text-green text-sm mb-2">Fresh Off the Truck. Right on Time.</span>
          <span className="text-orange-700 font-semibold text-lg mt-2">ORDER NOW!</span>
          <div className="flex flex-col gap-1 mt-2 text-sm">
            <span className="flex items-center"><span className="mr-2">📞</span> (682) 309-8186</span>
            <span className="flex items-center"><span className="mr-2">📸</span> @megboyette</span>
            <span className="flex items-center"><span className="mr-2">⚡</span> Zelle</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <nav className="flex gap-4 mb-2">
            <Link href="/" className="hover:text-primary transition">Home</Link>
            <Link href="/menu" className="hover:text-primary transition">Menu</Link>
            <Link href="/order-history" className="hover:text-primary transition">Orders</Link>
            <Link href="/contact" className="hover:text-primary transition">Contact</Link>
          </nav>
          <span className="text-xs text-navy/60">&copy; {new Date().getFullYear()} Megan&apos;s Munchees. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
} 