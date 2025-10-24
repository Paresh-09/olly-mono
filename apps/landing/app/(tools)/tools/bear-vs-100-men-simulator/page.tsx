"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@repo/ui/components/ui/button";
import { Card } from "@repo/ui/components/ui/card";
import { Progress } from "@repo/ui/components/ui/progress";
import { Badge } from "@repo/ui/components/ui/badge";

const ARENA_WIDTH = 1000;
const ARENA_HEIGHT = 800;
const GORILLA_RADIUS = 28;
const MAN_RADIUS = 14;
const GORILLA_SPEED = 2.2;
const MAN_SPEED = 1.2;
const FLEE_SPEED = 2.5;
const FLEE_MORALE_THRESHOLD = 0.4;
const RECOVER_MORALE_THRESHOLD = 0.6;

const ANIMALS = [
  { name: 'Gorilla', emoji: '🦍', defaultHp: 1200 },
  { name: 'Bear', emoji: '🐻', defaultHp: 1500 },
  { name: 'Lion', emoji: '🦁', defaultHp: 900 },
  { name: 'Elephant', emoji: '🐘', defaultHp: 3000 },
];

function getDistance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
}

function randomArenaPosition() {
  return {
    x: Math.random() * (ARENA_WIDTH - 2 * MAN_RADIUS) + MAN_RADIUS,
    y: Math.random() * (ARENA_HEIGHT - 2 * MAN_RADIUS) + MAN_RADIUS,
  };
}

const initialGorilla = {
  x: ARENA_WIDTH / 2,
  y: ARENA_HEIGHT / 2,
  hp: 1200,
  maxHp: 1200,
};

function createMen(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    ...randomArenaPosition(),
    hp: 10,
    morale: 1,
    state: "attack", // "attack" | "flee" | "dead"
    fade: false,
  }));
}

