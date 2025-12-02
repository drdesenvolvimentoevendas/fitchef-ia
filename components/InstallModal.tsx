"use client";

import { useState, useEffect } from "react";
import { X, Download, Share, PlusSquare, Smartphone } from "lucide-react";

export default function InstallModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsStandalone(true);
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const ios = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(ios);

        // Capture install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
            // Auto-open modal for demo purposes if not installed
            if (!window.matchMedia('(display-mode: standalone)').matches) {
                setIsOpen(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setDeferredPrompt(null);
            setIsOpen(false);
        }
    };

    if (isStandalone || !isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 relative">
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                    <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-brand-yellow rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-brand-yellow/30">
                        <Smartphone className="w-10 h-10 text-brand-black" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Instale o App FitChef</h2>
                    <p className="text-gray-600 mb-8">
                        Para a melhor experiência, adicione o FitChef à sua tela inicial. É rápido e não ocupa espaço!
                    </p>

                    {isIOS ? (
                        <div className="bg-gray-50 rounded-2xl p-6 text-left space-y-4 border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Share className="w-5 h-5 text-blue-600" />
                                </div>
                                <p className="text-sm text-gray-700 font-medium">1. Toque no botão <span className="font-bold">Compartilhar</span></p>
                            </div>
                            <div className="w-full h-px bg-gray-200"></div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <PlusSquare className="w-5 h-5 text-gray-700" />
                                </div>
                                <p className="text-sm text-gray-700 font-medium">2. Selecione <span className="font-bold">Adicionar à Tela de Início</span></p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="w-full py-4 bg-brand-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-xl"
                        >
                            <Download className="w-5 h-5" />
                            Instalar Agora
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
