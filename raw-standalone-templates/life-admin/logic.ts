import { AdminItem, AdminRun, SortedBucket, PressureLevel, ScriptTemplate, WeeklyBlock, AdminCategory } from './types';

export function daysUntil(dateISO?: string): number | null {
  if (!dateISO) return null;
  const diff = new Date(dateISO).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export function deadlineWeight(days: number | null): number {
  if (days === null) return 0;
  if (days <= 0) return 40;
  if (days <= 2) return 35;
  if (days <= 7) return 25;
  if (days <= 14) return 15;
  if (days <= 30) return 5;
  return 0;
}

export function consequenceSeverity(text?: string): number {
  if (!text) return 0.1;
  const t = text.toLowerCase();
  if (/court|bailiff|evict|legal action|prosecut/.test(t)) return 1;
  if (/fine|penalty|interest|debt collector|cut off|disconnect/.test(t)) return 0.7;
  if (/late fee|charge|delay/.test(t)) return 0.4;
  return 0.15;
}

export function computeUrgencyScore(item: AdminItem): number {
  const stressPart = 30 * (item.stressLevel / 10);
  const deadlinePart = deadlineWeight(daysUntil(item.deadline));
  const consequencePart = 30 * consequenceSeverity(item.consequence);
  const repliedPenalty = item.hasReplied ? 15 : 0;
  return Math.max(0, Math.min(100, Math.round(stressPart + deadlinePart + consequencePart - repliedPenalty)));
}

export function assignBucket(item: AdminItem): SortedBucket {
  if (!item.whatNeedsToHappen || item.whatNeedsToHappen.trim().length < 5) {
    return "needs_info";
  }
  if (item.hasReplied && item.involves) return "waiting";

  const days = daysUntil(item.deadline);
  const lowStakes = item.stressLevel <= 3 && consequenceSeverity(item.consequence) <= 0.15 && days === null;
  if (lowStakes) return "archive";

  if (item.urgencyScore >= 75 || (days !== null && days <= 1)) return "do_today";
  if (item.urgencyScore >= 50 || (days !== null && days <= 7)) return "do_this_week";
  return "schedule";
}

export function computePressureScore(items: AdminItem[]): { score: number; level: PressureLevel } {
  if (items.length === 0) return { score: 0, level: "calm" };

  const avgUrgency = items.reduce((sum, i) => sum + i.urgencyScore, 0) / items.length;
  const volumeFactor = Math.min(20, items.length * 1.5);
  const criticalCount = items.filter(i => i.urgencyScore >= 75).length;
  const criticalFactor = Math.min(15, criticalCount * 5);

  const score = Math.round(Math.min(100, avgUrgency * 0.65 + volumeFactor + criticalFactor));

  let level: PressureLevel = "calm";
  if (score >= 75) level = "urgent";
  else if (score >= 50) level = "overloaded";
  else if (score >= 25) level = "manageable";

  return { score, level };
}

export function detectCategory(text: string): AdminCategory {
  const t = text.toLowerCase();
  if (/council tax|rent|landlord|mortgage|evict/.test(t)) return "housing";
  if (/doctor|gp|prescription|hospital|dentist|appointment/.test(t)) return "health";
  if (/car|mot|insurance|dvla|driving/.test(t)) return "car";
  if (/tax|hmrc|self assessment/.test(t)) return "tax";
  if (/school|teacher|trip|parents evening/.test(t)) return "education";
  if (/energy|water|broadband|bill|meter/.test(t)) return "utilities";
  if (/boss|manager|payslip|hr|work/.test(t)) return "work";
  if (/bank|credit card|loan|debt|pay/.test(t)) return "money";
  return "other";
}

export function detectConsequence(text: string): string | undefined {
  const t = text.toLowerCase();
  if (/court|bailiff|legal action/.test(t)) return "Court/Bailiff";
  if (/evict/.test(t)) return "Eviction";
  if (/fine|penalty/.test(t)) return "Fine/Penalty";
  if (/cut off|disconnect/.test(t)) return "Disconnection";
  return undefined;
}

export function detectDeadline(text: string): string | undefined {
  const t = text.toLowerCase();
  const today = new Date();
  let d = new Date(today);
  
  if (/tomorrow/.test(t)) {
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  }
  if (/friday/.test(t)) {
    const day = d.getDay();
    const diff = day <= 5 ? 5 - day : 12 - day; // next Friday
    d.setDate(d.getDate() + diff);
    return d.toISOString().split('T')[0];
  }
  if (/next month/.test(t)) {
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  }
  if (/overdue|behind/.test(t)) {
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }
  return undefined;
}

export function parseBrainDumpHeuristic(text: string): AdminItem[] {
  const lines = text.split(/\n+/).map(l => l.replace(/^[•\-*\d.)]\s*/, "").trim()).filter(l => l.length > 5);
  return lines.map((line, i) => {
    const category = detectCategory(line);
    const consequence = detectConsequence(line);
    const deadline = detectDeadline(line);
    const stressLevel = /scared|worried|avoid|ignoring|overwhelm/i.test(line) ? 8 : 5;
    const item: AdminItem = {
      id: `item_${Date.now()}_${i}`,
      title: line.slice(0, 60),
      rawText: line,
      category,
      deadline,
      whatNeedsToHappen: line,
      stressLevel,
      hasReplied: /already replied|sorted|done/i.test(line),
      hasDocument: /letter|bill|form|notice/i.test(line),
      consequence,
      urgencyScore: 0,
      bucket: "needs_info",
    };
    item.urgencyScore = computeUrgencyScore(item);
    item.bucket = assignBucket(item);
    return item;
  });
}

