import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "wouter";
import { ArrowLeft, Rocket, Share2, Mail, ChevronDown, Trophy, Crown, Sparkles, Zap, Target, CheckCircle2, XCircle, Award, Volume2, VolumeX } from "lucide-react";
import { SiSubstack } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PAYLOAD_TYPES, DESTINATIONS, generateRandomActivity, type PayloadType, type Destination } from "@/lib/kidsData";
import { calculateYeetCost, formatCurrency, type YeetQuote } from "@/lib/kidsCalculator";
import type { Yeet } from "@shared/schema";
import { useSEO } from "@/hooks/useSEO";

const SPACE_VOCABULARY = [
  {
    word: "Apogee",
    pronunciation: "AP-uh-jee",
    realDefinition: "The point in an orbit farthest from Earth",
    funDefinition: "When your yeet reaches maximum altitude before gravity says 'nope, come back here!' It's like the top of a really, really tall roller coaster.",
    emoji: "📈"
  },
  {
    word: "Perigee",
    pronunciation: "PAIR-uh-jee",
    realDefinition: "The point in an orbit closest to Earth",
    funDefinition: "The lowest dip in your orbit where you're close enough to wave at airplanes. It's like doing a cosmic limbo dance around the planet!",
    emoji: "📉"
  },
  {
    word: "Delta-V",
    pronunciation: "DEL-tuh VEE",
    realDefinition: "The change in velocity needed to perform a space maneuver",
    funDefinition: "The 'oomph' your rocket needs to yeet something somewhere. More delta-v = bigger yeet energy. It's basically how hard you have to throw in space!",
    emoji: "⚡"
  },
  {
    word: "Orbital Decay",
    pronunciation: "OR-bit-ul dee-KAY",
    realDefinition: "The gradual decrease of an object's orbit due to atmospheric drag",
    funDefinition: "When your satellite slowly gets pulled back to Earth like it's past its bedtime. Even space stuff can't escape doing chores forever!",
    emoji: "🌀"
  },
  {
    word: "Escape Velocity",
    pronunciation: "ess-CAPE vuh-LOSS-uh-tee",
    realDefinition: "The minimum speed needed to break free from a planet's gravity",
    funDefinition: "The speed at which Earth can't catch you anymore - about 25,000 mph! It's like running so fast your mom can't call you back for dinner.",
    emoji: "💨"
  },
  {
    word: "Retrograde",
    pronunciation: "RET-roh-grade",
    realDefinition: "Orbiting or rotating in the opposite direction to most objects in a system",
    funDefinition: "Going the 'wrong way' in space on purpose. It's like being that one kid who walks backwards in the hallway - except in orbit it's actually useful!",
    emoji: "🔄"
  },
  {
    word: "Lagrange Point",
    pronunciation: "luh-GRANJ point",
    realDefinition: "A stable point in space where gravitational forces balance out",
    funDefinition: "The ultimate parking spot in space where you can just... float there. No gravity tugging you around. It's like the universe's chill zone!",
    emoji: "⚖️"
  },
  {
    word: "Hohmann Transfer",
    pronunciation: "HOH-mun TRANS-fer",
    realDefinition: "An efficient orbital maneuver to transfer between two circular orbits",
    funDefinition: "The fuel-sipping way to change orbits - slow but cheap! It's the economy class of space travel. Pack a snack, you'll be there... eventually.",
    emoji: "🎯"
  },
  {
    word: "Gravity Assist",
    pronunciation: "GRAV-it-ee uh-SIST",
    realDefinition: "Using a planet's gravity to accelerate or change direction",
    funDefinition: "Free speed boost! Swing by a planet and steal some of its momentum. It's like getting pushed on a swing by Jupiter. Thanks, big guy!",
    emoji: "🪃"
  },
  {
    word: "Payload",
    pronunciation: "PAY-lohd",
    realDefinition: "The cargo carried by a rocket into space",
    funDefinition: "The stuff you're actually yeeting! Whether it's satellites, experiments, or someone's pet rock collection - if it's going to space, it's payload.",
    emoji: "📦"
  },
  {
    word: "Geosynchronous",
    pronunciation: "jee-oh-SIN-kruh-nus",
    realDefinition: "An orbit where an object takes 24 hours to complete one revolution",
    funDefinition: "The orbit where satellites match Earth's spin and seem to hover over one spot forever. It's like being stuck on the same merry-go-round horse... IN SPACE!",
    emoji: "🎠"
  },
  {
    word: "Ablation",
    pronunciation: "ab-LAY-shun",
    realDefinition: "The removal of material from a surface by melting or vaporization",
    funDefinition: "When your spacecraft's heat shield heroically sacrifices itself by melting away to keep the inside cool. The ultimate 'taking one for the team'!",
    emoji: "🔥"
  },
  {
    word: "Microgravity",
    pronunciation: "MY-kroh-GRAV-it-ee",
    realDefinition: "A condition where gravity's effects are very weak, causing weightlessness",
    funDefinition: "Floaty mode! Where your snacks drift away and every drink is a potential disaster. It's not zero gravity - it's 'your water bottle has trust issues' gravity.",
    emoji: "🫧"
  },
  {
    word: "Propellant",
    pronunciation: "proh-PEL-unt",
    realDefinition: "A chemical substance used to generate thrust in a rocket",
    funDefinition: "Rocket go-juice! The explosive smoothie that makes things yeet. Usually involves mixing stuff that really, REALLY wants to react with each other.",
    emoji: "⛽"
  },
  {
    word: "Orbital Inclination",
    pronunciation: "OR-bit-ul in-kluh-NAY-shun",
    realDefinition: "The tilt of an orbit relative to the equator",
    funDefinition: "How tilted your orbit is compared to Earth's belt line. Zero degrees = orbiting over the equator like a hula hoop. 90 degrees = going over the poles like a weirdo!",
    emoji: "📐"
  },
  {
    word: "Thrust-to-Weight Ratio",
    pronunciation: "THRUST too WAYT RAY-shee-oh",
    realDefinition: "The ratio of a rocket's thrust to its total weight",
    funDefinition: "Can your rocket lift itself? If this number is less than 1, your rocket is just a very expensive lawn ornament. Greater than 1? We have liftoff!",
    emoji: "🏋️"
  },
  {
    word: "Apoapsis",
    pronunciation: "ap-oh-AP-sis",
    realDefinition: "The highest point in an orbit around any celestial body",
    funDefinition: "Like apogee, but for orbiting anything - the Moon, Mars, your neighbor's house if it had gravity. It's where your orbit says 'this is as far as I go!'",
    emoji: "🔝"
  },
  {
    word: "Periapsis",
    pronunciation: "pair-ee-AP-sis",
    realDefinition: "The lowest point in an orbit around any celestial body",
    funDefinition: "The closest you get to whatever you're orbiting before zooming back out. It's the cosmic 'boop!' moment of your orbit.",
    emoji: "👇"
  },
  {
    word: "Specific Impulse",
    pronunciation: "spuh-SIF-ik IM-puls",
    realDefinition: "A measure of how efficiently a rocket uses propellant",
    funDefinition: "How much yeet you get per gallon! Higher specific impulse = more bang for your buck. It's like MPG for rockets, but way cooler.",
    emoji: "📊"
  },
  {
    word: "Staging",
    pronunciation: "STAY-jing",
    realDefinition: "Discarding empty rocket sections during flight to reduce weight",
    funDefinition: "Marie Kondo-ing your rocket mid-flight! Empty fuel tank? YEET IT! Don't need that engine anymore? BYE! Keep only what sparks joy (and thrust).",
    emoji: "🎭"
  },
  {
    word: "Re-entry",
    pronunciation: "ree-EN-tree",
    realDefinition: "The return of a spacecraft into Earth's atmosphere",
    funDefinition: "Coming home! But first, survive becoming a temporary fireball at 17,500 mph. It's like the universe's scariest waterslide, except the water is plasma.",
    emoji: "☄️"
  }
];

