"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/classicComponents/Input";
import { Button } from "@/components/classicComponents/Button";
import { signin, signup } from "@/lib/actions/signActions";
import { AlertTriangle } from "lucide-react";

export default function ConnectionsPageClient() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view") as "signin" | "signup" | null;
  const [view, setView] = useState<"signin" | "signup">(viewParam || "signin");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const error = searchParams.get("error");
    const nextView = searchParams.get("view") as "signin" | "signup" | null;

    if (nextView) {
      setView(nextView);
    }

    if (error && error !== "true") {
      const decodedError = decodeURIComponent(error);
      if (decodedError.startsWith("errors.")) {
        setErrorMessage(t(decodedError));
      } else {
        const errorKey = `errors.${decodedError}`;
        setErrorMessage(t(errorKey, { defaultValue: decodedError }));
      }
    } else {
      setErrorMessage(null);
    }
  }, [searchParams, t]);

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 text-[#f4f1ea] md:px-6 lg:px-8">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(129,182,76,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(255,255,255,0.06),_transparent_22%),linear-gradient(180deg,_#1f1d1b_0%,_#171615_100%)]" />

      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-5xl items-center justify-center">
        <div className="w-full rounded-[28px] border border-[#3d3a36] bg-[#262421]/95 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur md:p-8 lg:p-10">
          <div className="mb-6 flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#a6a193]">Chess Opening Book</p>
            <h1 className="text-2xl font-semibold text-[#f4f1ea] md:text-3xl">{t("Authentication.Title")}</h1>
            <p className="max-w-2xl text-sm text-[#b8b2a8]">
              Connectez-vous ou créez un compte avec une interface sombre et contrastée dans l’esprit Chess.com.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {errorMessage && (
              <div className="flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-red-100">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
                <p className="text-sm leading-relaxed">{errorMessage}</p>
              </div>
            )}

            <form action={signin} className={`flex flex-col gap-3 md:gap-4 ${view === "signin" ? "" : "hidden"}`}>
              <Input placeholder={t("Authentication.EmailPlaceholder")} type="email" name="email" required />
              <Input placeholder={t("Authentication.PasswordPlaceholder")} type="password" name="password" required />
              <Button content={t("Authentication.Login.LoginButton")} variant="primary" />
            </form>

            <form action={signup} className={`flex flex-col gap-3 md:gap-4 ${view === "signup" ? "" : "hidden"}`}>
              <Input placeholder={t("Authentication.NamePlaceholder")} type="text" name="name" required />

              <div className="rounded-xl border border-[#4a463f] bg-[#312d29] p-3 text-sm text-[#d6d1c7]">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#81b64c]" />
                  <p className="leading-relaxed">{t("Authentication.NameWarning")}</p>
                </div>
              </div>

              <Input placeholder={t("Authentication.EmailPlaceholder")} type="email" name="email" required />
              <Input placeholder={t("Authentication.PasswordPlaceholder")} type="password" name="password" required />
              <Input placeholder={t("Authentication.ConfirmPasswordPlaceholder")} type="password" name="confirmPassword" required />
              <Button content={t("Authentication.Register.RegisterButton")} variant="primary" />
            </form>

            <div className="grid gap-3 pt-2 md:grid-cols-2">
              <Button
                content={t("Authentication.LoginViewButton")}
                variant={view === "signin" ? "primary" : "secondary"}
                onClick={() => setView("signin")}
              />
              <Button
                content={t("Authentication.RegisterViewButton")}
                variant={view === "signup" ? "primary" : "secondary"}
                onClick={() => setView("signup")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}