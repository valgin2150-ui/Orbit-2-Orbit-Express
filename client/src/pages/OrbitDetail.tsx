import { useMemo } from "react";
import { Link, useParams } from "wouter";
import {
  ArrowLeft,
  Globe,
  Rocket as RocketIcon,
  Zap,
  Target,
  Satellite,
  ChevronRight,
  Moon,
  Navigation2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { orbits, orbitGroups } from "@/lib/data";
import { formatLauncherPrice, useLaunchers, type LauncherRecord } from "@/lib/launcherData";
import Footer from "@/components/Footer";
import { Navigation } from "@/components/Navigation";
import { useSEO } from "@/hooks/useSEO";

interface OrbitMeta {
  slug: string;
  altitudeRange: string;
  period: string;
  description: string;
  useCases: string[];
  typicalPayloads: string[];
  faqs: { question: string; answer: string }[];
}

const orbitMeta: Record<string, OrbitMeta> = {
  VLEO: {
    slug: "vleo",
    altitudeRange: "200–350 km",
    period: "~87–89 min",
    description:
      "Very Low Earth Orbit sits just above the atmosphere, providing the highest spatial resolution for Earth observation and the lowest latency for communications. Satellites in VLEO experience significant atmospheric drag, requiring periodic reboosts or low-drag designs. This orbit is increasingly popular for high-resolution imaging constellations.",
    useCases: [
      "High-resolution Earth imaging",
      "Low-latency IoT connectivity",
      "Scientific atmospheric research",
      "Technology demonstration missions",
    ],
    typicalPayloads: [
      "CubeSats (1–12U)",
      "Small imaging satellites",
      "Atmospheric sensors",
      "Drag-sail experiments",
    ],
    faqs: [
      {
        question: "How much does it cost to launch to VLEO?",
        answer:
          "VLEO launch costs range from $3,000/kg on rideshare missions to $25,000/kg on dedicated small launchers. SpaceX Falcon 9 rideshare is the most affordable at roughly $6,500/kg for small payloads.",
      },
      {
        question: "How long do satellites last in VLEO?",
        answer:
          "Without station-keeping, a VLEO satellite will deorbit within months to a few years due to atmospheric drag. With electric propulsion reboosts, satellites can maintain VLEO for 5+ years.",
      },
      {
        question: "What is the delta-v required to reach VLEO?",
        answer:
          "Approximately 9.2 km/s of delta-v is needed from the ground to reach VLEO, slightly less than standard LEO due to the lower altitude.",
      },
    ],
  },
  LEO: {
    slug: "leo",
    altitudeRange: "400–1,200 km",
    period: "~90–113 min",
    description:
      "Low Earth Orbit is the most accessible and commonly used orbit, home to the International Space Station, Starlink, and thousands of commercial satellites. LEO offers a balance of coverage, latency, and launch cost, making it the default destination for most satellite missions.",
    useCases: [
      "Broadband internet constellations (Starlink, OneWeb)",
      "Earth observation and remote sensing",
      "Crewed space stations",
      "Technology demonstration",
      "Space debris monitoring",
    ],
    typicalPayloads: [
      "Communication satellites (100–500 kg)",
      "Earth observation satellites",
      "CubeSats and small sats",
      "Space station resupply modules",
    ],
    faqs: [
      {
        question: "How much does it cost to launch to LEO?",
        answer:
          "LEO launch costs range from $1,520/kg (Falcon Heavy) to $25,000/kg (dedicated small launchers). The most common option, Falcon 9, costs approximately $3,063/kg for a full mission.",
      },
      {
        question: "What launchers can reach LEO?",
        answer:
          "Nearly all operational launch vehicles can reach LEO, including Falcon 9, Falcon Heavy, Electron, Vulcan Centaur, Ariane 6, PSLV, Long March 5, H3, and more.",
      },
      {
        question: "How long does it take to reach LEO?",
        answer:
          "A typical launch vehicle reaches LEO in 8–12 minutes after liftoff. The exact time depends on the rocket's thrust-to-weight ratio and trajectory.",
      },
    ],
  },
  MEO: {
    slug: "meo",
    altitudeRange: "2,000–35,786 km",
    period: "~2–12 hours",
    description:
      "Medium Earth Orbit bridges the gap between LEO and GEO. It is home to navigation constellations like GPS, Galileo, and GLONASS. MEO offers wider coverage per satellite than LEO while maintaining reasonable signal latency.",
    useCases: [
      "Global navigation satellite systems (GPS, Galileo, BeiDou)",
      "Medium-latency broadband (O3b mPOWER)",
      "Search and rescue beacons",
      "Space weather monitoring",
    ],
    typicalPayloads: [
      "Navigation satellites (1,000–2,000 kg)",
      "Communication satellites",
      "Scientific research payloads",
    ],
    faqs: [
      {
        question: "How much does it cost to launch to MEO?",
        answer:
          "MEO launches typically cost 20–40% more than LEO due to additional delta-v. Expect $5,000–$15,000/kg depending on the launch vehicle and orbit specifics.",
      },
      {
        question: "Why is MEO used for GPS satellites?",
        answer:
          "MEO at ~20,200 km provides optimal coverage geometry: each GPS satellite covers a large portion of Earth's surface, allowing the full constellation of 24–31 satellites to provide global positioning.",
      },
      {
        question: "What delta-v is required for MEO?",
        answer:
          "Approximately 10.2 km/s from the ground, requiring more energy than LEO but significantly less than GEO.",
      },
    ],
  },
  HEO: {
    slug: "heo",
    altitudeRange: "Apogee > 35,786 km",
    period: "~12–24 hours",
    description:
      "High Earth Orbit encompasses elliptical orbits with apogees above GEO altitude. Highly elliptical orbits like Molniya and Tundra orbits are used for high-latitude communications and early-warning systems, spending most of their orbital period over specific regions.",
    useCases: [
      "High-latitude communications (Molniya orbit)",
      "Early-warning missile detection",
      "Space weather observation",
      "Scientific deep-space telescopes",
    ],
    typicalPayloads: [
      "Military early-warning satellites",
      "Communications satellites for polar regions",
      "Astronomical observatories",
    ],
    faqs: [
      {
        question: "What is a Molniya orbit?",
        answer:
          "A Molniya orbit is a highly elliptical orbit with a 12-hour period, inclined at 63.4°. Satellites spend about 8 hours near apogee over high latitudes, providing excellent coverage for Russia and northern regions.",
      },
      {
        question: "How much does a HEO launch cost?",
        answer:
          "HEO launches are comparable to GTO pricing, typically $8,000–$20,000/kg, depending on the specific orbit parameters and launch vehicle.",
      },
      {
        question: "What delta-v is needed for HEO?",
        answer:
          "Approximately 11.5 km/s from the ground, with the exact value depending on the target apogee and inclination.",
      },
    ],
  },
  GEO: {
    slug: "geo",
    altitudeRange: "35,786 km (circular)",
    period: "23 h 56 min (sidereal day)",
    description:
      "Geostationary Orbit is a circular orbit at 35,786 km where satellites match Earth's rotation, appearing stationary over a fixed point on the equator. GEO is essential for weather monitoring, broadcast television, and telecommunications. A single GEO satellite can cover roughly one-third of Earth's surface.",
    useCases: [
      "Weather monitoring and forecasting",
      "Direct broadcast television",
      "Telecommunications relay",
      "Military strategic communications",
    ],
    typicalPayloads: [
      "Large communication satellites (3,000–6,500 kg)",
      "Weather satellites (GOES series)",
      "Military SATCOM platforms",
    ],
    faqs: [
      {
        question: "How much does it cost to launch to GEO?",
        answer:
          "GEO launches typically cost $15,000–$30,000/kg. Falcon Heavy offers the best value at roughly $12,000–$15,000/kg for direct GEO insertion. Many missions use GTO with on-board propulsion to reduce launch cost.",
      },
      {
        question: "Why is GEO important for communications?",
        answer:
          "GEO satellites remain fixed relative to ground stations, eliminating the need for tracking antennas. One satellite covers ~34% of Earth's surface, enabling continent-wide broadcast and communications with just three satellites.",
      },
      {
        question: "What is the delta-v to reach GEO?",
        answer:
          "Approximately 13.7 km/s from the ground, including the circularization burn at GEO altitude. This is significantly more than LEO, which is why GEO payloads are much smaller for the same rocket.",
      },
    ],
  },
  GSO: {
    slug: "gso",
    altitudeRange: "~35,786 km (inclined)",
    period: "23 h 56 min",
    description:
      "Geosynchronous Orbit shares the same altitude and period as GEO but has a non-zero inclination, causing the satellite to trace a figure-eight pattern as seen from the ground. GSO is used when coverage of higher latitudes is needed without the cost of a full GEO insertion.",
    useCases: [
      "Regional communications for mid-latitude regions",
      "Quasi-zenith satellite systems (Japan's QZSS)",
      "Navigation augmentation",
      "Regional broadcasting",
    ],
    typicalPayloads: [
      "Regional communication satellites",
      "Navigation augmentation satellites",
      "Regional weather monitoring",
    ],
    faqs: [
      {
        question: "What is the difference between GEO and GSO?",
        answer:
          "GEO is a special case of GSO with zero inclination, keeping the satellite directly above the equator. GSO satellites have inclined orbits, tracing a figure-eight path over the equator and providing better coverage of mid-latitude regions.",
      },
      {
        question: "How much does a GSO launch cost?",
        answer:
          "GSO launches cost slightly less than GEO because they do not require the final inclination correction burn. Expect $12,000–$25,000/kg depending on the vehicle.",
      },
      {
        question: "What delta-v is needed for GSO?",
        answer:
          "Approximately 13.4 km/s from the ground, slightly less than GEO since the plane-change maneuver can be reduced or eliminated.",
      },
    ],
  },
  SSO: {
    slug: "sso",
    altitudeRange: "600–800 km",
    period: "~96–100 min",
    description:
      "Sun-Synchronous Orbit is a near-polar orbit that maintains a constant angle between the orbital plane and the Sun. This means the satellite passes over any given point at the same local solar time, providing consistent lighting conditions ideal for Earth observation and remote sensing.",
    useCases: [
      "Earth observation and mapping",
      "Agricultural monitoring",
      "Environmental and climate research",
      "Disaster response imaging",
    ],
    typicalPayloads: [
      "Earth observation satellites (200–1,000 kg)",
      "Multispectral imaging payloads",
      "Synthetic aperture radar (SAR)",
      "Climate monitoring instruments",
    ],
    faqs: [
      {
        question: "Why is SSO preferred for Earth observation?",
        answer:
          "SSO ensures consistent solar illumination on every pass, so images taken weeks apart have comparable lighting. This is critical for change detection, agriculture monitoring, and scientific measurements.",
      },
      {
        question: "How much does an SSO launch cost?",
        answer:
          "SSO launches are slightly more expensive than equatorial LEO due to the polar inclination requirement. Expect $4,000–$25,000/kg depending on the launcher. PSLV at $7,000/kg is a popular choice.",
      },
      {
        question: "What delta-v is required for SSO?",
        answer:
          "Approximately 9.8 km/s from the ground, slightly more than equatorial LEO because of the higher inclination requirement.",
      },
    ],
  },
  PO: {
    slug: "polar",
    altitudeRange: "400–1,000 km",
    period: "~90–105 min",
    description:
      "Polar Orbit passes over both poles, providing complete global coverage as Earth rotates beneath. Every point on Earth is eventually observed, making polar orbits essential for global monitoring, reconnaissance, and weather forecasting.",
    useCases: [
      "Global weather forecasting",
      "Intelligence and reconnaissance",
      "Full-globe communications relay",
      "Scientific atmospheric sounding",
    ],
    typicalPayloads: [
      "Weather satellites (NOAA POES series)",
      "Reconnaissance platforms",
      "CubeSat constellations",
      "Atmospheric research instruments",
    ],
    faqs: [
      {
        question: "How is a polar orbit different from SSO?",
        answer:
          "A polar orbit has an inclination near 90°, while SSO is a specific type of polar orbit (typically 97–98°) that precesses to maintain sun-synchronous timing. Not all polar orbits are sun-synchronous.",
      },
      {
        question: "How much does a polar orbit launch cost?",
        answer:
          "Similar to SSO, expect $4,000–$25,000/kg. Launch sites at high latitudes (e.g., Vandenberg, Plesetsk) are preferred to avoid overflying populated areas during ascent.",
      },
      {
        question: "What delta-v is needed for polar orbit?",
        answer:
          "Approximately 9.7 km/s from the ground. Launching from equatorial sites costs more delta-v due to the plane change required.",
      },
    ],
  },
  GTO: {
    slug: "gto",
    altitudeRange: "200–35,786 km (elliptical)",
    period: "~10.5 hours",
    description:
      "Geostationary Transfer Orbit is an elliptical orbit used as an intermediate step to reach GEO. Satellites are launched into GTO and then use on-board propulsion to circularize at GEO altitude. This allows launch vehicles to deliver heavier payloads since they don't need to provide the full delta-v to GEO.",
    useCases: [
      "Transfer orbit for GEO satellites",
      "Dual-launch missions (GTO + LEO payloads)",
      "Electric propulsion orbit raising",
      "Lunar trajectory injection (from high apogee)",
    ],
    typicalPayloads: [
      "GEO communication satellites with apogee motors",
      "Electric propulsion platforms (all-electric satellites)",
      "Dual-manifest commercial payloads",
    ],
    faqs: [
      {
        question: "Why not launch directly to GEO?",
        answer:
          "GTO allows the launch vehicle to carry a heavier payload since the satellite provides the final circularization burn. This splits the delta-v budget between rocket and spacecraft, optimizing total system mass.",
      },
      {
        question: "How much does a GTO launch cost?",
        answer:
          "GTO launches cost $5,000–$15,000/kg. Falcon 9 to GTO costs approximately $5,500/kg, while Ariane 6 prices around $10,000/kg.",
      },
      {
        question: "What is the delta-v from GTO to GEO?",
        answer:
          "Approximately 1.5 km/s for the circularization and plane-change maneuver, depending on the GTO parameters and target GEO slot.",
      },
    ],
  },
  Moon: {
    slug: "moon",
    altitudeRange: "~384,400 km from Earth",
    period: "~27.3 days (orbital)",
    description:
      "Lunar missions target the Moon for scientific exploration, resource prospecting, and the establishment of a sustained human presence. With NASA's Artemis program and commercial lunar payload services (CLPS), the Moon is experiencing a renaissance of activity not seen since the Apollo era.",
    useCases: [
      "Scientific exploration and sample return",
      "Resource prospecting (water ice, helium-3)",
      "Technology demonstration for deep space",
      "Commercial payload delivery (CLPS program)",
      "Lunar base infrastructure",
    ],
    typicalPayloads: [
      "Lunar landers (100–500 kg payload to surface)",
      "Rovers and scientific instruments",
      "In-situ resource utilization experiments",
      "Communication relay satellites",
    ],
    faqs: [
      {
        question: "How much does it cost to deliver payload to the Moon?",
        answer:
          "Lunar surface delivery costs range from $950,000/kg (Firefly Blue Ghost) to $1,200,000/kg (Intuitive Machines Nova-C) based on completed CLPS missions. Astrobotic's larger Griffin lander targets ~$800,000/kg once operational. NASA's CLPS task orders have ranged from $70–$118M per mission.",
      },
      {
        question: "What launchers can reach the Moon?",
        answer:
          "Falcon Heavy, Starship, and SLS can deliver payloads to lunar orbit or trans-lunar injection. Commercial landers like Nova-C and Blue Ghost ride as payloads on these rockets. Firefly Blue Ghost successfully landed in February 2025, marking the first fully successful commercial lunar landing.",
      },
      {
        question: "What delta-v is needed to reach the Moon?",
        answer:
          "Approximately 14.1 km/s total from Earth's surface to lunar orbit, including trans-lunar injection and lunar orbit insertion burns.",
      },
    ],
  },
  Mars: {
    slug: "mars",
    altitudeRange: "~225 million km (average)",
    period: "~687 days (Martian year)",
    description:
      "Mars missions represent the frontier of interplanetary exploration. Transfer windows occur roughly every 26 months when Earth and Mars are optimally aligned. Mars missions require extensive planning, precise navigation, and significant delta-v budgets.",
    useCases: [
      "Scientific exploration and astrobiology",
      "Mars sample return missions",
      "Communication relay orbiters",
      "Future human settlement preparation",
      "In-situ resource utilization testing",
    ],
    typicalPayloads: [
      "Mars rovers (900–1,000 kg for Perseverance-class)",
      "Orbital science platforms",
      "Small Mars probes and CubeSats",
      "Entry, descent, and landing demonstrators",
    ],
    faqs: [
      {
        question: "How much does a Mars mission cost?",
        answer:
          "Mars missions are complex undertakings costing $200M–$2.7B+ for the full mission. Launch costs alone are $50–$150M. SpaceX's Starship aims to dramatically reduce per-kg costs to Mars.",
      },
      {
        question: "When is the next Mars transfer window?",
        answer:
          "Mars transfer windows occur approximately every 26 months. The next optimal window opens in November 2026, with a transit time of roughly 7–9 months via Hohmann transfer. After that, the following window opens in January 2029.",
      },
      {
        question: "What delta-v is needed to reach Mars?",
        answer:
          "Approximately 18.4 km/s total from Earth's surface to Mars orbit, including Earth escape, interplanetary transfer, and Mars orbit insertion.",
      },
    ],
  },
  Ceres: {
    slug: "ceres",
    altitudeRange: "~413 million km (average)",
    period: "~4.6 years",
    description:
      "Ceres is the largest object in the asteroid belt and a dwarf planet. It has been explored by NASA's Dawn mission, which revealed bright spots of sodium carbonate and evidence of subsurface briny water. Ceres is of interest for asteroid mining concepts and deep-space exploration.",
    useCases: [
      "Asteroid belt exploration",
      "Resource prospecting for water and minerals",
      "Deep-space propulsion testing",
      "Planetary science research",
    ],
    typicalPayloads: [
      "Ion-propulsion spacecraft",
      "Scientific orbiters",
      "Small deep-space probes",
    ],
    faqs: [
      {
        question: "How long does it take to reach Ceres?",
        answer:
          "NASA's Dawn spacecraft took about 4 years to reach Ceres using ion propulsion with gravity assists. A direct Hohmann transfer would take roughly 2–3 years.",
      },
      {
        question: "What delta-v is required to reach Ceres?",
        answer:
          "Approximately 19.7 km/s from Earth's surface, making it one of the more demanding destinations in the inner solar system.",
      },
      {
        question: "Why is Ceres interesting for future missions?",
        answer:
          "Ceres has subsurface water ice and organic compounds, making it a potential waypoint for deep-space exploration and a candidate for in-situ resource utilization.",
      },
    ],
  },
  Titan: {
    slug: "titan",
    altitudeRange: "~1.27 billion km (Saturn system)",
    period: "~16 days (around Saturn)",
    description:
      "Titan, Saturn's largest moon, is the only moon in the solar system with a dense atmosphere and stable surface liquids (methane and ethane lakes). NASA's Dragonfly mission will explore Titan's surface with a rotorcraft lander, studying prebiotic chemistry and habitability.",
    useCases: [
      "Prebiotic chemistry research",
      "Atmospheric science",
      "Astrobiology and habitability studies",
      "Outer solar system exploration",
    ],
    typicalPayloads: [
      "Atmospheric entry probes",
      "Rotorcraft landers (Dragonfly-class)",
      "Orbital science platforms",
    ],
    faqs: [
      {
        question: "How long does it take to reach Titan?",
        answer:
          "Cassini-Huygens took about 7 years to reach Saturn using gravity assists. The Dragonfly mission plans a similar timeline with launch in 2028 and arrival in 2034.",
      },
      {
        question: "What delta-v is needed for Titan?",
        answer:
          "Approximately 22.5 km/s from Earth's surface, requiring significant propulsion and typically gravity assists from Venus and/or Jupiter.",
      },
      {
        question: "Why explore Titan?",
        answer:
          "Titan's thick nitrogen atmosphere, methane weather cycle, and organic chemistry make it one of the most Earth-like worlds in the solar system and a prime target for astrobiology.",
      },
    ],
  },
  Europa: {
    slug: "europa",
    altitudeRange: "~628 million km (Jupiter system)",
    period: "~3.5 days (around Jupiter)",
    description:
      "Europa, one of Jupiter's Galilean moons, harbors a subsurface ocean beneath its icy crust, making it one of the most promising places to search for extraterrestrial life. NASA's Europa Clipper mission will conduct detailed reconnaissance of Europa's ice shell and ocean.",
    useCases: [
      "Ocean world exploration",
      "Search for extraterrestrial life",
      "Ice shell and geology studies",
      "Radiation environment research",
    ],
    typicalPayloads: [
      "Flyby/orbiter spacecraft (Europa Clipper-class)",
      "Ice-penetrating radar instruments",
      "Future lander concepts",
    ],
    faqs: [
      {
        question: "How much does a Europa mission cost?",
        answer:
          "NASA's Europa Clipper mission costs approximately $5 billion. The extreme radiation environment at Jupiter and long travel time drive costs significantly higher than Mars missions.",
      },
      {
        question: "What delta-v is needed for Europa?",
        answer:
          "Approximately 16.0 km/s from Earth's surface to Jupiter orbit insertion, plus additional maneuvers for Europa flyby trajectories.",
      },
      {
        question: "Is there life on Europa?",
        answer:
          "Europa's subsurface ocean, in contact with a rocky seafloor and heated by tidal forces, provides conditions potentially suitable for microbial life. The Europa Clipper mission aims to assess habitability.",
      },
    ],
  },
  Enceladus: {
    slug: "enceladus",
    altitudeRange: "~1.27 billion km (Saturn system)",
    period: "~1.4 days (around Saturn)",
    description:
      "Enceladus, a small icy moon of Saturn, is one of the most exciting targets in astrobiology. Its south polar region ejects plumes of water vapor and ice particles from a subsurface ocean, which Cassini sampled directly. These plumes contain organic molecules and hydrogen, suggesting hydrothermal activity.",
    useCases: [
      "Astrobiology and life detection",
      "Plume sample analysis",
      "Ocean world science",
      "Outer solar system technology demonstration",
    ],
    typicalPayloads: [
      "Plume flythrough spacecraft",
      "Mass spectrometer instruments",
      "Future orbiter/lander concepts",
    ],
    faqs: [
      {
        question: "Why is Enceladus important for finding life?",
        answer:
          "Enceladus actively jets material from its subsurface ocean into space, making it possible to sample ocean water without landing or drilling. Cassini detected organic molecules, hydrogen, and silica nanoparticles consistent with hydrothermal vents.",
      },
      {
        question: "What delta-v is needed to reach Enceladus?",
        answer:
          "Approximately 23.0 km/s from Earth's surface, making it one of the most delta-v intensive destinations. Gravity assists are essential for practical missions.",
      },
      {
        question: "Are there planned missions to Enceladus?",
        answer:
          "The Enceladus Orbilander was ranked a high priority in NASA's 2023–2032 Planetary Science Decadal Survey, which endorsed it as a flagship-class mission concept. No mission has been formally approved or funded as of 2026, but it is the leading candidate for a future dedicated outer-solar-system flagship.",
      },
    ],
  },
  Molniya: {
    slug: "molniya",
    altitudeRange: "500–40,000 km (highly elliptical)",
    period: "~11.97 hours",
    description:
      "Molniya orbits are highly elliptical orbits with an inclination of ~63.4° and a 12-hour period. Developed by the Soviet Union in the 1960s for communications over high-latitude regions, a satellite in Molniya orbit spends most of its time near apogee at high northern latitudes, providing extended dwell time over Russia and the Arctic. Today they are used for intelligence gathering, early-warning systems, and niche communications services.",
    useCases: [
      "High-latitude communications coverage",
      "Arctic and polar region access",
      "Missile early-warning systems",
      "Intelligence, surveillance, and reconnaissance (ISR)",
    ],
    typicalPayloads: [
      "Communications relay satellites",
      "Early-warning infrared sensors",
      "ISR spacecraft",
      "Weather observation instruments",
    ],
    faqs: [
      {
        question: "What makes Molniya orbit unique?",
        answer:
          "Molniya orbit's high eccentricity (apogee ~40,000 km, perigee ~500 km) combined with its critical inclination of 63.4° means atmospheric drag causes no apsidal precession — the apogee stays fixed over high-latitude regions. A satellite spends about 8 of every 12 hours near apogee, providing continuous coverage where geostationary satellites have poor geometry.",
      },
      {
        question: "How much does it cost to launch to Molniya orbit?",
        answer:
          "Molniya orbit launches cost roughly $8,000–$14,000/kg depending on the rocket and mission profile. The orbit requires similar delta-v to high GEO, but its eccentric geometry reduces station-keeping propellant needs compared to true GEO missions.",
      },
      {
        question: "Which launchers can reach Molniya orbit?",
        answer:
          "Medium to heavy launch vehicles can reach Molniya orbit, including the Soyuz-2 (historically the most common), Proton-M, Ariane 6, and Falcon 9. The high inclination (63.4°) means equatorial launch sites like Kourou are less efficient; higher-latitude launch sites like Baikonur or Plesetsk offer a natural advantage.",
      },
    ],
  },
  Tundra: {
    slug: "tundra",
    altitudeRange: "24,000–46,300 km (highly elliptical)",
    period: "~23.93 hours (geosynchronous)",
    description:
      "Tundra orbits are highly elliptical geosynchronous orbits with a period of exactly one sidereal day and an inclination of ~63.4°. Unlike Molniya's 12-hour period, Tundra satellites complete one orbit per day, spending most of their time at high northern latitudes near apogee (~46,300 km). They offer superior dwell time over target regions compared to Molniya orbits and are used by modern missile warning constellations.",
    useCases: [
      "Missile launch detection and early warning",
      "High-latitude broadband coverage",
      "Arctic surveillance",
      "Geosynchronous coverage above 60° latitude",
    ],
    typicalPayloads: [
      "Infrared missile-warning sensors",
      "Communications payloads for Arctic coverage",
      "Intelligence satellites",
    ],
    faqs: [
      {
        question: "How is Tundra orbit different from Molniya orbit?",
        answer:
          "The key difference is orbital period: Tundra is geosynchronous (24-hour period) while Molniya has a 12-hour period. Tundra satellites spend more continuous time over the target hemisphere per pass. A three-satellite Tundra constellation can provide continuous Arctic coverage, whereas a Molniya system typically requires more satellites for equivalent coverage.",
      },
      {
        question: "Which systems use Tundra orbit?",
        answer:
          "The U.S. Space Force's Space-Based Infrared System (SBIRS) HEO sensors fly in Tundra-like highly elliptical orbits. Russia's Tundra early-warning constellation (EKS system) also uses this orbit type. The European Space Agency has studied Tundra constellations for Arctic broadband communications.",
      },
      {
        question: "What is the launch cost to Tundra orbit?",
        answer:
          "Tundra orbit launches are specialized and expensive, typically $10,000–$18,000/kg, reflecting the high delta-v requirements (~11.8 km/s) and the need for dedicated launch slots from high-inclination launch sites.",
      },
    ],
  },
  L1L2: {
    slug: "lagrange-l1-l2",
    altitudeRange: "~1.5 million km from Earth",
    period: "~6 months (halo orbit)",
    description:
      "The Sun-Earth Lagrange points L1 and L2 are gravitationally stable positions approximately 1.5 million km from Earth. L1 (sunward) is used for continuous solar wind monitoring and space weather early-warning systems. L2 (anti-sunward) provides a thermally stable, radio-quiet environment ideal for space observatories — home to the James Webb Space Telescope, Gaia, Planck, and the upcoming Roman Space Telescope. Spacecraft at these points orbit in 'halo' or 'Lissajous' orbits maintained by periodic station-keeping burns.",
    useCases: [
      "Space telescope operations (L2)",
      "Solar wind and space weather monitoring (L1)",
      "Gravitational wave observatory concepts",
      "Deep space relay communications",
    ],
    typicalPayloads: [
      "Space telescopes (JWST, Roman, LISA)",
      "Solar monitoring spacecraft (SOHO, DSCOVR)",
      "Gravitational wave detectors",
      "Deep space science platforms",
    ],
    faqs: [
      {
        question: "Why is L2 preferred for space telescopes?",
        answer:
          "Earth-Sun L2 offers a stable thermal environment, unobstructed sky access, and natural shielding from solar radiation using a single sunshield. Spacecraft at L2 always point away from the Sun with Earth and Sun in the same direction, allowing a stable thermal profile and eliminating the eclipse cycles that affect low-Earth-orbit observatories.",
      },
      {
        question: "How much does it cost to reach L1 or L2?",
        answer:
          "L1/L2 launches require roughly 13.0 km/s of delta-v and typically cost $15,000–$25,000/kg depending on payload mass. The James Webb Space Telescope launched on Ariane 5 at a mission cost of ~$10 billion; ESA's Euclid launched on Falcon 9 in 2023 at a lower cost. NASA's Nancy Grace Roman Space Telescope, targeting L2 in 2027, will use Falcon Heavy.",
      },
      {
        question: "Do spacecraft stay at L1/L2 indefinitely?",
        answer:
          "No — L1 and L2 are unstable equilibrium points. Spacecraft orbit around them in halo or Lissajous trajectories, requiring regular station-keeping burns (~2–10 m/s per year). Spacecraft lifetime is typically limited by propellant budget; JWST has enough propellant for at least 20 years of operations.",
      },
    ],
  },
};

function getOrbitSlugMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [id, meta] of Object.entries(orbitMeta)) {
    map[meta.slug] = id;
  }
  return map;
}

