import type { Level, PublicLevel } from "./types.js";
import { paris } from "./paris.js";
import { tokyo } from "./tokyo.js";
import { cairo } from "./cairo.js";
import { rio } from "./rio.js";

export const levels: Level[] = [paris, tokyo, cairo, rio];

export function getLevel(id: number): Level | undefined {
  return levels.find((l) => l.id === id);
}

export function toPublic(l: Level): PublicLevel {
  const { id, city, title, witness, topic, briefing, aibom } = l;
  return { id, city, title, witness, topic, briefing, ...(aibom ? { aibom } : {}) };
}
