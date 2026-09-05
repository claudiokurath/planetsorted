import { CaseSetup, EvidenceItem, ExhibitCategory } from './types';

export function computeStrengthScore(item: EvidenceItem): number {
  let score = 0;
  if (item.importance === 'core') score += 30;
  else if (item.importance === 'supporting') score += 20;
  else if (item.importance === 'background') score += 10;

  if (item.date) score += 10;
  if (item.provesWhat?.trim().length > 10) score += 20;
  if (!item.problem) score += 10;
  if (item.documentType && ['official_letter', 'medical'].includes(item.documentType)) score += 15;

  return Math.min(100, score);
}

export function defaultExhibitCategory(item: EvidenceItem): ExhibitCategory {
  if (item.documentType === 'official_letter') return 'core';
  if (item.documentType && ['email', 'note', 'screenshot'].includes(item.documentType)) return 'correspondence';
  if (item.documentType && ['receipt', 'bank_statement'].includes(item.documentType)) return 'financial';
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
