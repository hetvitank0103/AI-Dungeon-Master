import { useGame } from "../context/GameContext";
import { useAudio } from "../context/AudioContext";
import { motion } from "motion/react";
import Button from "../components/ui/Button";
import { Compass, Play, RotateCcw, Settings, Terminal } from "lucide-react";

interface HomeProps {
  onNavigate: (screen: "home" | "create" | "continue" | "settings" | "game") => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const { savedGames } = useGame();
  const { playSfx } = useAudio();

  const handleBtnClick = (screen: "home" | "create" | "continue" | "settings" | "game") => {
    playSfx("click");
    onNavigate(screen);
  };

  return (
    <div className="flex-1 min-h-[90vh] flex flex-col items-center justify-center p-6 text-center select-none relative w-full">
      {/* Visual background atmospheric elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(249,115,22,0.06)_0%,_transparent_65%)] pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-stretch justify-center gap-8 max-w-5xl w-full relative">
        {/* Left Column: Menu */}
        <div className="border border-[#333333] p-10 md:p-12 rounded-2xl bg-[#121212]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex-1 relative flex flex-col justify-between">
          <div>
            {/* Neon orange tech corner brackets */}
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#F97316] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#F97316] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#F97316] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#F97316] rounded-br-lg" />

            <div className="flex justify-center mb-4">
              <Terminal size={32} className="text-[#F97316] animate-pulse" />
            </div>

            <h1 className="text-3xl font-serif font-black tracking-widest text-[#F97316] mb-2 drop-shadow-[0_0_15px_rgba(249,115,22,0.35)]">
              [ AI DUNGEON MASTER ]
            </h1>
            <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-10">
              - An Infinite Adventure Awaits -
            </p>

            {/* Buttons Menu */}
            <div className="space-y-4 max-w-xs mx-auto">
              <Button
                variant="primary-orange"
                size="lg"
                className="w-full flex justify-start pl-8 gap-3 py-3"
                onClick={() => handleBtnClick("create")}
              >
                <Play size={16} className="text-black fill-black" />
                <span>NEW GAME</span>
              </Button>

              <Button
                variant="secondary-yellow"
                size="lg"
                disabled={savedGames.length === 0}
                className={`w-full flex justify-start pl-8 gap-3 py-3 ${savedGames.length === 0 ? "opacity-30 cursor-not-allowed" : ""}`}
                onClick={() => handleBtnClick("continue")}
              >
                <RotateCcw size={16} />
                <span>CONTINUE</span>
              </Button>

              <Button
                variant="secondary-yellow"
                size="lg"
                className="w-full flex justify-start pl-8 gap-3 py-3"
                onClick={() => handleBtnClick("settings")}
              >
                <Settings size={16} />
                <span>SETTINGS</span>
              </Button>
            </div>
          </div>

          <div className="mt-12 text-[10px] font-mono text-gray-600 flex items-center justify-between border-t border-[#222222] pt-4">
            <span>AI DM SYSTEMS ONLINE</span>
            <span>v1.0.0 (Hackathon)</span>
          </div>
        </div>

        {/* Right Column: Rules of the Realm */}
        <div className="border border-[#333333] p-10 md:p-12 rounded-2xl bg-[#121212]/95 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex-1 relative flex flex-col justify-between">
          <div>
            <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-[#F97316] rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-[#F97316] rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-[#F97316] rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-[#F97316] rounded-br-lg" />

            <div className="flex justify-center mb-4">
              <Compass size={32} className="text-[#F97316] animate-pulse" />
            </div>

            <h2 className="text-3xl font-serif font-black tracking-widest text-[#F97316] mb-2 drop-shadow-[0_0_15px_rgba(249,115,22,0.35)] uppercase">
              [ Rules of the Realm ]
            </h2>
            <p className="text-xs text-gray-500 font-mono tracking-widest uppercase mb-10">
              - Read Carefully Before Venturing -
            </p>

            <div className="space-y-4 text-left font-sans text-xs text-gray-300 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              <div>
                <h3 className="font-mono text-[#F97316] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>01.</span> Infinite Agency
                </h3>
                <p className="text-gray-400 font-serif leading-relaxed">
                  Type any action you can imagine. The AI Dungeon Master dynamically responds to your choices, resolving them with logical, humorous, or epic consequences.
                </p>
              </div>

              <div>
                <h3 className="font-mono text-[#F97316] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>02.</span> Stats & Hazards
                </h3>
                <p className="text-gray-400 font-serif leading-relaxed">
                  Keep a constant eye on your Health and Mana. Dangerous or foolhardy actions will deplete your vitality. If your Health drops to zero, your adventure is over.
                </p>
              </div>

              <div>
                <h3 className="font-mono text-[#F97316] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>03.</span> Inventory Management
                </h3>
                <p className="text-gray-400 font-serif leading-relaxed">
                  Gather materials, food, weapons, and rare relics. Use them strategically by typing commands referencing your items (e.g., "consume canned meat" or "slash with rusted cutlass").
                </p>
              </div>

              <div>
                <h3 className="font-mono text-[#F97316] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>04.</span> Adapting Scenery
                </h3>
                <p className="text-gray-400 font-serif leading-relaxed">
                  The AI automatically envisions your surroundings. Real-time background illustrations and custom dark ambient music adapt to represent your specific narrative location.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 text-[10px] font-mono text-gray-600 flex items-center justify-between border-t border-[#222222] pt-4">
            <span>SURVIVAL RATE: 34%</span>
            <span>GOOD LUCK, ADVENTURER</span>
          </div>
        </div>
      </div>
    </div>
  );
}
