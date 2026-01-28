import React from 'react';
import { EventItem } from '../types';
import { CATEGORY_COLORS } from '../constants';
import { Calendar, Clock, Trash2, CheckCircle, Circle, Volume2, BellRing, ChevronRight, Music } from 'lucide-react';
import { playRawPcm } from '../services/geminiService';

interface EventCardProps {
  event: EventItem;
  onDelete: (id: string) => void;
  onToggleComplete: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, onDelete, onToggleComplete }) => {
  const isVintage = event.category === 'Retro';
  const displayCategory = event.category === 'Other' && event.customCategoryName 
    ? event.customCategoryName 
    : event.category;

  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (event.voiceReminderAudio) {
      // Intelligently check if the audio is a browser-standard Data URL (user upload) or raw PCM base64 (AI generated)
      if (event.voiceReminderAudio.startsWith('data:')) {
        const audio = new Audio(event.voiceReminderAudio);
        audio.play().catch(err => {
          console.error("Playback failed for uploaded audio:", err);
        });
      } else {
        // Fallback to raw PCM player for Gemini TTS output
        playRawPcm(event.voiceReminderAudio);
      }
    }
  };

  return (
    <div className={`relative group p-8 rounded-[3rem] transition-all duration-700 transform hover:-translate-y-4 hover:rotate-1 ${isVintage ? 'vintage-card bg-[#fffdfa]' : 'glass-panel'} border-t-[12px] ${event.isCompleted ? 'opacity-40 grayscale scale-[0.98]' : 'opacity-100 shadow-xl'} ${event.isAlarmEnabled && !event.isCompleted ? 'alarm-active-glow' : ''}`} style={{ borderTopColor: event.color.replace('bg-', '') }}>
      
      {event.isAlarmEnabled && !event.isCompleted && (
        <div className="absolute -top-6 -right-3 w-16 h-16 bg-white rounded-full shadow-2xl flex items-center justify-center animate-ring z-20 border-2 border-slate-100">
           <BellRing size={28} className="text-amber-600 drop-shadow-lg" />
        </div>
      )}

      <div className="flex justify-between items-start mb-8">
        <div className="flex flex-col gap-2">
          <span className={`px-4 py-1 rounded-full text-[10px] uppercase tracking-widest font-black text-white ${CATEGORY_COLORS[event.category] || 'bg-slate-500'} inline-block shadow-md w-fit animate-drift`}>
            {displayCategory}
          </span>
          <h3 className={`text-2xl font-black font-display leading-tight tracking-tight ${isVintage ? 'font-vintage italic' : ''} ${event.isCompleted ? 'line-through text-gray-400' : 'text-slate-950'}`}>
            {event.title}
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {event.voiceReminderAudio && (
            <button 
              onClick={handlePlayVoice}
              className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all transform active:scale-75 shadow-sm"
              title="Play Alarm Audio"
            >
              <Volume2 size={20} />
            </button>
          )}
          <button 
            onClick={() => onToggleComplete(event.id)}
            className={`p-3 rounded-2xl transition-all duration-500 ${event.isCompleted ? 'bg-green-50 text-green-600' : 'hover:bg-slate-100 text-slate-300 hover:text-green-500'}`}
          >
            {event.isCompleted ? <CheckCircle size={28} className="success-animation" /> : <Circle size={28} />}
          </button>
          <button 
            onClick={() => onDelete(event.id)}
            className="p-3 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-600 transition-colors"
          >
            <Trash2 size={24} />
          </button>
        </div>
      </div>

      <div className={`space-y-3 text-sm font-bold text-slate-500 mb-8 p-6 rounded-[2rem] ${isVintage ? 'bg-amber-50/40' : 'bg-slate-50/50'} border border-white/50`}>
        <div className="flex items-center">
          <Calendar size={18} className="mr-3 text-slate-400" />
          <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center">
          <Clock size={18} className="mr-3 text-slate-400" />
          <span>{event.time}</span>
        </div>
      </div>

      <div className="relative mb-8">
        <p className={`text-slate-600 text-lg line-clamp-3 leading-relaxed ${isVintage ? 'font-vintage text-xl text-amber-950/80' : ''}`}>
          {event.description}
        </p>
      </div>

      {!event.isCompleted && (
        <div className="pt-6 border-t border-slate-100/60 flex flex-wrap gap-3">
          {event.reminders.map((rem, idx) => (
            <span key={idx} className="px-3 py-1.5 bg-white border border-slate-100 text-[10px] font-black text-slate-400 rounded-xl flex items-center gap-2 uppercase tracking-widest">
              <ChevronRight size={10} className="text-indigo-400" />
              {rem}
            </span>
          ))}
          {event.isAlarmEnabled && (
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-100 text-[10px] font-black text-amber-600 rounded-xl flex items-center gap-2 uppercase tracking-widest shadow-sm">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span> ALARM ACTIVE
            </span>
          )}
          {event.voiceReminderAudio && (
            <span className="px-3 py-1.5 bg-indigo-50 border border-indigo-100 text-[10px] font-black text-indigo-600 rounded-xl flex items-center gap-2 uppercase tracking-widest shadow-sm">
              <Music size={10} /> AUDIO SYNCED
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default EventCard;