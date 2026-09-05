**Product Framing**

The Evidence Bundle Organiser is built around a single promise: take the chaos of fifty screenshots, emails, PDFs and scribbled notes and turn it into a clean, chronological, exhibit-referenced bundle that a tribunal, adviser, ombudsman or small claims court can actually use. It is deliberately *not* a legal advice engine — it never tells a user what the law says or what they will win — it is an organisation and preparation tool that reduces the executive-function load of assembling a case. Every screen is designed around a neurodivergent-first principle: short chunks of information, validating copy ("this is messy, and that's normal — we'll organise it"), a small number of visible choices at each step, and colour used as a semantic language (green = strong, orange = needs review, red = risk) rather than decoration. The interface stays premium and serious throughout — dark charcoal surfaces, restrained yellow for primary actions only, clean tabular data — because this tool has to feel credible enough to sit next to a court bundle, not like a gamified habit-tracker.

**Design System**

The visual language should be implemented as a small set of design tokens so it can be reused consistently across every component (Tailwind config or CSS variables both work — the values below are written as CSS custom properties so they transfer directly into a `tailwind.config.js` `extend.colors` block if preferred):

```css
:root {
  --bg-primary: #0d0d0d;      /* page background */
  --bg-surface: #151515;      /* cards */
  --bg-elevated: #1e1e1e;     /* inputs, hovered rows */
  --border: #2a2a2a;

  --yellow: #f5c518;   /* primary actions only */
  --green:  #22c55e;   /* strong / core evidence */
  --orange: #f97316;   /* needs review */
  --red:    #ef4444;   /* risk / urgent */

  --text-primary: #f0f0f0;
  --text-muted: #8a8a8a;

  --radius-md: 10px;
  --radius-lg: 16px;
}
```

Yellow is reserved for calls to action (Start case, Save, Export, Upgrade) so it never loses its meaning. Green/orange/red are reserved strictly for evidence status and risk severity, never for decoration, which matters a great deal for a tool aimed at users who rely on colour as a fast, literal signal rather than an aesthetic cue.

**Data Model & Supabase Schema**

The frontend should be typed against the same shape the database will eventually use, so the migration from local state to Supabase is mechanical rather than a rewrite.

```typescript
// types.ts

export type CaseType =
  | 'universal_credit' | 'mandatory_reconsideration' | 'small_claim'
  | 'housing' | 'police_complaint' | 'employment' | 'debt_financial'
  | 'general_complaint' | 'other';

export type DocumentType =
  | 'email' | 'pdf' | 'screenshot' | 'photo' | 'receipt' | 'bank_statement'
  | 'medical' | 'official_letter' | 'witness_statement' | 'note' | 'other';

export type Importance =
  | 'core' | 'supporting' | 'background' | 'risky' | 'duplicate' | 'not_sure';

export type Problem =
  | 'missing_page' | 'unclear_date' | 'not_your_name' | 'contradiction'
  | 'duplicate' | 'low_quality' | 'not_sure' | null;

export type ExhibitCategory = 'core' | 'correspondence' | 'financial' | 'supporting';
export type KmrStatus = 'keep' | 'maybe' | 'remove';

export interface CaseSetup {
  id: string;
  userId?: string;
  caseType: CaseType;
  caseName: string;
  opponent: string;
  whatHappened: string;
  desiredOutcome: string;
  keyDate: string | null;
  deadline: string | null;
  mainArgument: string;
  stressLevel: number; // 1-10
  purpose: 'court' | 'tribunal' | 'complaint' | 'adviser' | 'not_sure' | null;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  title: string;
  documentType: DocumentType;
  date: string | null;
  createdBy: string;
  receivedBy: string;
  summary: string;
  provesWhat: string;
  supportsIssue: string;
  filePlaceholder?: string;      // real upload comes later
  importance: Importance;        // drives strength ranking + KMR default
  isSensitive: boolean;
  problem: Problem;
  // derived at analysis time — not user-entered:
  exhibitCategory?: ExhibitCategory; // drives A/B/C/D lettering — independent of importance
  exhibitRef?: string;               // e.g. "B3"
  strengthScore?: number;
  kmrStatus?: KmrStatus;
  riskFlags?: string[];
}

export interface CaseRun {
  id: string;
  caseId: string;
  createdAt: string;
  readinessScore: number;
  readinessLabel: 'messy' | 'usable' | 'strong' | 'nearly_ready';
}

export interface BundleExport {
  id: string;
  caseId: string;
  runId: string;
  createdAt: string;
  format: 'pdf' | 'html';
}
```

