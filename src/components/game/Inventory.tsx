import { useGame } from "../../context/GameContext";
import { Package, ShieldAlert, Zap, Utensils, Wrench } from "lucide-react";

interface InventoryProps {
  embedded?: boolean;
}

export default function Inventory({ embedded = false }: InventoryProps) {
  const { gameState } = useGame();
  const inventory = gameState?.inventory || [];

  const worldName = gameState?.world?.name || "Zombie Apocalypse";

  let themeHex = "#8B5CF6"; // Default Zombie Apocalypse (Violet)

  if (worldName === "Pirate Ocean") {
    themeHex = "#3B82F6"; // Blue
  } else if (worldName === "Magic Academy") {
    themeHex = "#EC4899"; // Pink
  }

  const getItemIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "weapon":
        return <ShieldAlert size={14} className="text-red-400" />;
      case "potion":
        return <Zap size={14} style={{ color: themeHex }} />;
      case "food":
        return <Utensils size={14} className="text-amber-400" />;
      default:
        return <Wrench size={14} className="text-blue-400" />;
    }
  };

  const content = (
    <>
      {!embedded && (
        <div className="flex items-center gap-2 border-b border-[#333333] pb-2 mb-4">
          <Package size={16} style={{ color: themeHex }} />
          <span className="text-xs font-mono font-bold tracking-wider" style={{ color: themeHex }}>
            INVENTORY PACK
          </span>
        </div>
      )}

      <div className="flex-1 space-y-2 overflow-y-auto max-h-[160px] md:max-h-[220px] pr-1">
        {inventory.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center text-center">
            <span className="text-xs text-gray-600 font-mono italic">
              Your inventory is empty.
            </span>
          </div>
        ) : (
          inventory.map((item, idx) => {
            const isEquipped = idx === 0 && item.type === "weapon"; // auto equip first weapon for visuals
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg border text-xs font-mono transition-all"
                style={isEquipped ? {
                  backgroundColor: `${themeHex}1a`,
                  borderColor: `${themeHex}66`,
                  color: themeHex
                } : {
                  backgroundColor: "#121212",
                  borderColor: "#333333",
                  color: "#d1d5db"
                }}
              >
                <div className="flex items-center gap-2">
                  {getItemIcon(item.type)}
                  <span className="font-semibold">{item.name}</span>
                  {isEquipped && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded border uppercase tracking-widest font-bold" style={{ backgroundColor: `${themeHex}26`, color: themeHex, borderColor: `${themeHex}4d` }}>
                      Equipped
                    </span>
                  )}
                </div>
                <div className="text-[10px] bg-black px-2 py-0.5 rounded border border-gray-800 text-gray-400 font-bold">
                  QTY: {item.quantity}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-[#2a2a2a] flex items-center justify-between text-[10px] font-mono text-gray-500">
        <span>SLOTS: {inventory.length} / 12</span>
        <span>LOADOUT STABLE</span>
      </div>
    </>
  );

  if (embedded) {
    return <div className="flex flex-col justify-between h-full">{content}</div>;
  }

  return (
    <div className="bg-[#1E1E1E] border border-[#333333] rounded-xl p-4 md:p-5 shadow-[0_10px_30px_rgba(0,0,0,0.35)] flex flex-col justify-between h-full">
      {content}
    </div>
  );
}
