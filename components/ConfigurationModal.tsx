
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useMemo } from 'react';
import { ALL_VOICES } from '../voices';

interface ConfigurationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVoice: string;
  onVoiceChange: (voiceName: string) => void;
}

export const ConfigurationModal: React.FC<ConfigurationModalProps> = ({
  isOpen,
  onClose,
  selectedVoice,
  onVoiceChange
}) => {
  const [filterGender, setFilterGender] = useState('ALL');

  const filteredVoices = useMemo(() => {
    return ALL_VOICES.filter(voice => {
      return filterGender === 'ALL' || voice.ssmlGender === filterGender;
    });
  }, [filterGender]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pulse-bg/80 backdrop-blur-xl">
      <div className="relative w-full max-w-2xl bg-pulse-card border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white">Config Signal</h2>
            <p className="text-[10px] text-white/40 uppercase font-mono mt-1">Sélectionner le profil vocal</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-pulse-cyan transition-colors text-2xl">✕</button>
        </div>

        <div className="p-8">
          <div className="flex gap-2 mb-6">
            {[
              { label: 'TOUT', value: 'ALL' },
              { label: 'HOMME', value: 'MALE' },
              { label: 'FEMME', value: 'FEMALE' }
            ].map(g => (
              <button
                key={g.value}
                onClick={() => setFilterGender(g.value)}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${filterGender === g.value ? 'bg-white text-pulse-bg border-white' : 'border-white/10 text-white/40 hover:border-white/20'}`}
              >
                {g.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {filteredVoices.map((voice) => (
              <button
                key={voice.name}
                onClick={() => onVoiceChange(voice.name)}
                className={`
                  relative group p-3 rounded-2xl text-center transition-all border flex flex-col items-center gap-2
                  ${selectedVoice === voice.name 
                    ? 'bg-pulse-purple/20 border-pulse-purple text-white shadow-glow-purple' 
                    : 'bg-white/5 border-transparent text-white/60 hover:bg-white/10'}
                `}
              >
                <div className="w-14 h-14 rounded-full overflow-hidden border border-white/10">
                  <img src={voice.avatarUrl} alt={voice.displayName} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className={`font-black uppercase text-[10px] mb-0.5 ${selectedVoice === voice.name ? 'text-pulse-cyan' : ''}`}>{voice.displayName}</div>
                  <div className="text-[8px] opacity-40 font-mono italic uppercase">{voice.ssmlGender === 'MALE' ? 'H' : 'F'}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 bg-white/5 flex justify-end">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-white text-pulse-bg font-black uppercase text-xs rounded-full hover:scale-105 active:scale-95 transition-transform shadow-lg"
          >
            Confirmer la config
          </button>
        </div>
      </div>
    </div>
  );
};
