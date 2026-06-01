import Link from "next/link";
import { ArrowRight, Zap, BookOpen, Target, FolderOpen, Brain, PenTool } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-[#2d2926] bg-[#1a1a1a]/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">♔</span>
            <span className="font-bold text-lg text-[#81b64c]">Opening Book</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/auth/signin" className="px-4 py-2 text-sm text-[#b8b2a8] hover:text-white rounded-lg transition-colors">
              Se connecter
            </Link>
            <Link href="/auth/signup" className="px-4 py-2 text-sm bg-[#81b64c] hover:bg-[#6fa33e] text-[#111] rounded-lg font-semibold transition-colors">
              S&apos;inscrire
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#81b64c]/10 border border-[#81b64c]/20 text-[#81b64c] text-sm font-medium mb-8">
          <Zap className="w-3.5 h-3.5" />
          Propulsé par Stockfish
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight mb-6">
          Maîtrisez vos
          <span className="text-[#81b64c]"> ouvertures</span>
          <br />d&apos;échecs
        </h1>

        <p className="text-base sm:text-lg text-[#8a8580] max-w-2xl mx-auto mb-10 leading-relaxed">
          Organisez, analysez et pratiquez vos répertoires d&apos;ouvertures avec un outil professionnel inspiré de Chess.com.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/auth/signup" className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#81b64c] hover:bg-[#6fa33e] text-[#111] font-semibold rounded-lg transition-all">
            Commencer gratuitement
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/auth/signin" className="inline-flex items-center justify-center px-6 py-3 bg-[#262421] hover:bg-[#312d29] text-[#f4f1ea] font-medium rounded-lg border border-[#2d2926] transition-colors">
            Se connecter
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f4f1ea] mb-3">Tout pour vos ouvertures</h2>
          <p className="text-[#8a8580] max-w-lg mx-auto">Un outil complet pour organiser, analyser et mémoriser vos lignes favorites.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-xl bg-[#1a1a1a] border border-[#2d2926] hover:border-[#81b64c]/50 transition-all duration-200">
            <FolderOpen className="w-6 h-6 text-[#81b64c] mb-4" />
            <h3 className="text-lg font-semibold text-[#f4f1ea] mb-2">Organiser</h3>
            <p className="text-sm text-[#8a8580] leading-relaxed">Dossiers, arbre d&apos;analyse interactif et notation algébrique pour structurer vos répertoires.</p>
          </div>

          <div className="p-6 rounded-xl bg-[#1a1a1a] border border-[#2d2926] hover:border-[#81b64c]/50 transition-all duration-200">
            <Brain className="w-6 h-6 text-[#81b64c] mb-4" />
            <h3 className="text-lg font-semibold text-[#f4f1ea] mb-2">Analyser</h3>
            <p className="text-sm text-[#8a8580] leading-relaxed">Stockfish intégré, flèches et carrés colorés, évaluation en temps réel de chaque position.</p>
          </div>

          <div className="p-6 rounded-xl bg-[#1a1a1a] border border-[#2d2926] hover:border-[#81b64c]/50 transition-all duration-200">
            <PenTool className="w-6 h-6 text-[#81b64c] mb-4" />
            <h3 className="text-lg font-semibold text-[#f4f1ea] mb-2">Pratiquer</h3>
            <p className="text-sm text-[#8a8580] leading-relaxed">Mode Puzzle et mode Drill pour tester et mémoriser vos lignes efficacement.</p>
          </div>
        </div>
      </section>

      {/* Why Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl bg-[#1a1a1a] border border-[#2d2926] p-6 sm:p-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#f4f1ea] mb-8 text-center">Pourquoi Opening Book ?</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex gap-3 items-start">
              <Zap className="w-5 h-5 text-[#81b64c] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#f4f1ea] mb-0.5">Rapide &amp; Réactif</h4>
                <p className="text-sm text-[#8a8580]">Interface fluide, optimisée pour la performance.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <BookOpen className="w-5 h-5 text-[#81b64c] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#f4f1ea] mb-0.5">Complète &amp; Flexible</h4>
                <p className="text-sm text-[#8a8580]">Adaptée à tous les niveaux, du débutant au GM.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <Target className="w-5 h-5 text-[#81b64c] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#f4f1ea] mb-0.5">Inspirée de Chess.com</h4>
                <p className="text-sm text-[#8a8580]">Design familier, professionnel et intuitif.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <Brain className="w-5 h-5 text-[#81b64c] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#f4f1ea] mb-0.5">Stockfish Intégré</h4>
                <p className="text-sm text-[#8a8580]">Le meilleur moteur d&apos;analyse directement intégré.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <BookOpen className="w-5 h-5 text-[#81b64c] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#f4f1ea] mb-0.5">Vos Données Privées</h4>
                <p className="text-sm text-[#8a8580]">Vos ouvertures restent sécurisées et privées.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <Target className="w-5 h-5 text-[#81b64c] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[#f4f1ea] mb-0.5">Synchronisé</h4>
                <p className="text-sm text-[#8a8580]">Accédez à vos carnets depuis n&apos;importe où.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-[#f4f1ea] mb-4">Prêt à progresser ?</h2>
        <p className="text-[#8a8580] mb-8 max-w-lg mx-auto">Créez votre premier carnet d&apos;ouvertures gratuitement en quelques secondes.</p>
        <Link href="/auth/signup" className="group inline-flex items-center gap-2 px-8 py-3.5 bg-[#81b64c] hover:bg-[#6fa33e] text-[#111] font-semibold text-lg rounded-lg transition-all">
          Créer mon Carnet
          <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#2d2926] bg-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl">♔</span>
              <span className="font-semibold text-[#81b64c]">Opening Book</span>
            </div>
            <p className="text-sm text-[#6d6a66]">© 2026 Chess Opening Book · Inspiré de Chess.com · Alimenté par Stockfish</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
