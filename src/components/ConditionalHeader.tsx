"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";

// Import your specific header components
import Header from "./ui/Header";
import VendorHeader from "@/app/vendor/dashboard/components/VendorHeader";

const ConditionalHeader: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = (): void => {
    localStorage.removeItem("vendorAuth");
    localStorage.removeItem("isVendorLoggedIn");
    localStorage.removeItem("vendorToken"); // Also remove the token
    router.push("../auth");
  };

  if (pathname.startsWith("/vendor/auth")) {
    return <Header />;
  }

  if (pathname.startsWith("/vendor")) {
    // VendorHeader handles its own data fetching, so we only pass onLogout
    return <VendorHeader onLogout={handleLogout} />;
  }

  return <Header />;
};

export default ConditionalHeader;
