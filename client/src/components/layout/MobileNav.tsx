import { Link } from "wouter";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Collection } from "@shared/schema";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
}

export default function MobileNav({ isOpen, onClose, collections }: MobileNavProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[350px] p-0 h-full top-0 left-0 translate-x-0 border-r" side="left">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <p className="font-medium">Menu</p>
          <button 
            className="text-foreground" 
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-4">
          <ul className="space-y-4">
            {collections.length > 0 ? (
              collections.map((collection) => (
                <li key={collection.id} className="border-b border-gray-100 pb-2">
                  <Link 
                    href={`/collections/${collection.slug}`}
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    {collection.name}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              ))
            ) : (
              <>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/kumkumadi"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    Kumkumadi Collection
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/amrrepa"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    Amrrepa Collection
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/ujjasara"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    Ujjasara Collection
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/bestsellers"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    Bestsellers
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/skincare"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    Skincare
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/haircare"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    Haircare
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/bath-body"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    Bath & Body
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/gifting"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    Gifting
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
                <li className="border-b border-gray-100 pb-2">
                  <Link 
                    href="/collections/all"
                    className="text-foreground flex justify-between items-center"
                    onClick={onClose}
                  >
                    All Products
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}
