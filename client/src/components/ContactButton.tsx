import { Mail } from 'lucide-react';

interface ContactButtonProps {
  variant?: 'primary' | 'secondary' | 'minimal';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  subject?: string;
}

export function ContactButton({ variant = 'secondary', size = 'md', className = '', subject = 'Orbit 2 Orbit Express Inquiry' }: ContactButtonProps) {
  const baseClasses = "inline-flex items-center gap-2 font-sans font-semibold transition-all";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-lg",
    secondary: "bg-slate-800/80 hover:bg-slate-700 text-white border border-blue-400/30 hover:border-blue-400/60 rounded-lg",
    minimal: "text-blue-300 hover:text-blue-200"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  return (
    <a
      href={`mailto:vlad@orbit2orbitexpress.com?subject=${encodeURIComponent(subject)}`}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      data-testid="contact-button"
    >
      <Mail size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} />
      <span>Contact Us</span>
    </a>
  );
}
