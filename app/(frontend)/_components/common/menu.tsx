"use client";
import React, { useState } from "react";
import Link from "next/link";
import { HiMenu, HiX } from "react-icons/hi";
import Image from "next/image";

export default function Menu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dynamic menu items based on current language
  const menuItems = [
    { label: "Inicio", href: "/" },
    { label: "Packs", href: "/packages" },
    { label: "Preguntas frecuentes", href: "/faqs" },
    { label: "Sobre nosotros", href: "/about" },
  ];

  return (
    <div className="w-full bg-white py-5">
      <div className="max-w-[1200px] mx-auto px-4 lg:px-0 flex justify-between items-center relative">
        {/* Logo */}
        <Link
          href="/"
          className="font-bold font-['Poppins'] text-3xl md:text-4xl text-black flex items-center cursor-pointer"
        >
          <Image
            src="/logo.svg"
            className=" min-w-24 md:min-w-32 h-auto"
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
            className="p-2 text-slate-700 hover:text-lime-600 cursor-pointer"
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
              className="text-black text-lg font-normal font-['Poppins'] leading-loose hover:text-lime-600 transition-colors cursor-pointer"
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
