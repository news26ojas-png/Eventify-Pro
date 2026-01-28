
import React, { useState, useEffect, useRef } from 'react';
import { EventItem, Category, Template } from '../types';
import { geminiService, playRawPcm } from '../services/geminiService';
import { Sparkles, X, Plus, Loader2, Volume2, Mic, Bell, Clock as ClockIcon, Upload, Music, ShieldCheck } from 'lucide-react';
import { CATEGORY_COLORS } from '../constants';

interface EventFormProps {
  onClose: () => void;
  onSubmit: (event: Omit<EventItem, 'id' | 'isCompleted'>) => void;
  initialTemplate?: Template | null;
}

const EventForm: React.FC<EventFormProps> = ({ onClose, onSubmit, initialTemplate }) => {
  const [title, setTitle] = useState(initialTemplate?.defaultTitle || '');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<Category>(initialTemplate?.category || 'Other');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [voiceAudio, setVoiceAudio] = useState<string | null>(null);
  const [isAlarmEnabled, setIsAlarmEnabled] = useState(true);
  const [uploadedAudioName, setUploadedAudioName] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialTemplate) {
      setTitle(initialTemplate.defaultTitle);
      setCategory(initialTemplate.category);
    }
  }, [initialTemplate]);

  const handleAISuggestion = async () => {
    if (!title) return;
    setIsAIThinking(true);
    const suggestion = await geminiService.suggestEventDetails(title, category);
    if (suggestion) {
      setDescription(suggestion.description);
      if (suggestion.tasks.length > 0) {
        setDescription(prev => `${prev}\n\nStrategic Roadmap:\n• ${suggestion.tasks.join('\n• ')}`);
      }
    }
    setIsAIThinking(false);
  };

  const generateVoiceAlarm = async () => {
    if (!title || !date) return;
    setIsGeneratingVoice(true);
    setUploadedAudioName(null);
    const audio = await geminiService.generateVoiceReminder(title, date);
    if (audio) {
      setVoiceAudio(audio);
      playRawPcm(audio);
    }
    setIsGeneratingVoice(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedAudioName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        // Keep the full Data URL for user uploads to differentiate from raw PCM
        setVoiceAudio(result);
        
        // Playback confirmation for user
        const audio = new Audio(result);
        audio.play();
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !time) return;
    onSubmit({
      title,
      date,
      time,
      category,
      customCategoryName: category === 'Other' ? customCategory : undefined,
      description,
      reminders: ['Standard Reminder'],
      color: CATEGORY_COLORS[category],
      voiceReminderAudio: voiceAudio || undefined,
      isAlarmEnabled
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xl transition-all duration-500">
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in slide-in-from-bottom-20 duration-700 flex flex-col md:flex-row">
        
        {/* Left Side: Visual Context */}
        <div className="hidden md:flex md:w-1/3 bg-slate-900 p-10 flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full -mr-20 -mt-20 blur-3xl"></div>
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
           
           <div className="relative z-10 flex flex-col items-center text-center mt-12">
              <div className="w-40 h-40 gradient-bg rounded-full shadow-2xl flex items-center justify-center mb-10 border-8 border-slate-800 animate-float relative">
                 <ClockIcon size={80} className="text-white opacity-40" />
                 <div className="absolute w-1.5 h-16 bg-white rounded-full top-4 origin-bottom rotate-45 shadow-lg"></div>
                 <div className="absolute w-1.5 h-10 bg-white/60 rounded-full top-10 origin-bottom -rotate-12 shadow-lg"></div>
                 <div className="w-3 h-3 bg-white rounded-full z-10 shadow-lg"></div>
              </div>
              <h2 className="text-4xl font-black font-display text-white mb-4 leading-tight tracking-tight">Precision Hub</h2>
              <p className="text-slate-400 text-lg font-medium opacity-80">Refining every detail of your narrative.</p>
           </div>

           <div className="relative z-10 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md">
              <div className="flex items-center gap-4 mb-3">
                 <div className="p-2 bg-amber-400/20 rounded-lg">
                    <Sparkles size={20} className="text-amber-400" />
                 </div>
                 <span className="text-[12px] font-black uppercase tracking-widest text-white/70">Elite Suggestion</span>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed italic">"A true professional leaves nothing to chance. Use the AI Roadmap for perfect execution."</p>
           </div>
        </div>

        {/* Right Side: Form Content */}
        <div className="flex-1 p-8 md:p-14 overflow-y-auto max-h-[90vh] custom-scrollbar">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-4xl font-black font-display text-slate-800 tracking-tighter">Initialize Memory</h2>
              <p className="text-slate-400 text-[12px] font-black uppercase tracking-[0.4em] mt-2">Chronos Protocol Entry</p>
            </div>
            <button onClick={onClose} className="p-4 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all hover:rotate-90 shadow-sm">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-10">
                <div className="group">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 group-focus-within:text-indigo-600 transition-colors">Strategic Objective</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-0 py-3 text-3xl font-bold border-b-2 border-slate-100 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-200 bg-transparent"
                      placeholder="My Special Occasion"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleAISuggestion}
                      disabled={isAIThinking || !title}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-3 bg-indigo-50 text-indigo-600 rounded-2xl hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all shadow-sm"
                    >
                      {isAIThinking ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="group">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 group-focus-within:text-indigo-600 transition-colors">Target Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-0 py-3 border-b-2 border-slate-100 focus:border-indigo-600 outline-none font-bold text-slate-700 bg-transparent cursor-pointer"
                      required
                    />
                  </div>
                  <div className="group">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 group-focus-within:text-indigo-600 transition-colors">Sync Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-0 py-3 border-b-2 border-slate-100 focus:border-indigo-600 outline-none font-bold text-slate-700 bg-transparent cursor-pointer"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-8 bg-slate-50/80 backdrop-blur rounded-[2.5rem] border border-slate-100 shadow-inner group hover:bg-slate-100/50 transition-colors">
                   <div className="flex items-center gap-6">
                      <div className={`p-4 rounded-2xl transition-all duration-500 ${isAlarmEnabled ? 'bg-indigo-600 text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] scale-110' : 'bg-slate-200 text-slate-400'}`}>
                         <Bell size={28} />
                      </div>
                      <div>
                         <p className="font-black text-slate-800 text-base uppercase tracking-tight">Active Pulse Alarm</p>
                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Verified Alert System</p>
                      </div>
                   </div>
                   <button 
                     type="button"
                     onClick={() => setIsAlarmEnabled(!isAlarmEnabled)}
                     className={`w-16 h-9 rounded-full relative transition-all duration-500 ${isAlarmEnabled ? 'bg-indigo-600' : 'bg-slate-300'}`}
                   >
                     <div className={`absolute top-1.5 w-6 h-6 bg-white rounded-full transition-all duration-500 shadow-md ${isAlarmEnabled ? 'left-8.5' : 'left-1.5'}`}></div>
                   </button>
                </div>
              </div>

              <div className="space-y-10">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-5">Framework Selection</label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['Birthday', 'Meeting', 'Wedding', 'Anniversary', 'Deadline', 'Other', 'Retro'] as Category[]).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border-2 transition-all duration-300 ${
                          category === cat 
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xl scale-105 z-10' 
                            : 'bg-white text-slate-400 border-slate-100 hover:border-slate-300 hover:text-slate-700'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  {category === 'Other' && (
                    <input
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Input Custom Framework..."
                      className="w-full mt-6 px-0 py-3 border-b-2 border-indigo-100 focus:border-indigo-600 outline-none font-bold italic text-slate-600 bg-transparent"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Objective Details</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={5}
                    className="w-full p-8 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] outline-none focus:border-indigo-200 transition-all text-base font-medium text-slate-600 placeholder:text-slate-300 resize-none shadow-inner"
                    placeholder="Document your strategic plan here..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-8 pt-6">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="audio/*" 
                className="hidden" 
              />
              
              <div className="flex-1 flex gap-4">
                <button
                  type="button"
                  onClick={generateVoiceAlarm}
                  disabled={isGeneratingVoice || !title || !date}
                  className={`flex-1 py-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-center gap-4 transition-all duration-500 hover:scale-[1.02] ${
                    voiceAudio && !uploadedAudioName 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg' 
                    : 'border-slate-200 text-slate-400 hover:border-indigo-300 hover:bg-slate-50 hover:text-indigo-600'
                  }`}
                  title="Generate professional AI audio reminder"
                >
                  {isGeneratingVoice ? <Loader2 size={24} className="animate-spin" /> : <Mic size={24} />}
                  <span className="font-black text-[11px] uppercase tracking-widest">
                    {isGeneratingVoice ? 'Creating...' : (voiceAudio && !uploadedAudioName) ? 'AI Synthesis Set' : 'AI Voice Alarm'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={triggerFileUpload}
                  className={`flex-1 py-6 rounded-[2.5rem] border-2 border-dashed flex items-center justify-center gap-4 transition-all duration-500 hover:scale-[1.02] ${
                    uploadedAudioName 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg' 
                    : 'border-slate-200 text-slate-400 hover:border-emerald-300 hover:bg-slate-50 hover:text-emerald-600'
                  }`}
                  title="Upload your own custom alarm audio file"
                >
                  {uploadedAudioName ? <Music size={24} /> : <Upload size={24} />}
                  <span className="font-black text-[11px] uppercase tracking-widest truncate max-w-[120px]">
                    {uploadedAudioName || 'Upload Custom Audio'}
                  </span>
                </button>
              </div>

              <button
                type="submit"
                className="flex-[1.2] py-6 gradient-bg text-white rounded-[2.5rem] font-black text-xl shadow-[0_25px_50px_-12px_rgba(79,70,229,0.5)] hover:shadow-indigo-500 hover:scale-[1.03] active:scale-95 transition-all flex items-center justify-center uppercase tracking-[0.3em] group"
              >
                <ShieldCheck size={28} className="mr-4 group-hover:scale-125 transition-transform" />
                Commit Entry
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventForm;
