import { useState } from 'react';
import { Moon, Sun, BrainCircuit, Activity } from 'lucide-react';
import LearnerStateWidget from './components/LearnerStateWidget';
import InterventionCard from './components/InterventionCard';
import AgentProposals from './components/AgentProposals';

function App() {
  const [isDark, setIsDark] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const toggleTheme = (e: React.MouseEvent) => {
    const isDarkNow = document.documentElement.classList.contains('dark');
    
    // Fallback if browser doesn't support View Transitions
    if (!document.startViewTransition) {
      document.documentElement.classList.toggle('dark');
      setIsDark(!isDarkNow);
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(
      Math.max(x, innerWidth - x),
      Math.max(y, innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
      document.documentElement.classList.toggle('dark');
      setIsDark(!isDarkNow);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${endRadius}px at ${x}px ${y}px)`
      ];

      document.documentElement.animate(
        {
          clipPath: isDarkNow ? [...clipPath].reverse() : clipPath,
        },
        {
          duration: 600,
          easing: 'ease-in-out',
          pseudoElement: isDarkNow
            ? '::view-transition-old(root)'
            : '::view-transition-new(root)',
        }
      );
    });
  };

  const simulateIntervention = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/decisions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mastery: 0.4, uncertainty: 0.85, concept_id: "quantum_physics" })
      });
      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      <header className="flex justify-between items-center mb-12 relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-500/10 rounded-xl">
            <BrainCircuit className="w-8 h-8 text-blue-500" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Orchestrator</h1>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-3 glass rounded-full hover:scale-110 transition-transform active:scale-95"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10 animate-fade-in">
        <div className="lg:col-span-1 space-y-8">
          <LearnerStateWidget data={data?.learner_state ?? { mastery: 0.4, uncertainty: 0.85 }} />
          
          <button 
            onClick={simulateIntervention}
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
          >
            {loading ? <Activity className="w-5 h-5 animate-spin" /> : <Activity className="w-5 h-5" />}
            {loading ? "Agents Negotiating..." : "Trigger Intervention"}
          </button>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <InterventionCard 
            decision={data?.decision} 
            status={data?.validation_status} 
            loading={loading} 
          />
          <AgentProposals proposals={data?.proposals} loading={loading} />
        </div>
      </main>
    </div>
  );
}

export default App;
