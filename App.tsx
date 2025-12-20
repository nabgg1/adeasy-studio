
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { INTRO_STYLES, DYNAMIC_RADIO_PERSONA, DEFAULT_DIALOGUE_TEMPLATE } from './constants';
import { ALL_VOICES } from './voices';
import { StyleSelector } from './components/StyleSelector';
import { PlayIcon, StopIcon } from './components/PulseUI';
import { generateSpeech, dramatizeText } from './services/geminiService';

const MAX_GENERATIONS = 10;

const App: React.FC = () => {
  const fixedStyle = INTRO_STYLES[0];
  const [text, setText] = useState<string>(fixedStyle.templateText);
  
  // Mode Selection
  const [isDialogueMode, setIsDialogueMode] = useState(false);
  
  // Voices State
  const [soloVoice, setSoloVoice] = useState<string>(fixedStyle.defaultVoice);
  const [voiceA, setVoiceA] = useState<string>(ALL_VOICES.find(v => v.ssmlGender === 'MALE')?.name || 'Orus');
  const [voiceB, setVoiceB] = useState<string>(ALL_VOICES.find(v => v.ssmlGender === 'FEMALE')?.name || 'Kore');

  // Identity & Quota
  const [userIp, setUserIp] = useState<string | null>(null);
  const [generationsUsed, setGenerationsUsed] = useState<number>(0);
  const [isLoadingIp, setIsLoadingIp] = useState(true);

  // Studio States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDramatizing, setIsDramatizing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generationIdRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Compute Voice Data
  const activeSoloVoice = useMemo(() => ALL_VOICES.find(v => v.name === soloVoice), [soloVoice]);
  const activeVoiceA = useMemo(() => ALL_VOICES.find(v => v.name === voiceA), [voiceA]);
  const activeVoiceB = useMemo(() => ALL_VOICES.find(v => v.name === voiceB), [voiceB]);

  const storageKey = useMemo(() => {
    if (!userIp) return null;
    return `adeasy_quota_${userIp.replace(/\./g, '_')}`;
  }, [userIp]);

  // Identity Logic (IP Tracking)
  useEffect(() => {
    const fetchIdentity = async () => {
      try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const ip = data.ip;
        setUserIp(ip);
        
        const key = `adeasy_quota_${ip.replace(/\./g, '_')}`;
        const saved = localStorage.getItem(key);
        setGenerationsUsed(saved ? parseInt(saved, 10) : 0);
      } catch (err) {
        setUserIp("local_studio"); 
        const saved = localStorage.getItem('adeasy_quota_local_studio');
        setGenerationsUsed(saved ? parseInt(saved, 10) : 0);
      } finally { setIsLoadingIp(false); }
    };
    fetchIdentity();
  }, []);

  // Update localStorage when usage changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, generationsUsed.toString());
    }
  }, [generationsUsed, storageKey]);

  /**
   * FIX IPHONE : Initialisation globale du contexte audio.
   * On le crée une seule fois et on le réveille à chaque clic.
   */
  const unlockAudioContext = async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000
      });
    }
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }
    return audioContextRef.current;
  };

  const handleStop = () => {
    if (sourceRef.current) {
      try { sourceRef.current.stop(); } catch(e) {}
      sourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const handlePlay = async () => {
    const ctx = await unlockAudioContext();

    if (isPlaying) { handleStop(); return; }
    if (isGenerating) { setIsGenerating(false); generationIdRef.current++; return; }
    
    if (generationsUsed >= MAX_GENERATIONS) {
      setError("Quota épuisé (10/10). Contactez le studio.");
      return;
    }

    if (!text.trim()) return;
    
    setIsGenerating(true);
    setError(null);
    const currentGenId = ++generationIdRef.current;

    try {
      const config = isDialogueMode ? {
        voiceA: { name: voiceA, speakerName: activeVoiceA?.displayName || 'Voix 1' },
        voiceB: { name: voiceB, speakerName: activeVoiceB?.displayName || 'Voix 2' }
      } : {
        voiceA: { name: soloVoice, speakerName: activeSoloVoice?.displayName || 'Speaker' }
      };

      const result = await generateSpeech(text, config, DYNAMIC_RADIO_PERSONA, ctx);
      
      if (currentGenId !== generationIdRef.current) return;

      setGenerationsUsed(prev => prev + 1);
      setIsGenerating(false);
      setIsPlaying(true);
      
      const source = ctx.createBufferSource();
      source.buffer = result.buffer;
      source.connect(ctx.destination);
      source.onended = () => setIsPlaying(false);
      sourceRef.current = source;
      source.start(0);
    } catch (err) {
      console.error(err);
      setError("Erreur studio. Vérifiez votre connexion.");
      setIsGenerating(false);
    }
  };

  const handleDramatize = async () => {
    if (isDramatizing) return;
    setIsDramatizing(true);
    try {
      const res = await dramatizeText(
        text, 
        DYNAMIC_RADIO_PERSONA, 
        isDialogueMode,
        activeVoiceA?.displayName || 'Voix 1',
        activeVoiceB?.displayName || 'Voix 2'
      );
      setText(res);
    } catch (e) { setError("Erreur de script."); }
    finally { setIsDramatizing(false); }
  };

  const switchMode = (dialogue: boolean) => {
    if (dialogue === isDialogueMode) return;
    
    const duoTemplate = DEFAULT_DIALOGUE_TEMPLATE(activeVoiceA?.displayName || 'Pierre', activeVoiceB?.displayName || 'Sophie');
    const soloTemplate = fixedStyle.templateText;

    if (dialogue) {
      // Passage vers DUO : On remplace si c'est le texte solo par défaut ou si c'est vide
      if (text === soloTemplate || !text.trim()) {
        setText(duoTemplate);
      }
    } 
    else {
      // Passage vers SOLO : On remplace si c'est le texte duo par défaut ou si le texte contient des marqueurs de dialogue
      if (text === duoTemplate || text.includes('[') || text.includes(':') || !text.trim()) {
        setText(soloTemplate);
      }
    }
    setIsDialogueMode(dialogue);
  };

  const isLimitReached = generationsUsed >= MAX_GENERATIONS;

  return (
    <div className="flex flex-col md:flex-row min-h-screen md:h-screen w-full bg-pulse-bg text-white overflow-y-auto md:overflow-hidden font-sans select-none scroll-touch">
      <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 border-b md:border-b-0 md:border-r border-white/10 z-20 flex flex-col bg-black/40 md:bg-black/20">
        <div className="p-6 pb-2 flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pulse-cyan to-pulse-purple animate-pulse shadow-glow-cyan"></div>
            <h1 className="text-xl font-black uppercase tracking-tighter text-white">AdEasy.io</h1>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-black uppercase text-white/30 tracking-widest pl-1">Mode Studio</span>
            <div className="bg-black/40 p-1 rounded-xl border border-white/5 flex gap-1 shadow-inner">
              <button onClick={() => switchMode(false)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${!isDialogueMode ? 'bg-white text-pulse-bg shadow-lg' : 'text-white/40 hover:text-white/70'}`}>Solo</button>
              <button onClick={() => switchMode(true)} className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-300 ${isDialogueMode ? 'bg-pulse-purple text-white shadow-glow-purple' : 'text-white/40 hover:text-white/70'}`}>Duo</button>
            </div>
          </div>
        </div>
        <div className="flex-1 md:min-h-0 overflow-visible md:overflow-hidden mt-4">
          <StyleSelector 
            isDialogueMode={isDialogueMode}
            selectedSoloVoice={soloVoice}
            voiceA={voiceA}
            voiceB={voiceB}
            onSoloSelect={setSoloVoice}
            onVoiceASelect={setVoiceA}
            onVoiceBSelect={setVoiceB}
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative min-w-0 bg-gradient-to-b from-transparent to-black/10">
        <header className="flex-shrink-0 p-4 md:px-8 md:py-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 bg-black/10">
          <div className="w-full sm:w-auto">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20 truncate">STUDIO ADEASY</h2>
            <div className="flex flex-col gap-0.5 mt-1">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isLimitReached ? 'bg-pulse-pink shadow-glow-pink' : 'bg-pulse-neon shadow-glow-cyan animate-pulse'}`}></span>
                <span className={`text-[9px] font-mono uppercase tracking-widest font-black ${isLimitReached ? 'text-pulse-pink' : 'text-pulse-neon'}`}>{isLimitReached ? 'QUOTA ÉPUISÉ' : 'Production ready'}</span>
              </div>
              <p className="text-[8px] font-mono uppercase text-white/40 tracking-wider">écrivez des éléments ou votre texte et appuyez sur améliorer</p>
            </div>
          </div>
        </header>

        <div className="flex-1 min-h-[400px] md:min-h-0 p-4 md:p-8 lg:p-12 overflow-y-visible md:overflow-y-auto">
          <div className="relative h-full min-h-[300px] group max-w-[1200px] mx-auto">
            <div className={`absolute -inset-1 bg-gradient-to-r transition-all duration-1000 blur-xl opacity-10 group-hover:opacity-20 ${isDialogueMode ? 'from-pulse-purple to-pulse-pink' : 'from-pulse-cyan to-pulse-purple'}`}></div>
            <div className="relative h-full glass rounded-[32px] md:rounded-[48px] p-6 md:p-12 flex flex-col shadow-2xl overflow-hidden">
              <div className="flex justify-between items-center mb-6 md:mb-8">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black font-mono text-white/20 uppercase tracking-[0.3em]">{isDialogueMode ? 'Scénario Duo' : 'Éditeur Solo'}</span>
                  <div className={`h-0.5 w-8 ${isDialogueMode ? 'bg-pulse-purple/40' : 'bg-pulse-cyan/40'} mt-1`}></div>
                </div>
                <button onClick={handleDramatize} disabled={isDramatizing || isLimitReached} className={`group flex items-center justify-center gap-3 px-5 py-2.5 md:px-6 md:py-3 rounded-full bg-white/5 border border-white/10 ${isDialogueMode ? 'hover:border-pulse-purple/50 hover:bg-pulse-purple/5' : 'hover:border-pulse-cyan/50 hover:bg-pulse-cyan/5'} transition-all disabled:opacity-20`}>
                  <span className={`text-[9px] md:text-[10px] font-black uppercase ${isDialogueMode ? 'text-pulse-purple' : 'text-pulse-cyan'} tracking-widest whitespace-nowrap`}>
                    {isDramatizing ? 'OPTIMISATION...' : '✨ ' + (isDialogueMode ? 'améliorer dialogue' : 'améliorer le texte')}
                  </span>
                </button>
              </div>
              <textarea 
                className={`flex-1 min-h-[200px] w-full bg-transparent border-none outline-none resize-none font-bold leading-relaxed placeholder-white/5 transition-all selection:bg-pulse-cyan/30 ${isDialogueMode ? 'text-lg md:text-2xl font-mono text-white/90' : 'text-xl md:text-3xl lg:text-5xl text-white'}`}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isDialogueMode ? `${activeVoiceA?.displayName}: [laughing] Hello !\n${activeVoiceB?.displayName}: [enthusiastic] Salut !` : "Entrez votre texte publicitaire ici..."}
              />
              <div className="mt-4 md:mt-6 flex justify-end items-center gap-4 text-white/20 text-[10px] font-mono">
                <span className="uppercase tracking-widest">{text.length} characters</span>
              </div>
            </div>
          </div>
        </div>

        <section className="flex-shrink-0 bg-black/60 border-t border-white/10 backdrop-blur-xl p-6 md:p-8">
          <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex flex-col items-center md:items-start w-full md:w-56 order-3 md:order-1">
              <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] mb-1">Quota Journalier</span>
              <div className="flex items-center gap-4 w-full">
                 <span className={`text-2xl font-black tracking-tighter ${isLimitReached ? 'text-pulse-pink' : 'text-white'}`}>{generationsUsed}<span className="text-white/20 text-xs">/10</span></span>
                 <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${isLimitReached ? 'bg-pulse-pink' : 'bg-pulse-cyan'}`} style={{ width: `${(generationsUsed / MAX_GENERATIONS) * 100}%` }}></div>
                 </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 sm:gap-6 md:gap-12 order-1 md:order-2 w-full md:auto">
              {/* Voice Preview - Visible on Mobile & Desktop */}
              <div className="flex items-center gap-1.5 sm:gap-3">
                {isDialogueMode ? (
                  <div className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-2xl border border-white/5">
                    <div className="flex -space-x-2 sm:-space-x-3">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-pulse-purple overflow-hidden bg-black flex-shrink-0">
                        <img src={activeVoiceA?.avatarUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-pulse-pink overflow-hidden bg-black flex-shrink-0">
                        <img src={activeVoiceB?.avatarUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="hidden sm:block text-[8px] font-black uppercase text-white/40 tracking-widest leading-none mb-1">Casting Duo</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-white leading-none truncate max-w-[60px] sm:max-w-[80px]">
                        {activeVoiceA?.displayName.split(' ')[0]} & {activeVoiceB?.displayName.split(' ')[0]}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-2 sm:px-4 py-1.5 sm:py-2 bg-white/5 rounded-2xl border border-white/5">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-pulse-cyan overflow-hidden bg-black flex-shrink-0">
                      <img src={activeSoloVoice?.avatarUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="hidden sm:block text-[8px] font-black uppercase text-white/40 tracking-widest leading-none mb-1">Voix Solo</span>
                      <span className="text-[9px] sm:text-[10px] font-bold text-white leading-none truncate max-w-[60px] sm:max-w-[80px]">
                        {activeSoloVoice?.displayName}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center justify-center gap-2 sm:gap-4">
                <button 
                  onClick={handlePlay}
                  disabled={(isLimitReached && !isPlaying) || isLoadingIp}
                  className={`w-16 h-16 sm:w-20 sm:h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-all duration-700 transform relative z-10 ${isGenerating ? 'bg-pulse-gray border-4 border-pulse-cyan' : isPlaying ? 'bg-white text-pulse-bg shadow-glow-cyan rotate-180 scale-105' : (isLimitReached || isLoadingIp) ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5 opacity-50' : isDialogueMode ? 'bg-pulse-purple shadow-glow-purple hover:scale-105 active:scale-95' : 'bg-pulse-cyan shadow-glow-cyan hover:scale-105 active:scale-95'}`}
                >
                  {(isPlaying || isGenerating) && <div className="absolute inset-0 rounded-full border-4 border-pulse-cyan/50 animate-ping"></div>}
                  {isGenerating ? (
                    <div className="flex items-end gap-1 mb-1">
                      <div className="w-1 h-3 sm:w-1.5 sm:h-4 bg-pulse-cyan rounded-full animate-waveform"></div>
                      <div className="w-1 h-6 sm:w-1.5 sm:h-8 bg-pulse-cyan rounded-full animate-waveform [animation-delay:-0.2s]"></div>
                      <div className="w-1 h-4 sm:w-1.5 sm:h-6 bg-pulse-cyan rounded-full animate-waveform [animation-delay:-0.4s]"></div>
                    </div>
                  ) : isPlaying ? <StopIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10" /> : <PlayIcon className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 ml-1.5 sm:ml-2" />}
                </button>
                <div className={`flex items-end gap-0.5 sm:gap-1 h-6 sm:h-8 transition-all duration-500 ${isPlaying ? 'opacity-100' : 'opacity-20'}`}>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className={`w-0.5 sm:w-1 ${isDialogueMode ? 'bg-pulse-purple' : 'bg-pulse-cyan'} rounded-full ${isPlaying ? 'animate-waveform' : ''}`} style={{ height: isPlaying ? `${30 + Math.random() * 70}%` : '20%', animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>

              {/* Spacer for desktop balance only */}
              <div className="hidden md:block w-[140px]"></div>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1.5 w-full md:w-64 text-center md:text-right order-2 md:order-3">
              <a href="mailto:contact@adeasy.io" className="text-[11px] font-black text-white hover:text-pulse-cyan transition-colors uppercase tracking-widest">contact@adeasy.io</a>
              <div className="text-[10px] font-black uppercase text-white/40 tracking-wider">SASU NCG 2025</div>
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5">
                <span className="text-[8px] font-mono text-white/30 uppercase">Your IP:</span>
                <span className="text-[8px] font-mono text-pulse-neon/80 font-bold">{userIp || 'Scanning...'}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
      {error && (
        <div className="fixed bottom-10 md:bottom-36 left-1/2 -translate-x-1/2 bg-pulse-pink text-white px-10 py-5 rounded-3xl font-black text-xs uppercase shadow-glow-pink animate-bounce z-[60] text-center min-w-[300px] md:min-w-[320px] backdrop-blur-xl border border-white/20">
          {error}
        </div>
      )}
    </div>
  );
};

export default App;
