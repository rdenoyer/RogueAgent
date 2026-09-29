export interface CaseFile {
  attack: string;
  whyItWorked: string;
  owasp: string;
  trustBoundary: string;
  defense: string;
  incident: string;
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
  caseFile: CaseFile;
}

export interface PublicLevel {
  id: number;
  city: string;
  title: string;
  witness: string;
  topic: string;
  briefing: string;
}
