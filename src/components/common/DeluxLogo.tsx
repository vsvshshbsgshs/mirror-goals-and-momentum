import React from 'react';

interface DeluxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const DeluxLogo: React.FC<DeluxLogoProps> = ({
  size = 'md',
  showText = true,
  className = ''
}) => {
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14'
  }[size];

  const textStyles = {
    sm: 'text-base tracking-tight font-semibold',
    md: 'text-xl tracking-tight font-bold',
    lg: 'text-2xl tracking-tight font-bold',
    xl: 'text-4xl tracking-tight font-extrabold'
  }[size];

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Apple-like geometric badge */}
      <div
        className={`${iconDimensions} rounded-xl bg-gradient-to-tr from-[#7033FF] via-[#4E56FF] to-[#2563EB] p-0.5 shadow-md shadow-[#4E56FF]/30 flex items-center justify-center relative overflow-hidden`}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1.5 text-white"
        >
          {/* Delux Chevron & Zenith Ascent Monogram */}
          <path
            d="M8 22L16 10L24 22"
            stroke="currentColor"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 18L16 13L19 18"
            stroke="currentColor"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-75"
          />
          <circle cx="16" cy="6" r="2.2" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`text-[#17191D] dark:text-white font-['Plus_Jakarta_Sans',sans-serif] ${textStyles} transition-colors`}>
            Delux
          </span>
        </div>
      )}
    </div>
  );
};
