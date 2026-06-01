"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth/auth.client";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        setError(response.error.message || "Erreur de connexion");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("Une erreur s'est produite");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-[#262421] border border-[#3d3a36] rounded-lg p-8 space-y-6">
          <div className="text-center">
            <div className="text-4xl mb-2">♔</div>
            <h1 className="text-2xl font-bold text-[#f4f1ea]">Connexion</h1>
            <p className="text-[#b8b2a8] text-sm mt-1">Chess Opening Book</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#f4f1ea] text-sm font-semibold mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#3d3a36] rounded-lg text-[#f4f1ea] placeholder-[#b8b2a8] focus:outline-none focus:border-[#81b64c]"
                placeholder="votre@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-[#f4f1ea] text-sm font-semibold mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#3d3a36] rounded-lg text-[#f4f1ea] placeholder-[#b8b2a8] focus:outline-none focus:border-[#81b64c]"
                placeholder="••••••••"
                required
              />
            </div>

            {error && <div className="p-3 bg-red-600/20 border border-red-600/30 rounded text-red-400 text-sm">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-[#81b64c] hover:bg-[#95c95c] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <div className="text-center text-[#b8b2a8] text-sm">
            Pas encore de compte ?{" "}
            <Link href="/auth/signup" className="text-[#81b64c] hover:underline">
              Créer un compte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
