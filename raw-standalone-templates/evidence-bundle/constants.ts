import { CaseType } from './types';

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
    { id: 'pc6', item: 'Outcome letter', critical: false, hint: 'The force\'s written response.' },
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
