import React, { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";
import Button from "../components/ui/Button";
import { ArrowLeft, User, Shield, Gauge, Zap, Ship, Brain, Sparkles, Coins, Dices } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface CharacterCreationProps {
  onNavigate: (screen: "home" | "create" | "continue" | "settings" | "game") => void;
}

// Predefined stories and classes mapping based on the chosen world/theme
const STORIES_BY_WORLD: Record<string, {
  name: string;
  desc: string;
  badge: string;
  glowColor: string;
  classes: string[];
  startingWeapon: string;
}[]> = {
  "Zombie Apocalypse": [
    {
      name: "Train to Busan",
      desc: "Try to survive a hyper-fast zombie outbreak inside a speeding KTX train from Seoul to Busan.",
      badge: "Fast-Infected Horror",
      glowColor: "from-violet-500/20 to-purple-500/10 border-violet-500/40 text-violet-400",
      classes: ["Fund Manager", "Tough Husband", "High School Batter", "Cheerleader"],
      startingWeapon: "Aluminum Baseball Bat"
    },
    {
      name: "World War Z",
      desc: "Travel the globe as a UN Investigator searching for Patient Zero amidst massive walls of swarming undead.",
      badge: "Global Tactical Swarm",
      glowColor: "from-violet-500/20 to-indigo-500/10 border-violet-500/40 text-violet-400",
      classes: ["UN Investigator", "Virologist", "Navy SEAL", "C-130 Pilot"],
      startingWeapon: "Tactical Pistol"
    },
    {
      name: "28 Days Later",
      desc: "Awake from a coma in London to find a deserted wasteland overrun by rage-infected sprinters.",
      badge: "Atmospheric Survival",
      glowColor: "from-violet-600/20 to-purple-500/10 border-violet-500/40 text-violet-400",
      classes: ["Bicycle Messenger", "Survivor Chemist", "Military Defector", "London Cabby"],
      startingWeapon: "Steel Machete"
    },
    {
      name: "Army of the Dead",
      desc: "Infiltrate a quarantine-walled, zombie-infested Las Vegas to pull off a multi-million casino heist.",
      badge: "Vegas Heist Action",
      glowColor: "from-purple-500/20 to-violet-500/10 border-violet-500/40 text-violet-400",
      classes: ["Mercenary Leader", "Expert Safecracker", "Helicopter Pilot", "Coyote Guide"],
      startingWeapon: "Assault Rifle"
    }
  ],
  "Magic Academy": [
    {
      name: "Harry Potter",
      desc: "Master magic, gather house points, and face dark arts inside a grand enchanted castle school.",
      badge: "Enchanted Gothic Magic",
      glowColor: "from-pink-500/20 to-rose-500/10 border-pink-500/40 text-pink-400",
      classes: ["Gryffindor Auror", "Slytherin Seeker", "Ravenclaw Scholar", "Hufflepuff Herbologist"],
      startingWeapon: "Phoenix Feather Wand"
    },
    {
      name: "Now You See Me",
      desc: "Conceal real magic behind stunning stage illusions while staying one step ahead of the FBI.",
      badge: "Modern Illusionist Heist",
      glowColor: "from-rose-500/20 to-pink-500/10 border-pink-500/40 text-pink-400",
      classes: ["Card Illusionist", "Mentalist Hypnotist", "Escape Artist", "Sleight of Hand Thief"],
      startingWeapon: "Deck of Trick Cards"
    },
    {
      name: "The Prestige",
      desc: "Venture into late-Victorian London as rival magicians obsessed with creating the ultimate teleportation illusion.",
      badge: "Gaslight Obsession",
      glowColor: "from-pink-600/20 to-rose-500/10 border-pink-500/40 text-pink-400",
      classes: ["The Professor", "The Great Danton", "Stage Engineer", "Slight of Hand Assistant"],
      startingWeapon: "Tesla Spark Wand"
    },
    {
      name: "The Bureau of Magical Things",
      desc: "Keep the magical realm hidden from humans by regulating wild spellcasting and magical creatures.",
      badge: "Secret Urban Agency",
      glowColor: "from-fuchsia-500/20 to-pink-500/10 border-pink-500/40 text-pink-400",
      classes: ["Elf Spellcaster", "Fairy Healer", "Human Bureau Agent", "Library Archivist"],
      startingWeapon: "Bureau Arcane Badge"
    }
  ],
  "Pirate Ocean": [
    {
      name: "Pirates of the Caribbean",
      desc: "Sail the Caribbean on a cursed ship to lift ancient Aztec gold curses and outrun the legendary Kraken.",
      badge: "Cursed High Seas",
      glowColor: "from-blue-600/20 to-sky-500/10 border-blue-500/40 text-blue-400",
      classes: ["Cursed Captain", "Royal Navy Officer", "Blacksmith Swashbuckler", "Voodoo Mystic"],
      startingWeapon: "Engraved Navy Cutlass"
    },
    {
      name: "The Black Swan",
      desc: "Experience the golden age of high-seas privateering, chasing heavy Spanish galleons loaded with silver.",
      badge: "Privateer Silver Fleet",
      glowColor: "from-sky-500/20 to-blue-500/10 border-sky-500/40 text-sky-400",
      classes: ["French Privateer", "Spanish Galleon Captain", "Rogue Deckhand", "Cabin Boy"],
      startingWeapon: "Polished Buccaneer Cutlass"
    },
    {
      name: "Captain Blood",
      desc: "From enslaved physician to legendary buccaneer admiral, command a massive fleet with honor and strategic brilliance.",
      badge: "Noble Outlaw Tactician",
      glowColor: "from-indigo-500/20 to-blue-500/10 border-indigo-500/40 text-indigo-400",
      classes: ["Soldier-Physician", "Buccaneer Officer", "Governor's Daughter Advisor", "Expert Steersman"],
      startingWeapon: "Officer Boarding Cutlass"
    },
    {
      name: "Hook",
      desc: "Reclaim your lost youth as an adult Peter Pan, or serve as a pirate under Captain Hook's clockwork vengeance.",
      badge: "Neverland Childhood",
      glowColor: "from-cyan-500/20 to-blue-500/10 border-cyan-500/40 text-cyan-400",
      classes: ["Lost Boy Leader", "Peter Pan (Lawyer)", "First Mate Smee", "Neverland Pixie"],
      startingWeapon: "Double-Edged Wooden Dagger"
    }
  ]
};

const WORLDS_METADATA = [
  {
    name: "Zombie Apocalypse",
    desc: "Survive the infected wasteland of Sector 4.",
    color: "border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.2)] text-[#8B5CF6]",
    bg: "bg-violet-950/10",
    badge: "Toxic Violet Glow",
    icon: <Brain size={24} className="text-[#8B5CF6]" />
  },
  {
    name: "Pirate Ocean",
    desc: "Sail cursed waters of the Black Reef.",
    color: "border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)] text-blue-400",
    bg: "bg-blue-950/10",
    badge: "Deep Ocean Blue",
    icon: <Ship size={24} className="text-blue-400" />
  },
  {
    name: "Magic Academy",
    desc: "Uncover secrets inside the Arcane Spire.",
    color: "border-[#EC4899] shadow-[0_0_15px_rgba(236,72,153,0.2)] text-[#EC4899]",
    bg: "bg-pink-950/10",
    badge: "Mystic Pink Glow",
    icon: <Zap size={24} className="text-[#EC4899]" />
  }
];

export default function CharacterCreation({ onNavigate }: CharacterCreationProps) {
  const { startNewGame, isLoading } = useGame();
  
  const [name, setName] = useState("User");
  const [worldName, setWorldName] = useState("Zombie Apocalypse");

  const getThemeColors = (wName: string) => {
    if (wName === "Zombie Apocalypse") {
      return {
        primary: "#8B5CF6", // Violet color
        primaryClass: "text-[#8B5CF6]",
        borderClass: "border-[#8B5CF6]",
        bgClass: "bg-[#8B5CF6]",
        focusBorderClass: "focus:border-violet-500",
        badgeBg: "bg-[#8B5CF6]/10",
        diffActive: "bg-violet-950/40 border-violet-500/60 text-violet-400 font-bold",
        btnVariant: "primary-violet" as const,
        btnClass: "",
      };
    } else if (wName === "Magic Academy") {
      return {
        primary: "#EC4899", // Pink color
        primaryClass: "text-[#EC4899]",
        borderClass: "border-[#EC4899]",
        bgClass: "bg-[#EC4899]",
        focusBorderClass: "focus:border-pink-500",
        badgeBg: "bg-[#EC4899]/10",
        diffActive: "bg-pink-950/40 border-pink-500/60 text-pink-400 font-bold",
        btnVariant: "primary-pink" as const,
        btnClass: "",
      };
    } else {
      // Pirate Ocean - Blue
      return {
        primary: "#3B82F6", // Blue color
        primaryClass: "text-[#3B82F6]",
        borderClass: "border-[#3B82F6]",
        bgClass: "bg-[#3B82F6]",
        focusBorderClass: "focus:border-blue-500",
        badgeBg: "bg-[#3B82F6]/10",
        diffActive: "bg-blue-950/40 border-blue-500/60 text-blue-400 font-bold",
        btnVariant: "primary-blue" as const,
        btnClass: "",
      };
    }
  };

  const themeColors = getThemeColors(worldName);
  
  // Predefined Stories State
  const [selectedStory, setSelectedStory] = useState("Train to Busan");
  const [className, setClassName] = useState("Fund Manager");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Stranger Things D20 State
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [rollingValue, setRollingValue] = useState(20);
  const [stats, setStats] = useState({ str: 10, dex: 10, con: 10, int: 10 });
  const [rollResultMsg, setRollResultMsg] = useState("");
  const [launchError, setLaunchError] = useState("");

  // Automatically calculate stats based on chosen class
  useEffect(() => {
    const isStrengthClass = ["Tough Husband", "Navy SEAL", "Military Defector", "Mercenary Leader", "Cursed Captain", "Blacksmith Swashbuckler", "French Privateer"].includes(className);
    const isDexterityClass = ["High School Batter", "Bicycle Messenger", "Escape Artist", "Sleight of Hand Thief", "Peter Pan (Lawyer)", "Lost Boy Leader"].includes(className);
    const isIntelligenceClass = ["Fund Manager", "Virologist", "Survivor Chemist", "Gryffindor Auror", "Ravenclaw Scholar", "The Professor", "Stage Engineer", "Soldier-Physician"].includes(className);
    const isConstitutionClass = ["UN Investigator", "C-130 Pilot", "London Cabby", "Coyote Guide", "Slytherin Seeker", "Mentalist Hypnotist", "Human Bureau Agent"].includes(className);

    setStats({
      str: 10 + (isStrengthClass ? 6 : 2),
      dex: 10 + (isDexterityClass ? 6 : 2),
      con: 10 + (isConstitutionClass ? 6 : 2),
      int: 10 + (isIntelligenceClass ? 6 : 2)
    });
  }, [className]);

  // Sync state when world changes
  const handleWorldChange = (wName: string) => {
    setWorldName(wName);
    const stories = STORIES_BY_WORLD[wName];
    if (stories && stories.length > 0) {
      const firstStory = stories[0];
      setSelectedStory(firstStory.name);
      setClassName(firstStory.classes[0]);
    }
  };

  // Sync state when story changes
  const handleStoryChange = (sName: string) => {
    setSelectedStory(sName);
    const story = STORIES_BY_WORLD[worldName]?.find(s => s.name === sName);
    if (story) {
      setClassName(story.classes[0]);
    }
    // Reset roll details so they can roll again for the new story campaign
    setDiceRoll(null);
    setRollResultMsg("");
  };

  // Roll D20 mechanics (Stranger Things style)
  const rollD20 = () => {
    if (isRolling) return;
    setIsRolling(true);
    setRollResultMsg("");
    
    let rollCounter = 0;
    const rollInterval = setInterval(() => {
      setRollingValue(Math.floor(Math.random() * 20) + 1);
      rollCounter++;
      if (rollCounter > 12) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 20) + 1;
        setRollingValue(finalRoll);
        setDiceRoll(finalRoll);
        setIsRolling(false);
        
        // Auto-assign class based on dice roll range (4 classes divided by 5 values)
        const story = STORIES_BY_WORLD[worldName]?.find(s => s.name === selectedStory);
        if (story) {
          const classIdx = Math.min(Math.floor((finalRoll - 1) / 5), story.classes.length - 1);
          const chosenClass = story.classes[classIdx];
          setClassName(chosenClass);

          // Attribute calculations with rolls
          let bonus = 0;
          let msg = "";
          if (finalRoll === 20) {
            bonus = 5;
            msg = "NATURAL 20! CRITICAL SUCCESS! Starting stats & wealth boosted dramatically!";
          } else if (finalRoll === 1) {
            bonus = -1;
            msg = "CRITICAL FAIL! Demogorgon's Shadow lingers, but pity grants you +100 gold!";
          } else if (finalRoll >= 15) {
            bonus = 3;
            msg = "HEROIC INITIATIVE! Stronger starting attributes gained.";
          } else if (finalRoll >= 10) {
            bonus = 2;
            msg = "SOLID ROLL! Stable starting attributes gained.";
          } else {
            bonus = 1;
            msg = "SUCCESSFUL ROLL! Standard attribute buffs applied.";
          }
          setRollResultMsg(msg);

          // Calculate specialized stats based on chosen class + roll bonus
          setStats({
            str: 10 + bonus + (["Tough Husband", "Navy SEAL", "Military Defector", "Mercenary Leader", "Cursed Captain", "Blacksmith Swashbuckler", "French Privateer"].includes(chosenClass) ? 4 : 1),
            dex: 10 + bonus + (["High School Batter", "Bicycle Messenger", "Escape Artist", "Sleight of Hand Thief", "Peter Pan (Lawyer)", "Lost Boy Leader"].includes(chosenClass) ? 4 : 1),
            int: 10 + bonus + (["Fund Manager", "Virologist", "Survivor Chemist", "Gryffindor Auror", "Ravenclaw Scholar", "The Professor", "Stage Engineer", "Soldier-Physician"].includes(chosenClass) ? 4 : 1),
            con: 10 + bonus + (["UN Investigator", "C-130 Pilot", "London Cabby", "Coyote Guide", "Slytherin Seeker", "Mentalist Hypnotist", "Human Bureau Agent"].includes(chosenClass) ? 4 : 1)
          });
        }
      }
    }, 80);
  };

  const handleEnterWorld = async () => {
    if (!name.trim()) return;
    setLaunchError("");
    try {
      await startNewGame(
        name,
        className,
        difficulty,
        worldName,
        selectedStory,
        diceRoll || undefined
      );
      onNavigate("game");
    } catch (e: any) {
      console.error(e);
      setLaunchError(e?.response?.data?.error || "Unable to start the campaign. Please try again.");
    }
  };

  // Currently selected story campaign details
  const activeStoryObj = STORIES_BY_WORLD[worldName]?.find(s => s.name === selectedStory) || STORIES_BY_WORLD[worldName][0];

  return (
    <div className="flex-1 max-w-5xl mx-auto p-4 md:p-8 select-none">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#333333] pb-4">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white focus:outline-none cursor-pointer transition-all"
          id="back-to-home-btn"
        >
          <ArrowLeft size={14} />
          <span>BACK</span>
        </button>
        <span className="text-xs font-mono tracking-widest uppercase font-bold animate-pulse" style={{ color: themeColors.primary }}>
          CAMPAIGN SELECTION PROTOCOL
        </span>
      </div>

      {/* 1. Theme/World Selector */}
      <div className="mb-6">
        <h2 className="text-xs font-mono text-gray-400 tracking-widest uppercase mb-3">1. SELECT THEME REALM</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {WORLDS_METADATA.map((w, idx) => {
            const isSelected = worldName === w.name;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleWorldChange(w.name)}
                className={`border p-4 rounded-xl cursor-pointer flex flex-col justify-between h-36 transition-all ${
                  isSelected
                    ? `${w.color} ${w.bg} border-2`
                    : "border-[#333333] bg-[#141414] text-gray-400 hover:border-gray-500"
                }`}
                id={`world-theme-card-${idx}`}
              >
                <div className="flex justify-between items-start">
                  {w.icon}
                  <span className="text-[9px] font-mono tracking-widest uppercase opacity-80 bg-black/40 px-2 py-0.5 rounded">
                    {w.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif font-black tracking-wide text-sm md:text-base mt-2 text-white">
                    {w.name}
                  </h3>
                  <p className="text-[11px] mt-1 text-gray-400 leading-relaxed font-sans">
                    {w.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 2. Predefined Stories List */}
      <div className="mb-8">
        <h2 className="text-xs font-mono text-gray-400 tracking-widest uppercase mb-3">2. CHOOSE PREDEFINED CAMPAIGN STORY</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(STORIES_BY_WORLD[worldName] || []).map((story, idx) => {
            const isSelected = selectedStory === story.name;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.02 }}
                onClick={() => handleStoryChange(story.name)}
                className={`border p-4 rounded-xl cursor-pointer flex flex-col justify-between h-44 transition-all relative overflow-hidden ${
                  isSelected
                    ? `bg-gradient-to-br ${story.glowColor}`
                    : "border-[#222] bg-[#181818] text-gray-400 hover:border-gray-600"
                }`}
                style={isSelected ? { borderColor: themeColors.primary, boxShadow: `0 0 15px ${themeColors.primary}40`, borderWidth: "2px" } : {}}
                id={`story-card-${idx}`}
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[8px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-black/50 text-white border border-gray-800">
                      CAMPAIGN {idx + 1}
                    </span>
                    <span className="text-[8px] font-mono text-gray-500">{story.badge}</span>
                  </div>
                  <h4 className="font-serif font-black text-sm text-white tracking-wide">
                    {story.name}
                  </h4>
                  <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                    {story.desc}
                  </p>
                </div>
                <div className="text-[9px] font-mono text-gray-500 mt-2 border-t border-[#333]/20 pt-1 flex justify-between items-center">
                  <span>ST. WEAPON:</span>
                  <span className="text-white font-sans">{story.startingWeapon}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 3. Character Creator & Stats Section */}
      <div className="max-w-2xl mx-auto">
        
        {/* Identity & Stats Form */}
        <div className="bg-[#141414] border border-[#222] rounded-xl p-6 shadow-2xl relative flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-md" style={{ borderColor: themeColors.primary }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: themeColors.primary }} />

          <div>
            <h3 className="text-sm font-serif font-bold text-white mb-5 border-b border-[#222] pb-2 flex items-center gap-2">
              <User size={16} style={{ color: themeColors.primary }} />
              <span>CHARACTER BIO & CAMPAIGN CLASSIFICATION</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Character Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-gray-400 tracking-wider flex items-center gap-1">
                  <span>CHARACTER NAME:</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-black border border-[#2c2c2c] rounded-lg p-2.5 text-xs text-white ${themeColors.focusBorderClass} focus:outline-none font-mono`}
                  placeholder="User"
                  id="character-name-input"
                />
              </div>

              {/* Class (Dynamic Select) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono text-gray-400 tracking-wider flex items-center gap-1">
                  <Shield size={10} style={{ color: themeColors.primary }} />
                  <span>CLASS / ROLE:</span>
                </label>
                <select
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className={`w-full bg-black border border-[#2c2c2c] rounded-lg p-2.5 text-xs text-white ${themeColors.focusBorderClass} focus:outline-none font-mono cursor-pointer`}
                  id="class-role-select"
                >
                  {activeStoryObj.classes.map((cls, cIdx) => (
                    <option key={cIdx} value={cls}>🛡 {cls}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Campaign Mechanics Summary info */}
            <div className="bg-black/50 border border-[#222] rounded-lg p-3.5 mb-6">
              <span className="text-[9px] font-mono uppercase tracking-widest font-bold block mb-1" style={{ color: themeColors.primary }}>Campaign Narrative Settings</span>
              <p className="text-[11px] font-sans text-gray-400 leading-relaxed">
                As a <strong className="text-white font-mono">{className}</strong> inside <strong className="text-white font-mono">{selectedStory}</strong>, you start with 
                an <strong className="text-white">{activeStoryObj.startingWeapon}</strong>. You'll complete quests tailored around the thematic lore, utilizing dynamic actions with 20-sided roll mechanics.
              </p>
            </div>

            {/* RPG Attributes Grid */}
            <div>
              <span className="text-[10px] font-mono text-gray-400 tracking-wider block mb-3 uppercase">Character Core Stats (D&D Mechanics)</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-black border border-[#222] p-2.5 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-gray-500 block">STR (Strength)</span>
                  <span className="text-sm font-mono font-bold text-white mt-1 block">{stats.str}</span>
                </div>
                <div className="bg-black border border-[#222] p-2.5 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-gray-500 block">DEX (Dexterity)</span>
                  <span className="text-sm font-mono font-bold text-white mt-1 block">{stats.dex}</span>
                </div>
                <div className="bg-black border border-[#222] p-2.5 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-gray-500 block">CON (Constitution)</span>
                  <span className="text-sm font-mono font-bold text-white mt-1 block">{stats.con}</span>
                </div>
                <div className="bg-black border border-[#222] p-2.5 rounded-lg text-center">
                  <span className="text-[9px] font-mono text-gray-500 block">INT (Intelligence)</span>
                  <span className="text-sm font-mono font-bold text-white mt-1 block">{stats.int}</span>
                </div>
              </div>
            </div>
          </div>

          {launchError ? (
            <div className="mt-4 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] font-mono text-red-300">
              {launchError}
            </div>
          ) : null}

          <div className="mt-6 flex justify-between items-center pt-4 border-t border-[#222]">
            {/* Difficulty */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-gray-500 uppercase">Difficulty:</span>
              <div className="flex gap-1">
                {(["Easy", "Medium", "Hard"] as const).map((diff, dIdx) => {
                  const isAct = difficulty === diff;
                  return (
                    <button
                      key={dIdx}
                      onClick={() => setDifficulty(diff)}
                      className={`text-[9px] font-mono px-2 py-1 rounded transition-all ${
                        isAct 
                          ? themeColors.diffActive 
                          : "bg-black text-gray-500 hover:text-gray-300"
                      }`}
                      id={`difficulty-btn-${diff}`}
                    >
                      {diff}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant={themeColors.btnVariant}
              size="lg"
              type="button"
              disabled={isLoading || !name.trim()}
              onClick={(e) => {
                e.preventDefault();
                void handleEnterWorld();
              }}
              className={`font-mono uppercase tracking-wider text-xs border border-transparent transition-all ${themeColors.btnClass}`}
              id="enter-campaign-btn"
            >
              {isLoading ? "LAUNCHING SYSTEM..." : "BEGIN CAMPAIGN"}
            </Button>
          </div>
        </div>

      </div>
    </div>
  );
}
