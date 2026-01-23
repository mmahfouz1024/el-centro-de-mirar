
import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
  onClick?: () => void;
}

const Logo: React.FC<LogoProps> = ({ size = 48, className = "", onClick }) => {
  return (
    <div 
      className={`relative flex items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
      onClick={onClick}
    >
      <img 
        src="https://mnaljojymprixuayzvnv.supabase.co/storage/v1/object/public/images/348228248_959701268554741_8922565608732474792_n.jpg" 
        alt="منصة تبصرة"
        className="w-full h-full object-cover"
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default Logo;
