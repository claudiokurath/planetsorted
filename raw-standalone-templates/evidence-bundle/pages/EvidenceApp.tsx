import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { CaseSetup, EvidenceItem } from '../types';
import { LandingPage } from '../components/LandingPage';
import { CaseSetupForm } from '../components/CaseSetupForm';
import { EvidenceEntryForm } from '../components/EvidenceEntryForm';
import { EvidenceDashboard } from '../components/EvidenceDashboard';
import { ExportPage } from '../components/ExportPage';
import { UpgradeModal } from '../components/UpgradeModal';

const defaultCase: CaseSetup = {
  id: '',
  caseType: 'universal_credit',
  caseName: '',
  opponent: '',
  whatHappened: '',
  desiredOutcome: '',
  keyDate: null,
  deadline: null,
  mainArgument: '',
  stressLevel: 5,
  purpose: null
};

export default function EvidenceApp() {
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState<CaseSetup>(defaultCase);
  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [plan, setPlan] = useState<'free'|'paid'>('free');
  const [showUpgrade, setShowUpgrade] = useState(false);

  // Current item being edited
  const [currentItem, setCurrentItem] = useState<EvidenceItem>({
    id: crypto.randomUUID(), caseId: '', title: '', documentType: 'other', date: null,
    createdBy: '', receivedBy: '', summary: '', provesWhat: '', supportsIssue: '',
    importance: 'not_sure', isSensitive: false, problem: null
  });

  // Load from local storage
  useEffect(() => {
    const sCase = localStorage.getItem('evidence_case');
    const sEvidence = localStorage.getItem('evidence_items');
    if (sCase) setCaseData(JSON.parse(sCase));
    if (sEvidence) setEvidence(JSON.parse(sEvidence));
  }, []);

  // Save to local storage
  useEffect(() => {
    if (caseData.id) {
      localStorage.setItem('evidence_case', JSON.stringify(caseData));
      localStorage.setItem('evidence_items', JSON.stringify(evidence));
    }
  }, [caseData, evidence]);

  const handleStart = () => {
    setCaseData({ ...defaultCase, id: crypto.randomUUID() });
    setEvidence([]);
    navigate('/evidence/setup');
  };

  const handleSetupNext = () => {
    navigate('/evidence/entry');
  };

  const handleEntryNext = () => {
    setEvidence([...evidence, currentItem]);
    setCurrentItem({
      id: crypto.randomUUID(), caseId: caseData.id, title: '', documentType: 'other', date: null,
      createdBy: '', receivedBy: '', summary: '', provesWhat: '', supportsIssue: '',
      importance: 'not_sure', isSensitive: false, problem: null
    });
    // Stay on entry page
  };

  const handleEntryDone = () => {
    // If they typed a title but didn't save, save it.
    if (currentItem.title.trim()) {
      setEvidence([...evidence, currentItem]);
    }
    navigate('/evidence/dashboard');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onStart={handleStart} />} />
        
        <Route path="/setup" element={
          <CaseSetupForm value={caseData} onChange={setCaseData} onNext={handleSetupNext} />
        } />
        
        <Route path="/entry" element={
          <EvidenceEntryForm value={currentItem} onChange={setCurrentItem} onNext={handleEntryNext} onDone={handleEntryDone} />
        } />
        
        <Route path="/dashboard" element={
          <EvidenceDashboard caseData={caseData} evidence={evidence} plan={plan} onUpgrade={() => setShowUpgrade(true)} onExport={() => navigate('/evidence/export')} />
        } />
        
        <Route path="/export" element={
          <ExportPage caseData={caseData} evidence={evidence} onBack={() => navigate('/evidence/dashboard')} />
        } />
      </Routes>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} />}
    </>
  );
}
