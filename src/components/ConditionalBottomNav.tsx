'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Import your specific header components
import BottomTabNavigation from './ui/BottomTabNavigation';

const ConditionalBottomNav: React.FC = () => {
    // Get the current URL pathname
    const pathname = usePathname();

    if (pathname.startsWith('/vendor')) {
        return null;
    } else {
        return <BottomTabNavigation />;
    }
};

export default ConditionalBottomNav;