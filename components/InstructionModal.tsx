
import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface InstructionModalProps {
  onClose: () => void;
}

const InstructionModal: React.FC<InstructionModalProps> = ({ onClose }) => {
  const steps = [
    { title: 'Choose a Template', desc: 'Pick from one of our beautiful, pre-designed templates to get started instantly.' },
    { title: 'Use AI Magic', desc: 'Click "AI Suggest" in the creation form. Gemini will generate professional descriptions and task checklists for you.' },
    { title: 'Set Reminders', desc: 'Customize your alert timing so you never miss a deadline or a celebration.' },
    { title: 'Stay Organized', desc: 'Track your upcoming life events in one colorful, unified dashboard.' }
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-3xl font-extrabold font-display text-slate-800">How to use Eventify</h2>
              <p className="text-slate-500">Your journey to perfect organization starts here.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>

          <div className="space-y-6">
            {steps.map((step, idx) => (
              <div key={idx} className="flex items-start">
                <div className="mt-1 bg-indigo-100 text-indigo-600 p-2 rounded-lg mr-4">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">{step.title}</h4>
                  <p className="text-sm text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-8 py-4 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-colors"
          >
            Got it, let's go!
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstructionModal;
