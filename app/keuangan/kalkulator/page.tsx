"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  ShieldAlert,
  Layers,
  PieChart,
  Sparkles,
  Save,
  Trash2,
  Edit3,
  Loader2,
  BookmarkCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function KalkulatorKeuanganPage() {
  const router = useRouter();

  // State Tab Utama
  const [activeTab, setActiveTab] = useState<
    "HPP_KAIN" | "HARGA_JUAL" | "ALOKASI_KAS"
  >("HPP_KAIN");

  // State Data Master Resep HPP dari Supabase
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState<boolean>(true);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

  // State Input Form Kalkulator
  const [recipeName, setRecipeName] = useState("PDL Ripstop Standard");
  const [modelName, setModelName] = useState("PDL Setel");
  const [fabricBrand, setFabricBrand] = useState("Ripstop Drill");
  const [fabricPricePerMeter, setFabricPricePerMeter] = useState<number>(45000);
  const [fabricUsageMeters, setFabricUsageMeters] = useState<number>(3.0);
  const [accessoryCost, setAccessoryCost] = useState<number>(25000);
  const [tailorWage, setTailorWage] = useState<number>(105000);
  const [overheadCost, setOverheadCost] = useState<number>(15000);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(40);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Load Data Resep dari Supabase saat Komponen Dimuat
  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    setIsLoadingRecipes(true);
    try {
      const { data, error } = await (supabase.from("hpp_recipes") as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRecipes(data || []);
    } catch (err: any) {
      console.error("Gagal memuat resep HPP:", err.message);
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  // Kalkulasi HPP & Margin
  const totalFabricCost = fabricPricePerMeter * fabricUsageMeters;
  const totalHppPerUnit =
    totalFabricCost + accessoryCost + tailorWage + overheadCost;
  const recommendedPrice = totalHppPerUnit / (1 - targetMarginPercent / 100);
  const profitPerUnit = recommendedPrice - totalHppPerUnit;
  const minDpAmount = totalHppPerUnit;

  // Fungsi Pilih Resep dari Katalog
  const handleSelectRecipe = (item: any) => {
    setSelectedRecipeId(item.id);
    setRecipeName(item.recipe_name);
    setModelName(item.model_name);
    setFabricBrand(item.fabric_brand);
    setFabricPricePerMeter(Number(item.fabric_price_per_meter) || 0);
    setFabricUsageMeters(Number(item.fabric_usage_meters) || 0);
    setAccessoryCost(Number(item.accessory_cost) || 0);
    setTailorWage(Number(item.tailor_wage) || 0);
    setOverheadCost(Number(item.overhead_cost) || 0);
    setTargetMarginPercent(Number(item.target_margin_percent) || 40);
  };

  // Reset Form ke Mode Baru
  const handleResetForm = () => {
    setSelectedRecipeId(null);
    setRecipeName("Resep HPP Baru");
    setModelName("PDL Setel");
    setFabricBrand("Ripstop Drill");
    setFabricPricePerMeter(45000);
    setFabricUsageMeters(3.0);
    setAccessoryCost(25000);
    setTailorWage(105000);
    setOverheadCost(15000);
    setTargetMarginPercent(40);
  };

  // Fungsi Simpan / Update Resep Ke Supabase
  const handleSaveRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      recipe_name: recipeName,
      model_name: modelName,
      fabric_brand: fabricBrand,
      fabric_price_per_meter: fabricPricePerMeter,
      fabric_usage_meters: fabricUsageMeters,
      accessory_cost: accessoryCost,
      tailor_wage: tailorWage,
      overhead_cost: overheadCost,
      target_margin_percent: targetMarginPercent,
      updated_at: new Date().toISOString(),
    };

    try {
      if (selectedRecipeId) {
        // Update Resep Lama
        const { error } = await (supabase.from("hpp_recipes") as any)
          .update(payload)
          .eq("id", selectedRecipeId);
        if (error) throw error;
        alert(`Resep HPP "${recipeName}" berhasil diperbarui!`);
      } else {
        // Buat Resep Baru
        const { error } = await (supabase.from("hpp_recipes") as any).insert([
          payload,
        ]);
        if (error) throw error;
        alert(`Resep HPP "${recipeName}" berhasil disimpan ke Katalog Master!`);
      }
      fetchRecipes();
    } catch (err: any) {
      alert("Gagal menyimpan resep HPP: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi Hapus Resep
  const handleDeleteRecipe = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus resep "${name}" dari Katalog Master?`))
      return;

    try {
      const { error } = await (supabase.from("hpp_recipes") as any)
        .delete()
        .eq("id", id);
      if (error) throw error;

      if (selectedRecipeId === id) handleResetForm();
      fetchRecipes();
    } catch (err: any) {
      alert("Gagal menghapus resep: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 font-sans relative overflow-x-hidden">
      {/* BACKGROUND DEKORATIF */}
      <div className="fixed inset-0 pointer-events-none z-0 print:hidden overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => router.push("/keuangan")}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-200 transition shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Kembali ke Kasir Keuangan
          </button>

          <span className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-lg text-xs font-extrabold">
            <ShieldAlert className="w-4 h-4 text-amber-400" /> Rahasia Dapur •
            KHUSUS OWNER
          </span>
        </div>

        {/* HERO TITLE */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-6 rounded-2xl shadow-xl border border-amber-500/30 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-extrabold text-amber-400 flex items-center gap-2">
              <Calculator className="w-6 h-6" /> Center Kalkulator & Katalog
              Master HPP
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              Simulasi & penyimpanan resep modal produksi berdasarkan kombinasi
              kain dan model pakaian YS Tailor.
            </p>
          </div>
        </div>

        {/* TAB NAVIGASI KALKULATOR */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveTab("HPP_KAIN")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "HPP_KAIN"
                ? "bg-amber-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-4 h-4" /> 1. Simulator & Form Resep HPP
          </button>

          <button
            onClick={() => setActiveTab("HARGA_JUAL")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "HARGA_JUAL"
                ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4" /> 2. Analisis Margin & Harga Jual
          </button>

          <button
            onClick={() => setActiveTab("ALOKASI_KAS")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "ALOKASI_KAS"
                ? "bg-blue-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <PieChart className="w-4 h-4" /> 3. Pembagian Alokasi Kas Usaha
          </button>
        </div>

        {/* TAB 1: FORM INPUT & KATALOG RESEP HPP */}
        {activeTab === "HPP_KAIN" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* FORM INPUT VARIABEL (LEFT - 7 COLS) */}
            <form
              onSubmit={handleSaveRecipe}
              className="lg:col-span-7 bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4 text-xs"
            >
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <h3 className="font-extrabold text-amber-400 flex items-center gap-2 text-sm">
                  🛠️{" "}
                  {selectedRecipeId
                    ? "Edit Resep HPP Tersimpan"
                    : "Buat Preset Resep HPP Baru"}
                </h3>
                {selectedRecipeId && (
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="text-[11px] bg-slate-700 hover:bg-slate-600 text-slate-200 px-2.5 py-1 rounded-lg font-bold"
                  >
                    + Buat Baru
                  </button>
                )}
              </div>

              {/* INFORMASI LABEL RESEP */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Nama Preset / Resep HPP
                  </label>
                  <input
                    type="text"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="Misal: PDL Ripstop Standard"
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-semibold text-amber-400 outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Model Pakaian
                  </label>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="Misal: PDL Setel / Kemeja"
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-semibold text-white outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* KOMPONEN KAIN */}
              <div className="space-y-2 bg-amber-500/10 p-3 rounded-xl border border-amber-500/30">
                <span className="font-extrabold text-amber-400 block">
                  🧵 1. Bahan Kain Utama
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-slate-300 block mb-0.5">
                      Merek / Jenis Kain
                    </label>
                    <input
                      type="text"
                      value={fabricBrand}
                      onChange={(e) => setFabricBrand(e.target.value)}
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-semibold text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-0.5">
                      Harga Kain / Meter (Rp)
                    </label>
                    <input
                      type="number"
                      value={fabricPricePerMeter}
                      onChange={(e) =>
                        setFabricPricePerMeter(Number(e.target.value))
                      }
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-bold text-amber-400 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-0.5">
                      Pemakaian (Meter)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fabricUsageMeters}
                      onChange={(e) =>
                        setFabricUsageMeters(Number(e.target.value))
                      }
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-bold text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* KOMPONEN AKSESORI & LABOR */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1">
                  <label className="font-bold text-slate-300 block">
                    📦 2. Bahan Pendukung / Aksesori (Rp)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1">
                    Kancing, zipper, kain keras, furing, benang
                  </p>
                  <input
                    type="number"
                    value={accessoryCost}
                    onChange={(e) => setAccessoryCost(Number(e.target.value))}
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-bold text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1">
                  <label className="font-bold text-slate-300 block">
                    🪡 3. Upah Tenaga Kerja (Rp)
                  </label>
                  <p className="text-[10px] text-slate-400 mb-1">
                    Total upah potong + penjahit
                  </p>
                  <input
                    type="number"
                    value={tailorWage}
                    onChange={(e) => setTailorWage(Number(e.target.value))}
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-bold text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* OVERHEAD */}
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-700 space-y-1">
                <label className="font-bold text-slate-300 block">
                  ⚡ 4. Biaya Overhead & Operasional / BOH (Rp)
                </label>
                <p className="text-[10px] text-slate-400 mb-1">
                  Penyusutan mesin, listrik, transportasi, packaging
                </p>
                <input
                  type="number"
                  value={overheadCost}
                  onChange={(e) => setOverheadCost(Number(e.target.value))}
                  className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-bold text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              {/* TOMBOL SIMPAN RESEP */}
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {selectedRecipeId
                  ? "Update Perubahan Resep HPP Ini"
                  : "Simpan ke Katalog Master HPP"}
              </button>
            </form>

            {/* RINGKASAN OUTPUT & KATALOG RESEP (RIGHT - 5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              {/* RINGKASAN ANGKA HPP */}
              <div className="bg-slate-900/90 backdrop-blur-md text-white p-5 rounded-2xl border border-amber-500/40 shadow-xl space-y-3">
                <span className="text-xs text-amber-400 font-bold uppercase tracking-wider block">
                  📊 Ringkasan Kalkulasi HPP
                </span>

                <div className="border-b border-slate-700 pb-3">
                  <span className="text-[10px] text-slate-400 block">
                    TOTAL HPP PER SETEL ({fabricBrand}):
                  </span>
                  <span className="text-3xl font-extrabold text-amber-400 font-mono">
                    Rp {totalHppPerUnit.toLocaleString("id-ID")}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>
                      • Kain ({fabricUsageMeters}m @ Rp{" "}
                      {fabricPricePerMeter.toLocaleString()}):
                    </span>
                    <span className="font-bold text-white font-mono">
                      Rp {totalFabricCost.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• Aksesori & Bahan Pendukung:</span>
                    <span className="font-bold text-white font-mono">
                      Rp {accessoryCost.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• Upah Jahit & Potong:</span>
                    <span className="font-bold text-white font-mono">
                      Rp {tailorWage.toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>• BOH & Operasional:</span>
                    <span className="font-bold text-white font-mono">
                      Rp {overheadCost.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              {/* KATALOG MASTER RESEP TERPESAN */}
              <div className="bg-slate-800/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-xl space-y-3">
                <h4 className="font-extrabold text-slate-200 text-xs flex items-center gap-1.5 border-b border-slate-700 pb-2">
                  <BookmarkCheck className="w-4 h-4 text-emerald-400" /> Katalog
                  Master Resep HPP ({recipes.length})
                </h4>

                {isLoadingRecipes ? (
                  <div className="py-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-500" />{" "}
                    Memuat katalog resep...
                  </div>
                ) : recipes.length === 0 ? (
                  <p className="text-[11px] text-slate-500 italic py-4 text-center">
                    Belum ada preset resep HPP yang disimpan.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin">
                    {recipes.map((r) => {
                      const hpp =
                        Number(r.fabric_price_per_meter) *
                          Number(r.fabric_usage_meters) +
                        Number(r.accessory_cost) +
                        Number(r.tailor_wage) +
                        Number(r.overhead_cost);

                      return (
                        <div
                          key={r.id}
                          className={`p-2.5 rounded-xl border transition flex justify-between items-center ${
                            selectedRecipeId === r.id
                              ? "bg-amber-500/10 border-amber-500/50"
                              : "bg-slate-900/60 border-slate-700/80 hover:border-slate-500"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <span className="font-bold text-white text-xs block">
                              {r.recipe_name}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              {r.model_name} • {r.fabric_brand}
                            </span>
                            <span className="text-[11px] font-mono font-extrabold text-amber-400 block">
                              HPP: Rp {hpp.toLocaleString("id-ID")}
                            </span>
                          </div>

                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSelectRecipe(r)}
                              title="Pakai / Edit Resep Ini"
                              className="p-1.5 bg-slate-700 hover:bg-slate-600 text-amber-400 rounded-lg transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                handleDeleteRecipe(r.id, r.recipe_name)
                              }
                              title="Hapus Resep"
                              className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MARGIN & HARGA JUAL */}
        {activeTab === "HARGA_JUAL" && (
          <div className="bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl space-y-6">
            <div className="max-w-xl space-y-3">
              <h3 className="font-extrabold text-white text-base">
                🎯 Simulator Margin & Rekomendasi Harga Jual
              </h3>
              <p className="text-xs text-slate-300">
                Tentukan persentase margin keuntungan bersih yang kamu targetkan
                dari modal HPP sebesar{" "}
                <strong className="text-amber-400">
                  Rp {totalHppPerUnit.toLocaleString("id-ID")}
                </strong>
                .
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 block">
                  Target Profit Margin (%):
                </label>
                <div className="flex gap-2">
                  {[30, 35, 40, 45, 50].map((m) => (
                    <button
                      key={m}
                      onClick={() => setTargetMarginPercent(m)}
                      className={`flex-1 py-2 rounded-xl text-xs font-extrabold border transition ${
                        targetMarginPercent === m
                          ? "bg-amber-600 text-white border-amber-500 shadow-md"
                          : "bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500"
                      }`}
                    >
                      {m}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-700">
                <span className="text-[11px] text-slate-400 font-bold block uppercase">
                  Modal HPP Dasar
                </span>
                <span className="text-xl font-bold text-white mt-1 block font-mono">
                  Rp {totalHppPerUnit.toLocaleString("id-ID")}
                </span>
              </div>

              <div className="p-4 bg-emerald-950/60 rounded-2xl border border-emerald-500/40">
                <span className="text-[11px] text-emerald-400 font-bold block uppercase">
                  Proyeksi Profit Bersih / Pcs
                </span>
                <span className="text-xl font-extrabold text-emerald-300 mt-1 block font-mono">
                  Rp {Math.round(profitPerUnit).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/40">
                <span className="text-[11px] text-amber-400 font-bold block uppercase">
                  Rekomendasi Harga Jual Minimum
                </span>
                <span className="text-xl font-extrabold text-amber-400 mt-1 block font-mono">
                  Rp {Math.round(recommendedPrice).toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ALOKASI KAS */}
        {activeTab === "ALOKASI_KAS" && (
          <div className="bg-slate-800/90 backdrop-blur-md p-6 rounded-2xl border border-slate-700 shadow-xl space-y-4">
            <h3 className="font-extrabold text-white text-base">
              📊 Formula Ideal Otomatis Alokasi Pembayaran Masuk
            </h3>
            <p className="text-xs text-slate-300">
              Setiap kali ada pembayaran DP / Pelunasan masuk dari pelanggan,
              pisahkan uang tersebut ke pos-pos berikut:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs pt-2">
              <div className="p-4 bg-amber-500/10 rounded-2xl border border-amber-500/30 space-y-1">
                <span className="font-bold text-amber-400 block text-sm">
                  1. Pos Modal Produksi (55%)
                </span>
                <p className="text-[11px] text-slate-300">
                  Khusus untuk belanja kain, beli kancing/benang, dan upah
                  penjahit.
                </p>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-2xl border border-blue-500/30 space-y-1">
                <span className="font-bold text-blue-400 block text-sm">
                  2. Pos Operasional Toko (15%)
                </span>
                <p className="text-[11px] text-slate-300">
                  Untuk membayar listrik, paket data, transportasi, dan sampel
                  kain.
                </p>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-2xl border border-purple-500/30 space-y-1">
                <span className="font-bold text-purple-400 block text-sm">
                  3. Pos Reinvestasi (15%)
                </span>
                <p className="text-[11px] text-slate-300">
                  Tabungan cadangan untuk beli mesin baru atau pengembangan
                  workshop.
                </p>
              </div>

              <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 space-y-1">
                <span className="font-bold text-emerald-400 block text-sm">
                  4. Laba Bersih Owner (15%)
                </span>
                <p className="text-[11px] text-slate-300">
                  Hak keuntungan murni bisnis yang siap dibagikan secara
                  berkala.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
