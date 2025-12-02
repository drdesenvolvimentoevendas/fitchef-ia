import { X, Crown, CheckCircle2, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    type?: 'limit' | 'feature';
}

export function PremiumModal({ isOpen, onClose, type = 'limit' }: PremiumModalProps) {
    if (!isOpen) return null;

    const content = {
        limit: {
            title: "Limite Diário Atingido",
            description: <>Você atingiu seu limite de <span className="font-bold text-brand-black">3 gerações gratuitas</span> por dia.</>
        },
        feature: {
            title: "Recurso Exclusivo Premium",
            description: <>O <span className="font-bold text-brand-black">Cardápio do Dia</span> é exclusivo para assinantes Premium.</>
        }
    };

    const { title, description } = content[type];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300">
                {/* Header Image/Gradient */}
                <div className="h-32 relative flex items-center justify-center overflow-hidden bg-gray-900">
                    <Image
                        src="https://images.unsplash.com/photo-1615937657715-bc7b4b7962c1?q=80&w=2070&auto=format&fit=crop"
                        alt="Premium Background"
                        fill
                        className="object-cover opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

                    <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className="p-3 bg-brand-yellow rounded-2xl shadow-lg shadow-brand-yellow/20 animate-bounce-slow">
                            <Crown className="w-8 h-8 text-brand-black" />
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-20"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-8 text-center">
                    <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                        {title}
                    </h2>
                    <p className="text-gray-600 mb-8">
                        {description}
                    </p>

                    <div className="space-y-4 mb-8 text-left bg-gray-50 p-6 rounded-2xl border border-gray-100">
                        <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">
                            Escolha o plano ideal para você:
                        </h3>
                        <ul className="space-y-3">
                            {[
                                "Gerações ILIMITADAS (Essencial)",
                                "Todos os Objetivos e Tempos (Essencial)",
                                "Cardápio do Dia Completo (Performance)",
                                "Lista de Compras Automática (Performance)",
                                "Suporte Prioritário (Performance)"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Link href="/premium" className="w-full py-4 px-2 bg-brand-yellow text-brand-black font-bold rounded-xl hover:bg-brand-yellow-light transition-all transform hover:scale-[1.02] shadow-lg shadow-brand-yellow/20 flex items-center justify-center gap-2 text-sm sm:text-lg group">
                        <Sparkles className="w-5 h-5 group-hover:animate-spin-slow flex-shrink-0" />
                        Ver Planos e Preços
                    </Link>

                    <button
                        onClick={onClose}
                        className="mt-4 text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Talvez depois
                    </button>
                </div>
            </div>
        </div>
    );
}
