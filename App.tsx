
import React, { useState, useEffect, useMemo } from 'react';
import { EventItem, Template } from './types';
import { INITIAL_EVENTS } from './constants';
import EventCard from './components/EventCard';
import EventForm from './components/EventForm';
import TemplateSelector from './components/TemplateSelector';
import InstructionModal from './components/InstructionModal';
import { Plus, Info, Search, Bell, LayoutGrid, Calendar as CalendarIcon, Sparkles, Clock as ClockIcon, Layers, BellRing, Settings, ShieldCheck, Zap, Activity } from 'lucide-react';
import { geminiService } from './services/geminiService';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-end group">
      <div className="text-4xl font-black font-display text-slate-900 tracking-tighter tabular-nums leading-none flex items-center gap-1">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        <span className="text-indigo-500 text-2xl animate-pulse">:</span>
        <span className="text-2xl text-slate-300">{time.getSeconds().toString().padStart(2, '0')}</span>
      </div>
      <div className="flex items-center gap-2 mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
        <Zap size={10} className="text-amber-500 fill-amber-500" />
        <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
          {time.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiGreeting, setAiGreeting] = useState('');
  const [filter, setFilter] = useState<'All' | 'Upcoming' | 'Completed'>('All');

  useEffect(() => {
    const saved = localStorage.getItem('eventify_elite_v5');
    if (saved) {
      setEvents(JSON.parse(saved));
    } else {
      setEvents(INITIAL_EVENTS);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eventify_elite_v5', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    const fetchGreeting = async () => {
      const upcoming = events.filter(e => !e.isCompleted)[0];
      if (upcoming) {
        const greeting = await geminiService.generateGreeting(upcoming.title);
        setAiGreeting(greeting);
      } else {
        setAiGreeting("Curation is the New Luxury.");
      }
    };
    fetchGreeting();
  }, [events.length]);

  const filteredEvents = useMemo(() => {
    return events
      .filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            e.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = filter === 'All' || 
                            (filter === 'Upcoming' && !e.isCompleted) || 
                            (filter === 'Completed' && e.isCompleted);
        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [events, searchQuery, filter]);

  const handleAddEvent = (eventData: Omit<EventItem, 'id' | 'isCompleted'>) => {
    const newEvent: EventItem = {
      ...eventData,
      id: Math.random().toString(36).substr(2, 9),
      isCompleted: false
    };
    setEvents(prev => [...prev, newEvent]);
    setShowForm(false);
    setSelectedTemplate(null);
  };

  const handleDeleteEvent = (id: string) => {
    if (confirm("Permanently archive this event record?")) {
      setEvents(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleToggleComplete = (id: string) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, isCompleted: !e.isCompleted } : e));
  };

  const handleTemplateClick = (tpl: Template) => {
    setSelectedTemplate(tpl);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen pb-12 text-slate-950">
      {/* Elite Navigation Bar */}
      <header className="sticky top-0 z-40 glass-panel border-b border-white/60 px-6 md:px-16 py-6 transition-all duration-500">
        <div className="max-w-[1700px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8 group cursor-default">
            <div className="w-16 h-16 gradient-bg rounded-2xl flex items-center justify-center text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.4)] group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Bell size={36} strokeWidth={2.5} className="group-hover:animate-ring" />
            </div>
            <div>
              <h1 className="text-4xl font-black font-display tracking-tightest leading-none">
                Eventify<span className="text-indigo-600">Pro</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                 <div className="flex -space-x-1">
                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" style={{animationDelay: `${i*0.2}s`}}></div>)}
                 </div>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">AI Chronos Engine 5.0</p>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-14">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={22} />
              <input 
                type="text" 
                placeholder="Search Your Legacy..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-16 pr-10 py-5 bg-slate-50 border border-slate-100 rounded-[2rem] text-sm font-bold focus:ring-[15px] focus:ring-indigo-50/50 transition-all outline-none w-[500px] placeholder:text-slate-300"
              />
            </div>
            <div className="h-12 w-px bg-slate-200"></div>
            <Clock />
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-6 md:px-16 pt-16">
        
        {/* Elite Masterpiece Hero */}
        <div className="relative mb-32 p-16 md:p-32 rounded-[6rem] bg-slate-950 text-white overflow-hidden shadow-[0_100px_150px_-30px_rgba(0,0,0,0.7)] group animate-reveal">
          <div className="absolute inset-0 pointer-events-none">
             <div className="absolute -right-20 -top-20 w-[1200px] h-[1200px] bg-indigo-600/25 rounded-full blur-[200px] animate-pulse"></div>
             <div className="absolute -left-20 -bottom-20 w-[1000px] h-[1000px] bg-purple-600/15 rounded-full blur-[180px] animate-slow-ping"></div>
          </div>

          <div className="relative z-10 grid lg:grid-cols-[1.3fr_0.7fr] gap-24 items-center">
            <div className="space-y-14">
              <div className="inline-flex items-center gap-4 px-8 py-4 bg-white/5 rounded-full border border-white/10 text-[12px] font-black uppercase tracking-[0.5em] backdrop-blur-3xl animate-drift">
                <Sparkles size={20} className="text-amber-400" />
                World-Class AI Synthesis
              </div>
              <h2 className="text-8xl md:text-[9rem] font-black font-display leading-[0.85] tracking-tightest">
                {aiGreeting}
              </h2>
              <p className="text-slate-400 text-3xl font-medium max-w-2xl leading-relaxed opacity-90 font-vintage italic">
                Precision scheduling meets high-fidelity design. The ultimate tool for the modern professional.
              </p>
              <div className="flex flex-wrap gap-8 pt-8">
                <button 
                  onClick={() => setShowForm(true)}
                  className="px-16 py-8 bg-white text-slate-950 rounded-[3rem] font-black text-3xl shadow-[0_40px_80px_-15px_rgba(255,255,255,0.2)] hover:bg-slate-100 hover:scale-[1.08] hover:-rotate-1 transition-all flex items-center active:scale-95 group"
                >
                  <Plus size={40} className="mr-5 group-hover:rotate-180 transition-transform duration-700" />
                  New Event
                </button>
                <button 
                  onClick={() => setShowInstructions(true)}
                  className="px-12 py-8 bg-white/5 text-white border border-white/10 rounded-[3rem] font-bold hover:bg-white/15 transition-all backdrop-blur-3xl"
                >
                  <Info size={40} />
                </button>
              </div>
            </div>
            
            <div className="hidden lg:flex justify-center relative">
               <div className="w-[550px] h-[550px] bg-white/5 rounded-full flex items-center justify-center p-20 border border-white/10 animate-float relative shadow-inner">
                  <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-tr from-indigo-500 via-purple-600 to-rose-500 rounded-full shadow-4xl flex items-center justify-center animate-ring">
                     <BellRing size={80} className="text-white drop-shadow-2xl" />
                  </div>
                  
                  {/* REFINED ELITE PULSE CARD */}
                  <div className="w-full h-full bg-[#0a0f1c] rounded-[4rem] shadow-[0_60px_100px_-20px_rgba(0,0,0,0.9)] flex flex-col items-center justify-center space-y-10 relative overflow-hidden group/viz border border-white/10">
                     <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
                     <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                     
                     <div className="relative group-hover/viz:scale-105 transition-transform duration-700 ease-out">
                        <div className="absolute inset-0 bg-indigo-500 blur-3xl opacity-30 scale-125 animate-pulse"></div>
                        <div className="w-32 h-32 bg-white rounded-[2.5rem] flex items-center justify-center text-slate-900 shadow-[0_15px_30px_rgba(0,0,0,0.4)] relative z-10">
                           <ClockIcon size={72} strokeWidth={2.5} />
                        </div>
                     </div>
                     
                     <div className="text-center relative z-10 space-y-3">
                        <div className="text-[44px] font-black text-white tracking-[0.05em] font-display leading-none">
                          ELITE PULSE
                        </div>
                        <div className="flex items-center justify-center gap-4 opacity-50">
                           <div className="h-px w-6 bg-white"></div>
                           <p className="text-[12px] font-black text-white uppercase tracking-[0.5em]">Verified Precision</p>
                           <div className="h-px w-6 bg-white"></div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Blueprint Section */}
        <section className="mb-40">
          <div className="flex items-center justify-between mb-16 px-4">
            <div>
               <div className="flex items-center gap-5 mb-5">
                  <Layers size={28} className="text-indigo-600 animate-pulse" />
                  <span className="text-[14px] font-black text-indigo-600 uppercase tracking-[0.5em]">The Framework Gallery</span>
               </div>
               <h3 className="text-6xl font-black font-display text-slate-950 tracking-tighter">Blueprints</h3>
            </div>
          </div>
          <TemplateSelector onSelect={handleTemplateClick} />
        </section>

        {/* Timeline Section */}
        <section className="relative min-h-[800px]">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-14 px-4">
            <div>
              <div className="flex items-center gap-5 mb-5">
                 <CalendarIcon size={28} className="text-indigo-600" />
                 <span className="text-[14px] font-black text-indigo-600 uppercase tracking-[0.5em]">Global Chronology</span>
              </div>
              <h3 className="text-6xl font-black font-display text-slate-950 tracking-tighter">Your Legacy</h3>
            </div>
            
            <div className="flex items-center p-3 bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white">
              {(['All', 'Upcoming', 'Completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-12 py-5 rounded-[2.5rem] text-xs font-black uppercase tracking-widest transition-all duration-500 ${
                    filter === f 
                      ? 'bg-slate-950 text-white shadow-3xl scale-110' 
                      : 'text-slate-400 hover:text-slate-950 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-14">
              {filteredEvents.map((event, idx) => (
                <div key={event.id} className="animate-reveal" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <EventCard 
                    event={event} 
                    onDelete={handleDeleteEvent}
                    onToggleComplete={handleToggleComplete}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-64 text-center glass-panel rounded-[8rem] border-4 border-dashed border-slate-200 shadow-inner group">
              <div className="w-40 h-40 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mb-12 shadow-inner group-hover:scale-110 transition-transform duration-700">
                <CalendarIcon size={96} />
              </div>
              <h4 className="text-5xl font-black text-slate-950 mb-6 tracking-tighter">Silence in the Timeline.</h4>
              <p className="text-slate-400 max-w-lg mb-16 font-medium text-2xl leading-relaxed">
                The most successful individuals manage every second. Initiate your first framework now.
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="px-20 py-8 bg-slate-950 text-white rounded-[3rem] font-black text-sm uppercase tracking-[0.5em] hover:bg-indigo-600 hover:scale-110 transition-all shadow-4xl active:scale-95"
              >
                + Initial Entry
              </button>
            </div>
          )}
        </section>

        {/* Global Elite Footer */}
        <footer className="mt-48 pt-20 border-t border-slate-200/60 flex flex-col md:flex-row justify-between items-center gap-16">
           <div className="flex items-center gap-8">
              <div className="flex -space-x-4">
                 <div className="w-14 h-14 rounded-full bg-indigo-500 border-[6px] border-white shadow-xl"></div>
                 <div className="w-14 h-14 rounded-full bg-purple-500 border-[6px] border-white shadow-xl"></div>
                 <div className="w-14 h-14 rounded-full bg-pink-500 border-[6px] border-white shadow-xl"></div>
              </div>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Global Ecosystem</p>
                <p className="text-xs font-bold text-slate-400">Trusted by over 10M professionals</p>
              </div>
           </div>
           
           <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 rounded-[3rem] opacity-0 group-hover:opacity-10 blur-2xl transition-opacity"></div>
              <div className="relative flex flex-col items-end">
                <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.6em] mb-4">Masterfully Crafted by</p>
                <div className="flex items-center gap-6">
                   <div className="text-4xl font-display font-black text-slate-950 tracking-tightest group-hover:text-indigo-600 transition-colors duration-500">
                      Ojash Bhatt
                   </div>
                   <div className="w-16 h-16 gradient-bg rounded-2xl shadow-2xl flex items-center justify-center text-white transform group-hover:rotate-[360deg] transition-transform duration-1000 ease-in-out">
                      <Settings size={32} />
                   </div>
                </div>
              </div>
           </div>
        </footer>
      </main>

      {/* Modals */}
      {showForm && (
        <EventForm 
          onClose={() => { setShowForm(false); setSelectedTemplate(null); }} 
          onSubmit={handleAddEvent}
          initialTemplate={selectedTemplate}
        />
      )}

      {showInstructions && (
        <InstructionModal onClose={() => setShowInstructions(false)} />
      )}

      {/* Floating Global Action */}
      <button 
        onClick={() => setShowForm(true)}
        className="fixed bottom-16 right-16 hidden lg:flex w-28 h-28 gradient-bg rounded-[3rem] text-white shadow-[0_40px_100px_-20px_rgba(79,70,229,0.6)] items-center justify-center z-50 border-[8px] border-white active:scale-90 transition-all hover:scale-110 hover:rotate-12 group"
      >
        <Plus size={56} className="group-hover:scale-125 transition-transform" />
      </button>
    </div>
  );
};

export default App;
