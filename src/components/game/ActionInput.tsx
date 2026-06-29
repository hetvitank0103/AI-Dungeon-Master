import React, { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useAudio } from "../../context/AudioContext";
import { Send, Sparkles } from "lucide-react";
import { motion } from "motion/react";

export default function ActionInput() {
  const { gameState, sendAction, isLoading } = useGame();
  const { playSfx } = useAudio();
  const [inputText, setInputText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    sendAction(inputText.trim());
    setInputText("");
    try {
      playSfx("click");
    } catch (e) {}
  };

  const handleChoiceClick = (choice: string) => {
    if (isLoading) return;
    sendAction(choice);
    try {
      playSfx("click");
    } catch (e) {}
  };

  if (!gameState) return null;

  const worldName = gameState.world.name;

  let themeHex = "#8B5CF6"; // Default Zombie Apocalypse (Violet)
  let focusShadow = "0px 0px 8px rgba(139, 92, 246, 0.25)";
  let btnShadow = "0px 0px 10px rgba(139, 92, 246, 0.25)";
  let btnHoverShadow = "0px 0px 18px rgba(139, 92, 246, 0.45)";

  if (worldName === "Pirate Ocean") {
    themeHex = "#3B82F6"; // Blue
    focusShadow = "0px 0px 8px rgba(59, 130, 246, 0.25)";
    btnShadow = "0px 0px 10px rgba(59, 130, 246, 0.25)";
    btnHoverShadow = "0px 0px 18px rgba(59, 130, 246, 0.45)";
  } else if (worldName === "Magic Academy") {
    themeHex = "#EC4899"; // Pink
    focusShadow = "0px 0px 8px rgba(236, 72, 153, 0.25)";
    btnShadow = "0px 0px 10px rgba(236, 72, 153, 0.25)";
    btnHoverShadow = "0px 0px 18px rgba(236, 72, 153, 0.45)";
  }

  const suggestedChoices = gameState?.choices || [
    "Look around",
    "Check inventory",
    "Go north",
    "Wait patiently",
  ];

  return (
    <div className="flex flex-col gap-2.5 bg-[#121212]/95 border border-[#333333] p-3 rounded-xl shadow-[0_-10px_30px_rgba(0,0,0,0.5)] relative z-30 w-full">
      {/* Visual accents for RPG aesthetic */}
      <div className="absolute top-0 left-0 w-3 h-[2px]" style={{ backgroundColor: themeHex }} />
      <div className="absolute top-0 right-0 w-3 h-[2px]" style={{ backgroundColor: themeHex }} />

      {/* Suggested Actions List - Inside typing section */}
      <div className="flex flex-col gap-1.5 pb-2 border-b border-gray-900/60">
        <div className="flex items-center gap-1.5 text-[8px] font-mono text-gray-500 tracking-wider">
          <Sparkles size={10} style={{ color: themeHex }} />
          <span>SUGGESTED COMMANDS:</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-[44px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          {suggestedChoices.map((choice, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading || gameState?.gameStatus?.gameOver}
              onClick={() => handleChoiceClick(choice)}
              className="px-2 py-0.5 rounded bg-black/60 border border-gray-800 text-gray-300 text-[10px] hover:text-white focus:outline-none transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
              style={{
                "--hover-border": themeHex,
              } as React.CSSProperties}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = themeHex;
                e.currentTarget.style.color = themeHex;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgb(31, 41, 55)";
                e.currentTarget.style.color = "rgb(209, 213, 219)";
              }}
            >
              {choice}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Input row */}
      <form onSubmit={handleSubmit} className="flex gap-2 items-center">
        <div className="flex-1 relative flex items-center">
          <span className="absolute left-3 text-xs font-mono font-bold select-none" style={{ color: themeHex }}>
            &gt;
          </span>
          <input
            type="text"
            disabled={isLoading || gameState?.gameStatus?.gameOver}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={
              gameState?.gameStatus?.gameOver
                ? "This game is over. Restart to continue."
                : "Type your action (e.g., 'Examine the ship', 'Cast fire spell')..."
            }
            className="w-full pl-6 pr-3 py-2 bg-black/80 border border-gray-800 focus:outline-none text-xs text-white placeholder-gray-600 rounded-lg font-mono transition-all"
            style={{
              borderColor: isFocused ? themeHex : "rgb(31, 41, 55)",
              boxShadow: isFocused ? focusShadow : "none"
            }}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          type="submit"
          disabled={isLoading || !inputText.trim() || gameState?.gameStatus?.gameOver}
          className="text-black font-bold rounded-lg px-4 py-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
          style={{
            backgroundColor: themeHex,
            boxShadow: btnShadow
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = btnHoverShadow;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = btnShadow;
          }}
        >
          <span className="text-[10px] tracking-wider font-mono font-bold">SEND</span>
          <Send size={11} />
        </motion.button>
      </form>
    </div>
  );
}
