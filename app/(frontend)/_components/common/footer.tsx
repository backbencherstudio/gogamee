'use client'
import { Mail, Heart, Instagram, MessageCircle, Linkedin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { TranslatedText } from "../TranslatedText"

export default function Footer() {
  return (
    <div className="w-full bg-[#060606] mt-5">
        <div className="max-w-[1200px] mx-auto">
        <footer className="w-full px-4 sm:px-6 md:px-8 lg:px-0 pt-20 pb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-0">
        {/* Logo and Contact Section */}
        <div className="w-full max-w-md lg:w-80 lg:max-w-none mx-auto lg:mx-0 space-y-6 text-center lg:text-left">
          <Image src="/logowhite.svg" className="min-w-36 h-auto" alt="Logo" width={100} height={100} />
          <p className="text-neutral-300 text-lg font-normal font-['Inter'] leading-7">
            <TranslatedText
              text="GoGame es una plataforma de viajes sorpresa que crea experiencias deportivas inolvidables."
              english="GoGame is a surprise travel platform that creates unforgettable sports experiences."
              as="span"
            />
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Mail className="w-6 h-6 text-white" />
              <span className="text-white text-base font-medium font-['Inter']">info@gogame2025.com</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="text-white text-base font-medium font-['Inter']">WhatsApp</span>
            </div>
          </div>
        </div>

        {/* Quick Links and Social Media */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap lg:gap-28 gap-8 sm:gap-12 justify-around lg:justify-start w-full lg:w-auto">
          {/* Quick Links */}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[180px] mx-auto sm:mx-0 space-y-5 text-center sm:text-left">
            <h3 className="text-white text-xl font-medium font-['Inter'] whitespace-nowrap">
              <TranslatedText text="Enlaces rápidos" english="Quick links" as="span" />
            </h3>
            <div className="space-y-4">
              <Link href="/" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                <TranslatedText text="Inicio" english="Home" as="span" />
              </Link>
              <Link href="/faqs" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer whitespace-nowrap">
                <TranslatedText text="Preguntas frecuentes" english="FAQs" as="span" />
              </Link>
            </div>
          </div>

          {/* Packs */}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[150px] mx-auto sm:mx-0 space-y-5 text-center sm:text-left">
            <h3 className="text-white text-xl font-medium font-['Inter']">
              <TranslatedText text="Packs" english="Packs" as="span" />
            </h3>
            <div className="space-y-4">
              <Link href="/packages" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                <TranslatedText text="Pack Estándar" english="Standard pack" as="span" />
              </Link>
              <Link href="/packages" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                <TranslatedText text="Pack Premium" english="Premium pack" as="span" />
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[150px] mx-auto sm:mx-0 space-y-5 text-center sm:text-left">
            <h3 className="text-white text-xl font-medium font-['Inter']">
              <TranslatedText text="Redes sociales" english="Social Media" as="span" />
            </h3>
            <div className="space-y-4 flex flex-col items-center sm:items-start">
              <Link href="#" className="flex items-center gap-2 cursor-pointer">
                <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-lg font-normal font-['Inter']">
                  <TranslatedText text="TikTok" english="TikTok" as="span" />
                </span>
              </Link>
              <Link href="#" className="flex items-center gap-2 cursor-pointer">
                <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-lg font-normal font-['Inter']">
                  <TranslatedText text="Instagram" english="Instagram" as="span" />
                </span>
              </Link>

              <Link href="#" className="flex items-center gap-2 cursor-pointer">
                <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                  <Linkedin className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-lg font-normal font-['Inter']">
                  <TranslatedText text="LinkedIn" english="LinkedIn" as="span" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="mt-14">
        <hr className="opacity-50 border-zinc-500" />
        <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 md:gap-0 text-center md:text-left">
          <p className="text-neutral-300 text-base font-normal font-['Inter']">
            <TranslatedText
              text="Copyright 2025 by GoGame. Todos los derechos reservados."
              english="Copyright 2025 by GoGame. All rights reserved."
              as="span"
            />
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center sm:items-start">
            <Link href="/privacy" className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
              <TranslatedText text="Política de privacidad" english="Privacy Policy" as="span" />
            </Link>
            <Link href="/cookies" className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
              <TranslatedText text="Política de cookies" english="Cookie Policy" as="span" />
            </Link>
            <Link href="/terms" className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
              <TranslatedText text="Términos y condiciones" english="Terms & Conditions" as="span" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
        </div>    
    </div>

  )
}
