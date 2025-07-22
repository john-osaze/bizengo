import React from 'react';
import Image from 'next/image'; // Import Next.js Image component

interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt?: string;
    className?: string;
    fill?: boolean;  // added fill prop to allow for resizing
    width?: number;
    height?: number;
}

const AppImage: React.FC<ImageProps> = ({ src, alt = "Image Name", className = "", width, height, ...props }) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        (e.target as HTMLImageElement).src = "/assets/images/no_image.png";
    };

    return (
        <Image
            src={src}
            alt={alt}
            className={className}
            onError={handleImageError}
            width={width}
            height={height}
            {...props}
        />
    );
};

export default AppImage;