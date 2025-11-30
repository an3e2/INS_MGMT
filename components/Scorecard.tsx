
import React from 'react';

const Scorecard: React.FC = () => {
  return (
    <div className="space-y-6">
       <div>
        <h2 className="text-2xl font-bold text-slate-800">Match Scorecard</h2>
        <p className="text-slate-500">Live: Indian Strikers vs Australia (Final)</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6">
          <div className="flex justify-between items-center text-center">
            <div>
              <h3 className="text-2xl font-bold">IND Strikers</h3>
              <p className="text-4xl font-black mt-2 text-blue-400">287/4</p>
              <p className="text-sm text-slate-400 mt-1">42.3 Overs</p>
            </div>
            <div className="text-sm font-bold bg-white/10 px-3 py-1 rounded-full uppercase tracking-wider">
              In Progress
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-400">Australia</h3>
              <p className="text-4xl font-black mt-2 text-slate-500">Yet to Bat</p>
              <p className="text-sm text-slate-400 mt-1">Target: -</p>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-slate-300">
            CRR: 6.75 • Projected: 345
          </div>
        </div>

        {/* Batsmen Table */}
        <div className="p-6">
          <h4 className="font-bold text-slate-800 mb-4 uppercase text-sm tracking-wider">Batting</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-sm">
                  <th className="pb-3 font-medium">Batter</th>
                  <th className="pb-3 font-medium">Dismissal</th>
                  <th className="pb-3 font-medium text-right">R</th>
                  <th className="pb-3 font-medium text-right">B</th>
                  <th className="pb-3 font-medium text-right">4s</th>
                  <th className="pb-3 font-medium text-right">6s</th>
                  <th className="pb-3 font-medium text-right">SR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="text-slate-700">
                  <td className="py-3 font-semibold text-slate-900">Rohit S.</td>
                  <td className="py-3 text-sm text-slate-500">c Warner b Cummins</td>
                  <td className="py-3 text-right font-bold">47</td>
                  <td className="py-3 text-right">31</td>
                  <td className="py-3 text-right">4</td>
                  <td className="py-3 text-right">3</td>
                  <td className="py-3 text-right">151.6</td>
                </tr>
                <tr className="text-slate-700 bg-blue-50/50">
                  <td className="py-3 font-semibold text-blue-900 flex items-center gap-2">
                    Virat K. <span className="text-[10px] bg-blue-600 text-white px-1 rounded">NOT OUT</span>
                  </td>
                  <td className="py-3 text-sm text-slate-500">Batting</td>
                  <td className="py-3 text-right font-bold text-blue-900">104</td>
                  <td className="py-3 text-right">98</td>
                  <td className="py-3 text-right">10</td>
                  <td className="py-3 text-right">2</td>
                  <td className="py-3 text-right">106.1</td>
                </tr>
                <tr className="text-slate-700">
                  <td className="py-3 font-semibold text-slate-900">Shubman G.</td>
                  <td className="py-3 text-sm text-slate-500">b Starc</td>
                  <td className="py-3 text-right font-bold">22</td>
                  <td className="py-3 text-right">24</td>
                  <td className="py-3 text-right">3</td>
                  <td className="py-3 text-right">0</td>
                  <td className="py-3 text-right">91.6</td>
                </tr>
                 <tr className="text-slate-700 bg-blue-50/50">
                  <td className="py-3 font-semibold text-blue-900 flex items-center gap-2">
                    KL R. <span className="text-[10px] bg-blue-600 text-white px-1 rounded">NOT OUT</span>
                  </td>
                  <td className="py-3 text-sm text-slate-500">Batting</td>
                  <td className="py-3 text-right font-bold text-blue-900">45</td>
                  <td className="py-3 text-right">32</td>
                  <td className="py-3 text-right">4</td>
                  <td className="py-3 text-right">1</td>
                  <td className="py-3 text-right">140.6</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scorecard;