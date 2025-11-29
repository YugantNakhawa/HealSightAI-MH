import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout({ title, children }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 min-h-screen flex flex-col">
        <Topbar title={title} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}