const slugToId = getOrbitSlugMap();

function getCompatibleRockets(orbitId: string, launchers: LauncherRecord[]) {
  const orbit = orbits.find((o) => o.id === orbitId);
  if (!orbit) return [];

  const isDeepSpace = ["Moon", "Mars", "Ceres", "Titan", "Europa", "Enceladus"].includes(orbitId);
  const isLunar = orbitId === "Moon";

  return launchers
    .filter((r) => {
      if (isLunar) return r.lunar_capable === true;
      if (isDeepSpace) return r.size_class === "heavy" || r.size_class === "super-heavy";
      return true;
    })
    .sort((a, b) => (a.rideshare_price_per_kg ?? Infinity) - (b.rideshare_price_per_kg ?? Infinity));
}

function getOrbitGroup(orbitId: string): string {
  for (const group of orbitGroups) {
    if (group.orbits.some((o) => o.id === orbitId)) {
      return group.name;
    }
  }
  return "Unknown";
}

function getOrbitIcon(orbitId: string) {
  if (["Moon", "Mars", "Ceres", "Titan", "Europa", "Enceladus"].includes(orbitId)) {
    return <Moon className="w-6 h-6 text-purple-400" />;
  }
  if (["GEO", "GSO", "GTO", "HEO"].includes(orbitId)) {
    return <Satellite className="w-6 h-6 text-blue-400" />;
  }
  return <Globe className="w-6 h-6 text-teal-400" />;
}

