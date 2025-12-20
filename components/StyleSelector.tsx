
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { ALL_VOICES, VoiceData } from '../voices';

interface VoiceSelectorProps {
  isDialogueMode: boolean;
  selectedSoloVoice: string;
  voiceA: string;
  voiceB: string;
  onSoloSelect: (name: string) => void;
  onVoiceASelect: (name: string) => void;
  onVoiceBSelect: (name: string) => void;
}

type GenderFilter = 'MALE' | 'FEMALE';

export const StyleSelector: React.FC<VoiceSelectorProps> = ({ 
  isDialogueMode, 
  selectedSoloVoice, 
  voiceA, 
  voiceB, 
  onSoloSelect, 
  onVoiceASelect, 
  onVoiceBSelect 
}) => {
  const [activeTab, setActiveTab] = useState<'A' | 'B'>('A');
  const [filterA, setFilterA] = useState<GenderFilter>('MALE');
  const [filterB, setFilterB] = useState<GenderFilter>('FEMALE');
  const [filterSolo, setFilterSolo] = useState<GenderFilter>('MALE');

  const renderFilterButtons = (current: GenderFilter, setFilter: (f: GenderFilter) => void) => (
    <div className="flex gap-1 mb-2">
      {(['MALE', 'FEMALE'] as GenderFilter[]).map((f) => (
        <button
          key={f}
          onClick={() => setFilter(f)}
          className={`flex-1 py-1 text-[8px] font-black uppercase tracking-widest rounded-md border transition-all ${current === f ? 'bg-white/20 border-white/40 text-white' : 'border-white/5 text-white/30 hover:text-white/50'}`}
        >
          {f === 'MALE' ? 'Hommes' : 'Femmes'}
        </button>
      ))}
    </div>
  );

  const renderVoiceList = (currentSelected: string, onSelect: (name: string) => void, activeFilter: GenderFilter) => (
    <div className="flex flex-row md:flex-col gap-3 overflow-x-auto md:overflow-x-hidden md:overflow-y-auto pb-4 md:pb-0 snap-x snap-mandatory no-scrollbar h-full">
      {ALL_VOICES
        .filter(v => v.ssmlGender === activeFilter)
        .map((voice) => (
        <button
          key={voice.name}
          onClick={() => onSelect(voice.name)}
          className={`
            group relative flex flex-col md:flex-row items-center md:items-center gap-3 p-3 md:p-2 rounded-2xl md:rounded-xl transition-all duration-300 border text-center md:text-left flex-shrink-0 w-[120px] md:w-full snap-center
            ${currentSelected === voice.name 
              ? 'bg-gradient-to-br md:bg-gradient-to-r from-pulse-purple/20 to-transparent border-pulse-purple/50 shadow-glow-purple/10' 
              : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.05]'}
          `}
        >
          <div className="relative w-12 h-12 md:w-10 md:h-10 rounded-full md:rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-pulse-gray group-hover:scale-105 transition-transform">
            <img 
              src={voice.avatarUrl} 
              alt={voice.displayName} 
              className={`w-full h-full object-cover transition-all ${currentSelected === voice.name ? 'grayscale-0' : 'grayscale group-hover:grayscale-0'}`}
            />
            {currentSelected === voice.name && (
              <div className="absolute inset-0 border-2 border-pulse-cyan rounded-full md:rounded-lg z-10"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className={`font-black uppercase text-[10px] md:text-[9px] lg:text-[10px] tracking-wider truncate ${currentSelected === voice.name ? 'text-pulse-cyan' : 'text-white/80'}`}>
              {voice.displayName}
            </div>
            <div className={`hidden md:block text-[8px] font-mono opacity-60 uppercase transition-colors ${currentSelected === voice.name ? 'text-pulse-cyan/60' : 'text-white/40'}`}>
              {voice.description}
            </div>
          </div>

          {currentSelected === voice.name && (
            <div className="absolute top-2 right-2 md:relative md:top-0 md:right-0 w-1.5 h-1.5 rounded-full bg-pulse-cyan animate-pulse shadow-glow-cyan"></div>
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col h-full p-2 md:p-4 pt-2 gap-4">
      {!isDialogueMode ? (
        <div className="flex flex-col h-full gap-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] uppercase tracking-[0.2em] font-black text-white/30">Casting</h3>
          </div>
          {renderFilterButtons(filterSolo, setFilterSolo)}
          <div className="flex-1 overflow-hidden">
            {renderVoiceList(selectedSoloVoice, onSoloSelect, filterSolo)}
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-3 md:gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[9px] uppercase tracking-[0.2em] font-black text-white/30">Casting Duo</h3>
          </div>
          
          {/* Studio Tabs */}
          <div className="flex bg-black/60 p-1 rounded-xl border border-white/5 relative mb-2 md:mb-0">
            <button 
              onClick={() => setActiveTab('A')}
              className={`relative z-10 flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'A' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              Voix 1
              {activeTab === 'A' && <div className="absolute inset-0 bg-pulse-purple rounded-lg -z-10 shadow-glow-purple/40"></div>}
            </button>
            <button 
              onClick={() => setActiveTab('B')}
              className={`relative z-10 flex-1 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'B' ? 'text-white' : 'text-white/30 hover:text-white/60'}`}
            >
              Voix 2
              {activeTab === 'B' && <div className="absolute inset-0 bg-pulse-pink rounded-lg -z-10 shadow-glow-pink/40"></div>}
            </button>
          </div>
          
          <div className="flex-1 overflow-hidden flex flex-col">
            {activeTab === 'A' ? (
              <>
                {renderFilterButtons(filterA, setFilterA)}
                <div className="flex-1 overflow-hidden">
                  {renderVoiceList(voiceA, onVoiceASelect, filterA)}
                </div>
              </>
            ) : (
              <>
                {renderFilterButtons(filterB, setFilterB)}
                <div className="flex-1 overflow-hidden">
                  {renderVoiceList(voiceB, onVoiceBSelect, filterB)}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
