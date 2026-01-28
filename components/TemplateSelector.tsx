
import React from 'react';
import { TEMPLATES } from '../constants';
import { Template } from '../types';

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 mb-10">
      {TEMPLATES.map((tpl) => (
        <button
          key={tpl.name}
          onClick={() => onSelect(tpl)}
          className={`relative group p-6 rounded-[2rem] bg-gradient-to-br ${tpl.color} text-white transition-all duration-500 hover:scale-[1.08] hover:shadow-2xl focus:ring-4 focus:ring-offset-4 focus:ring-slate-100 text-center flex flex-col items-center justify-center overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-4xl mb-3 group-hover:scale-125 transition-transform duration-700">{tpl.icon}</span>
          <span className="font-black text-[10px] uppercase tracking-tighter leading-tight">{tpl.name}</span>
        </button>
      ))}
    </div>
  );
};

export default TemplateSelector;
