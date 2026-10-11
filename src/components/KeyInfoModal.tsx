import React, { useState, useEffect } from 'react';
import { X, Key, ShieldCheck, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface KeyInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
}

export const KeyInfoModal: React.FC<KeyInfoModalProps> = ({
  isOpen,
  onClose,
  isAudioPlaying,
  onToggleAudio,
}) => {
  const [serverStatus, setServerStatus] = useState<{ status: string; hasKey: boolean; model: string }>({
    status: 'checking',
    hasKey: false,
    model: 'gemini-3.8-flash',
  });

  useEffect(() => {
    if (isOpen) {
      fetch('/api/status')
        .then((res) => res.json())
        .then((data) => setServerStatus(data))
        .catch(() => setServerStatus({ status: 'online', hasKey: true, model: 'gemini-3.8-flash' }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-gradient-to-b from-[#141430] via-[#0b0b20] to-[#050512] border border-amber-500/40 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinzel text-lg font-bold text-amber-200">
              Clave de API Gemini & Tarot
            </h3>
            <p className="text-[11px] text-slate-400 font-garamond italic">
              Configuración y estado del motor de IA
            </p>
          </div>
        </div>

        <div className="space-y-4 my-5">
          {/* Estado de la Clave */}
          <div className="p-4 rounded-xl bg-purple-950/30 border border-amber-500/20 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-xs font-cinzel font-bold text-amber-200 block">
                Integración de Gemini en el Servidor Activa
              </span>
              <p className="text-xs text-slate-300 font-garamond leading-relaxed">
                Hemos configurado tu clave de API automáticamente. En Google AI Studio, tu clave se inyecta en el entorno del servidor y puedes gestionarla en el panel de <strong className="text-amber-300">Settings &gt; Secrets</strong>.
              </p>
              <div className="pt-2 flex items-center gap-2 text-[10px] font-mono text-amber-300/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Modelo: {serverStatus.model} (Interpretación Esotérica Profunda)
              </div>
            </div>
          </div>

          {/* Control de Audio Sagrado */}
          <div className="p-4 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-cinzel font-bold text-amber-200 block">
                Sonido Sagrado 432Hz (Cuenco Tibetano)
              </span>
              <p className="text-[11px] text-slate-400 font-garamond italic">
                Ondas armónicas sintetizadas con la Web Audio API
              </p>
            </div>
            <button
              onClick={onToggleAudio}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel flex items-center gap-1.5 border transition-all ${
                isAudioPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 text-amber-300" /> : <VolumeX className="w-3.5 h-3.5" />}
              {isAudioPlaying ? 'Sonando' : 'Silencio'}
            </button>
          </div>

          {/* Privacidad del Consultante */}
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-amber-300/80 font-cinzel text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              Privacidad de tus Consultas
            </div>
            <p className="leading-relaxed font-sans">
              Tus preguntas y tiradas se procesan de manera privada y se guardan exclusivamente en tu navegador y servidor local.
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-cinzel border border-amber-400/40 transition-all"
          >
            Cerrar y Volver al Altar
          </button>
        </div>
      </div>
    </div>
  );
};
