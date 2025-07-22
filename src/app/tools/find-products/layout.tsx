import React from "react";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Product Finder | Roots & Squares",
    description: "Find products all over the country, find stores, place orders, and receive them quickly",
    icons: {
        icon: "/icons/site-icon.ico",
    },
};

export default function ProductLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ErrorBoundary>
            <main>
                <div className="w-full min-h-screen overflow-x-hidden md:pb-16">
                    {children}
                </div>
            </main>
        </ErrorBoundary>
    );
}