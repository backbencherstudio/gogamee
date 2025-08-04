'use client'
import { Mail, Phone, Heart, Instagram, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "./LanguageContext"

export default function Footer() {
  const { t } = useLanguage()
  return (
    <div className="w-full bg-[#060606]">
        <div className="max-w-[1200px] mx-auto">
        <footer className="w-full px-4 sm:px-6 md:px-8 lg:px-0 pt-20 pb-6">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-12 lg:gap-0">
        {/* Logo and Contact Section */}
        <div className="w-full max-w-md lg:w-80 lg:max-w-none mx-auto lg:mx-0 space-y-6 text-center lg:text-left">
          <h3 className="text-white text-4xl sm:text-5xl font-bold font-[Inter]">LOGO</h3>
          <p className="text-neutral-300 text-lg font-normal font-['Inter'] leading-7">
            {t.footer.description}
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Mail className="w-6 h-6 text-white" />
              <span className="text-white text-base font-medium font-['Inter']">example@gmail.com</span>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <Phone className="w-6 h-6 text-white" />
              <span className="text-white text-base font-medium font-['Inter']">(888)-123456789</span>
            </div>
          </div>
        </div>

        {/* Quick Links and Social Media */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap lg:gap-28 gap-8 sm:gap-12 justify-around lg:justify-start w-full lg:w-auto">
          {/* Quick Links */}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[150px] mx-auto sm:mx-0 space-y-5 text-center sm:text-left">
            <h3 className="text-white text-xl font-medium font-['Inter']">{t.footer.quickLink}</h3>
            <div className="space-y-4">
              <Link href="/" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                {t.menu.home}
              </Link>
              <Link href="/packages" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                {t.menu.packages}
              </Link>
              <Link href="/faqs" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                {t.menu.faqs}
              </Link>
            </div>
          </div>

          {/* Packs */}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[150px] mx-auto sm:mx-0 space-y-5 text-center sm:text-left">
            <h3 className="text-white text-xl font-medium font-['Inter']">{t.footer.packs}</h3>
            <div className="space-y-4">
              <Link href="/packages" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                {t.footer.standardPack}
              </Link>
              <Link href="/packages" className="block text-zinc-400 text-lg font-normal font-['Inter'] cursor-pointer">
                {t.footer.premiumPack}
              </Link>
            </div>
          </div>

          {/* Social Media */}
          <div className="w-full sm:w-1/2 md:w-1/3 lg:w-36 sm:max-w-[150px] mx-auto sm:mx-0 space-y-5 text-center sm:text-left">
            <h3 className="text-white text-xl font-medium font-['Inter']">{t.footer.socialMedia}</h3>
            <div className="space-y-4 flex flex-col items-center sm:items-start">
              <Link href="#" className="flex items-center gap-2 cursor-pointer">
                <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-lg font-normal font-['Inter']">{t.footer.tiktok}</span>
              </Link>
              <Link href="#" className="flex items-center gap-2 cursor-pointer">
                <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-lg font-normal font-['Inter']">{t.footer.instagram}</span>
              </Link>
              <Link href="#" className="flex items-center gap-2 cursor-pointer">
                <div className="p-2.5 bg-white/5 rounded-[50px] outline-[0.60px] outline-white/20">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="text-white text-base font-normal font-['Inter']">{t.footer.whatsapp}</span>
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
            {t.footer.copyright}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 items-center sm:items-start">
            <Link href="/privacy" className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
              {t.footer.privacyPolicy}
            </Link>
            <Link href="/cookies" className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
              {t.footer.cookiePolicy}
            </Link>
            <Link href="/terms" className="text-neutral-300 text-base font-normal font-['Inter'] cursor-pointer">
              {t.footer.termsConditions}
            </Link>
          </div>
        </div>
      </div>
    </footer>
        </div>    
    </div>

  )
}
