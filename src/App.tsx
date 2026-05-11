/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, ChangeEvent } from 'react';
import { Shield, AlertCircle, CheckCircle, Info, History, Camera, FileText, ChevronRight, Trash2, X, Clock, Target, Rocket, Settings as SettingsIcon, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { analyzeMessage, analyzeImage } from './services/geminiService';
import { AnalysisResult, RiskLevel, SavedAnalysis, UserSettings } from './types';

// --- Components ---

const Sidebar = () => (
  <aside className="hidden lg:flex w-80 bg-slate-900 text-white p-8 flex-col justify-between shrink-0 border-r border-slate-800">
    <div>
      <div className="flex items-center gap-3 mb-10">
        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
          <Shield size={24} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">SignalSafe</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Civic Safety</p>
        </div>
      </div>
      
      <nav className="space-y-8">
        <section>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Clock size={12} /> Hackathon Status
          </p>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Kickoff:</span>
              <span className="font-mono text-slate-200">May 8, 6PM</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Submission:</span>
              <span className="font-mono text-orange-400">May 12, 1AM</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full w-2/3 transition-all duration-1000"></div>
            </div>
          </div>
        </section>

        <section>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Target size={12} /> Prompt Alignment
          </p>
          <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-lg border border-slate-800">
            "AI translators for civic and legal documents."
          </p>
        </section>

        <section>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Sustainability 2026</p>
          <ul className="text-xs text-slate-400 space-y-2">
            <li className="flex items-center gap-2 italic"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> Institutional Partnership</li>
            <li className="flex items-center gap-2 italic"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> Foundation Funding</li>
            <li className="flex items-center gap-2 italic"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> Civic Tech Grant Path</li>
          </ul>
        </section>
      </nav>
    </div>

    <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800/50">
      <p className="text-[10px] uppercase font-bold text-blue-500 mb-1">Target Impact</p>
      <p className="text-[11px] leading-relaxed text-slate-400 italic">Reducing fraud-based financial loss for older adults and immigrants by 40% through plain-language verification.</p>
    </div>
  </aside>
);

const RiskBadge = ({ level, language }: { level: RiskLevel, language: 'en' | 'es' }) => {
  const styles = {
    [RiskLevel.LOW]: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    [RiskLevel.MEDIUM]: "bg-yellow-50 text-yellow-700 border-yellow-100 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800",
    [RiskLevel.HIGH]: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  };
  
  const labels = {
    en: { low: "LOW", medium: "MEDIUM", high: "HIGH", risk: "RISK" },
    es: { low: "BAJO", medium: "MEDIO", high: "ALTO", risk: "RIESGO" }
  };

  const l = labels[language];
  const displayLevel = l[level as keyof typeof l] || level.toUpperCase();
  
  return (
    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-widest border uppercase ${styles[level]}`}>
      {displayLevel} {l.risk}
    </div>
  );
};

export default function App() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);
  const [view, setView] = useState<'input' | 'result' | 'history' | 'settings'>('input');
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('signalsafe_settings');
    return saved ? JSON.parse(saved) : {
      language: 'en',
      appearance: 'system',
      readingLevel: 'standard',
      textSize: 'normal',
      highContrast: false,
      readAloud: false,
      checklistMode: false,
    };
  });

  useEffect(() => {
    localStorage.setItem('signalsafe_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    const saved = localStorage.getItem('signalsafe_results');
    if (saved) setSavedAnalyses(JSON.parse(saved));
  }, []);

  const saveResult = (res: AnalysisResult) => {
    const newSaved: SavedAnalysis = {
      ...res,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      originalText: inputText || undefined
    };
    const updated = [newSaved, ...savedAnalyses];
    setSavedAnalyses(updated);
    localStorage.setItem('signalsafe_results', JSON.stringify(updated));
  };

  const deleteSaved = (id: string) => {
    const updated = savedAnalyses.filter(a => a.id !== id);
    setSavedAnalyses(updated);
    localStorage.setItem('signalsafe_results', JSON.stringify(updated));
  };

  const handleTextAnalysis = async () => {
    if (!inputText.trim()) return;
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeMessage(inputText, settings);
      setResult(res);
      saveResult(res);
      setView('result');
      if (settings.readAloud) speakResult(res);
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please check connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error("Failed to read image file."));
        reader.readAsDataURL(selectedFile);
      });
      const base64 = dataUrl.split(',')[1];
      const res = await analyzeImage(base64, selectedFile.type, settings);
      setResult(res);
      saveResult(res);
      setView('result');
      if (settings.readAloud) speakResult(res);
    } catch (err: any) {
      setError(err?.message || "Analysis failed. Try again or use demo mode.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const speakResult = (res: AnalysisResult) => {
    if (!window.speechSynthesis) return;
    const msg = new SpeechSynthesisUtterance();
    const riskLabels = {
      en: { low: "low", medium: "medium", high: "high", risk: "risk" },
      es: { low: "bajo", medium: "medio", high: "alto", risk: "riesgo" }
    };
    const l = riskLabels[settings.language];
    const displayLevel = l[res.riskLevel as keyof typeof l] || res.riskLevel;
    
    msg.text = settings.language === 'es' 
      ? `${displayLevel} ${l.risk}. ${res.plainLanguageSummary}. Pasos seguros: ${res.safeNextSteps.join('. ')}`
      : `${displayLevel} ${l.risk}. ${res.plainLanguageSummary}. Safe next steps: ${res.safeNextSteps.join('. ')}`;
      
    msg.lang = settings.language === 'es' ? 'es-ES' : 'en-US';
    window.speechSynthesis.speak(msg);
  };

  const demoMessages = [
    { label: "SNAP Text Scam", text: "URGENT: Your SNAP benefits will be suspended today. Verify your account now: snap-secure-benefits.com/login" },
    { label: "Fake Job Offer", text: "Congratulations, you got the remote job. Send your SSN and banking info to start payroll." }
  ];

  const riskBadgeWithLang = (level: RiskLevel) => <RiskBadge level={level} language={settings.language} />;

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (settings.appearance === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(isDark ? 'dark' : 'light');
      
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = (e: MediaQueryListEvent) => setResolvedTheme(e.matches ? 'dark' : 'light');
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    } else {
      setResolvedTheme(settings.appearance === 'dark' ? 'dark' : 'light');
    }
  }, [settings.appearance]);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.textSize === 'large') {
      root.style.fontSize = '120%';
    } else if (settings.textSize === 'xl') {
      root.style.fontSize = '140%';
    } else {
      root.style.fontSize = '100%';
    }
  }, [settings.textSize]);

  return (
    <div className={`flex h-screen w-full font-sans transition-colors duration-300 overflow-hidden ${
      resolvedTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-[#F4F7FA] text-slate-900'
    } ${
      settings.highContrast ? 'grayscale contrast-125' : ''
    }`}>
      <Sidebar />

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center p-4 md:p-8 gap-8 overflow-auto">
        
        {/* Mobile Viewport Mockup */}
        <div className={`relative w-full max-w-[340px] h-[680px] rounded-[44px] border-[10px] shadow-2xl flex flex-col overflow-hidden shrink-0 transition-colors border-slate-900 ${
          resolvedTheme === 'dark' ? 'bg-slate-900 border-black' : 'bg-white border-slate-900'
        }`}>
          
          {/* Status Bar */}
          <div className={`px-8 pt-6 pb-2 flex justify-between items-center ${resolvedTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
            <span className="text-[10px] font-black">9:41</span>
            <div className="flex gap-1">
              <div className={`w-3.5 h-1.5 rounded-full ${resolvedTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
              <div className={`w-2.5 h-1.5 rounded-full ${resolvedTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            </div>
          </div>

          {/* App Header (Inside Mobile) */}
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <Shield size={16} />
              </div>
              <span className={`text-sm font-black tracking-tight uppercase ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>SignalSafe</span>
            </div>
            <div className="flex gap-2">
              {view !== 'input' && (
                <button onClick={() => setView('input')} className={`p-1.5 rounded-full transition-colors ${resolvedTheme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <AnimatePresence mode="wait">
              {view === 'input' && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className={`flex justify-between items-center border px-3 py-1.5 rounded-lg mb-2 ${
                    resolvedTheme === 'dark' ? 'bg-emerald-900/20 border-emerald-800' : 'bg-emerald-50 border-emerald-100'
                  }`}>
                    <span className="text-[9px] font-black text-emerald-600 uppercase">{settings.language === 'es' ? 'Modo sin conexión listo' : 'Offline Mode Ready'}</span>
                    <button onClick={() => setInputText(demoMessages[0].text)} className="text-[9px] font-black text-blue-600 uppercase underline">{settings.language === 'es' ? 'Probar demo' : 'Try Demo'}</button>
                  </div>

                  <div className="space-y-4">
                    <h2 className={`text-xl font-black leading-tight ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{settings.language === 'es' ? 'Pegue un mensaje sospechoso' : 'Paste a suspicious message'}</h2>
                    <textarea
                      className={`w-full h-40 p-4 border rounded-2xl focus:ring-2 focus:ring-blue-500/20 outline-none transition-all resize-none text-sm placeholder:text-slate-400 font-medium ${
                        resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      placeholder={settings.language === 'es' ? 'ej. "URGENTE: Sus beneficios están suspendidos..."' : "e.g. 'URGENT: Your benefits are suspended...'"}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                    
                    <button
                      onClick={handleTextAnalysis}
                      disabled={!inputText.trim() || isAnalyzing}
                      className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-50 ${
                        resolvedTheme === 'dark' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white shadow-slate-200'
                      }`}
                    >
                      {isAnalyzing ? (settings.language === 'es' ? 'ANALIZANDO...' : 'ANALYZING...') : (settings.language === 'es' ? 'ANALIZAR MENSAJE' : 'ANALYZE MESSAGE')}
                    </button>

                    <div className="relative py-2 flex items-center justify-center">
                      <div className={`absolute inset-0 flex items-center shadow-none`}><div className={`w-full border-t ${resolvedTheme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}></div></div>
                      <span className={`relative px-3 text-[9px] font-black uppercase tracking-widest ${resolvedTheme === 'dark' ? 'bg-slate-900 text-slate-500' : 'bg-white text-slate-300'}`}>{settings.language === 'es' ? 'O' : 'OR'}</span>
                    </div>

                    <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl transition-all cursor-pointer group ${
                      resolvedTheme === 'dark' ? 'border-slate-800 bg-slate-800/50 hover:bg-slate-800' : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                    }`}>
                      <Camera className={`transition-colors mb-1 ${resolvedTheme === 'dark' ? 'text-slate-600 group-hover:text-blue-500' : 'text-slate-300 group-hover:text-blue-500'}`} size={20} />
                      <span className={`text-[10px] font-black uppercase transition-colors ${resolvedTheme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{settings.language === 'es' ? 'Subir captura de pantalla' : 'Upload Screenshot'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                  </div>
                </motion.div>
              )}

              {view === 'result' && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 pb-4"
                >
                  <div className="text-center space-y-3">
                    <div className={`inline-block p-1 rounded-2xl border transition-colors ${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                      <div aria-live="assertive" className="sr-only">
                        {settings.language === 'es' ? 
                          `Nivel de riesgo: ${result.riskLevel === 'low' ? 'bajo' : result.riskLevel === 'medium' ? 'medio' : 'alto'}. ${result.plainLanguageSummary}` : 
                          `Risk Level: ${result.riskLevel}. ${result.plainLanguageSummary}`}
                      </div>
                      {riskBadgeWithLang(result.riskLevel)}
                    </div>
                    <h2 className={`text-2xl font-black leading-tight ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{result.plainLanguageSummary}</h2>
                  </div>

                  <div className="space-y-5">
                    <section className={`p-4 rounded-2xl border transition-colors ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                      <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{settings.language === 'es' ? 'Análisis Detallado' : 'Detailed Analysis'}</h3>
                      <p className={`text-sm leading-relaxed font-medium ${resolvedTheme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{result.whyThisMayBeUnsafe}</p>
                    </section>

                    <section className="space-y-2">
                       <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 italic">{settings.language === 'es' ? 'Pasos Seguros' : 'Safe Next Steps'}</h3>
                       <div className="space-y-2">
                         {result.safeNextSteps.map((step, i) => (
                           <div key={i} className={`flex gap-3 p-3 border rounded-xl shadow-sm transition-colors ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                             <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center text-emerald-700 font-black text-[10px] shrink-0">{i+1}</div>
                             <span className={`text-xs font-bold ${resolvedTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{step}</span>
                           </div>
                         ))}
                       </div>
                    </section>

                    <section className={`p-4 border rounded-2xl shadow-sm transition-colors ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <h3 className={`text-[10px] font-black uppercase mb-3 flex items-center gap-1.5 ${resolvedTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                        <Rocket size={12} className="text-blue-500" /> {settings.language === 'es' ? 'Guion de Verificación' : 'Verification Script'}
                      </h3>
                      <p className={`text-sm italic leading-relaxed border-l-2 border-blue-400 pl-3 p-3 rounded-r-lg ${resolvedTheme === 'dark' ? 'bg-slate-900/50 text-slate-300' : 'bg-slate-50 text-slate-600'}`}>
                        "{result.verificationScript}"
                      </p>
                      <p className="text-[9px] text-slate-400 mt-2 font-medium">{result.trustedVerificationAdvice}</p>
                    </section>
                  </div>

                  <button
                    onClick={() => setView('input')}
                    className={`w-full py-4 rounded-2xl font-black text-xs shadow-lg transition-colors ${resolvedTheme === 'dark' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
                  >
                    {settings.language === 'es' ? 'CERRAR Y REVISAR OTRO' : 'DISMISS & CHECK ANOTHER'}
                  </button>
                </motion.div>
              )}

              {view === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <h2 className={`text-xl font-black ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{settings.language === 'es' ? 'Historial' : 'History'}</h2>
                  {savedAnalyses.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                      <History size={40} className={`mx-auto mb-2 ${resolvedTheme === 'dark' ? 'text-slate-500' : 'text-slate-300'}`} />
                      <p className="text-xs font-bold uppercase tracking-tight">{settings.language === 'es' ? 'Sin registros' : 'No records'}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedAnalyses.map((item) => (
                        <div key={item.id} className={`p-4 border rounded-2xl shadow-sm flex items-center justify-between group transition-colors ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                          <div className="min-w-0">
                            {riskBadgeWithLang(item.riskLevel)}
                            <p className={`text-sm font-bold truncate mt-1 ${resolvedTheme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{item.plainLanguageSummary}</p>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{new Date(item.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-1 items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => {setResult(item); setView('result');}} className="p-2 text-blue-500"><ChevronRight size={16} /></button>
                            <button onClick={() => deleteSaved(item.id)} className={`p-2 transition-colors ${resolvedTheme === 'dark' ? 'text-slate-600 hover:text-red-400' : 'text-slate-300 hover:text-red-500'}`}><Trash2 size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {view === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 pb-6"
                >
                  <h2 className={`text-xl font-black ${resolvedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{settings.language === 'es' ? 'Ajustes de accesibilidad' : 'Accessibility Settings'}</h2>
                  
                  <div className="space-y-4">
                    <section className={`p-4 rounded-2xl border shadow-sm space-y-4 ${resolvedTheme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{settings.language === 'es' ? 'Idioma' : 'Language'}</label>
                        <div className="flex gap-2">
                          {(['en', 'es'] as const).map(lang => (
                            <button
                              key={lang}
                              onClick={() => setSettings({...settings, language: lang})}
                              className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                settings.language === lang ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 
                                (resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500')
                              }`}
                            >
                              {lang === 'en' ? 'English' : 'Español'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{settings.language === 'es' ? 'Apariencia' : 'Appearance'}</label>
                        <div className="flex gap-2">
                          {(['system', 'light', 'dark'] as const).map(app => {
                            const labels = {
                              en: { system: 'System', light: 'Light', dark: 'Dark' },
                              es: { system: 'Sistema', light: 'Claro', dark: 'Oscuro' }
                            };
                            return (
                              <button
                                key={app}
                                onClick={() => setSettings({...settings, appearance: app})}
                                className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                                  settings.appearance === app ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 
                                  (resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500')
                                }`}
                              >
                                {labels[settings.language][app].toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${resolvedTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{settings.language === 'es' ? 'Lenguaje sencillo' : 'Simple Language'}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{settings.language === 'es' ? 'Usa palabras más cortas' : 'Use simpler words'}</span>
                        </div>
                        <button
                          onClick={() => setSettings({...settings, readingLevel: settings.readingLevel === 'simple' ? 'standard' : 'simple'})}
                          className={`w-12 h-6 rounded-full transition-colors relative ${settings.readingLevel === 'simple' ? 'bg-blue-500' : 'bg-slate-600'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.readingLevel === 'simple' ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${resolvedTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{settings.language === 'es' ? 'Alto contraste' : 'High Contrast'}</span>
                        </div>
                        <button
                          onClick={() => setSettings({...settings, highContrast: !settings.highContrast})}
                          className={`w-12 h-6 rounded-full transition-colors relative ${settings.highContrast ? 'bg-blue-500' : 'bg-slate-600'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.highContrast ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between py-2">
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold ${resolvedTheme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>{settings.language === 'es' ? 'Leer para mí' : 'Read to Me'}</span>
                          <span className="text-[10px] text-slate-400 uppercase">{settings.language === 'es' ? 'Escuchar instrucciones' : 'Hear safety steps'}</span>
                        </div>
                        <button
                          onClick={() => setSettings({...settings, readAloud: !settings.readAloud})}
                          className={`w-12 h-6 rounded-full transition-colors relative ${settings.readAloud ? 'bg-blue-500' : 'bg-slate-600'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.readAloud ? 'left-7' : 'left-1'}`} / >
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">{settings.language === 'es' ? 'Tamaño de texto' : 'Text Size'}</label>
                        <div className="flex gap-2">
                          {(['normal', 'large', 'xl'] as const).map(size => {
                            const labels = {
                              en: { normal: 'Normal', large: 'Large', xl: 'Extra Large' },
                              es: { normal: 'Normal', large: 'Grande', xl: 'E. Grande' }
                            };
                            return (
                              <button
                                key={size}
                                onClick={() => setSettings({...settings, textSize: size})}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  settings.textSize === size ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' : 
                                  (resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500')
                                }`}
                              >
                                {labels[settings.language][size].toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  </div>

                  <button
                    onClick={() => setView('input')}
                    className={`w-full py-4 rounded-2xl font-black text-xs shadow-lg transition-colors ${resolvedTheme === 'dark' ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
                  >
                    {settings.language === 'es' ? 'VOLVER' : 'BACK'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Nav */}
          <nav className={`h-20 border-t flex items-center justify-around px-4 transition-colors ${resolvedTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
             <button onClick={() => setView('input')} className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'input' ? 'text-blue-500' : (resolvedTheme === 'dark' ? 'text-slate-600' : 'text-slate-300')}`}>
                <div className={`p-2 rounded-xl transition-colors ${view === 'input' ? 'bg-blue-500/10' : ''}`}><FileText size={18} /></div>
                <span className="text-[9px] font-black uppercase tracking-widest">{settings.language === 'es' ? 'Identificar' : 'Identify'}</span>
             </button>
             <button onClick={() => setView('history')} className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'history' ? 'text-blue-500' : (resolvedTheme === 'dark' ? 'text-slate-600' : 'text-slate-300')}`}>
                <div className={`p-2 rounded-xl transition-colors ${view === 'history' ? 'bg-blue-500/10' : ''}`}><History size={18} /></div>
                <span className="text-[9px] font-black uppercase tracking-widest">{settings.language === 'es' ? 'Historial' : 'History'}</span>
             </button>
             <button onClick={() => setView('settings')} className={`flex flex-col items-center gap-1.5 transition-colors ${view === 'settings' ? 'text-blue-500' : (resolvedTheme === 'dark' ? 'text-slate-600' : 'text-slate-300')}`}>
                <div className={`p-2 rounded-xl transition-colors ${view === 'settings' ? 'bg-blue-500/10' : ''}`}><SettingsIcon size={18} /></div>
                <span className="text-[9px] font-black uppercase tracking-widest">{settings.language === 'es' ? 'Ajustes' : 'Settings'}</span>
             </button>
          </nav>
        </div>

        {/* Desktop Side Info */}
        <div className="hidden xl:flex flex-col gap-6 max-w-sm h-[680px] overflow-y-auto pr-4">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-200">
             <h3 className="text-sm font-black text-slate-800 mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span> Architecture
             </h3>
             <div className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">AI Engine</p>
                   <p className="text-xs font-medium text-slate-700">Google Gemini Flash (Stable)</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                   <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Data Schema</p>
                   <div className="text-[10px] font-mono text-slate-500 leading-tight">
                     riskLevel: "high" | "low"<br/>
                     summary: "Plain English"<br/>
                     confidence: number
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                   <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white shrink-0"><Rocket size={16} /></div>
                   <div>
                     <p className="text-[10px] font-black text-blue-800 tracking-tight">Active Sprint</p>
                     <p className="text-[11px] text-blue-600 font-bold">Refining JSON schema validation</p>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-[32px] text-white shadow-xl relative overflow-hidden group">
             <div className="absolute -right-4 -top-4 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
             <h3 className="text-sm font-black mb-3">Hackathon Impact</h3>
             <p className="text-xs text-slate-400 leading-relaxed italic">"A specific person from the target population used it and explained in their own words what changed..."</p>
             <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 tracking-widest uppercase">Criteria A Met</span>
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
             </div>
          </div>
        </div>

      </main>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-sm bg-red-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between z-50">
          <p className="text-xs font-bold uppercase tracking-tight">{error}</p>
          <button onClick={() => setError(null)}><X size={16} /></button>
        </div>
      )}
    </div>
  );
}
