"use client"
import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutGrid,
  HelpCircle,
  LogOut,
  GalleryVerticalEnd,
  FileText,
  Star,
  Package,
  Info,
  Menu,
  X,
} from "lucide-react"
import { cn } from "@/app/lib/utils"

interface SidebarMenuItem {
  title: string
  icon: React.ElementType
  url: string
  badge?: string
  isLogout?: boolean
}

interface SidebarSection {
  title: string
  items: SidebarMenuItem[]
}

const sidebarData: SidebarSection[] = [
  {
    title: "MENU",
    items: [
      { title: "Dashboard", icon: LayoutGrid, url: "/dashboard" },
      { title: "All request", icon: FileText, url: "/dashboard/allrequest" },
      { title: "FAQ", icon: HelpCircle, url: "/dashboard/faq" },
      { title: "Package", icon: Package, url: "/dashboard/package" },
      { title: "Testimonial", icon: Star, url: "/dashboard/testimonial" },
      { title: "About Page", icon: Info, url: "/dashboard/about" },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
    {/* Desktop sidebar */}
    <div className="hidden lg:flex fixed w-64 bg-white p-4 rounded-xl shadow-lg flex-col h-[calc(100vh-2rem)] my-4 ml-4 z-30">
      {/* Logo */}
      <div className="flex items-center gap-2 p-2 mb-6">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#76C043] text-white">
          <GalleryVerticalEnd className="w-4 h-4" />
        </div>
        <span className="font-semibold text-lg text-gray-800">GoGame</span>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto">
        {sidebarData.map((section, index) => (
          <div key={section.title} className={cn("mb-6", index === 0 && "mt-2")}>
            <ul>
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.url
                return (
                  <li key={item.title} className="mb-1">
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors duration-200",
                        isActive 
                          ? "bg-[#76C043] text-white" 
                          : "text-gray-700 hover:bg-[#76C043]/20"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5", 
                          isActive && "text-white",
                          !isActive && "text-gray-600"
                        )}
                      />
                      <span className="font-medium">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout Button at Bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            // Add logout logic here
            console.log('Logout clicked')
          }}
          className="flex items-center gap-3 p-2 rounded-lg transition-colors cursor-pointer duration-200 text-[#76C043] hover:bg-[#76C043]/20 w-full text-left"
        >
          <LogOut className="w-5 h-5 text-[#76C043]" />
          <span className="font-medium text-[#76C043]">Log out</span>
        </button>
      </div>
    </div>

    {/* Mobile top bar with hamburger menu */}
    <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#76C043] text-white">
            <GalleryVerticalEnd className="w-4 h-4" />
          </div>
          <span className="font-semibold text-lg text-gray-800">GoGame</span>
        </div>
        {/* Hamburger button */}
        <button
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="inline-flex items-center justify-center w-10 h-10 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#76C043]"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {/* Dropdown panel */}
      {mobileOpen && (
        <div className="px-4 pb-3 border-t border-gray-200 bg-white shadow-sm">
          <ul className="py-2 space-y-1">
            {sidebarData[0].items.map((item) => {
              const isActive = pathname === item.url
              const Icon = item.icon
              return (
                <li key={item.title}>
                  <Link
                    href={item.url}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md",
                      isActive ? "bg-[#76C043] text-white" : "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-gray-600")} />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
    </>
  )
}
