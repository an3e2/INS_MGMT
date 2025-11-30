
import React, { useState, useRef } from 'react';
import { Player, PlayerRole, BattingStyle, BowlingStyle, UserRole } from '../types';
import { Plus, Trash2, Edit2, Shield, Sword, CircleDot, X, Upload, Activity, Medal, UserCheck, UserX, Lock, AlertTriangle } from 'lucide-react';

interface PlayerListProps {
  players: Player[];
  userRole: UserRole;
  onAddPlayer: (player: Player) => void;
  onUpdatePlayer: (player: Player) => void;
  onDeletePlayer: (id: string) => void;
}

const PlayerList: React.FC<PlayerListProps> = ({ players, userRole, onAddPlayer, onUpdatePlayer, onDeletePlayer }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [viewingPlayer, setViewingPlayer] = useState<Player | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const canEdit = userRole === 'admin';

  const [formData, setFormData] = useState<Partial<Player>>({
    role: PlayerRole.BATSMAN,
    battingStyle: BattingStyle.RIGHT_HAND,
    bowlingStyle: BowlingStyle.NONE,
    isCaptain: false,
    isViceCaptain: false,
    isAvailable: true,
    avatarUrl: ''
  });

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setFormData({
      role: PlayerRole.BATSMAN,
      battingStyle: BattingStyle.RIGHT_HAND,
      bowlingStyle: BowlingStyle.NONE,
      isCaptain: false,
      isViceCaptain: false,
      isAvailable: true,
      matchesPlayed: 0,
      runsScored: 0,
      wicketsTaken: 0,
      average: 0,
      avatarUrl: `https://picsum.photos/200/200?random=${Date.now()}`
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (player: Player, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canEdit) return;
    setEditingPlayer(player);
    setFormData({ ...player });
    setIsModalOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
       const checked = (e.target as HTMLInputElement).checked;
       setFormData(prev => ({
         ...prev,
         [name]: checked,
         // Mutex for Captain/VC
         ...(name === 'isCaptain' && checked ? { isViceCaptain: false } : {}),
         ...(name === 'isViceCaptain' && checked ? { isCaptain: false } : {})
       }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatarUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.role) {
      const playerData: Player = {
        id: editingPlayer ? editingPlayer.id : Date.now().toString(),
        name: formData.name,
        role: formData.role as PlayerRole,
        battingStyle: (formData.battingStyle as BattingStyle) || BattingStyle.RIGHT_HAND,
        bowlingStyle: (formData.bowlingStyle as BowlingStyle) || BowlingStyle.NONE,
        matchesPlayed: Number(formData.matchesPlayed) || 0,
        runsScored: Number(formData.runsScored) || 0,
        wicketsTaken: Number(formData.wicketsTaken) || 0,
        average: Number(formData.average) || 0,
        isCaptain: !!formData.isCaptain,
        isViceCaptain: !!formData.isViceCaptain,
        isAvailable: formData.isAvailable !== undefined ? formData.isAvailable : true,
        avatarUrl: formData.avatarUrl || `https://picsum.photos/200/200?random=${Date.now()}`
      };

      if (editingPlayer) {
        onUpdatePlayer(playerData);
      } else {
        onAddPlayer(playerData);
      }
      setIsModalOpen(false);
    }
  };

  const handleToggleAvailability = (player: Player, e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdatePlayer({ ...player, isAvailable: !player.isAvailable });
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (editingPlayer) {
      onDeletePlayer(editingPlayer.id);
      setShowDeleteConfirm(false);
      setIsModalOpen(false);
    }
  };

  const getRoleIcon = (role: PlayerRole) => {
    switch (role) {
      case PlayerRole.BATSMAN: return <Sword size={16} className="text-blue-500" />;
      case PlayerRole.BOWLER: return <CircleDot size={16} className="text-red-500" />;
      default: return <Shield size={16} className="text-green-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Squad Roster</h2>
          <p className="text-slate-500">
            {canEdit ? 'Manage players, stats, and availability' : 'View player profiles and stats'}
          </p>
        </div>
        {canEdit && (
          <button 
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20 hover:scale-105"
          >
            <Plus size={20} />
            Recruit Player
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {players.map((player) => (
          <div 
            key={player.id} 
            onClick={() => setViewingPlayer(player)}
            className="group relative bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
          >
            {/* Header / Background */}
            <div className={`h-24 bg-gradient-to-r ${player.isAvailable ? 'from-slate-800 to-slate-900' : 'from-slate-200 to-slate-300'}`}>
              <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
                {player.isCaptain && (
                  <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded shadow-sm tracking-wider">CPT</span>
                )}
                {player.isViceCaptain && (
                  <span className="bg-blue-400 text-blue-900 text-[10px] font-black px-2 py-0.5 rounded shadow-sm tracking-wider">VC</span>
                )}
              </div>
              
              {/* Quick Availability Toggle (Moved to Bottom Right) */}
              {canEdit && (
                <button 
                  onClick={(e) => handleToggleAvailability(player, e)}
                  className={`absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold shadow-md transition-all z-10
                    ${player.isAvailable 
                      ? 'bg-green-500 text-white hover:bg-green-600' 
                      : 'bg-red-500 text-white hover:bg-red-600'}
                  `}
                  title="Toggle Availability"
                >
                  {player.isAvailable ? <UserCheck size={10} /> : <UserX size={10} />}
                  {player.isAvailable ? 'ACTIVE' : 'AWAY'}
                </button>
              )}
            </div>

            {/* Avatar */}
            <div className="absolute top-10 left-6">
              <div className="relative">
                <img 
                  src={player.avatarUrl} 
                  alt={player.name} 
                  className={`w-20 h-20 rounded-2xl border-4 border-white object-cover shadow-md ${!player.isAvailable ? 'grayscale opacity-80' : ''}`}
                />
                <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${player.isAvailable ? 'bg-green-500' : 'bg-red-500'}`} title={player.isAvailable ? 'Available' : 'Unavailable'}></div>
              </div>
            </div>

            <div className="pt-10 p-6">
              <div className="flex justify-between items-start mb-1">
                <h3 className={`text-lg font-bold ${player.isAvailable ? 'text-slate-800' : 'text-slate-500'}`}>{player.name}</h3>
                {canEdit && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleOpenEdit(player, e)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Profile"
                    >
                      <Edit2 size={16} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
                {getRoleIcon(player.role)}
                <span className="font-medium">{player.role}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                 <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                   <span className="text-slate-400 block uppercase text-[10px]">Runs</span>
                   <span className="font-bold text-slate-700 text-sm">{player.runsScored}</span>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                   <span className="text-slate-400 block uppercase text-[10px]">Wickets</span>
                   <span className="font-bold text-slate-700 text-sm">{player.wicketsTaken}</span>
                 </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && canEdit && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="bg-slate-900 p-6 flex justify-between items-center sticky top-0 z-10">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                {editingPlayer ? <Edit2 size={20} className="text-blue-400" /> : <Plus size={20} className="text-blue-400" />}
                {editingPlayer ? 'Edit Player Profile' : 'New Signing'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Profile Image & Status */}
              <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                <div 
                  className="relative w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 shadow-inner flex items-center justify-center overflow-hidden cursor-pointer group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {formData.avatarUrl ? (
                    <img src={formData.avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <UserCheck size={32} className="text-slate-500" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Upload size={20} className="text-white" />
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleFileChange} 
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                    <input 
                      required 
                      name="name" 
                      value={formData.name || ''} 
                      onChange={handleInputChange} 
                      className="w-full p-2 border-b-2 border-slate-200 focus:border-blue-500 outline-none font-bold text-xl bg-transparent placeholder-slate-300 text-slate-800" 
                      placeholder="Player Name" 
                    />
                  </div>
                </div>
              </div>

              {/* Roles & Styles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select name="role" value={formData.role} onChange={handleInputChange} className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.values(PlayerRole).map(role => <option key={role} value={role}>{role}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batting Style</label>
                  <select name="battingStyle" value={formData.battingStyle} onChange={handleInputChange} className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.values(BattingStyle).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Bowling Style</label>
                  <select name="bowlingStyle" value={formData.bowlingStyle} onChange={handleInputChange} className="w-full p-2.5 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
                    {Object.values(BowlingStyle).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Leadership */}
              <div className="flex gap-6 p-4 bg-slate-50 rounded-xl">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isCaptain" checked={formData.isCaptain} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">Team Captain</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="isViceCaptain" checked={formData.isViceCaptain} onChange={handleInputChange} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                    <span className="text-sm font-semibold text-slate-700">Vice Captain</span>
                 </label>
              </div>

              {/* Stats Manual Entry */}
              <div>
                <h4 className="text-sm font-bold text-slate-800 uppercase mb-3 flex items-center gap-2">
                  <Activity size={16} /> Legacy Stats
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Matches</label>
                    <input type="number" name="matchesPlayed" value={formData.matchesPlayed} onChange={handleInputChange} className="w-full p-2 bg-slate-800 border border-slate-700 text-white rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Runs</label>
                    <input type="number" name="runsScored" value={formData.runsScored} onChange={handleInputChange} className="w-full p-2 bg-slate-800 border border-slate-700 text-white rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Wickets</label>
                    <input type="number" name="wicketsTaken" value={formData.wicketsTaken} onChange={handleInputChange} className="w-full p-2 bg-slate-800 border border-slate-700 text-white rounded-lg outline-none" />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">Average</label>
                    <input type="number" step="0.01" name="average" value={formData.average} onChange={handleInputChange} className="w-full p-2 bg-slate-800 border border-slate-700 text-white rounded-lg outline-none" />
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-between gap-3 border-t border-slate-100">
                <div>
                   {editingPlayer && (
                    <button 
                      type="button"
                      onClick={handleDeleteClick}
                      className="px-4 py-2.5 text-red-500 hover:bg-red-50 rounded-xl font-medium flex items-center gap-2"
                    >
                      <Trash2 size={18} /> Delete Player
                    </button>
                   )}
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-medium">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold shadow-lg shadow-blue-500/20">
                    {editingPlayer ? 'Save Changes' : 'Sign Player'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl border border-red-100">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-500">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Delete Player?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Are you sure you want to delete <span className="font-bold text-slate-800">{editingPlayer?.name}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleConfirmDelete}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg shadow-red-500/20 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Profile Modal */}
      {viewingPlayer && (
         <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
           <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative">
              <button 
                onClick={() => setViewingPlayer(null)} 
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors"
              >
                <X size={20} />
              </button>

              {/* Hero Section */}
              <div className="relative h-48 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-900">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                 <div className="absolute -bottom-16 left-8">
                    <img 
                      src={viewingPlayer.avatarUrl} 
                      alt={viewingPlayer.name} 
                      className="w-32 h-32 rounded-2xl border-4 border-white shadow-xl object-cover bg-slate-200"
                    />
                 </div>
                 <div className="absolute bottom-4 left-44 text-white">
                    <h2 className="text-3xl font-black">{viewingPlayer.name}</h2>
                    <div className="flex items-center gap-3 text-blue-200 mt-1">
                      <span className="font-medium">{viewingPlayer.role}</span>
                      <span className="w-1 h-1 bg-white/50 rounded-full"></span>
                      <span>{viewingPlayer.battingStyle}</span>
                    </div>
                 </div>
                 <div className="absolute top-6 right-16 flex gap-2">
                    {viewingPlayer.isCaptain && <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">CAPTAIN</div>}
                    {viewingPlayer.isViceCaptain && <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">VICE CAPTAIN</div>}
                 </div>
              </div>

              {/* Content */}
              <div className="pt-20 p-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Stats */}
                    <div className="space-y-6">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2">
                         <Activity className="text-blue-500" /> Career Statistics
                       </h3>
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Matches</div>
                             <div className="text-2xl font-black text-slate-800">{viewingPlayer.matchesPlayed}</div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Runs</div>
                             <div className="text-2xl font-black text-slate-800">{viewingPlayer.runsScored}</div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Wickets</div>
                             <div className="text-2xl font-black text-slate-800">{viewingPlayer.wicketsTaken}</div>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                             <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Average</div>
                             <div className="text-2xl font-black text-slate-800">{viewingPlayer.average}</div>
                          </div>
                       </div>
                    </div>

                    {/* Info */}
                    <div className="space-y-6">
                       <h3 className="font-bold text-slate-800 flex items-center gap-2">
                         <UserCheck className="text-emerald-500" /> Player Profile
                       </h3>
                       <div className="space-y-4">
                          <div className="flex justify-between py-2 border-b border-slate-100">
                             <span className="text-slate-500">Batting Style</span>
                             <span className="font-medium text-slate-900">{viewingPlayer.battingStyle}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-100">
                             <span className="text-slate-500">Bowling Style</span>
                             <span className="font-medium text-slate-900">{viewingPlayer.bowlingStyle}</span>
                          </div>
                          <div className="flex justify-between py-2 border-b border-slate-100">
                             <span className="text-slate-500">Status</span>
                             <span className={`font-bold px-2 py-0.5 rounded-md ${viewingPlayer.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                               {viewingPlayer.isAvailable ? 'Available for Selection' : 'Unavailable / Injured'}
                             </span>
                          </div>
                       </div>
                       
                       {canEdit && (
                         <div className="mt-6 pt-4">
                           <button 
                             onClick={(e) => { handleOpenEdit(viewingPlayer, e); setViewingPlayer(null); }}
                             className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                           >
                             <Edit2 size={18} /> Edit Profile & Stats
                           </button>
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
         </div>
      )}
    </div>
  );
};

export default PlayerList;
