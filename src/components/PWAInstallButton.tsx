import React, { useState } from 'react';
import { Download, Sparkles, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // Si ya está ejecutándose como PWA instalada (standalone), no mostrar botón
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setJustInstalled(true);
        setTimeout(() => setJustInstalled(false), 3000);
      }
    } else {
      // Mostrar instrucciones para instalar desde el navegador (Chrome, Edge, Safari, Firefox)
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Instalar como aplicación en tu móvil o escritorio"
        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 via-amber-400/25 to-purple-600/25 hover:from-amber-500/35 hover:to-purple-600/40 border border-amber-400/50 text-amber-200 text-xs font-cinzel font-semibold flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(212,175,55,0.25)] hover:scale-105 active:scale-95 shrink-0"
      >
        <Download className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
        <span>Instalar App</span>
      </button>

      {/* Modal con instrucciones claras para cualquier navegador / iOS */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0d0d26] border border-amber-500/35 p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-amber-300 p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-amber-500/20 pb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-amber-200">
                  Instalar Arcana AI en tu Dispositivo
                </h3>
                <p className="text-xs text-slate-400 font-garamond">
                  Aplicación web progresiva (PWA) de alta resolución
                </p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-200 font-sans">
                <p className="font-medium text-amber-300 flex items-center gap-1.5">
                  <Share className="w-4 h-4 text-amber-400" />
                  Instrucciones para iPhone / iPad (Safari):
                </p>
                <ol className="list-decimal list-inside space-y-2 bg-black/40 p-3.5 rounded-xl border border-amber-500/20 text-slate-300">
                  <li>
                    Pulsa el botón <strong>Compartir</strong> <span className="inline-block px-1.5 py-0.5 bg-slate-800 rounded text-[11px]">⎋ / Compartir</span> en la barra inferior de Safari.
                  </li>
                  <li>
                    Desliza hacia abajo y selecciona <strong>«Añadir a pantalla de inicio»</strong>.
                  </li>
                  <li>
                    Pulsa <strong>«Añadir»</strong> en la esquina superior derecha.
                  </li>
                </ol>
                <p className="text-[11px] text-slate-400 italic font-garamond text-center">
                  ¡Listo! Se añadirá el icono de Arcana AI con acceso instantáneo y pantalla completa.
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-200 font-sans">
                <p className="font-medium text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Instrucciones para Android o PC / Mac:
                </p>
                <div className="space-y-2 bg-black/40 p-3.5 rounded-xl border border-amber-500/20 text-slate-300">
                  <p>
                    • <strong>En Chrome / Android / Edge:</strong> Pulsa el menú de tres puntos (⋮) en la esquina superior y selecciona <strong>«Instalar aplicación»</strong> o <strong>«Añadir a pantalla de inicio»</strong>.
                  </p>
                  <p>
                    • <strong>En escritorio (Chrome/Edge):</strong> También puedes hacer clic en el icono de instalación (⊞/⬇) situado en la barra de direcciones del navegador.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-cinzel font-semibold transition"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {justInstalled && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-950/90 border border-emerald-400 text-emerald-200 px-4 py-2.5 rounded-xl shadow-xl text-xs font-cinzel animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          ¡Arcana AI instalada con éxito!
        </div>
      )}
    </>
  );
};
