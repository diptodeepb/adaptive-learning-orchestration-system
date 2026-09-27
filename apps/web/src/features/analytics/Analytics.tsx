import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Loader2, Database, Brain, Target, Network } from 'lucide-react';

export default function Analytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/v1/analytics');
        if (response.ok) {
          const json = await response.json();
          setData(json);
        }
      } catch (e) {
        console.error("Failed to fetch analytics", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading || !data) {
    return <div className="flex flex-col items-center justify-center h-[50vh]"><Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" /><span className="font-mono text-sm text-slate-500">Querying EDNet dataset...</span></div>;
  }

  const { subjectMastery, radarData, questionProficiency } = data;

  return (
    <div className="space-y-8 pb-10">
      
      {/* Global Distribution Analysis */}
      <section>
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Database className="w-5 h-5 text-indigo-500" />
          <h2 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
             EDNet Dataset Overview
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {subjectMastery.map((item: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm font-mono flex flex-col justify-between">
              <div className="mb-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">{item.subject}</div>
                <div className="text-xl font-bold text-slate-800 dark:text-slate-200">{item.level}</div>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-sm h-1.5 mb-2">
                <div className="bg-indigo-500 h-1.5 rounded-sm" style={{ width: item.accuracy }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 uppercase tracking-wide">
                <span>Acc: {item.accuracy}</span>
                <span>Vol: {item.quizzes || item.chapters}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Spider Graph & Telemetry Metrics */}
      <section>
        <div className="flex items-center gap-2 mb-4 border-b border-slate-200 dark:border-slate-800 pb-3 mt-8">
          <Network className="w-5 h-5 text-teal-500" />
          <h2 className="text-xl font-bold font-mono text-slate-800 dark:text-slate-100 uppercase tracking-wider">
             Subject Proficiency Radar
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Radar Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px]">
            <ResponsiveContainer width="100%" height={350}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#475569', fontSize: 10 }} />
                <Radar name="EDNet Global" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} dot={{ r: 4, fill: '#6366f1' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Raw Metrics List */}
          <div className="flex flex-col gap-3 font-mono">
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-4 shadow-sm text-green-400 text-xs mb-2">
               &gt; Streaming live EDNet student aggregations from HuggingFace dataset.
            </div>
            
            {questionProficiency.map((item: any, idx: number) => (
              <div key={idx} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-sm ${item.color}`}></div>
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200 text-sm">{item.type}</div>
                    <div className="text-xs text-slate-500 mt-1 uppercase">Metric tracked</div>
                  </div>
                </div>
                <div className={`text-xl font-bold ${parseFloat(item.score) < 85 ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {item.correct}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