function getWordOfTheDay() {
  const today = new Date();
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  return SPACE_VOCABULARY[dayOfYear % SPACE_VOCABULARY.length];
}

function SpaceWordOfTheDay() {
  const word = getWordOfTheDay();
  
  return (
    <section className="py-6 bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-purple-900/50 border-b border-purple-500/20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          <span className="text-yellow-400 font-mono text-xs uppercase tracking-wider">Space Word of the Day</span>
        </div>
        
        <div className="bg-black/40 backdrop-blur border border-purple-500/30 rounded-xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="text-5xl">{word.emoji}</div>
            <div className="flex-1">
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <h3 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-400">
                  {word.word}
                </h3>
                <span className="text-purple-300/60 text-sm font-mono">/{word.pronunciation}/</span>
              </div>
              
              <div className="mb-3">
                <span className="text-xs text-purple-400 uppercase tracking-wider">Real definition:</span>
                <p className="text-white/70 text-sm">{word.realDefinition}</p>
              </div>
              
              <div className="bg-gradient-to-r from-pink-500/10 to-cyan-500/10 border border-pink-500/20 rounded-lg p-3">
                <span className="text-xs text-pink-400 uppercase tracking-wider">The fun version:</span>
                <p className="text-white text-sm mt-1">{word.funDefinition}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function KidsNavigation() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" className="text-white hover:bg-white/10 gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to O2O Express</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <a href="#teacher-resources">
            <Button variant="ghost" className="text-yellow-400 hover:bg-white/10 gap-2">
              <span className="hidden sm:inline">For Teachers</span>
              <span className="sm:hidden">Teachers</span>
            </Button>
          </a>
          <a 
            href="https://open.substack.com/pub/orbitaleconomics"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="ghost" className="text-[#FF6719] hover:bg-white/10 gap-2">
              <SiSubstack className="w-4 h-4" />
              <span className="hidden sm:inline">Substack</span>
            </Button>
          </a>
        </div>
      </div>
    </header>
  );
}

function KidsHero() {
  return (
    <section className="relative pt-24 pb-12 bg-gradient-to-b from-purple-900 via-indigo-900 to-black overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
          />
        ))}
      </div>
      
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <div className="text-6xl mb-4">🚀</div>
        <h1 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 mb-4">
          YEET IT TO SPACE
        </h1>
        <p className="text-xl sm:text-2xl text-purple-200 mb-8">
          send literally anything to orbit
        </p>
        
        <div className="flex flex-wrap justify-center gap-6 text-sm">
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-pink-500/30">
            <span className="text-pink-400 font-bold">17</span>
            <span className="text-white/70 ml-1">destinations</span>
          </div>
          <div className="bg-white/10 backdrop-blur px-4 py-2 rounded-full border border-cyan-500/30">
            <span className="text-cyan-400 font-bold">$12K</span>
            <span className="text-white/70 ml-1">per kg starting</span>
          </div>
        </div>
        
        <div className="mt-12 animate-bounce">
          <p className="text-purple-300 text-sm mb-2">scroll to yeet</p>
          <ChevronDown className="w-6 h-6 text-purple-400 mx-auto" />
        </div>
      </div>
    </section>
  );
}

