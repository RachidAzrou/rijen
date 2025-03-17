import React from 'react';
import logoImg from '../assets/logo-red.png';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = "", width = 40, height = 40 }) => {
  return (
    <img 
      src={logoImg} 
      alt="Sufuf App Logo" 
      className={className}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
    />
  );
};

export const logoUrl = logoImg;