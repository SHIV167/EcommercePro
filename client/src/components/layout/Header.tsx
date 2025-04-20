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
    <header className="sticky top-0 z-50 bg-white">
      {/* Announcement bar */}
      <div className="bg-[#444444] py-2 text-center text-white">
        <p className="text-sm tracking-wide">
          Avail Complimentary NEW Premium Sample on every order!
        </p>
      </div>

      {/* Main header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Mobile menu button */}
          <button 
            className="lg:hidden text-primary"
            aria-label="Toggle menu"
            onClick={() => setIsMobileNavOpen(true)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Search button (mobile) */}
          <button className="lg:hidden text-primary" aria-label="Search">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          
          {/* Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none lg:flex-1 lg:flex lg:justify-center">
            <Link href="/" className="block">
              <div className="flex flex-col items-center">
                <h1 className="text-primary font-heading text-2xl md:text-3xl font-bold">KAMA</h1>
                <p className="text-primary font-accent text-sm tracking-widest">AYURVEDA</p>
              </div>
            </Link>
          </div>
          
          {/* Desktop: Search & User actions */}
          <div className="hidden lg:flex items-center space-x-6">
            <button className="text-primary hover:text-primary-light" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            
            <Link href={isAuthenticated ? "/account" : "/login"} className="text-primary hover:text-primary-light" aria-label="My Account">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            
            <button 
              className="text-primary hover:text-primary-light relative" 
              aria-label="Shopping Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#A72B1D] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
          
          {/* Mobile: User actions */}
          <div className="flex lg:hidden items-center space-x-4">
            <Link href={isAuthenticated ? "/account" : "/login"} className="text-primary" aria-label="My Account">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <button 
              className="text-primary relative" 
              aria-label="Shopping Cart"
              onClick={() => setIsCartOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#A72B1D] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
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
                      className="nav-link text-primary text-sm font-medium hover:text-primary-light"
                    >
                      {collection.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link href="/collections/kumkumadi" className="nav-link text-primary text-sm font-medium hover:text-primary-light">Kumkumadi Collection</Link></li>
                  <li><Link href="/collections/amrepa" className="nav-link text-primary text-sm font-medium hover:text-primary-light">Amrepa Collection</Link></li>
                  <li><Link href="/collections/ujjasara" className="nav-link text-primary text-sm font-medium hover:text-primary-light">Ujjasara Collection</Link></li>
                  <li><Link href="/collections/bestsellers" className="nav-link text-primary text-sm font-medium hover:text-primary-light">Bestsellers</Link></li>
                  <li><Link href="/collections/haircare" className="nav-link text-primary text-sm font-medium hover:text-primary-light">Haircare</Link></li>
                  <li><Link href="/collections/skincare" className="nav-link text-primary text-sm font-medium hover:text-primary-light">Skincare</Link></li>
                  <li><Link href="/collections/bath-body" className="nav-link text-primary text-sm font-medium hover:text-primary-light">Bath & Body</Link></li>
                  <li><Link href="/collections/gifting" className="nav-link text-primary text-sm font-medium hover:text-primary-light">Gifting</Link></li>
                  <li><Link href="/collections/all" className="nav-link text-primary text-sm font-medium hover:text-primary-light">All Products</Link></li>
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
