"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, ChefHat, Crown, Calendar, Clock, ArrowRight } from "lucide-react";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [planTier, setPlanTier] = useState<string>('free');
    const [subscriptionExpiresAt, setSubscriptionExpiresAt] = useState<string | null>(null);
    const [name, setName] = useState<string>('');
    const [recipes, setRecipes] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }
            setUser(user);

            // Fetch Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('plan_tier, name, is_premium, subscription_expires_at')
                .eq('id', user.id)
                .single();

            let currentTier = profile?.plan_tier?.toLowerCase() || 'free';
            const expiryDate = profile?.subscription_expires_at;

            // Check Expiry
            if (currentTier !== 'free' && expiryDate) {
                if (new Date(expiryDate) < new Date()) {
                    currentTier = 'free';
                }
            }

            setPlanTier(currentTier);
            setSubscriptionExpiresAt(expiryDate);

            // Fallback for legacy premium users OR essential users -> Performance
            if ((currentTier === 'free' && profile?.is_premium) || currentTier === 'essential') {
                currentTier = 'performance';
            }

            setPlanTier(currentTier);

            // Prioriza nome do perfil, depois metadata, depois 'Chef'
            const profileName = profile?.name;
            const metaName = user.user_metadata?.name;
            setName(profileName || metaName || 'Chef');

            // Fetch Recipes
            const { data: savedRecipes } = await supabase
                .from('saved_recipes')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (savedRecipes) {
                setRecipes(savedRecipes);
            }

            setLoading(false);
        };

        fetchData();
    }, [router, supabase]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const getPlanDetails = (tier: string) => {
        switch (tier) {

            case 'performance':
                return { name: 'FitChef Performance', description: 'Automação total com Cardápio e Lista de Compras.', color: 'text-brand-yellow' };
            case 'master':
                return { name: 'FitChef Master', description: 'Domínio total e suporte exclusivo.', color: 'text-brand-yellow' };
            default:
                return {
                    name: 'Plano Gratuito',
                    description: (
                        <>
                            Você tem 3 gerações por dia.
                            <br />
                            <span className="text-brand-yellow font-bold">Faça o upgrade para acesso ilimitado.</span>
                        </>
                    ),
                    color: 'text-white'
                };
        }
    };

    const planDetails = getPlanDetails(planTier);
    const isFree = planTier === 'free';

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-black"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-brand-yellow rounded-2xl flex items-center justify-center shadow-lg shadow-brand-yellow/20">
                                <ChefHat className="w-8 h-8 text-brand-black" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sair
                        </button>
                    </div>

                    {/* Status Card */}
                    <div className="mt-8 bg-gradient-to-br from-gray-900 to-black rounded-2xl p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-yellow/10 rounded-full blur-3xl -mr-16 -mt-16"></div>

                        <div className="relative z-10 flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1 select-none cursor-default">Seu Plano</p>
                                <div className="flex items-center gap-3">
                                    <h2 className={`text-3xl font-bold ${planDetails.color} select-none cursor-default`}>
                                        {planDetails.name}
                                    </h2>
                                    {!isFree && <Crown className="w-6 h-6 text-brand-yellow" />}
                                </div>
                                <p className="mt-2 text-gray-400 max-w-md select-none cursor-default">
                                    {planDetails.description}
                                </p>
                                {!isFree && subscriptionExpiresAt && (
                                    <p className="mt-4 text-sm text-gray-400 flex items-center gap-2 select-none cursor-default">
                                        <Calendar className="w-4 h-4 text-brand-yellow" />
                                        Renova em: <span className="text-white font-bold">{new Date(subscriptionExpiresAt).toLocaleDateString('pt-BR')}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-4">
                        <Link href="/premium" className="w-full py-4 bg-brand-yellow text-brand-black font-bold rounded-xl hover:bg-brand-yellow-light transition-colors shadow-lg shadow-brand-yellow/20 flex items-center justify-center text-center gap-2">
                            {isFree ? "Seja Premium" : "Atualiza Plano"}
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <ChefHat className="w-5 h-5" />
                        Receitas Salvas
                    </h2>
                    <Link href="/generate" className="flex items-center gap-2 px-4 py-2 bg-brand-black text-white font-bold rounded-lg hover:bg-gray-800 transition-colors shadow-lg">
                        Nova Receita <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>

                {recipes.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ChefHat className="w-8 h-8 text-gray-300" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma receita salva</h3>
                        <p className="text-gray-500 mb-6">Suas receitas geradas aparecerão aqui.</p>
                        <Link
                            href="/generate"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-black text-white font-bold rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            Gerar Primeira Receita
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {recipes.map((item) => (
                            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all group">
                                <div className="h-48 relative overflow-hidden">
                                    <img
                                        src={item.recipe_data.imageUrl}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {item.recipe_data.time || '30 min'}
                                    </div>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1">{item.title}</h3>
                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ChefHat className="w-4 h-4" />
                                            {item.recipe_data.calories || 'N/A'} kcal
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('fitchef_recipe', JSON.stringify(item.recipe_data));
                                            router.push('/generate?view=result');
                                        }}
                                        className="w-full py-2 bg-brand-yellow text-brand-black font-bold rounded-lg hover:bg-brand-yellow-light transition-colors shadow-md shadow-brand-yellow/10"
                                    >
                                        Ver Detalhes
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
