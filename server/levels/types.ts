export interface CaseFile {
  attack: string;
  whyItWorked: string;
  owasp: string;
  trustBoundary: string;
  defense: string;
  incident: string;
}

export interface LevelTool {
  name: string;
  description: string;
  properties: Record<string, { type: "string"; description: string }>;
  required: string[];
  run: (input: Record<string, unknown>) => string;
}

export interface AibomEntry {
  name: string;
  publisher: string;
  version: string;
  hash: string;
  verified: boolean;
  description: string;
}

export interface Level {
  id: number;
  city: string;
  title: string;
  witness: string;
  topic: string;
  briefing: string;
  systemPrompt: string;
  flag: string;
  hints: [string, string, string];
  tools?: LevelTool[];
  aibom?: AibomEntry[];
  caseFile: CaseFile;
}

export interface PublicLevel {
  aibom?: AibomEntry[];
  id: number;
  city: string;
  title: string;
  witness: string;
  topic: string;
  briefing: string;
}
