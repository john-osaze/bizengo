'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Head from 'next/head'
import VendorHeader from '../dashboard/components/VendorHeader';
import StorefrontCustomization from './components/StorefrontCustomization';
import StorefrontPreview from './components/StorefrontPreview';
import StorefrontSettings from './components/StorefrontSettings';
// import PublicStorefront from './components/PublicStorefront';
import Button from '@/components/ui/alt/ButtonAlt';
import Icon from '@/components/AppIcon';
import MarketplaceBrowse from './marketplace-browse';

interface StorefrontTheme {
	primaryColor: string;
	secondaryColor: string;
	accentColor: string;
	backgroundColor: string;
	textColor: string;
	fontFamily: string;
}

interface StorefrontContact {
	phone: string;
	email: string;
	address: string;
	website: string;
}

interface StorefrontHoursDay {
	open: string;
	close: string;
	closed: boolean;
}

interface StorefrontHours {
	monday: StorefrontHoursDay;
	tuesday: StorefrontHoursDay;
	wednesday: StorefrontHoursDay;
	thursday: StorefrontHoursDay;
	friday: StorefrontHoursDay;
	saturday: StorefrontHoursDay;
	sunday: StorefrontHoursDay;
}

interface StorefrontFeatures {
	onlineOrdering: boolean;
	reservations: boolean;
	delivery: boolean;
	pickup: boolean;
	paymentMethods: string[];
	amenities: string[];
}

interface StorefrontSocialMedia {
	facebook?: string;
	instagram?: string;
	twitter?: string;
}

interface StorefrontData {
	id: string;
	businessName: string;
	slug: string;
	description: string;
	logo: string;
	bannerImage: string;
	theme: StorefrontTheme;
	contact: StorefrontContact;
	hours: StorefrontHours;
	features: StorefrontFeatures;
	socialMedia: StorefrontSocialMedia;
	gallery: string[];
	isPublished: boolean;
	publishedAt: string | null;
	lastUpdated: string;
	views: number;
	clicks: number;
	orders: number;
}

interface VendorData {
	businessName?: string;
	[key: string]: any;
}

type TabId = 'public' | 'preview' | 'customize' | 'settings';