export function runPrioritySorter(items: AdminItem[]): AdminRun {
  const scored = items.map(item => {
    const urgencyScore = computeUrgencyScore(item);
    return { ...item, urgencyScore, bucket: assignBucket({ ...item, urgencyScore }) };
  });
  const { score, level } = computePressureScore(scored);
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    pressureScore: score,
    pressureLevel: level,
    items: scored,
  };
}

export function generateScripts(item: AdminItem): ScriptTemplate[] {
  const who = item.involves ?? "the relevant organisation";
  const subject = item.title;
  return [
    { id: "1", type: "ask_more_time", title: "Asking for more time",
      body: `Dear ${who},\n\nI'm writing about ${subject}. I need a little more time to deal with this properly. Could you extend the deadline to [NEW DATE]?\n\nThank you,\n[Your name]` },
    { id: "2", type: "chase_reply", title: "Chasing a reply",
      body: `Dear ${who},\n\nFollowing up on ${subject} — I haven't heard back since [DATE]. Could you confirm receipt and let me know next steps?\n\nThanks,\n[Your name]` },
    { id: "3", type: "cancel", title: "Cancelling something",
      body: `Dear ${who},\n\nI'd like to cancel ${subject} effective [DATE]. Please confirm in writing and let me know of anything owed either way.\n\n[Your name]` },
    { id: "4", type: "clarification", title: "Asking for clarification",
      body: `Dear ${who},\n\nRegarding ${subject}, could you clarify: 1) [question], 2) [question]?\n\nThanks,\n[Your name]` },
    { id: "5", type: "complaint", title: "Making a complaint",
      body: `Dear ${who},\n\nI'm writing to complain about ${subject}. [What happened]. I'd like [resolution]. I'll escalate this if not resolved within 14 days.\n\n[Your name]` },
    { id: "6", type: "book_appointment", title: "Booking an appointment",
      body: `Dear ${who},\n\nI'd like to book an appointment regarding ${subject}. I'm available: [option 1], [option 2]. Let me know what works.\n\n[Your name]` },
  ];
}

export function buildWeeklyPlan(items: AdminItem[]): WeeklyBlock[] {
  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const sorted = [...items].sort((a, b) => b.urgencyScore - a.urgencyScore);
  const blocks: WeeklyBlock[] = days.map((label, dayIndex) => ({ dayIndex, label, items: [] }));

  // Front-load urgent items into the first two weekdays, cap at 2 per day to stay realistic
  sorted.forEach((item, i) => {
    const dayIndex = Math.min(i % 5, 4); // Mon–Fri primarily
    if (blocks[dayIndex].items.length < 2) blocks[dayIndex].items.push(item.id);
    else blocks[5].items.push(item.id); // overflow to Saturday
  });
  blocks[6].items.push("weekly_review"); // Sunday is always a light review, never a workload dump
  return blocks;
}
