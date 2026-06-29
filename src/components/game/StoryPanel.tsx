import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../context/GameContext";
import { useAudio } from "../../context/AudioContext";
import { Terminal, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function StoryPanel() {
  const { gameState, sendAction, isLoading, settings } = useGame();
  const { playSfx } = useAudio();
  const [displayedText, setDisplayedText] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);

  const fullText = gameState?.story?.currentText || "";
  const isInstant = settings.textSpeed === "instant";

  const worldName = gameState?.world?.name || "Zombie Apocalypse";

  let themeHex = "#8B5CF6"; // Default Zombie Apocalypse (Violet)

  if (worldName === "Pirate Ocean") {
    themeHex = "#3B82F6"; // Blue
  } else if (worldName === "Magic Academy") {
    themeHex = "#EC4899"; // Pink
  }

  // Automatically scroll to the bottom of the container as text stream grows
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText]);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (isInstant) {
      setDisplayedText(fullText);
      return;
    }

    setDisplayedText("");
    let index = 0;
    
    // Play subtle mechanical typing sounds periodically
    let tickCount = 0;

    timerRef.current = setInterval(() => {
      if (index < fullText.length) {
        setDisplayedText((prev) => prev + fullText.charAt(index));
        index++;
        
        tickCount++;
        if (tickCount % 4 === 0) {
          playSfx("click");
        }
      } else {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      }
    }, 18); // Fast, legible typewriter beat

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fullText, isInstant]);

  return (
    <div className="bg-[#121212]/95 border border-[#333333] rounded-xl p-3.5 flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative select-none w-full min-h-[140px] max-h-[220px]" style={{ borderTopWidth: "2px", borderTopColor: themeHex }}>
      {/* Tech corner brackets for RPG aesthetic */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l rounded-tl-md" style={{ borderColor: themeHex }} />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r rounded-tr-md" style={{ borderColor: themeHex }} />

      {/* 1. Header Row */}
      <div className="flex items-center justify-between border-b border-gray-800 pb-1.5 mb-1.5 relative z-10">
        <div className="flex items-center gap-2 font-sans font-bold tracking-wide text-xs" style={{ color: themeHex }}>
          <Terminal size={14} className="animate-pulse" />
          <span>AI DUNGEON MASTER</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono">
          <Sparkles size={11} className="text-yellow-500" />
          <span>CONSOLE LOG</span>
        </div>
      </div>

      {/* 2. Scrollable Story Text Area */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-y-auto max-h-[130px] font-serif text-gray-200 text-xs md:text-sm leading-relaxed tracking-wide space-y-3 pr-1 relative z-10 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
      >
        <p className="whitespace-pre-line font-serif">
          {displayedText}
          {displayedText.length < fullText.length ? (
            <span className="inline-block w-2 h-3.5 ml-1.5 animate-pulse align-middle" style={{ backgroundColor: themeHex, boxShadow: `0 0 8px ${themeHex}` }} />
          ) : (
            <span className="inline-block w-[6px] h-3 ml-1 animate-pulse align-middle" style={{ backgroundColor: `${themeHex}66` }} />
          )}
        </p>
        {/* Generous spacer to allow 3-4 lines of extra scrolling whitespace at the bottom */}
        <div className="h-16" />
      </div>

      {/* 3. Sleek Tech Footer */}
      <div className="mt-2 pt-1 border-t border-gray-950 flex items-center justify-between text-[8px] font-mono text-gray-600 relative z-10">
        <span>DM narrative status: active</span>
        <span>words: {fullText.split(/\s+/).filter(Boolean).length}</span>
      </div>
    </div>
  );
}
