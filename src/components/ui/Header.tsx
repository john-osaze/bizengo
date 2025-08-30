// components/Header.tsx
"use client"; // This component uses client-side hooks like useState, useRouter, usePathname

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation"; // Next.js routing hooks
import Icon from "./AppIcon"; // Adjust path as needed
import Link from "next/link";
import { ShoppingCart, Store, X } from "lucide-react";
import "./custom.css";
import CartSystem from "../../app/CartSystem/page";
type OptionType = "shopping" | "vendor" | null;

interface ModalOption {
  id: "shopping" | "vendor";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  buttonText: string;
  gradient: string;
  hoverGradient: string;
  iconColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  ringColor: string;
  pulseColor: string;
  route: string;
}

interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  // add other profile fields as needed
}

const Header: React.FC = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = sessionStorage.getItem("RSToken");
        if (token) {
          setIsAuthenticated(true);

          const response = await fetch(
            "https://server.bizengo.com/api/user/profile",
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.status === "success" && data.user) {
              setUserProfile({
                name: data.user.fullname || data.user.email,
                email: data.user.email,
                avatar: data.user.avatar,
              });
              // Store the complete user data
              sessionStorage.setItem("RSUser", JSON.stringify(data.user));
            }
          } else {
            console.error(
              "Failed to fetch user profile:",
              await response.text()
            );
            // If profile fetch fails, clear auth
            sessionStorage.removeItem("RSToken");
            sessionStorage.removeItem("RSUser");
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  const [isVendorAuthenticated, setIsVendorAuthenticated] = useState(false);

  useEffect(() => {
    // Check vendor token in localStorage
    const vendorToken = localStorage.getItem("vendorToken");
    if (vendorToken) {
      setIsVendorAuthenticated(true);
    }
  }, []);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<OptionType>(null);

  const openModal = (): void => setIsModalOpen(true);

  const closeModal = (): void => {
    setIsModalOpen(false);
    setSelectedOption(null);
  };

  // Prevent body scroll when modal is open
  useEffect((): (() => void) => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return (): void => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  const handleOptionSelect = (option: "shopping" | "vendor"): void => {
    setSelectedOption(option);
    // Add a slight delay before closing for better UX
    setTimeout((): void => {
      closeModal();
    }, 300);
  };

  // Handle logout functionality
  const handleLogout = (): void => {
    // Remove all authentication tokens
    sessionStorage.removeItem("RSToken");
    sessionStorage.removeItem("RSUser");
    localStorage.removeItem("vendorToken");

    // Reset authentication states
    setIsAuthenticated(false);
    setIsVendorAuthenticated(false);
    setUserProfile(null);
    setIsProfileDropdownOpen(false);

    // Close mobile menu if open
    setIsOpen(false);

    // Redirect to home page
    router.push("/");
  };

  const modalOptions: ModalOption[] = [
    {
      id: "shopping",
      title: "Start Shopping",
      description:
        "Browse our amazing collection of products and find exactly what you need",
      icon: ShoppingCart,
      buttonText: "Start Shopping",
      gradient: "from-purple-50 to-purple-100",
      hoverGradient: "hover:border-purple-300",
      iconColor: "text-purple-600",
      buttonColor: "bg-purple-600",
      buttonHoverColor: "group-hover:bg-purple-700",
      ringColor: "ring-purple-500",
      pulseColor: "bg-purple-600",
      route: "/auth/signup",
    },
    {
      id: "vendor",
      title: "Become a Vendor",
      description:
        "Join our marketplace and start selling your products to thousands of customers",
      icon: Store,
      buttonText: "Become a Vendor",
      gradient: "from-blue-50 to-blue-100",
      hoverGradient: "hover:border-blue-300",
      iconColor: "text-blue-600",
      buttonColor: "bg-blue-600",
      buttonHoverColor: "group-hover:bg-blue-700",
      ringColor: "ring-blue-500",
      pulseColor: "bg-blue-600",
      route: "/vendor/auth",
    },
  ];

  const getPageTitle = (): string => {
    switch (
      pathname // Use pathname
    ) {
      case "/home-dashboard":
        return "Discover";
      case "/map-view":
        return "Map View";
      case "/search-results":
        return "Search Results";
      case "/product-detail":
        return "Product Details";
      case "/user-profile":
        return "Profile";
      case "/create-listing":
        return "Create Listing";
      case "/vendor":
        return "Vendor Dashboard";
      default:
        return "LocalMarket";
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/search-results?q=${encodeURIComponent(searchQuery.trim())}`
      ); // Use router.push
    }
  };

  const handleBackNavigation = (): void => {
    if (window.history.length > 1) {
      router.back(); // Use router.back()
    } else {
      router.push("/"); // Use router.push
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false); // Close the menu after navigation
  };

  const showBackButton =
    pathname === "/product-detail" || pathname === "/create-listing";
  const showSearch = pathname !== "/create-listing";

  return (
    <header className="sticky top-0 z-[200] bg-white border-b border-border">
      <div className="max-w-7xl mx-auto h-16 md:h-18 px-4 md:px-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBackButton ? (
            <button
              onClick={handleBackNavigation}
              className="p-2 -ml-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
              aria-label="Go back"
            >
              <Icon name="ArrowLeft" size={20} className="text-text-primary" />
            </button>
          ) : (
            <Link href="/" className="block">
              {" "}
              {/* Add 'block' if you want the link to occupy the full width of its container */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="MapPin" size={18} className="text-white" />
                </div>
                <h1 className="text-lg md:text-xl font-heading font-semibold text-black">
                  {getPageTitle()}
                </h1>
              </div>
            </Link>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-2">
          {pathname === "/search-results" && (
            <button
              onClick={() => router.push("/search-results?view=filter")} // Use router.push
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
              aria-label="Open filters"
            >
              <Icon
                name="SlidersHorizontal"
                size={20}
                className="text-text-primary"
              />
            </button>
          )}

          {pathname === "/map-view" && (
            <button
              onClick={() => router.push("/map-view?view=list")} // Use router.push
              className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
              aria-label="Toggle view"
            >
              <Icon name="List" size={20} className="text-text-primary" />
            </button>
          )}

          <div className="flex items-center">
            {/* Desktop View: Hidden below sm breakpoint, displayed as flex above */}
            <div className="hidden sm:flex items-center gap-2 gap-x-4">
              {isAuthenticated || isVendorAuthenticated ? (
                <>
                  {/* Shopping Cart - Always show when authenticated */}
                  <button
                    onClick={() => setIsCartOpen(true)} // 👈 open cart sidebar
                    className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200 relative"
                    aria-label="User Shopping Cart"
                  >
                    <Icon
                      name="ShoppingCart"
                      size={20}
                      className="text-text-primary"
                    />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-1 border-surface"></div>
                  </button>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors duration-200"
                  >
                    <Icon name="LogOut" size={16} className="mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200 relative text-sm font-medium text-black"
                    aria-label="Login your account"
                  >
                    Login
                  </Link>
                  <button
                    onClick={openModal}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 bg-primary text-white hover:bg-primary/80 font-medium"
                    aria-label="Get Started"
                  >
                    Get Started
                  </button>
                </>
              )}

              {/* Modal Overlay */}
              {isModalOpen && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in"
                  onClick={closeModal}
                >
                  {/* Modal Container */}
                  <div
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl px-4 py-8 w-full max-h-[90vh] overflow-auto animate-scale-up"
                    onClick={(e: React.MouseEvent<HTMLDivElement>): void =>
                      e.stopPropagation()
                    }
                  >
                    {/* Modal Header */}
                    <div className="relative p-6 pb-4 border-b border-gray-100">
                      <button
                        onClick={closeModal}
                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      >
                        <X className="w-6 h-6 text-gray-500" />
                      </button>
                      <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                          Choose Your Path
                        </h2>
                        <p className="text-gray-600">
                          Select how you'd like to get started with our platform
                        </p>
                      </div>
                    </div>

                    {/* Modal Content */}
                    <div className="p-6">
                      {/* Connection Line */}
                      <div className="relative mb-8">
                        <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-200 to-blue-200 transform -translate-y-1/2"></div>
                        <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {modalOptions.map((option: ModalOption) => {
                          const Icon = option.icon;
                          const isSelected = selectedOption === option.id;

                          return (
                            <div
                              key={option.id}
                              className={`group relative bg-gradient-to-br ${
                                option.gradient
                              } border-2 border-${
                                option.id === "shopping" ? "purple" : "blue"
                              }-200 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                option.hoverGradient
                              } hover:scale-105 ${
                                isSelected
                                  ? `ring-2 ${option.ringColor} bg-${
                                      option.id === "shopping"
                                        ? "purple"
                                        : "blue"
                                    }-100`
                                  : ""
                              }`}
                              onClick={(): void =>
                                handleOptionSelect(option.id)
                              }
                            >
                              <div className="text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4 group-hover:shadow-lg transition-shadow duration-300">
                                  <Icon
                                    className={`w-8 h-8 ${option.iconColor}`}
                                  />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                  {option.title}
                                </h3>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                  {option.description}
                                </p>
                                <Link
                                  href={option.route}
                                  className={`inline-block ${option.buttonColor} text-white px-6 py-2 rounded-lg font-medium text-sm ${option.buttonHoverColor} transition-colors duration-300`}
                                >
                                  {option.buttonText}
                                </Link>
                              </div>
                              {isSelected && (
                                <div
                                  className={`absolute inset-0 ${option.pulseColor} bg-opacity-10 rounded-xl animate-pulse`}
                                ></div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom Decorative Element */}
                      <div className="flex justify-center">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                          <div
                            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.1s" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                            style={{ animationDelay: "0.2s" }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile View: Hidden above sm breakpoint, displayed as block below */}
            {/* The ref is attached to this container to detect clicks outside the entire mobile menu unit */}
            <div className="relative block sm:hidden" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-surface-secondary transition-colors duration-200"
                aria-label="Open menu"
              >
                <Icon
                  name="AlignJustify"
                  size={20}
                  className="text-text-primary"
                />
              </button>

              {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-lg shadow-xl z-10 overflow-hidden border border-surface-border">
                  {isAuthenticated || isVendorAuthenticated ? (
                    <>
                      {/* Cart option in mobile menu */}
                      <button
                        onClick={() => setIsCartOpen(true)}
                        className="flex items-center w-full text-left p-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors duration-200"
                      >
                        <Icon name="ShoppingCart" size={16} className="mr-3" />
                        Shopping Cart
                        <div className="ml-auto w-2 h-2 bg-red-500 rounded-full"></div>
                      </button>

                      {/* Logout option in mobile menu */}
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left p-3 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <Icon name="LogOut" size={16} className="mr-3" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        className="block w-full text-left p-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors duration-200"
                        aria-label="Login to your account"
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Link>
                      <button
                        onClick={() => {
                          openModal();
                          setIsOpen(false);
                        }}
                        className="w-full text-left p-3 text-sm font-medium text-text-primary hover:bg-surface-secondary transition-colors duration-200 flex items-center gap-2"
                        aria-label="Start selling"
                      >
                        Get Started
                      </button>
                    </>
                  )}

                  {isModalOpen && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 z-50 animate-fade-in"
                      onClick={closeModal}
                    >
                      {/* Modal Container */}
                      <div
                        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-auto animate-scale-up"
                        onClick={(e: React.MouseEvent<HTMLDivElement>): void =>
                          e.stopPropagation()
                        }
                      >
                        {/* Modal Header */}
                        <div className="relative p-6 pb-4 border-b border-gray-100">
                          <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                          >
                            <X className="w-6 h-6 text-gray-500" />
                          </button>
                          <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-800 mb-2 mt-8">
                              Choose Your Path
                            </h2>
                            <p className="text-gray-600">
                              Select how you'd like to get started with our
                              platform
                            </p>
                          </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-6">
                          {/* Connection Line */}
                          <div className="relative mb-8">
                            <div className="absolute top-1/2 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-200 to-blue-200 transform -translate-y-1/2"></div>
                            <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-purple-400 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                          </div>

                          {/* Options Grid */}
                          <div className="flex justify-center items-center gap-6 mb-6">
                            {modalOptions.map((option: ModalOption) => {
                              const Icon = option.icon;
                              const isSelected = selectedOption === option.id;

                              return (
                                <div
                                  key={option.id}
                                  className={`group relative bg-gradient-to-br ${
                                    option.gradient
                                  } border-2 border-${
                                    option.id === "shopping" ? "purple" : "blue"
                                  }-200 rounded-xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg ${
                                    option.hoverGradient
                                  } hover:scale-105 ${
                                    isSelected
                                      ? `ring-2 ${option.ringColor} bg-${
                                          option.id === "shopping"
                                            ? "purple"
                                            : "blue"
                                        }-100`
                                      : ""
                                  }`}
                                  onClick={(): void =>
                                    handleOptionSelect(option.id)
                                  }
                                >
                                  <Link
                                    href={option.route}
                                    className="block text-center"
                                  >
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-md mb-4 group-hover:shadow-lg transition-shadow duration-300">
                                      <Icon
                                        className={`w-8 h-8 ${option.iconColor}`}
                                      />
                                    </div>
                                    <button
                                      className={`inline-block  text-black px-2 py-2 rounded-lg font-medium text-sm transition-colors duration-300`}
                                    >
                                      {option.buttonText}
                                    </button>
                                  </Link>
                                  {isSelected && (
                                    <div
                                      className={`absolute inset-0 ${option.pulseColor} bg-opacity-10 rounded-xl animate-pulse`}
                                    ></div>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          {/* Bottom Decorative Element */}
                          <div className="flex justify-center">
                            <div className="flex space-x-2">
                              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <CartSystem isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;
