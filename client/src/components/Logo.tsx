import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", width = 40, height = 40 }) => {
  return (
    <img 
      src="/static/sufuf-icon.png"
      alt="Sufuf App Logo" 
      className={className}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
    />
  );
};

export const logoUrl = "/static/sufuf-icon.png";