
import React from 'react';
import { AREAS } from '../constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const SideHustleGrid: React.FC = () => {
  return (
    <div className="my-12">
      <h3 className="text-2xl font-bold mb-6 text-slate-800 text-center">2026年に注目の4大副業フィールド</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {AREAS.map((area) => (
          <div key={area.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{area.icon}</span>
              <div>
                <h4 className="text-lg font-bold text-slate-800">{area.title}</h4>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                  area.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                  area.difficulty === 'Medium' ? 'bg-blue-100 text-blue-700' :
                  'bg-orange-100 text-orange-700'
                }`}>
                  難易度: {area.difficulty}
                </span>
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-4">{area.description}</p>
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">推奨スキル</p>
              <div className="flex flex-wrap gap-2">
                {area.keySkills.map((skill) => (
                  <span key={skill} className="text-xs bg-slate-50 text-slate-600 px-2 py-1 rounded border border-slate-100">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-400">市場の期待値</span>
              <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full" 
                  style={{ width: `${area.marketDemand}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-12 p-6 bg-slate-900 rounded-2xl text-white">
        <h4 className="text-lg font-bold mb-4 text-center">各分野の需要ボリューム比較</h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={AREAS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="title" stroke="#94a3b8" tick={{ fontSize: 10 }} />
              <YAxis hide domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Bar dataKey="marketDemand" radius={[4, 4, 0, 0]}>
                {AREAS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