function PayloadSelector({ 
  selected, 
  onSelect 
}: { 
  selected: PayloadType | null; 
  onSelect: (payload: PayloadType) => void;
}) {
  return (
    <section className="py-12 bg-black">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-pink-400 font-mono text-sm">step 1</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          What are you sending?
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {PAYLOAD_TYPES.map((payload) => (
            <button
              key={payload.id}
              onClick={() => onSelect(payload)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selected?.id === payload.id
                  ? "border-pink-500 bg-pink-500/20"
                  : "border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10"
              }`}
            >
              <div className="text-3xl mb-2">{payload.emoji}</div>
              <div className="font-semibold text-white text-sm">{payload.name}</div>
              <div className="text-xs text-white/50 mt-1">{payload.description}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function MissionDetails({
  itemName,
  setItemName,
  userName,
  setUserName,
  mass,
  setMass,
  volume,
  setVolume,
}: {
  itemName: string;
  setItemName: (v: string) => void;
  userName: string;
  setUserName: (v: string) => void;
  mass: number;
  setMass: (v: number) => void;
  volume: number;
  setVolume: (v: number) => void;
}) {
  return (
    <section className="py-12 bg-gradient-to-b from-black to-indigo-950">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-cyan-400 font-mono text-sm">step 2</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          Tell us more
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-white/70">What/who is it?</Label>
            <Input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="my ex's stuff"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white/70">Your name (for the activity feed)</Label>
            <Input
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="SpaceLord420"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-white/70">How heavy? (kg)</Label>
            <Input
              type="number"
              value={mass || ""}
              onChange={(e) => setMass(Number(e.target.value))}
              placeholder="70"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
            />
            <p className="text-xs text-white/40">avg person = 70-80kg, car = 1500kg</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-white/70">How big? (cubic meters)</Label>
            <Input
              type="number"
              value={volume || ""}
              onChange={(e) => setVolume(Number(e.target.value))}
              placeholder="0.07"
              step="0.01"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/30"
            />
            <p className="text-xs text-white/40">person = 0.07m³, car = 8m³</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DestinationSelector({
  selected,
  onSelect,
}: {
  selected: Destination | null;
  onSelect: (dest: Destination) => void;
}) {
  return (
    <section className="py-12 bg-indigo-950">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-purple-400 font-mono text-sm">step 3</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          Where to?
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {DESTINATIONS.map((dest) => (
            <button
              key={dest.id}
              onClick={() => onSelect(dest)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                selected?.id === dest.id
                  ? "border-cyan-400 bg-cyan-500/20"
                  : "border-white/10 bg-white/5 hover:border-purple-500/50 hover:bg-white/10"
              }`}
            >
              <div className="font-bold text-white">{dest.name}</div>
              <div className="text-xs text-white/50 mt-1">{dest.description}</div>
              <div className="text-xs text-cyan-400 mt-2">{dest.travelTime}</div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function QuotePanel({ quote }: { quote: YeetQuote | null }) {
  if (!quote) {
    return (
      <Card className="bg-white/5 border-white/10 p-8 text-center">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-white mb-2">Your Yeet Quote</h3>
        <p className="text-white/50">Fill out the form above to get your quote!</p>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 border-pink-500/30 p-6 sm:p-8">
      <div className="text-center mb-6">
        <div className="text-5xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-cyan-400">
          {formatCurrency(quote.totalCost)}
        </div>
        <p className="text-white/70 mt-2">Total Cost</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-white/50 text-xs">Launch Provider</p>
          <p className="text-white font-semibold">{quote.launchProvider}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-white/50 text-xs">Rocket</p>
          <p className="text-white font-semibold">{quote.rocketName}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-white/50 text-xs">Base Cost</p>
          <p className="text-white font-semibold">{formatCurrency(quote.baseCost)}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-white/50 text-xs">Logistics Fee</p>
          <p className="text-white font-semibold">{formatCurrency(quote.logisticsFee)}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-white/50 text-xs">Transit Time</p>
          <p className="text-white font-semibold">{quote.transitTime}</p>
        </div>
        <div className="bg-black/30 rounded-lg p-3">
          <p className="text-white/50 text-xs">Launch Prep</p>
          <p className="text-white font-semibold">{quote.launchPrep}</p>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white gap-2">
          <Share2 className="w-4 h-4" />
          Share This Quote
        </Button>
        <Button variant="outline" className="flex-1 border-white/20 text-white hover:bg-white/10 gap-2">
          <Mail className="w-4 h-4" />
          Send to a Friend
        </Button>
      </div>
      
      <p className="text-center text-white/30 text-xs mt-4">
        *actual yeeting may require additional permits lol
      </p>
    </Card>
  );
}

type ActivityItem = {
  id: string;
  name: string;
  action: string;
  payload: string;
  payloadEmoji: string;
  destination: string;
  timeAgo: string;
  cost?: number;
  isReal?: boolean;
};

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function ActivityFeed() {
  const { data } = useQuery<{ yeets: Yeet[] }>({
    queryKey: ['/api/yeets'],
    refetchInterval: 30000,
  });
  
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const realYeets = data?.yeets || [];
    
    const realActivities: ActivityItem[] = realYeets.map((yeet) => ({
      id: `real-${yeet.id}`,
      name: yeet.nickname || "Someone",
      action: "yeeted",
      payload: yeet.payload,
      payloadEmoji: yeet.payloadEmoji,
      destination: yeet.destination,
      timeAgo: formatTimeAgo(yeet.createdAt),
      cost: yeet.estimatedCost,
      isReal: true,
    }));
    
    if (realActivities.length >= 5) {
      setActivities(realActivities.slice(0, 10));
    } else {
      const fakeCount = 5 - realActivities.length;
      const fakeActivities = Array(fakeCount).fill(null).map(() => {
        const fake = generateRandomActivity();
        return { ...fake, isReal: false };
      });
      setActivities([...realActivities, ...fakeActivities]);
    }
  }, [data]);

  return (
    <section className="py-12 bg-black">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-green-400 font-mono text-sm">live</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          🔥 Recent Yeeting Activity
        </h2>
        <p className="text-white/50 mb-8">see what others are sending to space rn</p>
        
        <div className="space-y-3">
          {activities.length === 0 ? (
            <div className="text-center py-8 text-white/30">
              <div className="text-4xl mb-2">🌌</div>
              <p>No yeeting activity yet... be the first!</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className={`bg-white/5 border rounded-lg p-4 flex items-center gap-4 ${
                  activity.isReal ? 'border-pink-500/30' : 'border-white/10'
                }`}
              >
                <div className="text-2xl">{activity.payloadEmoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-white truncate">
                    <span className="text-pink-400 font-semibold">{activity.name}</span>
                    <span className="text-white/50"> {activity.action} </span>
                    <span className="text-white">{activity.payload}</span>
                    <span className="text-white/50"> to </span>
                    <span className="text-cyan-400">{activity.destination}</span>
                  </p>
                  {activity.cost && (
                    <p className="text-white/40 text-xs mt-1">
                      {formatCurrency(activity.cost)}
                    </p>
                  )}
                </div>
                <div className="text-white/30 text-sm whitespace-nowrap">{activity.timeAgo}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

function Leaderboard() {
  const { data, isLoading } = useQuery<{ topYeets: Yeet[] }>({
    queryKey: ['/api/yeets/leaderboard'],
    refetchInterval: 30000,
  });

  const topYeets = data?.topYeets || [];
  const rankEmojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];

  return (
    <section className="py-12 bg-gradient-to-b from-black to-purple-950">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <span className="text-yellow-400 font-mono text-sm">leaderboard</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          🏆 Today's Top Yeeters
        </h2>
        <p className="text-white/50 mb-8">the biggest sends of the day</p>
        
        {isLoading ? (
          <div className="text-center py-8 text-white/30">Loading...</div>
        ) : topYeets.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-white/50 text-lg">No yeets today yet!</p>
            <p className="text-white/30 text-sm mt-2">Be the first to claim the top spot</p>
          </div>
        ) : (
          <div className="space-y-3">
            {topYeets.map((yeet, index) => (
              <div
                key={yeet.id}
                className={`relative overflow-hidden rounded-xl p-4 flex items-center gap-4 ${
                  index === 0 
                    ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-2 border-yellow-500/50' 
                    : index === 1
                    ? 'bg-gradient-to-r from-gray-400/20 to-gray-300/20 border border-gray-400/30'
                    : index === 2
                    ? 'bg-gradient-to-r from-orange-600/20 to-amber-600/20 border border-orange-500/30'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {index === 0 && (
                  <Crown className="absolute top-2 right-2 w-5 h-5 text-yellow-400 animate-pulse" />
                )}
                <div className="text-3xl">{rankEmojis[index]}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${index === 0 ? 'text-yellow-400' : 'text-white'}`}>
                      {yeet.nickname || "Anonymous"}
                    </span>
                    <span className="text-2xl">{yeet.payloadEmoji}</span>
                  </div>
                  <p className="text-white/50 text-sm truncate">
                    yeeted {yeet.payload} to <span className="text-cyan-400">{yeet.destination}</span>
                  </p>
                </div>
                <div className={`text-right ${index === 0 ? 'text-yellow-400' : 'text-pink-400'}`}>
                  <div className="font-bold text-lg">{formatCurrency(yeet.estimatedCost)}</div>
                  <div className="text-xs text-white/30">via {yeet.rocketName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const CARGO_ITEMS = [
  { id: "satellite", name: "Satellite", emoji: "🛰️", weight: 200, color: "from-blue-500 to-cyan-500" },
  { id: "food", name: "Space Food", emoji: "🍕", weight: 50, color: "from-orange-500 to-yellow-500" },
  { id: "rover", name: "Rover", emoji: "🤖", weight: 300, color: "from-red-500 to-pink-500" },
  { id: "astronaut", name: "Astronaut", emoji: "🧑‍🚀", weight: 80, color: "from-purple-500 to-indigo-500" },
];

const MAX_CARGO_WEIGHT = 500;

const FUN_COMPARISONS = [
  { name: "Pepperoni Pizzas", weight: 0.5, emoji: "🍕" },
  { name: "Golden Retrievers", weight: 30, emoji: "🐕" },
  { name: "Bowling Balls", weight: 7, emoji: "🎳" },
  { name: "Watermelons", weight: 10, emoji: "🍉" },
  { name: "Rubber Ducks", weight: 0.1, emoji: "🦆" },
  { name: "iPhones", weight: 0.17, emoji: "📱" },
  { name: "Minecraft Diamond Swords (if real)", weight: 5, emoji: "⚔️" },
  { name: "Baby Yodas", weight: 8, emoji: "👶" },
  { name: "Basketballs", weight: 0.6, emoji: "🏀" },
  { name: "Gallons of Milk", weight: 3.8, emoji: "🥛" },
];

function getSpaceComparison(totalWeight: number): string {
  if (totalWeight <= 0) return "";
  const index = totalWeight % FUN_COMPARISONS.length;
  const comparison = FUN_COMPARISONS[index];
  const count = Math.round(totalWeight / comparison.weight);
  return `${comparison.emoji} That's as heavy as ${count.toLocaleString()} ${comparison.name}!`;
}

function useCountdownAudio() {
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playBeep = useCallback((frequency: number, duration: number) => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = "square";
      gain.gain.value = 0.15;
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }, []);

  const playCountdownBeep = useCallback((number: number) => {
    if (number === 0) {
      playBeep(880, 0.8);
      setTimeout(() => playBeep(1100, 0.6), 200);
    } else if (number <= 3) {
      playBeep(660, 0.3);
    } else {
      playBeep(440, 0.2);
    }
  }, [playBeep]);

  return { playCountdownBeep };
}

function CargoLoader() {
  const [loadedCargo, setLoadedCargo] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [comparison, setComparison] = useState("");
  const [launchPhase, setLaunchPhase] = useState<"idle" | "countdown" | "launching" | "badge">("idle");
  const [countdown, setCountdown] = useState(10);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dragItem, setDragItem] = useState<string | null>(null);
  const rocketAreaRef = useRef<HTMLDivElement>(null);
  const { playCountdownBeep } = useCountdownAudio();

  const totalWeight = loadedCargo.reduce((sum, id) => {
    const item = CARGO_ITEMS.find(c => c.id === id);
    return sum + (item?.weight || 0);
  }, 0);

  const isOverweight = totalWeight > MAX_CARGO_WEIGHT;
  const weightPercent = Math.min((totalWeight / MAX_CARGO_WEIGHT) * 100, 100);

  useEffect(() => {
    if (totalWeight > 0) {
      setComparison(getSpaceComparison(totalWeight));
    } else {
      setComparison("");
    }
  }, [totalWeight]);

  const addCargo = useCallback((itemId: string) => {
    setLoadedCargo(prev => [...prev, itemId]);
  }, []);

  const removeCargo = useCallback((index: number) => {
    setLoadedCargo(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent, itemId: string) => {
    if (launchPhase !== "idle") return;
    e.preventDefault();
    setDragItem(itemId);
  }, [launchPhase]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragItem || !rocketAreaRef.current) return;
    const rect = rocketAreaRef.current.getBoundingClientRect();
    const isOver = (
      e.clientX >= rect.left && e.clientX <= rect.right &&
      e.clientY >= rect.top && e.clientY <= rect.bottom
    );
    setDragOver(isOver);
  }, [dragItem]);

  const handlePointerUp = useCallback(() => {
    if (dragItem && dragOver) {
      addCargo(dragItem);
    }
    setDragItem(null);
    setDragOver(false);
  }, [dragItem, dragOver, addCargo]);

  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    e.dataTransfer.setData("text/plain", itemId);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const itemId = e.dataTransfer.getData("text/plain");
    if (itemId) addCargo(itemId);
    setDragOver(false);
  }, [addCargo]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const startLaunch = useCallback(() => {
    if (isOverweight || loadedCargo.length === 0) return;
    setLaunchPhase("countdown");
    setCountdown(10);
  }, [isOverweight, loadedCargo.length]);

  useEffect(() => {
    if (launchPhase !== "countdown") return;
    if (countdown < 0) {
      setLaunchPhase("launching");
      setTimeout(() => setLaunchPhase("badge"), 3000);
      return;
    }
    if (soundEnabled) playCountdownBeep(countdown);
    const timer = setTimeout(() => setCountdown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [launchPhase, countdown, soundEnabled, playCountdownBeep]);

  const resetAll = () => {
    setLoadedCargo([]);
    setLaunchPhase("idle");
    setCountdown(10);
    setComparison("");
  };

  return (
    <section
      className="py-12 bg-gradient-to-b from-black via-indigo-950/30 to-black"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ touchAction: dragItem ? "none" : "auto" }}
    >
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-yellow-400 font-mono text-sm uppercase tracking-wider">Interactive</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          🚀 Pack Your Rocket!
        </h2>
        <p className="text-white/50 mb-8">Drag cargo into the rocket — but don't overload it!</p>

        {launchPhase === "idle" && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
              {CARGO_ITEMS.map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item.id)}
                  onPointerDown={(e) => handlePointerDown(e, item.id)}
                  className={`bg-gradient-to-br ${item.color} p-4 rounded-xl cursor-grab active:cursor-grabbing select-none text-center transition-transform hover:scale-105 active:scale-95 border-2 border-white/20 touch-none`}
                >
                  <div className="text-4xl sm:text-5xl mb-2">{item.emoji}</div>
                  <div className="font-bold text-white text-sm">{item.name}</div>
                  <div className="text-white/80 text-xs">{item.weight} kg</div>
                </div>
              ))}
            </div>

            {dragItem && (
              <p className="text-center text-cyan-400 text-sm mb-4 animate-pulse">
                Now drop it on the rocket below!
              </p>
            )}

            <div
              ref={rocketAreaRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative mx-auto max-w-md rounded-2xl border-4 border-dashed p-6 min-h-[220px] transition-all ${
                dragOver
                  ? "border-cyan-400 bg-cyan-500/10 scale-105"
                  : "border-white/20 bg-white/5"
              }`}
            >
              <div className="text-center mb-4">
                <div className="text-6xl">🚀</div>
                <p className="text-white/50 text-sm mt-2">
                  {loadedCargo.length === 0
                    ? "Drop cargo here!"
                    : `${loadedCargo.length} item${loadedCargo.length > 1 ? "s" : ""} loaded`}
                </p>
              </div>

              {loadedCargo.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {loadedCargo.map((id, index) => {
                    const item = CARGO_ITEMS.find(c => c.id === id);
                    if (!item) return null;
                    return (
                      <button
                        key={`${id}-${index}`}
                        onClick={() => removeCargo(index)}
                        className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 flex items-center gap-2 hover:bg-red-500/20 hover:border-red-500/50 transition-all group"
                      >
                        <span className="text-xl">{item.emoji}</span>
                        <span className="text-white/70 text-xs">{item.weight}kg</span>
                        <span className="text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">✕</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="max-w-md mx-auto mt-6">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-white/70">Weight: {totalWeight} kg / {MAX_CARGO_WEIGHT} kg</span>
                {isOverweight && (
                  <span className="text-red-400 font-bold animate-pulse">⚠️ Too heavy!</span>
                )}
              </div>
              <div className="h-6 bg-white/10 rounded-full overflow-hidden border border-white/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverweight
                      ? "bg-gradient-to-r from-red-500 to-red-600"
                      : weightPercent > 75
                      ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                      : "bg-gradient-to-r from-green-500 to-cyan-500"
                  }`}
                  style={{ width: `${Math.min(weightPercent, 100)}%` }}
                />
              </div>
              {isOverweight && (
                <p className="text-red-400 text-center text-sm mt-3 font-semibold animate-bounce">
                  🚨 Too heavy! Remove some cargo!
                </p>
              )}

              {comparison && (
                <p className="text-center text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400 mt-4">
                  {comparison}
                </p>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={startLaunch}
                  disabled={isOverweight || loadedCargo.length === 0}
                  className="flex-1 py-5 text-lg font-bold bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:from-orange-600 hover:via-red-600 hover:to-pink-600 text-white disabled:opacity-40"
                >
                  <Rocket className="w-5 h-5 mr-2" />
                  LAUNCH! 🔥
                </Button>
                <Button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-4"
                  title={soundEnabled ? "Mute countdown" : "Unmute countdown"}
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </>
        )}

        {launchPhase === "countdown" && (
          <div className="text-center py-12">
            <div className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 mb-4 tabular-nums">
              {countdown > 0 ? countdown : "GO!"}
            </div>
            <p className="text-white/70 text-xl">
              {countdown > 5
                ? "Systems check..."
                : countdown > 2
                ? "Engines igniting..."
                : countdown > 0
                ? "Main engine start!"
                : "LIFTOFF! 🔥🔥🔥"}
            </p>
            <div className="flex justify-center gap-1 mt-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i >= countdown ? "bg-orange-400 scale-125" : "bg-white/20"
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {launchPhase === "launching" && (
          <div className="text-center py-12 relative overflow-hidden" style={{ minHeight: 300 }}>
            <div className="rocket-launch-animation text-8xl">
              🚀
            </div>
            <div className="mt-4">
              {loadedCargo.map((id, i) => {
                const item = CARGO_ITEMS.find(c => c.id === id);
                return item ? <span key={i} className="text-3xl mx-1 inline-block rocket-cargo-follow" style={{ animationDelay: `${i * 0.15}s` }}>{item.emoji}</span> : null;
              })}
            </div>
            <p className="text-white text-xl font-bold mt-6 animate-pulse">Blasting off to space! 🌟</p>

            <style>{`
              @keyframes rocketFly {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                50% { transform: translateY(-120px) scale(1.2); opacity: 1; }
                90% { transform: translateY(-280px) scale(0.8); opacity: 0.6; }
                100% { transform: translateY(-350px) scale(0.4); opacity: 0; }
              }
              @keyframes cargoFollow {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                60% { transform: translateY(-100px) scale(0.9); opacity: 0.8; }
                100% { transform: translateY(-250px) scale(0.3); opacity: 0; }
              }
              .rocket-launch-animation {
                animation: rocketFly 2.8s ease-in forwards;
              }
              .rocket-cargo-follow {
                animation: cargoFollow 2.5s ease-in forwards;
              }
            `}</style>
          </div>
        )}

        {launchPhase === "badge" && (
          <div className="text-center py-8">
            <div className="inline-block bg-gradient-to-br from-yellow-500/20 via-purple-500/20 to-cyan-500/20 border-2 border-yellow-500/50 rounded-2xl p-8 sm:p-10 mx-auto max-w-sm" id="mission-badge">
              <div className="relative">
                <Award className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                <Sparkles className="w-6 h-6 text-yellow-300 absolute top-0 right-1/4 animate-pulse" />
                <Sparkles className="w-5 h-5 text-pink-300 absolute top-2 left-1/4 animate-pulse" style={{ animationDelay: "0.5s" }} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 mb-2">
                Certified
              </h3>
              <p className="text-xl sm:text-2xl font-bold text-white mb-1">Space Logistics</p>
              <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 mb-4">
                Junior
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent mb-4" />
              <p className="text-white/50 text-sm mb-1">Payload: {totalWeight} kg</p>
              <p className="text-white/50 text-sm mb-1">{loadedCargo.length} item{loadedCargo.length !== 1 ? "s" : ""} delivered</p>
              <p className="text-white/30 text-xs mt-3">Orbit to Orbit Express • {new Date().toLocaleDateString()}</p>
            </div>

            <p className="text-white/50 text-sm mt-6 mb-4">Take a screenshot of your badge to share it!</p>

            <Button
              onClick={resetAll}
              variant="outline"
              className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20"
            >
              Pack Another Rocket! 🚀
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}

type SandboxMission = { id: string; name: string; emoji: string; description: string; requiredPower: number };
type SandboxRocket = { id: string; name: string; emoji: string; size: string; power: number; description: string };

const SANDBOX_MISSIONS: SandboxMission[] = [
  { id: "orbit", name: "Orbit Earth", emoji: "🌍", description: "Circle the planet at 400 km altitude", requiredPower: 1 },
  { id: "moon", name: "Land on the Moon", emoji: "🌙", description: "Touch down on the lunar surface", requiredPower: 2 },
  { id: "mars", name: "Visit Mars", emoji: "🔴", description: "Travel to the Red Planet", requiredPower: 3 },
];

const SANDBOX_ROCKETS: SandboxRocket[] = [
  { id: "small", name: "Mini Rocket", emoji: "🚀", size: "Small", power: 1, description: "Good for Earth orbit missions" },
  { id: "medium", name: "Super Rocket", emoji: "🚀🚀", size: "Medium", power: 2, description: "Can reach the Moon!" },
  { id: "large", name: "Mega Rocket", emoji: "🚀🚀🚀", size: "Large", power: 3, description: "Powerful enough for Mars and beyond" },
];

function SpaceSandbox() {
  const [mission, setMission] = useState<SandboxMission | null>(null);
  const [rocket, setRocket] = useState<SandboxRocket | null>(null);
  const [launchState, setLaunchState] = useState<"idle" | "launching" | "success" | "fail">("idle");
  const [animationStep, setAnimationStep] = useState(0);

  const handleLaunch = useCallback(() => {
    if (!mission || !rocket) return;
    setLaunchState("launching");
    setAnimationStep(0);
    
    const steps = [1, 2, 3];
    steps.forEach((step, i) => {
      setTimeout(() => setAnimationStep(step), (i + 1) * 800);
    });

    setTimeout(() => {
      if (rocket.power >= mission.requiredPower) {
        setLaunchState("success");
      } else {
        setLaunchState("fail");
      }
    }, 3200);
  }, [mission, rocket]);

  const reset = () => {
    setLaunchState("idle");
    setAnimationStep(0);
    setMission(null);
    setRocket(null);
  };

  return (
    <section className="py-12 bg-gradient-to-b from-black via-purple-950/50 to-black">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-400 font-mono text-sm uppercase tracking-wider">Space Sandbox</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          Pick a Mission & Launch!
        </h2>
        <p className="text-white/50 mb-8">Choose where to go and pick your rocket. Can you match the right rocket to the mission?</p>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-pink-400 uppercase tracking-wider mb-4">1. Choose Your Mission</h3>
            <div className="space-y-3">
              {SANDBOX_MISSIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => { setMission(m); setLaunchState("idle"); setAnimationStep(0); }}
                  disabled={launchState === "launching"}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    mission?.id === m.id
                      ? "border-pink-500 bg-pink-500/20"
                      : "border-white/10 bg-white/5 hover:border-purple-500/50"
                  } ${launchState === "launching" ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{m.emoji}</span>
                    <div>
                      <div className="font-semibold text-white">{m.name}</div>
                      <div className="text-xs text-white/50">{m.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-4">2. Pick Your Rocket</h3>
            <div className="space-y-3">
              {SANDBOX_ROCKETS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setRocket(r); setLaunchState("idle"); setAnimationStep(0); }}
                  disabled={launchState === "launching"}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                    rocket?.id === r.id
                      ? "border-cyan-400 bg-cyan-500/20"
                      : "border-white/10 bg-white/5 hover:border-purple-500/50"
                  } ${launchState === "launching" ? "opacity-50" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{r.emoji}</span>
                    <div>
                      <div className="font-semibold text-white">{r.size} - {r.name}</div>
                      <div className="text-xs text-white/50">{r.description}</div>
                    </div>
                    <div className="ml-auto flex gap-1">
                      {Array.from({ length: r.power }).map((_, i) => (
                        <Zap key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center">
          {launchState === "idle" && (
            <Button
              onClick={handleLaunch}
              disabled={!mission || !rocket}
              className="px-8 py-6 text-xl font-bold bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 text-white disabled:opacity-50"
            >
              <Rocket className="w-6 h-6 mr-2" />
              LAUNCH!
            </Button>
          )}

          {launchState === "launching" && (
            <div className="py-8">
              <div className="text-6xl mb-4 animate-bounce">
                {animationStep === 0 && "🔥"}
                {animationStep === 1 && "🚀"}
                {animationStep === 2 && "✨"}
                {animationStep === 3 && "🌟"}
              </div>
              <p className="text-white text-xl font-bold">
                {animationStep === 0 && "Ignition..."}
                {animationStep === 1 && "Liftoff!"}
                {animationStep === 2 && "Leaving atmosphere..."}
                {animationStep === 3 && "Checking trajectory..."}
              </p>
              <div className="flex justify-center gap-2 mt-4">
                {[1, 2, 3].map((s) => (
                  <div key={s} className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    animationStep >= s ? "bg-cyan-400 scale-125" : "bg-white/20"
                  }`} />
                ))}
              </div>
            </div>
          )}

          {launchState === "success" && mission && rocket && (
            <div className="py-8 bg-green-500/10 border border-green-500/30 rounded-xl p-6">
              <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-green-400 mb-2">Mission Success!</h3>
              <p className="text-white/70 mb-4">
                Your <span className="text-cyan-400 font-bold">{rocket.name}</span> made it to{" "}
                <span className="text-pink-400 font-bold">{mission.name}</span>! {mission.emoji}
              </p>
              <p className="text-white/50 text-sm mb-6">
                {rocket.power > mission.requiredPower
                  ? "That rocket was even more powerful than needed - nice choice!"
                  : "Perfect match! Just enough power to complete the mission."}
              </p>
              <Button onClick={reset} variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/20">
                Try Another Mission
              </Button>
            </div>
          )}

          {launchState === "fail" && mission && rocket && (
            <div className="py-8 bg-red-500/10 border border-red-500/30 rounded-xl p-6">
              <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-red-400 mb-2">Not Enough Power!</h3>
              <p className="text-white/70 mb-4">
                The <span className="text-cyan-400 font-bold">{rocket.name}</span> wasn't powerful enough to reach{" "}
                <span className="text-pink-400 font-bold">{mission.name}</span> {mission.emoji}
              </p>
              <p className="text-white/50 text-sm mb-6">
                Hint: {mission.name} needs at least {mission.requiredPower === 2 ? "a Medium" : "a Large"} rocket. Try a bigger one!
              </p>
              <Button onClick={reset} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/20">
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

const TEACHER_RESOURCES = {
  elementary: {
    grade: "Elementary (K-5)",
    icon: "🌟",
    color: "from-green-500/20 to-emerald-500/20",
    border: "border-green-500/30",
    accent: "text-green-400",
    activities: [
      {
        title: "Payload Weight Challenge",
        time: "20 min",
        description: "Students use the Visual Cargo Loader to learn about weight limits and gravity. They pack a rocket and discover why heavier payloads cost more to launch.",
        standards: "NGSS: PS2.A (Forces and Motion), 3-PS2-1",
        materials: "Computer/tablet with internet access"
      },
      {
        title: "Space Word of the Day Journal",
        time: "10 min daily",
        description: "Each day, students write the Space Word of the Day in their journal with its definition and draw a picture. By the end of the month, they have a personalized space dictionary.",
        standards: "NGSS: ESS1.A (Universe and Stars), CCSS.ELA-LITERACY.L.3.4",
        materials: "Notebooks, colored pencils"
      },
      {
        title: "Where Would You Send It?",
        time: "30 min",
        description: "Students pick an item from the classroom and use the Yeet Calculator to figure out how much it would cost to send to the Moon vs Mars. Compare results as a class.",
        standards: "NGSS: ESS1.B (Earth and the Solar System), Math: 4.NBT.4",
        materials: "Classroom objects, scale (optional), internet access"
      },
      {
        title: "Solar System Distance Map",
        time: "45 min",
        description: "Using the 17 destinations in the calculator, students create a scaled map showing relative distances. They calculate travel times and discuss why farther destinations cost more.",
        standards: "NGSS: ESS1.B, Math: 5.NBT.5 (Multi-digit multiplication)",
        materials: "Roll of paper, markers, rulers, internet access"
      }
    ]
  },
  middle: {
    grade: "Middle School (6-8)",
    icon: "🔬",
    color: "from-blue-500/20 to-cyan-500/20",
    border: "border-blue-500/30",
    accent: "text-blue-400",
    activities: [
      {
        title: "Delta-V Design Challenge",
        time: "45 min",
        description: "Students learn what delta-v means using the glossary, then use the Orbital Planner to compare how much delta-v different orbits require. They graph the relationship between orbit altitude and energy needed.",
        standards: "NGSS: MS-PS2-4 (Gravitational interactions), MS-ESS1-2",
        materials: "Graph paper or spreadsheet, internet access"
      },
      {
        title: "Launch Cost Economics",
        time: "60 min",
        description: "Students use the Yeet Calculator to price missions, then calculate cost-per-kilogram for different rockets. They create presentations arguing which rocket is the 'best deal' for different mission types.",
        standards: "NGSS: MS-ETS1-1, Math: 6.RP.3 (Ratios and unit rates)",
        materials: "Internet access, presentation software"
      },
      {
        title: "Rocket Match Game",
        time: "30 min",
        description: "Using the Space Sandbox, students experiment with matching rockets to missions. They predict which rocket-mission pairings will succeed or fail, record results, and write explanations using thrust-to-weight ratio concepts.",
        standards: "NGSS: MS-PS2-2 (Force and motion), MS-ETS1-4",
        materials: "Internet access, prediction worksheets"
      },
      {
        title: "Space Company Research Project",
        time: "3-5 class periods",
        description: "Each student picks a company from the Company Directory and researches it: what they launch, where they are based, who their customers are. Present findings to class with a comparison to at least one competitor.",
        standards: "NGSS: MS-ETS1-2, CCSS.ELA-LITERACY.W.7.7 (Research)",
        materials: "Internet access, O2O Express Company Directory"
      }
    ]
  },
  high: {
    grade: "High School (9-12)",
    icon: "🎓",
    color: "from-purple-500/20 to-pink-500/20",
    border: "border-purple-500/30",
    accent: "text-purple-400",
    activities: [
      {
        title: "Orbital Mechanics Deep Dive",
        time: "90 min (2 periods)",
        description: "Students use the Glossary to master orbital mechanics vocabulary (Hohmann transfer, gravity assist, inclination, eccentricity). They use the Orbital Planner to compare delta-v requirements for different transfer orbits and explain why some trajectories are more fuel-efficient.",
        standards: "NGSS: HS-PS2-4, HS-ESS1-4, AP Physics: Gravitation",
        materials: "Internet access, scientific calculators"
      },
      {
        title: "CubeSat Mission Proposal",
        time: "1-2 weeks project",
        description: "Teams design a CubeSat mission: define the science objective, use the Orbital Planner to select orbit and rocket, estimate costs, and create a budget proposal. Present to class as if pitching to a space agency.",
        standards: "NGSS: HS-ETS1-2, HS-ETS1-3, CCSS.ELA-LITERACY.W.11-12.1",
        materials: "Internet access, O2O Express tools, presentation software"
      },
      {
        title: "Space Industry Market Analysis",
        time: "1 week project",
        description: "Students analyze 10 companies from the Directory across different segments (launch providers, satellite manufacturers, ground stations). They read Insights articles on orbital economics and write a market analysis report.",
        standards: "NGSS: HS-ETS1-1, CCSS.ELA-LITERACY.RI.11-12.7, Economics standards",
        materials: "Internet access, O2O Express Directory + Insights"
      },
      {
        title: "International Launch Site Comparison",
        time: "60 min",
        description: "Using the Launch Calendar and rocket detail pages, students compare launch sites worldwide (Cape Canaveral, Kourou, Baikonur, Sriharikota, Wenchang). They analyze why equatorial sites have advantages for GEO launches and calculate delta-v savings.",
        standards: "NGSS: HS-ESS1-4, HS-PS2-4, AP Physics/Geography",
        materials: "Internet access, world maps, calculators"
      },
      {
        title: "ITAR and Space Law Debate",
        time: "45-60 min",
        description: "Students research ITAR and EAR regulations using the Glossary, then debate: 'Should space technology export controls be relaxed to promote international collaboration?' Students represent different countries' perspectives.",
        standards: "NGSS: HS-ETS1-3, CCSS.ELA-LITERACY.SL.11-12.4, Government/Civics",
        materials: "Internet access, O2O Express Glossary, research materials"
      }
    ]
  }
};

function TeacherResources() {
  const [activeTab, setActiveTab] = useState<"elementary" | "middle" | "high">("elementary");
  const [expandedActivity, setExpandedActivity] = useState<string | null>(null);
  const current = TEACHER_RESOURCES[activeTab];

  return (
    <section id="teacher-resources" className="py-16 bg-gradient-to-b from-black via-indigo-950/30 to-black scroll-mt-16">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-full px-4 py-2 mb-4">
            <span className="text-yellow-400 text-sm font-mono uppercase tracking-wider">For Educators</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-3">
            Teacher Resource Center
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Standards-aligned lesson plans and activities using Orbit to Orbit Express as a hands-on STEM learning tool.
            Every activity uses real space industry data and professional tools adapted for classroom use.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {(Object.keys(TEACHER_RESOURCES) as Array<keyof typeof TEACHER_RESOURCES>).map((key) => {
            const res = TEACHER_RESOURCES[key];
            return (
              <button
                key={key}
                onClick={() => { setActiveTab(key); setExpandedActivity(null); }}
                className={`px-5 py-3 rounded-xl border-2 transition-all font-semibold ${
                  activeTab === key
                    ? `bg-gradient-to-r ${res.color} ${res.border} text-white`
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:text-white"
                }`}
              >
                <span className="mr-2">{res.icon}</span>
                {res.grade}
              </button>
            );
          })}
        </div>

        <div className="space-y-4">
          {current.activities.map((activity, idx) => {
            const actId = `${activeTab}-${idx}`;
            const isExpanded = expandedActivity === actId;
            return (
              <div
                key={actId}
                className={`border-2 rounded-xl transition-all overflow-hidden ${current.border} ${
                  isExpanded ? `bg-gradient-to-r ${current.color}` : "bg-white/5"
                }`}
              >
                <button
                  onClick={() => setExpandedActivity(isExpanded ? null : actId)}
                  className="w-full p-5 text-left flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sm font-bold ${current.accent}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{activity.title}</h3>
                      <span className="text-white/40 text-sm">{activity.time}</span>
                    </div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-white/40 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                </button>
                {isExpanded && (
                  <div className="px-5 pb-5 space-y-4">
                    <p className="text-white/70">{activity.description}</p>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Standards Alignment</p>
                        <p className="text-white/80 text-sm">{activity.standards}</p>
                      </div>
                      <div className="bg-black/30 rounded-lg p-3">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Materials Needed</p>
                        <p className="text-white/80 text-sm">{activity.materials}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-xl p-6 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Need Custom Activities?</h3>
          <p className="text-white/60 mb-4 max-w-lg mx-auto">
            We can create custom lesson plans for your school, district, or after-school program. 
            Great for science fairs, STEM weeks, and space-themed curriculum units.
          </p>
          <a href="mailto:vlad@orbit2orbitexpress.com?subject=Teacher%20Resources%20Inquiry">
            <Button className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold px-6 py-3">
              <Mail className="w-4 h-4 mr-2" />
              Contact Us for Custom Plans
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

function KidsFooter() {
  return (
    <footer className="py-12 bg-gradient-to-t from-purple-900/50 to-black border-t border-white/10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-white mb-4">What is this?</h3>
          <p className="text-white/70 mb-4">
            Ever wanted to send something (or someone) to space?
            We use <span className="text-pink-400 font-semibold">real launch costs</span> from actual space companies
            to calculate what it would cost to yeet your stuff into orbit.
          </p>
          <p className="text-white/70 mb-4">
            From Low Earth Orbit to Saturn's moon Titan - we've got
            <span className="text-cyan-400 font-semibold"> 17 destinations</span> for all your yeeting needs.
          </p>
          <div className="flex items-start gap-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mt-4">
            <span className="text-xl">⚠️</span>
            <p className="text-yellow-200/80 text-sm">
              This is for fun/educational purposes. Please don't actually try to launch your ex into space. That's illegal (probably).
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 text-xs mb-6">
          <Link href="/privacy" className="text-white/40 hover:text-white/70 transition-colors">Privacy Policy</Link>
          <span className="text-white/20">|</span>
          <Link href="/kids-privacy" className="text-purple-400/70 hover:text-purple-300 transition-colors">Children's Privacy</Link>
          <span className="text-white/20">|</span>
          <Link href="/terms" className="text-white/40 hover:text-white/70 transition-colors">Terms</Link>
          <span className="text-white/20">|</span>
          <Link href="/cookies" className="text-white/40 hover:text-white/70 transition-colors">Cookies</Link>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-4">
            <Link href="/">
              <span className="text-white/50 hover:text-white transition-colors">
                ← Back to O2O Express
              </span>
            </Link>
            <a 
              href="https://open.substack.com/pub/orbitaleconomics"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF6719] hover:text-[#FF6719]/80 transition-colors flex items-center gap-2"
            >
              <SiSubstack className="w-4 h-4" />
              Substack
            </a>
          </div>
          <p className="text-white/30 text-sm">
            Part of <span className="text-white/50">Orbit to Orbit Express</span>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function KidsExperience() {
  useSEO({
    title: "Space for Kids & Teachers - Interactive Rocket Science Education | NGSS-Aligned STEM Activities",
    description: "Free interactive space education for kids, students, and teachers! NGSS-aligned lesson plans for elementary, middle, and high school. Yeet-to-Space calculator, space vocabulary builder, rocket sandbox, cargo loader, and launch simulations. Teach orbital mechanics, delta-v, rocket science, and space industry economics with real data from NASA, SpaceX, and Rocket Lab missions.",
    canonical: "/kids",
    keywords: "space for kids, learn about space, kids space education, rocket science for kids, space vocabulary for children, orbital mechanics for kids, fun space learning, space STEM education, how rockets work for kids, space science activities, space lesson plans, NGSS space activities, space teacher resources, elementary space activities, middle school space curriculum, high school orbital mechanics, space STEM lesson plans, interactive space learning, CubeSat lesson plan, rocket science lesson plan, delta-v for students, space economics for students, space word of the day, free space education, yeet to space calculator, space camp activities, science fair space projects, after school space program, homeschool space curriculum, space field trip activities, NASA education resources, SpaceX for kids, rocket lab for kids, satellite for kids, orbit explained for kids, gravity lesson plan, solar system activities, planetary science for kids, space exploration education, aerospace education, space career education, STEM curriculum space, school district STEM resources, K-12 space science curriculum, STEM coordinator resources, Title I STEM activities, free STEM classroom tools, standards-based space education, NGSS performance expectations space, Common Core math space activities, AP physics space resources, district-wide STEM program, STEM enrichment space, gifted and talented space program, space STEM supplemental materials, space science tutoring help, help with rocket science homework, understand orbital mechanics easily, space science made simple, struggling with physics space concepts, make space science fun, visual space learning tools, hands-on space activities for struggling students, space science extra practice, STEM help for kids, rocket science explained simply, space math help, learn gravity the fun way, space science study guide, teach friend about space, space study group activities, peer tutoring space science, explain rockets to a friend, space science group project, collaborative space learning, STEM peer mentoring activities, educación espacial para niños, espace pour les enfants, Weltraum für Kinder, 子供のための宇宙, 儿童太空教育, تعليم الفضاء للأطفال, 우주 교육 어린이, space onderwijs kinderen, educação espacial crianças, uzay eğitimi çocuklar, pendidikan ruang angkasa anak",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "LearningResource",
        "name": "Orbit to Orbit Express - Space for Kids & Teachers",
        "description": "Free interactive space education platform with NGSS-aligned lesson plans for K-12. Includes launch cost calculator, space vocabulary builder, rocket sandbox, cargo loader, and teacher resource center with activities for elementary, middle school, and high school students.",
        "url": "https://www.orbit2orbitexpress.com/kids",
        "educationalLevel": ["beginner", "intermediate", "advanced"],
        "audience": [
          { "@type": "EducationalAudience", "educationalRole": "student" },
          { "@type": "EducationalAudience", "educationalRole": "teacher" },
          { "@type": "EducationalAudience", "educationalRole": "parent" }
        ],
        "learningResourceType": ["interactive", "lesson plan", "activity"],
        "teaches": [
          "Orbital mechanics", "Rocket science", "Space vocabulary", "Mission planning",
          "Delta-v calculations", "Gravity and forces", "Launch economics", "Space industry",
          "Payload logistics", "Thrust-to-weight ratio", "Solar system distances", "ITAR regulations"
        ],
        "inLanguage": ["en", "es", "fr", "de", "ja", "zh", "ar", "ko", "pt", "tr", "id"],
        "isAccessibleForFree": true,
        "provider": {
          "@type": "Organization",
          "name": "Orbit to Orbit Express",
          "url": "https://www.orbit2orbitexpress.com"
        },
        "educationalAlignment": [
          { "@type": "AlignmentObject", "alignmentType": "educationalFramework", "targetName": "NGSS", "targetDescription": "Next Generation Science Standards" },
          { "@type": "AlignmentObject", "alignmentType": "educationalFramework", "targetName": "CCSS", "targetDescription": "Common Core State Standards" }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is this space education platform free for teachers and schools?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes! The kids section, space vocabulary builder, Yeet-to-Space calculator, visual cargo loader, space sandbox, and all teacher lesson plans are completely free. Teachers can use these NGSS-aligned activities in their classrooms without any subscription." }
          },
          {
            "@type": "Question",
            "name": "What grade levels are the space activities designed for?",
            "acceptedAnswer": { "@type": "Answer", "text": "We provide NGSS-aligned activities for three levels: Elementary (K-5) with hands-on payload and vocabulary activities, Middle School (6-8) with delta-v design challenges and launch economics projects, and High School (9-12) with orbital mechanics deep dives, CubeSat mission proposals, and space law debates." }
          },
          {
            "@type": "Question",
            "name": "How does the Yeet-to-Space calculator teach kids about rocket science?",
            "acceptedAnswer": { "@type": "Answer", "text": "The Yeet-to-Space calculator uses real launch costs from companies like SpaceX, Rocket Lab, and ULA to show kids how much it costs to send different payloads to 17 space destinations. Students learn about mass, volume, orbital mechanics, and rocket selection through an engaging, gamified interface that makes complex concepts accessible." }
          },
          {
            "@type": "Question",
            "name": "Can I use this for homeschool space science curriculum?",
            "acceptedAnswer": { "@type": "Answer", "text": "Absolutely! The platform works great for homeschool families. The Space Word of the Day builds vocabulary daily, the calculator teaches math and physics concepts, the sandbox teaches mission planning logic, and the teacher lesson plans provide structured activities you can adapt for home learning." }
          },
          {
            "@type": "Question",
            "name": "What space vocabulary words do kids learn?",
            "acceptedAnswer": { "@type": "Answer", "text": "Students learn 20+ real aerospace terms including delta-v, apogee, perigee, orbital decay, escape velocity, Hohmann transfer, gravity assist, geosynchronous orbit, specific impulse, thrust-to-weight ratio, payload, propellant, staging, re-entry, microgravity, retrograde orbit, Lagrange point, ablation, orbital inclination, apoapsis, and periapsis. Each term includes a real definition and a fun kid-friendly explanation." }
          },
          {
            "@type": "Question",
            "name": "Is the space education content available in other languages?",
            "acceptedAnswer": { "@type": "Answer", "text": "The platform is primarily in English but is designed to be accessible to students worldwide. We include multilingual keyword targeting for Spanish, French, German, Japanese, Chinese, Arabic, Korean, Portuguese, Turkish, and Indonesian speaking families and schools. The visual and interactive elements transcend language barriers." }
          },
          {
            "@type": "Question",
            "name": "How can I use this for a science fair project about space?",
            "acceptedAnswer": { "@type": "Answer", "text": "The CubeSat Mission Proposal activity (high school) is perfect for science fairs. Students design a real satellite mission, select orbits and rockets using actual industry data, estimate costs, and present a professional mission proposal. Middle schoolers can compare launch costs across rockets or map solar system distances using our calculator data." }
          },
          {
            "@type": "Question",
            "name": "Can school districts use this as a STEM resource across multiple classrooms?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes! The platform is free and browser-based — no software installation, no accounts, no district IT approvals needed. STEM coordinators can share the link with every teacher in the district. All 13 lesson plans include NGSS and Common Core alignment, making them easy to integrate into existing curriculum maps. Works on Chromebooks, iPads, and any device with a browser." }
          },
          {
            "@type": "Question",
            "name": "My student is struggling with space science and physics — will this help?",
            "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. The platform makes abstract concepts like delta-v, orbital mechanics, and gravity tangible through interactive tools. Instead of reading about escape velocity in a textbook, students experiment with it in the rocket sandbox. The Space Word of the Day breaks down intimidating aerospace terms into fun, relatable language. The visual cargo loader teaches mass and weight limits through hands-on play, not equations. Many students who struggle with traditional physics instruction thrive with visual, gamified approaches like this." }
          },
          {
            "@type": "Question",
            "name": "Can kids use this to help friends understand rocket science?",
            "acceptedAnswer": { "@type": "Answer", "text": "That's one of the best uses! The Yeet-to-Space calculator is designed to be shareable and social. Students can challenge friends to find the cheapest way to launch something to Mars, compare quotes, and share results. The Space Sandbox works great for pair work — one student picks a mission, the other picks a rocket, and they predict together if it will work. The leaderboard and activity feed create a social element that makes peer learning natural." }
          },
          {
            "@type": "Question",
            "name": "Does this work for gifted and talented or STEM enrichment programs?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes — the high school activities (CubeSat Mission Proposal, Space Industry Market Analysis, ITAR and Space Law Debate) are specifically designed for advanced learners who need more challenge. These project-based activities combine real aerospace engineering data with economics, policy analysis, and public speaking. They work well for GT pullout programs, STEM clubs, and enrichment classes looking for activities beyond the standard curriculum." }
          },
          {
            "@type": "Question",
            "name": "Is this platform safe and compliant for use with children in schools?",
            "acceptedAnswer": { "@type": "Answer", "text": "Yes. We have a dedicated Children's Privacy Notice compliant with COPPA (US), GDPR-K (EU), and the UK Children's Code. No personal data collection is required to use any of the interactive tools. The platform is ad-free and designed specifically for educational use. Teachers and parents can review our privacy policies at orbit2orbitexpress.com/kids-privacy." }
          }
        ]
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.orbit2orbitexpress.com" },
          { "@type": "ListItem", "position": 2, "name": "Space for Kids & Teachers", "item": "https://www.orbit2orbitexpress.com/kids" }
        ]
      }
    ],
  });
  const queryClient = useQueryClient();
  const [selectedPayload, setSelectedPayload] = useState<PayloadType | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [itemName, setItemName] = useState("");
  const [userName, setUserName] = useState("");
  const [mass, setMass] = useState(70);
  const [volume, setVolume] = useState(0.07);
  const [quote, setQuote] = useState<YeetQuote | null>(null);

  const saveYeetMutation = useMutation({
    mutationFn: async (yeetData: {
      nickname?: string;
      payload: string;
      payloadEmoji: string;
      destination: string;
      estimatedCost: number;
      rocketName: string;
    }) => {
      const response = await apiRequest('POST', '/api/yeets', yeetData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/yeets'] });
    },
  });

  const handleCalculate = () => {
    if (!selectedDestination || !selectedPayload) return;
    const result = calculateYeetCost(selectedDestination.id, mass, volume);
    if (!result) return;
    
    setQuote(result);
    
    saveYeetMutation.mutate({
      nickname: userName || undefined,
      payload: itemName || selectedPayload.name,
      payloadEmoji: selectedPayload.emoji,
      destination: selectedDestination.name,
      estimatedCost: result.totalCost,
      rocketName: result.rocketName,
    });
  };

  return (
    <div className="min-h-screen bg-black">
      <KidsNavigation />
      <KidsHero />
      <SpaceWordOfTheDay />
      <CargoLoader />
      <SpaceSandbox />
      
      <PayloadSelector selected={selectedPayload} onSelect={setSelectedPayload} />
      
      <MissionDetails
        itemName={itemName}
        setItemName={setItemName}
        userName={userName}
        setUserName={setUserName}
        mass={mass}
        setMass={setMass}
        volume={volume}
        setVolume={setVolume}
      />
      
      <DestinationSelector selected={selectedDestination} onSelect={setSelectedDestination} />
      
      <section className="py-12 bg-gradient-to-b from-indigo-950 to-black">
        <div className="max-w-2xl mx-auto px-4">
          <Button
            onClick={handleCalculate}
            disabled={!selectedDestination || !selectedPayload || mass <= 0}
            className="w-full py-6 text-xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Rocket className="w-6 h-6 mr-2" />
            CALCULATE THE YEET
          </Button>
          
          <div className="mt-8">
            <QuotePanel quote={quote} />
          </div>
        </div>
      </section>
      
      <Leaderboard />
      <ActivityFeed />
      <TeacherResources />
      <KidsFooter />
    </div>
  );
}
