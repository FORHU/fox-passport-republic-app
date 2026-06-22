import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'adaptive'; 
  className?: string;
  logoSize?: number;
  textSize?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'light',
  className = '',
  logoSize = 48,
  textSize = 'text-2xl',
}) => {
  // Determine text color classes
  let textBaseClass = 'text-white';
  let hoverTextClass = 'group-hover:text-[#ccff00]';
  let underlineBgClass = 'bg-[#ccff00]';

  if (variant === 'dark') {
    textBaseClass = 'text-black';
  } else if (variant === 'adaptive') {
    textBaseClass = 'text-gray-900 dark:text-white';
    hoverTextClass = 'group-hover:text-pink-500';
    underlineBgClass = 'bg-pink-500';
  }

  return (
    <Link href="/" className={`flex items-center gap-3 group cursor-pointer relative ${className}`}>
      <div 
        className={`flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden`}
        style={{ width: logoSize, height: logoSize }}
      >
        <Image 
          src="/foxonlylogo.png" 
          alt="FoxPassport Logo" 
          width={logoSize} 
          height={logoSize} 
          className="object-contain"
          priority
        />
      </div>
      <div className="relative">
        <h2 className={`${textSize} font-display font-bold tracking-tight ${textBaseClass} ${hoverTextClass} transition-colors`}>
          FoxPassport
        </h2>
        <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${underlineBgClass} group-hover:w-full transition-all duration-300`}></span>
      </div>
    </Link>
  );
};
