import React from "react";
import { Sidebar } from "./components/common/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed sidebar renders itself responsively (drawer on mobile, fixed on desktop) */}
      <Sidebar />

      {/* Content wrapper: on large screens add left margin to avoid overlapping the fixed sidebar */}
      <div className="max-w-[1400px] mx-auto">
        <div className="lg:ml-[17rem]">{children}</div>
      </div>
    </div>
  );
}
