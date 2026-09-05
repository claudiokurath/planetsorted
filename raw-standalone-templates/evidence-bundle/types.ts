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
