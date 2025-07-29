"use client";

import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation'
// import { Helmet } from 'react-helmet';
import Button from '@/components/ui/ButtonAlt';
import Input from '@/components/ui/NewInput';
import Icon from '@/components/AppIcon';

interface FormData {
	email: string;
	password: string;
	businessName: string;
	firstName: string;
	lastName: string;
	phone: string;
	businessType: string;
	confirmPassword: string;
}

interface Errors {
	email?: string;
	password?: string;
	businessName?: string;
	firstName?: string;
	lastName?: string;
	phone?: string;
	businessType?: string;
	confirmPassword?: string;
	submit?: string;
}

const businessTypes = [
	{ value: 'restaurant', label: 'Restaurant' },
	{ value: 'retail', label: 'Retail Store' },
	{ value: 'service', label: 'Service Provider' },
	{ value: 'healthcare', label: 'Healthcare' },
	{ value: 'beauty', label: 'Beauty & Wellness' },
	{ value: 'automotive', label: 'Automotive' },
	{ value: 'home', label: 'Home & Garden' },
	{ value: 'entertainment', label: 'Entertainment' },
	{ value: 'other', label: 'Other' }
];

const VendorAuth: React.FC = () => {
	const router = useRouter();
	const [isLogin, setIsLogin] = useState<boolean>(true);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [formData, setFormData] = useState<FormData>({
		email: '',
		password: '',
		businessName: '',
		firstName: '',
		lastName: '',
		phone: '',
		businessType: '',
		confirmPassword: ''
	});
	const [errors, setErrors] = useState<Errors>({});

	const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
		if (errors[name as keyof Errors]) {
			setErrors(prev => ({
				...prev,
				[name]: ''
			}));
		}
	};

	const validateForm = (): boolean => {
		const newErrors: Errors = {};

		if (!formData.email) {
			newErrors.email = 'Email is required';
		} else if (!/\S+@\S+\.\S+/.test(formData.email)) {
			newErrors.email = 'Please enter a valid email';
		}

		if (!formData.password) {
			newErrors.password = 'Password is required';
		} else if (formData.password.length < 6) {
			newErrors.password = 'Password must be at least 6 characters';
		}

		if (!isLogin) {
			if (!formData.businessName) {
				newErrors.businessName = 'Business name is required';
			}
			if (!formData.firstName) {
				newErrors.firstName = 'First name is required';
			}
			if (!formData.lastName) {
				newErrors.lastName = 'Last name is required';
			}
			if (!formData.phone) {
				newErrors.phone = 'Phone number is required';
			}
			if (!formData.businessType) {
				newErrors.businessType = 'Business type is required';
			}
			if (!formData.confirmPassword) {
				newErrors.confirmPassword = 'Please confirm your password';
			} else if (formData.password !== formData.confirmPassword) {
				newErrors.confirmPassword = 'Passwords do not match';
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			await new Promise(resolve => setTimeout(resolve, 1500));

			const vendorData = {
				id: 'vendor_' + Date.now(),
				email: formData.email,
				businessName: formData.businessName || 'My Business',
				firstName: formData.firstName || 'John',
				lastName: formData.lastName || 'Doe',
				phone: formData.phone || '+1-555-0123',
				businessType: formData.businessType || 'other',
				isVerified: false,
				joinDate: new Date().toISOString(),
				profileComplete: !isLogin ? 50 : 100
			};

			localStorage.setItem('vendorAuth', JSON.stringify(vendorData));
			localStorage.setItem('isVendorLoggedIn', 'true');
			router.push('../dashboard');
		} catch (error) {
			setErrors({ submit: 'Authentication failed. Please try again.' });
		} finally {
			setIsLoading(false);
		}
	};

	const handleGoogleAuth = async () => {
		setIsLoading(true);

		try {
			await new Promise(resolve => setTimeout(resolve, 1000));

			const vendorData = {
				id: 'vendor_google_' + Date.now(),
				email: 'demo@example.com',
				businessName: 'Demo Business',
				firstName: 'Demo',
				lastName: 'User',
				phone: '+1-555-0123',
				businessType: 'retail',
				isVerified: true,
				joinDate: new Date().toISOString(),
				profileComplete: 100,
				authProvider: 'google'
			};

			localStorage.setItem('vendorAuth', JSON.stringify(vendorData));
			localStorage.setItem('isVendorLoggedIn', 'true');
			router.push('../dashboard');
		} catch (error) {
			setErrors({ submit: 'Google authentication failed. Please try again.' });
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* <Helmet>
        <title>{isLogin ? 'Vendor Login' : 'Vendor Registration'} - HyperLocal Discovery</title>
        <meta name="description" content={isLogin ? 'Login to your vendor account' : 'Create your vendor account and start selling online'} />
      </Helmet> */}

			<div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
				<div className="max-w-md w-full">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="w-16 h-16 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
							<Icon name="Store" size={32} color="white" />
						</div>
						<h1 className="font-heading font-bold text-2xl text-text-primary mb-2">
							{isLogin ? 'Welcome Back' : 'Start Selling Online'}
						</h1>
						<p className="text-text-muted">
							{isLogin
								? 'Sign in to your vendor account'
								: 'Create your storefront and reach more customers'
							}
						</p>
					</div>

					{/* Auth Form */}
					<div className="bg-card rounded-2xl shadow-elevated p-6 mb-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							{/* Registration Fields */}
							{!isLogin && (
								<>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Input
												label="First Name"
												name="firstName"
												value={formData.firstName}
												onChange={handleInputChange}
												error={errors.firstName}
												required
											/>
										</div>
										<div>
											<Input
												label="Last Name"
												name="lastName"
												value={formData.lastName}
												onChange={handleInputChange}
												error={errors.lastName}
												required
											/>
										</div>
									</div>

									<Input
										label="Business Name"
										name="businessName"
										value={formData.businessName}
										onChange={handleInputChange}
										error={errors.businessName}
										placeholder="Enter your business name"
										required
									/>

									<Input
										label="Phone Number"
										name="phone"
										type="tel"
										value={formData.phone}
										onChange={handleInputChange}
										error={errors.phone}
										placeholder="+1 (555) 123-4567"
										required
									/>

									<div>
										<label className="block text-sm font-medium text-text-secondary mb-2">
											Business Type *
										</label>
										<select
											name="businessType"
											value={formData.businessType}
											onChange={handleInputChange}
											className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary ${errors.businessType ? 'border-error' : 'border-border'
												}`}
											required
										>
											<option value="">Select business type</option>
											{businessTypes.map(type => (
												<option key={type.value} value={type.value}>
													{type.label}
												</option>
											))}
										</select>
										{errors.businessType && (
											<p className="text-error text-sm mt-1">{errors.businessType}</p>
										)}
									</div>
								</>
							)}

							{/* Common Fields */}
							<Input
								label="Email Address"
								name="email"
								type="email"
								value={formData.email}
								onChange={handleInputChange}
								error={errors.email}
								placeholder="Enter your email"
								required
							/>

							<Input
								label="Password"
								name="password"
								type="password"
								value={formData.password}
								onChange={handleInputChange}
								error={errors.password}
								placeholder="Enter your password"
								required
							/>

							{!isLogin && (
								<Input
									label="Confirm Password"
									name="confirmPassword"
									type="password"
									value={formData.confirmPassword}
									onChange={handleInputChange}
									error={errors.confirmPassword}
									placeholder="Confirm your password"
									required
								/>
							)}

							{errors.submit && (
								<div className="p-3 bg-error-50 border border-error-200 rounded-lg">
									<p className="text-error text-sm">{errors.submit}</p>
								</div>
							)}

							<Button
								type="submit"
								variant="primary"
								className="w-full"
								disabled={isLoading}
							>
								{isLoading ? (
									<div className="flex items-center justify-center">
										<Icon name="Loader2" size={16} className="animate-spin mr-2" />
										{isLogin ? 'Signing In...' : 'Creating Account...'}
									</div>
								) : (
									isLogin ? 'Sign In' : 'Create Account'
								)}
							</Button>
						</form>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border"></div>
							</div>
							<div className="relative flex justify-center text-sm">
								<span className="px-2 bg-card text-text-muted">Or continue with</span>
							</div>
						</div>

						{/* Google Sign In */}
						<Button
							variant="outline"
							className="w-full"
							onClick={handleGoogleAuth}
							disabled={isLoading}
						>
							<Icon name="Chrome" size={20} className="mr-2" />
							Google
						</Button>
					</div>

					{/* Toggle Auth Mode */}
					<div className="text-center">
						<p className="text-text-muted">
							{isLogin ? "Don't have an account?" : "Already have an account?"}
							<button
								type="button"
								onClick={() => setIsLogin(!isLogin)}
								className="text-primary font-medium ml-1 hover:underline"
							>
								{isLogin ? 'Sign Up' : 'Sign In'}
							</button>
						</p>
					</div>

					{/* Back to Main App */}
					<div className="text-center mt-6">
						<button
							type="button"
							onClick={() => router.push('/home-discovery')}
							className="text-text-muted hover:text-text-secondary flex items-center justify-center mx-auto"
						>
							<Icon name="ArrowLeft" size={16} className="mr-1" />
							Back to Discovery
						</button>
					</div>
				</div>
			</div>
		</>
	);
};

export default VendorAuth;