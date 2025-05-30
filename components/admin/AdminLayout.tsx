"use client";

import { useState, ReactNode } from "react";
import Sidebar from "./AdminSidebar";
import TopNavBar from "./AdminNavbar";

interface AdminLayoutProps {
  children: ReactNode;
  defaultActiveTab?: string;
  pageTitle?: string;
}

export default function AdminLayout({
  children,
  defaultActiveTab = "dashboard",
}: AdminLayoutProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab);

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
