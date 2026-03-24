"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import Image from "next/image";
import { usePathname } from "next/navigation";

// Pages that have a hero section behind the navbar
const HERO_PAGES = [
  "/",
  "/packages",
  "/faqs",
  "/about",
  "/privacy",
  "/cookies",
  "/terms",
];

export default function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const pathname = usePathname();

  // Check if the current page has a hero section
  const hasHero = HERO_PAGES.includes(pathname);

  // Transparent navbar only on desktop hero pages at the top
  const isSolid = !hasHero || !isDesktop || isScrolled || isMenuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768); // md breakpoint
    };

    // Initial check
    handleScroll();
    handleResize();

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Dynamic menu items based on current language
  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Packs", href: "/packages" },
    { label: "Preguntas frecuentes", href: "/faqs" },
    { label: "Sobre nosotros", href: "/about" },
  ];

  return (
    <div
      className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 py-5 ${
        isSolid ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 flex justify-between items-center relative">
        {/* Logo */}
        <Link
          href="/"
          className={`font-bold font-['Poppins'] text-3xl md:text-4xl flex items-center cursor-pointer ${
            isSolid ? "text-black" : "text-white"
          }`}
        >
          <Image
            src="/logo.svg"
            className={`min-w-24 md:min-w-32 h-auto transition-all duration-300 ${
              isSolid ? "" : "brightness-0 invert"
            }`}
            alt="Logo"
            width={80}
            height={80}
          />
        </Link>

        {/* Mobile Contact - Always Visible */}
        <div className="lg:hidden flex items-center gap-3">
          {/* Contact Button - Mobile */}
          <Link
            href="/contact"
            className="px-3 py-2 bg-[#76C043] rounded-[999px] flex justify-center items-center gap-2 hover:bg-lime-600 transition-colors cursor-pointer"
          >
            <span className="text-center text-white text-sm font-normal font-['Inter'] leading-5">
              Contacto
            </span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            className={`p-2 hover:text-lime-600 cursor-pointer transition-colors ${
              isSolid ? "text-slate-700" : "text-white"
            }`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>

        {/* Navigation Links - Desktop */}
        <div className="hidden lg:flex justify-center items-center gap-14">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`text-lg font-normal font-['Poppins'] leading-loose hover:text-lime-600 transition-colors cursor-pointer ${
                isSolid ? "text-black" : "text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Section - Contact - Desktop */}
        <div className="hidden lg:flex justify-end items-center gap-3">
          <Link
            href="/contact"
            className="px-4 py-2.5 bg-[#76C043] rounded-[999px] flex justify-center items-center gap-2.5 hover:bg-lime-600 transition-colors cursor-pointer"
          >
            <span className="text-center text-white text-lg font-normal font-['Inter'] leading-7">
              Contacto
            </span>
          </Link>
        </div>

        {/* Mobile Menu - Overlay */}
        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg mt-5 py-4 px-4 z-50">
            <nav className="flex flex-col space-y-4">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  href={item.href}
                  className="text-black text-lg font-normal font-['Poppins'] hover:text-lime-600 transition-colors cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
