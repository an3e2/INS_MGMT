
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  Map, 
  ClipboardList, 
  Shield, 
  Swords, 
  LayoutDashboard,
  X,
  User,
  Ticket,
  LogOut,
  Upload
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  isOpen: boolean;
  toggle: () => void;
  userRole?: UserRole;
  onSignOut: () => void;
  teamLogo: string;
  onUpdateLogo: (url: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggle, userRole = 'guest', onSignOut, teamLogo, onUpdateLogo }) => {
  const [imgError, setImgError] = useState(false);
  
  // Order: Squad Roster, Opponent Teams, Matche Schedule, Match Selection, Fielding Map, Scorecard, and Match Day
  const links = [
    { to: '/roster', icon: <Users size={20} />, label: 'Squad Roster' },
    { to: '/opponents', icon: <Swords size={20} />, label: 'Opponent Teams' },
    { to: '/matches', icon: <Calendar size={20} />, label: 'Matches' },
    { to: '/selection', icon: <ClipboardList size={20} />, label: 'Match Selection' },
    { to: '/fielding', icon: <Map size={20} />, label: 'Fielding Board' },
    { to: '/scorecard', icon: <Shield size={20} />, label: 'Scorecard' },
    { to: '/match-day', icon: <LayoutDashboard size={20} />, label: 'Match Day' },
  ];

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateLogo(reader.result as string);
        setImgError(false); // Reset error state on new upload
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-slate-900 text-white z-30 transform transition-transform duration-300 ease-in-out shadow-xl
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:h-screen flex flex-col
      `}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2">
            <div className="relative group w-10 h-10 flex items-center justify-center">
              {!imgError ? (
                <img 
                  src={teamLogo} 
                  alt="Logo" 
                  className="w-full h-full object-contain drop-shadow-lg" 
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-600 rounded-lg shadow-lg">
                  <Shield className="text-white w-6 h-6" />
                </div>
              )}
              
              {userRole === 'admin' && (
                <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-lg z-10">
                  <Upload size={16} className="text-white" />
                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                </label>
              )}
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-white">
              Indian Strikers
            </h1>
          </div>
          <button onClick={toggle} className="md:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-4 px-4 space-y-2 flex-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => { if(window.innerWidth < 768) toggle(); }}
              className={({ isActive }) => `
                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-900/50 translate-x-1' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white hover:translate-x-1'
                }
              `}
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-6 mt-auto">
           {/* User Badge */}
           <div className="mb-4 flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center shrink-0
                  ${userRole === 'admin' ? 'bg-blue-600 text-white' : 
                    userRole === 'member' ? 'bg-emerald-600 text-white' : 'bg-orange-500 text-white'}
                `}>
                  {userRole === 'admin' ? <Shield size={18} /> : userRole === 'member' ? <User size={18} /> : <Ticket size={18} />}
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Logged In</p>
                  <p className="text-sm font-bold text-white capitalize truncate">{userRole}</p>
                </div>
              </div>
              <button 
                onClick={onSignOut} 
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
           </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700/50 shadow-inner">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Season 2024</p>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-green-400">Next Match</p>
              <span className="text-xs bg-slate-700 px-2 py-0.5 rounded text-white">5d</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