The Supabase schema mirrors these types directly, and adds the `case_runs` table (each time a user re-analyses their bundle, a run is recorded — useful later for version history):

```sql
create extension if not exists "uuid-ossp";

create table users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  plan text not null default 'free' check (plan in ('free','paid')),
  created_at timestamptz default now()
);

create table cases (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) on delete cascade,
  case_type text not null,
  case_name text not null,
  opponent text,
  what_happened text,
  desired_outcome text,
  key_date date,
  deadline date,
  main_argument text,
  stress_level int check (stress_level between 1 and 10),
  purpose text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table evidence_items (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade,
  title text not null,
  document_type text,
  document_date date,
  created_by text,
  received_by text,
  summary text,
  proves_what text,
  supports_issue text,
  file_url text,               -- placeholder until real upload is wired up
  importance text,
  is_sensitive boolean default false,
  problem text,
  exhibit_category text,
  exhibit_ref text,
  kmr_status text default 'maybe',
  created_at timestamptz default now()
);

create table case_runs (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade,
  readiness_score int,
  readiness_label text,
  created_at timestamptz default now()
);

create table bundle_exports (
  id uuid primary key default uuid_generate_v4(),
  case_id uuid references cases(id) on delete cascade,
  run_id uuid references case_runs(id),
  format text default 'pdf',
  created_at timestamptz default now()
);
```

**Application Architecture**

Local state drives the MVP; every write-path is annotated with where the equivalent Supabase call will go later.

```
/src
  /types.ts
  /constants.ts        // case types, doc types, missing-evidence templates
  /logic.ts             // scoring, categorisation, risk & next-step generators
  /App.tsx
  /components
    LandingPage.tsx
    CaseSetupForm.tsx
    EvidenceEntryForm.tsx
    EvidenceDashboard.tsx
    StrongestEvidence.tsx
    Timeline.tsx
    ExhibitIndex.tsx
    KeepMaybeRemoveSorter.tsx
    MissingEvidenceChecklist.tsx
    RiskReview.tsx
    NextSteps.tsx
    ExportPage.tsx
    UpgradeModal.tsx
```

`App.tsx` holds a simple step machine (`'landing' | 'setup' | 'entry' | 'dashboard' | 'export'`) plus the case data, evidence array, and a `plan: 'free' | 'paid'` flag that every gated component reads.

**Core Business Logic**

*Strength score* — a simple additive heuristic per document, used to rank the Strongest Evidence list and to seed the Keep/Maybe/Remove default:

```typescript
// logic.ts
export function computeStrengthScore(item: EvidenceItem): number {
  let score = 0;
  if (item.importance === 'core') score += 30;
  else if (item.importance === 'supporting') score += 20;
  else if (item.importance === 'background') score += 10;

  if (item.date) score += 10;
  if (item.provesWhat?.trim().length > 10) score += 20;
  if (!item.problem) score += 10;
  if (['official_letter', 'medical'].includes(item.documentType)) score += 15;

  return Math.min(100, score);
}
```

*Exhibit categorisation* — corrected to be driven by document type (not importance), because the brief treats "core case documents / correspondence / financial / supporting" as filing buckets independent of how strong a document is. The user can always rename or reassign a category afterwards.

```typescript
export function defaultExhibitCategory(item: EvidenceItem): ExhibitCategory {
  if (item.documentType === 'official_letter') return 'core';
  if (['email', 'note', 'screenshot'].includes(item.documentType)) return 'correspondence';
  if (['receipt', 'bank_statement'].includes(item.documentType)) return 'financial';
  return 'supporting'; // witness_statement, medical, photo, pdf, other
}

export function assignExhibitRefs(items: EvidenceItem[]): EvidenceItem[] {
  const prefix: Record<ExhibitCategory, string> = {
    core: 'A', correspondence: 'B', financial: 'C', supporting: 'D',
  };
  const counters: Record<ExhibitCategory, number> = {
    core: 0, correspondence: 0, financial: 0, supporting: 0,
  };
  return items
    .slice()
    .sort((a, b) => (a.date ?? '9999').localeCompare(b.date ?? '9999'))
    .map(item => {
      const cat = item.exhibitCategory ?? defaultExhibitCategory(item);
      counters[cat] += 1;
      return { ...item, exhibitCategory: cat, exhibitRef: `${prefix[cat]}${counters[cat]}` };
    });
}
```

