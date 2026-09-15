import { useState } from "react";
import { Link } from "wouter";
import { Check, Zap, Building2, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Navigation } from "@/components/Navigation";
import { useSEO } from "@/hooks/useSEO";

interface PricingTier {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  notIncluded?: string[];
  highlight?: boolean;
  badge?: string;
  icon: typeof Rocket;
}

const tiers: PricingTier[] = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Perfect for casual space enthusiasts",
    icon: Rocket,
    features: [
      "Full cargo logistics calculator",
      "4 upcoming launches preview",
      "3 news articles per feed",
      "Basic mission planning",
    ],
    notIncluded: [
      "6-month launch calendar",
      "Live countdown timers",
      "Launch alerts",
      "Export capabilities",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 19,
    yearlyPrice: 190,
    description: "For professionals tracking space missions",
    icon: Zap,
    highlight: true,
    badge: "Most Popular",
    features: [
      "Everything in Free",
      "15 launches in preview",
      "Full 6-month launch calendar",
      "10 news articles per feed",
      "Live countdown timers",
      "Email alerts (5/month)",
      "Export to iCal",
      "Filter by provider & country",
      "Success rate statistics",
      "90-day historical data",
    ],
  },
  {
    name: "Enterprise",
    monthlyPrice: 149,
    yearlyPrice: 1490,
    description: "Complete intelligence for organizations",
    icon: Building2,
    features: [
      "Everything in Pro",
      "12-month forward calendar",
      "Full historical archive",
      "Unlimited alerts",
      "Launch delay analysis",
      "Success probability scoring",
      "Government contracts data",
      "API access (10K calls/mo)",
      "Custom PDF reports",
      "Priority support",
    ],
  },
];

export default function Pricing() {
  useSEO({
    title: "Pricing Plans - Free, Pro & Enterprise Space Tools",
    description: "Choose the right Orbit to Orbit Express plan for your space mission needs. Free launch calculator, Pro launch calendar with live countdowns, and Enterprise custom solutions for aerospace organizations worldwide. Plans designed for teams in the USA, Europe, Middle East, Asia-Pacific, and Latin America.",
    canonical: "/pricing",
    keywords: "space tools pricing, launch calculator pricing, aerospace software plans, space industry SaaS, orbital mechanics tools cost, mission planning software pricing, space startup tools, aerospace engineer tools, international space tools, aerospace SaaS platform, satellite mission planning cost, space launch cost estimator subscription, launch calendar subscription, space industry analytics pricing, global aerospace software",
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "Product",
      "name": "Orbit to Orbit Express Pro",
      "description": "Professional space launch intelligence platform with full calendar, live countdowns, and export capabilities.",
      "url": "https://www.orbit2orbitexpress.com/pricing",
      "offers": [
        { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD" },
        { "@type": "Offer", "name": "Pro Monthly", "price": "19", "priceCurrency": "USD", "billingIncrement": 1, "unitCode": "MON" },
        { "@type": "Offer", "name": "Pro Yearly", "price": "190", "priceCurrency": "USD", "billingIncrement": 1, "unitCode": "ANN" }
      ]
    }],
  });
  const [isAnnual, setIsAnnual] = useState(false);

  const getPrice = (tier: PricingTier) => {
    if (tier.monthlyPrice === 0) return "Free";
    const price = isAnnual ? tier.yearlyPrice : tier.monthlyPrice;
    return `$${price}`;
  };

  const getPeriod = (tier: PricingTier) => {
    if (tier.monthlyPrice === 0) return "forever";
    return isAnnual ? "/year" : "/month";
  };

  const getSavings = (tier: PricingTier) => {
    if (tier.monthlyPrice === 0) return null;
    const yearlySavings = (tier.monthlyPrice * 12) - tier.yearlyPrice;
    return Math.round((yearlySavings / (tier.monthlyPrice * 12)) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main id="main-content" className="container mx-auto px-4 md:px-6 pt-28 md:pt-32 pb-12 max-w-6xl" role="main">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-1 h-8 bg-rail-red" aria-hidden="true"></div>
            <h1 id="pricing-heading" className="text-3xl md:text-4xl font-medium text-gray-900" data-testid="pricing-title">
              Simple, Transparent Pricing
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your mission. All plans include our full cargo logistics calculator.
          </p>
          
          <div className="flex items-center justify-center gap-4 mt-8">
            <Label htmlFor="billing-toggle" className="text-sm text-gray-600">Monthly</Label>
            <Switch 
              id="billing-toggle"
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              data-testid="billing-toggle"
            />
            <Label htmlFor="billing-toggle" className="text-sm text-gray-600 flex items-center gap-2">
              Annual
              <span className="text-xs bg-success/20 text-success px-2 py-0.5 border border-success/30">
                Save 17%
              </span>
            </Label>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const isPaidTier = tier.monthlyPrice > 0;
            
            return (
              <Card 
                key={tier.name}
                className={`relative bg-white border shadow-sm transition-all duration-300 ${
                  tier.highlight 
                    ? 'border-rail-red' 
                    : 'border-gray-200 hover:border-rail-red/50'
                }`}
                data-testid={`pricing-card-${tier.name.toLowerCase()}`}
              >
                {tier.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="border-2 border-rail-red text-rail-red bg-white text-xs font-medium px-4 py-1">
                      {tier.badge}
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center bg-rail-red/10">
                    <Icon className="w-7 h-7 text-rail-red" />
                  </div>
                  <CardTitle className="text-2xl font-medium text-gray-900">{tier.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-500">{tier.description}</CardDescription>
                  
                  <div className="mt-4">
                    {isPaidTier ? (
                      <>
                        <span className="text-4xl font-bold text-gray-400 line-through">{getPrice(tier)}</span>
                        <span className="font-mono text-gray-400 ml-1">{getPeriod(tier)}</span>
                        <p className="text-xs text-rail-red mt-1">Currently Free</p>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-bold text-gray-900">{getPrice(tier)}</span>
                        <span className="font-mono text-gray-500 ml-1">{getPeriod(tier)}</span>
                      </>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                    {tier.notIncluded?.map((feature, i) => (
                      <li key={`not-${i}`} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-rail-red flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                        <span className="text-xs text-rail-red">(Free)</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href="/">
                    <Button 
                      className="w-full border-2 border-rail-red bg-transparent hover:bg-rail-red text-rail-red hover:text-white transition-colors"
                      data-testid={`get-started-${tier.name.toLowerCase()}`}
                    >
                      Get Started Free
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center text-gray-500 text-sm">
          <p>All plans include our core cargo logistics calculator with no restrictions.</p>
          <p className="mt-2">Questions? Contact us at <a href="mailto:vlad@orbit2orbitexpress.com" className="text-rail-red hover:underline">vlad@orbit2orbitexpress.com</a></p>
        </div>
      </main>
    </div>
  );
}
