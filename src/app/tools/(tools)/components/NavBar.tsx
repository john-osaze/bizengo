"use client"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

export default function NavBar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const email = sessionStorage.getItem("RSEmail");

        if (email) {
            setIsLoggedIn(true);
        }
    }, [])

    return (
        <div className="bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/tools")}
                        className="text-lg font-semibold hover:bg-gray-100 transition-colors duration-300 flex items-center gap-2"
                    >
                        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-white" />
                        </div>
                        Business Bright Tools
                    </Button>

                    <div className="md:hidden">
                        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" aria-label="Menu">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:w-64 h-screen max-h-screen overflow-y-auto">
                                <SheetHeader>
                                    <SheetTitle>Menu</SheetTitle>
                                    <SheetDescription>
                                        Navigate through our tools.
                                    </SheetDescription>
                                </SheetHeader>
                                <div className="grid gap-4 py-4">
                                    <Button
                                        variant={pathname === "/tools/invoice-generator/" ? "default" : "outline"}
                                        onClick={() => { router.push("/tools/invoice-generator"); setIsMenuOpen(false); }}
                                        className="w-full transition-all duration-300 hover:scale-105"
                                    >
                                        Invoice
                                    </Button>
                                    <Button
                                        variant={pathname === "/tools/credit-tracker/" ? "default" : "outline"}
                                        onClick={() => { router.push("/tools/credit-tracker"); setIsMenuOpen(false); }}
                                        className="w-full transition-all duration-300 hover:scale-105"
                                    >
                                        Credit
                                    </Button>
                                    <Button
                                        variant={pathname === "/tools/calculator-inventory/" ? "default" : "outline"}
                                        onClick={() => { router.push("/tools/calculator-inventory"); setIsMenuOpen(false); }}
                                        className="w-full transition-all duration-300 hover:scale-105"
                                    >
                                        Calculator
                                    </Button>
                                    <Button
                                        variant={pathname === "/tools/find-products/" ? "default" : "outline"}
                                        onClick={() => { router.push("/tools/find-products"); setIsMenuOpen(false); }}
                                        className="w-full transition-all duration-300 hover:scale-105"
                                    >
                                        Products
                                    </Button>
                                    {isLoggedIn ? (
                                        <Button variant="outline" asChild className="w-full">
                                            <Link href="/tools/dashboard">Dashboard</Link>
                                        </Button>
                                    ) : (
                                        <>
                                            <Button variant="outline" asChild className="w-full">
                                                <Link href="/tools/auth/login">Login</Link>
                                            </Button>
                                            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 w-full">
                                                <Link href="/tools/auth/signup">Sign Up</Link>
                                            </Button>
                                        </>

                                    )}
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex gap-2 flex-wrap items-center">
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                variant={pathname === "/tools/invoice-generator/" ? "default" : "outline"}
                                onClick={() => router.push("/tools/invoice-generator")}
                                size="sm"
                                className="transition-all duration-300 hover:scale-105"
                            >
                                Invoice
                            </Button>
                            <Button
                                variant={pathname === "/tools/credit-tracker/" ? "default" : "outline"}
                                onClick={() => router.push("/tools/credit-tracker")}
                                size="sm"
                                className="transition-all duration-300 hover:scale-105"
                            >
                                Credit
                            </Button>
                            <Button
                                variant={pathname === "/tools/calculator-inventory/" ? "default" : "outline"}
                                onClick={() => router.push("/tools/calculator-inventory")}
                                size="sm"
                                className="transition-all duration-300 hover:scale-105"
                            >
                                Calculator
                            </Button>
                            <Button
                                variant={pathname === "/tools/find-products/" ? "default" : "outline"}
                                onClick={() => router.push("/tools/find-products")}
                                size="sm"
                                className="transition-all duration-300 hover:scale-105"
                            >
                                Products
                            </Button>
                        </div>
                        {isLoggedIn ? (
                            <div className="flex gap-2 ml-4 border-l pl-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/tools/dashboard">Dashboard</Link>
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2 ml-4 border-l pl-4">
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/tools/auth/login">Login</Link>
                                </Button>
                                <Button size="sm" asChild className="bg-gradient-to-r from-blue-600 to-purple-600">
                                    <Link href="/tools/auth/signup">Sign Up</Link>
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