*Readiness score* — a single unified formula combining volume, core-evidence density, case-setup completeness, document cleanliness, and deadline awareness, minus a risk penalty:

$$\text{Readiness} = \min(4n,\ 20) + \min(8c,\ 25) + 20\cdot\frac{f}{6} + 20\cdot\frac{q}{n} + b - p$$

where $$n$$ is the total number of evidence items, $$c$$ is the number marked *core*, $$f$$ is the number of the six key case-setup fields that are filled in (case name, opponent, what happened, desired outcome, main argument, key date), $$q$$ is the number of documents with no flagged problem, $$b$$ is a bonus of 5 points each for having a key date and a deadline recorded (max 10), and $$p$$ is a penalty of 3 points per document marked *risky* plus 4 points per flagged contradiction. The result is clamped to the range $$[0, 100]$$.

Worked example, to verify the formula behaves sensibly: a case with $$n=8$$ documents, $$c=4$$ core items, all $$f=6$$ setup fields filled, $$q=7$$ clean documents, both key date and deadline present ($$b=10$$), and no risky/contradictory items ($$p=0$$):

$$\text{Readiness} = \min(32,20) + \min(32,25) + 20\cdot\frac{6}{6} + 20\cdot\frac{7}{8} + 10 - 0 = 20 + 25 + 20 + 17.5 + 10 = 92.5 \approx 93$$

A score of 93 correctly falls into the top band, which matches the intuitive expectation that a well-populated, mostly-clean, fully-described bundle should read as "nearly ready." The label bands are:

- **0–29 → Messy** (red)
- **30–54 → Usable** (orange)
- **55–79 → Strong** (green)
- **80–100 → Nearly ready** (green, brighter/emphasised)

```typescript
export function computeReadinessScore(caseData: CaseSetup, evidence: EvidenceItem[]) {
  const n = evidence.length;
  if (n === 0) return { score: 0, label: 'messy' as const };

  const c = evidence.filter(e => e.importance === 'core').length;
  const q = evidence.filter(e => !e.problem).length;
  const fields = [caseData.caseName, caseData.opponent, caseData.whatHappened,
    caseData.desiredOutcome, caseData.mainArgument, caseData.keyDate];
  const f = fields.filter(Boolean).length;

  const bonus = (caseData.keyDate ? 5 : 0) + (caseData.deadline ? 5 : 0);
  const riskyCount = evidence.filter(e => e.importance === 'risky').length;
  const contradictionCount = evidence.filter(e => e.problem === 'contradiction').length;
  const penalty = riskyCount * 3 + contradictionCount * 4;

  const raw = Math.min(4 * n, 20) + Math.min(8 * c, 25)
    + 20 * (f / 6) + 20 * (q / n) + bonus - penalty;

  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const label = score < 30 ? 'messy' : score < 55 ? 'usable' : score < 80 ? 'strong' : 'nearly_ready';
  return { score, label } as const;
}
```

*Missing evidence checklist* — case-type-specific, matching every example given in the brief and rounded out with sensible extras, each flagged `critical` or not:

