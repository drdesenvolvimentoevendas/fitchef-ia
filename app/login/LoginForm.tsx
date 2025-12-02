"use client";

import { useState } from "react";
import { login, signup } from "./actions";
import { Eye, EyeOff } from "lucide-react";

interface LoginFormProps {
    message?: string;
    error?: string;
}

export function LoginForm({ message, error }: LoginFormProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [mode, setMode] = useState<'login' | 'signup'>('login');

    return (
        <div className="mt-8 bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
            {/* Toggle Buttons */}
            <div className="flex p-1 bg-black/40 rounded-xl mb-8">
                <button
                    onClick={() => setMode('login')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'login'
                            ? 'bg-brand-yellow text-brand-black shadow-lg'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Entrar
                </button>
                <button
                    onClick={() => setMode('signup')}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${mode === 'signup'
                            ? 'bg-brand-yellow text-brand-black shadow-lg'
                            : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Criar Conta
                </button>
            </div>

            <form className="space-y-6">
                <div className="space-y-4">
                    {mode === 'signup' && (
                        <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                Nome
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                autoComplete="name"
                                required
                                className="mt-1 block w-full rounded-xl border-white/10 bg-black/50 text-white placeholder-gray-500 focus:border-brand-yellow focus:ring-brand-yellow sm:text-sm h-12 px-4"
                                placeholder="Seu Nome"
                            />
                        </div>
                    )}

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="mt-1 block w-full rounded-xl border-white/10 bg-black/50 text-white placeholder-gray-500 focus:border-brand-yellow focus:ring-brand-yellow sm:text-sm h-12 px-4"
                            placeholder="seu@email.com"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                            Senha
                        </label>
                        <div className="relative mt-1">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete={mode === 'login' ? "current-password" : "new-password"}
                                required
                                className="block w-full rounded-xl border-white/10 bg-black/50 text-white placeholder-gray-500 focus:border-brand-yellow focus:ring-brand-yellow sm:text-sm h-12 px-4 pr-12"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 hover:text-white transition-colors"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {message && (
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm text-center animate-in fade-in zoom-in-95">
                        {message}
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center animate-in fade-in zoom-in-95">
                        {error}
                    </div>
                )}

                <button
                    formAction={mode === 'login' ? login : signup}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-brand-black bg-brand-yellow hover:bg-brand-yellow-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-yellow transition-all transform active:scale-95"
                >
                    {mode === 'login' ? 'Entrar na Conta' : 'Criar Nova Conta'}
                </button>
            </form>
        </div>
    );
}
