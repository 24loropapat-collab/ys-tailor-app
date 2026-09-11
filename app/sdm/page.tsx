"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  UserCheck,
  Scissors,
  DollarSign,
  Briefcase,
  X,
  Trash2,
  Check,
  AlertCircle,
  Gift,
  Award,
  TrendingUp,
  FileText,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SdmPage() {
  const router = useRouter();

  // Tab Navigasi Utama SDM
  const [activeTab, setActiveTab] = useState<
    "KARYAWAN" | "PENUGASAN" | "GAJI_MINGGUAN" | "PRODUKTIVITAS_THR"
  >("GAJI_MINGGUAN");

  // State Data Master
  const [employees, setEmployees] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State Input Simulator THR
  const [thrRates, setThrRates] = useState<{ [role: string]: number }>({
    PENJAHIT: 1000,
    TUKANG_POTONG: 500,
    BORDIR: 500,
    FINISHING: 300,
  });

  // State Modal Tambah Karyawan
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [empName, setEmpName] = useState("");
  const [empRole, setEmpRole] = useState("PENJAHIT");
  const [empType, setEmpType] = useState("BORONGAN");
  const [empPhone, setEmpPhone] = useState("");
  const [isSubmittingEmp, setIsSubmittingEmp] = useState(false);

  // State Modal Penugasan / Input Sobekan Cek Mingguan
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [taskName, setTaskName] = useState("");
  const [wagePerUnit, setWagePerUnit] = useState<number>(0);
  const [taskQty, setTaskQty] = useState<number>(1);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  useEffect(() => {
    fetchSdmData();
  }, []);

  const fetchSdmData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Data Master Karyawan
      const { data: empData, error: empErr } = await (
        supabase.from("employees") as any
      )
        .select("*")
        .order("created_at", { ascending: false });
      if (empErr) throw empErr;
      setEmployees(empData || []);

      // 2. Fetch Data Penugasan Kerja & Sobekan Cek
      // Menggunakan query generik ke employees(*) untuk menghindari mismatch kolom (employee_name vs name)
      const { data: taskData, error: taskErr } = await (
        supabase.from("employee_tasks") as any
      )
        .select(
          "*, employees(*), order_items(*, members(member_name, folders(folder_name)))",
        )
        .order("created_at", { ascending: false });
      if (taskErr) throw taskErr;
      setTasks(taskData || []);

      // 3. Fetch Data Order Items
      const { data: orderData, error: orderErr } = await (
        supabase.from("order_items") as any
      )
        .select("*, members(member_name, rank_title, folders(folder_name))")
        .order("created_at", { ascending: false });
      if (orderErr) throw orderErr;
      setAvailableOrders(orderData || []);
    } catch (err: any) {
      console.error("Gagal memuat data SDM:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper untuk membaca nama karyawan secara konsisten dari berbagai struktur skema
  const getEmployeeName = (empObj: any) => {
    if (!empObj) return "Karyawan";
    return (
      empObj.employee_name || empObj.name || empObj.full_name || "Tanpa Nama"
    );
  };

  // Helper aman Copy-to-Clipboard (Mencegah NotAllowedError)
  const handleCopyToClipboard = async (textToCopy: string) => {
    try {
      if (typeof window !== "undefined") {
        window.focus();
      }
      await navigator.clipboard.writeText(textToCopy);
      alert("Teks berhasil disalin!");
    } catch (err) {
      // Fallback manual jika Clipboard API diblokir browser/tidak fokus
      try {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        alert("Teks berhasil disalin!");
      } catch (fallbackErr) {
        alert("Gagal menyalin teks ke clipboard.");
      }
    }
  };

  // Handle Tambah Karyawan Baru
  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empName) return;

    setIsSubmittingEmp(true);
    try {
      // Menyimpan ke 'name' dan 'employee_name' sekaligus agar kompatibel dengan skema DB
      const { error } = await (supabase.from("employees") as any).insert([
        {
          name: empName,
          employee_name: empName,
          role: empRole,
          employee_type: empType,
          phone: empPhone,
          is_active: true,
        },
      ]);

      if (error) throw error;

      setEmpName("");
      setEmpPhone("");
      setIsEmpModalOpen(false);
      fetchSdmData();
      alert(`Karyawan baru ${empName} berhasil ditambahkan!`);
    } catch (err: any) {
      alert("Gagal menambahkan karyawan: " + err.message);
    } finally {
      setIsSubmittingEmp(false);
    }
  };

  // Handle Pilih Pesanan pada Penugasan
  const handleSelectOrderForTask = (orderId: string) => {
    setSelectedOrderId(orderId);
    if (!orderId) {
      setTaskName("");
      setWagePerUnit(0);
      return;
    }

    const order = availableOrders.find((o) => o.id === orderId);
    if (order) {
      const folderName = order.members?.folders?.folder_name || "Umum";
      const memberName = order.members?.member_name || "Pelanggan";
      setTaskName(
        `Jahit ${order.item_type || "Seragam"} - ${memberName} (${folderName})`,
      );
      setWagePerUnit(
        Number(order.hpp_amount) > 0
          ? Math.round(Number(order.hpp_amount) * 0.35)
          : 100000,
      );
    }
  };

  // Submit Catatan Sobekan Cek Gaji Mingguan
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpId || !taskName) return;

    setIsSubmittingTask(true);
    try {
      const totalWageCalculated = wagePerUnit * taskQty;

      const { error } = await (supabase.from("employee_tasks") as any).insert([
        {
          employee_id: selectedEmpId,
          order_item_id: selectedOrderId || null,
          task_name: taskName,
          wage_per_unit: wagePerUnit,
          qty: taskQty,
          total_wage: totalWageCalculated,
          status: "SELESAI",
          is_paid: false,
        },
      ]);

      if (error) throw error;

      setSelectedEmpId("");
      setSelectedOrderId("");
      setTaskName("");
      setWagePerUnit(0);
      setTaskQty(1);
      setIsTaskModalOpen(false);
      fetchSdmData();
      alert("Pencatatan sobekan cek mingguan berhasil disimpan!");
    } catch (err: any) {
      alert("Gagal mencatat pekerjaan: " + err.message);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Pelunasan Gaji Mingguan
  const handlePayTaskWage = async (
    taskId: string,
    empName: string,
    wageAmount: number,
  ) => {
    if (
      !confirm(
        `Tandai pembayaran gaji borongan sebesar Rp ${wageAmount.toLocaleString("id-ID")} untuk ${empName} sebagai LUNAS?`,
      )
    )
      return;

    try {
      const { error } = await (supabase.from("employee_tasks") as any)
        .update({
          is_paid: true,
          paid_date: new Date().toISOString().split("T")[0],
        })
        .eq("id", taskId);

      if (error) throw error;
      fetchSdmData();
      alert("Gaji mingguan berhasil dibayarkan!");
    } catch (err: any) {
      alert("Gagal memproses gaji: " + err.message);
    }
  };

  const handleDeleteEmployee = async (id: string, name: string) => {
    if (
      !confirm(
        `Yakin ingin menghapus karyawan "${name}"? Seluruh riwayat sobekan cek & poin produktivitas juga akan terhapus.`,
      )
    )
      return;

    try {
      const { error } = await (supabase.from("employees") as any)
        .delete()
        .eq("id", id);
      if (error) throw error;
      fetchSdmData();
    } catch (err: any) {
      alert("Gagal menghapus karyawan: " + err.message);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Yakin ingin menghapus catatan sobekan cek ini?")) return;

    try {
      const { error } = await (supabase.from("employee_tasks") as any)
        .delete()
        .eq("id", taskId);
      if (error) throw error;
      fetchSdmData();
    } catch (err: any) {
      alert("Gagal menghapus catatan: " + err.message);
    }
  };

  // Filter Karyawan Berdasarkan Pencarian
  const filteredEmployees = employees.filter(
    (e) =>
      getEmployeeName(e).toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.role?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Perhitungan Ringkasan
  const totalEmployeesCount = employees.length;
  const totalCekCompleted = tasks.reduce(
    (sum, t) => sum + (Number(t.qty) || 0),
    0,
  );
  const totalUnpaidWages = tasks
    .filter((t) => !t.is_paid)
    .reduce((sum, t) => sum + (Number(t.total_wage) || 0), 0);
  const totalPaidWages = tasks
    .filter((t) => t.is_paid)
    .reduce((sum, t) => sum + (Number(t.total_wage) || 0), 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-amber-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold">
          Memuat Data SDM & Performa Karyawan...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 font-sans relative overflow-x-hidden">
      {/* BACKGROUND DEKORATIF */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
        {/* NAVIGASI HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-800/80 backdrop-blur-md p-5 rounded-2xl border border-slate-700/80 shadow-xl">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-xl text-xs font-bold text-slate-200 transition shadow-sm"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <div>
              <h1 className="text-lg font-extrabold text-amber-400 flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> Manajemen SDM &
                Produktivitas THR
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Pencatatan gajian mingguan berbasis sobekan cek & kalkulator
                simulator THR/Bonus karyawan.
              </p>
            </div>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => setIsEmpModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 font-extrabold text-xs rounded-xl shadow-md transition"
            >
              <UserCheck className="w-4 h-4 text-amber-400" /> Tambah Karyawan
            </button>

            <button
              onClick={() => setIsTaskModalOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition"
            >
              <Scissors className="w-4 h-4" /> + Input Sobekan Cek
            </button>
          </div>
        </div>

        {/* METRIK SUMMARY SDM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-amber-500/30 shadow-xl">
            <span className="text-[10px] text-amber-400 font-extrabold block uppercase tracking-wider">
              Total Tim / Karyawan
            </span>
            <span className="text-2xl font-extrabold text-white mt-1 block font-mono">
              {totalEmployeesCount}{" "}
              <span className="text-xs font-normal text-slate-400">Orang</span>
            </span>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Penjahit, Potong, Kancing, Finishing
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-blue-500/30 shadow-xl">
            <span className="text-[10px] text-blue-400 font-extrabold block uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> Total Akumulasi Cek
            </span>
            <span className="text-2xl font-extrabold text-blue-300 mt-1 block font-mono">
              {totalCekCompleted}{" "}
              <span className="text-xs font-normal text-slate-400">
                Sobekan/Setel
              </span>
            </span>
            <span className="text-[10px] text-blue-200/60 mt-1 block">
              Total poin volume kerja terkumpul
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-rose-500/30 shadow-xl">
            <span className="text-[10px] text-rose-400 font-extrabold block uppercase tracking-wider flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> Pending Gaji Minggu Ini
            </span>
            <span className="text-xl font-extrabold text-rose-300 mt-1 block font-mono">
              Rp {totalUnpaidWages.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-rose-200/60 mt-1 block">
              Upah borongan belum dibayar
            </span>
          </div>

          <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-4 border border-emerald-500/30 shadow-xl bg-gradient-to-br from-slate-800 via-slate-800 to-emerald-950/40">
            <span className="text-[10px] text-emerald-400 font-extrabold block uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Total Gaji Terbayar
            </span>
            <span className="text-xl font-extrabold text-emerald-300 mt-1 block font-mono">
              Rp {totalPaidWages.toLocaleString("id-ID")}
            </span>
            <span className="text-[10px] text-emerald-200/60 mt-1 block">
              Akumulasi upah yang sudah lunas
            </span>
          </div>
        </div>

        {/* TAB NAVIGASI UTAMA SDM */}
        <div className="flex bg-slate-800/80 p-1 rounded-xl border border-slate-700/80">
          <button
            onClick={() => setActiveTab("GAJI_MINGGUAN")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "GAJI_MINGGUAN"
                ? "bg-amber-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <DollarSign className="w-4 h-4" /> 1. Kasir Gaji Mingguan (Cek
            Sobekan)
          </button>

          <button
            onClick={() => setActiveTab("PRODUKTIVITAS_THR")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "PRODUKTIVITAS_THR"
                ? "bg-emerald-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Gift className="w-4 h-4" /> 2. Performa Produktivitas & Simulator
            THR
          </button>

          <button
            onClick={() => setActiveTab("KARYAWAN")}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === "KARYAWAN"
                ? "bg-blue-600 text-white shadow-sm font-extrabold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-4 h-4" /> 3. Data Karyawan ({employees.length})
          </button>
        </div>

        {/* TAB 1: KASIR GAJI MINGGUAN (CEK SOBEKAN) */}
        {activeTab === "GAJI_MINGGUAN" && (
          <div className="bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div>
                <h3 className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" /> Log
                  Penyerahan Sobekan Cek & Penggajian Akhir Pekan
                </h3>
                <p className="text-[11px] text-slate-400">
                  Catat jumlah kupon/cek yang diserahkan karyawan saat gajian
                  mingguan.
                </p>
              </div>

              <button
                onClick={() => setIsTaskModalOpen(true)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow transition flex items-center gap-1.5"
              >
                <Scissors className="w-4 h-4" /> + Catat Sobekan Cek
              </button>
            </div>

            {tasks.length === 0 ? (
              <div className="p-12 text-center text-slate-500 italic">
                Belum ada data rekapan sobekan cek gajian mingguan.
              </div>
            ) : (
              <div className="space-y-2.5">
                {tasks.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-700/80 flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:border-emerald-500/40 transition"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-white">
                          {getEmployeeName(t.employees)}
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {t.employees?.role}
                        </span>
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {t.qty} Cek/Setel
                        </span>
                        {t.is_paid ? (
                          <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            LUNAS ({t.paid_date})
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded-full">
                            PENDING BAYAR
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {t.task_name}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="font-mono font-extrabold text-emerald-400 text-sm block">
                          Rp {Number(t.total_wage || 0).toLocaleString("id-ID")}
                        </span>
                        <span className="text-[9px] text-slate-500">
                          (@ Rp{" "}
                          {Number(t.wage_per_unit || 0).toLocaleString("id-ID")}
                          /setel)
                        </span>
                      </div>

                      {!t.is_paid && (
                        <button
                          onClick={() =>
                            handlePayTaskWage(
                              t.id,
                              getEmployeeName(t.employees),
                              Number(t.total_wage || 0),
                            )
                          }
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl shadow transition"
                        >
                          Bayarkan Gaji
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteTask(t.id)}
                        className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition"
                        title="Hapus Catatan"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PERFORMA PRODUKTIVITAS & SIMULATOR THR */}
        {activeTab === "PRODUKTIVITAS_THR" && (
          <div className="space-y-5">
            {/* PANEL PENGATURAN TARIF BONUS THR PER PEKERJAAN */}
            <div className="bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-amber-500/30 shadow-xl space-y-3">
              <div className="flex justify-between items-center border-b border-slate-700/80 pb-3">
                <div>
                  <h3 className="font-extrabold text-amber-400 text-sm flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-400" /> Simulator
                    Takaran Bonus / THR Hari Raya
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Atur jatah apresiasi rupiah per sobekan cek untuk setiap
                    posisi pekerjaan.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    🧵 Penjahit (Rp/Cek)
                  </label>
                  <input
                    type="number"
                    value={thrRates["PENJAHIT"] || 1000}
                    onChange={(e) =>
                      setThrRates({
                        ...thrRates,
                        PENJAHIT: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono font-extrabold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    ✂️ Tukang Potong (Rp/Cek)
                  </label>
                  <input
                    type="number"
                    value={thrRates["TUKANG_POTONG"] || 500}
                    onChange={(e) =>
                      setThrRates({
                        ...thrRates,
                        TUKANG_POTONG: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono font-extrabold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    🪡 Bordir/Kancing (Rp/Cek)
                  </label>
                  <input
                    type="number"
                    value={thrRates["BORDIR"] || 500}
                    onChange={(e) =>
                      setThrRates({
                        ...thrRates,
                        BORDIR: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono font-extrabold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-semibold">
                    📦 Finishing/QC (Rp/Cek)
                  </label>
                  <input
                    type="number"
                    value={thrRates["FINISHING"] || 300}
                    onChange={(e) =>
                      setThrRates({
                        ...thrRates,
                        FINISHING: Number(e.target.value),
                      })
                    }
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-mono font-extrabold outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* TABEL REKAP PRODUKTIVITAS & HITUNGAN THR HARI RAYA */}
            <div className="bg-slate-800/90 backdrop-blur-md p-5 rounded-2xl border border-slate-700 shadow-xl space-y-4 text-xs">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Matriks
                Produktivitas & Takaran Uang THR Karyawan
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-700 text-[11px] text-slate-400 uppercase font-extrabold bg-slate-900/60">
                      <th className="p-3">Nama Karyawan</th>
                      <th className="p-3">Posisi</th>
                      <th className="p-3 text-center">Total Sobekan Cek</th>
                      <th className="p-3 text-center">Rata-Rata Mingguan</th>
                      <th className="p-3 text-right">Tarif Bonus / Cek</th>
                      <th className="p-3 text-right text-amber-400">
                        Takaran THR Disarankan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 font-semibold">
                    {employees.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="p-8 text-center text-slate-500 italic"
                        >
                          Belum ada data karyawan.
                        </td>
                      </tr>
                    ) : (
                      employees.map((emp) => {
                        const empTasks = tasks.filter(
                          (t) => t.employee_id === emp.id,
                        );
                        const totalCek = empTasks.reduce(
                          (sum, t) => sum + (Number(t.qty) || 0),
                          0,
                        );

                        const uniqueWeeks =
                          new Set(
                            empTasks.map((t) => t.created_at?.substring(0, 10)),
                          ).size || 1;
                        const avgPerWeek = (totalCek / uniqueWeeks).toFixed(1);

                        const ratePerUnit = thrRates[emp.role] || 500;
                        const totalThrCalculated = totalCek * ratePerUnit;

                        return (
                          <tr
                            key={emp.id}
                            className="hover:bg-slate-700/40 transition"
                          >
                            <td className="p-3 font-extrabold text-white">
                              {getEmployeeName(emp)}
                            </td>
                            <td className="p-3">
                              <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-300">
                                {emp.role}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono text-amber-400 font-extrabold text-sm">
                              {totalCek}{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                Cek
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono text-slate-300">
                              ~ {avgPerWeek}{" "}
                              <span className="text-[10px] text-slate-400 font-normal">
                                Cek/mgg
                              </span>
                            </td>
                            <td className="p-3 text-right font-mono text-slate-400">
                              Rp {ratePerUnit.toLocaleString("id-ID")}
                            </td>
                            <td className="p-3 text-right font-mono font-extrabold text-emerald-400 text-sm bg-emerald-950/20">
                              Rp {totalThrCalculated.toLocaleString("id-ID")}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: DATA MASTER KARYAWAN */}
        {activeTab === "KARYAWAN" && (
          <div className="space-y-4">
            <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-md flex justify-between items-center gap-3">
              <div className="relative w-full max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Cari nama karyawan, keahlian, atau posisi..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold outline-none focus:border-amber-500 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredEmployees.length === 0 ? (
                <div className="col-span-3 p-12 text-center bg-slate-800/60 backdrop-blur-md rounded-2xl border border-dashed border-slate-700 text-xs text-slate-400">
                  Belum ada data tim penjahit/karyawan yang dimasukkan.
                </div>
              ) : (
                filteredEmployees.map((emp) => {
                  const empTasks = tasks.filter(
                    (t) => t.employee_id === emp.id,
                  );
                  const totalCek = empTasks.reduce(
                    (sum, t) => sum + (Number(t.qty) || 0),
                    0,
                  );
                  const unpaidTotal = empTasks
                    .filter((t) => !t.is_paid)
                    .reduce((sum, t) => sum + (Number(t.total_wage) || 0), 0);

                  const currentEmpName = getEmployeeName(emp);

                  return (
                    <div
                      key={emp.id}
                      className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-4 border border-slate-700/80 shadow-lg space-y-3 hover:border-amber-500/60 transition"
                    >
                      <div className="flex justify-between items-start border-b border-slate-700/60 pb-2.5">
                        <div>
                          <span className="text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-md">
                            {emp.role}
                          </span>
                          <h3 className="font-extrabold text-white text-base mt-1">
                            {currentEmpName}
                          </h3>
                          <p className="text-[11px] text-slate-400">
                            Sistem: {emp.employee_type} • HP: {emp.phone || "-"}
                          </p>
                        </div>

                        <button
                          onClick={() =>
                            handleDeleteEmployee(emp.id, currentEmpName)
                          }
                          className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-lg transition"
                          title="Hapus Karyawan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-900/70 p-2.5 rounded-xl border border-slate-700/50 font-mono">
                        <div>
                          <span className="text-[9px] text-slate-400 font-sans block">
                            Total Cek:
                          </span>
                          <span className="font-bold text-amber-400 text-xs">
                            {totalCek} Sobekan
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-400 font-sans block">
                            Pending Gaji:
                          </span>
                          <span className="font-bold text-rose-400 text-xs">
                            Rp {unpaidTotal.toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH KARYAWAN BARU */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-700 text-slate-100">
            <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
              <h3 className="text-sm font-extrabold text-amber-400">
                Tambah Anggota Tim / Karyawan Baru
              </h3>
              <button
                onClick={() => setIsEmpModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleAddEmployee}
              className="p-5 space-y-4 text-xs"
            >
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nama Lengkap Karyawan *
                </label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  placeholder="Misal: Pak Ahmad Penjahit"
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-semibold text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Posisi / Keahlian Utama
                </label>
                <select
                  value={empRole}
                  onChange={(e) => setEmpRole(e.target.value)}
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-bold text-amber-400 outline-none focus:border-amber-500"
                >
                  <option value="PENJAHIT">🧵 Penjahit Seragam / PDL</option>
                  <option value="TUKANG_POTONG">
                    ✂️ Tukang Potong (Cutter)
                  </option>
                  <option value="BORDIR">
                    🪡 Operator Bordir / Lubang Kancing
                  </option>
                  <option value="FINISHING">📦 Finishing & QC / Setrika</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Sistem Penggajian
                </label>
                <select
                  value={empType}
                  onChange={(e) => setEmpType(e.target.value)}
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-bold text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="BORONGAN">Upah Borongan per Setel</option>
                  <option value="HARIAN">Gaji Harian / Bulanan</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  No. WhatsApp / HP
                </label>
                <input
                  type="text"
                  value={empPhone}
                  onChange={(e) => setEmpPhone(e.target.value)}
                  placeholder="0812xxxxxxxx"
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-semibold text-white outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEmp}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow"
                >
                  {isSubmittingEmp ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan Karyawan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INPUT SOBEKAN CEK MINGGUAN */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-700 text-slate-100">
            <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700">
              <h3 className="text-sm font-extrabold text-amber-400">
                Input Sobekan Cek Gaji Mingguan
              </h3>
              <button
                onClick={() => setIsTaskModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTask} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Pilih Penjahit / Karyawan *
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-bold text-amber-400 outline-none focus:border-amber-500"
                  required
                >
                  <option value="">-- Pilih Karyawan --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {getEmployeeName(emp)} ({emp.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Pilih Pesanan Instansi (Opsional)
                </label>
                <select
                  value={selectedOrderId}
                  onChange={(e) => handleSelectOrderForTask(e.target.value)}
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-bold text-slate-200 outline-none focus:border-amber-500"
                >
                  <option value="">-- Pekerjaan Umum / Manual --</option>
                  {availableOrders.map((ord) => (
                    <option key={ord.id} value={ord.id}>
                      {ord.members?.member_name} - {ord.item_type} (
                      {ord.members?.folders?.folder_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nama Pekerjaan / Deskripsi *
                </label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="Misal: Sobekan Cek Jahit PDL Polsek Wedung"
                  className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-semibold text-white outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Upah per Setel / Cek (Rp)
                  </label>
                  <input
                    type="number"
                    value={wagePerUnit}
                    onChange={(e) => setWagePerUnit(Number(e.target.value))}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-extrabold text-emerald-400 outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Jumlah Cek / Setel
                  </label>
                  <input
                    type="number"
                    value={taskQty}
                    onChange={(e) => setTaskQty(Number(e.target.value))}
                    min={1}
                    className="w-full p-2.5 border border-slate-700 rounded-xl bg-slate-950 font-bold text-white outline-none focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-700 font-mono flex justify-between items-center text-xs">
                <span className="text-slate-400 font-sans">
                  Total Upah Mingguan Ini:
                </span>
                <span className="font-extrabold text-emerald-400 text-sm">
                  Rp {(wagePerUnit * taskQty).toLocaleString("id-ID")}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow"
                >
                  {isSubmittingTask ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan Catatan Cek"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
