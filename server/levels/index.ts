import type { Level, PublicLevel } from "./types.js";
import { paris } from "./paris.js";
import { tokyo } from "./tokyo.js";

export const levels: Level[] = [paris, tokyo];

export function getLevel(id: number): Level | undefined {
  return levels.find((l) => l.id === id);
}

export function toPublic(l: Level): PublicLevel {
  const { id, city, title, witness, topic, briefing } = l;
  return { id, city, title, witness, topic, briefing };
}
