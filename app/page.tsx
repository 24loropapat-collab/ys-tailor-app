"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Users,
  Scissors,
  Wallet,
  Megaphone,
  MoreHorizontal,
  LogOut,
  FolderPlus,
  Folder,
  Search,
  Phone,
  Calendar,
  Plus,
  X,
  Loader2,
  Clock,
  Crown,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// Tipe Data Folder
interface FolderItem {
  id: string;
  created_at: string;
  folder_name: string;
  category: string;
  region: string;
  person_in_charge: string;
  phone_number: string;
  deadline_date: string;
  down_payment: number;
  total_estimate: number;
  status: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  // State Modul Aktif
  const [activeModule, setActiveModule] = useState<
    "PRODUKSI" | "SDM" | "KEUANGAN" | "PEMASARAN" | "LAINNYA"
  >("PRODUKSI");

  // State Data Folder & Pencarian
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);

  // State Modal Form Folder Baru
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Input Folder Baru
  const [folderName, setFolderName] = useState("");
  const [category, setCategory] = useState("Dinas / Polsek");
  const [region, setRegion] = useState("Demak");
  const [pic, setPic] = useState("");
  const [phone, setPhone] = useState("");
  const [deadline, setDeadline] = useState("");
  const [dp, setDp] = useState("");

  // Cek Status Sesi Login (Hanya izinkan masuk jika sudah login dari /login)
  useEffect(() => {
    const role = localStorage.getItem("ys_user_role");
    const name = localStorage.getItem("ys_user_name");

    if (!role) {
      router.push("/login");
    } else {
      setUserRole(role);
      setUserName(name || "Pengguna");
      fetchFolders();
    }
  }, [router]);

  // Ambil data Folder dari Supabase
  const fetchFolders = async () => {
    setIsLoadingFolders(true);
    try {
      const { data, error } = await supabase
        .from("folders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Gagal mengambil folder:", error.message);
      } else if (data) {
        setFolders(data);
      }
    } catch (err) {
      console.error("Error fetch folders:", err);
    } finally {
      setIsLoadingFolders(false);
    }
  };

  // Handler Buat Folder Baru
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) {
      alert("Mohon isi Nama Instansi / Folder!");
      return;
    }

    setIsSubmitting(true);
    try {
      const newFolder: any = {
        folder_name: folderName.trim(),
        category,
        region,
        person_in_charge: pic.trim(),
        phone_number: phone.trim(),
        deadline_date: deadline || null,
        down_payment: Number(dp) || 0,
        status: "Proses",
      };

      const { error } = await (supabase.from("folders") as any)
        .insert([newFolder])
        .select();

      if (error) {
        alert("Gagal membuat folder: " + error.message);
      } else {
        alert(`Folder "${folderName}" berhasil dibuat!`);
        // Reset Form
        setFolderName("");
        setPic("");
        setPhone("");
        setDeadline("");
        setDp("");
        setIsModalOpen(false);
        fetchFolders();
      }
    } catch (err: any) {
      alert("Terjadi kesalahan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Logout
  const handleLogout = () => {
    if (confirm("Apakah kamu yakin ingin keluar dari aplikasi YS Tailor?")) {
      localStorage.removeItem("ys_user_role");
      localStorage.removeItem("ys_user_name");
      router.push("/login");
    }
  };

  // Filter Folder berdasarkan Pencarian
  const filteredFolders = folders.filter(
    (f) =>
      f.folder_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8F6F0] text-slate-800 font-sans">
      {/* HEADER NAVBAR UTAMA */}
      <header className="bg-[#1E293B] text-white px-6 py-3 flex justify-between items-center shadow-lg border-b border-amber-500/20 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 bg-amber-50 rounded-xl overflow-hidden p-1 border-2 border-amber-400 flex items-center justify-center shadow-md">
            <Image
              src="/logo-ys.png"
              alt="YS Tailor Logo"
              width={44}
              height={44}
              className="object-contain"
              priority
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
            <Scissors className="w-5 h-5 text-amber-600 hidden" />
          </div>
          <div>
            <h1 className="font-bold text-base tracking-widest text-amber-400 leading-tight">
              YS TAILOR
            </h1>
            <p className="text-[10px] text-slate-300 font-medium">
              TAILOR GROW UP • MANAGEMENT SYSTEM
            </p>
          </div>
        </div>

        {/* PROFIL PENGGUNA TERHUBUNG & TOMBOL LOGOUT */}
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Crown className="w-4 h-4 text-amber-400" />
            <div className="text-right">
              <div className="text-xs font-bold text-amber-300 flex items-center justify-end gap-1">
                {userName}
              </div>
              <div className="text-[10px] text-amber-400 uppercase tracking-wider font-extrabold">
                Akses: {userRole}
              </div>
            </div>
          </div>

          <button
            suppressHydrationWarning
            onClick={handleLogout}
            title="Keluar Akun"
            className="p-2 bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white rounded-xl..."
          ></button>

          <button
            onClick={handleLogout}
            title="Keluar Akun"
            className="p-2 bg-slate-800 hover:bg-red-600/80 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition shadow-sm flex items-center gap-1.5 text-xs font-semibold"
          >
            <LogOut className="w-4 h-4" />{" "}
            <span className="hidden md:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* BANNER HEADER ESTETIK DASHBOARD */}
      <div className="relative w-full h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 overflow-hidden rounded-b-2xl shadow-lg border-b border-amber-500/20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
          style={{ backgroundImage: "url('/dashboard-banner.png')" }}
        />

        <div className="relative z-10 max-w-7xl mx-auto p-6 h-full flex flex-col justify-center">
          <div className="inline-block px-3 py-1 bg-amber-500/20 border border-amber-400/30 rounded-full text-[10px] font-bold text-amber-300 w-fit mb-2">
            👑 MODE KONTROL PENUH OWNER • DEMAK
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-amber-400 tracking-wide">
            Portal Operasional YS Tailor
          </h2>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            Sistem Terintegrasi ERP Konveksi & Jahit Instansi (Yunma Slamus).
            Kelola folder instansi, input ukuran anggota, manajemen SDM
            penjahit, dan pantau keuangan secara real-time.
          </p>
        </div>
      </div>

      {/* MENU NAVIGASI 5 PILAR BUSINESS */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-14 z-20">
        <div className="max-w-7xl mx-auto px-6 flex space-x-1 overflow-x-auto py-2">
          <button
            onClick={() => setActiveModule("PRODUKSI")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeModule === "PRODUKSI"
                ? "bg-[#D97706] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Scissors className="w-4 h-4" /> 1. PRODUKSI & FOLDER
          </button>

          <button
            onClick={() => {
              setActiveModule("SDM");
              router.push("/sdm");
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeModule === "SDM"
                ? "bg-[#D97706] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" /> 2. SDM & KARYAWAN
          </button>

          <button
            onClick={() => {
              setActiveModule("KEUANGAN");
              router.push("/keuangan");
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeModule === "KEUANGAN"
                ? "bg-[#D97706] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Wallet className="w-4 h-4" /> 3. KEUANGAN & SPJ
          </button>

          <button
            onClick={() => setActiveModule("PEMASARAN")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeModule === "PEMASARAN"
                ? "bg-[#D97706] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Megaphone className="w-4 h-4" /> 4. PEMASARAN & WA
          </button>

          <button
            onClick={() => setActiveModule("LAINNYA")}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeModule === "LAINNYA"
                ? "bg-[#D97706] text-white shadow-md"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <MoreHorizontal className="w-4 h-4" /> 5. DAN LAIN-LAIN
          </button>
        </div>
      </div>

      {/* AREA WORKSPACE MODUL AKTIF */}
      <main className="p-6 max-w-7xl mx-auto">
        {activeModule === "PRODUKSI" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Dapur Kerja Produksi & Folder Wilayah
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola folder instansi, input ukuran anggota, dan cetak 6
                  sobekan nota.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari instansi/wilayah..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 whitespace-nowrap"
                >
                  <FolderPlus className="w-4 h-4" /> + Buat Folder Baru
                </button>
              </div>
            </div>

            {isLoadingFolders ? (
              <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
                <p className="text-xs">
                  Memuat daftar folder instansi dari cloud...
                </p>
              </div>
            ) : filteredFolders.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center gap-2">
                <Folder className="w-10 h-10 text-slate-300" />
                <h4 className="font-bold text-sm text-slate-700">
                  Belum Ada Folder Instansi
                </h4>
                <p className="text-xs text-slate-400 max-w-sm">
                  Klik tombol "+ Buat Folder Baru" di atas untuk menambahkan
                  instansi pesanan jahit baru.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredFolders.map((f) => (
                  <div
                    key={f.id}
                    onClick={() => router.push(`/folder/${f.id}`)}
                    className="bg-white border border-slate-200 hover:border-amber-500 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between relative group overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-amber-500" />

                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 font-bold text-[10px] rounded-lg border border-amber-200">
                          {f.category}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" /> {f.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-slate-800 text-base group-hover:text-amber-700 transition flex items-center gap-2">
                        <Folder className="w-5 h-5 text-amber-600 fill-amber-100" />{" "}
                        {f.folder_name}
                      </h4>

                      <p className="text-xs text-slate-500 mt-1 font-medium">
                        📍 Wilayah: {f.region}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                        {f.person_in_charge && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">
                              Penanggung Jawab:
                            </span>
                            <span className="font-bold text-slate-700">
                              {f.person_in_charge}
                            </span>
                          </div>
                        )}
                        {f.phone_number && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">
                              Telepon / WA:
                            </span>
                            <span className="font-semibold text-slate-600 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-600" />{" "}
                              {f.phone_number}
                            </span>
                          </div>
                        )}
                        {f.deadline_date && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 text-[11px]">
                              Tenggat Waktu:
                            </span>
                            <span className="font-bold text-red-600 flex items-center gap-1">
                              <Calendar className="w-3 h-3" /> {f.deadline_date}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center bg-slate-50/80 -mx-5 -mb-5 p-4 rounded-b-2xl">
                      <span className="text-[11px] text-slate-500 font-semibold">
                        DP Masuk:
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        Rp {Number(f.down_payment || 0).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MODUL SDM QUICK LINK */}
        {activeModule === "SDM" && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Manajemen SDM & Borongan Karyawan
                </h3>
                <p className="text-xs text-slate-500">
                  Kelola penjahit, penugasan pengerjaan seragam, dan rekap upah
                  borongan.
                </p>
              </div>
              <button
                onClick={() => router.push("/sdm")}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                Buka Dashboard SDM <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => router.push("/sdm")}
              className="p-8 text-center border-2 border-dashed border-amber-300 bg-amber-50/50 hover:bg-amber-50 rounded-xl cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <Users className="w-10 h-10 text-amber-600" />
              <h4 className="font-extrabold text-sm text-slate-800">
                Masuk ke Halaman Utama SDM & Upah Borongan
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Klik di sini untuk mengelola daftar tim penjahit, memberi tugas
                jahit per setel, dan membayarkan hak gaji borongan.
              </p>
            </div>
          </div>
        )}

        {/* MODUL KEUANGAN QUICK LINK */}
        {activeModule === "KEUANGAN" && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Pencatatan Keuangan, Arus Kas & Wadah Deviden Owner
                </h3>
                <p className="text-xs text-slate-500">
                  Pencatatan DP, Pelunasan, SPJ Instansi, Rekap Laba Bersih &
                  Wadah Uang Owner.
                </p>
              </div>
              <button
                onClick={() => router.push("/keuangan")}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
              >
                Buka Keuangan <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div
              onClick={() => router.push("/keuangan")}
              className="p-8 text-center border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl cursor-pointer transition flex flex-col items-center justify-center gap-2"
            >
              <Wallet className="w-10 h-10 text-emerald-600" />
              <h4 className="font-extrabold text-sm text-slate-800">
                Masuk ke Center Keuangan & Kasir SPJ
              </h4>
              <p className="text-xs text-slate-500 max-w-sm">
                Klik di sini untuk mengelola arus kas toko, mencetak nota resmi
                pelanggan, dan menarik deviden owner.
              </p>
            </div>
          </div>
        )}

        {/* MODUL PEMASARAN */}
        {activeModule === "PEMASARAN" && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Pemasaran & Notifikasi WhatsApp
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Database nomor WA pelanggan instansi dan pesan otomatis.
            </p>
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
              [Modul Pemasaran Siap Dikonfigurasi]
            </div>
          </div>
        )}

        {/* MODUL LAINNYA */}
        {activeModule === "LAINNYA" && (
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-1">
              Stok Bahan & Pengaturan Toko
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Pencatatan sisa stok kain, kancing, dan profil usaha YS Tailor.
            </p>
            <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
              [Modul Inventaris & Setting Siap Dikonfigurasi]
            </div>
          </div>
        )}
      </main>

      {/* MODAL FORM BUAT FOLDER BARU */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-500/30 text-slate-800 relative animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800">
                    Buat Folder Instansi Baru
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Tambahkan proyek jahit instansi atau wilayah baru.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateFolder} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Instansi / Proyek *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: POLSEK DEMAK, KODIM 0716, dll."
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategori Pesanan
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  >
                    <option value="Dinas / Polsek">Dinas / Polsek</option>
                    <option value="TNI / Kodim">TNI / Kodim</option>
                    <option value="Instansi Pemda">Instansi Pemda</option>
                    <option value="Seragam Sekolah">Seragam Sekolah</option>
                    <option value="Perorangan / Umum">Perorangan / Umum</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Wilayah / Kota
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Demak, Kudus"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Penanggung Jawab (PIC)
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Pemesan/Pemimpin"
                    value={pic}
                    onChange={(e) => setPic(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. WhatsApp Pemesan
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tenggat Waktu Selesai
                  </label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Uang Muka / DP (Rp)
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={dp}
                    onChange={(e) => setDp(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-amber-700"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}{" "}
                  Simpan Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
