import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import CustomerBottomTabs from '@/components/ui/CustomerBottomTabs';
import LocationHeader from '@/components/ui/LocationHeader';
import BusinessHero from './components/BusinessHero';
import TabNavigation from './components/TabNavigation';
import ProductGrid from './components/ProductGrid';
import AboutSection from './components/AboutSection';
import ReviewsSection from './components/ReviewSection';
import ContactSection from './components/ContactSection';

// Type Definitions
interface Business {
	id: number;
	name: string;
	category: string;
	rating: number;
	reviewCount: number;
	isOpen: boolean;
	nextOpenTime: string | null;
	phone: string;
	email: string;
	website: string;
	address: string;
	todayHours: string;
	established: string;
	teamSize: number;
	coverImage: string;
	logo: string;
	description: string;
	story: string;
	specialties: string[];
	coordinates: {
		lat: number;
		lng: number;
	};
	hours: Array<{
		day: string;
		hours: string;
		isToday: boolean;
	}>;
	gallery: Array<{
		url: string;
		caption: string;
	}>;
	team: Array<{
		name: string;
		role: string;
		photo: string;
	}>;
	socialMedia: {
		facebook: string;
		instagram: string;
		twitter: string;
	};
}

interface Product {
	id: number;
	name: string;
	description: string;
	price: number;
	originalPrice: number | null;
	image: string;
	stock: number;
	rating: number;
	reviewCount: number;
	discount: number | null;
}

interface Review {
	id: number;
	user: {
		name: string;
		avatar: string;
	};
	rating: number;
	date: string;
	comment: string;
	images: string[];
	helpfulCount: number;
	businessReply: {
		date: string;
		message: string;
	} | null;
}

interface BusinessRating {
	average: number;
	total: number;
}

interface Tab {
	id: string;
	label: string;
	count?: number;
}

interface MessageData {
	message: string;
	contactInfo?: {
		name: string;
		email?: string;
		phone?: string;
	};
}

type TabId = 'products' | 'about' | 'reviews' | 'contact';

