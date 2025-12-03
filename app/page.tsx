"use client";

import Image from "next/image";
import { ArrowRight, ChefHat, Clock, Sparkles, CheckCircle2, Star, TrendingUp, Camera, User } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const supabase = createClient();

  // Redirect if logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/generate");
      }
    };
    checkUser();
  }, [router, supabase]);
  // Carousel Logic
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const carouselImages = [

    "/hero/salad.jpg",
    "/hero/acai.jpg",
    "/hero/pancakes.jpg"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % carouselImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    checkUser();
  }, []);

  // Scroll Logic for Transparent Navbar
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-brand-black font-sans selection:bg-brand-yellow selection:text-brand-black overflow-x-hidden">

      {/* Navbar */}
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${isScrolled ? "bg-white/10 backdrop-blur-md border-b border-transparent py-0.1" : "bg-transparent border-b border-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
                <ChefHat className="w-5 h-5 text-brand-black" />
              </div>
              <span className={`font-bold text-xl tracking-tight transition-colors ${isScrolled ? "text-brand-black" : "text-white"}`}>FitChef IA</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#benefits" className={`text-sm font-medium transition-colors ${isScrolled ? "text-brand-black hover:text-brand-yellow" : "text-white/90 hover:text-white"}`}>Benefícios</a>
              <a href="#social-proof" className={`text-sm font-medium transition-colors ${isScrolled ? "text-brand-black hover:text-brand-yellow" : "text-white/90 hover:text-white"}`}>Resultados</a>
            </div>
            {user ? (
              <Link href="/profile" className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${isScrolled ? "bg-brand-black text-white hover:bg-gray-800" : "bg-white text-brand-black hover:bg-gray-100"}`}>
                <User className="w-4 h-4" />
                Perfil
              </Link>
            ) : (
              <Link href="/login" className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${isScrolled ? "bg-brand-black text-white hover:bg-gray-800" : "bg-white text-brand-black hover:bg-gray-100"}`}>
                Entrar
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 1. Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {carouselImages.map((src, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-[2000ms] ease-in-out ${index === currentImageIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
            >
              <Image
                src={src}
                alt="Delicious Food"
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
            </div>
          ))}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wide uppercase mb-8 backdrop-blur-md">
            <Sparkles className="w-3 h-3 text-brand-yellow" />
            <span>Apresentando a Primeira IA de Culinária Fitness do Brasil</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight mb-6 drop-shadow-lg">
            Comida Fit Sem Graça, <br />
            <span className="text-brand-yellow">Nunca Mais.</span>
          </h1>

          <p className="text-lg sm:text-2xl text-gray-200 leading-relaxed max-w-3xl mx-auto mb-10 font-light">
            Crie pratos e receitas saudáveis, deliciosas e personalizadas em segundos.
            A inteligência artificial que transforma o que você tem na geladeira em resultados para o seu corpo.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link
              href="/login?message=Crie sua conta gratuita agora"
              className="w-full sm:w-auto px-10 py-5 bg-brand-yellow text-brand-black font-bold text-lg rounded-2xl hover:bg-brand-yellow-light transition-all transform hover:scale-105 shadow-xl shadow-brand-yellow/20 flex items-center justify-center gap-3"
            >
              Gerar Minha Primeira Receita Grátis
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-sm text-gray-300 font-medium">
              Sem precisar de criatividade. Sem perder tempo. Apenas resultados.
            </p>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-20 pointer-events-none"></div>
      </section>

      {/* 2. Connection Section (Pain & Promise) */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-12 text-brand-black">
            Se você se identifica com isso, <br />
            <span className="text-brand-yellow-dark">o FitChef IA é para você.</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-12 text-left">
            <div className="space-y-6 p-8 bg-red-50 rounded-3xl border border-red-100">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-red-900">A Rotina te Engole</h3>
              <p className="text-gray-700 leading-relaxed">
                Você quer comer de forma saudável, mas a rotina te engole. Passa horas pensando no que cozinhar, acaba comendo a mesma coisa sem graça todos os dias e se frustra por não atingir seus objetivos. A dieta vira um fardo, e a criatividade na cozinha simplesmente desaparece.
              </p>
            </div>

            <div className="space-y-6 p-8 bg-green-50 rounded-3xl border border-green-100">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-green-900">A Solução FitChef</h3>
              <p className="text-gray-700 leading-relaxed">
                Imagine ter um Chef e Nutricionista particular no seu bolso. Uma ferramenta que não apenas cria receitas com os ingredientes que você já tem, mas que também gera imagens incríveis para te inspirar, calcula os macros e garante que cada prato seja delicioso. Essa é a revolução que o FitChef IA traz para a sua vida.
              </p>
            </div>
          </div>
        </div>
      </section >

      {/* 3. Benefits Section */}
      < section id="benefits" className="py-24 bg-gray-50" >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-brand-black mb-6">
              Sua Rotina Fitness, <br />
              <span className="text-brand-yellow-dark">Elevada a Outro Nível.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Benefit 1 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="w-14 h-14 bg-brand-yellow/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <ChefHat className="w-7 h-7 text-brand-black" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chef Pessoal com IA</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Receitas 100% adaptadas ao seu gosto, restrições (glúten, lactose) e objetivos (ganho de massa, perda de peso). Diga adeus à comida sem sabor.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Economia de Tempo Real</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pare de pensar, comece a fazer. Receba sugestões prontas em 5 segundos e use seu tempo para o que realmente importa: você.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Camera className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Inspiração Visual Infinita</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Não sabe como o prato vai ficar? Nossa IA gera imagens realistas para cada receita, despertando seu apetite e sua criatividade.
              </p>
            </div>

            {/* Benefit 4 */}
            <div className="bg-white p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3">Macros no Piloto Automático</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Atinga suas metas sem esforço. O FitChef IA calcula tudo para você, garantindo que sua alimentação esteja alinhada aos seus resultados.
              </p>
            </div>
          </div>
        </div>
      </section >

      {/* 4. Social Proof & Authority */}
      < section id="social-proof" className="py-24 bg-brand-black text-white relative overflow-hidden" >
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Junte-se a Milhares de Pessoas que <br />
              <span className="text-brand-yellow">Transformaram sua Alimentação</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center mb-16">
            <div className="p-6">
              <div className="text-4xl sm:text-5xl font-extrabold text-brand-yellow mb-2">+50.000</div>
              <div className="text-gray-400 font-medium">Receitas Geradas</div>
            </div>
            <div className="p-6 border-l border-r border-white/10">
              <div className="text-4xl sm:text-5xl font-extrabold text-brand-yellow mb-2">98%</div>
              <div className="text-gray-400 font-medium">De Satisfação</div>
            </div>
            <div className="p-6">
              <div className="text-4xl sm:text-5xl font-extrabold text-brand-yellow mb-2">Top 1</div>
              <div className="text-gray-400 font-medium">IA de Culinária Fitness</div>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
                ))}
              </div>
              <p className="text-lg text-gray-300 italic mb-6">
                "O FitChef IA mudou o jogo para mim. Agora eu consigo criar conteúdo visualmente incrível para minhas redes sociais em minutos!"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src="/depoimento/depo3.webp"
                    alt="Ana P."
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold">Paula R.</div>
                  <div className="text-sm text-gray-400">Usuária FitChef</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
                ))}
              </div>
              <p className="text-lg text-gray-300 italic mb-6">
                "O FitChef IA simplificou minha rotina saudável. Agora eu só escolho meus objetivos e ele cria receitas deliciosas, práticas e dentro da minha dieta. Nunca foi tão fácil manter o foco e ainda comer bem!"
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src="/depoimento/depo2.webp"
                    alt="Ana P."
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold">Ana P.</div>
                  <div className="text-sm text-gray-400">Usuária FitChef</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm p-8 rounded-2xl border border-white/10">
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-brand-yellow fill-brand-yellow" />
                ))}
              </div>
              <p className="text-lg text-gray-300 italic mb-6">
                "Finalmente uma forma de seguir a dieta sem sofrer. As receitas são deliciosas e fáceis! Recomendo demais."
              </p>
              <div className="flex items-center gap-4">
                <div className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src="/depoimento/depo1.webp"
                    alt="Marcos V."
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="font-bold">Talita V.</div>
                  <div className="text-sm text-gray-400">Usuária FitChef</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* 5. Final CTA */}
      < section className="py-24 bg-white text-center" >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-brand-black mb-6 tracking-tight">
            Pronto para Desbloquear seu <br />
            <span className="text-brand-yellow-dark">Potencial na Cozinha Fitness?</span>
          </h2>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Sua transformação começa com um clique. Gere sua primeira receita, visualize seu prato e descubra por que fazer dieta nunca foi tão fácil e saboroso.
          </p>

          <div className="flex flex-col items-center gap-4">
            <Link
              href="/generate"
              className="w-full sm:w-auto px-12 py-6 bg-brand-black text-white font-bold text-xl rounded-2xl hover:bg-gray-800 transition-all transform hover:scale-105 shadow-2xl shadow-black/20 flex items-center justify-center gap-3"
            >
              Quero Começar Minha Transformação Agora (Grátis)
              <ArrowRight className="w-6 h-6" />
            </Link>
            <p className="text-sm text-gray-500 font-medium mt-2">
              Teste gratuito. Sem compromisso. Cancele quando quiser.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-yellow rounded-lg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-brand-black" />
            </div>
            <span className="font-bold text-lg">FitChef IA</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2025 FitChef IA. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
