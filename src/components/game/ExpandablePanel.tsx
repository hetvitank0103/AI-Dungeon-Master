import React, { useState } from "react";
import { motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import { useGame } from "../../context/GameContext";

interface ExpandablePanelProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export default function ExpandablePanel({
  label,
  icon,
  children,
  defaultOpen = true,
}: ExpandablePanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const { gameState } = useGame();

  const worldName = gameState?.world?.name || "Zombie Apocalypse";

  let themeHex = "#8B5CF6"; // Default Zombie Apocalypse (Violet)
  if (worldName === "Pirate Ocean") {
    themeHex = "#3B82F6"; // Blue
  } else if (worldName === "Magic Academy") {
    themeHex = "#EC4899"; // Pink
  }

  return (
    <div className="bg-[#121212]/95 border border-gray-800 rounded-xl flex flex-col shadow-[0_10px_30px_rgba(0,0,0,0.35)] shrink-0 overflow-hidden w-full">
      {/* Clickable Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3.5 bg-black/40 hover:bg-black/60 focus:outline-none transition-colors text-left cursor-pointer select-none"
      >
        <div className="flex items-center gap-2">
          <span className="flex items-center" style={{ color: themeHex }}>{icon}</span>
          <span className="text-[10px] font-mono font-bold tracking-wider uppercase" style={{ color: themeHex }}>
            {label}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-400"
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {/* Animated Content Panel */}
      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="p-4 border-t border-gray-900 bg-black/20">
          {children}
        </div>
      </motion.div>
    </div>
  );
}
