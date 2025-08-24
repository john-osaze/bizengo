// 'use client'; // This is the most important line!

// import React, { useState, useEffect } from 'react';
// import { usePathname, useRouter } from 'next/navigation';

// // Import your specific header components
// import Header from './ui/Header';
// import VendorHeader from '@/app/vendor/dashboard/components/VendorHeader';

// interface VendorData {
//     firstName: string;
//     lastName: string;
//     email: string;
//     businessName: string;
//     isVerified: boolean;
// }

// const ConditionalHeader: React.FC = () => {
//     // Get the current URL pathname
//     const pathname = usePathname();

//     const router = useRouter();

//     const [vendorData, setVendorData] = useState<VendorData | null>(null);

//     useEffect(() => {
//         // Load vendor data
//         const vendor = JSON.parse(localStorage.getItem('vendorAuth') || '{}');
//         setVendorData(vendor);
//     }, [router]);

//     const handleLogout = (): void => {
//         localStorage.removeItem('vendorAuth');
//         localStorage.removeItem('isVendorLoggedIn');
//         router.push('../auth');
//     };

//     if (pathname.startsWith('/vendor/auth')) {
//         return <Header />;
//     }

//     if (pathname.startsWith('/vendor')) {
//         // If the path starts with /dashboard, show the AppHeader
//         return <VendorHeader
//             vendorData={vendorData ?? undefined}
//             onLogout={handleLogout}
//         />;
//     }

//     // By default, return the MarketingHeader for all other pages
//     return <Header />;
// };

// export default ConditionalHeader;
