import express, { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { JsonStore } from "./server/db/jsonStore";
import { askDungeonMaster } from "./server/services/llmService";
import { GameState } from "./src/types";

// Load worlds knowledge directly
const WORLDS_PATH = path.join(process.cwd(), "server", "knowledge", "worlds.json");
let worldsData: any = {};
if (fs.existsSync(WORLDS_PATH)) {
  worldsData = JSON.parse(fs.readFileSync(WORLDS_PATH, "utf-8")).worlds;
} else {
  // Safe default fallback
  worldsData = {
    "Zombie Apocalypse": {
      name: "Zombie Apocalypse",
      tagline: "Survive the infected wasteland of Sector 4",
      glowColor: "violet",
      worldRules: "Survival horror, scarcity, zombies, makeshift weapons, dark and decaying urban center.",
      locations: ["Store", "Hospital", "High School", "Highway", "Bridge"],
      startingInventory: [{ name: "Crowbar", type: "weapon", quantity: 1 }]
    }
  };
}

const storyDetails: Record<string, {
  rules: string;
  locations: string[];
  quest: { title: string; description: string; reward: string };
  background: string;
  startingInventory: { name: string; type: string; quantity: number }[];
}> = {
  "Train to Busan": {
    rules: "Survival horror, speeding KTX train from Seoul to Busan, super-fast aggressive infected zombies, barricading doors, protecting fellow passengers, finding weapons in train carriages, dark intense horror.",
    locations: ["Train Compartment", "Daejeon Station", "Locked Vestibule", "Engine Room", "Busan Safe Zone"],
    quest: { title: "Survive to Busan", description: "Make your way through infected carriages of the speeding train to reach the safe engine room and escape to Busan.", reward: "500 Gold" },
    background: "Inside a speeding high-tech train compartment, blood splatters, shattered glass, frantic passengers, hyper-fast zombies scratching at the glass doors, dramatic horror cinematic digital art",
    startingInventory: [
      { name: "Baseball Bat", type: "weapon", quantity: 1 },
      { name: "Duct Tape", type: "utility", quantity: 1 },
      { name: "Water Bottle", type: "food", quantity: 1 }
    ]
  },
  "World War Z": {
    rules: "Global scale pandemic, massive swarms of millions of fast-climbing undead forming piles/pyramids, militaristic action, traveling around the world to find clues about patient zero.",
    locations: ["Philadelphia Streets", "Jerusalem Wall", "WHO Laboratory", "Plane Cabin", "Refugee Camp"],
    quest: { title: "Find Patient Zero", description: "Locate scientific clues about the origin of the swarm while defending fortified walls and finding a vaccine.", reward: "600 Gold" },
    background: "A towering concrete border wall under attack by a massive wave of climbing zombies piling up like ants, black smoke rising, military helicopters in sky, photorealistic post-apocalyptic cinematic painting",
    startingInventory: [
      { name: "Tactical Pistol", type: "weapon", quantity: 1 },
      { name: "Satellite Phone", type: "utility", quantity: 1 },
      { name: "WHO Vaccine Sample", type: "potion", quantity: 1 }
    ]
  },
  "28 Days Later": {
    rules: "Bleak atmospheric post-apocalyptic British horror, rage virus infected sprinters, quiet desolate urban centers, survival dread, scarce ammo.",
    locations: ["London Hospital", "Piccadilly Circus", "Mansion Blockade", "Rainy Outpost", "Radio Tower"],
    quest: { title: "Escape Empty London", description: "Survive the deserted streets of London and trace the military radio broadcast to a safe outpost.", reward: "500 Gold" },
    background: "An eerie, completely abandoned Westminster Bridge in London under a heavy bleak overcast sky, red double-decker bus crashed, quiet survival dread mood, detailed digital oil painting",
    startingInventory: [
      { name: "Machete", type: "weapon", quantity: 1 },
      { name: "Emergency Flares", type: "utility", quantity: 3 }
    ]
  },
  "Army of the Dead": {
    rules: "Heist action, walled-off zombie-infested Las Vegas, smart intelligent Alpha zombies with a king and queen, timed nuclear strike countdown, mercenary operations, safe cracking.",
    locations: ["Quarantine Wall", "Siegfried Casino", "Vault Room", "Subway Grid", "Rooftop Helipad"],
    quest: { title: "The Bly Casino Heist", description: "Infiltrate walled-off Las Vegas, bypass the Alpha zombies, and crack the high-tech casino vault before the tactical strike.", reward: "1000 Gold" },
    background: "Ruined post-apocalyptic Las Vegas strip under a burning orange desert sun, crumbling neon signs, massive barricades, alpha zombie tiger patrolling, cinematic heist action illustration",
    startingInventory: [
      { name: "Assault Rifle", type: "weapon", quantity: 1 },
      { name: "Lockpicks", type: "utility", quantity: 1 },
      { name: "Las Vegas Map", type: "utility", quantity: 1 }
    ]
  },
  "Harry Potter": {
    rules: "Gothic and whimsical British wizards, spellcraft, wands, Ravenclaw, Slytherin, Gryffindor, Hufflepuff, secrets, Defense Against the Dark Arts, magical creatures.",
    locations: ["Great Hall", "Forbidden Forest", "Chamber of Secrets", "Dumbledore's Office", "Lake Shore"],
    quest: { title: "Uncover the Chamber Secret", description: "Investigate a series of rogue spell events and find the hidden chamber before the school is closed.", reward: "500 Gold" },
    background: "The grand gothic dining hall of a majestic castle with hundreds of floating candles, enchanted starry sky ceiling, glowing magical shields, high-fantasy digital art",
    startingInventory: [
      { name: "Phoenix Wand", type: "weapon", quantity: 1 },
      { name: "Chocolate Frog", type: "food", quantity: 2 },
      { name: "Marauder's Map", type: "utility", quantity: 1 }
    ]
  },
  "Now You See Me": {
    rules: "Modern street magic, grand stage illusions, sleight of hand, mentalism, heist thrills, utilizing illusion props to rob corrupt figures while staying one step ahead of the FBI.",
    locations: ["Vegas Stage", "New York Bank Vault", "FBI Interrogation Room", "Secret Warehouse", "Pont Neuf Bridge"],
    quest: { title: "The Grand Illusion Heist", description: "Expose corporate corruption and execute staggering magic illusions while evading relentless federal agents.", reward: "600 Gold" },
    background: "A sleek modern theater stage with bright white spotlights, cards hovering in the air, glowing neon rings, slick modern thriller aesthetic",
    startingInventory: [
      { name: "Trick Playing Cards", type: "weapon", quantity: 1 },
      { name: "Smoke Pellets", type: "utility", quantity: 3 }
    ]
  },
  "The Prestige": {
    rules: "Victorian London era magician rivalry, obsessive stagecraft, gaslights, steampunk and Tesla electrical inventions, dark secrets, sacrificing everything for the perfect illusion.",
    locations: ["London Music Hall", "Tesla's Laboratory", "Backstage Workshop", "Water Tank Trap", "Secret Wardrobe"],
    quest: { title: "The Transported Man", description: "Perfect the ultimate teleportation trick using Tesla's electrical machinery and outwit your rival.", reward: "500 Gold" },
    background: "A dark late-Victorian laboratory illuminated by giant glowing Tesla coils throwing blue electric sparks, copper apparatus, gaslamps, moody historical sci-fi oil painting",
    startingInventory: [
      { name: "Tesla Coil Wand", type: "weapon", quantity: 1 },
      { name: "Rival's Diary", type: "utility", quantity: 1 }
    ]
  },
  "The Bureau of Magical Things": {
    rules: "Urban fantasy, elves, fairies, secret magical regulation bureau, field agents maintaining the masquerade, wild spell mishaps, keeping humans from discovering magic.",
    locations: ["Magical Library", "Hidden Realm Nexus", "Bureau Headquarters", "Enchanted Cafe", "Ancient Vault"],
    quest: { title: "Restore the Magic Nexus", description: "Investigate high-alert magical anomalies and keep the peace between elves, fairies, and humans.", reward: "500 Gold" },
    background: "A cozy secret library hidden behind a brick wall, glowing fairy dust floating, magical books flapping wings, whimsical and modern fantasy look",
    startingInventory: [
      { name: "Bureau Badge", type: "weapon", quantity: 1 },
      { name: "Pixie Dust Spray", type: "utility", quantity: 2 }
    ]
  },
  "Pirates of the Caribbean": {
    rules: "Treacherous cursed seas, Aztec gold skeletal curses, sea monsters, kraken, flintlocks, cutlasses, voodoo priestesses, pirate taverns, naval battles.",
    locations: ["Tortuga Tavern", "Port Royal Cell", "Isla de Muerta", "Black Pearl Deck", "Kraken's Abyss"],
    quest: { title: "Lift the Aztec Curse", description: "Track down the cursed gold coins and defeat the skeletal pirate captain to lift the undead curse.", reward: "700 Gold" },
    background: "A grand wooden galleon sailing through a glowing bioluminescent sea at night under a giant pirate flag, glowing spooky fog, atmospheric fantasy oil painting",
    startingInventory: [
      { name: "Navy Saber", type: "weapon", quantity: 1 },
      { name: "Unreliable Compass", type: "utility", quantity: 1 }
    ]
  },
  "The Black Swan": {
    rules: "Historical golden age of piracy, hunting treasure galleons, plundering silver fleets, naval broadsides, tropical hideouts, privateer honor.",
    locations: ["Tortuga Bay", "Spanish Galleon", "Maracaibo Fort", "Scurvy Reef", "Governor's Palace"],
    quest: { title: "Intercept the Silver Fleet", description: "Hunt down the Spanish treasure galleon carrying raw silver before they reach the high seas.", reward: "800 Gold" },
    background: "A tropical turquoise bay surrounded by beaches, pirate sloops anchored under a bright blue sky, warm pirate adventure digital painting",
    startingInventory: [
      { name: "Pirate Saber", type: "weapon", quantity: 1 },
      { name: "Flask of Rum", type: "food", quantity: 1 }
    ]
  },
  "Captain Blood": {
    rules: "Gentleman buccaneer, honor-bound tactical battles, medical surgeon skills, commanding a combined pirate fleet, raiding heavily fortified Spanish forts, high strategy.",
    locations: ["Port Royal Plantation", "Arabella Frigate", "Tortuga Port", "Sailing Line", "Cartagena Fort"],
    quest: { title: "Command the Pirate Fleet", description: "Formulate strategic naval maneuvers to rescue your captured allies and defend Tortuga.", reward: "800 Gold" },
    background: "Dozens of giant tall ships engaged in a roaring broadside cannon battle, thick gunpowder smoke, burning sails, cinematic historical oil painting",
    startingInventory: [
      { name: "Buccaneer Saber", type: "weapon", quantity: 1 },
      { name: "Surgical Kit", type: "utility", quantity: 1 }
    ]
  },
  "Hook": {
    rules: "Fanciful Neverland, lost boys, flying with pixie dust, clockwork hand hooks, tick-tock crocodiles, sword fighting Smee and Captain Hook, food fights.",
    locations: ["Neverwood Playground", "Jolly Roger Deck", "Mermaid Lagoon", "Captain's Cabin", "Crocodile Creek"],
    quest: { title: "Defeat Captain Hook", description: "Help Peter Pan find his lost memories, lead the Lost Boys, and face Hook in a grand final duel.", reward: "600 Gold" },
    background: "An immense pirate ship with deep purple sails anchored in a colorful Neverland lagoon, giant skull-shaped rock in distance, whimsical and rich fairy tale design",
    startingInventory: [
      { name: "Wooden Dagger", type: "weapon", quantity: 1 },
      { name: "Thimble Token", type: "utility", quantity: 1 },
      { name: "Bag of Pixie Dust", type: "potion", quantity: 1 }
    ]
  }
};

const gameStore = new JsonStore<GameState>("games");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Get all selectable worlds
  app.get("/api/worlds", (req: Request, res: Response) => {
    res.json({ worlds: Object.values(worldsData) });
  });

  // API: List saved games
  app.get("/api/games", (req: Request, res: Response) => {
    const list = gameStore.find().map(g => ({
      id: g.id,
      player: g.player,
      world: g.world,
      gameStatus: g.gameStatus,
    }));
    res.json({ games: list });
  });

  // API: Create new game
  app.post("/api/new-game", async (req: Request, res: Response) => {
    const { name, className, difficulty, worldName, storyName, diceRoll } = req.body;
    if (!name || !className || !difficulty || !worldName) {
      res.status(400).json({ error: "Missing required character parameters." });
      return;
    }

    const world = worldsData[worldName];
    if (!world) {
      res.status(400).json({ error: "Selected world is invalid." });
      return;
    }

    const gameId = "game_" + Math.random().toString(36).substring(2, 11);
    
    // Determine starting stats with diceRoll modifier
    let startingHealth = 100;
    let startingMana = className.includes("Wizard") || className.includes("Scholar") || className.includes("Spellcaster") ? 100 : 50;
    let startingGold = 250;
    let customBonusItem: any = null;

    if (diceRoll !== undefined) {
      const rollNum = Number(diceRoll);
      if (rollNum === 20) {
        startingHealth = 100;
        startingMana = Math.min(startingMana + 20, 100);
        startingGold = 350; // Increased starting gold to reward the critical success instead of health > 100
        customBonusItem = { name: "D20 of Destiny", type: "artifact", quantity: 1 };
      } else if (rollNum === 1) {
        startingHealth = 90;
        startingGold = 350; // Pity gold
        customBonusItem = { name: "Cursed D20 of the Demogorgon", type: "cursed", quantity: 1 };
      } else if (rollNum >= 15) {
        startingHealth = 100;
        startingMana = Math.min(startingMana + 10, 100);
        startingGold = 275;
      } else if (rollNum >= 10) {
        startingHealth = 100;
        startingMana = Math.min(startingMana + 5, 100);
      }
    }

    // Determine values with predefined story override if active
    let locations = world.locations;
    let startLocation = world.locations[0];
    let startingInventory = JSON.parse(JSON.stringify(world.startingInventory));
    let questTitle = worldName === "Zombie Apocalypse" ? "Escape Sector 4" : worldName === "Pirate Ocean" ? "Retrieve the Golden Skull" : "Uncover the Spire Arcana";
    let questDesc = worldName === "Zombie Apocalypse" ? "Navigate Sector 4 and find a safe extraction route." : worldName === "Pirate Ocean" ? "Defeat the ghost captain and claim the relic." : "Recover the stolen spell scrolls from the lower dungeons.";
    let questReward = "500 Gold";
    let bgScene = worldName === "Zombie Apocalypse" 
      ? "A desolate overgrown street with abandoned cars, decaying buildings, toxic violet mist, zombie apocalypse, dark fantasy art" 
      : worldName === "Pirate Ocean" 
      ? "A massive wooden pirate ship deck during a violent thunderstorm, heavy dark blue waves, lightning strikes, cinematic fantasy oil painting" 
      : "An ancient grand wizard library with towering bookshelves, floating glowing books, mystical purple dust, high fantasy digital art";

    const storyActive = storyName && storyDetails[storyName];
    if (storyActive) {
      const details = storyDetails[storyName];
      locations = details.locations;
      startLocation = details.locations[0];
      startingInventory = JSON.parse(JSON.stringify(details.startingInventory));
      questTitle = details.quest.title;
      questDesc = details.quest.description;
      questReward = details.quest.reward;
      bgScene = details.background;
    }

    if (customBonusItem) {
      startingInventory.push(customBonusItem);
    }

    // Initial State Structure conforming to GameState
    const initialState: GameState = {
      id: gameId,
      player: {
        name,
        class: className,
        health: startingHealth,
        mana: startingMana,
        gold: startingGold,
        level: 1,
        experience: 0,
      },
      world: {
        name: worldName,
        difficulty,
        currentLocation: startLocation,
        locations: locations,
        ...(storyActive ? { storyName } : {})
      } as any,
      story: {
        currentText: "Generating introduction...",
        history: [],
      },
      inventory: startingInventory,
      quest: {
        title: questTitle,
        description: questDesc,
        reward: questReward,
        status: "active",
      },
      scene: {
        type: "exploration",
        location: startLocation,
        background: bgScene,
        music: worldName === "Zombie Apocalypse" ? "zombie.mp3" : worldName === "Pirate Ocean" ? "pirate.mp3" : "magic.mp3",
      },
      choices: ["Look around", "Check equipment", "Advance carefully", "Call out for survivors"],
      gameStatus: {
        gameOver: false,
        victory: false,
        saveTime: new Date().toISOString(),
      },
    };

    // Prompt DM to write an elegant introduction story
    let activeWorldRules = world.worldRules;
    let introPrompt = `Introduce the character ${name}, who is a ${className} starting their quest at the "${startLocation}" in "${worldName}" under the level "${difficulty}". Describe the immediate surrounding terrain and establish a tense, atmospheric introduction. Keep it under 120 words. No choices or summary, just the opening story.`;

    if (storyActive) {
      const details = storyDetails[storyName];
      activeWorldRules = details.rules;
      introPrompt = `Introduce the character ${name}, who is a ${className} embarking on the campaign of "${storyName}" (Genre: ${worldName}) starting their quest at "${startLocation}" under "${difficulty}" difficulty. Set up the atmospheric environment of "${storyName}" (incorporate its specific themes, lore, and characters). Keep the opening description under 120 words, exciting, readable, and highly thematic.`;
    }
    
    try {
      const dmIntroResponse = await askDungeonMaster(initialState, "Enter the World", activeWorldRules);
      initialState.story.currentText = dmIntroResponse.story;
      initialState.story.history.push(dmIntroResponse.story);
      
      // Update with any fields suggested by AI in the initial spin
      initialState.choices = dmIntroResponse.choices || initialState.choices;
      initialState.scene = dmIntroResponse.scene || initialState.scene;
      
      // Ensure the music matches the world selection
      initialState.scene.music = worldName === "Zombie Apocalypse" ? "zombie.mp3" : worldName === "Pirate Ocean" ? "pirate.mp3" : "magic.mp3";
    } catch (err: any) {
      console.warn("AI introductory response notice, utilizing fallback intro text:", err?.message || err);
      const fallbackIntro = `You stand at the ${startLocation} in the campaign of ${storyName || worldName}. A heavy wind blows, whistling of deep secrets, battles, and legendary exploits that lie ahead. Your path has begun.`;
      initialState.story.currentText = fallbackIntro;
      initialState.story.history.push(fallbackIntro);
    }

    gameStore.save(initialState);
    res.json({ game: initialState });
  });

  // API: Player RPG custom action input
  app.post("/api/action", async (req: Request, res: Response) => {
    const { gameId, action } = req.body;
    if (!gameId || !action) {
      res.status(400).json({ error: "Missing gameId or player action." });
      return;
    }

    const state = gameStore.findById(gameId);
    if (!state) {
      res.status(404).json({ error: "Saved game state not found." });
      return;
    }

    if (state.gameStatus.gameOver) {
      res.status(400).json({ error: "This game is over. Create a new adventure!" });
      return;
    }

    const world = worldsData[state.world.name];
    let worldRules = world ? world.worldRules : "Standard fantasy rules apply.";

    const savedStoryName = (state.world as any).storyName;
    if (savedStoryName && storyDetails[savedStoryName]) {
      worldRules = storyDetails[savedStoryName].rules;
    }

    let resolvedAction = action;
    const choices = state.choices || [];
    let matchType: "right" | "similar" | "wrong" = "wrong";

    if (choices.length > 0) {
      const typedLower = action.toLowerCase().trim();
      let bestMatch: string | null = null;
      let highestSimilarity = 0;

      // 1. Check for perfect exact match
      const exactMatch = choices.find(choice => choice.toLowerCase().trim() === typedLower);
      if (exactMatch) {
        matchType = "right";
        resolvedAction = exactMatch;
        console.log(`[Perfect Match] Resolved action to correct option: "${resolvedAction}"`);
      } else {
        // 2. Check for similar/fuzzy matches
        for (const choice of choices) {
          const choiceLower = choice.toLowerCase().trim();

          // Substring match
          if (choiceLower.includes(typedLower) || typedLower.includes(choiceLower)) {
            bestMatch = choice;
            matchType = "similar";
            break;
          }

          // Tokenized word matching
          const typedTokens = typedLower.split(/[^a-z0-9]+/).filter(t => t.length > 1);
          const choiceTokens = choiceLower.split(/[^a-z0-9]+/).filter(t => t.length > 1);
          
          let sharedTokens = 0;
          for (const tt of typedTokens) {
            if (choiceLower.includes(tt)) {
              sharedTokens++;
            } else {
              for (const ct of choiceTokens) {
                if (ct.includes(tt) || tt.includes(ct)) {
                  sharedTokens++;
                  break;
                }
              }
            }
          }

          if (typedTokens.length > 0 && sharedTokens > 0) {
            const similarity = sharedTokens / Math.max(typedTokens.length, 1);
            if (similarity > highestSimilarity) {
              highestSimilarity = similarity;
              bestMatch = choice;
              matchType = "similar";
            }
          }

          // 3. 2-character LCS fuzzy overlap (extremely permissive for "1% similar" or typos)
          if (!bestMatch) {
            let lcs = 0;
            for (let i = 0; i < typedLower.length; i++) {
              for (let j = i + 2; j <= typedLower.length; j++) {
                const sub = typedLower.substring(i, j);
                if (choiceLower.includes(sub) && sub.length > lcs) {
                  lcs = sub.length;
                }
              }
            }
            if (lcs >= 2) {
              bestMatch = choice;
              matchType = "similar";
            }
          }
        }

        if (bestMatch) {
          resolvedAction = bestMatch;
          console.log(`[Similar Match] Resolved typed action "${action}" to choice option: "${resolvedAction}"`);
        } else {
          matchType = "wrong";
          console.log(`[No Match] Custom typed action "${action}" evaluated as wrong answer.`);
        }
      }
    } else {
      matchType = "wrong";
    }

    const prevHealth = state.player.health;
    const prevMana = state.player.mana;
    const prevGold = state.player.gold;

    try {
      const dmResponse = await askDungeonMaster(state, resolvedAction, worldRules, matchType);

      // Mutate and advance state
      state.story.currentText = dmResponse.story;
      state.story.history.push(`Action: ${resolvedAction}`);
      state.story.history.push(dmResponse.story);

      let finalHealth = Math.max(0, Math.min(100, dmResponse.player.health));
      let finalMana = Math.max(0, Math.min(100, dmResponse.player.mana));
      let finalGold = Math.max(0, dmResponse.player.gold);

      if (matchType === "right") {
        finalHealth = Math.min(100, prevHealth + 20); // +1 heart = +20 Health
        finalMana = Math.min(100, prevMana + 5);      // +5 Mana
        finalGold = prevGold + 50;                     // +50 Gold
      } else if (matchType === "similar") {
        finalHealth = prevHealth;                     // +0 heart (remains previous)
        finalMana = Math.min(100, prevMana + 2);      // +2 Mana
        finalGold = prevGold + 20;                     // +20 Gold
      }

      state.player.health = finalHealth;
      state.player.mana = finalMana;
      state.player.gold = finalGold;
      state.player.level = dmResponse.player.level || state.player.level;
      state.player.experience = dmResponse.player.experience;

      // Handle level up
      if (state.player.experience >= 100) {
        state.player.level += 1;
        state.player.experience = state.player.experience % 100;
        state.story.currentText += " **LEVEL UP! You feel newfound strength flowing inside your veins!**";
        state.player.health = 100; // Full restore on level up
        state.player.mana = 100;   // Full restore on level up
      }

      state.inventory = dmResponse.inventory;
      state.quest = dmResponse.quest;
      state.npc = dmResponse.npc;
      state.enemy = dmResponse.enemy;
      state.choices = dmResponse.choices;

      state.world.currentLocation = dmResponse.scene.location;
      state.scene = {
        type: dmResponse.scene.type,
        location: dmResponse.scene.location,
        background: dmResponse.scene.background || state.scene.background,
        music: dmResponse.scene.music || state.scene.music,
      };

      state.randomEvent = dmResponse.randomEvent;
      state.gameStatus = {
        gameOver: dmResponse.game.gameOver || state.player.health <= 0,
        victory: dmResponse.game.victory,
        saveTime: new Date().toISOString(),
      };

      gameStore.save(state);
      res.json({ game: state });
    } catch (err: any) {
      console.warn("Dungeon Master Action notice:", err?.message || err);
      res.status(500).json({ error: "AI Dungeon Master failed to formulate a response." });
    }
  });

  // API: Get specific game progress
  app.get("/api/games/:id", (req: Request, res: Response) => {
    const game = gameStore.findById(req.params.id);
    if (!game) {
      res.status(404).json({ error: "Game session not found." });
    } else {
      res.json({ game });
    }
  });

  // API: Explicit Save/Sync Game State
  app.post("/api/save", (req: Request, res: Response) => {
    const { game } = req.body;
    if (!game || !game.id) {
      res.status(400).json({ error: "Missing game state payload to save." });
      return;
    }
    game.gameStatus.saveTime = new Date().toISOString();
    gameStore.save(game);
    res.json({ success: true, game });
  });

  // API: Delete a game save
  app.delete("/api/games/:id", (req: Request, res: Response) => {
    const success = gameStore.delete(req.params.id);
    res.json({ success });
  });

  // Mount Vite or static assets depending on environment
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT} (Ingress Active)`);
  });
}

startServer();
