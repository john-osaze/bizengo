import React from "react";
import NavBar from "./components/NavBar";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Bizengo Tools",
    description: "Business tools to make business activities faster and optimized. Automatic invoice generation, Credit tracker, Bulk calculator, and Inventory manager",
    icons: {
        icon: "/images/logo.png",
    },
};

export default function ToolsLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            <NavBar />
            <div className="w-full min-h-screen overflow-x-hidden">
                {children}
            </div>
        </main>
    );
}