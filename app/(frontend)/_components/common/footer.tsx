"use client";
import { Mail, Instagram, Linkedin } from "lucide-react";
import { FaTiktok, FaWhatsapp } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

import { useEffect, useState } from "react";
import {
  getPublicSocialLinks,
  SocialContactLinks,
} from "../../../../services/settingsService";

export default function Footer() {
  const [links, setLinks] = useState<SocialContactLinks>({
    whatsapp: "",
    instagram: "",
    tiktok: "",
    linkedin: "",
    email: "",
  });

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        const response = await getPublicSocialLinks();
        if (response.success && response.links) {
          setLinks(response.links);
        }
      } catch (error) {
        console.error("Failed to fetch social links:", error);
      }
    };
    fetchLinks();
  }, []);

  const getWhatsAppLink = (input: string) => {
    if (!input) return "#";
    // If it's already a link, return it
    if (input.startsWith("http")) return input;
    // Otherwise assume it's a number, strip non-numeric chars (except +)
    const cleanNumber = input.replace(/[^\d+]/g, "");
    return `https://wa.me/${cleanNumber}`;
  };

  return (
    <div className="w-full bg-[#060606] mt-5">
      <div className="max-w-[1200px] mx-auto">
        <footer className="w-full px-4 sm:px-6 md:px-8 lg:px-0 pt-20 pb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-0">
            {/* Logo and Contact Section */}
            <div className="w-full max-w-md lg:w-80 lg:max-w-none mx-0 space-y-6 text-left">
              <Image
                src="/logowhite.svg"
                className="min-w-36 h-auto"
                alt="Logo"
                width={100}
                height={100}
              />
              <p className="text-neutral-300 text-lg font-normal font-['Inter'] leading-7">
                <span className="text-neutral-300 text-lg font-normal font-['Inter'] leading-7">
                  GoGame es una plataforma de viajes sorpresa que crea
                  experiencias deportivas inolvidables.
                </span>
              </p>
              <div className="space-y-4">
                {links.email && (
                  <Link
                    href={`mailto:${links.email}`}
                    className="flex items-center gap-2 hover:text-white/80 transition-colors"
                  >
                    <Mail className="w-6 h-6 text-white" />
                    <span className="text-white text-base font-medium font-['Inter']">
                      {links.email}
                    </span>
                  </Link>
                )}
                {links.whatsapp && (
                  <Link
                    href={getWhatsAppLink(links.whatsapp)}
                    className="flex items-center gap-2 hover:text-white/80 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <FaWhatsapp className="w-6 h-6 text-white" />
                    <span className="text-white text-base font-medium font-['Inter']">
                      WhatsApp
                    </span>
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Links and Social Media */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap lg:gap-28 gap-8 sm:gap-12 justify-around lg:justify-start w-full lg:w-auto">
              {/* Quick Links */}
              <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[180px] mx-0 space-y-5 text-left">
                <h3 className="text-white text-xl font-medium font-['Inter'] whitespace-nowrap">
                  <span className="text-white text-xl font-medium font-['Inter'] whitespace-nowrap">
                    Enlaces rápidos
                  </span>
                </h3>
                <div className="space-y-4">
                  <Link
                    href="/"
                    className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer"
                  >
                    <span className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                      Inicio
                    </span>
                  </Link>
                  <Link
                    href="/faqs"
                    className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer whitespace-nowrap"
                  >
                    <span className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer whitespace-nowrap">
                      Preguntas frecuentes
                    </span>
                  </Link>
                  <Link
                    href="/regala-gogame"
                    className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer whitespace-nowrap"
                  >
                    <span className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer whitespace-nowrap">
                      Regala GoGame
                    </span>
                  </Link>
                </div>
              </div>

              {/* Packs */}
              <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[150px] mx-0 space-y-5 text-left">
                <h3 className="text-white text-xl font-medium font-['Inter']">
                  <span className="text-white text-xl font-medium font-['Inter']">
                    Packs
                  </span>
                </h3>
                <div className="space-y-4">
                  <Link
                    href="/packages"
                    className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer"
                  >
                    <span className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                      Pack Estándar
                    </span>
                  </Link>
                  <Link
                    href="/packages"
                    className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer"
                  >
                    <span className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                      Pack Premium
                    </span>
                  </Link>
                </div>
              </div>

              {/* Social Media */}
              <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[150px] mx-0 space-y-5 text-left">
                <h3 className="text-white text-xl font-medium font-['Inter']">
                  <span className="text-white text-xl font-medium font-['Inter']">
                    Redes sociales
                  </span>
                </h3>
                <div className="space-y-4 flex flex-col items-start">
                  {links.tiktok && (
                    <Link
                      href={links.tiktok}
                      className="flex items-center gap-2 cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                        <FaTiktok className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white text-lg font-normal font-['Inter']">
                        <span className="text-white text-lg font-normal font-['Inter']">
                          TikTok
                        </span>
                      </span>
                    </Link>
                  )}
                  {links.instagram && (
                    <Link
                      href={links.instagram}
                      className="flex items-center gap-2 cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                        <Instagram className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white text-lg font-normal font-['Inter']">
                        <span className="text-white text-lg font-normal font-['Inter']">
                          Instagram
                        </span>
                      </span>
                    </Link>
                  )}

                  {links.linkedin && (
                    <Link
                      href={links.linkedin}
                      className="flex items-center gap-2 cursor-pointer"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                        <Linkedin className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-white text-lg font-normal font-['Inter']">
                        <span className="text-white text-lg font-normal font-['Inter']">
                          LinkedIn
                        </span>
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-14">
            <hr className="opacity-50 border-zinc-500" />
            <div className="flex flex-col md:flex-row justify-between items-center mt-6 gap-4 md:gap-0 text-center md:text-left">
              <p className="text-neutral-300 text-base font-normal font-['Inter']">
                <span className="text-neutral-300 text-base font-normal font-['Inter']">
                  Copyright 2025 by GoGame. Todos los derechos reservados.
                </span>
              </p>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center sm:items-start">
                <Link
                  href="/privacy"
                  className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer"
                >
                  <span className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
                    Política de privacidad
                  </span>
                </Link>
                <Link
                  href="/cookies"
                  className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer"
                >
                  <span className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
                    Política de cookies
                  </span>
                </Link>
                <Link
                  href="/terms"
                  className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer"
                >
                  <span className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
                    Términos y condiciones
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