```typescript
// constants.ts
export const MISSING_EVIDENCE: Record<CaseType, { id: string; item: string; critical: boolean; hint: string }[]> = {
  universal_credit: [
    { id: 'uc1', item: 'Decision letter', critical: true, hint: 'The letter stating the decision you are challenging.' },
    { id: 'uc2', item: 'MR deadline', critical: true, hint: 'Usually 1 month from the decision date.' },
    { id: 'uc3', item: 'Identity / status evidence', critical: true, hint: 'Passport, BRP, or similar.' },
    { id: 'uc4', item: 'Bank statements (3 months)', critical: false, hint: 'Income and outgoings for the claim period.' },
    { id: 'uc5', item: 'Payslips', critical: false, hint: 'For the relevant assessment period.' },
    { id: 'uc6', item: 'Tenancy / address proof', critical: false, hint: 'Confirms address and housing costs.' },
    { id: 'uc7', item: 'Medical evidence', critical: false, hint: 'GP letters, fit notes, specialist reports.' },
  ],
  mandatory_reconsideration: [
    { id: 'mr1', item: 'Original decision letter', critical: true, hint: 'What you are asking to be reconsidered.' },
    { id: 'mr2', item: 'MR request confirmation', critical: true, hint: 'Proof you submitted the MR in time.' },
    { id: 'mr3', item: 'Supporting medical evidence', critical: true, hint: 'GP/specialist reports not seen by the assessor.' },
    { id: 'mr4', item: 'Deadline confirmation', critical: true, hint: 'Confirm you are inside the 1-month window.' },
  ],
  small_claim: [
    { id: 'sc1', item: 'Contract or agreement', critical: true, hint: 'Written or summarised if verbal.' },
    { id: 'sc2', item: 'Proof of payment', critical: true, hint: 'Receipt, bank record, PayPal record.' },
    { id: 'sc3', item: 'Letter before action', critical: true, hint: 'Usually required before issuing a claim.' },
    { id: 'sc4', item: 'Receipts', critical: false, hint: 'Any purchase or repair receipts.' },
    { id: 'sc5', item: 'Photos', critical: false, hint: 'Dated photos of goods/work in dispute.' },
    { id: 'sc6', item: 'Timeline of events', critical: false, hint: 'Dates of purchase, complaint, escalation.' },
    { id: 'sc7', item: 'Loss calculation', critical: true, hint: 'Exact breakdown of the amount claimed.' },
  ],
  housing: [
    { id: 'h1', item: 'Tenancy agreement', critical: true, hint: 'Full signed agreement.' },
    { id: 'h2', item: 'Repair request log', critical: false, hint: 'Every written request, with dates.' },
    { id: 'h3', item: 'Photos of disrepair', critical: false, hint: 'Dated photos of the issue.' },
    { id: 'h4', item: 'Rent payment records', critical: false, hint: 'Statements or receipts.' },
    { id: 'h5', item: 'Section 21 / Section 8 notice', critical: true, hint: 'If facing eviction, check validity.' },
  ],
  police_complaint: [
    { id: 'pc1', item: 'Complaint reference number', critical: true, hint: 'Given when you submitted the complaint.' },
    { id: 'pc2', item: 'Officer emails / details', critical: true, hint: 'Names, badge numbers, correspondence.' },
    { id: 'pc3', item: 'SAR request', critical: false, hint: 'Request all data the force holds on you.' },
    { id: 'pc4', item: 'Body-worn video request', critical: false, hint: 'Time-sensitive — request early.' },
    { id: 'pc5', item: 'Incident log', critical: false, hint: 'The crime/incident reference number.' },
    { id: 'pc6', item: 'Outcome letter', critical: false, hint: 'The force's written response.' },
  ],
  employment: [
    { id: 'e1', item: 'Employment contract', critical: true, hint: 'Terms, pay, notice period.' },
    { id: 'e2', item: 'Grievance / disciplinary correspondence', critical: true, hint: 'All letters, emails, notes.' },
    { id: 'e3', item: 'ACAS early conciliation certificate', critical: true, hint: 'Required before an ET1 claim.' },
    { id: 'e4', item: 'Payslips', critical: false, hint: 'Relevant pay periods.' },
    { id: 'e5', item: 'Witness statements', critical: false, hint: 'Colleagues who witnessed relevant events.' },
  ],
  debt_financial: [
    { id: 'd1', item: 'Original credit agreement', critical: true, hint: 'Signed agreement.' },
    { id: 'd2', item: 'Default notice', critical: true, hint: 'Must meet statutory requirements.' },
    { id: 'd3', item: 'Statements of account', critical: false, hint: 'Full transaction history.' },
    { id: 'd4', item: 'Proof of payments made', critical: false, hint: 'Bank statements.' },
  ],
  general_complaint: [
    { id: 'gc1', item: 'Original complaint', critical: true, hint: 'Your first formal complaint.' },
    { id: 'gc2', item: 'Final response letter', critical: true, hint: 'Needed before escalating.' },
    { id: 'gc3', item: 'Evidence of the problem', critical: true, hint: 'Photos, screenshots, documents.' },
  ],
  other: [
    { id: 'o1', item: 'Core document proving your case', critical: true, hint: 'The single most important document.' },
    { id: 'o2', item: 'Timeline of events', critical: true, hint: 'A chronological summary.' },
  ],
};
```

