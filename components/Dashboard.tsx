
import React from 'react';
import { Player, Match } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Users, Activity, TrendingUp } from 'lucide-react';

interface DashboardProps {
  players: Player[];
  matches: Match[];
}

const Dashboard: React.FC<DashboardProps> = ({ players, matches }) => {
  const totalRuns = players.reduce((acc, p) => acc + p.runsScored, 0);
  const totalWickets = players.reduce((acc, p) => acc + p.wicketsTaken, 0);
  const wonMatches = matches.filter(m => m.result === 'Won').length;
  
  const topScorers = [...players].sort((a, b) => b.runsScored - a.runsScored).slice(0, 5);

  const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: React.ReactNode, color: string }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center space-x-4">
      <div className={`p-4 rounded-xl ${color} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Team Overview</h2>
        <p className="text-slate-500">Welcome back, Manager.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Squad Size" 
          value={players.length} 
          icon={<Users size={24} />} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Matches Won" 
          value={wonMatches} 
          icon={<Trophy size={24} />} 
          color="bg-yellow-500" 
        />
        <StatCard 
          title="Total Runs" 
          value={totalRuns.toLocaleString()} 
          icon={<Activity size={24} />} 
          color="bg-orange-500" 
        />
        <StatCard 
          title="Total Wickets" 
          value={totalWickets} 
          icon={<TrendingUp size={24} />} 
          color="bg-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Run Scorers</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topScorers} layout="vertical" margin={{ left: 40 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  width={100}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="runsScored" radius={[0, 4, 4, 0]} barSize={20}>
                  {topScorers.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#f97316'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Upcoming Fixtures</h3>
          <div className="space-y-4">
            {matches.filter(m => m.isUpcoming).slice(0, 3).map(match => (
              <div key={match.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded font-semibold">VS</span>
                  <span className="text-slate-400 text-xs">{new Date(match.date).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-slate-800">{match.opponent}</h4>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  {match.venue}
                </p>
              </div>
            ))}
            {matches.filter(m => m.isUpcoming).length === 0 && (
              <p className="text-slate-400 text-center py-4">No upcoming matches scheduled.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;