
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ALL_VOICES } from '../voices';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: string;
  isEditable?: boolean;
  onSave?: (newPrompt: string, newVoice?: string) => void;
  currentVoice?: string;
}

export const SystemPromptModal: React.FC<SystemPromptModalProps> = ({
  isOpen,
  onClose,
  prompt,
  isEditable = false,
  onSave,
  currentVoice
}) => {
  const [localPrompt, setLocalPrompt] = useState(prompt);
  const [localVoice, setLocalVoice] = useState(currentVoice || '');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-pulse-bg/90 backdrop-blur-2xl">
      <div className="relative w-full max-w-4xl bg-[#0F0F17] border border-pulse-cyan/30 rounded-[32px] overflow-hidden shadow-glow-cyan/20">
        
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-pulse-cyan">Protocole Core Pulse</h2>
            <p className="text-[10px] text-white/40 uppercase font-mono mt-1">Couche d'Ajustement des Instructions</p>
          </div>
          <button onClick={onClose} className="p-2 hover:text-pulse-cyan">✕</button>
        </div>

        <div className="p-8 flex flex-col gap-6 max-h-[70vh] overflow-y-auto">
          {isEditable && (
            <div className="space-y-4">
              <label className="text-[10px] font-mono uppercase text-pulse-cyan opacity-60">Routage du Persona</label>
              <select 
                value={localVoice}
                onChange={(e) => setLocalVoice(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 font-bold text-sm outline-none focus:border-pulse-cyan"
              >
                {/* Changed v.style to v.displayName and added gender text since style was not present in VoiceData interface */}
                {ALL_VOICES.map(v => (
                  <option key={v.name} value={v.name} className="bg-pulse-bg">{v.displayName} — {v.ssmlGender === 'FEMALE' ? 'Femme' : 'Homme'}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-4 flex-1">
            <label className="text-[10px] font-mono uppercase text-pulse-cyan opacity-60">Instructions Système</label>
            {isEditable ? (
              <textarea 
                value={localPrompt}
                onChange={(e) => setLocalPrompt(e.target.value)}
                className="w-full h-64 bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-sm leading-relaxed outline-none focus:border-pulse-cyan text-white/80"
                placeholder="Initialisation des instructions du protocole..."
              />
            ) : (
              <div className="bg-black/40 border border-white/10 rounded-2xl p-6 font-mono text-xs leading-loose text-white/50">
                {prompt}
              </div>
            )}
          </div>
        </div>

        {isEditable && (
          <div className="p-8 bg-white/5 flex justify-end gap-4">
            <button onClick={onClose} className="text-xs font-black uppercase opacity-40 hover:opacity-100">Annuler</button>
            <button 
              onClick={() => onSave?.(localPrompt, localVoice)}
              className="px-10 py-4 bg-pulse-cyan text-pulse-bg font-black uppercase text-xs rounded-full shadow-glow-cyan hover:scale-105 active:scale-95 transition-all"
            >
              Appliquer le Protocole
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