*Risk detection* — pattern-matches on the `problem` and `importance` fields entered by the user (this is the natural hook for AI-assisted detection later):

```typescript
export function generateRisks(evidence: EvidenceItem[], caseData: CaseSetup) {
  const risks: { id: string; title: string; desc: string; severity: 'low'|'medium'|'high'|'critical' }[] = [];

  evidence.filter(e => e.importance === 'risky').forEach(e =>
    risks.push({ id: `r-${e.id}`, title: `"${e.title}" flagged as risky`,
      desc: 'This document may weaken or contradict your case.', severity: 'high' }));

  evidence.filter(e => e.problem === 'contradiction').forEach(e =>
    risks.push({ id: `c-${e.id}`, title: `Possible contradiction in "${e.title}"`,
      desc: 'Check this against your other evidence before including it.', severity: 'critical' }));

  evidence.filter(e => e.problem === 'not_your_name').forEach(e =>
    risks.push({ id: `n-${e.id}`, title: `"${e.title}" is not in your name`,
      desc: 'Documents not in your name may be challenged or given less weight.', severity: 'high' }));

  const duplicates = evidence.filter(e => e.importance === 'duplicate' || e.problem === 'duplicate');
  if (duplicates.length) risks.push({ id: 'dup', title: `${duplicates.length} duplicate document(s)`,
    desc: 'Duplicates make bundles harder to follow.', severity: 'medium' });

  if (caseData.stressLevel >= 8) risks.push({ id: 'stress',
    title: 'High stress level noted',
    desc: 'Consider asking someone else to read your written submissions before sending them — emotional language can weaken a case.',
    severity: 'low' });

  return risks;
}
```

*Next steps* and *adviser email* generators follow the same pattern — deterministic templates seeded from case data and the outputs of the functions above (find missing critical documents, review risky items, rename files to match exhibit refs, request outstanding documents via SAR, keep private copies, get sign-off before submission).

**Component Implementation**

```tsx
// components/LandingPage.tsx
export function LandingPage({ onStart }: { onStart: () => void }) {
  return (
    <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto px-4 py-16">
      <div>
        <h1 className="text-3xl md:text-4xl font-semibold text-gray-100 mb-4">
          Upload or list your messy evidence. We'll sort it into a usable bundle.
        </h1>
        <p className="text-gray-400 mb-6">
          For complaints, benefit challenges, housing issues, small claims, police complaints,
          employment disputes and more. This is an organisation tool, not legal advice.
        </p>
        <button onClick={onStart}
          className="bg-yellow-400 text-black font-semibold px-6 py-3 rounded-md hover:bg-yellow-300">
          Start new case
        </button>
      </div>
      <div className="bg-[#151515] border border-[#2a2a2a] rounded-lg p-5 text-sm text-gray-300 space-y-2">
        <p className="text-xs uppercase text-gray-500">What you get</p>
        <p>Timeline · Exhibit index · Strongest evidence · Gaps & risks · Export cover sheet</p>
      </div>
      <div className="md:col-span-2 space-y-3 text-xs text-gray-500 border-t border-[#2a2a2a] pt-6">
        <p>Documents may contain sensitive personal information. Do not upload anything unless you
          trust the service and understand how it is stored.</p>
        <p>For formal legal/court disclosure, you may need to disclose relevant documents even if
          they do not help you. This tool helps organise evidence but does not replace legal advice.</p>
      </div>
    </div>
  );
}
```

