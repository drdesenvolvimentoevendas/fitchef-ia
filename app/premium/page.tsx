"use client";

import { CheckCircle2, Crown, Sparkles, Star, ShieldCheck, ArrowRight, ChefHat, User, Lock, Zap, Calendar } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function PremiumPage() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'semiannual' | 'annual'>('monthly'); // Default to monthly

    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            setIsLoggedIn(!!user);
        };
        checkUser();
    }, []);

    const performancePricing = {
        monthly: { price: "9,99", label: "/mês", total: "R$ 9,99/mês", savings: null },
        semiannual: { price: "6,99", label: "/mês", total: "R$ 41,95/semestre", savings: "30% OFF" },
        annual: { price: "4,99", label: "/mês", total: "R$ 59,94/ano", savings: "40% OFF" }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-brand-yellow selection:text-brand-black">
            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center w-full bg-black/80 backdrop-blur-md border-b border-white/10">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 bg-brand-yellow rounded-xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                            <ChefHat className="w-6 h-6 text-brand-black" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">FitChef IA</span>
                    </Link>
                    {isLoggedIn ? (
                        <Link href="/profile" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                        </Link>
                    ) : (
                        <Link href="/login" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors">
                            Entrar
                        </Link>
                    )}
                </div>
            </nav>

            <main className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto space-y-20">

                    {/* Hero Section */}
                    <div className="text-center space-y-6 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow/10 border border-brand-yellow/20 text-brand-yellow font-bold text-sm mb-4">
                            <Crown className="w-4 h-4" />
                            Seja um Chef Performance
                        </div>
                        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
                            A Automação Total da Sua Dieta <br />
                            <span className="text-brand-yellow">Começa Agora.</span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed">
                            Escolha o plano ideal para transformar sua alimentação. Do básico ao avançado, temos a solução perfeita para você.
                        </p>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-2 gap-8 items-start max-w-5xl mx-auto">

                        {/* FREE CARD */}
                        <div className="bg-white/5 border border-white/10 rounded-[2rem] p-8 hover:border-white/20 transition-all flex flex-col h-full opacity-80 hover:opacity-100">
                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-white mb-2">Fit Chef Degustação</h3>
                                <p className="text-gray-400 text-sm h-10">Para conhecer e testar a IA.</p>
                            </div>
                            <div className="mb-8">
                                <span className="text-4xl font-extrabold text-white">Grátis</span>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-start gap-3 text-gray-300">
                                    <CheckCircle2 className="w-5 h-5 text-brand-yellow flex-shrink-0" />
                                    <span>3 Gerações por dia</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <CheckCircle2 className="w-5 h-5 text-brand-yellow flex-shrink-0" />
                                    <span>Objetivo Low Carb</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-300">
                                    <CheckCircle2 className="w-5 h-5 text-brand-yellow flex-shrink-0" />
                                    <span>Preparo Rápido (30 min)</span>
                                </li>
                                <li className="flex items-start gap-3 text-gray-500 line-through decoration-gray-600">

                                </li>
                            </ul>
                            <Link href="/login" className="w-full py-4 rounded-xl border border-white/20 font-bold hover:bg-white hover:text-black transition-all text-center block">
                                Começar Grátis
                            </Link>
                        </div>

                        {/* PERFORMANCE CARD (HIGHLIGHTED) */}
                        <div className="bg-brand-yellow text-brand-black rounded-[2rem] p-8 shadow-2xl shadow-brand-yellow/20 relative transform md:-translate-y-4 flex flex-col h-full border-2 border-brand-yellow">
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black text-brand-yellow px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider border border-brand-yellow shadow-lg whitespace-nowrap">
                                Automação Total
                            </div>

                            <div className="mb-6 mt-2">
                                <h3 className="text-2xl font-bold mb-2">Fit Chef Performance</h3>
                                <p className="text-brand-black/80 text-sm h-10 font-medium">Cardápio completo e lista de compras em 1 clique.</p>
                            </div>

                            {/* Billing Cycle Selector */}
                            <div className="grid grid-cols-3 gap-1 bg-black/10 p-1 rounded-xl mb-6">
                                <button
                                    onClick={() => setBillingCycle('monthly')}
                                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === 'monthly' ? 'bg-black text-white shadow-md' : 'text-brand-black/60 hover:bg-black/5'}`}
                                >
                                    Mensal
                                </button>
                                <button
                                    onClick={() => setBillingCycle('semiannual')}
                                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === 'semiannual' ? 'bg-black text-white shadow-md' : 'text-brand-black/60 hover:bg-black/5'}`}
                                >
                                    Semestral
                                </button>
                                <button
                                    onClick={() => setBillingCycle('annual')}
                                    className={`py-1.5 rounded-lg text-xs font-bold transition-all ${billingCycle === 'annual' ? 'bg-black text-white shadow-md' : 'text-brand-black/60 hover:bg-black/5'}`}
                                >
                                    Anual
                                </button>
                            </div>

                            <div className="mb-2 relative">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-extrabold">R$ {performancePricing[billingCycle].price}</span>
                                    <span className="text-brand-black/70 font-bold">{performancePricing[billingCycle].label}</span>
                                </div>
                                {performancePricing[billingCycle].savings && (
                                    <div className="absolute -right-2 top-0 bg-black text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">
                                        {performancePricing[billingCycle].savings}
                                    </div>
                                )}
                                <p className="text-xs font-bold text-brand-black/60 mt-1 uppercase tracking-wide">
                                    {performancePricing[billingCycle].total}
                                </p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                <li className="flex items-start gap-3 font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
                                    <span>Gerações Ilimitadas</span>
                                </li>
                                <li className="flex items-start gap-3 font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
                                    <span>Todos os Objetivos</span>
                                </li>
                                <li className="flex items-start gap-3 font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
                                    <span>Todos os Tempo de Preparo</span>
                                </li>
                                <li className="flex items-start gap-3 font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
                                    <span>Cardápio do Dia Completo</span>
                                </li>
                                <li className="flex items-start gap-3 font-bold">
                                    <CheckCircle2 className="w-5 h-5 text-black flex-shrink-0" />
                                    <span>Lista de Compras Automática</span>
                                </li>
                            </ul>
                            {/* Checkout Button */}
                            {isLoggedIn ? (
                                <Link
                                    href={
                                        billingCycle === 'monthly' ? "https://pay.wiapy.com/m3khPhIrxv" :
                                            billingCycle === 'semiannual' ? "https://pay.wiapy.com/KDqzQgowq2" :
                                                "https://pay.wiapy.com/lMHJ-g9Ppi"
                                    }
                                    className="w-full py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-900 transition-all shadow-lg flex items-center justify-center gap-2 group"
                                >
                                    Quero Automação Total <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            ) : (
                                <Link
                                    href="/login?message=Faça login para assinar o plano"
                                    className="w-full py-4 rounded-xl bg-black text-white font-bold hover:bg-gray-900 transition-all shadow-lg flex items-center justify-center gap-2 group"
                                >
                                    Entrar para Assinar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}

                        </div>

                    </div>

                    {/* Comparison Table */}
                    <div className="bg-white/5 rounded-[2.5rem] p-8 sm:p-12 border border-white/10">
                        <h2 className="text-3xl font-bold text-center mb-12">Comparativo de Planos</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="py-4 px-4 text-gray-400 font-medium">Recurso</th>
                                        <th className="py-4 px-4 text-center font-bold text-gray-400">Grátis</th>
                                        <th className="py-4 px-4 text-center font-bold text-brand-yellow">Performance</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm sm:text-base">
                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-gray-300">Geração de Receitas</td>
                                        <td className="py-4 px-4 text-center text-gray-500">3/dia</td>
                                        <td className="py-4 px-4 text-center text-brand-yellow font-bold">Ilimitado</td>
                                    </tr>
                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-gray-300">Objetivos de Dieta</td>
                                        <td className="py-4 px-4 text-center text-gray-500">Só Low Carb</td>
                                        <td className="py-4 px-4 text-center text-brand-yellow">Todos</td>
                                    </tr>
                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-gray-300">Cardápio do Dia</td>
                                        <td className="py-4 px-4 text-center text-gray-500"><Lock className="w-4 h-4 mx-auto" /></td>
                                        <td className="py-4 px-4 text-center text-brand-yellow font-bold"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
                                    </tr>
                                    <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                        <td className="py-4 px-4 text-gray-300">Lista de Compras</td>
                                        <td className="py-4 px-4 text-center text-gray-500"><Lock className="w-4 h-4 mx-auto" /></td>
                                        <td className="py-4 px-4 text-center text-brand-yellow font-bold"><CheckCircle2 className="w-5 h-5 mx-auto" /></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
