"use client"

import Image from 'next/image';

export interface LeadershipMemberProps {
  name: string
  image: string
}

type LeadershipMemberDisplayProps = {
  name: string;
  imageUrl: string;
  sectionColor?: string;
  size?: 'normal' | 'large' | 'extra-large';  // Add size property
};

const LeadershipMemberDisplay = ({ 
  name, 
  imageUrl,
  sectionColor = '#3b82f6',
  size = 'normal'  // Default to normal size
}: LeadershipMemberDisplayProps) => {
  // Determine the size classes based on the size prop
  const getSizeClasses = () => {
    switch (size) {
      case 'extra-large':
        return "max-w-[200px] border-4";
      case 'large':
        return "max-w-[160px] border-3";
      case 'normal':
      default:
        return "max-w-[120px] border-2";
    }
  };

  // Get font size class for the fallback initial
  const getInitialFontSize = () => {
    switch (size) {
      case 'extra-large':
        return "text-4xl";
      case 'large':
        return "text-3xl";
      case 'normal':
      default:
        return "text-2xl";
    }
  };

  const sizeClasses = getSizeClasses();
  const initialFontSize = getInitialFontSize();

  return (
    <div className="text-center">
      <div className={`relative mb-3 aspect-square overflow-hidden rounded-full shadow-md mx-auto ${sizeClasses}`}
        style={{ borderColor: sectionColor }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover"
            sizes={size === 'extra-large' ? '200px' : size === 'large' ? '160px' : '120px'}
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"
               style={{ backgroundColor: sectionColor }}>
            <span className={`text-white font-bold ${initialFontSize}`}>
              {name.charAt(0)}
            </span>
          </div>
        )}
      </div>
      <p className={`font-medium text-gray-800 ${size === 'extra-large' ? 'text-xl' : size === 'large' ? 'text-lg' : 'text-base'}`}>
        {name}
      </p>
    </div>
  );
};

export default LeadershipMemberDisplay;

