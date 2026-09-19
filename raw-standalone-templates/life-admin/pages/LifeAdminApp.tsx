import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AdminItem, AdminRun } from '../types';
import { runPrioritySorter, parseBrainDumpHeuristic } from '../logic';

import { LandingPage } from '../components/LandingPage';
import { BrainDumpInput } from '../components/BrainDumpInput';
import { AdminItemForm } from '../components/AdminItemForm';
import { ResultsDashboard } from '../components/ResultsDashboard';
import { ExportPage } from '../components/ExportPage';
import { UpgradeModal } from '../components/UpgradeModal';

export default function LifeAdminApp() {
  const navigate = useNavigate();
  
  const [run, setRun] = useState<AdminRun | null>(null);
  const [items, setItems] = useState<AdminItem[]>([]);
  const [dumpText, setDumpText] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    const sRun = localStorage.getItem('life_admin_run');
    if (sRun) setRun(JSON.parse(sRun));
  }, []);

  useEffect(() => {
    if (run) {
      localStorage.setItem('life_admin_run', JSON.stringify(run));
    }
  }, [run]);

  const handleStart = () => {
    setItems([]);
    setDumpText("");
    navigate('/life-admin/dump');
  };

  const handleProcessDump = () => {
    const parsed = parseBrainDumpHeuristic(dumpText);
    const newRun = runPrioritySorter(parsed);
    setRun(newRun);
    navigate('/life-admin/dashboard');
  };

  const handleManualAdd = (item: AdminItem) => {
    setItems([...items, item]);
  };

  const handleManualDone = () => {
    const newRun = runPrioritySorter(items);
    setRun(newRun);
    navigate('/life-admin/dashboard');
  };

  return (
    <>
      <Routes>
        <Route path="/" element={<LandingPage onStart={handleStart} onDemo={handleStart} />} />
        
        <Route path="/dump" element={
          <BrainDumpInput 
            value={dumpText} 
            onChange={setDumpText} 
            onProcess={handleProcessDump} 
            onSwitchToForm={() => navigate('/life-admin/form')} 
          />
        } />
        
        <Route path="/form" element={
          <AdminItemForm 
            items={items} 
            onAdd={handleManualAdd} 
            onDone={handleManualDone} 
          />
        } />
        
        <Route path="/dashboard" element={
          run ? (
            <ResultsDashboard 
              run={run} 
              isPaid={isPaid} 
              onUpgrade={() => setShowUpgrade(true)} 
              onExport={() => navigate('/life-admin/export')} 
            />
          ) : (
            <div className="p-8 text-center text-white life-admin-theme">No run found. <button onClick={() => navigate('/life-admin')} className="text-[var(--yellow)] underline">Go back</button></div>
          )
        } />
        
        <Route path="/export" element={
          run ? (
            <ExportPage run={run} onBack={() => navigate('/life-admin/dashboard')} />
          ) : null
        } />
      </Routes>

      {showUpgrade && <UpgradeModal onClose={() => setShowUpgrade(false)} onUpgrade={() => { setIsPaid(true); setShowUpgrade(false); }} />}
    </>
  );
}
