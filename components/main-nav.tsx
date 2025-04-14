"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Menu, X } from "lucide-react"

const MainNav = ({
    className,
    ...props 
}: React.HTMLAttributes<HTMLElement>) => {
    const pathname = usePathname()
    const params = useParams()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const navRef = useRef<HTMLDivElement>(null)
    const menuButtonRef = useRef<HTMLButtonElement>(null)
    const menuContentRef = useRef<HTMLDivElement>(null)
    
    // Handle clicks outside the menu
    useEffect(() => {
        // Only add the listener when the menu is open
        if (!isMenuOpen) return;
        
        const handleClickOutside = (event: MouseEvent) => {
            // If clicking the menu button, let the toggle handler deal with it
            if (menuButtonRef.current && menuButtonRef.current.contains(event.target as Node)) {
                return;
            }
            
            // If clicking outside both the menu content and button, close the menu
            if (
                menuContentRef.current && 
                !menuContentRef.current.contains(event.target as Node)
            ) {
                setIsMenuOpen(false);
            }
        };
        
        // Use capture phase to ensure we get the event before it reaches other handlers
        document.addEventListener('mousedown', handleClickOutside, true);
        
        // Add escape key handler
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
            }
        };
        
        document.addEventListener('keydown', handleEscKey);
        
        // Prevent scrolling on body when menu is open
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside, true);
            document.removeEventListener('keydown', handleEscKey);
            document.body.style.overflow = '';
        };
    }, [isMenuOpen]);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    const routes = [
        {
            href: `/${params.storeId}`,
            label: "Overview",
            active: pathname === `/${params.storeId}`,
        },
        {
            href: `/${params.storeId}/products`,
            label: "Products",
            active: pathname === `/${params.storeId}/products`,
        },
        {
            href: `/${params.storeId}/orders`,
            label: "Orders",
            active: pathname === `/${params.storeId}/orders`,
        },
        {
            href: `/${params.storeId}/invoices`,
            label: "Invoices",
            active: pathname === `/${params.storeId}/invoices`,
        },
        {
            href: `/${params.storeId}/inventory`,
            label: "Inventory",
            active: pathname === `/${params.storeId}/inventory`,
        },
        {
            href: `/${params.storeId}/purchase`,
            label: "Purchase",
            active: pathname === `/${params.storeId}/purchase`,
        },
        {
            href: `/${params.storeId}/settings`,
            label: "Settings",
            active: pathname === `/${params.storeId}/settings`,
        },
    ];

    const toggleMenu = () => {
        setIsMenuOpen(prevState => !prevState);
    };

    return (
        <div className={cn("relative", className)} ref={navRef} {...props}>
            {/* Mobile/Tablet menu button - now visible up to xl breakpoint (1280px) */}
            <button 
                ref={menuButtonRef}
                className="xl:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                onClick={toggleMenu}
                aria-label="Toggle menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
            >
                {isMenuOpen ? 
                    <X size={20} className="text-primary" /> : 
                    <Menu size={20} className="text-gray-700 dark:text-gray-300" />
                }
            </button>

            {/* Desktop navigation - now only visible at xl breakpoint and above (1280px+) */}
            <nav className="hidden xl:flex items-center space-x-4 2xl:space-x-6 pl-2">
                {routes.map((route) => (
                    <Link 
                        key={route.href}
                        href={route.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary whitespace-nowrap",
                            route.active
                                ? "text-black dark:text-white font-semibold"
                                : "text-gray-600 dark:text-gray-400"
                        )}
                    >
                        {route.label}
                    </Link>
                ))}
            </nav>

            {/* Mobile/Tablet navigation overlay - now visible up to xl breakpoint */}
            <div 
                className={cn(
                    "fixed inset-0 bg-black/50 z-50 xl:hidden transition-opacity duration-200",
                    isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                aria-hidden={!isMenuOpen}
                onClick={() => setIsMenuOpen(false)}
            >
                {/* Mobile/Tablet navigation content */}
                <div 
                    id="mobile-menu"
                    ref={menuContentRef}
                    className={cn(
                        "absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 shadow-lg max-h-[calc(100vh-4rem)] overflow-y-auto transition-transform duration-300 ease-in-out",
                        isMenuOpen ? "translate-y-0" : "-translate-y-full"
                    )}
                    onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing
                >
                    {/* Mobile/Tablet navigation links */}
                    <div className="flex flex-col py-2">
                        {routes.map((route) => (
                            <Link 
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "flex items-center text-base font-medium px-6 py-3.5 border-l-4 transition-all",
                                    route.active
                                        ? "border-primary bg-primary/5 text-primary dark:text-primary-foreground font-semibold"
                                        : "border-transparent hover:border-gray-300 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MainNav;