export default function GorillaVsMenSimulator() {
  const [animal, setAnimal] = useState(ANIMALS[0]);
  const [animalHp, setAnimalHp] = useState(ANIMALS[0].defaultHp);
  const [menCount, setMenCount] = useState(100);
  const [gorilla, setGorilla] = useState({ ...initialGorilla, hp: animalHp, maxHp: animalHp });
  const [men, setMen] = useState(createMen(menCount));
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [round, setRound] = useState(0);
  const [fleeingCount, setFleeingCount] = useState(0);
  const [gameStatus, setGameStatus] = useState("Idle");
  const animationRef = useRef<number | null>(null);

  // Clamp position to stay within arena
  function clampPosition(x: number, y: number, radius: number) {
    return {
      x: Math.max(radius, Math.min(ARENA_WIDTH - radius, x)),
      y: Math.max(radius, Math.min(ARENA_HEIGHT - radius, y)),
    };
  }

  // Gorilla moves toward nearest man
  function moveGorilla(g: typeof initialGorilla, menArr: ReturnType<typeof createMen>): typeof initialGorilla {
    const aliveMen = menArr.filter(m => m.state !== "dead");
    if (aliveMen.length === 0) return g;
    let nearest = aliveMen[0];
    let minDist = getDistance(g, nearest);
    for (let m of aliveMen) {
      const d = getDistance(g, m);
      if (d < minDist) {
        minDist = d;
        nearest = m;
      }
    }
    if (minDist > GORILLA_RADIUS + MAN_RADIUS) {
      const dx = nearest.x - g.x;
      const dy = nearest.y - g.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const { x, y } = clampPosition(
        g.x + (dx / dist) * GORILLA_SPEED,
        g.y + (dy / dist) * GORILLA_SPEED,
        GORILLA_RADIUS
      );
      return { ...g, x, y };
    }
    return g;
  }

  // Men move toward gorilla or flee
  function moveMen(menArr: ReturnType<typeof createMen>, g: typeof initialGorilla): ReturnType<typeof createMen> {
    return menArr.map(m => {
      if (m.state === "dead") return m;
      let dx = g.x - m.x;
      let dy = g.y - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (m.state === "flee") {
        const { x, y } = clampPosition(
          m.x - (dx / dist) * FLEE_SPEED,
          m.y - (dy / dist) * FLEE_SPEED,
          MAN_RADIUS
        );
        return { ...m, x, y };
      } else {
        if (dist > GORILLA_RADIUS + MAN_RADIUS) {
          const { x, y } = clampPosition(
            m.x + (dx / dist) * MAN_SPEED,
            m.y + (dy / dist) * MAN_SPEED,
            MAN_RADIUS
          );
          return { ...m, x, y };
        }
        return m;
      }
    });
  }

  // Gorilla attacks men in range
  function gorillaAttack(g: typeof initialGorilla, menArr: ReturnType<typeof createMen>): ReturnType<typeof createMen> {
    let attacked = false;
    let newMen = menArr.map(m => {
      if (m.state !== "dead" && getDistance(g, m) < GORILLA_RADIUS + MAN_RADIUS + 2) {
        if (Math.random() < 0.7) { // 70% chance to kill
          attacked = true;
          setLog(l => [
            `[${(round / 10).toFixed(1)}s] man_${m.id} was defeated!`,
            ...l,
          ]);
          return { ...m, state: "dead", fade: true };
        }
      }
      return m;
    });
    return newMen;
  }

  // Men attack gorilla if close
  function menAttack(g: typeof initialGorilla, menArr: ReturnType<typeof createMen>): typeof initialGorilla {
    let totalDamage = 0;
    menArr.forEach(m => {
      if (m.state === "attack" && getDistance(g, m) < GORILLA_RADIUS + MAN_RADIUS + 2) {
        if (Math.random() < 0.2) { // 20% chance to hit
          totalDamage += 2;
        }
      }
    });
    if (totalDamage > 0) {
      setLog(l => [
        `[${(round / 10).toFixed(1)}s] Gorilla took ${totalDamage} damage!`,
        ...l,
      ]);
    }
    return { ...g, hp: Math.max(0, g.hp - totalDamage) };
  }

  // Morale system
  function updateMorale(menArr: ReturnType<typeof createMen>): ReturnType<typeof createMen> {
    return menArr.map(m => {
      if (m.state === "dead") return m;
      let newMorale = m.morale;
      if (m.state === "attack" && Math.random() < 0.01) {
        newMorale -= 0.1 + Math.random() * 0.2;
        if (newMorale < FLEE_MORALE_THRESHOLD) {
          setLog(l => [
            `[${(round / 10).toFixed(1)}s] man_${m.id} morale dropped (${newMorale.toFixed(2)}), starts fleeing!`,
            ...l,
          ]);
          return { ...m, morale: newMorale, state: "flee" };
        }
      }
      if (m.state === "flee" && Math.random() < 0.02) {
        newMorale += 0.1 + Math.random() * 0.2;
        if (newMorale > RECOVER_MORALE_THRESHOLD) {
          setLog(l => [
            `[${(round / 10).toFixed(1)}s] man_${m.id} regained courage and stopped fleeing!`,
            ...l,
          ]);
          return { ...m, morale: newMorale, state: "attack" };
        }
      }
      return { ...m, morale: Math.max(0, Math.min(1, newMorale)) };
    });
  }

  // Main game loop
  useEffect(() => {
    if (!isRunning) return;
    if (gorilla.hp <= 0 || men.filter(m => m.state !== "dead").length === 0) {
      setGameStatus("Game Over");
      setIsRunning(false);
      return;
    }
    animationRef.current = requestAnimationFrame(() => {
      setRound(r => r + 1);
      setMen(prevMen => {
        let movedMen = moveMen(prevMen, gorilla);
        movedMen = updateMorale(movedMen);
        movedMen = movedMen.map(m => {
          // Remove men who have faded out
          if (m.state === "dead" && m.fade) {
            return { ...m, fade: false };
          }
          return m;
        });
        setFleeingCount(movedMen.filter(m => m.state === "flee").length);
        return movedMen;
      });
      setGorilla(prevG => moveGorilla(prevG, men));
      setMen(prevMen => gorillaAttack(gorilla, prevMen));
      setGorilla(prevG => menAttack(prevG, men));
    });
    return () => {
      if (typeof animationRef.current === 'number') {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, gorilla, men, round]);

  // Reset
  function reset() {
    setGorilla({ ...initialGorilla, hp: animalHp, maxHp: animalHp });
    setMen(createMen(menCount));
    setLog([]);
    setRound(0);
    setFleeingCount(0);
    setGameStatus("Idle");
    setIsRunning(false);
  }

  // Start
  function start() {
    reset();
    setGameStatus("Running...");
    setIsRunning(true);
  }

  // Stats
  const menAlive = men.filter(m => m.state !== "dead").length;
  const menFleeing = men.filter(m => m.state === "flee").length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-4">Gorilla vs 100 Men Simulator</h1>
      <div className="flex flex-col items-center mb-4">
        <div className="flex gap-2 mb-2">
          <label className="flex items-center gap-1">
            Animal:
            <select
              value={animal.name}
              onChange={e => {
                const selected = ANIMALS.find(a => a.name === e.target.value) || ANIMALS[0];
                setAnimal(selected);
                setAnimalHp(selected.defaultHp);
              }}
              className="border rounded px-2 py-1"
            >
              {ANIMALS.map(a => (
                <option key={a.name} value={a.name}>{a.emoji} {a.name}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1">
            Animal HP:
            <input
              type="number"
              min={100}
              max={10000}
              value={animalHp}
              onChange={e => setAnimalHp(Number(e.target.value))}
              className="border rounded px-2 py-1 w-20"
            />
          </label>
          <label className="flex items-center gap-1">
            Men:
            <input
              type="number"
              min={1}
              max={300}
              value={menCount}
              onChange={e => setMenCount(Number(e.target.value))}
              className="border rounded px-2 py-1 w-16"
            />
          </label>
          <Button onClick={start} disabled={isRunning}>Start Simulation</Button>
          <Button onClick={reset} variant="secondary">Reset Simulation</Button>
        </div>
        <div className="bg-white rounded shadow p-4 w-full max-w-xl text-center mb-2">
          <div className="mb-1 text-sm text-gray-700">
            <b>Rules:</b> Gorilla is vastly stronger. Men have numbers but low morale. Unarmed.
          </div>
          <div className="mb-1">
            {animal.name} ({animal.emoji}): HP: {gorilla.hp} | Men Remaining: {menAlive} / {menCount} (Fleeing: {menFleeing})
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center">
        <div
          className="relative"
          style={{ width: ARENA_WIDTH, height: ARENA_HEIGHT, background: '#7bb17b', borderRadius: 12, border: '2px solid #444' }}
        >
          {/* Gorilla */}
          <motion.div
            className="absolute flex flex-col items-center justify-center"
            style={{
              left: gorilla.x - GORILLA_RADIUS,
              top: gorilla.y - GORILLA_RADIUS,
              width: GORILLA_RADIUS * 2,
              height: GORILLA_RADIUS * 2,
              zIndex: 2,
            }}
            animate={{ scale: gorilla.hp > 0 ? 1 : 0.7 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <div className="rounded-full bg-brown-700 border-4 border-brown-900 flex items-center justify-center" style={{ width: GORILLA_RADIUS * 2, height: GORILLA_RADIUS * 2 }}>
              <span style={{ fontSize: 36 }}>🦍</span>
            </div>
            <div className="text-xs mt-1 font-bold">{gorilla.hp} HP</div>
          </motion.div>
          {/* Men */}
          <AnimatePresence>
            {men.map((m, i) =>
              m.state !== "dead" ? (
                <motion.div
                  key={m.id}
                  className="absolute flex items-center justify-center font-bold text-xs"
                  style={{
                    left: m.x - MAN_RADIUS,
                    top: m.y - MAN_RADIUS,
                    width: MAN_RADIUS * 2,
                    height: MAN_RADIUS * 2,
                    zIndex: 1,
                  }}
                  animate={{ opacity: 1, scale: 1, backgroundColor: m.state === "flee" ? "#f9e79f" : "#f5c542" }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.5 }}
                >
                  <div
                    className="rounded-full border-2 border-yellow-700 flex items-center justify-center"
                    style={{ width: MAN_RADIUS * 2, height: MAN_RADIUS * 2, background: m.state === "flee" ? "#f9e79f" : "#f5c542" }}
                  >
                    {m.id}
                  </div>
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>
        <div className="mt-2 text-center font-semibold">Game Status: {gameStatus}</div>
        <div className="w-full max-w-xl mt-2 bg-white rounded shadow p-2 text-xs h-32 overflow-y-auto" style={{ fontFamily: 'monospace' }}>
          {log.slice(0, 12).map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
} 