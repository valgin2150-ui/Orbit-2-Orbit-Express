import { useState, useMemo } from "react";
import { Link } from "wouter";
import { Search, BookOpen, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Navigation } from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useSEO } from "@/hooks/useSEO";

interface GlossaryTerm {
  term: string;
  definition: string;
  example: string;
  relatedTerms: string[];
  category: string;
}

const GLOSSARY_TERMS: GlossaryTerm[] = [
  {
    term: "Delta-V (ΔV)",
    definition: "The change in velocity required to perform an orbital maneuver, measured in meters per second (m/s). It is the fundamental measure of the 'effort' needed to move between orbits or escape a gravitational field.",
    example: "A Hohmann transfer from LEO to GEO requires approximately 3,900 m/s of delta-v. SpaceX's Falcon 9 upper stage provides sufficient delta-v for most LEO to GTO transfers.",
    relatedTerms: ["Specific Impulse", "Hohmann Transfer", "Orbital Transfer"],
    category: "Orbital Mechanics",
  },
  {
    term: "LEO (Low Earth Orbit)",
    definition: "An orbit around Earth with an altitude between 160 km and 2,000 km. LEO is the most commonly used orbit for Earth observation satellites, the International Space Station, and large satellite constellations like Starlink and Kuiper.",
    example: "SpaceX's Starlink constellation operates at approximately 550 km altitude in LEO. The ISS orbits at roughly 408 km. OneWeb satellites orbit at 1,200 km.",
    relatedTerms: ["GEO", "MEO", "SSO", "Orbital Velocity"],
    category: "Orbits",
  },
  {
    term: "GEO (Geostationary Earth Orbit)",
    definition: "A circular orbit at approximately 35,786 km altitude above Earth's equator where a satellite's orbital period matches Earth's rotation, causing it to appear stationary relative to a point on the ground.",
    example: "Most telecommunications satellites, including those operated by SES, Intelsat, and Arabsat (serving the Middle East and North Africa), occupy GEO slots. Saudi Arabia's KACST and the UAE's Al Yah Satellite Communications operate GEO satellites.",
    relatedTerms: ["GTO", "LEO", "Inclination", "Apogee"],
    category: "Orbits",
  },
  {
    term: "MEO (Medium Earth Orbit)",
    definition: "An orbit with altitude between LEO and GEO, typically 2,000 km to 35,786 km. Used primarily for navigation satellite constellations and some communications systems.",
    example: "GPS satellites orbit at approximately 20,200 km in MEO. The European Galileo navigation system and China's BeiDou constellation also use MEO orbits.",
    relatedTerms: ["LEO", "GEO", "Inclination"],
    category: "Orbits",
  },
  {
    term: "HEO (Highly Elliptical Orbit)",
    definition: "An orbit with a high eccentricity, typically featuring a very low perigee and a very high apogee. HEO satellites spend most of their orbital period near apogee, providing extended coverage over specific regions.",
    example: "Russia's Molniya orbits provide communications coverage over high-latitude regions. The Sirius XM satellite radio system uses HEO to maintain coverage over North America.",
    relatedTerms: ["Apogee", "Perigee", "Eccentricity", "GEO"],
    category: "Orbits",
  },
  {
    term: "GTO (Geostationary Transfer Orbit)",
    definition: "An elliptical orbit used as an intermediate step to reach GEO. A satellite is first placed in GTO, then fires its own engines at apogee to circularize into GEO.",
    example: "Ariane 6, launched from Kourou in French Guiana, is designed to deliver heavy payloads to GTO. India's GSLV rockets from Sriharikota also frequently target GTO.",
    relatedTerms: ["GEO", "Apogee", "Hohmann Transfer", "Delta-V"],
    category: "Orbits",
  },
  {
    term: "SSO (Sun-Synchronous Orbit)",
    definition: "A polar orbit where the satellite passes over any given point on Earth's surface at the same local solar time. This provides consistent lighting conditions for Earth observation.",
    example: "Most Earth observation satellites use SSO, including ESA's Sentinel satellites and Planet Labs' Dove constellation. Rocket Lab's Electron frequently launches SSO missions from Mahia Peninsula, New Zealand.",
    relatedTerms: ["LEO", "Inclination", "Polar Orbit"],
    category: "Orbits",
  },
  {
    term: "Apogee",
    definition: "The point in an elliptical orbit around Earth where the orbiting object is farthest from Earth's center. In a GTO, the apogee is at GEO altitude (~35,786 km).",
    example: "When a satellite in GTO reaches apogee, it fires its apogee kick motor to circularize the orbit into GEO. Arianespace reports apogee altitude as a key specification for each launch.",
    relatedTerms: ["Perigee", "GTO", "Eccentricity", "Apoapsis"],
    category: "Orbital Mechanics",
  },
  {
    term: "Perigee",
    definition: "The point in an elliptical orbit around Earth where the orbiting object is closest to Earth's center. A lower perigee increases atmospheric drag and can lead to orbital decay.",
    example: "The ISS occasionally needs to raise its perigee through reboost maneuvers to counteract atmospheric drag. Tiangong space station (China) performs similar station-keeping burns.",
    relatedTerms: ["Apogee", "Orbital Decay", "Periapsis"],
    category: "Orbital Mechanics",
  },
  {
    term: "Orbital Mechanics",
    definition: "The branch of physics and engineering that deals with the motion of objects in space under the influence of gravitational forces. Also known as astrodynamics or celestial mechanics.",
    example: "NASA's Jet Propulsion Laboratory (JPL) uses orbital mechanics to plan interplanetary trajectories. ISRO (India) used precise orbital mechanics to achieve Mars orbit on its first attempt with the Mangalyaan mission.",
    relatedTerms: ["Delta-V", "Hohmann Transfer", "Gravity Assist", "Inclination"],
    category: "Orbital Mechanics",
  },
  {
    term: "Specific Impulse (Isp)",
    definition: "A measure of how efficiently a rocket engine uses propellant, expressed in seconds. Higher specific impulse means more thrust per unit of propellant consumed.",
    example: "SpaceX's Merlin engine has an Isp of ~311s at sea level. Ion thrusters like those on ESA's SMART-1 can achieve Isp values exceeding 3,000s but with very low thrust.",
    relatedTerms: ["Delta-V", "Propellant", "Electric Propulsion", "Ion Thruster"],
    category: "Propulsion",
  },
  {
    term: "Payload Fairing",
    definition: "The protective nose cone structure at the top of a launch vehicle that shields the payload from aerodynamic forces and heating during ascent through the atmosphere. It is jettisoned once the rocket reaches space.",
    example: "SpaceX recovers and reuses Falcon 9 payload fairings, each half valued at approximately $3 million. Ariane 6 features a 5.4-meter diameter fairing for large GEO satellites.",
    relatedTerms: ["Payload Adapter", "Rideshare", "Dedicated Launch"],
    category: "Launch Vehicle",
  },
  {
    term: "Rideshare Launch",
    definition: "A launch where multiple payloads from different customers share a single rocket, significantly reducing cost per kilogram. The primary alternative to a dedicated launch for smaller satellites.",
    example: "SpaceX's Transporter missions are the world's largest rideshare program, carrying 50+ smallsats per flight to SSO. ISRO's PSLV has also conducted many rideshare missions from Sriharikota, India.",
    relatedTerms: ["Dedicated Launch", "CubeSat", "SmallSat", "Payload Adapter"],
    category: "Launch Services",
  },
  {
    term: "Dedicated Launch",
    definition: "A launch where a single customer's payload is the sole cargo on the rocket, providing full control over orbit, schedule, and mission parameters.",
    example: "Rocket Lab offers dedicated Electron launches for smallsat operators who need specific orbits or timing. Firefly Aerospace's Alpha rocket also targets dedicated small satellite launches.",
    relatedTerms: ["Rideshare Launch", "Payload Fairing", "Launch Window"],
    category: "Launch Services",
  },
  {
    term: "CubeSat",
    definition: "A standardized small satellite format based on 10×10×10 cm units (1U). CubeSats range from 1U to 12U+ and have democratized access to space for universities, startups, and developing nations.",
    example: "Kenya's 1KUNS-PF was East Africa's first satellite, a 1U CubeSat. The UAE's DubaiSat program began the country's journey to building larger satellites. Argentina's CONAE operates CubeSat-class missions for Earth observation.",
    relatedTerms: ["SmallSat", "Rideshare Launch", "Payload Adapter"],
    category: "Spacecraft",
  },
  {
    term: "SmallSat",
    definition: "A satellite with a mass typically under 500 kg. The smallsat revolution has made space accessible to more countries and companies, with dramatically lower costs than traditional large satellites.",
    example: "Planet Labs operates the world's largest constellation of SmallSats (over 200 Dove satellites). New Zealand-based company LeoLabs tracks SmallSats in LEO using ground-based radar.",
    relatedTerms: ["CubeSat", "Rideshare Launch", "LEO"],
    category: "Spacecraft",
  },
  {
    term: "Orbital Transfer",
    definition: "Any maneuver that changes a spacecraft's orbit, typically involving one or more engine burns. Transfers can be between different altitudes, inclinations, or even between planets.",
    example: "SpaceX Starship is designed to perform orbital transfers to deliver Starlink V2 satellites. Lunar missions from ISRO and KARI (South Korea) require multiple orbital transfer maneuvers.",
    relatedTerms: ["Hohmann Transfer", "Delta-V", "GTO"],
    category: "Orbital Mechanics",
  },
  {
    term: "Hohmann Transfer",
    definition: "The most fuel-efficient two-burn orbital maneuver to transfer between two circular, coplanar orbits. Named after German engineer Walter Hohmann who proposed it in 1925.",
    example: "Most GTO-to-GEO transfers use a Hohmann-like approach. Mars transfer orbits from Earth also approximate a Hohmann transfer, taking about 9 months.",
    relatedTerms: ["Delta-V", "Orbital Transfer", "GTO", "Gravity Assist"],
    category: "Orbital Mechanics",
  },
  {
    term: "Gravity Assist",
    definition: "A spaceflight technique where a spacecraft uses the gravitational field and orbital motion of a planet or moon to alter its trajectory and speed without using propellant.",
    example: "NASA's Voyager probes used gravity assists from Jupiter and Saturn. ESA/JAXA's BepiColombo mission uses gravity assists from Earth, Venus, and Mercury to reach Mercury orbit.",
    relatedTerms: ["Delta-V", "Hohmann Transfer", "Escape Velocity"],
    category: "Orbital Mechanics",
  },
  {
    term: "Inclination",
    definition: "The angle between an orbit's plane and the equatorial plane of the body being orbited, measured in degrees. An inclination of 0° is equatorial; 90° is polar.",
    example: "The ISS has an inclination of 51.6° to allow access from both Cape Canaveral (USA) and Baikonur (Kazakhstan). SSO typically requires inclinations of 96-99°.",
    relatedTerms: ["SSO", "Polar Orbit", "LEO", "Eccentricity"],
    category: "Orbital Mechanics",
  },
  {
    term: "Eccentricity",
    definition: "A parameter that describes how much an orbit deviates from a perfect circle. An eccentricity of 0 is circular; between 0 and 1 is elliptical; exactly 1 is parabolic (escape trajectory).",
    example: "GEO satellites have near-zero eccentricity (circular orbits). Molniya orbits used by Russian communications satellites have high eccentricity (~0.74).",
    relatedTerms: ["HEO", "Apogee", "Perigee", "Orbital Mechanics"],
    category: "Orbital Mechanics",
  },
  {
    term: "TLE (Two-Line Element Set)",
    definition: "A standardized data format for describing the orbital elements of an Earth-orbiting object. TLEs are maintained by the U.S. Space Surveillance Network and used worldwide for satellite tracking.",
    example: "Amateur radio operators worldwide use TLEs to track the ISS. Space agencies including JAXA (Japan), ESA, and ISRO use TLEs for conjunction assessment and collision avoidance.",
    relatedTerms: ["Orbital Mechanics", "Space Debris", "Inclination"],
    category: "Space Operations",
  },
  {
    term: "Space Debris",
    definition: "Non-functional human-made objects in Earth orbit, including defunct satellites, spent rocket stages, and fragments from collisions or explosions. A growing threat to active space operations.",
    example: "ESA's ClearSpace-1 mission aims to remove debris from orbit. Japan's Astroscale is developing active debris removal technology. The Kessler syndrome warns of cascading collisions.",
    relatedTerms: ["Deorbit", "LEO", "TLE", "Reentry"],
    category: "Space Operations",
  },
  {
    term: "Deorbit",
    definition: "The deliberate process of lowering a spacecraft's orbit to cause it to reenter Earth's atmosphere, either to dispose of it safely or to return cargo/crew to Earth.",
    example: "SpaceX Dragon capsules perform a deorbit burn to return ISS cargo and crew. Defunct satellites are increasingly required to deorbit within 5 years of end-of-life, per new FCC regulations.",
    relatedTerms: ["Reentry", "Space Debris", "Orbital Decay"],
    category: "Space Operations",
  },
  {
    term: "Reentry",
    definition: "The process of a spacecraft returning into Earth's atmosphere from orbital or higher speeds. Reentry generates extreme heat due to atmospheric compression and friction.",
    example: "SpaceX's Starship uses a belly-flop reentry technique. China's Shenzhou capsules and India's Gaganyaan (under development) both use traditional capsule reentry with heat shields.",
    relatedTerms: ["Deorbit", "Payload Fairing", "Ablation"],
    category: "Space Operations",
  },
  {
    term: "Propellant",
    definition: "The chemical substance or working fluid expelled by a rocket engine to generate thrust. Propellants can be solid, liquid, or gaseous, and may be a single substance or a combination of fuel and oxidizer.",
    example: "SpaceX uses RP-1 (refined kerosene) and liquid oxygen in Falcon 9. Starship uses liquid methane and liquid oxygen. ISRO's GSLV uses a combination of solid, liquid, and cryogenic stages.",
    relatedTerms: ["Solid Fuel", "Liquid Fuel", "Bipropellant", "Monopropellant"],
    category: "Propulsion",
  },
  {
    term: "Solid Fuel (Solid Rocket Motor)",
    definition: "A type of rocket propellant where fuel and oxidizer are pre-mixed into a solid grain. Once ignited, solid rockets cannot be throttled or shut down. They provide high thrust but lower specific impulse than liquid engines.",
    example: "The Space Shuttle's Solid Rocket Boosters (SRBs) were the largest solid rockets ever flown. Northrop Grumman's OmegA and India's PSLV use solid fuel stages.",
    relatedTerms: ["Liquid Fuel", "Propellant", "Specific Impulse"],
    category: "Propulsion",
  },
  {
    term: "Liquid Fuel (Liquid Rocket Engine)",
    definition: "A rocket propulsion system using liquid propellants (fuel and oxidizer) stored in separate tanks and fed into a combustion chamber. Liquid engines can be throttled, shut down, and restarted.",
    example: "Blue Origin's BE-4 engine burns liquid methane and oxygen. SpaceX's Raptor engine is a full-flow staged combustion cycle engine. China's YF-100 powers the Long March 5.",
    relatedTerms: ["Solid Fuel", "Bipropellant", "Propellant", "Specific Impulse"],
    category: "Propulsion",
  },
  {
    term: "Bipropellant",
    definition: "A rocket propulsion system that uses two separate propellants — a fuel and an oxidizer — that are mixed and burned in the combustion chamber.",
    example: "Most orbital-class rockets use bipropellant engines. Common combinations include LOX/RP-1 (Falcon 9), LOX/LH2 (SLS, Ariane 5/6), and LOX/methane (Starship, Vulcan Centaur).",
    relatedTerms: ["Monopropellant", "Liquid Fuel", "Propellant"],
    category: "Propulsion",
  },
  {
    term: "Monopropellant",
    definition: "A rocket propulsion system using a single propellant that decomposes exothermically when passed over a catalyst, producing hot gas for thrust. Commonly used for spacecraft attitude control.",
    example: "Hydrazine is the most common monopropellant, used in attitude control thrusters on many satellites. Newer 'green' monopropellants like AF-M315E are being developed as safer alternatives.",
    relatedTerms: ["Bipropellant", "Propellant", "Specific Impulse"],
    category: "Propulsion",
  },
  {
    term: "Electric Propulsion",
    definition: "A category of spacecraft propulsion that uses electrical energy to accelerate propellant to very high exhaust velocities. Offers extremely high specific impulse but very low thrust.",
    example: "Starlink satellites use krypton-fueled Hall effect thrusters for orbit raising and station-keeping. ESA's SMART-1 used a Hall thruster to reach the Moon. Boeing's 702SP satellite bus uses all-electric propulsion.",
    relatedTerms: ["Ion Thruster", "Hall Effect Thruster", "Specific Impulse"],
    category: "Propulsion",
  },
  {
    term: "Ion Thruster",
    definition: "A type of electric propulsion that generates thrust by ionizing a propellant and accelerating the ions using electric fields. Provides very high specific impulse (2,000-10,000+ seconds) with extremely low thrust.",
    example: "NASA's Dawn mission used ion thrusters to orbit both Vesta and Ceres. JAXA's Hayabusa2 used ion engines to reach asteroid Ryugu and return samples to Earth.",
    relatedTerms: ["Electric Propulsion", "Hall Effect Thruster", "Specific Impulse"],
    category: "Propulsion",
  },
  {
    term: "Hall Effect Thruster",
    definition: "A type of electric propulsion that uses a magnetic field to trap electrons, which ionize the propellant (typically xenon or krypton). The ions are then accelerated by an electric field to produce thrust.",
    example: "SpaceX's Starlink satellites use Hall effect thrusters. Busek Co. and Exotrail (France) manufacture Hall thrusters for commercial satellites. China's DFH-3B satellite platform uses Hall thrusters.",
    relatedTerms: ["Electric Propulsion", "Ion Thruster", "Specific Impulse"],
    category: "Propulsion",
  },
  {
    term: "Launch Window",
    definition: "The time period during which a rocket must launch to reach its intended orbit or destination. Launch windows are determined by orbital mechanics, the positions of celestial bodies, and lighting conditions.",
    example: "Mars launch windows occur approximately every 26 months. ISS resupply missions have instantaneous launch windows (must launch at exact second). Rideshare missions to SSO often have wider windows.",
    relatedTerms: ["Orbital Mechanics", "Delta-V", "Inclination"],
    category: "Launch Services",
  },
  {
    term: "Parking Orbit",
    definition: "A temporary orbit where a spacecraft waits before performing a transfer to its final destination orbit. Used to time the transfer burn precisely.",
    example: "Apollo missions used a parking orbit around Earth before the Trans-Lunar Injection burn. China's Chang'e lunar missions also use Earth parking orbits before lunar transfer.",
    relatedTerms: ["Orbital Transfer", "Hohmann Transfer", "GTO"],
    category: "Orbital Mechanics",
  },
  {
    term: "Escape Velocity",
    definition: "The minimum speed an object must reach to break free from a gravitational field without further propulsion. Earth's escape velocity is approximately 11.2 km/s (40,320 km/h).",
    example: "Interplanetary missions like NASA's Parker Solar Probe must exceed Earth's escape velocity. New Horizons was the fastest spacecraft launched from Earth at 16.26 km/s.",
    relatedTerms: ["Delta-V", "Orbital Velocity", "Gravity Assist"],
    category: "Orbital Mechanics",
  },
  {
    term: "Orbital Velocity",
    definition: "The speed required for an object to maintain a stable orbit at a given altitude. For LEO, this is approximately 7.8 km/s (28,000 km/h).",
    example: "The ISS travels at about 7.66 km/s in LEO. GEO satellites move at only about 3.07 km/s due to their much higher altitude.",
    relatedTerms: ["Escape Velocity", "LEO", "GEO", "Delta-V"],
    category: "Orbital Mechanics",
  },
  {
    term: "Payload Adapter",
    definition: "The mechanical interface between a launch vehicle's upper stage and the payload (satellite). Adapters must handle the structural loads during launch and provide clean separation in orbit.",
    example: "RUAG Space (Switzerland) is a leading manufacturer of payload adapters used on many European and American rockets. Moog CSA Engineering provides adapters for various launch vehicles.",
    relatedTerms: ["Payload Fairing", "Rideshare Launch", "CubeSat"],
    category: "Launch Vehicle",
  },
  {
    term: "CLPS (Commercial Lunar Payload Services)",
    definition: "A NASA program that contracts private companies to deliver science and technology payloads to the lunar surface. Part of the Artemis program to return humans to the Moon.",
    example: "Intuitive Machines' Nova-C lander (IM-1) became the first commercial spacecraft to land on the Moon in 2024. Astrobotic's Peregrine and Firefly's Blue Ghost are also CLPS providers.",
    relatedTerms: ["Dedicated Launch", "Payload Adapter", "Delta-V"],
    category: "Programs",
  },
  {
    term: "ITAR (International Traffic in Arms Regulations)",
    definition: "U.S. regulations controlling the export of defense-related articles, services, and technical data, including many space technologies. ITAR significantly affects international satellite launch and collaboration.",
    example: "ITAR restrictions prevent many U.S.-origin satellite components from being launched on Chinese rockets. European companies sometimes design 'ITAR-free' satellites to have more launch vehicle options. The UAE and Saudi Arabia navigate ITAR requirements for their space programs.",
    relatedTerms: ["EAR", "Rideshare Launch", "Dedicated Launch"],
    category: "Regulations",
  },
  {
    term: "EAR (Export Administration Regulations)",
    definition: "U.S. regulations administered by the Bureau of Industry and Security (BIS) controlling the export of dual-use commercial items that could have military applications, including some space technologies.",
    example: "Many commercial satellite components fall under EAR rather than ITAR. Companies in Luxembourg, a major space hub, must comply with EAR when using U.S.-origin components.",
    relatedTerms: ["ITAR", "Regulations"],
    category: "Regulations",
  },
  {
    term: "Orbital Decay",
    definition: "The gradual decrease in the altitude of an orbiting object due to atmospheric drag. More significant at lower altitudes where residual atmosphere is denser.",
    example: "The ISS requires periodic reboosts to counteract orbital decay. During solar maximum, increased atmospheric expansion accelerates decay for LEO satellites including Starlink.",
    relatedTerms: ["Deorbit", "LEO", "Perigee", "Space Debris"],
    category: "Space Operations",
  },
  {
    term: "Polar Orbit",
    definition: "An orbit that passes over or near Earth's poles, with an inclination close to 90°. Polar orbits allow a satellite to observe the entire Earth's surface as the planet rotates beneath it.",
    example: "Weather satellites like NOAA's JPSS series use polar orbits. Vandenberg Space Force Base in California is the primary U.S. launch site for polar orbit missions.",
    relatedTerms: ["SSO", "Inclination", "LEO"],
    category: "Orbits",
  },
  {
    term: "Station-Keeping",
    definition: "Small orbital maneuvers performed periodically to maintain a satellite's assigned orbital position against perturbations from gravitational irregularities, solar radiation pressure, and atmospheric drag.",
    example: "GEO satellites perform station-keeping maneuvers every few weeks to stay within their assigned orbital slot. Starlink satellites use their Hall thrusters for continuous station-keeping in LEO.",
    relatedTerms: ["Delta-V", "GEO", "Electric Propulsion", "Orbital Decay"],
    category: "Space Operations",
  },
  {
    term: "Constellation",
    definition: "A group of satellites working together as a system to provide a specific service, such as global communications, navigation, or Earth observation.",
    example: "SpaceX's Starlink (~6,000+ satellites), Amazon's Project Kuiper (planned 3,236 satellites), and China's Guowang constellation represent the largest planned LEO constellations. OneWeb and Telesat are building smaller constellations.",
    relatedTerms: ["LEO", "SmallSat", "Rideshare Launch", "Station-Keeping"],
    category: "Spacecraft",
  },
  {
    term: "Launch Site",
    definition: "A facility from which rockets are launched into space. Location affects the orbits achievable and the payload capacity of launch vehicles due to Earth's rotational velocity.",
    example: "Cape Canaveral/Kennedy Space Center (USA), Kourou (French Guiana/ESA), Baikonur (Kazakhstan/Russia), Jiuquan and Wenchang (China), Sriharikota/Satish Dhawan (India), Tanegashima (Japan/JAXA), Mahia Peninsula (New Zealand/Rocket Lab), Alcântara (Brazil), Plesetsk and Vostochny (Russia).",
    relatedTerms: ["Inclination", "Launch Window", "Dedicated Launch"],
    category: "Launch Services",
  },
  {
    term: "Transponder",
    definition: "An electronic device on a communications satellite that receives, amplifies, and retransmits signals. Satellite capacity is often measured in transponder equivalents.",
    example: "A typical GEO communications satellite may carry 24-60 transponders. SES, Intelsat, Eutelsat, and Arabsat lease transponder capacity to broadcasters and telecom providers worldwide.",
    relatedTerms: ["GEO", "Constellation", "Payload"],
    category: "Spacecraft",
  },
  {
    term: "Space Agency",
    definition: "A government organization responsible for a nation's space program, including satellite development, launch services, scientific research, and human spaceflight.",
    example: "Major space agencies include NASA (USA), ESA (Europe), CNSA (China), ISRO (India), JAXA (Japan), Roscosmos (Russia), KARI (South Korea), UAE Space Agency, Saudi Space Commission, CONAE (Argentina), ACE (Chile), Luxembourg Space Agency, and ASA (Australia).",
    relatedTerms: ["ITAR", "Launch Site", "CLPS"],
    category: "Industry",
  },
  {
    term: "Starship",
    definition: "SpaceX's fully reusable super-heavy-lift launch system consisting of the Super Heavy booster and the Starship upper stage. Designed to carry over 100 metric tons to LEO, Starship is intended for Moon landings, Mars missions, and point-to-point Earth travel. It uses liquid methane and liquid oxygen (Methalox) propellant.",
    example: "NASA selected Starship as the Human Landing System (HLS) for the Artemis III Moon landing. SpaceX conducts Starship integrated test flights from Starbase in Boca Chica, Texas. As of 2026, Starship has completed multiple successful orbital-class test flights with full booster catch.",
    relatedTerms: ["Reusability", "Artemis Program", "Delta-V", "Super Heavy"],
    category: "Launch Vehicle",
  },
  {
    term: "Reusability",
    definition: "The ability to recover and re-fly launch vehicle components — boosters, upper stages, or fairings — multiple times, dramatically reducing the cost per kilogram to orbit. Reusability is the defining economic trend in modern launch services.",
    example: "SpaceX has reflown Falcon 9 boosters over 20 times each. Blue Origin's New Glenn first stage is designed for reuse. Rocket Lab is developing a reusable Neutron rocket. Stoke Space's Nova is designed for full and rapid reusability of both stages.",
    relatedTerms: ["Starship", "Dedicated Launch", "Launch Vehicle", "Specific Impulse"],
    category: "Launch Vehicle",
  },
  {
    term: "VLEO (Very Low Earth Orbit)",
    definition: "Orbits below approximately 450 km altitude, offering extremely low latency and high-resolution imaging but requiring active propulsion to counteract significant atmospheric drag. VLEO is increasingly targeted for next-generation Earth observation and communications.",
    example: "Satellogic and BlackSky operate Earth observation satellites in VLEO for high-resolution imagery. Companies like Skeyeon are developing VLEO-optimized platforms. Drag-compensating propulsion is essential at these altitudes.",
    relatedTerms: ["LEO", "Orbital Decay", "Electric Propulsion", "Station-Keeping"],
    category: "Orbits",
  },
  {
    term: "Direct-to-Device (D2D)",
    definition: "Satellite technology that connects directly to standard smartphones and IoT devices without specialized hardware. Also called Direct-to-Cell (D2C), it extends connectivity to areas with no terrestrial network coverage.",
    example: "SpaceX Starlink Direct-to-Cell (with T-Mobile) began SMS service in 2024, with voice and data following. AST SpaceMobile's BlueBird satellites provide D2D coverage using standard 4G/5G. Lynk-Omnispace and Skylo also compete in this market.",
    relatedTerms: ["Constellation", "LEO", "SmallSat"],
    category: "Spacecraft",
  },
  {
    term: "Active Debris Removal (ADR)",
    definition: "The technology and operations to physically capture and deorbit defunct satellites or rocket stages from Earth orbit. ADR is considered essential to preventing Kessler syndrome and ensuring long-term sustainability of orbital slots.",
    example: "ESA's ClearSpace-1 mission (targeting a Vespa adapter object) is the first contracted ADR mission. Japan's Astroscale operates ADRAS-J and has demonstrated proximity inspection of a debris object. D-Orbit and Orbit Fab are also developing related capabilities.",
    relatedTerms: ["Space Debris", "Deorbit", "LEO", "Orbital Decay"],
    category: "Space Operations",
  },
  {
    term: "Kick Stage",
    definition: "A small propulsive upper stage that separates from the launch vehicle in orbit and performs additional burns to deliver payloads to precise orbits. Kick stages extend a launch vehicle's capabilities and enable rideshare missions to deliver each payload to its own slot.",
    example: "Impulse Space's Helios kick stage deploys from Falcon 9 to deliver multiple payloads to precise orbits. D-Orbit's ION satellite carrier performs similar orbital transfer services. Rocket Lab's Photon upper stage also functions as a configurable kick stage.",
    relatedTerms: ["Rideshare Launch", "Orbital Transfer", "In-Space Transportation", "SmallSat"],
    category: "Spacecraft",
  },
  {
    term: "In-Space Transportation",
    definition: "Orbital transfer vehicles (OTVs) and space tugs that move payloads between orbits after launch vehicle separation. In-space transportation decouples the 'last mile' delivery problem from the launch vehicle, enabling more flexible and cost-effective satellite deployment.",
    example: "Momentus Vigoride, Impulse Space Mira, D-Orbit ION, and Spaceflight Inc.'s Sherpa are commercial OTVs operating in 2025–2026. Northrop Grumman's MEV provides life extension services to GEO satellites. Orbit Fab supplies propellant depots for long-duration missions.",
    relatedTerms: ["Kick Stage", "Orbital Transfer", "Rideshare Launch", "Delta-V"],
    category: "Space Operations",
  },
  {
    term: "Artemis Program",
    definition: "NASA's program to return humans to the Moon for the first time since Apollo 17 (1972). Artemis uses the Space Launch System (SLS), Orion capsule, Gateway lunar space station, and commercial Human Landing Systems (HLS). International partners include ESA, JAXA, CSA, and the UAE.",
    example: "Artemis I (2022) flew Orion uncrewed around the Moon. Artemis II (2024) carried four crew around the Moon without landing. Artemis III targets the first crewed lunar landing with SpaceX Starship HLS. Firefly Blue Ghost and Intuitive Machines Nova-C deliver science payloads under the CLPS program.",
    relatedTerms: ["CLPS", "SLS", "Starship", "Lunar Gateway"],
    category: "Programs",
  },
  {
    term: "Lunar Gateway",
    definition: "A small space station planned to orbit the Moon as part of NASA's Artemis program. Serving as a transit hub, habitat, and science platform, Gateway will be assembled in a near-rectilinear halo orbit (NRHO) and supports sustainable human lunar exploration.",
    example: "The Gateway Power and Propulsion Element (PPE) and Habitation and Logistics Outpost (HALO) are under construction. ESA contributes the ESPRIT refueling module. SpaceX and Northrop Grumman provide transportation services. Gateway is expected to host crews from multiple Artemis missions.",
    relatedTerms: ["Artemis Program", "CLPS", "HEO", "Station-Keeping"],
    category: "Programs",
  },
  {
    term: "Space Domain Awareness (SDA)",
    definition: "The ability to detect, track, identify, and characterize objects and activities in space, including satellites, debris, and potential threats. SDA is critical for both civil space safety and national defense operations.",
    example: "The U.S. Space Force's Space Surveillance Network tracks over 50,000 objects. Commercial SDA companies like LeoLabs, ExoAnalytic Solutions, and True Anomaly provide complementary tracking. The Space Development Agency (SDA) is deploying a 'Transport Layer' for resilient military communications.",
    relatedTerms: ["Space Debris", "TLE", "LEO", "Constellation"],
    category: "Space Operations",
  },
  {
    term: "NewSpace",
    definition: "A term describing the emerging commercial space industry driven by private sector investment, venture capital, and entrepreneurial companies — as distinct from the traditional government-contractor model. NewSpace is characterized by reduced costs, faster development cycles, and innovative business models.",
    example: "SpaceX, Rocket Lab, Planet Labs, and Astroscale are defining NewSpace companies. The global space economy is estimated to exceed $700 billion by 2030 (Morgan Stanley). Major hubs include Seattle, Los Angeles, Denver, London, and Munich.",
    relatedTerms: ["Reusability", "SmallSat", "Constellation", "Rideshare Launch"],
    category: "Industry",
  },
  {
    term: "ISRU (In-Situ Resource Utilization)",
    definition: "The process of extracting and using resources found on another planetary body — such as water ice, regolith, or atmospheric gases — to support exploration and reduce the mass that must be launched from Earth.",
    example: "NASA's MOXIE experiment on Mars Perseverance successfully produced oxygen from CO₂ atmosphere. Water ice at the Moon's poles could be converted to rocket propellant (LOX/LH2). Artemis and future Mars missions depend heavily on ISRU to make deep space exploration sustainable.",
    relatedTerms: ["Propellant", "Artemis Program", "Escape Velocity", "Delta-V"],
    category: "Space Operations",
  },
  {
    term: "Commercial Space Station",
    definition: "A privately owned and operated orbital habitat designed to provide microgravity research, manufacturing, tourism, and government crew services — replacing ISS as it nears end of life (planned 2030 deorbit).",
    example: "Axiom Space is attaching commercial modules to ISS before operating independently. Vast's Haven-1 is the first standalone commercial station, targeting 2026 launch. Blue Origin's Orbital Reef and Sierra Space's LIFE module are in development. NASA's Commercial LEO Destinations (CLD) program funds all three.",
    relatedTerms: ["LEO", "Station-Keeping", "CLPS", "In-Space Transportation"],
    category: "Space Operations",
  },
];

