"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Lock, Mail, Loader2, Crown, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLoginOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      // Login via Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        throw new Error("Email atau kata sandi Owner salah!");
      }

      if (data.session) {
        // Simpan sesi validasi di browser
        localStorage.setItem("ys_user_role", "OWNER");
        localStorage.setItem(
          "ys_user_name",
          data.user.email || "Owner YS Tailor",
        );
        localStorage.setItem("ys_auth_token", data.session.access_token);

        router.push("/");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1E293B] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-amber-500/30">
        {/* HEADER FORM */}
        <div className="bg-slate-900 p-6 text-center border-b border-amber-500/20 relative">
          <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <h2 className="text-xl font-extrabold text-amber-400 tracking-wide">
            PORTAL LOGIN OWNER
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            YS Tailor Management System • Demak
          </p>
        </div>

        {/* FORM INPUT LOGIN */}
        <form onSubmit={handleLoginOwner} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Akses Owner
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="owner@ystailor.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kata Sandi / Password Rahasia
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memverifikasi Akses Owner...</span>
              </>
            ) : (
              <>
                <Shield className="w-4 h-4" />
                <span>Masuk Sebagai Owner</span>
              </>
            )}
          </button>

          <p className="text-[10px] text-center text-slate-400 pt-2">
            Akses portal ini terbatas dan terlindungi enkripsi data Supabase
            Auth.
          </p>
        </form>
      </div>
    </div>
  );
}
