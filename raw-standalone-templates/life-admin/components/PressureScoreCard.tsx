import { PressureLevel } from '../types';

export function PressureScoreCard({ score, level }: { score: number; level: PressureLevel }) {
  const getColors = () => {
    switch (level) {
      case 'calm': return 'bg-[var(--green)] text-black';
      case 'manageable': return 'bg-green-800 text-green-100';
      case 'overloaded': return 'bg-[var(--orange)] text-black';
      case 'urgent': return 'bg-[var(--red)] text-white';
    }
  };

  const getMessage = () => {
    switch (level) {
      case 'calm': return "You've got a handle on this.";
      case 'manageable': return "A few things need doing — nothing urgent yet.";
      case 'overloaded': return "You're carrying a lot. Start with the top three today.";
      case 'urgent': return "Some things need attention today. Let's do the first one now.";
    }
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
      <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-lg ${getColors()}`}>
        <span className="text-3xl font-bold">{score}</span>
      </div>
      <div>
        <h2 className="text-xl font-bold capitalize text-[var(--text-primary)] mb-1">Pressure: {level}</h2>
        <p className="text-[var(--text-secondary)]">{getMessage()}</p>
      </div>
    </div>
  );
}