const CATEGORIES = Array.from(new Set(GLOSSARY_TERMS.map((t) => t.category))).sort();

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function Glossary() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedTerms, setExpandedTerms] = useState<Set<string>>(new Set());

  const filteredTerms = useMemo(() => {
    let terms = GLOSSARY_TERMS;
    if (selectedCategory) {
      terms = terms.filter((t) => t.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      terms = terms.filter(
        (t) =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q) ||
          t.relatedTerms.some((r) => r.toLowerCase().includes(q))
      );
    }
    return terms.sort((a, b) => a.term.localeCompare(b.term));
  }, [searchQuery, selectedCategory]);

  const groupedTerms = useMemo(() => {
    const groups: Record<string, GlossaryTerm[]> = {};
    for (const term of filteredTerms) {
      const letter = term.term[0].toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(term);
    }
    return groups;
  }, [filteredTerms]);

  const toggleTerm = (term: string) => {
    setExpandedTerms((prev) => {
      const next = new Set(prev);
      if (next.has(term)) next.delete(term);
      else next.add(term);
      return next;
    });
  };

  const jsonLdDefinedTermSet = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Space Industry Glossary — Orbit to Orbit Express",
    description:
      "Comprehensive glossary of space industry terminology covering orbital mechanics, launch vehicles, propulsion systems, spacecraft, and international space programs. Definitions for delta-v, LEO, GEO, VLEO, Starship, Artemis, Direct-to-Device, Active Debris Removal, NewSpace, ISRU, and 50+ additional terms. Updated May 2026.",
    url: "https://www.orbit2orbitexpress.com/glossary",
    hasDefinedTerm: GLOSSARY_TERMS.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.definition,
      inDefinedTermSet: "https://www.orbit2orbitexpress.com/glossary",
    })),
  };

  const jsonLdBreadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.orbit2orbitexpress.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Space Industry Glossary",
        item: "https://www.orbit2orbitexpress.com/glossary",
      },
    ],
  };

  useSEO({
    title:
      "Space Industry Glossary — Rocket Science Terms, Orbital Mechanics & Satellite Launch Definitions",
    description:
      "Comprehensive glossary of 60+ space industry terms: delta-v, LEO, GEO, VLEO, Starship, Artemis, Direct-to-Device, Active Debris Removal, kick stage, NewSpace, ISRU, and more. Covering international space programs from NASA, ESA, CNSA, ISRO, JAXA, UAE Space Agency, Saudi Space Commission, CONAE Argentina, KARI South Korea, and Luxembourg Space Agency.",
    canonical: "/glossary",
    keywords:
      "space glossary, space terminology, rocket science glossary, satellite launch terms, what is delta-v, what is LEO, what is GEO, what is VLEO, Starship explained, Artemis program, direct-to-device satellite, active debris removal, kick stage, NewSpace definition, ISRU space, in-space transportation, space domain awareness, SDA, commercial space station, orbital mechanics terms, space industry definitions, CubeSat definition, SmallSat definition, rideshare launch explained, ITAR space, EAR regulations, specific impulse explained, Hohmann transfer orbit, geostationary orbit, sun-synchronous orbit, space debris, launch window, escape velocity, orbital velocity, payload fairing, electric propulsion, ion thruster, Hall effect thruster, space launch terminology, aerospace glossary, satellite terminology, rocket propulsion terms, UAE space program, Saudi Arabia space, CNSA China, ISRO India, JAXA Japan, CONAE Argentina, Luxembourg space, ESA, NASA, SpaceX terminology, Blue Origin, Rocket Lab, Arianespace, space education, orbital mechanics tutorial, glosario espacial, terminología espacial, مصطلحات الفضاء, 太空术语, 宇宙用語, Space Alley Seattle, Pacific Northwest aerospace",
    ogType: "website",
    jsonLd: [jsonLdDefinedTermSet, jsonLdBreadcrumb],
  });

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <main
        id="main-content"
        className="pt-24 md:pt-28 pb-16"
      >
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto mb-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Link href="/" className="hover:text-gray-900 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-gray-900">Glossary</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Space Industry Glossary
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl">
              Comprehensive definitions for orbital mechanics, launch vehicles, propulsion
              systems, spacecraft, regulations, and international space programs. From
              delta-v to ITAR — everything you need to understand the space industry.
            </p>

            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500 flex-wrap">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{GLOSSARY_TERMS.length} terms defined</span>
              </div>
              <span className="text-gray-300">·</span>
              <span>Updated May 2026</span>
            </div>
          </div>

          <div className="max-w-4xl mx-auto mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search terms (e.g., delta-v, LEO, rideshare, ITAR...)"
                className="pl-10 h-12 text-base border-gray-300"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  !selectedCategory
                    ? "bg-gray-900 text-white border-gray-900"
                    : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                }`}
              >
                All
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat ? null : cat)
                  }
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white border-gray-900"
                      : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="hidden sm:flex flex-wrap gap-1">
              {ALPHABET.map((letter) => {
                const hasTerms = groupedTerms[letter]?.length > 0;
                return (
                  <a
                    key={letter}
                    href={hasTerms ? `#letter-${letter}` : undefined}
                    className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded transition-colors ${
                      hasTerms
                        ? "text-gray-700 hover:bg-gray-100 cursor-pointer"
                        : "text-gray-300 cursor-default"
                    }`}
                  >
                    {letter}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {filteredTerms.length === 0 && (
              <div className="text-center py-16">
                <p className="text-gray-500 text-lg">
                  No terms found matching "{searchQuery}"
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                  className="mt-4 text-rail-red hover:underline"
                >
                  Clear filters
                </button>
              </div>
            )}

            {Object.entries(groupedTerms).map(([letter, terms]) => (
              <div key={letter} id={`letter-${letter}`} className="mb-8">
                <div className="sticky top-20 md:top-24 z-10 bg-white border-b border-gray-200 py-2 mb-4">
                  <h2 className="text-2xl font-bold text-rail-red">{letter}</h2>
                </div>

                <div className="space-y-3">
                  {terms.map((term) => {
                    const isExpanded = expandedTerms.has(term.term);
                    return (
                      <div
                        key={term.term}
                        className="border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                      >
                        <button
                          onClick={() => toggleTerm(term.term)}
                          className="w-full text-left p-4 sm:p-5 flex items-start justify-between gap-4"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-gray-900">
                                {term.term}
                              </h3>
                              <Badge
                                variant="secondary"
                                className="text-xs font-normal"
                              >
                                {term.category}
                              </Badge>
                            </div>
                            {!isExpanded && (
                              <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {term.definition}
                              </p>
                            )}
                          </div>
                          <div className="flex-shrink-0 mt-1">
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                Definition
                              </h4>
                              <p className="text-gray-700 leading-relaxed">
                                {term.definition}
                              </p>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4">
                              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">
                                Real-World Example
                              </h4>
                              <p className="text-gray-700 text-sm leading-relaxed">
                                {term.example}
                              </p>
                            </div>

                            {term.relatedTerms.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                                  Related Terms
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                  {term.relatedTerms.map((related) => (
                                    <button
                                      key={related}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSearchQuery(related);
                                        setSelectedCategory(null);
                                        window.scrollTo({
                                          top: 0,
                                          behavior: "smooth",
                                        });
                                      }}
                                      className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-white border border-gray-200 rounded-full text-gray-600 hover:text-rail-red hover:border-rail-red transition-colors"
                                    >
                                      {related}
                                      <ArrowRight className="w-3 h-3" />
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="max-w-4xl mx-auto mt-16 bg-gray-50 rounded-xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              International Space Industry Context
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The space industry is truly global. Whether you are searching for launch
              options from the UAE, Saudi Arabia, or the broader Middle East; exploring
              satellite programs in Latin America through agencies like CONAE (Argentina)
              or ACE (Chile); evaluating European launch services from ESA's Kourou
              spaceport or Luxembourg's growing space sector; or understanding China's
              CNSA, India's ISRO, Japan's JAXA, or South Korea's KARI — this glossary
              provides the foundational vocabulary used across all space programs worldwide.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Space Alley in Seattle's Pacific Northwest is home to major aerospace
              companies including Blue Origin (Kent, WA), SpaceX Starlink (Redmond, WA),
              Amazon Project Kuiper (Kirkland, WA), and Boeing (Everett, WA). Understanding
              these terms is essential whether you're a startup, government agency, or
              established player in the global space economy.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
