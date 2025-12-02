"use client";

import { ChefHat, ArrowRight, Sparkles, ArrowLeft, Loader2, Clock, Flame, Scale, CheckCircle2, Utensils, Lock, User, ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, Suspense, useRef } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { PremiumModal } from "../components/PremiumModal";

interface SelectOption {
    value: string;
    label: string;
    isPremium?: boolean;
}

interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    label: string;
    isPremiumUser: boolean;
    onLockedClick: () => void;
}

function CustomSelect({ options, value, onChange, label, isPremiumUser, onLockedClick }: CustomSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="space-y-3" ref={containerRef}>
            <label className="block text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                <div className="w-1 h-4 bg-brand-yellow rounded-full"></div>
                {label}
            </label>
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full h-14 px-6 rounded-2xl border-2 bg-black/20 text-left text-white font-medium transition-all flex items-center justify-between
                        ${isOpen ? 'border-brand-yellow bg-black/40 ring-4 ring-brand-yellow/10' : 'border-white/10 hover:border-white/20'}`}
                >
                    <span className="truncate">{selectedOption?.label || value}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <div className="absolute z-50 w-full mt-2 py-2 bg-gray-900 border border-white/10 rounded-2xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                        {options.map((option) => {
                            const isLocked = option.isPremium && !isPremiumUser;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        if (isLocked) {
                                            onLockedClick();
                                            setIsOpen(false);
                                            return;
                                        }
                                        onChange(option.value);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full px-6 py-3 text-left transition-colors flex items-center justify-between group
                                        ${value === option.value ? 'bg-brand-yellow/10 text-brand-yellow font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white'}
                                        ${isLocked ? 'opacity-70' : ''}`}
                                >
                                    <span className="flex items-center gap-2">
                                        {option.label}
                                        {option.isPremium && !isPremiumUser && <Lock className="w-3 h-3 text-brand-yellow" />}
                                    </span>
                                    {value === option.value && <CheckCircle2 className="w-4 h-4" />}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

