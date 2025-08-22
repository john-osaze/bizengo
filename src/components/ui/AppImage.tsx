import React from 'react';
import Image, { ImageProps as NextImageProps } from 'next/image';

type AppImageProps = Omit<NextImageProps, 'src' | 'alt'> & {
    src: string;
    alt?: string;
    className?: string;
    fill?: boolean;
    width?: number;
    height?: number;
};

const AppImage: React.FC<AppImageProps> = ({ 
    src, 
    alt = "Image Name", 
    className = "", 
    fill,
    width = 100, // default width if not provided
    height = 100, // default height if not provided
    ...props 
}) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const imgElement = e.target as HTMLImageElement;
        imgElement.src = "/assets/images/no_image.png";
    };

    return (
        <Image
            src={src}
            alt={alt}
            className={className}
            onError={handleImageError}
            fill={fill}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            {...props}
        />
    );
};

export default AppImage;