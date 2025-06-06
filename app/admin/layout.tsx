"use client";

import { ReactNode } from "react";
import Sidebar from "@/components/admin/AdminSidebar";
import TopNavBar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
