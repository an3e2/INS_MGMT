
import React, { useState } from 'react';
import { Player, PlayerRole, UserRole } from '../types';
import { Trophy, AlertTriangle, Lock, ArrowRight, ArrowLeft } from 'lucide-react';

interface MatchSelectionProps {
  players: Player[];
  userRole: UserRole;
}

interface PlayerCardProps {
  player: Player;
  isSelected: boolean;
  onToggle: (id: string) => void;
  canEdit: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, isSelected, onToggle, canEdit }) => (
  <div 
    onClick={() => onToggle(player.id)}
    className={`
      relative p-3 rounded-xl border flex items-center gap-3 transition-all cursor-pointer group hover:scale-[1.02]
      ${isSelected 
        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/20' 
        : 'bg-white border-slate-100 hover:border-blue-300 hover:bg-blue-50 text-slate-800 shadow-sm'}
      ${!canEdit ? 'pointer-events-none' : ''}
    `}
  >
    <div className="relative">
      <img 
        src={player.avatarUrl} 
        alt={player.name} 
        className={`w-10 h-10 rounded-full object-cover ${!isSelected && !player.isAvailable ? 'grayscale opacity-60' : ''}`} 
      />
      {player.isCaptain && <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white text-[10px] flex items-center justify-center font-bold text-slate-900">C</span>}
      {player.isViceCaptain && <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-400 rounded-full border-2 border-white text-[10px] flex items-center justify-center font-bold text-white">V</span>}
    </div>
    <div className="flex-1 min-w-0">
      <h4 className="font-bold text-sm truncate">{player.name}</h4>
      <p className={`text-xs truncate ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
        {player.role}
      </p>
    </div>
    {canEdit && (
      <div className={`p-1 rounded-full ${isSelected ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-blue-200'}`}>
          {isSelected ? <ArrowLeft size={14} /> : <ArrowRight size={14} />}
      </div>
    )}
  </div>
);

const MatchSelection: React.FC<MatchSelectionProps> = ({ players, userRole }) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const canEdit = userRole === 'admin';

  const toggleSelection = (id: string) => {
    if (!canEdit) return;
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      if (newSelection.size < 11) {
        newSelection.add(id);
      }
    }
    setSelectedIds(newSelection);
  };

  const selectedPlayers = players.filter(p => selectedIds.has(p.id));
  const availablePlayers = players.filter(p => !selectedIds.has(p.id));

  // Stats
  const batsmen = selectedPlayers.filter(p => p.role === PlayerRole.BATSMAN).length;
  const bowlers = selectedPlayers.filter(p => p.role === PlayerRole.BOWLER).length;
  const allRounders = selectedPlayers.filter(p => p.role === PlayerRole.ALL_ROUNDER).length;
  const keepers = selectedPlayers.filter(p => p.role === PlayerRole.WICKET_KEEPER).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Match Selection</h2>
          <p className="text-slate-500">
            {canEdit ? 'Click players to move them between squad and playing XI' : 'Confirmed Team Sheet'}
          </p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 pr-6 rounded-xl shadow-sm border border-slate-100">
           <div className={`
             w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl
             ${selectedIds.size === 11 ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}
           `}>
             {selectedIds.size}
           </div>
           <div>
             <p className="text-xs text-slate-400 uppercase font-bold">Selected</p>
             <p className="text-sm font-medium text-slate-700">Target: 11</p>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)]">
        {/* Left Column: Available Pool */}
        <div className="lg:col-span-4 flex flex-col bg-slate-100 rounded-2xl p-4 border border-slate-200 overflow-hidden">
          <h3 className="font-bold text-slate-500 uppercase text-xs mb-3 flex justify-between">
            Available Squad <span>{availablePlayers.length}</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {availablePlayers.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                isSelected={false} 
                onToggle={toggleSelection}
                canEdit={canEdit}
              />
            ))}
            {availablePlayers.length === 0 && (
              <p className="text-center text-slate-400 text-sm mt-10">All players selected.</p>
            )}
          </div>
        </div>

        {/* Middle Column: Visualizer (Desktop) or Spacer */}
        <div className="lg:col-span-4 lg:flex hidden flex-col justify-center items-center space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-xl w-full border border-slate-100">
                <h3 className="text-center font-bold text-slate-800 mb-6 flex items-center justify-center gap-2">
                   <Trophy size={18} className="text-yellow-500" /> Balance
                </h3>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Batsmen</span>
                      <span className="text-slate-800">{batsmen}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${(batsmen/6)*100}%` }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Bowlers</span>
                      <span className="text-slate-800">{bowlers}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 transition-all duration-500" style={{ width: `${(bowlers/4)*100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">All-Rounders</span>
                      <span className="text-slate-800">{allRounders}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${(allRounders/2)*100}%` }}></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-500">Wicket Keeper</span>
                      <span className="text-slate-800">{keepers}</span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 transition-all duration-500" style={{ width: `${(keepers/1)*100}%` }}></div>
                    </div>
                  </div>
                </div>

                {selectedIds.size !== 11 && (
                  <div className="mt-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                    <AlertTriangle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-600 font-medium">
                       Select exactly 11 players.
                    </p>
                  </div>
                )}
            </div>

             <button 
                disabled={selectedIds.size !== 11 || !canEdit}
                className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                  ${canEdit 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30 hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100'
                    : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                  }
                `}
              >
                {canEdit ? 'Lock Team Sheet' : <><Lock size={16} /> Locked by Admin</>}
              </button>
        </div>

        {/* Right Column: Playing XI */}
        <div className="lg:col-span-4 flex flex-col bg-white rounded-2xl p-4 border-2 border-blue-100 shadow-xl overflow-hidden">
          <h3 className="font-bold text-blue-800 uppercase text-xs mb-3 flex justify-between">
            Playing XI <span>{selectedPlayers.length}/11</span>
          </h3>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {selectedPlayers.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                  <Trophy size={48} className="mb-2" />
                  <p className="text-sm">Select players from squad</p>
               </div>
            ) : (
              selectedPlayers.map(player => (
                <PlayerCard 
                  key={player.id} 
                  player={player} 
                  isSelected={true} 
                  onToggle={toggleSelection}
                  canEdit={canEdit}
                />
              ))
            )}
          </div>
        </div>
        
        {/* Mobile Stats Panel (Shown only on small screens) */}
         <div className="lg:hidden col-span-full">
            <button 
                disabled={selectedIds.size !== 11 || !canEdit}
                className={`w-full py-3 rounded-xl font-bold transition-all
                  ${canEdit 
                    ? 'bg-blue-600 text-white disabled:opacity-50 disabled:bg-slate-300'
                    : 'bg-slate-200 text-slate-500'
                  }
                `}
              >
                {selectedIds.size !== 11 ? `Select ${11 - selectedIds.size} more` : 'Lock Team Sheet'}
              </button>
         </div>
      </div>
    </div>
  );
};

export default MatchSelection;