const VendorStorefront: React.FC = () => {
	const router = useRouter();
	const [vendorData, setVendorData] = useState<VendorData | null>(null);
	const [storefrontData, setStorefrontData] = useState<StorefrontData | null>(null);
	const [activeTab, setActiveTab] = useState<TabId>('public');
	const [loading, setLoading] = useState<boolean>(true);
	const [saving, setSaving] = useState<boolean>(false);

	// Mock storefront data
	const mockStorefrontData: StorefrontData = {
		id: 'storefront_001',
		businessName: 'Bella Vista Restaurant',
		slug: 'bella-vista-restaurant',
		description: 'Authentic Italian cuisine in the heart of downtown. Family-owned restaurant serving traditional recipes.',
		logo: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&crop=center',
		bannerImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&h=400&fit=crop',
		theme: {
			primaryColor: '#D97706',
			secondaryColor: '#92400E',
			accentColor: '#F59E0B',
			backgroundColor: '#FFFBEB',
			textColor: '#1F2937',
			fontFamily: 'Inter'
		},
		contact: {
			phone: '+1 (555) 123-4567',
			email: 'hello@bellavista.com',
			address: '123 Main Street, Downtown, NY 10001',
			website: 'https://bellavista-restaurant.com'
		},
		hours: {
			monday: { open: '11:00', close: '22:00', closed: false },
			tuesday: { open: '11:00', close: '22:00', closed: false },
			wednesday: { open: '11:00', close: '22:00', closed: false },
			thursday: { open: '11:00', close: '22:00', closed: false },
			friday: { open: '11:00', close: '23:00', closed: false },
			saturday: { open: '11:00', close: '23:00', closed: false },
			sunday: { open: '12:00', close: '21:00', closed: false }
		},
		features: {
			onlineOrdering: true,
			reservations: true,
			delivery: true,
			pickup: true,
			paymentMethods: ['credit', 'debit', 'cash', 'digital'],
			amenities: ['wifi', 'parking', 'wheelchair', 'outdoor']
		},
		socialMedia: {
			facebook: 'https://facebook.com/bellavista',
			instagram: 'https://instagram.com/bellavista',
			twitter: 'https://twitter.com/bellavista'
		},
		gallery: [
			'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400',
			'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=400',
			'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400'
		],
		isPublished: true,
		publishedAt: '2024-01-10T00:00:00Z',
		lastUpdated: '2024-01-15T12:30:00Z',
		views: 1247,
		clicks: 89,
		orders: 23
	};

	useEffect(() => {
		// Check if vendor is authenticated
		const isLoggedIn = localStorage.getItem('isVendorLoggedIn');
		if (!isLoggedIn) {
			router.push('/vendor-auth');
			return;
		}

		// Load vendor data
		const vendor = JSON.parse(localStorage.getItem('vendorAuth') || '{}');
		setVendorData(vendor);

		// Load storefront data
		loadStorefrontData();
	}, [router]);

	const loadStorefrontData = async () => {
		setLoading(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			setStorefrontData(mockStorefrontData);
		} catch (error) {
			console.error('Failed to load storefront data:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleSaveStorefront = async (updatedData: Partial<StorefrontData>) => {
		setSaving(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1500));
			setStorefrontData(prev => prev ? ({
				...prev,
				...updatedData,
				lastUpdated: new Date().toISOString()
			}) : prev);

			// Show success message
			if (navigator.vibrate) {
				navigator.vibrate(50);
			}
		} catch (error) {
			console.error('Failed to save storefront:', error);
			alert('Failed to save changes. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const handlePublishStorefront = async () => {
		setSaving(true);
		try {
			// Simulate API call
			await new Promise(resolve => setTimeout(resolve, 1000));
			setStorefrontData(prev => prev ? ({
				...prev,
				isPublished: !prev.isPublished,
				publishedAt: !prev.isPublished ? new Date().toISOString() : null
			}) : prev);
		} catch (error) {
			console.error('Failed to publish storefront:', error);
			alert('Failed to publish storefront. Please try again.');
		} finally {
			setSaving(false);
		}
	};

	const handleLogout = () => {
		localStorage.removeItem('vendorAuth');
		localStorage.removeItem('isVendorLoggedIn');
		router.push('../vendor-auth');
	};

	const getStorefrontUrl = () => {
		return `${window.location.origin}/storefront/${storefrontData?.slug}`;
	};

	const tabs: { id: TabId; label: string; icon: string; description: string }[] = [
		{
			id: 'public',
			label: 'Public View',
			icon: 'ExternalLink',
			description: 'Customer view'
		},
		{
			id: 'preview',
			label: 'Preview',
			icon: 'Eye',
			description: 'See how it looks'
		}, 
		{
			id: 'customize',
			label: 'Customize',
			icon: 'Palette',
			description: 'Design your storefront'
		},
		{
			id: 'settings',
			label: 'Settings',
			icon: 'Settings',
			description: 'Configure options'
		},
	];

	if (loading) {
		return (
			<div className="min-h-screen bg-background">
				<VendorHeader vendorData={vendorData ?? undefined} onLogout={handleLogout} />
				<div className="flex items-center justify-center py-20">
					<div className="text-center">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
						<p className="text-text-muted">Loading storefront...</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<Head>
				<title>Storefront - {vendorData?.businessName || 'Business'}</title>
				<meta name="description" content="Design and manage your online storefront" />
			</Head>

			<div className="min-h-screen bg-background">
				<VendorHeader vendorData={vendorData ?? undefined} onLogout={handleLogout} />

				<main className="max-w-[85vw] mx-auto px-4 py-6">
					{/* Page Header */}
					<div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
						<div>
							<h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
								Storefront Manager
							</h1>
							<p className="text-text-muted">
								Customize your online presence and attract more customers
							</p>
						</div>

						<div className="flex items-center space-x-3 mt-4 lg:mt-0">
							{storefrontData?.isPublished && (
								<Button
									variant="outline"
									onClick={() => window.open(getStorefrontUrl(), '_blank')}
								>
									<Icon name="ExternalLink" size={16} className="mr-2" />
									View Live
								</Button>
							)}

							<Button
								variant={storefrontData?.isPublished ? "secondary" : "primary"}
								onClick={handlePublishStorefront}
								disabled={saving}
							>
								{saving ? (
									<Icon name="Loader2" size={16} className="animate-spin mr-2" />
								) : (
									<Icon name={storefrontData?.isPublished ? "EyeOff" : "Eye"} size={16} className="mr-2" />
								)}
								{storefrontData?.isPublished ? 'Unpublish' : 'Publish'}
							</Button>
						</div>
					</div>

					{/* Status Banner */}
					{storefrontData && (
						<div className={`p-4 rounded-lg mb-6 ${storefrontData.isPublished
							? 'bg-success-50 border border-success-200' : 'bg-warning-50 border border-warning-200'
							}`}>
							<div className="flex items-center justify-between">
								<div className="flex items-center space-x-3">
									<div className={`w-3 h-3 rounded-full ${storefrontData.isPublished ? 'bg-success' : 'bg-warning'
										}`}></div>
									<div>
										<p className={`font-medium ${storefrontData.isPublished ? 'text-success-700' : 'text-warning-700'
											}`}>
											{storefrontData.isPublished ? 'Storefront is Live' : 'Storefront is Draft'}
										</p>
										<p className={`text-sm ${storefrontData.isPublished ? 'text-success-600' : 'text-warning-600'
											}`}>
											{storefrontData.isPublished
												? `Customers can find you at: ${getStorefrontUrl()}`
												: 'Publish your storefront to make it visible to customers'
											}
										</p>
									</div>
								</div>

								{storefrontData.isPublished && (
									<div className="text-right text-sm text-success-600">
										<p>{storefrontData.views} views</p>
										<p>{storefrontData.clicks} clicks</p>
									</div>
								)}
							</div>
						</div>
					)}

					{/* Tab Navigation */}
					<div className="flex items-center space-x-1 mb-8 border-b border-border overflow-x-auto">
						{tabs.map((tab) => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex items-center space-x-2 px-4 py-3 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === tab.id
									? 'border-primary text-primary' : 'border-transparent text-text-muted hover:text-text-secondary hover:border-border'
									}`}
							>
								<Icon name={tab.icon} size={16} />
								<span>{tab.label}</span>
							</button>
						))}
					</div>

					{/* Tab Content */}
					<div>
						{activeTab === 'public' && (
							// <PublicStorefront
							// 	storefrontData={storefrontData}
							// 	isPreview={true}
							// />
							<MarketplaceBrowse />
						)}

						{activeTab === 'preview' && (
							// <StorefrontPreview
							// 	storefrontData={storefrontData}
							// />
							<MarketplaceBrowse />
						)}

						{activeTab === 'settings' && (
							<StorefrontSettings
								storefrontData={storefrontData}
								onSave={handleSaveStorefront}
								saving={saving}
							/>
						)}

						{activeTab === 'customize' && (
							<StorefrontCustomization
								storefrontData={storefrontData}
								onSave={handleSaveStorefront}
								saving={saving}
							/>
						)}
					</div>
				</main>
			</div>
		</>
	);
};

export default VendorStorefront;