function GenerateContent() {
    const [isLoading, setIsLoading] = useState(false);
    const [recipe, setRecipe] = useState<any>(null);
    const [isRestoring, setIsRestoring] = useState(true);
    const [loadingMessage, setLoadingMessage] = useState("Aquecendo os fornos...");
    const [generationMode, setGenerationMode] = useState<'single' | 'daily'>('single');
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [modalType, setModalType] = useState<'limit' | 'feature'>('limit');
    const [planTier, setPlanTier] = useState<string>('free');
    const [showShoppingList, setShowShoppingList] = useState(false);

    // Form State
    const [goal, setGoal] = useState("Low Carb");
    const [time, setTime] = useState("30 min (Rápido)");

    // Derived State for UI Locking
    const isFree = planTier === 'free';
    const isEssential = planTier === 'essential';
    const isPerformance = planTier === 'performance';
    const isMaster = planTier === 'master'; // Keeping for backward compatibility

    const canUseRestrictedOptions = !isFree;
    const canUseDaily = isPerformance || isMaster;
    const canUseShoppingList = isPerformance || isMaster;

    // Fetch premium status
    useEffect(() => {
        const checkPremium = async () => {
            const { createClient } = await import("@/utils/supabase/client");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data } = await supabase
                    .from('profiles')
                    .select('plan_tier')
                    .eq('id', user.id)
                    .single();
                setPlanTier(data?.plan_tier || 'free');
            }
        };
        checkPremium();
    }, []);

    const router = useRouter();
    const searchParams = useSearchParams();
    const view = searchParams.get('view');

    const loadingMessages = [
        "Analisando seus ingredientes...",
        "Consultando chefs renomados...",
        "Calculando os macros...",
        "Picando os temperos...",
        "Finalizando o empratamento...",
        "Só mais um pouquinho..."
    ];

    useEffect(() => {
        // Only restore if view is 'result'
        const savedRecipe = localStorage.getItem('fitchef_recipe');

        if (view === 'result' && savedRecipe) {
            setRecipe(JSON.parse(savedRecipe));
        } else {
            setRecipe(null);
        }

        setIsRestoring(false);
    }, [view]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            let i = 0;
            interval = setInterval(() => {
                setLoadingMessage(loadingMessages[i % loadingMessages.length]);
                i++;
            }, 2500);
        }
        return () => clearInterval(interval);
    }, [isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        setRecipe(null);

        try {
            const ingredients = (document.getElementById('ingredients') as HTMLTextAreaElement).value;
            // goal and time are now from state
            const selectedTime = generationMode === 'single' ? time : '30 min';

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ingredients, goal, time: selectedTime, mode: generationMode }),
            });

            const data = await response.json();


            if (!response.ok) {
                if (response.status === 403) {
                    if (data.code === 'LIMIT_REACHED') setModalType('limit');
                    if (data.code === 'PREMIUM_REQUIRED') setModalType('feature');

                    setShowPremiumModal(true);
                    setIsLoading(false);
                    return;
                }
                throw new Error(data.error || 'Erro ao gerar receita');
            }

            // Add generated image URL
            const imagePrompt = data.imagePrompt || `delicious food photography of ${data.title}`;
            const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(imagePrompt)}, professional food photography, 4k, high detail, appetizing, soft lighting?width=800&height=600&nologo=true`;
            data.imageUrl = imageUrl;

            setRecipe(data);
            localStorage.setItem('fitchef_recipe', JSON.stringify(data));

            // Push state to URL so back button works
            router.push('/generate?view=result');

        } catch (error: any) {
            console.error(error);
            alert(error.message || "Ocorreu um erro ao gerar a receita.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center p-4 sm:p-8 font-sans selection:bg-brand-yellow selection:text-brand-black overflow-x-hidden">

            {/* Background with Overlay */}
            <div className="fixed inset-0 z-0 h-[100dvh] w-screen pointer-events-none">
                <Image
                    src="https://images.unsplash.com/photo-1543353071-873f17a7a088?q=80&w=2070&auto=format&fit=crop"
                    alt="Background"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-3 flex justify-between items-center w-full bg-white/10 backdrop-blur-md border-b border-white/10 transition-all">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity group">
                        <div className="w-8 h-8 bg-brand-yellow rounded-xl flex items-center justify-center shadow-lg shadow-brand-yellow/20 group-hover:scale-105 transition-transform">
                            <ChefHat className="w-5 h-5 text-brand-black" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">FitChef IA</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link href="/profile" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                            <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                <User className="w-4 h-4" />
                            </div>
                        </Link>
                        {!recipe && (
                            <Link href="/" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Voltar
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            <main className="relative z-10 w-full max-w-6xl mx-auto pt-20 pb-10">
                {isRestoring ? (
                    <div className="flex h-[60vh] items-center justify-center animate-in fade-in duration-700">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-brand-yellow/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-brand-yellow/20">
                                <Loader2 className="w-8 h-8 text-brand-yellow animate-spin" />
                            </div>
                            <p className="text-white/60 font-medium animate-pulse">Carregando seu chef...</p>
                        </div>
                    </div>
                ) : !recipe ? (
                    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
                        <div className="text-center space-y-4">
                            <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-brand-yellow/20 border border-brand-yellow/30 text-brand-yellow font-bold text-sm backdrop-blur-md mb-4">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Inteligência Artificial Culinária
                            </div>
                            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight drop-shadow-xl">
                                O que vamos <br /> <span className="text-brand-yellow">cozinhar hoje?</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
                                Diga o que você tem na geladeira e deixe o FitChef criar uma receita exclusiva para você.
                            </p>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex justify-center">
                            <div className="bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 inline-flex">
                                <button
                                    onClick={() => setGenerationMode('single')}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${generationMode === 'single'
                                        ? 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    <Utensils className="w-4 h-4" />
                                    Receita Única
                                </button>
                                <button
                                    onClick={() => {
                                        if (!canUseDaily) {
                                            setModalType('feature');
                                            setShowPremiumModal(true);
                                            return;
                                        }
                                        setGenerationMode('daily');
                                    }}
                                    className={`px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${generationMode === 'daily'
                                        ? 'bg-brand-yellow text-brand-black shadow-lg shadow-brand-yellow/20'
                                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }`}
                                >
                                    {!canUseDaily && <Lock className="w-3 h-3 text-brand-yellow" />}
                                    <ChefHat className="w-4 h-4" />
                                    Cardápio do Dia
                                </button>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xl p-6 sm:p-10 rounded-[1.5rem] shadow-2xl border border-white/10 ring-1 ring-black/5">
                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="space-y-4">
                                    <label htmlFor="ingredients" className="block text-sm font-bold text-white uppercase tracking-wide flex items-center gap-2">
                                        <div className="w-1 h-4 bg-brand-yellow rounded-full"></div>
                                        Ingredientes Disponíveis
                                    </label>
                                    <div className="relative group">
                                        <textarea
                                            id="ingredients"
                                            required
                                            rows={4}
                                            className="w-full rounded-2xl border-2 border-white/10 bg-black/20 focus:bg-black/40 focus:border-brand-yellow focus:ring-4 focus:ring-brand-yellow/10 text-lg p-6 text-white placeholder:text-gray-500 transition-all resize-none"
                                            placeholder="Ex: 2 ovos, meio pacote de macarrão, frango desfiado, cenoura..."
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSubmit(e as any);
                                                }
                                            }}
                                        />
                                        <div className="absolute bottom-4 right-4 text-xs text-gray-400 font-medium bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm border border-white/5">
                                            Enter para enviar
                                        </div>
                                    </div>
                                </div>

                                <div className={`grid grid-cols-1 ${generationMode === 'single' ? 'sm:grid-cols-2' : ''} gap-6`}>
                                    <CustomSelect
                                        label="Seu Objetivo"
                                        value={goal}
                                        onChange={setGoal}
                                        isPremiumUser={canUseRestrictedOptions}
                                        onLockedClick={() => {
                                            setModalType('feature');
                                            setShowPremiumModal(true);
                                        }}
                                        options={[
                                            { value: "Low Carb", label: "Low Carb", isPremium: false },
                                            { value: "Perda de peso", label: "Perda de peso", isPremium: true },
                                            { value: "Ganho de massa", label: "Ganho de massa", isPremium: true },
                                            { value: "Manutenção", label: "Manutenção", isPremium: true },
                                            { value: "Energia rápida", label: "Energia rápida", isPremium: true },
                                        ]}
                                    />

                                    {generationMode === 'single' && (
                                        <CustomSelect
                                            label="Tempo"
                                            value={time}
                                            onChange={setTime}
                                            isPremiumUser={canUseRestrictedOptions}
                                            onLockedClick={() => {
                                                setModalType('feature');
                                                setShowPremiumModal(true);
                                            }}
                                            options={[
                                                { value: "15 min (Vapt-vupt)", label: "15 min (Vapt-vupt)", isPremium: true },
                                                { value: "30 min (Rápido)", label: "30 min (Rápido)", isPremium: false },
                                                { value: "45 min (Tranquilo)", label: "45 min (Tranquilo)", isPremium: true },
                                                { value: "1 hora+ (Chef)", label: "1 hora+ (Chef)", isPremium: true },
                                            ]}
                                        />
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-6 bg-brand-yellow text-brand-black font-bold rounded-2xl hover:bg-brand-yellow-light transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-brand-yellow/20 flex items-center justify-center gap-3 text-lg disabled:opacity-80 disabled:cursor-not-allowed group relative overflow-hidden"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin text-brand-black" />
                                            <span className="text-brand-black">{loadingMessage}</span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                            <Sparkles className="w-6 h-6 text-brand-black group-hover:animate-spin-slow" />
                                            {generationMode === 'single' ? 'Criar Minha Receita' : 'Gerar Cardápio Completo'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-black/50 border border-white/10 overflow-hidden">
                            {/* Hero Image */}
                            <div className="relative h-72 sm:h-96 w-full bg-gray-100 group">
                                <Image
                                    src={recipe.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1780&auto=format&fit=crop"}
                                    alt={recipe.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    unoptimized
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 text-white">
                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-yellow text-brand-black text-xs font-bold mb-4 shadow-lg shadow-brand-yellow/20">
                                        <Sparkles className="w-3 h-3" />
                                        Receita Exclusiva
                                    </div>
                                    <h2 className="text-3xl sm:text-5xl font-extrabold leading-tight shadow-black/50 drop-shadow-lg">{recipe.title}</h2>
                                </div>
                            </div>

                            <div className="p-8 sm:p-12">
                                <p className="text-xl text-gray-600 mb-10 leading-relaxed font-medium">
                                    {recipe.description}
                                </p>

                                {/* Stats Grid */}
                                {/* Stats Grid - Only show if not daily or if daily (we can hide or adapt, but let's hide for daily as meals have their own stats) */}
                                {recipe.type !== 'daily' && (
                                    <div className="grid grid-cols-3 gap-4 sm:gap-8 mb-12">
                                        <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 hover:border-orange-200 transition-colors flex flex-col items-center justify-center">
                                            <Clock className="w-8 h-8 mb-3 text-orange-500" />
                                            <span className="font-bold text-xl text-gray-900 text-center">{recipe.time.replace(/Aproximadamente /gi, "")}</span>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Tempo</span>
                                        </div>
                                        <div className="bg-red-50 p-6 rounded-3xl border border-red-100 hover:border-red-200 transition-colors flex flex-col items-center justify-center">
                                            <Flame className="w-8 h-8 mb-3 text-red-500" />
                                            <span className="font-bold text-xl text-gray-900 text-center">{recipe.calories.replace(/Aproximadamente /gi, "")}</span>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Calorias</span>
                                        </div>
                                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 hover:border-blue-200 transition-colors flex flex-col items-center justify-center">
                                            <Scale className="w-8 h-8 mb-3 text-blue-500" />
                                            <span className="font-bold text-xl text-gray-900 text-center">{recipe.protein.replace(/Aproximadamente /gi, "")}</span>
                                            <span className="text-xs text-gray-500 uppercase tracking-wider font-bold mt-1">Proteína</span>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {recipe.type === 'daily' ? (
                                <div className="space-y-12 px-8 sm:px-12">
                                    <div className="grid gap-8">
                                        {recipe.meals.map((meal: any, index: number) => (
                                            <div key={index} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:border-brand-yellow/30 transition-all hover:shadow-lg group">
                                                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-brand-yellow/10 flex items-center justify-center text-brand-yellow font-bold text-xl group-hover:scale-110 transition-transform">
                                                            {index + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{meal.name}</h4>
                                                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{meal.title}</h3>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-bold text-gray-600 flex items-center gap-2">
                                                            <Flame className="w-4 h-4 text-red-500" />
                                                            {meal.calories}
                                                        </div>
                                                        <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-sm font-bold text-gray-600 flex items-center gap-2">
                                                            <Scale className="w-4 h-4 text-blue-500" />
                                                            {meal.protein}
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-600 leading-relaxed pl-0 sm:pl-16">
                                                    {meal.instructions}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="grid md:grid-cols-2 gap-12 sm:gap-16 px-8 sm:px-12">
                                    {/* Ingredients */}
                                    <div>
                                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-gray-900">
                                            <div className="p-2.5 bg-brand-yellow rounded-xl shadow-lg shadow-brand-yellow/20">
                                                <Utensils className="w-6 h-6 text-brand-black" />
                                            </div>
                                            Ingredientes
                                        </h3>
                                        <ul className="space-y-4">
                                            {recipe.ingredients.map((item: string, i: number) => (
                                                <li key={i} className="flex items-start gap-4 text-gray-700 bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-gray-200 transition-colors">
                                                    <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                    </div>
                                                    <span className="font-medium text-lg">{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Instructions */}
                                    <div>
                                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3 text-gray-900">
                                            <div className="p-2.5 bg-brand-black rounded-xl shadow-lg shadow-brand-black/20">
                                                <ChefHat className="w-6 h-6 text-white" />
                                            </div>
                                            Modo de Preparo
                                        </h3>
                                        <div className="space-y-8">
                                            {recipe.instructions.map((step: string, i: number) => (
                                                <div key={i} className="flex gap-6">
                                                    <div className="flex-shrink-0 w-12 h-12 bg-brand-black text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-brand-black/20">
                                                        {i + 1}
                                                    </div>
                                                    <p className="text-gray-600 text-lg leading-relaxed pt-2">
                                                        {step}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Shopping List Button (Available for all types if Premium) */}
                            <div className="mt-12 flex justify-center">
                                {canUseShoppingList ? (
                                    <button
                                        onClick={() => setShowShoppingList(true)}
                                        className="px-8 py-4 bg-brand-black text-white font-bold rounded-2xl hover:bg-gray-900 transition-all transform hover:scale-105 shadow-xl shadow-black/20 flex items-center gap-3 text-lg"
                                    >
                                        <div className="p-1 bg-brand-yellow rounded-lg text-brand-black">
                                            <Utensils className="w-4 h-4" />
                                        </div>
                                        Ver Lista de Compras
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setModalType('feature');
                                            setShowPremiumModal(true);
                                        }}
                                        className="px-8 py-4 bg-gray-100 text-gray-400 font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-3 text-lg cursor-pointer"
                                    >
                                        <Lock className="w-5 h-5" />
                                        Lista de Compras (Premium)
                                    </button>
                                )}
                            </div>

                            <div className="mt-16 pt-10 border-t border-gray-100">
                                <button
                                    onClick={() => {
                                        setRecipe(null);
                                        localStorage.removeItem('fitchef_recipe');
                                        router.push('/generate');
                                    }}
                                    className="w-full py-5 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-3 text-lg group"
                                >
                                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    Gerar Nova Receita
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <PremiumModal isOpen={showPremiumModal} onClose={() => setShowPremiumModal(false)} type={modalType} />

            {/* Shopping List Modal */}
            {
                showShoppingList && (recipe?.shopping_list || recipe?.ingredients) && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white w-full max-w-2xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                    <div className="p-2 bg-brand-yellow rounded-xl text-brand-black">
                                        <Utensils className="w-5 h-5" />
                                    </div>
                                    Lista de Compras
                                </h3>
                                <button
                                    onClick={() => setShowShoppingList(false)}
                                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6 text-gray-500 rotate-180" />
                                </button>
                            </div>
                            <div className="p-8 max-h-[60vh] overflow-y-auto">
                                <div className="grid gap-8">
                                    {recipe.shopping_list ? (
                                        Object.entries(recipe.shopping_list).map(([category, items]: [string, any], idx: number) => (
                                            <div key={idx}>
                                                <h4 className="font-bold text-lg text-brand-black mb-4 border-b border-gray-100 pb-2">
                                                    {category}
                                                </h4>
                                                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {Array.isArray(items) && items.map((item: string, i: number) => (
                                                        <li key={i} className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                                                            <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))
                                    ) : (
                                        <div>
                                            <h4 className="font-bold text-lg text-brand-black mb-4 border-b border-gray-100 pb-2">
                                                Ingredientes Necessários
                                            </h4>
                                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {recipe.ingredients.map((item: string, i: number) => (
                                                    <li key={i} className="flex items-center gap-3 text-gray-600 bg-gray-50 p-3 rounded-xl">
                                                        <div className="w-2 h-2 rounded-full bg-brand-yellow"></div>
                                                        {item}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                                <button
                                    onClick={() => setShowShoppingList(false)}
                                    className="px-8 py-3 bg-brand-black text-white font-bold rounded-xl hover:bg-gray-900 transition-colors"
                                >
                                    Fechar Lista
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <Loader2 className="w-10 h-10 animate-spin text-brand-yellow" />
            </div>
        }>
            <GenerateContent />
        </Suspense>
    );
}
