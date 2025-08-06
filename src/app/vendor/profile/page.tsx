"use client"
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import Image from '@/components/ui/AppImage';
import MyListings from './components/MyListings';
import Settings from './components/Settings';
import { useRouter } from 'next/navigation';
import { LucideIconName } from '@/components/ui/AppIcon';

interface Tab {
    id: string;
    label: string;
    icon: LucideIconName;
    count?: number;
}

interface QuickAction {
    id: string;
    label: string;
    icon: LucideIconName;
    color: string;
    action?: () => void;
    badge?: number;
}

const UserProfile = () => {
    const [activeTab, setActiveTab] = useState<string>('listings');
    const router = useRouter();

    const userProfile = {
        id: 1,
        name: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+1 (555) 123-4567",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        location: "San Francisco, CA",
        joinDate: "March 2023",
        isVerified: {
            email: true,
            phone: true,
            identity: false
        },
        stats: {
            itemsListed: 24,
            purchasesMade: 18,
            sellerRating: 4.8,
            totalReviews: 32
        },
        bio: `Passionate about sustainable living and finding great deals on quality items. I love connecting with my local community through buying and selling. Always happy to negotiate and provide detailed information about my listings!`
    };

    const tabs: Tab[] = [
        { id: 'listings', label: 'My Listings', icon: 'Package', count: userProfile.stats.itemsListed },
        { id: 'settings', label: 'Settings', icon: 'Settings' }
    ];

    const quickActions: QuickAction[] = [
        {
            id: 'list-item',
            label: 'List New Item',
            icon: 'Plus',
            color: 'bg-primary text-white',
            action: () => router.push('/create-listing')
        },
        {
            id: 'messages',
            label: 'Messages',
            icon: 'MessageCircle',
            color: 'bg-secondary text-white',
            badge: 3
        },
        {
            id: 'account-settings',
            label: 'Account Settings',
            icon: 'User',
            color: 'bg-surface border border-border text-text-primary'
        }
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'listings':
                return <MyListings />;
            case 'settings':
                return <Settings userProfile={userProfile} />;
            default:
                return <MyListings />;
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="md:hidden">

                <div className="bg-surface border-b border-border px-4 py-6">
                    <div className="flex items-center space-x-4 mb-4">
                        {/* Add w-16 h-16 to this relative div */}
                        <div className="relative w-16 h-16">
                            <Image
                                src={userProfile.avatar}
                                alt={userProfile.name}
                                fill
                                // The w-16 h-16 are now on the parent, keep styling for the image itself
                                className="rounded-full object-cover"
                                sizes="64px" // Add sizes prop
                            />
                            {userProfile.isVerified.email && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                    <Icon name="Check" size={12} className="text-white" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1">
                            <h1 className="text-xl font-heading font-semibold text-text-primary">
                                {userProfile.name}
                            </h1>
                            <div className="flex items-center space-x-1 text-text-secondary text-sm">
                                <Icon name="MapPin" size={14} />
                                <span>{userProfile.location}</span>
                            </div>
                            <p className="text-text-tertiary text-xs mt-1">
                                Member since {userProfile.joinDate}
                            </p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center">
                            <div className="text-lg font-semibold text-text-primary">
                                {userProfile.stats.itemsListed}
                            </div>
                            <div className="text-xs text-text-secondary">Listed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-semibold text-text-primary">
                                {userProfile.stats.purchasesMade}
                            </div>
                            <div className="text-xs text-text-secondary">Purchased</div>
                        </div>
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-1">
                                <Icon name="Star" size={14} className="text-warning fill-current" />
                                <span className="text-lg font-semibold text-text-primary">
                                    {userProfile.stats.sellerRating}
                                </span>
                            </div>
                            <div className="text-xs text-text-secondary">
                                ({userProfile.stats.totalReviews} reviews)
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-3 gap-3">
                        {quickActions.map((action) => (
                            <button
                                key={action.id}
                                onClick={action.action}
                                className={`relative p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
                            >
                                <Icon name={action.icon} size={18} className="mx-auto mb-1" />
                                <span className="text-xs font-medium block">{action.label}</span>
                                {action.badge && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                                        {action.badge}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="bg-surface border-b border-border">
                    <div className="flex overflow-x-auto">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-shrink-0 flex items-center space-x-2 px-4 py-3 border-b-2 transition-colors duration-200 ${activeTab === tab.id
                                    ? 'border-primary text-primary bg-primary-50' : 'border-transparent text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                <Icon name={tab.icon} size={16} />
                                <span className="text-sm font-medium">{tab.label}</span>
                                {tab.count && (
                                    <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                                        ? 'bg-primary text-white' : 'bg-surface-secondary text-text-secondary'
                                        }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="p-4">
                    {renderTabContent()}
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:block max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-12 gap-8">
                    {/* Left Sidebar - Profile Info */}
                    <div className="col-span-4">
                        <div className="bg-surface rounded-lg border border-border p-6 mb-6">
                            <div className="text-center mb-6">
                                {/* Add w-24 h-24 and mx-auto to this relative div */}
                                <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto"> {/* Add overflow-hidden for good measure */}
                                    <Image
                                        fill
                                        src={userProfile.avatar}
                                        alt={userProfile.name}
                                        // The w-24 h-24 are now on the parent.
                                        // mx-auto is also on the parent.
                                        className="object-cover" // Keep styling for the image itself
                                        sizes="96px" // Add sizes prop (24 * 4 = 96px)
                                    />
                                    {userProfile.isVerified.email && (
                                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                                            <Icon name="Check" size={12} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <h1 className="text-2xl font-heading font-semibold text-text-primary mt-4">
                                    {userProfile.name}
                                </h1>
                                <div className="flex items-center justify-center space-x-1 text-text-secondary mt-2">
                                    <Icon name="MapPin" size={16} />
                                    <span>{userProfile.location}</span>
                                </div>
                                <p className="text-text-tertiary text-sm mt-1">
                                    Member since {userProfile.joinDate}
                                </p>
                            </div>

                            {/* Verification Badges */}
                            <div className="space-y-2 mb-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Icon name="Mail" size={16} className="text-text-secondary" />
                                        <span className="text-sm text-text-secondary">Email</span>
                                    </div>
                                    {userProfile.isVerified.email ? (
                                        <div className="flex items-center space-x-1 text-success">
                                            <Icon name="Check" size={14} />
                                            <span className="text-xs">Verified</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-text-tertiary">Not verified</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Icon name="Phone" size={16} className="text-text-secondary" />
                                        <span className="text-sm text-text-secondary">Phone</span>
                                    </div>
                                    {userProfile.isVerified.phone ? (
                                        <div className="flex items-center space-x-1 text-success">
                                            <Icon name="Check" size={14} />
                                            <span className="text-xs">Verified</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-text-tertiary">Not verified</span>
                                    )}
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Icon name="Shield" size={16} className="text-text-secondary" />
                                        <span className="text-sm text-text-secondary">Identity</span>
                                    </div>
                                    {userProfile.isVerified.identity ? (
                                        <div className="flex items-center space-x-1 text-success">
                                            <Icon name="Check" size={14} />
                                            <span className="text-xs">Verified</span>
                                        </div>
                                    ) : (
                                        <button className="text-xs text-primary hover:underline">
                                            Verify now
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Bio */}
                            <div className="mb-6">
                                <h3 className="text-sm font-medium text-text-primary mb-2">About</h3>
                                <p className="text-sm text-text-secondary leading-relaxed">
                                    {userProfile.bio}
                                </p>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-3">
                                {quickActions.map((action) => (
                                    <button
                                        key={action.id}
                                        onClick={action.action}
                                        className={`relative w-full flex items-center space-x-3 p-3 rounded-lg transition-colors duration-200 ${action.color} hover:opacity-90`}
                                    >
                                        <Icon name={action.icon} size={18} />
                                        <span className="font-medium">{action.label}</span>
                                        {action.badge && (
                                            <div className="absolute top-2 right-2 w-5 h-5 bg-accent text-white text-xs rounded-full flex items-center justify-center">
                                                {action.badge}
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Stats Card */}
                        <div className="bg-surface rounded-lg border border-border p-6">
                            <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
                                Activity Stats
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Icon name="Package" size={16} className="text-primary" />
                                        <span className="text-sm text-text-secondary">Items Listed</span>
                                    </div>
                                    <span className="font-semibold text-text-primary">
                                        {userProfile.stats.itemsListed}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Icon name="ShoppingBag" size={16} className="text-secondary" />
                                        <span className="text-sm text-text-secondary">Purchases Made</span>
                                    </div>
                                    <span className="font-semibold text-text-primary">
                                        {userProfile.stats.purchasesMade}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Icon name="Star" size={16} className="text-warning" />
                                        <span className="text-sm text-text-secondary">Seller Rating</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="font-semibold text-text-primary">
                                            {userProfile.stats.sellerRating}
                                        </span>
                                        <span className="text-xs text-text-tertiary">
                                            ({userProfile.stats.totalReviews})
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Content Area */}
                    <div className="col-span-8">
                        {/* Tab Navigation */}
                        <div className="bg-surface rounded-lg border border-border mb-6">
                            <div className="flex border-b border-border">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center space-x-2 px-6 py-4 border-b-2 transition-colors duration-200 ${activeTab === tab.id
                                            ? 'border-primary text-primary bg-primary-50' : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-secondary'
                                            }`}
                                    >
                                        <Icon name={tab.icon} size={18} />
                                        <span className="font-medium">{tab.label}</span>
                                        {tab.count && (
                                            <span className={`px-2 py-1 rounded-full text-xs ${activeTab === tab.id
                                                ? 'bg-primary text-white' : 'bg-surface-secondary text-text-secondary'
                                                }`}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {renderTabContent()}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;