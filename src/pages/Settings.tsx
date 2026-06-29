import React from "react";
import { useGame } from "../context/GameContext";
import { useAudio } from "../context/AudioContext";
import Button from "../components/ui/Button";
import { ArrowLeft, Volume2, Flame, Palette, RotateCcw } from "lucide-react";

interface SettingsProps {
  onNavigate: (screen: "home" | "create" | "continue" | "settings" | "game") => void;
}

export default function SettingsPage({ onNavigate }: SettingsProps) {
  const { settings, updateSettings } = useGame();
  const { playSfx } = useAudio();

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    updateSettings({ masterVolume: vol });
  };

  const handleSpeedChange = (speed: "normal" | "instant") => {
    playSfx("click");
    updateSettings({ textSpeed: speed });
  };

  const handleStyleChange = (style: "oil" | "pixel" | "sketch") => {
    playSfx("click");
    updateSettings({ artworkStyle: style });
  };

  return (
    <div className="flex-1 max-w-2xl mx-auto p-4 md:p-8 select-none">
      {/* Back Header */}
      <div className="flex items-center justify-between mb-8 border-b border-[#333333] pb-4">
        <button
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 text-xs font-mono text-gray-400 hover:text-white focus:outline-none cursor-pointer transition-all"
        >
          <ArrowLeft size={14} />
          <span>BACK TO MENU</span>
        </button>
        <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">
          GAME OPTIONS
        </span>
      </div>

      <div className="bg-[#1E1E1E] border border-[#333333] rounded-2xl p-6 md:p-10 shadow-2xl relative">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#EAB308] rounded-tl-md" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#EAB308] rounded-br-md" />

        <h2 className="text-xl font-serif font-black tracking-widest text-center text-[#EAB308] mb-8 border-b border-[#2a2a2a] pb-3 uppercase">
          [ GAME SETTINGS ]
        </h2>

        <div className="space-y-8">
          {/* Master Volume */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-gray-300 flex items-center gap-2">
                <Volume2 size={16} className="text-[#EAB308]" />
                <span>MASTER AUDIO</span>
              </span>
              <span className="text-sm font-mono font-bold text-[#EAB308]">
                {settings.masterVolume}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="100"
                value={settings.masterVolume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-[#121212] border border-[#333333] rounded-lg appearance-none cursor-pointer accent-[#EAB308] focus:outline-none"
              />
            </div>
          </div>

          {/* AI Text Speed */}
          <div className="space-y-3">
            <span className="text-sm font-mono text-gray-300 flex items-center gap-2">
              <Flame size={16} className="text-[#EAB308]" />
              <span>AI TEXT SPEED</span>
            </span>
            <div className="flex gap-4">
              <button
                onClick={() => handleSpeedChange("normal")}
                className={`flex-1 p-3 rounded-xl border text-xs font-mono focus:outline-none cursor-pointer transition-all ${
                  settings.textSpeed === "normal"
                    ? "bg-[#EAB308]/10 border-[#EAB308] text-[#EAB308] shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                    : "border-[#333333] bg-[#121212] text-gray-400 hover:border-[#EAB308]"
                }`}
              >
                {settings.textSpeed === "normal" ? "( • )" : "(   )"} Normal
              </button>
              <button
                onClick={() => handleSpeedChange("instant")}
                className={`flex-1 p-3 rounded-xl border text-xs font-mono focus:outline-none cursor-pointer transition-all ${
                  settings.textSpeed === "instant"
                    ? "bg-[#EAB308]/10 border-[#EAB308] text-[#EAB308] shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                    : "border-[#333333] bg-[#121212] text-gray-400 hover:border-[#EAB308]"
                }`}
              >
                {settings.textSpeed === "instant" ? "( • )" : "(   )"} Instant
              </button>
            </div>
          </div>

          {/* Artwork Style Selection */}
          <div className="space-y-3">
            <span className="text-sm font-mono text-gray-300 flex items-center gap-2">
              <Palette size={16} className="text-[#EAB308]" />
              <span>ARTWORK STYLE</span>
            </span>
            <div className="flex gap-4">
              {["oil", "pixel", "sketch"].map((style) => (
                <button
                  key={style}
                  onClick={() => handleStyleChange(style as any)}
                  className={`flex-1 p-3 rounded-xl border text-xs font-mono capitalize focus:outline-none cursor-pointer transition-all ${
                    settings.artworkStyle === style
                      ? "bg-[#EAB308]/10 border-[#EAB308] text-[#EAB308] shadow-[0_0_10px_rgba(234,179,8,0.15)]"
                      : "border-[#333333] bg-[#121212] text-gray-400 hover:border-[#EAB308]"
                  }`}
                >
                  [ {style === "oil" ? "Dark Fantasy Oil" : style} ]
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-12 flex justify-center border-t border-[#2a2a2a] pt-6">
          <Button
            variant="secondary-yellow"
            size="md"
            onClick={() => onNavigate("home")}
            className="flex items-center gap-2"
          >
            <RotateCcw size={14} />
            <span>RESUME GAME</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