const BusinessStorefrontView: React.FC = () => {
	const { businessId } = useParams<{ businessId: string }>();
	const [activeTab, setActiveTab] = useState<TabId>('products');
	const [business, setBusiness] = useState<Business | null>(null);
	const [products, setProducts] = useState<Product[]>([]);
	const [reviews, setReviews] = useState<Review[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	// Mock business data
	const mockBusiness: Business = {
		id: 1,
		name: "Artisan Coffee Roasters",
		category: "Coffee Shop & Roastery",
		rating: 4.8,
		reviewCount: 247,
		isOpen: true,
		nextOpenTime: null,
		phone: "(555) 123-4567",
		email: "hello@artisancoffee.com",
		website: "https://artisancoffee.com",
		address: "123 Main Street, Downtown District, City 12345",
		todayHours: "6:00 AM - 8:00 PM",
		established: "2018",
		teamSize: 12,
		coverImage: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=400&fit=crop",
		logo: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=200&h=200&fit=crop",
		description: `Welcome to Artisan Coffee Roasters, where passion meets perfection in every cup. We are a locally-owned coffee shop dedicated to sourcing the finest beans from around the world and roasting them to perfection right here in our downtown location.\n\nOur commitment to quality extends beyond just great coffee. We believe in building community, supporting local farmers, and creating a warm, welcoming space where neighbors can connect over exceptional beverages and fresh-baked pastries.`,
		story: `Founded in 2018 by coffee enthusiasts Maria and James Rodriguez, Artisan Coffee Roasters began as a dream to bring authentic, small-batch coffee to our community. After traveling extensively and learning from master roasters across three continents, they returned home with a mission to share their passion for exceptional coffee.\n\nWhat started as a small 20-seat café has grown into a beloved neighborhood institution, but we've never lost sight of our core values: quality, community, and craftsmanship.`,
		specialties: ["Single Origin Coffee", "Cold Brew", "Artisan Pastries", "Coffee Education", "Custom Roasting"],
		coordinates: {
			lat: 40.7128,
			lng: -74.0060
		},
		hours: [
			{ day: "Monday", hours: "6:00 AM - 8:00 PM", isToday: false },
			{ day: "Tuesday", hours: "6:00 AM - 8:00 PM", isToday: true },
			{ day: "Wednesday", hours: "6:00 AM - 8:00 PM", isToday: false },
			{ day: "Thursday", hours: "6:00 AM - 8:00 PM", isToday: false },
			{ day: "Friday", hours: "6:00 AM - 9:00 PM", isToday: false },
			{ day: "Saturday", hours: "7:00 AM - 9:00 PM", isToday: false },
			{ day: "Sunday", hours: "7:00 AM - 7:00 PM", isToday: false }
		],
		gallery: [
			{ url: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400&h=400&fit=crop", caption: "Our cozy interior" },
			{ url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop", caption: "Fresh roasted beans" },
			{ url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop", caption: "Artisan pastries" },
			{ url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&h=400&fit=crop", caption: "Coffee roasting process" }
		],
		team: [
			{ name: "Maria Rodriguez", role: "Owner & Head Roaster", photo: "https://randomuser.me/api/portraits/women/32.jpg" },
			{ name: "James Rodriguez", role: "Owner & Café Manager", photo: "https://randomuser.me/api/portraits/men/45.jpg" },
			{ name: "Sarah Chen", role: "Barista & Trainer", photo: "https://randomuser.me/api/portraits/women/28.jpg" }
		],
		socialMedia: {
			facebook: "https://facebook.com/artisancoffee",
			instagram: "https://instagram.com/artisancoffee",
			twitter: "https://twitter.com/artisancoffee"
		}
	};

	// Mock products data
	const mockProducts: Product[] = [
		{
			id: 1,
			name: "Ethiopian Yirgacheffe",
			description: "Bright, floral notes with citrus undertones",
			price: 18.99,
			originalPrice: null,
			image: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=300&fit=crop",
			stock: 15,
			rating: 4.9,
			reviewCount: 23,
			discount: null
		},
		{
			id: 2,
			name: "Colombian Supremo",
			description: "Rich, full-bodied with chocolate notes",
			price: 16.99,
			originalPrice: 19.99,
			image: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300&h=300&fit=crop",
			stock: 8,
			rating: 4.7,
			reviewCount: 31,
			discount: 15
		},
		{
			id: 3,
			name: "House Blend Espresso",
			description: "Perfect balance for espresso drinks",
			price: 14.99,
			originalPrice: null,
			image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
			stock: 22,
			rating: 4.8,
			reviewCount: 45,
			discount: null
		},
		{
			id: 4,
			name: "Guatemalan Antigua",
			description: "Smoky, spicy with hints of cocoa",
			price: 17.99,
			originalPrice: null,
			image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=300&fit=crop",
			stock: 0,
			rating: 4.6,
			reviewCount: 18,
			discount: null
		},
		{
			id: 5,
			name: "Cold Brew Concentrate",
			description: "Smooth, concentrated cold brew",
			price: 12.99,
			originalPrice: null,
			image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=300&h=300&fit=crop",
			stock: 12,
			rating: 4.9,
			reviewCount: 67,
			discount: null
		},
		{
			id: 6,
			name: "Artisan Croissants",
			description: "Buttery, flaky French pastries",
			price: 3.99,
			originalPrice: null,
			image: "https://images.unsplash.com/photo-1555507036-ab794f4ade2a?w=300&h=300&fit=crop",
			stock: 6,
			rating: 4.7,
			reviewCount: 89,
			discount: null
		}
	];

	// Mock reviews data
	const mockReviews: Review[] = [
		{
			id: 1,
			user: {
				name: "Sarah Johnson",
				avatar: "https://randomuser.me/api/portraits/women/44.jpg"
			},
			rating: 5,
			date: "2025-01-20",
			comment: "Absolutely love this place! The Ethiopian Yirgacheffe is incredible - so bright and floral. The staff is knowledgeable and passionate about coffee. This has become my daily stop before work.",
			images: ["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=200&h=200&fit=crop"],
			helpfulCount: 12,
			businessReply: {
				date: "2025-01-21",
				message: "Thank you so much, Sarah! We're thrilled you love the Ethiopian Yirgacheffe - it's one of our favorites too. See you tomorrow morning!"
			}
		},
		{
			id: 2,
			user: {
				name: "Mike Chen",
				avatar: "https://randomuser.me/api/portraits/men/22.jpg"
			},
			rating: 4,
			date: "2025-01-18",
			comment: "Great coffee and atmosphere. The cold brew is smooth and not too acidic. Only wish they had more seating during peak hours, but that's a good problem to have!",
			images: [],
			helpfulCount: 8,
			businessReply: null
		},
		{
			id: 3,
			user: {
				name: "Emily Rodriguez",
				avatar: "https://randomuser.me/api/portraits/women/67.jpg"
			},
			rating: 5,
			date: "2025-01-15",
			comment: "The best coffee shop in the city! Maria and James have created something special here. The house blend espresso makes perfect lattes, and the croissants are to die for. Highly recommend!",
			images: [],
			helpfulCount: 15,
			businessReply: {
				date: "2025-01-16",
				message: "Emily, your kind words mean the world to us! Thank you for being such a wonderful part of our coffee community."
			}
		}
	];

	const mockBusinessRating: BusinessRating = {
		average: 4.8,
		total: 247
	};

	const tabs: Tab[] = [
		{ id: 'products', label: 'Products', count: mockProducts.length },
		{ id: 'about', label: 'About' },
		{ id: 'reviews', label: 'Reviews', count: mockReviews.length },
		{ id: 'contact', label: 'Contact' }
	];

	useEffect(() => {
		// Simulate API call
		const loadBusinessData = async (): Promise<void> => {
			setLoading(true);
			await new Promise(resolve => setTimeout(resolve, 1000));

			setBusiness(mockBusiness);
			setProducts(mockProducts);
			setReviews(mockReviews);
			setLoading(false);
		};

		loadBusinessData();
	}, [businessId]);

	const handleContactClick = (): void => {
		if (business?.phone) {
			window.location.href = `tel:${business.phone}`;
		}
	};

	const handleDirectionsClick = (): void => {
		if (business?.address) {
			const address = encodeURIComponent(business.address);
			window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank');
		}
	};

	const handleShareClick = (): void => {
		if (!business) return;

		if (navigator.share) {
			navigator.share({
				title: business.name,
				text: `Check out ${business.name} - ${business.category}`,
				url: window.location.href
			}).catch(console.error);
		} else {
			navigator.clipboard.writeText(window.location.href).then(() => {
				alert('Link copied to clipboard!');
			}).catch(() => {
				alert('Failed to copy link');
			});
		}
	};

	const handleProductClick = (product: Product): void => {
		console.log('View product details:', product);
	};

	const handleAddToCart = (product: Product): void => {
		console.log('Add to cart:', product);
		alert(`${product.name} added to cart!`);
	};

	const handleWriteReview = (): void => {
		console.log('Open review modal');
		alert('Review form would open here');
	};

	const handleSendMessage = async (messageData: MessageData): Promise<void> => {
		console.log('Send message:', messageData);
		await new Promise(resolve => setTimeout(resolve, 1000));
		alert('Message sent successfully!');
	};

	const renderTabContent = (): React.ReactNode => {
		switch (activeTab) {
			case 'products':
				return (
					<ProductGrid
						products={products}
						onProductClick={handleProductClick}
						onAddToCart={handleAddToCart}
					/>
				);
			case 'about':
				return business ? <AboutSection business={business} /> : null;
			case 'reviews':
				return (
					<ReviewsSection
						reviews={reviews}
						businessRating={mockBusinessRating}
						onWriteReview={handleWriteReview}
					/>
				);
			case 'contact':
				return (
					<ContactSection
						business={business}
						onSendMessage={handleSendMessage}
					/>
				);
			default:
				return null;
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<LocationHeader context="customer" />
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-text-secondary">Loading business information...</p>
					</div>
				</div>
				<CustomerBottomTabs />
			</div>
		);
	}

	if (!business) {
		return (
			<div className="min-h-screen bg-background">
				<LocationHeader context="customer" />
				<div className="flex items-center justify-center h-96">
					<div className="text-center">
						<h2 className="text-xl font-semibold text-text-primary mb-2">Business Not Found</h2>
						<p className="text-text-secondary">The business you're looking for doesn't exist.</p>
					</div>
				</div>
				<CustomerBottomTabs />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<LocationHeader context="customer" />

			<BusinessHero
				business={business}
				onContactClick={handleContactClick}
				onDirectionsClick={handleDirectionsClick}
				onShareClick={handleShareClick}
			/>

			<TabNavigation
				activeTab={activeTab}
				onTabChange={(tabId) => setActiveTab(tabId as TabId)}
				tabs={tabs}
			/>

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 lg:pb-8">
				{renderTabContent()}
			</main>

			{/* <CustomerBottomTabs /> */}
		</div>
	);
};

export default BusinessStorefrontView;