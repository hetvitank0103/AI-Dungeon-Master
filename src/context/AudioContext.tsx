import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { Howl } from "howler";

interface AudioContextType {
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentWorld: string;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  playWorldMusic: (worldName: string) => void;
  stopMusic: () => void;
  playSfx: (type: "click" | "sword" | "gold" | "potion" | "levelUp") => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [volume, setVolumeState] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWorld, setCurrentWorld] = useState("");

  const howlPlayers = useRef<{ [key: string]: Howl }>({});
  const synthInterval = useRef<NodeJS.Timeout | null>(null);
  const synthActive = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);

  useEffect(() => {
    isMutedRef.current = isMuted;
    volumeRef.current = volume;
  }, [isMuted, volume]);

  useEffect(() => {
    const unlockAudio = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        void audioCtxRef.current.resume().catch(() => undefined);
      }
    };

    window.addEventListener("click", unlockAudio, { once: true });
    return () => {
      window.removeEventListener("click", unlockAudio);
    };
  }, []);

  // Initialize howler players for the 3 worlds
  useEffect(() => {
    howlPlayers.current = {
      "Zombie Apocalypse": new Howl({
        src: ["/assets/audio/zombie.mp3"],
        loop: true,
        html5: true,
        volume: volume,
        onloaderror: () => console.warn("Zombie MP3 not found. Synthesizer fallback activated."),
      }),
      "Pirate Ocean": new Howl({
        src: ["/assets/audio/pirate.mp3"],
        loop: true,
        html5: true,
        volume: volume,
        onloaderror: () => console.warn("Pirate MP3 not found. Synthesizer fallback activated."),
      }),
      "Magic Academy": new Howl({
        src: ["/assets/audio/magic.mp3"],
        loop: true,
        html5: true,
        volume: volume,
        onloaderror: () => console.warn("Magic MP3 not found. Synthesizer fallback activated."),
      }),
    };

    return () => {
      // Clean up Howler
      Object.values(howlPlayers.current).forEach((player: any) => player.unload());
      stopSynth();
    };
  }, []);

  // Sync volume with players and synthesizer
  useEffect(() => {
    const activeVolume = isMuted ? 0 : volume;
    Object.values(howlPlayers.current).forEach((player: any) => {
      player.volume(activeVolume);
    });
    if (masterGainRef.current && audioCtxRef.current) {
      try {
        masterGainRef.current.gain.setValueAtTime(activeVolume * 0.15, audioCtxRef.current.currentTime);
      } catch (e) {
        // safe guard
      }
    }
  }, [volume, isMuted]);

  const setVolume = (v: number) => {
    setVolumeState(v);
  };

  const toggleMute = () => {
    setIsMuted((prev: boolean) => !prev);
  };

  const stopMusic = () => {
    Object.values(howlPlayers.current).forEach((player: any) => player.stop());
    stopSynth();
    setIsPlaying(false);
  };

  const playWorldMusic = (worldName: string) => {
    stopMusic();
    setCurrentWorld(worldName);
    setIsPlaying(true);

    const player = howlPlayers.current[worldName];
    if (player) {
      // Howler has a 1-second fade in
      const targetVol = isMuted ? 0 : volume;
      player.volume(0);
      player.play();
      player.fade(0, targetVol, 1500);

      // We also start a beautiful backing synth drone. If the physical MP3 is missing,
      // the synth drone alone provides a gorgeous, professional atmospheric sound system!
      startSynth(worldName);
    }
  };

  const getAudioContext = () => {
    if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
      return audioCtxRef.current;
    }

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return null;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;
    return ctx;
  };

  // Beautiful Web Audio Synthesizer to guarantee dark fantasy RPG immersion!
  const startSynth = (world: string) => {
    stopSynth();
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => undefined);
      }

      synthActive.current = true;

      // Create a master gain node
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(isMutedRef.current ? 0 : volumeRef.current * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);
      masterGainRef.current = masterGain;

      let baseFreq = 110; // A2 for pirate
      if (world === "Zombie Apocalypse") {
        baseFreq = 82.41; // E2 (low dark drone)
      } else if (world === "Magic Academy") {
        baseFreq = 130.81; // C3 (mystical chord drone)
      }

      // 1. Base drone oscillator (low sawtooth/triangle filtered)
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();

      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(baseFreq * 1.5, ctx.currentTime); // Perfect fifth

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(world === "Magic Academy" ? 600 : 300, ctx.currentTime);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.6, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(masterGain);

      osc1.start();
      osc2.start();

      // Slow ambient filter modulation to simulate wind/fog
      let direction = 1;
      let filterFreq = 300;
      synthInterval.current = setInterval(() => {
        if (!synthActive.current || !ctx || ctx.state === "closed") return;
        masterGain.gain.setValueAtTime(isMutedRef.current ? 0 : volumeRef.current * 0.1, ctx.currentTime);

        filterFreq += direction * 8;
        if (filterFreq > 550) direction = -1;
        if (filterFreq < 200) direction = 1;
        
        try {
          filter.frequency.linearRampToValueAtTime(filterFreq, ctx.currentTime + 1.5);
        } catch (e) {
          // safe guard
        }
      }, 1500);

    } catch (e) {
      console.warn("Web Audio API Synthesizer failed to start:", e);
    }
  };

  const stopSynth = () => {
    synthActive.current = false;
    masterGainRef.current = null;
    if (synthInterval.current) {
      clearInterval(synthInterval.current);
      synthInterval.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  };

  // SFX Player using synthesizer Web Audio API - instant, high-fidelity sound effects!
  const playSfx = (type: "click" | "sword" | "gold" | "potion" | "levelUp") => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      if (ctx.state === "suspended") {
        void ctx.resume().catch(() => undefined);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(volume * 0.3, ctx.currentTime);
      gain.connect(ctx.destination);

      if (type === "click") {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(volume * 0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.09);
      } else if (type === "sword") {
        // High pitch metal scrape sfx
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(2200, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.26);
      } else if (type === "gold") {
        // Coin clink!
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(2500, ctx.currentTime);
        osc2.type = "sine";
        osc2.frequency.setValueAtTime(3100, ctx.currentTime);
        
        gain.gain.setValueAtTime(volume * 0.35, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        osc1.connect(gain);
        osc2.connect(gain);
        osc1.start();
        osc2.start();
        osc1.stop(ctx.currentTime + 0.21);
        osc2.stop(ctx.currentTime + 0.21);
      } else if (type === "potion") {
        // Liquid bubble sound
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + 0.3);
        
        gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        
        osc.connect(gain);
        osc.start();
        osc.stop(ctx.currentTime + 0.36);
      } else if (type === "levelUp") {
        // Grand heroic major chord arpeggio!
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const oscGain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
          oscGain.gain.setValueAtTime(0, ctx.currentTime);
          oscGain.gain.setValueAtTime(volume * 0.3, ctx.currentTime + i * 0.08);
          oscGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.08 + 0.4);
          
          osc.connect(oscGain);
          oscGain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.08);
          osc.stop(ctx.currentTime + i * 0.08 + 0.45);
        });
      }
    } catch (e) {
      console.warn("SFX synthesizer execution failed:", e);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        isMuted,
        volume,
        currentWorld,
        setVolume,
        toggleMute,
        playWorldMusic,
        stopMusic,
        playSfx,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
}
