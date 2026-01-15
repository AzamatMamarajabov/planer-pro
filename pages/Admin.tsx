
import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { TRANSLATIONS } from '../constants';
import { UserProfile } from '../types';
import { 
    Shield, CheckCircle2, Search, RefreshCw, 
    Edit, Trash2, PlusCircle, Save, X, MoreHorizontal, Sparkles, AlertCircle, 
    CalendarRange, Clock, UserCheck, Mail, ChevronRight, Users, Trophy, Zap, Crown, Filter
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const isExpired = (p: UserProfile) => {
    if (!p.subscription_expires_at) return false; 
    return new Date(p.subscription_expires_at).getTime() < Date.now();
};

export const AdminPage = () => {
  const { language, isAdmin, getAllProfiles, updateUserProfile, deleteUserProfile } = useApp();
  const t = TRANSLATIONS[language];
  
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'admin'>('all');
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  if (!isAdmin) return <Navigate to="/" replace />;

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getAllProfiles();
      setProfiles(data);
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleActivateOneMonth = async (id: string) => {
    setActionLoadingId(id);
    const now = new Date();
    const currentProfile = profiles.find(p => p.id === id);
    let baseDate = new Date();
    
    // Agar obunasi hali tugamagan bo'lsa, mavjud muddatga +1 oy qo'shish
    if (currentProfile?.subscription_expires_at && !isExpired(currentProfile)) {
        baseDate = new Date(currentProfile.subscription_expires_at);
    }
    
    baseDate.setMonth(baseDate.getMonth() + 1);
    
    try {
        await updateUserProfile(id, { 
            is_active: true, 
            subscription_expires_at: baseDate.toISOString() 
        });
        loadData();
    } catch(e) { console.error(e); }
    finally { setActionLoadingId(null); }
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Foydalanuvchini va uning barcha ma'lumotlarini butunlay o'chirmoqchimisiz?")) return;
    setActionLoadingId(id);
    try {
        await deleteUserProfile(id);
        loadData();
    } catch(e) { 
        console.error(e); 
        alert("Xatolik: O'chirib bo'lmadi.");
    } finally { setActionLoadingId(null); }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!editingUser) return;
      setActionLoadingId(editingUser.id);
      try {
          await updateUserProfile(editingUser.id, {
              role: editingUser.role,
              xp: editingUser.xp,
              level: editingUser.level,
              is_active: editingUser.is_active,
              subscription_expires_at: editingUser.subscription_expires_at
          });
          setEditingUser(null);
          loadData();
      } catch(e) { console.error(e); }
      finally { setActionLoadingId(null); }
  };

  const filteredProfiles = profiles.filter(p => {
    const matchesSearch = p.email?.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
    const expired = isExpired(p);
    const isActive = p.is_active && !expired;

    if (statusFilter === 'active') return matchesSearch && isActive;
    if (statusFilter === 'inactive') return matchesSearch && (!p.is_active || expired);
    if (statusFilter === 'admin') return matchesSearch && p.role === 'admin';
    return matchesSearch;
  });

  // Analytics helper
  const stats = {
    total: profiles.length,
    activePro: profiles.filter(p => p.is_active && !isExpired(p)).length,
    totalXP: profiles.reduce((acc, p) => acc + (p.xp || 0), 0)
  };

  return (
    <div className="space-y-8 pb-48 pt-6">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 px-4">
        <div className="space-y-1">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none flex items-center gap-4">
                Admin <span className="ai-gradient-text">HQ</span>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse hidden md:block" />
            </h2>
            <p className="text-slate-500 font-bold flex items-center gap-3 uppercase text-[10px] tracking-[0.4em]">
                <Shield size={14} className="text-indigo-500" /> System Control v7.2.1
            </p>
        </div>
        <button 
          onClick={loadData}
          disabled={loading}
          className="p-5 bg-indigo-600/10 text-indigo-400 rounded-[1.8rem] hover:bg-indigo-600/20 transition-all border border-indigo-500/10 active:scale-90 shadow-2xl group flex items-center gap-3"
        >
          <span className="text-[10px] font-black uppercase tracking-widest hidden md:block">Yangilash</span>
          <RefreshCw size={24} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
        </button>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-4">
          <div className="neo-card p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-indigo-500/10 to-transparent">
              <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Jami Foydalanuvchilar</p>
                  <Users size={16} className="text-indigo-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.total}</p>
          </div>
          <div className="neo-card p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-emerald-500/10 to-transparent">
              <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Faol Obunalar (Pro)</p>
                  <Crown size={16} className="text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.activePro}</p>
          </div>
          <div className="neo-card p-6 rounded-[2rem] border border-white/5 bg-gradient-to-br from-amber-500/10 to-transparent">
              <div className="flex justify-between items-start mb-2">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Tizim XP Oqimi</p>
                  <Zap size={16} className="text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">{stats.totalXP.toLocaleString()}</p>
          </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="px-4 space-y-5">
         <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
                type="text" 
                placeholder="Foydalanuvchi qidirish..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-5 rounded-3xl border border-white/5 bg-slate-900/40 text-white placeholder:text-slate-700 focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600/50 outline-none transition-all font-bold text-lg"
            />
         </div>
         <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
             {(['all', 'active', 'admin', 'inactive'] as const).map(f => (
                 <button 
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all whitespace-nowrap shadow-xl flex items-center gap-2 ${statusFilter === f ? 'bg-indigo-600 text-white border-transparent' : 'bg-slate-900/60 text-slate-500 border-white/5 hover:bg-slate-800'}`}
                 >
                    <Filter size={12} />
                    {f === 'all' ? 'BARCHA' : f === 'active' ? 'FAOL PRO' : f === 'admin' ? 'ADMINLAR' : 'NOFAOL'}
                 </button>
             ))}
         </div>
      </div>

      {/* Modern Users Table */}
      <div className="px-4">
        <div className="neo-card rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-950/50 border-b border-white/5">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Foydalanuvchi</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Holat</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Progress</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Amal qilish</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-right">Boshqaruv</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                {filteredProfiles.map(profile => {
                  const expired = isExpired(profile);
                  const isActive = profile.is_active && !expired;
                  const isMenuOpen = activeActionId === profile.id;
                  const isActionLoading = actionLoadingId === profile.id;

                  return (
                    <motion.tr 
                      key={profile.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`hover:bg-white/[0.02] transition-colors group ${isActionLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-base border border-white/10 relative ${profile.role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                            {profile.email.charAt(0).toUpperCase()}
                            {profile.role === 'admin' && <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border-2 border-slate-900"><Crown size={8}/></div>}
                          </div>
                          <div>
                            <p className="font-black text-white tracking-tight text-sm truncate max-w-[120px]">{profile.email.split('@')[0]}</p>
                            <p className="text-[8px] text-slate-600 uppercase font-black tracking-widest">{profile.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">
                            <CheckCircle2 size={10} /> FAOL PRO
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 text-[8px] font-black uppercase tracking-widest border border-rose-500/20">
                            <AlertCircle size={10} /> {expired ? 'MUDDATI TUGAGAN' : 'NOFAOL'}
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col gap-1.5 min-w-[100px]">
                            <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-slate-500">
                                <span>LVL {profile.level}</span>
                                <span className="text-indigo-400">{profile.xp} XP</span>
                            </div>
                            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${profile.xp % 100}%` }} className="h-full bg-indigo-500 rounded-full" />
                            </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest">
                          <CalendarRange size={12} className="text-slate-600" />
                          {profile.subscription_expires_at ? new Date(profile.subscription_expires_at).toLocaleDateString() : 'Unlimited'}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right relative">
                        <div className="flex items-center justify-end gap-2">
                             <button 
                                onClick={() => handleActivateOneMonth(profile.id)}
                                title="+1 Oy"
                                className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                             >
                                <PlusCircle size={18} />
                             </button>
                             <button 
                                onClick={() => setEditingUser(profile)}
                                className="p-2.5 bg-indigo-500/10 text-indigo-500 rounded-xl hover:bg-indigo-500 hover:text-white transition-all active:scale-90"
                             >
                                <Edit size={18} />
                             </button>
                             <button 
                                onClick={() => handleDelete(profile.id)}
                                className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all active:scale-90"
                             >
                                <Trash2 size={18} />
                             </button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          
          {filteredProfiles.length === 0 && !loading && (
            <div className="py-32 text-center opacity-40">
              <Users size={64} className="mx-auto mb-4 text-slate-700" />
              <p className="text-lg font-black text-slate-700 uppercase tracking-widest">Foydalanuvchi topilmadi</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Edit User Modal - Keyboard Friendly */}
      <AnimatePresence>
        {editingUser && (
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-950/95 backdrop-blur-2xl z-[100] flex flex-col justify-end md:justify-center items-center p-0 md:p-6"
                onClick={() => setEditingUser(null)}
            >
                <motion.div 
                    initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-slate-900 w-full max-w-xl rounded-t-[3.5rem] md:rounded-[3.5rem] border-t md:border border-white/10 shadow-2xl overflow-hidden relative flex flex-col max-h-[90dvh]"
                >
                    {/* Handle bar for mobile */}
                    <div className="shrink-0 w-full flex items-center justify-center pt-4 pb-2 md:hidden" onClick={() => setEditingUser(null)}>
                        <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                    </div>

                    {/* Sticky Header */}
                    <div className="shrink-0 px-8 pb-4 pt-2 flex justify-between items-center border-b border-white/5">
                         <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-600/10 rounded-xl text-indigo-400"><Edit size={20} /></div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tighter">Boshqaruv</h3>
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">{editingUser.email.split('@')[0]}</p>
                                </div>
                         </div>
                         <button onClick={() => setEditingUser(null)} className="p-2 bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"><X size={20}/></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 pt-4 pb-safe">
                        <form onSubmit={handleSaveEdit} className="space-y-8">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Foydalanuvchi Roli</label>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                                        <button type="button" onClick={() => setEditingUser({...editingUser, role: 'user'})} className={`py-3 rounded-xl font-black text-[10px] uppercase transition-all ${editingUser.role === 'user' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>User</button>
                                        <button type="button" onClick={() => setEditingUser({...editingUser, role: 'admin'})} className={`py-3 rounded-xl font-black text-[10px] uppercase transition-all ${editingUser.role === 'admin' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-white/5'}`}>Admin</button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Kirish Holati</label>
                                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-white/5">
                                        <button type="button" onClick={() => setEditingUser({...editingUser, is_active: true})} className={`py-3 rounded-xl font-black text-[10px] uppercase transition-all ${editingUser.is_active ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}>Active</button>
                                        <button type="button" onClick={() => setEditingUser({...editingUser, is_active: false})} className={`py-3 rounded-xl font-black text-[10px] uppercase transition-all ${!editingUser.is_active ? 'bg-rose-600 text-white' : 'text-slate-500 hover:bg-white/5'}`}>Locked</button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">Level</label>
                                    <input type="number" inputMode="decimal" value={editingUser.level} onChange={(e) => setEditingUser({...editingUser, level: parseInt(e.target.value)})} className="w-full p-5 bg-slate-950/50 text-white rounded-2xl border border-white/5 font-black outline-none focus:border-indigo-600 transition-all text-xl" />
                                 </div>
                                 <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2">XP</label>
                                    <input type="number" inputMode="decimal" value={editingUser.xp} onChange={(e) => setEditingUser({...editingUser, xp: parseInt(e.target.value)})} className="w-full p-5 bg-slate-950/50 text-white rounded-2xl border border-white/5 font-black outline-none focus:border-indigo-600 transition-all text-xl" />
                                 </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-2 flex items-center gap-2">
                                    <CalendarRange size={12}/> Obuna Tugash Muddati
                                </label>
                                <input 
                                    type="date" 
                                    value={editingUser.subscription_expires_at ? new Date(editingUser.subscription_expires_at).toISOString().split('T')[0] : ''}
                                    onChange={(e) => setEditingUser({...editingUser, subscription_expires_at: e.target.value ? new Date(e.target.value).toISOString() : null})}
                                    className="w-full p-5 bg-slate-950/50 text-white rounded-2xl border border-white/5 font-black outline-none focus:border-indigo-600 transition-all text-lg shadow-inner"
                                />
                            </div>

                            <button type="submit" className="w-full py-6 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-3xl shadow-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-4 active:scale-[0.97] group">
                                <Save size={20} /> O'zgarishlarni Saqlash
                            </button>
                        </form>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
