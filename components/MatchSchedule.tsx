
import React, { useState } from 'react';
import { Match, OpponentTeam, UserRole } from '../types';
import { Calendar, MapPin, Trophy, Clock, Plus, ChevronDown, ChevronUp, ArrowRight, Search, Handshake } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MatchScheduleProps {
  matches: Match[];
  opponents: OpponentTeam[];
  onAddMatch: (match: Match) => void;
  userRole: UserRole;
}

const MatchSchedule: React.FC<MatchScheduleProps> = ({ matches, opponents, onAddMatch, userRole }) => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    tournament: '',
    opponent: '',
    venue: 'RCA-1',
    date: '',
    tossTime: '',
  });

  const canEdit = userRole === 'admin';

  // Filter matches based on search term
  const filteredMatches = matches.filter(m => 
    m.opponent.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (m.tournament && m.tournament.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const upcoming = filteredMatches.filter(m => m.isUpcoming).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const past = filteredMatches.filter(m => !m.isUpcoming).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Ground options RCA-1 to RCA-15
  const groundOptions = Array.from({ length: 15 }, (_, i) => `RCA-${i + 1}`);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.tournament && formData.opponent && formData.date) {
      const newMatch: Match = {
        id: Date.now().toString(),
        opponent: formData.opponent,
        date: formData.date,
        venue: formData.venue,
        tournament: formData.tournament,
        tossTime: formData.tossTime,
        isUpcoming: true,
      };
      onAddMatch(newMatch);
      setShowForm(false);
      setFormData({
        tournament: '',
        opponent: '',
        venue: 'RCA-1',
        date: '',
        tossTime: '',
      });
    }
  };

  const MatchTypeBadge = ({ tournament }: { tournament?: string }) => {
    const isFriendly = !tournament || tournament.toLowerCase().includes('friendly');
    return (
      <span className={`text-xs font-bold px-2 py-1 rounded mb-2 inline-flex items-center gap-1.5
        ${!isFriendly ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-600 border border-blue-100'}
      `}>
        {!isFriendly ? <Trophy size={12} className="fill-purple-200" /> : <Handshake size={12} />}
        {tournament || 'Friendly Match'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Matches</h2>
          <p className="text-slate-500">Upcoming fixtures and past results</p>
        </div>
        {canEdit && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${showForm ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'}`}
          >
            {showForm ? <ChevronUp size={20} /> : <Plus size={20} />}
            {showForm ? 'Cancel' : 'Schedule Match'}
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          type="text"
          placeholder="Search matches by opponent, tournament..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 shadow-sm transition-all"
        />
      </div>

      {/* Schedule Match Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 animate-fade-in">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar size={20} className="text-blue-500" />
            Create New Fixture
          </h3>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">League / Tournament Name</label>
              <input 
                required
                name="tournament"
                value={formData.tournament}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500 placeholder-slate-400"
                placeholder="e.g. Winter Cup 2024"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Opponent</label>
              <select 
                required
                name="opponent"
                value={formData.opponent}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Opponent</option>
                {opponents.map(team => (
                  <option key={team.id} value={team.name}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ground</label>
              <select 
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              >
                {groundOptions.map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Date</label>
              <input 
                required
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Toss Time</label>
              <input 
                type="time"
                name="tossTime"
                value={formData.tossTime}
                onChange={handleInputChange}
                className="w-full p-3 bg-slate-800 border border-slate-700 text-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button type="submit" className="w-full p-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md transition-colors">
                Save Match
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lists */}
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Calendar className="text-blue-500" size={20} />
            Upcoming Fixtures
          </h3>
          {upcoming.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-100 text-center text-slate-400">
              {searchTerm ? 'No matches found.' : 'No upcoming matches scheduled.'}
            </div>
          ) : (
            upcoming.map(match => (
              <div key={match.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm border-l-4 border-l-blue-500 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <MatchTypeBadge tournament={match.tournament} />
                    <h4 className="text-xl font-bold text-slate-800">{match.opponent}</h4>
                    <div className="flex items-center gap-4 text-slate-500 text-sm mt-1">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {match.venue}</span>
                      {match.tossTime && <span className="flex items-center gap-1"><Clock size={14} /> Toss: {match.tossTime}</span>}
                    </div>
                  </div>
                  <div className="text-right bg-slate-50 px-3 py-2 rounded-lg">
                    <span className="block text-2xl font-bold text-slate-800">
                      {new Date(match.date).getDate()}
                    </span>
                    <span className="text-xs uppercase font-bold text-slate-400">
                      {new Date(match.date).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/scorecard', { state: { match } })}
                  className="w-full py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-sm font-bold transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                >
                  Go to Scorecard <ArrowRight size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            Recent Results
          </h3>
          {past.length === 0 ? (
            <div className="bg-white p-8 rounded-xl border border-slate-100 text-center text-slate-400">
              {searchTerm ? 'No matches found.' : 'No past matches recorded.'}
            </div>
          ) : (
             past.map(match => (
              <div key={match.id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm opacity-90 hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center mb-3">
                  <MatchTypeBadge tournament={match.tournament} />
                  <span className={`
                    px-3 py-1 rounded-full text-xs font-bold uppercase
                    ${match.result === 'Won' ? 'bg-green-100 text-green-700' : 
                      match.result === 'Lost' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
                  `}>
                    {match.result}
                  </span>
                </div>
                <div className="flex justify-between items-center px-2">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold">Strikers</p>
                    <p className="text-lg font-bold text-slate-800">{match.scoreFor}</p>
                  </div>
                  <div className="text-slate-300 font-bold text-xs">VS</div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 uppercase font-bold">{match.opponent}</p>
                    <p className="text-lg font-bold text-slate-800">{match.scoreAgainst}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                   <span className="text-slate-400 text-xs">{new Date(match.date).toLocaleDateString()}</span>
                   <button 
                      onClick={() => navigate('/scorecard', { state: { match } })}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      Scorecard <ArrowRight size={10} />
                    </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MatchSchedule;