```tsx
// components/CaseSetupForm.tsx
export function CaseSetupForm({ value, onChange, onNext }: {
  value: CaseSetup; onChange: (c: CaseSetup) => void; onNext: () => void;
}) {
  const set = (patch: Partial<CaseSetup>) => onChange({ ...value, ...patch });
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
      <h2 className="text-xl font-semibold text-gray-100">Case setup</h2>
      <select className="input" value={value.caseType} onChange={e => set({ caseType: e.target.value as CaseType })}>
        <option value="universal_credit">Universal Credit / benefits challenge</option>
        <option value="mandatory_reconsideration">Mandatory reconsideration</option>
        <option value="small_claim">Small claim / consumer dispute</option>
        <option value="housing">Housing / landlord issue</option>
        <option value="police_complaint">Police complaint</option>
        <option value="employment">Employment issue</option>
        <option value="debt_financial">Debt / financial dispute</option>
        <option value="general_complaint">General complaint</option>
        <option value="other">Other</option>
      </select>
      <input className="input" placeholder="Case name" value={value.caseName} onChange={e => set({ caseName: e.target.value })} />
      <input className="input" placeholder="Opponent / organisation" value={value.opponent} onChange={e => set({ opponent: e.target.value })} />
      <textarea className="input" placeholder="What happened?" value={value.whatHappened} onChange={e => set({ whatHappened: e.target.value })} />
      <textarea className="input" placeholder="What outcome do you want?" value={value.desiredOutcome} onChange={e => set({ desiredOutcome: e.target.value })} />
      <input className="input" placeholder="Your main argument in one sentence" value={value.mainArgument} onChange={e => set({ mainArgument: e.target.value })} />
      <div className="grid grid-cols-2 gap-3">
        <input type="date" className="input" value={value.keyDate ?? ''} onChange={e => set({ keyDate: e.target.value })} />
        <input type="date" className="input" value={value.deadline ?? ''} onChange={e => set({ deadline: e.target.value })} />
      </div>
      <label className="text-sm text-gray-400">Stress level: {value.stressLevel}/10</label>
      <input type="range" min={1} max={10} value={value.stressLevel} onChange={e => set({ stressLevel: +e.target.value })} className="w-full" />
      <select className="input" value={value.purpose ?? ''} onChange={e => set({ purpose: e.target.value as any })}>
        <option value="">Is this for court / tribunal / complaint / adviser?</option>
        <option value="court">Court</option>
        <option value="tribunal">Tribunal</option>
        <option value="complaint">Complaint body</option>
        <option value="adviser">Adviser / solicitor</option>
        <option value="not_sure">Not sure yet</option>
      </select>
      <button onClick={onNext} className="bg-yellow-400 text-black font-semibold px-5 py-2 rounded-md">
        Save and add evidence
      </button>
    </div>
  );
}
```

`EvidenceEntryForm` repeats this pattern for every field listed in the brief (title, type, date, created-by, received-by, summary, proves-what, issue, importance, sensitivity, problem) and includes the file-upload placeholder and privacy note:

```tsx
// components/EvidenceEntryForm.tsx (excerpt — upload block)
<div className="border-2 border-dashed border-[#333] rounded-lg p-6 text-center text-gray-400">
  {/* TODO: connect to Supabase Storage for real file uploads */}
  {/* TODO: connect AI OCR (e.g. Textract / GPT-Vision) here to auto-fill title, date, sender, summary */}
  📎 File upload — placeholder only in this MVP. Describe the document manually below.
  <p className="text-xs mt-2 text-gray-500">
    Documents may contain sensitive personal information. Do not upload anything unless you trust
    the service and understand how it is stored.
  </p>
</div>
```

`EvidenceDashboard` composes the analysis components and applies plan gating:

```tsx
// components/EvidenceDashboard.tsx
export function EvidenceDashboard({ caseData, evidence, plan, onUpgrade }: {
  caseData: CaseSetup; evidence: EvidenceItem[]; plan: 'free'|'paid'; onUpgrade: () => void;
}) {
  const scored = evidence.map(e => ({ ...e, strengthScore: computeStrengthScore(e) }));
  const { score, label } = computeReadinessScore(caseData, scored);
  const exhibitItems = assignExhibitRefs(scored);
  const risks = generateRisks(scored, caseData);
  const missing = MISSING_EVIDENCE[caseData.caseType];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <HeroSummary caseData={caseData} score={score} label={label} />
      <StrongestEvidence items={scored} plan={plan} onUpgrade={onUpgrade} />
      <Timeline items={scored} caseData={caseData} plan={plan} onUpgrade={onUpgrade} />
      <UpgradeGate plan={plan} feature="Exhibit index" onUpgrade={onUpgrade}>
        <ExhibitIndex items={exhibitItems} />
      </UpgradeGate>
      <UpgradeGate plan={plan} feature="Keep / Maybe / Remove sorter" onUpgrade={onUpgrade}>
        <KeepMaybeRemoveSorter items={scored} />
      </UpgradeGate>
      <MissingEvidenceChecklist list={missing} plan={plan} onUpgrade={onUpgrade} />
      <UpgradeGate plan={plan} feature="Risk review" onUpgrade={onUpgrade}>
        <RiskReview risks={risks} />
      </UpgradeGate>
      <NextSteps caseData={caseData} evidence={scored} missing={missing} />
    </div>
  );
}

function UpgradeGate({ plan, feature, onUpgrade, children }: any) {
  if (plan === 'paid') return children;
  return (
    <div className="relative">
      <div className="opacity-30 pointer-events-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 rounded-lg">
        <p className="text-sm text-gray-300">{feature} is available on the paid plan</p>
        <button onClick={onUpgrade} className="bg-yellow-400 text-black text-sm px-4 py-2 rounded-md">
          Unlock full access
        </button>
      </div>
    </div>
  );
}
```

