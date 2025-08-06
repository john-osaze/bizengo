"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { LucideIconName } from '@/components/ui/AppIcon';
import NearbyDeals from './home/NearbyDeals';
import RecentlyViewed from './home/RecentlyViewed';
import PopularInArea from './home/PopularInArea';
import QuickActions from './home/QuickActions';
import LocationIndicator from './home/LocationIndicator';
import LandingPage from './home/LandingPage';

// interface QuickFilter {
// 	label: string;
// 	icon: LucideIconName;
// }

interface ProductCategory {
	name: string;
	icon: LucideIconName;
	color: string;
}

// export const metadata = {
// 	title: "Bizengo",
// 	description: "Welcome to Bizengo.",
// 	icons: {
// 		icon: "/images/logo.png",
// 	},
// };

export default function ProductFinder() {
	const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
	const [currentLocation, setCurrentLocation] = useState<string>("Downtown Seattle, WA");
	const router = useRouter();

	const handlePullToRefresh = async () => {
		setIsRefreshing(true);

		await new Promise<void>(resolve => setTimeout(resolve, 1500));
		setIsRefreshing(false);
	};

	const handleLocationChange = () => {

		const locations: string[] = [
			"Downtown Seattle, WA",
			"Capitol Hill, Seattle, WA",
			"Fremont, Seattle, WA",
			"Ballard, Seattle, WA"
		];
		const currentIndex = locations.indexOf(currentLocation);
		const nextIndex = (currentIndex + 1) % locations.length;
		setCurrentLocation(locations[nextIndex]);
	};


	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
			<div className="bg-background">
				{isRefreshing && (
					<div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-elevation-2 rounded-full px-4 py-2">
						<div className="flex items-center space-x-2">
							<div className="animate-spin">

								<Icon name="RefreshCw" size={16} className="text-primary" />
							</div>
							<span className="text-sm text-text-primary">Refreshing...</span>
						</div>
					</div>
				)}

				<div className="w-full">
					<LandingPage />

					<div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
						<LocationIndicator
							location={currentLocation}
							onLocationChange={handleLocationChange}
						/>

						<QuickActions />

						<section className="mb-8">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-heading font-semibold text-text-primary">Nearby Deals</h2>
								<button
									onClick={() => router.push('/search-results?category=deals')}
									className="text-primary text-sm font-medium hover:text-primary-700 transition-colors duration-200"
								>
									View All
								</button>
							</div>
							<NearbyDeals onRefresh={handlePullToRefresh} />
						</section>

						<section className="mb-8">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-heading font-semibold text-text-primary">Recently Viewed</h2>
								<button
									onClick={() => router.push('/user-profile?tab=history')}
									className="text-primary text-sm font-medium hover:text-primary-700 transition-colors duration-200"
								>
									View All
								</button>
							</div>
							<RecentlyViewed />
						</section>

						<section className="mb-8">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-heading font-semibold text-text-primary">Popular in Your Area</h2>
								<button
									onClick={() => router.push('/search-results?sort=popular')}
									className="text-primary text-sm font-medium hover:text-primary-700 transition-colors duration-200"
								>
									View All
								</button>
							</div>
							<PopularInArea />
						</section>

						<section className="mb-8">
							<h2 className="text-xl font-heading font-semibold text-text-primary mb-4">Browse Categories</h2>
							<div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">

								{([
									{ name: "Electronics", icon: "Smartphone", color: "bg-blue-50 text-blue-600" },
									{ name: "Clothing", icon: "Shirt", color: "bg-purple-50 text-purple-600" },
									{ name: "Home & Garden", icon: "Home", color: "bg-green-50 text-green-600" },
									{ name: "Sports", icon: "Dumbbell", color: "bg-orange-50 text-orange-600" },
									{ name: "Books", icon: "Book", color: "bg-indigo-50 text-indigo-600" },
									{ name: "Automotive", icon: "Car", color: "bg-red-50 text-red-600" }
								] as ProductCategory[]).map((category, index) => (
									<button
										key={index}
										onClick={() => router.push(`/search-results?category=${category.name.toLowerCase()}`)}
										className="flex flex-col items-center p-4 rounded-lg border border-border hover:shadow-elevation-1 transition-all duration-200"
									>
										<div className={`w-12 h-12 rounded-lg ${category.color} flex items-center justify-center mb-2`}>
											<Icon name={category.icon} size={24} />
										</div>
										<span className="text-sm font-medium text-text-primary text-center">{category.name}</span>
									</button>
								))}
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}