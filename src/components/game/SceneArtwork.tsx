import { useGame } from "../../context/GameContext";
import { motion } from "motion/react";
import { Skull, Compass, Wand2, ShieldAlert, Sparkles, MapPin } from "lucide-react";

export default function SceneArtwork() {
  const { gameState } = useGame();

  const worldName = gameState?.world?.name || "Zombie Apocalypse";
  const location = gameState?.world?.currentLocation || "Starting Out";
  const sceneType = gameState?.scene?.type || "exploration";

  // Determine atmospheric color scheme based on the selected world
  let themeColor = "text-violet-400";
  let glowColor = "rgba(139,92,246,0.15)";
  let icon = <Skull className="text-violet-400 w-12 h-12" />;
  let visualStyle = "from-violet-950 via-zinc-950 to-black";

  if (worldName === "Pirate Ocean") {
    themeColor = "text-blue-400";
    glowColor = "rgba(96,165,250,0.15)";
    icon = <Compass className="text-blue-400 w-12 h-12" />;
    visualStyle = "from-sky-950 via-zinc-950 to-black";
  } else if (worldName === "Magic Academy") {
    themeColor = "text-pink-400";
    glowColor = "rgba(236,72,153,0.15)";
    icon = <Wand2 className="text-pink-400 w-12 h-12" />;
    visualStyle = "from-fuchsia-950 via-zinc-950 to-black";
  }

  return (
    <div className="relative h-[200px] md:h-[260px] bg-black border border-[#333333] rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center">
      {/* Dynamic Animated Atmospheric Gradient Background */}
      <div className={`absolute inset-0 bg-gradient-to-tr ${visualStyle} opacity-90`} />

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #333 1.2px, transparent 1px)",
          backgroundSize: "20px 20px"
        }}
      />

      {/* Floating Sparkles and Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 6, repeat: Infinity }}
          style={{ backgroundColor: glowColor }}
          className="absolute -top-10 -left-10 w-44 h-44 rounded-full blur-2xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{ backgroundColor: glowColor }}
          className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full blur-2xl"
        />
      </div>

      {/* Location Card Widget */}
      <div className="absolute top-3 left-3 bg-black/75 px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-1.5 z-10">
        <MapPin size={12} className={themeColor} />
        <span className="text-[11px] font-mono text-gray-300 tracking-wider uppercase">
          {location}
        </span>
      </div>

      <div className="absolute top-3 right-3 bg-black/75 px-3 py-1.5 rounded-lg border border-gray-800 flex items-center gap-1.5 z-10">
        <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
        <span className="text-[11px] font-mono text-red-400 tracking-wider uppercase">
          {sceneType} MODE
        </span>
      </div>

      {/* Central Immersive Graphical Representation */}
      <div className="relative flex flex-col items-center gap-3 text-center px-4 z-10">
        <motion.div
          animate={{
            y: [-4, 4, -4],
            rotate: [-1, 1, -1]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="p-4 bg-black/60 border border-gray-800 rounded-2xl shadow-lg relative"
        >
          {icon}
          {sceneType === "combat" && (
            <div className="absolute -top-1.5 -right-1.5 bg-red-600 p-1 rounded-full border border-black animate-bounce">
              <ShieldAlert size={12} className="text-white" />
            </div>
          )}
        </motion.div>

        <div>
          <h2 className={`font-serif font-bold text-lg md:text-xl tracking-wider ${themeColor}`}>
            {location}
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1 max-w-sm">
            {worldName === "Zombie Apocalypse" && "The wind carries infected moans through rubble..."}
            {worldName === "Pirate Ocean" && "Thunder strikes and salt water sprays on old decks..."}
            {worldName === "Magic Academy" && "Arcane script sparkles and dust flies from crystal books..."}
          </p>
        </div>
      </div>

      {/* Border Accents inspired by RPG wires */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-gray-700 to-transparent opacity-50" />
    </div>
  );
}
