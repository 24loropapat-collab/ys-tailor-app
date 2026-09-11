"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CreditCard,
  Printer,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Calculator,
  Wallet,
  Building2,
  X,
  PlusCircle,
  Receipt,
  Trash2,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Coins,
  ArrowRightLeft,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function KeuanganPage() {
  const router = useRouter();

  // State Utama Tab Navigasi
  const [activeMainTab, setActiveMainTab] = useState<
    "TRANSAKSI" | "DEVIDEN_OWNER" | "PENGELUARAN"
  >("TRANSAKSI");

  // State Data Order & Instansi
  const [folders, setFolders] = useState<any[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("ALL");
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Kasir DP / Pelunasan
  const [paymentItem, setPaymentItem] = useState<any | null>(null);
  const [inputDp, setInputDp] = useState<string>("0");
  const [inputStatus, setInputStatus] = useState<
    "BELUM_BAYAR" | "DP" | "LUNAS"
  >("BELUM_BAYAR");

  // State Modal Cetak Nota Belanja
  const [printItem, setPrintItem] = useState<any | null>(null);

  // State Pengeluaran Operasional / SPJ Toko
  const [expenses, setExpenses] = useState<any[]>([]);
  const [expenseTitle, setExpenseTitle] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("OPERASIONAL");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseNotes, setExpenseNotes] = useState("");
  const [isSubmittingExpense, setIsSubmittingExpense] = useState(false);

  // State Penarikan Deviden Owner (Prive)
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawNotes, setWithdrawNotes] = useState("");
  const [isSubmittingWithdraw, setIsSubmittingWithdraw] = useState(false);

  useEffect(() => {
    fetchFinancialData();
    fetchExpensesData();
    fetchWithdrawalsData();
  }, []);

  // Fetch Data Order & Folder
  const fetchFinancialData = async () => {
    setIsLoading(true);
    try {
      const { data: folderData } = await (supabase.from("folders") as any)
        .select("*")
        .order("created_at", { ascending: false });
      setFolders(folderData || []);

      const { data: orderData } = await (supabase.from("order_items") as any)
        .select(
          "*, members(member_name, rank_title, badge_name, folder_id, folders(folder_name))",
        )
        .order("created_at", { ascending: false });

      setOrders(orderData || []);
    } catch (err: any) {
      console.error("Error fetching order data:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Data Pengeluaran Operasional
  const fetchExpensesData = async () => {
    try {
      const { data, error } = await (supabase.from("store_expenses") as any)
        .select("*")
        .order("expense_date", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      console.error("Gagal memuat data pengeluaran:", err.message);
    }
  };

  // Fetch Data Penarikan Deviden Owner
  const fetchWithdrawalsData = async () => {
    try {
      const { data, error } = await (supabase.from("owner_withdrawals") as any)
        .select("*")
        .order("withdrawal_date", { ascending: false });

      if (error) throw error;
      setWithdrawals(data || []);
    } catch (err: any) {
      console.error("Gagal memuat log deviden owner:", err.message);
    }
  };

  // Fungsi Buka Modal Kasir Payment / DP
  const handleOpenPaymentModal = (item: any) => {
    setPaymentItem(item);
    setInputDp(String(item.down_payment || 0));
    setInputStatus(item.payment_status || "BELUM_BAYAR");
  };

  // Simpan Transaksi Pembayaran / DP
  const handleSavePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentItem) return;

    const numericDp = Number(inputDp) || 0;
    const totalPrice = Number(paymentItem.price) || 0;

    let finalStatus = inputStatus;
    if (numericDp >= totalPrice && totalPrice > 0) {
      finalStatus = "LUNAS";
    } else if (numericDp > 0 && numericDp < totalPrice) {
      finalStatus = "DP";
    }

    try {
      const { error } = await (supabase.from("order_items") as any)
        .update({
          payment_status: finalStatus,
          down_payment: numericDp,
          payment_date: new Date().toISOString(),
        })
        .eq("id", paymentItem.id);

      if (error) throw error;

      alert(
        `Transaksi pembayaran ${
          paymentItem.members?.member_name || "Anggota"
        } berhasil diperbarui!`,
      );
      setPaymentItem(null);
      fetchFinancialData();
    } catch (err: any) {
      alert("Gagal memperbarui pembayaran: " + err.message);
    }
  };

  // Tambah Pengeluaran Toko Baru
  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    setIsSubmittingExpense(true);
    try {
      const { error } = await (supabase.from("store_expenses") as any).insert([
        {
          title: expenseTitle,
          category: expenseCategory,
          amount: Number(expenseAmount) || 0,
          notes: expenseNotes,
          expense_date: new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

      setExpenseTitle("");
      setExpenseAmount("");
      setExpenseNotes("");
      fetchExpensesData();
    } catch (err: any) {
      alert("Gagal menyimpan pengeluaran: " + err.message);
    } finally {
      setIsSubmittingExpense(false);
    }
  };

  // Simpan Penarikan Deviden Owner
  const handleAddWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(withdrawAmount) || 0;
    if (amountNum <= 0) return;

    if (amountNum > sisaDevidenBolehDitarik) {
      alert(
        `Penarikan gagal! Uang deviden yang tersedia hanya Rp ${sisaDevidenBolehDitarik.toLocaleString(
          "id-ID",
        )}.`,
      );
      return;
    }

    setIsSubmittingWithdraw(true);
    try {
      const { error } = await (
        supabase.from("owner_withdrawals") as any
      ).insert([
        {
          amount: amountNum,
          notes: withdrawNotes || "Penarikan Deviden Owner",
          withdrawal_date: new Date().toISOString().split("T")[0],
        },
      ]);

      if (error) throw error;

      setWithdrawAmount("");
      setWithdrawNotes("");
      fetchWithdrawalsData();
      alert("Penarikan deviden berhasil dicatat!");
    } catch (err: any) {
      alert("Gagal mencatat penarikan deviden: " + err.message);
    } finally {
      setIsSubmittingWithdraw(false);
    }
  };

  // Hapus Pengeluaran Toko
  const handleDeleteExpense = async (id: string, title: string) => {
    if (!confirm(`Yakin ingin menghapus pengeluaran "${title}"?`)) return;

    try {
      const { error } = await (supabase.from("store_expenses") as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchExpensesData();
    } catch (err: any) {
      alert("Gagal menghapus pengeluaran: " + err.message);
    }
  };

  // Hapus Penarikan Deviden Owner
  const handleDeleteWithdrawal = async (id: string) => {
    if (!confirm("Yakin ingin menghapus log penarikan deviden ini?")) return;

    try {
      const { error } = await (supabase.from("owner_withdrawals") as any)
        .delete()
        .eq("id", id);

      if (error) throw error;
      fetchWithdrawalsData();
    } catch (err: any) {
      alert("Gagal menghapus log penarikan: " + err.message);
    }
  };

  // Filter Data Order Berdasarkan Folder & Pencarian Nama
  const filteredOrders = orders.filter((item) => {
    const matchFolder =
      selectedFolderId === "ALL" ||
      item.members?.folder_id === selectedFolderId;
    const matchSearch =
      item.members?.member_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      item.item_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.members?.folders?.folder_name
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchFolder && matchSearch;
  });

  // RINGKASAN KALKULASI FINANSIAL & PEMBAGIAN WADAH KAS
  const totalOmzet = filteredOrders.reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0,
  );
  const totalDpMasuk = filteredOrders.reduce(
    (sum, item) => sum + (Number(item.down_payment) || 0),
    0,
  );
  const totalPengeluaran = expenses.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  // Hitung Total HPP Modal & Total Laba Bersih yang Terkumpul dari Order Terbayar
  let totalHppModalNeed = 0;
  let totalLabaBersihGenerated = 0;

  filteredOrders.forEach((item) => {
    const dp = Number(item.down_payment) || 0;
    const hpp = Number(item.hpp_amount) || 0;

    if (dp > 0) {
      totalHppModalNeed += hpp;
      const profitPerItem = (Number(item.price) || 0) - hpp;
      if (profitPerItem > 0) {
        // Porsi profit proporsional dari DP yang sudah dibayar
        const paidRatio = Math.min(1, dp / (Number(item.price) || 1));
        totalLabaBersihGenerated += profitPerItem * paidRatio;
      }
    }
  });

  // Wadah Otomatis: 60% Hak Owner, 40% Kas Toko
  const totalPorsiDevidenOwner = totalLabaBersihGenerated * 0.6;
  const totalPorsiKasToko = totalLabaBersihGenerated * 0.4;

  // Akumulasi Penarikan Uang Oleh Owner (Prive)
  const totalDevidenDitarik = withdrawals.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );
  const sisaDevidenBolehDitarik = Math.max(
    0,
    totalPorsiDevidenOwner - totalDevidenDitarik,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-amber-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold">
          Memuat Data Keuangan & SPJ YS Tailor...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 font-sans relative overflow-x-hidden print:p-0 print:bg-white print:text-slate-900">
      {/* BACKGROUND DEKORATIF */}
      <div className="fixed inset-0 pointer-events-none z-0 print:hidden overflow-hidden bg-slate-950">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      {/* KONTEN UTAMA */}
      <div className="max-w-7xl mx-auto space-y-6 relative z-10 print:hidden">
        {/* TOP BAR / NAVIGASI HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-slate-200 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div>
              <h1 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" /> Dashboard Kasir
                & Pemisahan Kas Wadah Owner
              </h1>
              <p className="text-[11px] text-slate-400">
                Pemisahan otomatis kas modal produksi, kas toko, dan wadah
                deviden siap tarik untuk owner.
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push("/keuangan/kalkulator")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition self-stretch sm:self-auto justify-center"
          >
            <Calculator className="w-4 h-4" /> Center Kalkulator HPP (Owner)
          </button>
        </div>

        {/* METRIK 3 WADAH KAS UTAMA */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-amber-500/30 shadow-xl relative overflow-hidden">
            <span className="text-[10px] text-amber-400 font-extrabold block uppercase tracking-wider flex items-center gap-1">
              <ArrowDownCircle className="w-3.5 h-3.5" /> Total Kas Masuk
              Diterima
            </span>
            <span className="text-xl font-extrabold text-white mt-1 block font-mono">
              Rp {totalDpMasuk.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Dari {filteredOrders.length} pesanan terdata
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 shadow-xl relative overflow-hidden">
            <span className="text-[10px] text-blue-400 font-extrabold block uppercase tracking-wider flex items-center gap-1">
              <PiggyBank className="w-3.5 h-3.5" /> Wadah Modal Produksi (HPP)
            </span>
            <span className="text-xl font-extrabold text-blue-300 mt-1 block font-mono">
              Rp {totalHppModalNeed.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-blue-200/60 mt-1 block">
              Khusus kain, aksesoris & penjahit
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-rose-500/30 shadow-xl relative overflow-hidden">
            <span className="text-[10px] text-rose-400 font-extrabold block uppercase tracking-wider flex items-center gap-1">
              <ArrowUpCircle className="w-3.5 h-3.5" /> Pengeluaran Toko
            </span>
            <span className="text-xl font-extrabold text-rose-300 mt-1 block font-mono">
              Rp {totalPengeluaran.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-rose-200/60 mt-1 block">
              Bahan baku, listrik, transport
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/50 shadow-xl relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-800 to-emerald-950/40">
            <span className="text-[10px] text-emerald-400 font-extrabold block uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Wadah Deviden
              Owner (Siap Ambil)
            </span>
            <span className="text-xl font-extrabold text-emerald-300 mt-1 block font-mono">
              Rp {Math.round(sisaDevidenBolehDitarik).toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-emerald-200/60 mt-1 block">
              Maksimal hak bersih ditarik
            </span>
          </div>
        </div>

        {/* TAB NAVIGASI MODUL UTAMA */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveMainTab("TRANSAKSI")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeMainTab === "TRANSAKSI"
                ? "bg-amber-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <CreditCard className="w-4 h-4" /> 1. Kasir & Tagihan Pelanggan (
            {filteredOrders.length})
          </button>

          <button
            onClick={() => setActiveMainTab("DEVIDEN_OWNER")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeMainTab === "DEVIDEN_OWNER"
                ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Coins className="w-4 h-4" /> 2. Wadah & Penarikan Deviden Owner
          </button>

          <button
            onClick={() => setActiveMainTab("PENGELUARAN")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeMainTab === "PENGELUARAN"
                ? "bg-rose-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Receipt className="w-4 h-4" /> 3. Buku Pengeluaran Toko (
            {expenses.length})
          </button>
        </div>

        {/* CONTENT TAB 1: KASIR TRANSAKSI PELANGGAN */}
        {activeMainTab === "TRANSAKSI" && (
          <div className="space-y-4">
            {/* TOOLBAR FILTER & CARI */}
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-md flex flex-col md:flex-row justify-between items-center gap-3">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari pemesan, nomor nota, instansi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <Building2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300 whitespace-nowrap">
                  Filter Instansi:
                </span>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full md:w-auto px-3 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs font-bold text-amber-400 outline-none focus:border-amber-500"
                >
                  <option value="ALL">Semua Instansi ({folders.length})</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.folder_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* DAFTAR TRANSAKSI KASIR */}
            <div className="space-y-3">
              {filteredOrders.length === 0 ? (
                <div className="p-12 text-center bg-slate-800/60 backdrop-blur-md rounded-2xl border border-dashed border-slate-700 text-xs text-slate-400">
                  Tidak ada data transaksi keuangan yang cocok.
                </div>
              ) : (
                filteredOrders.map((item) => {
                  const priceNum = Number(item.price) || 0;
                  const dpNum = Number(item.down_payment) || 0;
                  const sisa = priceNum - dpNum;
                  const isLunas =
                    item.payment_status === "LUNAS" ||
                    (sisa <= 0 && priceNum > 0);

                  return (
                    <div
                      key={item.id}
                      className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-3 hover:border-amber-500/60 transition"
                    >
                      {/* HEADER KARTU */}
                      <div className="flex justify-between items-start border-b border-slate-700/60 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                              NOTA: {item.item_code}
                            </span>
                            <span className="text-[11px] font-bold text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded-md">
                              {item.members?.folders?.folder_name ||
                                "Instansi Umum"}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-white text-base">
                            {item.members?.member_name}{" "}
                            <span className="text-xs text-slate-400 font-normal">
                              ({item.members?.rank_title || "Anggota"})
                            </span>
                          </h4>

                          <p className="text-xs text-amber-400 font-semibold">
                            {item.model_name} •{" "}
                            <span className="text-slate-300">
                              {item.item_type} (
                              {item.fabric_type || "Bahan Standar"})
                            </span>
                          </p>
                        </div>

                        {/* BADGE STATUS PEMBAYARAN */}
                        {isLunas ? (
                          <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-extrabold">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                            LUNAS
                          </span>
                        ) : dpNum > 0 ? (
                          <span className="flex items-center gap-1.5 text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3 py-1 rounded-full font-extrabold">
                            <AlertCircle className="w-4 h-4 text-amber-400" />{" "}
                            DP: Rp {dpNum.toLocaleString("id-ID")}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 px-3 py-1 rounded-full font-extrabold">
                            <XCircle className="w-4 h-4 text-rose-400" /> BELUM
                            BAYAR
                          </span>
                        )}
                      </div>

                      {/* DETAIL ANGKA RINCIAN */}
                      <div className="grid grid-cols-3 gap-3 bg-slate-900/70 p-3 rounded-xl text-xs font-mono border border-slate-700/50">
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">
                            Total Tagihan
                          </span>
                          <span className="font-extrabold text-white text-sm">
                            Rp {priceNum.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">
                            Uang Muka (DP)
                          </span>
                          <span className="font-extrabold text-emerald-400 text-sm">
                            Rp {dpNum.toLocaleString("id-ID")}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-sans block uppercase font-bold">
                            Sisa Pelunasan
                          </span>
                          <span
                            className={`font-extrabold text-sm ${
                              sisa > 0 ? "text-rose-400" : "text-slate-400"
                            }`}
                          >
                            Rp{" "}
                            {sisa > 0
                              ? sisa.toLocaleString("id-ID")
                              : "0 (Selesai)"}
                          </span>
                        </div>
                      </div>

                      {/* TOMBOL AKSI KASIR */}
                      <div className="flex justify-end items-center gap-2 pt-1">
                        <button
                          onClick={() => handleOpenPaymentModal(item)}
                          className="px-4 py-2 bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/40 text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                        >
                          <CreditCard className="w-4 h-4" /> Input DP /
                          Pelunasan
                        </button>

                        <button
                          onClick={() => setPrintItem(item)}
                          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition"
                        >
                          <Printer className="w-4 h-4" /> Cetak Nota Belanja
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* CONTENT TAB 2: WADAH & PENARIKAN DEVIDEN OWNER */}
        {activeMainTab === "DEVIDEN_OWNER" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* FORM PENARIKAN DEVIDEN (LEFT - 5 COLS) */}
            <form
              onSubmit={handleAddWithdrawal}
              className="lg:col-span-5 bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4 text-xs"
            >
              <h3 className="font-extrabold text-emerald-400 border-b border-slate-700 pb-2 flex items-center gap-2 text-sm">
                <Coins className="w-4 h-4 text-amber-400" /> Form Penarikan
                Deviden Owner
              </h3>

              <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30 space-y-1 font-mono">
                <span className="text-[11px] text-slate-300 block font-sans">
                  Maksimal Deviden Siap Ambil:
                </span>
                <span className="text-2xl font-extrabold text-emerald-400 block">
                  Rp{" "}
                  {Math.round(sisaDevidenBolehDitarik).toLocaleString("id-ID")}
                </span>
                <p className="text-[10px] text-slate-400 font-sans pt-1">
                  *Diurai otomatis dari 60% profit bersih transaksi terbayar.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nominal Uang yang Ingin Ditarik (Rp) *
                </label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Masukkan nominal penarikan..."
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-extrabold text-emerald-400 text-sm outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Keterangan Penarikan (Opsional)
                </label>
                <input
                  type="text"
                  value={withdrawNotes}
                  onChange={(e) => setWithdrawNotes(e.target.value)}
                  placeholder="Misal: Gajian Owner / Keperluan Pribadi"
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-semibold text-white outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingWithdraw}
                className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {isSubmittingWithdraw ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRightLeft className="w-4 h-4" />
                )}
                Tarik Uang Deviden Sekarang
              </button>
            </form>

            {/* LOG HISTORI PENARIKAN DEVIDEN (RIGHT - 7 COLS) */}
            <div className="lg:col-span-7 bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-xl space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Buku
                  Riwayat Penarikan Owner
                </h3>
                <span className="font-mono font-bold text-emerald-400">
                  Total Ditarik: Rp{" "}
                  {totalDevidenDitarik.toLocaleString("id-ID")}
                </span>
              </div>

              {withdrawals.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic">
                  Belum ada riwayat penarikan deviden oleh owner.
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {withdrawals.map((w) => (
                    <div
                      key={w.id}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80 flex justify-between items-center hover:border-emerald-500/40 transition"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-xs block">
                          {w.notes || "Penarikan Deviden Owner"}
                        </span>
                        <p className="text-[10px] text-slate-400">
                          Tanggal: {w.withdrawal_date}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">
                          - Rp {Number(w.amount || 0).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => handleDeleteWithdrawal(w.id)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition"
                          title="Hapus Log Penarikan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* CONTENT TAB 3: PENGELUARAN OPERASIONAL & SPJ TOKO */}
        {activeMainTab === "PENGELUARAN" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* FORM INPUT PENGELUARAN (LEFT - 5 COLS) */}
            <form
              onSubmit={handleAddExpense}
              className="lg:col-span-5 bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4 text-xs"
            >
              <h3 className="font-extrabold text-rose-400 border-b border-slate-700 pb-2 flex items-center gap-2 text-sm">
                <PlusCircle className="w-4 h-4" /> Catat Pengeluaran SPJ / Toko
                Baru
              </h3>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nama / Keterangan Pengeluaran
                </label>
                <input
                  type="text"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                  placeholder="Misal: Beli Benang & Zipper YKK"
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-semibold text-white outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Kategori Pengeluaran
                </label>
                <select
                  value={expenseCategory}
                  onChange={(e) => setExpenseCategory(e.target.value)}
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-bold text-amber-400 outline-none focus:border-rose-500"
                >
                  <option value="BAHAN_BAKU">🧵 Bahan Baku & Aksesori</option>
                  <option value="OPERASIONAL">
                    ⚡ Listrik, Air & Paket Data
                  </option>
                  <option value="PERALATAN">🛠️ Perawatan Mesin & Jarum</option>
                  <option value="TRANSPORT">
                    🚚 Transportasi & Bensin Kirim
                  </option>
                  <option value="LAINNYA">📦 Pengeluaran Lain-Lain</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nominal Biaya (Rp)
                </label>
                <input
                  type="number"
                  value={expenseAmount}
                  onChange={(e) => setExpenseAmount(e.target.value)}
                  placeholder="Masukkan angka tanpa titik..."
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-bold text-rose-400 text-sm outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Catatan Tambahan (Opsional)
                </label>
                <textarea
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                  placeholder="Misal: Beli di Toko Maju Kudus"
                  rows={2}
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-medium text-slate-300 outline-none focus:border-rose-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingExpense}
                className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                {isSubmittingExpense ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PlusCircle className="w-4 h-4" />
                )}
                Simpan Catatan Pengeluaran
              </button>
            </form>

            {/* DAFTAR HISTORI PENGELUARAN (RIGHT - 7 COLS) */}
            <div className="lg:col-span-7 bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-xl space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-slate-700 pb-2">
                <h3 className="font-extrabold text-slate-200 text-sm flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-rose-400" /> Riwayat Buku
                  Pengeluaran Toko
                </h3>
                <span className="font-mono font-bold text-rose-400">
                  Total Out: Rp {totalPengeluaran.toLocaleString("id-ID")}
                </span>
              </div>

              {expenses.length === 0 ? (
                <div className="p-12 text-center text-slate-500 italic">
                  Belum ada catatan pengeluaran toko yang dimasukkan.
                </div>
              ) : (
                <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {expenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 bg-slate-900/80 rounded-xl border border-slate-700/80 flex justify-between items-center hover:border-rose-500/40 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">
                            {exp.title}
                          </span>
                          <span className="text-[9px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                            {exp.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400">
                          Tanggal: {exp.expense_date}{" "}
                          {exp.notes ? `• ${exp.notes}` : ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-rose-400 text-sm">
                          - Rp {Number(exp.amount || 0).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() => handleDeleteExpense(exp.id, exp.title)}
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition"
                          title="Hapus Pengeluaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL EDIT KASIR PEMBAYARAN / DP */}
      {paymentItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:hidden">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-700 text-slate-100">
            <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
              <div>
                <h3 className="text-sm font-extrabold text-amber-400">
                  Kasir Pelunasan & Uang Muka (DP)
                </h3>
                <p className="text-xs text-slate-300">
                  {paymentItem.members?.member_name} • {paymentItem.model_name}
                </p>
              </div>
              <button
                onClick={() => setPaymentItem(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSavePayment}
              className="p-5 space-y-4 text-xs"
            >
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/30 space-y-1">
                <div className="flex justify-between font-bold text-amber-400 text-sm">
                  <span>Total Tagihan Pesanan:</span>
                  <span>
                    Rp {Number(paymentItem.price || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Jumlah Uang Muka / DP Diterima (Rp):
                </label>
                <input
                  type="number"
                  value={inputDp}
                  onChange={(e) => setInputDp(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-700 rounded-xl font-bold text-sm text-emerald-400 bg-slate-950 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Status Pembayaran Manual:
                </label>
                <select
                  value={inputStatus}
                  onChange={(e) => setInputStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-700 rounded-xl font-bold text-xs bg-slate-950 text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="BELUM_BAYAR">Belum Bayar (Rp 0)</option>
                  <option value="DP">DP (Uang Muka Sebagian)</option>
                  <option value="LUNAS">LUNAS (Pelunasan Selesai)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentItem(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PRINT NOTA PEMBAYARAN RESMI PELANGGAN */}
      {printItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:z-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-900 print:p-0 print:shadow-none print:w-full">
            <div className="flex justify-between items-center pb-3 border-b print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-sm text-slate-800">
                  Preview Nota Belanja Pelanggan
                </h3>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPrintItem(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded-xl"
                >
                  Batal
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center gap-1 shadow"
                >
                  <Printer className="w-4 h-4" /> Cetak Nota
                </button>
              </div>
            </div>

            {/* TEMPLATE NOTA BELANJA PELANGGAN */}
            <div className="p-4 border-2 border-slate-900 rounded-xl space-y-3 font-mono text-xs text-slate-900">
              <div className="text-center border-b-2 border-slate-900 pb-2">
                <h2 className="text-base font-extrabold tracking-widest">
                  YS TAILOR (YUNMA SLAMUS)
                </h2>
                <p className="text-[10px]">
                  Spesialis Seragam & Tailor Pakaian Pria / Wanita
                </p>
                <p className="text-[9px] text-slate-600">Kudus, Jawa Tengah</p>
              </div>

              <div className="flex justify-between text-[11px] pt-1">
                <div>
                  <p>
                    <span className="font-bold">PELANGGAN:</span>{" "}
                    {printItem.members?.member_name} (
                    {printItem.members?.rank_title || "-"})
                  </p>
                  <p>
                    <span className="font-bold">INSTANSI:</span>{" "}
                    {printItem.members?.folders?.folder_name}
                  </p>
                </div>
                <div className="text-right">
                  <p>
                    <span className="font-bold">NO. NOTA:</span>{" "}
                    {printItem.item_code}
                  </p>
                  <p>
                    <span className="font-bold">TANGGAL:</span>{" "}
                    {new Date().toLocaleDateString("id-ID")}
                  </p>
                </div>
              </div>

              <table className="w-full border-collapse border border-slate-900 text-left my-2">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-900">
                    <th className="p-1.5 border-r border-slate-900">
                      Rincian Item
                    </th>
                    <th className="p-1.5 border-r border-slate-900">
                      Model / Bahan
                    </th>
                    <th className="p-1.5 text-right">Harga (Rp)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="p-1.5 border-r border-slate-900 font-bold">
                      {printItem.item_type}
                    </td>
                    <td className="p-1.5 border-r border-slate-900">
                      {printItem.model_name} (
                      {printItem.fabric_type || "Kain Custom"})
                    </td>
                    <td className="p-1.5 text-right font-bold">
                      Rp {Number(printItem.price || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="space-y-1 text-right pt-1 font-bold">
                <p className="flex justify-between">
                  <span>Total Tagihan:</span>
                  <span>
                    Rp {Number(printItem.price || 0).toLocaleString("id-ID")}
                  </span>
                </p>
                <p className="flex justify-between text-emerald-800">
                  <span>Uang Muka / DP Received:</span>
                  <span>
                    Rp{" "}
                    {Number(printItem.down_payment || 0).toLocaleString(
                      "id-ID",
                    )}
                  </span>
                </p>
                <div className="flex justify-between border-t border-slate-900 pt-1 text-sm">
                  <span>Sisa Pelunasan:</span>
                  <span
                    className={
                      Number(printItem.price || 0) -
                        Number(printItem.down_payment || 0) <=
                      0
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }
                  >
                    Rp{" "}
                    {Math.max(
                      0,
                      Number(printItem.price || 0) -
                        Number(printItem.down_payment || 0),
                    ).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-6 text-[10px]">
                <div className="text-center w-32">
                  <p>Hormat Kami,</p>
                  <div className="h-10"></div>
                  <p className="font-bold border-t border-slate-900">
                    YS Tailor
                  </p>
                </div>
                <div className="text-center w-32">
                  <p>Pemesan,</p>
                  <div className="h-10"></div>
                  <p className="font-bold border-t border-slate-900">
                    {printItem.members?.member_name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
