import { useGame } from "../../context/GameContext";
import { Compass, Network } from "lucide-react";

interface LocalMapProps {
  embedded?: boolean;
}

export default function LocalMap({ embedded = false }: LocalMapProps) {
  const { gameState } = useGame();

  const storyName = (gameState?.world as any)?.storyName;
  const worldName = gameState?.world?.name || "Zombie Apocalypse";
  const currentLocation = gameState?.world?.currentLocation || "";

  // Set maps dynamically from the active game state, falling back to world standards if empty
  let locations: string[] = gameState?.world?.locations || ["Store", "Hospital", "High School", "Highway", "Bridge"];
  
  let title = storyName ? `${storyName.toUpperCase()} MAP` : "SECTOR 4 MAP";
  let mapTheme = "text-violet-400"; // Zombie is violet

  if (worldName === "Pirate Ocean") {
    title = storyName ? `${storyName.toUpperCase()} MAP` : "BLACK REEF NAVIGATION";
    mapTheme = "text-blue-400";
    if (!gameState?.world?.locations) {
      locations = ["Ship Deck", "Smuggler's Cave", "Port Royal Tavern", "Skeleton Island", "Kraken's Abyss"];
    }
  } else if (worldName === "Magic Academy") {
    title = storyName ? `${storyName.toUpperCase()} MAP` : "ARCANE SPIRE MAP";
    mapTheme = "text-pink-400"; // Magic is pink
    if (!gameState?.world?.locations) {
      locations = ["Grand Library", "Arcane Courtyard", "Forbidden Vault", "Floating Spire", "Alchemist's Lab"];
    }
  }

  // Active state style classes dynamically styled per world
  let activeClass = "bg-black text-violet-400 border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.25)] font-semibold";
  if (worldName === "Pirate Ocean") {
    activeClass = "bg-black text-blue-400 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.25)] font-semibold";
  } else if (worldName === "Magic Academy") {
    activeClass = "bg-black text-pink-400 border-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.25)] font-semibold";
  }

  // Ensure current location matches a map node, using high-resilience fuzzy matching to handle AI narrative variations
  const isCurrent = (loc: string) => {
    if (!loc || !currentLocation) return false;
    const l = loc.toLowerCase().trim().replace(/['"“”]/g, "");
    const c = currentLocation.toLowerCase().trim().replace(/['"“”]/g, "");
    return l === c || l.includes(c) || c.includes(l);
  };

  const content = (
    <>
      {!embedded && (
        <div className="flex items-center gap-2 border-b border-[#333333] pb-2 mb-4">
          <Compass size={16} className={mapTheme} />
          <span className={`text-xs font-mono font-bold tracking-wider ${mapTheme}`}>
            {title}
          </span>
        </div>
      )}

      {/* Styled text-based nodes map matching screenshot */}
      <div className="flex-1 flex flex-col items-center justify-center font-mono text-[11px] text-gray-500 py-2">
        <div className="space-y-2 text-center w-full">
          {/* Top Branch */}
          <div className="flex justify-around items-center px-4">
            <div className={`p-1.5 rounded border transition-all ${isCurrent(locations[1]) ? activeClass : "border-[#333333] text-gray-400"}`}>
              {locations[1]} {isCurrent(locations[1]) && " [X]"}
            </div>
            <div className="text-gray-700">---</div>
            <div className={`p-1.5 rounded border transition-all ${isCurrent(locations[2]) ? activeClass : "border-[#333333] text-gray-400"}`}>
              {locations[2]} {isCurrent(locations[2]) && " [X]"}
            </div>
          </div>

          {/* Links to Center */}
          <div className="flex justify-around text-gray-700 text-[10px] h-3">
            <span>|</span>
            <span>|</span>
          </div>

          {/* Central Active Node */}
          <div className="flex justify-center">
            <div className={`p-1.5 px-3 rounded border transition-all ${isCurrent(locations[0]) ? activeClass : "border-[#333333] text-gray-400"}`}>
              {locations[0]} {isCurrent(locations[0]) && " [X]"}
            </div>
          </div>

          {/* Link down */}
          <div className="flex justify-center text-gray-700 text-[10px] h-3">
            <span>|</span>
          </div>

          {/* Bottom Branch */}
          <div className="flex flex-col items-center gap-1.5">
            <div className="text-gray-700">---------------------------</div>
            <div className={`p-1.5 rounded border transition-all ${isCurrent(locations[3]) ? activeClass : "border-[#333333] text-gray-400"}`}>
              {locations[3]} {isCurrent(locations[3]) && " [X]"}
            </div>
            <div className="text-gray-700">|</div>
            <div className={`p-1.5 rounded border transition-all ${isCurrent(locations[4]) ? activeClass : "border-[#333333] text-gray-400"}`}>
              {locations[4]} {isCurrent(locations[4]) && " [X]"}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-[#2a2a2a] flex items-center justify-between text-[10px] font-mono text-gray-500">
        <div className="flex items-center gap-1">
          <Network size={10} />
          <span>CONNECTED NODES</span>
        </div>
        <span>ACTIVE: {currentLocation}</span>
      </div>
    </>
  );

  if (embedded) {
    return <div className="flex flex-col h-full justify-between">{content}</div>;
  }

  return (
    <div className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-4 md:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex flex-col h-full justify-between">
      {content}
    </div>
  );
}
