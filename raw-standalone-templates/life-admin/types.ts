export type AdminCategory =
  | "money" | "housing" | "work" | "health" | "family"
  | "car" | "tax" | "legal" | "benefits" | "education"
  | "utilities" | "other";

export type PressureLevel = "calm" | "manageable" | "overloaded" | "urgent";

export type SortedBucket =
  | "do_today" | "do_this_week" | "schedule"
  | "waiting" | "archive" | "needs_info";

export type EnergyLevel = "low" | "medium" | "high";

export interface AdminItem {
  id: string;
  runId?: string;
  title: string;
  rawText?: string;
  category: AdminCategory;
  deadline?: string;            // ISO date
  involves?: string;            // who it involves
  whatNeedsToHappen?: string;
  stressLevel: number;          // 1–10
  hasReplied: boolean;
  hasDocument: boolean;
  consequence?: string;
  urgencyScore: number;         // 0–100, derived
  bucket: SortedBucket;         // derived
  estimatedTimeMinutes?: number;
  energyLevel?: EnergyLevel;
}

export interface NextAction {
  adminItemId: string;
  tinyStep: string;
  fullNextStep: string;
  whoToContact?: string;
  whatToSay?: string;
  documentsNeeded?: string[];
  estimatedTimeMinutes: number;
  energyLevel: EnergyLevel;
}

export interface AdminRun {
  id: string;
  userId?: string;
  createdAt: string;
  pressureScore: number;        // 0–100
  pressureLevel: PressureLevel;
  items: AdminItem[];
}

export interface ScriptTemplate {
  id: string;
  type: "ask_more_time" | "chase_reply" | "cancel"
      | "clarification" | "complaint" | "book_appointment";
  title: string;
  body: string; // contains {{placeholders}}
}

export interface WeeklyBlock {
  dayIndex: number;             // 0–6
  label: string;                // "Monday"
  items: string[];              // AdminItem ids
}
