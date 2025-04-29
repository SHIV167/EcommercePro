import { useState, useEffect, Fragment } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import MobileNav from "./MobileNav";
import MiniCart from "@/components/layout/MiniCart";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";
import { Transition } from '@headlessui/react';
import { apiRequest } from "@/lib/queryClient";
import SearchBar from "@/components/home/SearchBar";
import MegaMenu from "../MegaMenu";

export default function Header() {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMiniCartOpen, setIsMiniCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  
  // Get categories for navigation
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/categories");
      return res.json();
    },
  });

  // Announcement slider messages
  const announcementMessages = [
    'Avail Complimentary NEW Premium Sample on every order!',
    'Free shipping on orders over $50!',
    'Subscribe and save up to 20%!'
  ];
  const [currentAnnouncement, setCurrentAnnouncement] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAnnouncement(prev => (prev + 1) % announcementMessages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [announcementMessages.length]);

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Announcement bar */}
      <div className="bg-[#444444] py-2 text-center text-white">
        <p className="text-sm tracking-wide">
          {announcementMessages[currentAnnouncement]}
        </p>
      </div>
      {/* Main header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Mobile: menu (now visible on all screens) */}
          <div className="flex items-center space-x-4">
            <button 
              className="p-2 rounded-lg text-primary hover:bg-gray-100 transition-colors" 
              aria-label="Toggle menu" 
              onClick={() => setIsMobileNavOpen(true)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round"  
                  d="M4 6h16M4 12h10M4 18h16" 
                />
              </svg>
            </button>
            <button 
              className="p-2 rounded-lg text-primary hover:bg-gray-100 transition-colors" 
              aria-label="Search" 
              onClick={() => setIsSearchOpen(v => !v)}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                strokeWidth={2}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z" 
                />
              </svg>
            </button>
          </div>
          {/* Logo centered */}
          <div className="absolute left-1/2 transform -translate-x-1/2 lg:static lg:transform-none lg:flex-1 lg:flex lg:justify-center">
            <Link href="/" className="block">
              <div className="flex flex-col items-center">
                <h1 className="text-primary font-heading text-2xl md:text-3xl font-bold">KAMA</h1>
                <p className="text-primary font-accent text-sm tracking-widest">AYURVEDA</p>
              </div>
            </Link>
          </div>
          {/* Desktop: User actions */}
          <div className="hidden lg:flex items-center space-x-6">
            <div className="relative" 
                 onMouseEnter={() => setIsUserMenuOpen(true)} 
                 onMouseLeave={() => setIsUserMenuOpen(false)}
                 tabIndex={0}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     setIsUserMenuOpen(prev => !prev);
                   }
                 }}
                 role="menubar"
            >
              <button 
                type="button" 
                className="text-primary flex items-center gap-1" 
                aria-label="User Menu" 
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <Transition
                as={Fragment}
                show={isUserMenuOpen}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
              >
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 z-50 border border-gray-100" role="menu">
                  {!isAuthenticated && (
                    <>
                      <Link href="/login" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                        Sign in
                      </Link>
                      <Link href="/register" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Register
                      </Link>
                    </>
                  )}
                  <Link href="/cart" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68l3.24-7.45A1 1 0 0020 7H6" /></svg>
                    My Cart
                  </Link>
                  {isAuthenticated && (
                    <Link href="/account" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /></svg>
                      My Account
                    </Link>
                  )}
                  <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0l1.318 1.318 1.318-1.318a4.5 4.5 0 016.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                    My Wishlist
                  </Link>
                  <Link href="/track-order" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h1a4 4 0 014 4v2M9 17h6" /></svg>
                    Track your order
                  </Link>
                </div>
              </Transition>
            </div>
            <button type="button" className="text-primary hover:text-primary-light relative" aria-label="Shopping Cart" onClick={() => setIsMiniCartOpen(prev => !prev)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#A72B1D] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>
            <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
          </div>
          {/* Mobile: User actions */}
          <div className="flex lg:hidden items-center space-x-4">
            <div className="relative" 
                 onMouseEnter={() => setIsUserMenuOpen(true)} 
                 onMouseLeave={() => setIsUserMenuOpen(false)}
                 tabIndex={0}
                 onKeyDown={(e) => {
                   if (e.key === 'Enter' || e.key === ' ') {
                     setIsUserMenuOpen(prev => !prev);
                   }
                 }}
                 role="menubar"
            >
              <button 
                type="button" 
                className="text-primary flex items-center gap-1" 
                aria-label="User Menu" 
                aria-expanded={isUserMenuOpen}
                aria-haspopup="menu"
                onClick={() => setIsUserMenuOpen(prev => !prev)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
              <Transition
                as={Fragment}
                show={isUserMenuOpen}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-2"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-2"
              >
                <div className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-lg py-2 z-50 border border-gray-100" role="menu">
                  {!isAuthenticated && (
                    <>
                      <Link href="/login" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" /></svg>
                        Sign in
                      </Link>
                      <Link href="/register" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Register
                      </Link>
                    </>
                  )}
                  <Link href="/cart" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A1 1 0 007 17h10a1 1 0 00.95-.68l3.24-7.45A1 1 0 0020 7H6" /></svg>
                    My Cart
                  </Link>
                  {isAuthenticated && (
                    <Link href="/account" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196z" /></svg>
                      My Account
                    </Link>
                  )}
                  <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 016.364 0l1.318 1.318 1.318-1.318a4.5 4.5 0 016.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z" /></svg>
                    My Wishlist
                  </Link>
                  <Link href="/track-order" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 text-gray-900" role="menuitem">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h1a4 4 0 014 4v2M9 17h6" /></svg>
                    Track your order
                  </Link>
                </div>
              </Transition>
            </div>
            <button
              type="button"
              className="text-primary relative"
              aria-label="Shopping Cart"
              onClick={() => setIsMiniCartOpen(prev => !prev)}
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
            <MiniCart isOpen={isMiniCartOpen} onClose={() => setIsMiniCartOpen(false)} />
          </div>
        </div>
        {/* Desktop MegaMenu navigation */}
        <div className="hidden lg:block border-t border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <MegaMenu />
          </div>
        </div>
      </div>
      {/* Mobile Nav Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
      
      {/* Search Bar - now outside the header for both mobile and desktop */}
      <SearchBar show={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </header>
  );
}
