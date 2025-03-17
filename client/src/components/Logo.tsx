import React from 'react';
import logoImage from '../assets/logo.png';

export const Logo = ({ className = "" }: { className?: string }) => {
  return <img src={logoImage} alt="Sufuf App Logo" className={className} />;
};

export const logoUrl = logoImage;
