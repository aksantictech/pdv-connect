"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LoginFormProps = {
  nextPath?: string;
  initialMessage?: string;
};

export default function LoginForm({
  nextPath,
  initialMessage,
}: LoginFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(initialMessage ?? "");

  const safeNextPath =
    nextPath && nextPath.startsWith("/admin") ? nextPath : "/admin";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(
        "Adresse e-mail ou mot de passe incorrect. Vérifiez vos informations puis réessayez."
      );
      return;
    }

    router.replace(safeNextPath);
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#061d45] via-[#0a3d82] to-[#1680c4] px-5 py-16 lg:px-8">
        <div className="absolute -left-20 top-0 h-64 w-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-blue-950/40 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-cyan-100 backdrop-blur">
            <ShieldCheck size={17} />
            Espace sécurisé PDV Connect
          </div>

          <h1 className="mt-6 text-4xl font-black sm:text-5xl">
            Administration CEF Parole de Vie
          </h1>

          <p className="mx-auto mt-5 max-w-2xl leading-8 text-blue-100">
            Accédez à votre espace de gestion selon vos responsabilités :
            administration, pastorale, départements, intégration ou école.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-8 max-w-md px-5 pb-16 lg:px-0">
        <div className="rounded-3xl border border-blue-100 bg-white p-7 shadow-xl sm:p-9">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-[#0a3d82]">
            <LockKeyhole size={26} />
          </div>

          <h2 className="mt-6 text-2xl font-black text-[#092e63]">
            Connexion
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            Utilisez les identifiants créés par l’administration de l’Église.
          </p>

          {errorMessage && (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Adresse e-mail
              </span>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="exemple@email.com"
                  autoComplete="email"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-bold text-slate-700">
                Mot de passe
              </span>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Votre mot de passe"
                  autoComplete="current-password"
                  required
                  className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-12 text-sm outline-none transition focus:border-[#0a56a4] focus:ring-4 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                  aria-label="Afficher ou masquer le mot de passe"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a3d82] px-5 py-3.5 font-extrabold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#072d61] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Connexion en cours…
                </>
              ) : (
                <>
                  Se connecter
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-7 flex gap-2 rounded-2xl bg-blue-50 p-4 text-xs leading-5 text-slate-600">
            <ShieldCheck size={18} className="shrink-0 text-[#0a56a4]" />
            Les accès sont gérés selon les rôles et responsabilités définis
            dans PDV Connect.
          </div>
        </div>
      </section>
    </main>
  );
}