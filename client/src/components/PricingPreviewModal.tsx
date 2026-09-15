import { useState } from 'react';
import { X, Check, Rocket, Zap, Building2 } from 'lucide-react';
import { Link } from 'wouter';

interface PricingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTier?: 'free' | 'pro' | 'enterprise';
}

export function PricingPreviewModal({ isOpen, onClose, defaultTier = 'free' }: PricingPreviewModalProps) {
  const [selectedTier, setSelectedTier] = useState(defaultTier);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" data-testid="pricing-preview-modal">
      <div className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-gray-800 rounded-lg border border-neutral-500">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-10"
          data-testid="modal-close-button"
        >
          <X size={24} />
        </button>

        <div className="p-8 text-center border-b border-slate-800">
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            Choose Your Plan
          </h2>
          <p className="text-lg font-sans text-gray-300">
            Start free, upgrade anytime. No credit card required.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 p-8">
          <div 
            onClick={() => setSelectedTier('free')}
            className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
              selectedTier === 'free'
                ? 'border-teal-400 bg-teal-400/10 scale-105'
                : 'border-neutral-400/50 bg-gray-800/50 hover:border-teal-400/50'
            }`}
            data-testid="tier-free"
          >
            {selectedTier === 'free' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-teal-400 text-black text-xs font-sans font-bold rounded">
                SELECTED
              </div>
            )}

            <div className="text-center mb-4">
              <Rocket size={32} className="mx-auto text-teal-400 mb-3" />
              <h3 className="text-xl font-sans font-bold text-white mb-2">
                Launch Tracker
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-sans font-black text-white">$0</span>
                <span className="text-gray-400 font-sans">/forever</span>
              </div>
              <p className="text-sm font-sans text-gray-400">
                No credit card required
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Full cargo calculator</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Next 4 upcoming launches</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>2 industry news articles per feed</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Browse rocket directory</span>
              </li>
            </ul>

            {selectedTier === 'free' && (
              <p className="text-xs font-sans text-center text-green-400 font-semibold mb-3">
                Perfect for getting started
              </p>
            )}
          </div>

          <div 
            onClick={() => setSelectedTier('pro')}
            className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
              selectedTier === 'pro'
                ? 'border-teal-400 bg-teal-400/10 scale-105'
                : 'border-neutral-400/50 bg-gray-800/50 hover:border-teal-400/50'
            }`}
            data-testid="tier-pro"
          >
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-teal-400 text-black text-xs font-sans font-bold rounded">
              MOST POPULAR
            </div>

            {selectedTier === 'pro' && (
              <div className="absolute -top-3 right-4 px-3 py-1 bg-teal-400 text-black text-xs font-sans font-bold rounded">
                SELECTED
              </div>
            )}

            <div className="text-center mb-4 mt-2">
              <Zap size={32} className="mx-auto text-teal-400 mb-3" />
              <h3 className="text-xl font-sans font-bold text-white mb-2">
                Pro
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-sans font-black text-white">$19</span>
                <span className="text-gray-400 font-sans">/month</span>
              </div>
              <p className="text-sm font-sans text-teal-400">
                7-day free trial
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Everything in Free, plus:</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Full 30-day launch calendar</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Live countdown timers</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>8 launches + 6 news articles</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Export & filtering tools</span>
              </li>
            </ul>

            {selectedTier === 'pro' && (
              <p className="text-xs font-sans text-center text-teal-400 font-semibold mb-3">
                Most popular for professionals
              </p>
            )}
          </div>

          <div 
            onClick={() => setSelectedTier('enterprise')}
            className={`relative p-6 rounded-lg border-2 transition-all cursor-pointer ${
              selectedTier === 'enterprise'
                ? 'border-teal-400 bg-teal-400/10 scale-105'
                : 'border-neutral-400/50 bg-gray-800/50 hover:border-teal-400/50'
            }`}
            data-testid="tier-enterprise"
          >
            {selectedTier === 'enterprise' && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-teal-400 text-black text-xs font-sans font-bold rounded">
                SELECTED
              </div>
            )}

            <div className="text-center mb-4">
              <Building2 size={32} className="mx-auto text-teal-400 mb-3" />
              <h3 className="text-xl font-sans font-bold text-white mb-2">
                Enterprise
              </h3>
              <div className="mb-2">
                <span className="text-4xl font-sans font-black text-white">$149</span>
                <span className="text-gray-400 font-sans">/month</span>
              </div>
              <p className="text-sm font-sans text-gray-400">
                For teams & analysts
              </p>
            </div>

            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span className="font-semibold">Everything in Pro, plus:</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>12-month calendar + history</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Company intelligence data</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>API access</span>
              </li>
              <li className="flex items-start gap-2 text-sm font-sans text-gray-300">
                <Check size={16} className="text-green-400 mt-0.5 flex-shrink-0" />
                <span>Custom reports</span>
              </li>
            </ul>

            {selectedTier === 'enterprise' && (
              <p className="text-xs font-sans text-center text-teal-400 font-semibold mb-3">
                For advanced industry analysis
              </p>
            )}
          </div>
        </div>

        <div className="p-8 border-t border-neutral-400/50 bg-gray-800/50">
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-sm font-sans text-gray-400 mb-6">
              {selectedTier === 'free' && 'Create your free account now. No payment required, cancel anytime.'}
              {selectedTier === 'pro' && 'Start with a 7-day free trial. Cancel anytime during trial, no charges.'}
              {selectedTier === 'enterprise' && 'Contact us to discuss your needs and get a custom quote.'}
            </p>

            {selectedTier === 'free' && (
              <Link href="/pricing" onClick={onClose}>
                <button 
                  className="px-8 py-4 bg-teal-400 hover:bg-teal-500 text-black font-sans font-bold rounded-lg text-lg transition-all"
                  data-testid="cta-free"
                >
                  Continue with Free
                </button>
              </Link>
            )}

            {selectedTier === 'pro' && (
              <Link href="/pricing" onClick={onClose}>
                <button 
                  className="px-8 py-4 bg-teal-400 hover:bg-teal-500 text-black font-sans font-bold rounded-lg text-lg transition-all"
                  data-testid="cta-pro"
                >
                  Start 7-Day Free Trial
                </button>
              </Link>
            )}

            {selectedTier === 'enterprise' && (
              <a href="mailto:vlad@orbit2orbitexpress.com?subject=Enterprise Plan Inquiry">
                <button 
                  className="px-8 py-4 bg-teal-400 hover:bg-teal-500 text-black font-sans font-bold rounded-lg text-lg transition-all"
                  data-testid="cta-enterprise"
                >
                  Contact Us
                </button>
              </a>
            )}

            <div className="mt-6">
              <Link 
                href="/pricing"
                onClick={onClose}
                className="text-sm font-sans font-medium text-teal-400 hover:text-teal-500 transition-colors"
              >
                See detailed feature comparison →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
