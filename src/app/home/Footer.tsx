import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
    ShoppingBag,
    Mail,
    Phone,
    MapPin,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Smartphone,
    Shield,
    Clock,
    Users
} from "lucide-react";

const Footer = () => {
    return (
        <footer className="bg-gradient-to-b from-background to-muted/20 pt-16 pb-8">
            <div className="container mx-auto px-4">
                {/* Newsletter Section */}
                <div className="bg-blue-700 rounded-2xl p-8 mb-16 text-center">
                    <h3 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-4">
                        Stay Updated with Local Deals
                    </h3>
                    <p className="text-primary-foreground/90 mb-6 max-w-xl mx-auto">
                        Get notified about the best products and services in your area. No spam, just great local finds.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <Input
                            placeholder="Enter your email"
                            className="bg-background/90 border-0 text-foreground placeholder:text-muted-foreground"
                        />
                        <Button variant="secondary" className="shrink-0">
                            Subscribe
                        </Button>
                    </div>
                </div>

                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-1">
                        <Link href="/" className="block">
                            <div className="flex items-center space-x-3 mb-5">
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-white" />
                                </div>
                                <h1 className="text-lg md:text-xl font-heading font-semibold text-text-primary">
                                    LocalMarket
                                </h1>
                            </div>
                        </Link>
                        <p className="text-muted-foreground mb-4 leading-relaxed">
                            Your trusted local marketplace connecting buyers and sellers in communities across Nigeria.
                        </p>
                        <div className="flex space-x-3">
                            <Button size="icon" variant="ghost" className="hover:bg-primary hover:text-primary-foreground">
                                <Facebook className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="hover:bg-primary hover:text-primary-foreground">
                                <Twitter className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="hover:bg-primary hover:text-primary-foreground">
                                <Instagram className="w-4 h-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="hover:bg-primary hover:text-primary-foreground">
                                <Linkedin className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
                        <ul className="space-y-3 text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Browse Categories</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Featured Listings</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Become a Seller</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">How It Works</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Safety Tips</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Success Stories</a></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Support</h4>
                        <ul className="space-y-3 text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Report an Issue</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Community Guidelines</a></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h4 className="font-semibold text-foreground mb-4">Get in Touch</h4>
                        <div className="space-y-3 text-muted-foreground">
                            <div className="flex items-center space-x-2">
                                <Mail className="w-4 h-4" />
                                <span>support@localmarket.ng</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>+234 800 123 4567</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <MapPin className="w-4 h-4" />
                                <span>Lagos, Nigeria</span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>24/7 Support Available</span>
                            </div>
                        </div>

                        {/* App Download */}
                        <div className="mt-6">
                            <p className="text-sm font-medium text-foreground mb-3">Download Our App</p>
                            <div className="flex flex-col space-y-2">
                                <Button variant="outline" size="sm" className="justify-start">
                                    <Smartphone className="w-4 h-4 mr-2" />
                                    Download for Android
                                </Button>
                                <Button variant="outline" size="sm" className="justify-start">
                                    <Smartphone className="w-4 h-4 mr-2" />
                                    Download for iOS
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trust Indicators */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Shield className="w-6 h-6 text-success" />
                        </div>
                        <div className="font-semibold text-foreground">Secure Payments</div>
                        <div className="text-sm text-muted-foreground">Protected transactions</div>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Users className="w-6 h-6 text-primary" />
                        </div>
                        <div className="font-semibold text-foreground">Verified Sellers</div>
                        <div className="text-sm text-muted-foreground">Trusted community</div>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div className="font-semibold text-foreground">24/7 Support</div>
                        <div className="text-sm text-muted-foreground">Always here to help</div>
                    </div>
                    <div className="text-center">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                            <MapPin className="w-6 h-6 text-warning" />
                        </div>
                        <div className="font-semibold text-foreground">Local Focus</div>
                        <div className="text-sm text-muted-foreground">Community-driven</div>
                    </div>
                </div>

                <Separator className="mb-8" />

                {/* Bottom Section */}
                <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-sm text-muted-foreground">
                        © 2024 LocalMarket. All rights reserved.
                    </div>
                    <div className="flex items-center space-x-4">
                        <Badge variant="secondary">
                            Version 1.0
                        </Badge>
                        <span className="text-sm text-muted-foreground">•</span>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            Status Page
                        </a>
                        <span className="text-sm text-muted-foreground">•</span>
                        <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                            API Docs
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;