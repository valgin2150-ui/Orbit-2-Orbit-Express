import { Orbit, Rocket, Package } from "lucide-react";

export function AppLogo({ size = 40 }: { size?: number }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Orbit circle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Orbit 
          className="text-teal-400" 
          size={size} 
          strokeWidth={1.5} 
        />
      </div>
      
      {/* Center planet dot */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="rounded-lg bg-gray-800"
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      </div>
      
      {/* Cargo box */}
      <div className="absolute" style={{ 
        top: size * 0.15, 
        right: size * 0.05, 
        transform: 'rotate(-30deg)' 
      }}>
        <Package 
          className="text-teal-400" 
          size={size * 0.25} 
          strokeWidth={2} 
        />
      </div>
    </div>
  );
}

export function AppLogoWithText() {
  return (
    <div className="flex items-center">
      <AppLogo size={32} />
      <div className="ml-2">
        <div className="font-bold text-sm text-white">
          Orbit to Orbit Express
        </div>
        <div className="text-xs font-semibold">Cargo</div>
      </div>
    </div>
  );
}