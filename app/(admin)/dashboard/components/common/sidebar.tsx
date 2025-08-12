import type * as React from "react"
import {
  LayoutGrid,
  HelpCircle,
  LogOut,
  GalleryVerticalEnd,
  FileText,
  Star,
  Package,
} from "lucide-react"
import { cn } from "@/app/lib/utils"

interface SidebarMenuItem {
  title: string
  icon: React.ElementType
  url: string
  badge?: string
  isActive?: boolean
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
      { title: "Dashboard", icon: LayoutGrid, url: "/dashboard", isActive: true },
      { title: "All request", icon: FileText, url: "/dashboard/allrequest", },
      { title: "FAQ", icon: HelpCircle, url: "/dashboard/faq" },
      { title: "Package", icon: Package, url: "/dashboard/package" },
      { title: "Testimonial", icon: Star, url: "/dashboard/testimonial" },
    ],
  },
]

export function Sidebar() {
  return (
    <div className="fixed w-64 bg-white p-4 rounded-xl shadow-lg flex flex-col h-[calc(100vh-2rem)] my-4 ml-4 z-10">
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
                return (
                  <li key={item.title} className="mb-1">
                    <a
                      href={item.url}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg transition-colors duration-200",
                        item.isActive 
                          ? "bg-[#76C043] text-white" 
                          : "text-gray-700 hover:bg-[#76C043]/20"
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5", 
                          item.isActive && "text-white",
                          !item.isActive && "text-gray-600"
                        )}
                      />
                      <span className="font-medium">
                        {item.title}
                      </span>
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Logout Button at Bottom */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <a
          href="#"
          className="flex items-center gap-3 p-2 rounded-lg transition-colors duration-200 text-[#76C043] hover:bg-[#76C043]/20"
        >
          <LogOut className="w-5 h-5 text-[#76C043]" />
          <span className="font-medium text-[#76C043]">Log out</span>
        </a>
      </div>
    </div>
  )
}
