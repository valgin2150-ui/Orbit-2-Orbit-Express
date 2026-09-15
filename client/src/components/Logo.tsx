interface LogoProps {
  size?: number;
  className?: string;
}

export function OrbitLogoWithText({ size = 40, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <LogoOrbit size={size} />
      <div className="ml-2 flex flex-col">
        <span className="font-bold text-sm leading-tight">Orbit to Orbit Express</span>
        <span className="text-xs leading-tight">Cargo</span>
      </div>
    </div>
  );
}

export function LogoOrbit({ size = 40, className = "" }: LogoProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Earth/Planet Circle */}
      <circle cx="50" cy="50" r="28" fill="url(#planetGradient)" />
      
      {/* Orbit Ring */}
      <ellipse 
        cx="50" 
        cy="50" 
        rx="45" 
        ry="18" 
        stroke="url(#orbitGradient)" 
        strokeWidth="2.5"
        transform="rotate(-15 50 50)"
      />
      
      {/* Satellite/Cargo */}
      <g transform="rotate(-45 50 50)">
        <rect 
          x="82" 
          y="45" 
          width="14" 
          height="10" 
          rx="2" 
          fill="#FFA500" 
        />
        <rect 
          x="86" 
          y="42" 
          width="6" 
          height="4" 
          fill="#d97706" 
        />
        <rect 
          x="86" 
          y="54" 
          width="6" 
          height="3" 
          fill="#d97706" 
        />
      </g>
      
      {/* Gradients */}
      <defs>
        <linearGradient id="planetGradient" x1="22" y1="22" x2="78" y2="78" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        
        <linearGradient id="orbitGradient" x1="5" y1="50" x2="95" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function OrbitLogoIcon({ size = 24, className = "" }: LogoProps) {
  // Simplified version for favicon/small displays
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <circle cx="50" cy="50" r="32" fill="url(#planetGradientSmall)" />
      <ellipse 
        cx="50" 
        cy="50" 
        rx="48" 
        ry="20" 
        stroke="url(#orbitGradientSmall)" 
        strokeWidth="4"
        transform="rotate(-15 50 50)"
      />
      
      <rect 
        x="76" 
        y="46" 
        width="14" 
        height="8" 
        rx="2" 
        fill="#FFA500"
        transform="rotate(-45 80 50)" 
      />
      
      <defs>
        <linearGradient id="planetGradientSmall" x1="18" y1="18" x2="82" y2="82" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60a5fa" />
          <stop offset="1" stopColor="#1d4ed8" />
        </linearGradient>
        
        <linearGradient id="orbitGradientSmall" x1="2" y1="50" x2="98" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#f97316" />
          <stop offset="1" stopColor="#fbbf24" />
        </linearGradient>
      </defs>
    </svg>
  );
}