`StrongestEvidence` (free: top 5, paid: all), `Timeline` (free: first 8 dated events, paid: all), `ExhibitIndex` (grouped by A/B/C/D with renameable headings), `KeepMaybeRemoveSorter` (three columns with one-click bucket-move buttons, explicitly reassuring: *"Removing a document from the main bundle does not delete it or hide it — for court/tribunal you may still need to disclose it"*), `MissingEvidenceChecklist` (free: top 3, paid: full list with tick-off state), `RiskReview` (paid-only, sorted by severity, always ending with the disclosure reminder), `NextSteps` (always visible, tickable list with priority labels), and `ExportPage` (print CSS, cover page, timeline table, exhibit table, missing-evidence table, next steps, both legal notices repeated) all follow this same composition pattern, reading from the shared `scored`/`exhibitItems`/`risks`/`missing` data computed once in the dashboard.

`UpgradeModal` lists exactly the free-vs-paid split specified in the brief and is triggered from any `UpgradeGate` or from the dashboard header's "Unlock full bundle" button.

**Free vs Paid Enforcement**

| Feature | Free | Paid |
|---|---|---|
| Readiness score | ✅ | ✅ |
| Top 5 strongest documents | ✅ | Full list |
| Basic timeline (first 8 events) | ✅ | Full timeline |
| Top 3 missing items | ✅ | Full checklist |
| Full exhibit index (A/B/C/D) | 🔒 | ✅ |
| Keep/Maybe/Remove sorter | 🔒 | ✅ |
| Risk & contradiction review | 🔒 | ✅ |
| Adviser email draft | 🔒 | ✅ |
| Export / print bundle | 🔒 | ✅ |
| Saved cases, duplicate detection, version history | 🔒 | ✅ (wired via `case_runs` + `bundle_exports`) |

**Safety, Privacy & Disclosure**

Two pieces of copy are mandatory and must appear at every point where a user is about to add sensitive material or act on the tool's output:

> "Documents may contain sensitive personal information. Do not upload anything unless you trust the service and understand how it is stored."

> "For formal legal/court disclosure, you may need to disclose relevant documents even if they do not help you. This tool helps organise evidence but does not replace legal advice."

These are placed on the landing page footer, directly above the file-upload placeholder in `EvidenceEntryForm`, inside `RiskReview` (since this is exactly the screen where a user might be tempted to think about hiding a weak document), and again on the printed `ExportPage`. The Keep/Maybe/Remove sorter's "Remove" column is deliberately labelled "Remove from main bundle" rather than "Delete," and its helper text explicitly states that removing something from the working bundle does not exempt the user from a formal duty of disclosure — this directly satisfies the brief's requirement that the tool must never encourage hiding harmful evidence.

**AI/OCR Integration Points (Future Work)**

Every place a real document-reading pipeline would eventually plug in is marked with an explicit comment in the MVP code:

```typescript
// TODO: When a file is uploaded, send it to an OCR/AI extraction service
// (e.g. AWS Textract, GPT-Vision) to pre-fill: date, sender, recipient,
// a draft summary, and a suggested "what does it prove?" for the user to
// confirm or edit — never to auto-submit without user review.
```

This keeps the MVP honest about being a manual-entry organiser today while making the upgrade path to automated document reading a small, well-scoped addition rather than an architectural change.