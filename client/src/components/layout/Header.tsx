import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "./MobileNav";
import CartDrawer from "./CartDrawer";
import { useQuery } from "@tanstack/react-query";

export default function Header() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  
  // Get collections for navigation
  const { data: collections } = useQuery({
    queryKey: ['/api/collections'],
  });

  return (
    <header>
      {/* Announcement bar */}
      <div className="bg-neutral-darkGray py-2 text-center text-white">
        <p className="text-sm tracking-wide">
          Avail Complimentary NEW Premium Sample on every order!
        </p>
      </div>

      {/* Main header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-foreground"
            aria-label="Toggle menu"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Search button (mobile) */}
          <button className="lg:hidden text-foreground" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-0 lg:transform-none">
            <Link href="/" className="block">
              <div className="flex flex-col items-center">
                <h1 className="text-primary font-heading text-2xl md:text-3xl font-bold">KAMA</h1>
                <p className="text-primary font-accent text-sm tracking-widest">AYURVEDA</p>
              </div>
            </Link>
          </div>
          
          {/* Desktop: Search */}
          <div className="hidden lg:block">
            <button className="text-foreground" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
          
          {/* User actions */}
          <div className="flex items-center space-x-4">
            <Link href={isAuthenticated ? "/account" : "/login"} className="text-foreground" aria-label="My Account">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <button 
              className="text-foreground relative" 
              aria-label="Shopping Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Navigation links */}
        <nav className="hidden lg:block border-t border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <ul className="flex justify-center space-x-8">
              {collections ? (
                collections.map((collection) => (
                  <li key={collection.id}>
                    <Link 
                      href={`/collections/${collection.slug}`}
                      className="nav-link text-foreground text-sm font-medium hover:text-primary"
                    >
                      {collection.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/collections/kumkumadi" className="nav-link text-foreground text-sm font-medium hover:text-primary">Kumkumadi Collection</Link></li>
                  <li><Link href="/collections/amrrepa" className="nav-link text-foreground text-sm font-medium hover:text-primary">Amrrepa Collection</Link></li>
                  <li><Link href="/collections/ujjasara" className="nav-link text-foreground text-sm font-medium hover:text-primary">Ujjasara Collection</Link></li>
                  <li><Link href="/collections/bestsellers" className="nav-link text-foreground text-sm font-medium hover:text-primary">Bestsellers</Link></li>
                  <li><Link href="/collections/haircare" className="nav-link text-foreground text-sm font-medium hover:text-primary">Haircare</Link></li>
                  <li><Link href="/collections/skincare" className="nav-link text-foreground text-sm font-medium hover:text-primary">Skincare</Link></li>
                  <li><Link href="/collections/bath-body" className="nav-link text-foreground text-sm font-medium hover:text-primary">Bath & Body</Link></li>
                  <li><Link href="/collections/gifting" className="nav-link text-foreground text-sm font-medium hover:text-primary">Gifting</Link></li>
                  <li><Link href="/collections/all" className="nav-link text-foreground text-sm font-medium hover:text-primary">All Products</Link></li>
                </>
              )}
            </ul>
          </div>
        </nav>
      </div>

      {/* Mobile Nav Drawer */}
      <MobileNav 
        isOpen={isMobileNavOpen} 
        onClose={() => setIsMobileNavOpen(false)} 
        collections={collections || []}
      />

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </header>
  );
}
