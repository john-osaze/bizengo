import React, { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useRole } from './RoleContextNavigation';

interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  notifications?: number;
}

const CustomerGlobalHeader: React.FC = () => {
	const [isSearchFocused, setIsSearchFocused] = useState < boolean > (false);
	const [searchQuery, setSearchQuery] = useState < string > ('');
	const [cartCount, setCartCount] = useState < number > (2);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState < boolean > (false);
	const [isScrolled, setIsScrolled] = useState < boolean > (false);
	const [lastScrollY, setLastScrollY] = useState < number > (0);
	const [isVisible, setIsVisible] = useState < boolean > (true);

	const location = useLocation();
	const navigate = useNavigate();
	const { logout } = useRole();
	const userMenuRef = useRef < HTMLDivElement > (null);

	useEffect(() => {
		const handleScroll = (): void => {
			const currentScrollY = window.scrollY;

			if (currentScrollY > 100) {
				setIsScrolled(true);
			} else {
				setIsScrolled(false);
			}

			if (currentScrollY > lastScrollY && currentScrollY > 100) {
				setIsVisible(false);
			} else {
				setIsVisible(true);
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		return () => window.removeEventListener('scroll', handleScroll);
	}, [lastScrollY]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent): void => {
			if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
				setIsUserMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	const handleNavigation = (path: string): void => {
		navigate(path);
	};

	const handleSearch = (e: FormEvent<HTMLFormElement>): void => {
		e.preventDefault();
		if (searchQuery.trim()) {
			navigate(`/marketplace-browse?search=${encodeURIComponent(searchQuery)}`);
		}
	};

	const handleSearchInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
		setSearchQuery(e.target.value);
	};

	const handleLogout = (): void => {
		logout();
		navigate('/');
		setIsUserMenuOpen(false);
	};

	const navigationItems: NavigationItem[] = [
		{
			label: 'Browse',
			path: '/marketplace-browse',
			icon: 'Search'
		},
		{
			label: 'My Account',
			path: '/customer-account-dashboard',
			icon: 'User'
		}
	];

	const isActive = (path: string): boolean => location.pathname === path;

	return (
		<header
			className={`
        fixed top-0 left-0 right-0 z-1000 bg-card border-b border-border transition-all duration-300 ease-in-out
        ${isScrolled ? 'shadow-card' : ''}
        ${isVisible ? 'translate-y-0' : '-translate-y-full'}
      `}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<div className="flex items-center">
						<button
							onClick={() => handleNavigation('/marketplace-browse')}
							className="flex items-center space-x-2"
						>
							<div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
								<Icon name="Store" size={20} color="white" />
							</div>
							<span className="font-semibold text-xl text-foreground">VendorHub Pro</span>
						</button>
					</div>

					{/* Search Bar - Desktop */}
					<div className="hidden md:flex flex-1 max-w-lg mx-8">
						<form onSubmit={handleSearch} className="w-full">
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Icon name="Search" size={20} className="text-muted-foreground" />
								</div>
								<input
									type="text"
									value={searchQuery}
									onChange={handleSearchInputChange}
									onFocus={() => setIsSearchFocused(true)}
									onBlur={() => setIsSearchFocused(false)}
									placeholder="Search products, vendors..."
									className={`
                    block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background
                    placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                    transition-all duration-200 ease-out
                    ${isSearchFocused ? 'shadow-modal' : 'shadow-card'}
                  `}
								/>
							</div>
						</form>
					</div>

					{/* Navigation & Actions */}
					<div className="flex items-center space-x-4">
						{/* Desktop Navigation */}
						<nav className="hidden md:flex items-center space-x-6">
							{navigationItems.map((item) => (
								<button
									key={item.path}
									onClick={() => handleNavigation(item.path)}
									className={`
                    flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-smooth
                    ${isActive(item.path)
											? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
										}
                  `}
								>
									<Icon name={item.icon} size={16} />
									<span>{item.label}</span>
								</button>
							))}
						</nav>

						{/* Cart */}
						<button
							onClick={() => handleNavigation('/checkout-process')}
							className="relative p-2 text-muted-foreground hover:text-foreground transition-smooth"
						>
							<Icon name="ShoppingCart" size={24} />
							{cartCount > 0 && (
								<span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
									{cartCount}
								</span>
							)}
						</button>

						{/* User Menu */}
						<div className="relative" ref={userMenuRef}>
							<button
								onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
								className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted transition-smooth"
							>
								<div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
									<Icon name="User" size={16} />
								</div>
								<Icon name="ChevronDown" size={16} className="text-muted-foreground" />
							</button>

							{isUserMenuOpen && (
								<div className="absolute right-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-dropdown z-1300">
									<div className="py-1">
										<div className="px-4 py-2 border-b border-border">
											<p className="text-sm font-medium text-foreground">Jane Customer</p>
											<p className="text-xs text-muted-foreground">jane@customer.com</p>
										</div>
										<button
											onClick={() => {
												handleNavigation('/customer-account-dashboard');
												setIsUserMenuOpen(false);
											}}
											className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
										>
											My Account
										</button>
										<button
											onClick={() => {
												handleNavigation('/order-history');
												setIsUserMenuOpen(false);
											}}
											className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
										>
											Order History
										</button>
										<button
											onClick={() => {
												handleNavigation('/settings');
												setIsUserMenuOpen(false);
											}}
											className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
										>
											Settings
										</button>
										<div className="border-t border-border">
											<button
												onClick={handleLogout}
												className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-smooth"
											>
												Logout
											</button>
										</div>
									</div>
								</div>
							)}
						</div>

						{/* Mobile Search Toggle */}
						<button
							className="md:hidden p-2 text-muted-foreground hover:text-foreground transition-smooth"
							onClick={() => setIsSearchFocused(!isSearchFocused)}
						>
							<Icon name="Search" size={24} />
						</button>
					</div>
				</div>

				{/* Mobile Search Bar */}
				{isSearchFocused && (
					<div className="md:hidden pb-4">
						<form onSubmit={handleSearch}>
							<div className="relative">
								<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
									<Icon name="Search" size={20} className="text-muted-foreground" />
								</div>
								<input
									type="text"
									value={searchQuery}
									onChange={handleSearchInputChange}
									placeholder="Search products, vendors..."
									className="block w-full pl-10 pr-3 py-2 border border-border rounded-lg bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
									autoFocus
								/>
							</div>
						</form>
					</div>
				)}
			</div>

			{/* Mobile Bottom Navigation */}
			<div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-1000">
				<div className="flex items-center justify-around py-2">
					{navigationItems.map((item) => (
						<button
							key={item.path}
							onClick={() => handleNavigation(item.path)}
							className={`
                flex flex-col items-center space-y-1 px-3 py-2 rounded-md transition-smooth
                ${isActive(item.path)
									? 'text-primary' : 'text-muted-foreground hover:text-foreground'
								}
              `}
						>
							<Icon name={item.icon} size={20} />
							<span className="text-xs">{item.label}</span>
						</button>
					))}
					<button
						onClick={() => handleNavigation('/checkout-process')}
						className="relative flex flex-col items-center space-y-1 px-3 py-2 rounded-md text-muted-foreground hover:text-foreground transition-smooth"
					>
						<Icon name="ShoppingCart" size={20} />
						<span className="text-xs">Cart</span>
						{cartCount > 0 && (
							<span className="absolute -top-1 right-2 w-4 h-4 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
								{cartCount}
							</span>
						)}
					</button>
				</div>
			</div>
		</header>
	);
};

export default CustomerGlobalHeader;