export default function OrbitDetail() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug || "";
  const orbitId = slugToId[slug];
  const orbit = orbits.find((o) => o.id === orbitId);
  const meta = orbitId ? orbitMeta[orbitId] : undefined;
  const { launchers } = useLaunchers();

  const compatibleRockets = useMemo(
    () => (orbitId ? getCompatibleRockets(orbitId, launchers) : []),
    [orbitId, launchers]
  );

  const otherOrbits = useMemo(() => {
    const group = orbitId ? getOrbitGroup(orbitId) : "";
    return orbits
      .filter((o) => o.id !== orbitId && orbitMeta[o.id])
      .filter((o) => {
        const oGroup = getOrbitGroup(o.id);
        return oGroup === group;
      })
      .slice(0, 5);
  }, [orbitId]);

  const faqJsonLd = useMemo(() => {
    if (!meta || !orbit) return undefined;
    const orbitUrl = `https://www.orbit2orbitexpress.com/orbits/${slug}`;
    return [
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://www.orbit2orbitexpress.com/" },
          { "@type": "ListItem", position: 2, name: "Orbits", item: "https://www.orbit2orbitexpress.com/orbits" },
          { "@type": "ListItem", position: 3, name: orbit.name, item: orbitUrl },
        ],
      },
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: `${orbit.name} — Launch Cost, Delta-V & Mission Planning Guide`,
        description: meta.description.slice(0, 200),
        author: { "@type": "Organization", name: "Orbit to Orbit Express", url: "https://www.orbit2orbitexpress.com" },
        publisher: { "@type": "Organization", name: "Orbit to Orbit Express", url: "https://www.orbit2orbitexpress.com" },
        url: orbitUrl,
        about: { "@type": "Thing", name: orbit.name, description: `Orbital destination: ${meta.altitudeRange} altitude, ${meta.period} orbital period` },
        mentions: meta.useCases.map((uc) => ({ "@type": "Thing", name: uc })),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: meta.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: { "@type": "Answer", text: faq.answer },
        })),
      },
    ];
  }, [meta, orbit, slug]);

  useSEO({
    title: orbit
      ? `How Much Does It Cost to Launch to ${orbit.name}? | O2O Express`
      : "Orbit Details",
    description: meta
      ? `${meta.description.slice(0, 155)}...`
      : "Detailed information about orbital destinations including costs, compatible rockets, and mission planning.",
    canonical: `/orbits/${slug}`,
    keywords: orbit
      ? `${orbit.name} launch cost, ${orbit.name} orbit, delta-v ${orbit.name}, rockets to ${orbit.name}, space launch ${orbit.id}, ${orbit.name} satellite deployment, ${orbit.name} mission planning, ${orbit.name} payload cost per kg, how to reach ${orbit.name}, ${orbit.name} applications, ${orbit.name} altitude, ${orbit.name} orbital period, commercial missions to ${orbit.name}`
      : "orbit launch cost, space destinations",
    jsonLd: faqJsonLd,
  });

  if (!orbit || !meta) {
    return (
      <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold mb-4">
            Orbit Not Found
          </h1>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Calculator
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-800 text-white">
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-32 pb-8">
        <div className="flex items-center mb-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors min-h-[44px]"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Calculator</span>
          </Link>
        </div>

        <div className="flex items-start gap-4 mb-8">
          <div className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
            {getOrbitIcon(orbitId)}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-display font-bold text-white">
                {orbit.name}
              </h1>
              <Badge className="bg-slate-700 text-gray-200 font-mono">
                {orbit.id}
              </Badge>
            </div>
            <p className="text-gray-400 mt-1">
              {getOrbitGroup(orbitId)} · Δv {orbit.deltaV} km/s
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Navigation2 className="w-5 h-5 text-teal-400" />
                  About {orbit.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed mb-6">
                  {meta.description}
                </p>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Altitude
                    </p>
                    <p className="text-white font-semibold">
                      {meta.altitudeRange}
                    </p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Orbital Period
                    </p>
                    <p className="text-white font-semibold">{meta.period}</p>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      Delta-V Required
                    </p>
                    <p className="text-white font-semibold">
                      {orbit.deltaV} km/s
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-teal-400" />
                  Use Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {meta.useCases.map((uc, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-gray-300"
                    >
                      <span className="text-teal-400 mt-1">→</span>
                      <span>{uc}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Satellite className="w-5 h-5 text-teal-400" />
                  Typical Payloads
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {meta.typicalPayloads.map((p, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="bg-slate-700 text-gray-200 px-3 py-1"
                    >
                      {p}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <RocketIcon className="w-5 h-5 text-teal-400" />
                  Compatible Launch Vehicles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {compatibleRockets.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-gray-400">
                            Vehicle
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Provider
                          </TableHead>
                          <TableHead className="text-gray-400 text-right">
                            Cost/kg
                          </TableHead>
                          <TableHead className="text-gray-400 text-right">
                            Max Payload
                          </TableHead>
                          <TableHead className="text-gray-400">
                            Status
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {compatibleRockets.map((r) => {
                          const costPerKg = r.rideshare_price_per_kg;
                          return (
                            <TableRow
                              key={r.id}
                              className="border-slate-700 hover:bg-slate-700/30"
                            >
                              <TableCell className="text-white font-medium">
                                {r.vehicle_name}
                              </TableCell>
                              <TableCell className="text-gray-300">
                                {r.provider}
                              </TableCell>
                              <TableCell className="text-right text-teal-400 font-mono">
                                {costPerKg ? `$${costPerKg.toLocaleString()}` : "Pricing not publicly available"}
                              </TableCell>
                              <TableCell className="text-right text-gray-300 font-mono">
                                {r.payload_leo_kg?.toLocaleString() ?? "—"} kg
                              </TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    r.vehicle_status === "Operational"
                                      ? "bg-green-600"
                                      : r.vehicle_status === "In development"
                                        ? "bg-yellow-600"
                                        : "bg-gray-800"
                                  }
                                >
                                  {r.vehicle_status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="text-gray-400">
                    No compatible launchers found for this destination.
                  </p>
                )}
                <div className="mt-4 pt-4 border-t border-slate-700">
                  <Link href="/">
                    <Button
                      variant="ghost"
                      className="text-teal-400 hover:text-teal-500 p-0"
                    >
                      Calculate launch cost for your payload →
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Frequently Asked Questions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {meta.faqs.map((faq, i) => (
                    <div key={i}>
                      <h3 className="text-white font-semibold mb-2">
                        {faq.question}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </p>
                      {i < meta.faqs.length - 1 && (
                        <Separator className="bg-slate-700 mt-6" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-lg">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">Delta-V Required</p>
                  <p className="text-white font-semibold text-lg">
                    {orbit.deltaV} km/s
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Altitude</p>
                  <p className="text-white font-medium">
                    {meta.altitudeRange}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Orbital Period</p>
                  <p className="text-white font-medium">{meta.period}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Category</p>
                  <p className="text-white font-medium">
                    {getOrbitGroup(orbitId)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Compatible Launchers</p>
                  <p className="text-white font-medium">
                    {compatibleRockets.length} vehicles
                  </p>
                </div>
                {compatibleRockets.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-400">Lowest Cost/kg</p>
                    <p className="text-teal-400 font-semibold text-lg font-mono">
                      {formatLauncherPrice(compatibleRockets[0])}
                    </p>
                  </div>
                )}
                <Separator className="bg-slate-700" />
                <Link href="/">
                  <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                    <RocketIcon className="w-4 h-4 mr-2" />
                    Calculate Your Mission
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {otherOrbits.length > 0 && (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    Related Orbits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {otherOrbits.map((o) => (
                      <Link
                        key={o.id}
                        href={`/orbits/${orbitMeta[o.id].slug}`}
                        className="block p-2 rounded hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-white font-medium text-sm">
                              {o.name}
                            </p>
                            <p className="text-xs text-gray-400">
                              Δv {o.deltaV} km/s
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-teal-900/50 to-slate-800/50 border-teal-700/50">
              <CardContent className="pt-6">
                <h3 className="text-white font-semibold mb-2">
                  Need Help Planning?
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  Get a custom mission analysis for your payload to{" "}
                  {orbit.name}. Our calculator factors in mass, volume, and
                  regional preferences.
                </p>
                <Link href="/">
                  <Button
                    variant="outline"
                    className="w-full border-teal-400 text-teal-400 hover:bg-teal-400/10"
                  >
                    Try the Calculator
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
