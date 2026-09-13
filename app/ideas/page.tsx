"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

// Inisialisasi Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Idea {
  id: string;
  title: string;
  description: string;
  category: "App Feature" | "Offline Tailor" | "Marketing" | "Other";
  priority: "Low" | "Medium" | "High";
  status: "Idea" | "Planned" | "Done";
  created_at: string;
}

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<
    "App Feature" | "Offline Tailor" | "Marketing" | "Other"
  >("App Feature");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">("Medium");

  useEffect(() => {
    fetchIdeas();
  }, []);

  async function fetchIdeas() {
    setLoading(true);
    const { data, error } = await supabase
      .from("ideas")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setIdeas(data as Idea[]);
    }
    setLoading(false);
  }

  async function handleAddIdea(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const { error } = await supabase
      .from("ideas")
      .insert([{ title, description, category, priority, status: "Idea" }]);

    if (!error) {
      setTitle("");
      setDescription("");
      fetchIdeas();
    }
  }

  async function handleUpdateStatus(
    id: string,
    newStatus: "Idea" | "Planned" | "Done",
  ) {
    const { error } = await supabase
      .from("ideas")
      .update({ status: newStatus })
      .eq("id", id);

    if (!error) fetchIdeas();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto min-h-screen bg-slate-900 text-white font-sans">
      {/* Tombol Navigasi Kembali */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-amber-400 text-sm mb-6 transition font-medium"
      >
        ← Kembali ke Dashboard Utama
      </Link>

      <h1 className="text-2xl font-bold mb-1 text-amber-400">
        💡 Idea Vault & Wishlist
      </h1>
      <p className="text-slate-400 text-sm mb-6">
        Simpan ide operasional & fitur aplikasi YS Tailor di sini.
      </p>

      {/* Form Tambah Ide */}
      <form
        onSubmit={handleAddIdea}
        className="bg-slate-800 p-4 rounded-xl mb-8 border border-slate-700 space-y-3"
      >
        <input
          type="text"
          placeholder="Judul Ide (misal: Notifikasi WA Otomatis)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
          required
        />
        <textarea
          placeholder="Detail singkat ide/catatan tambahan..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-500"
          rows={2}
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Kategori
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
            >
              <option value="App Feature">📱 Fitur Aplikasi</option>
              <option value="Offline Tailor">🧵 Operasional Tailor</option>
              <option value="Marketing">📣 Pemasaran / Brand</option>
              <option value="Other">💡 Lainnya</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">
              Prioritas
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm"
            >
              <option value="Low">🟢 Rendah</option>
              <option value="Medium">🟡 Sedang</option>
              <option value="High">🔴 Tinggi</option>
            </select>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition"
        >
          + Simpan Ke Idea Vault
        </button>
      </form>

      {/* Daftar Ide */}
      {loading ? (
        <p className="text-slate-400 text-center">Memuat daftar ide...</p>
      ) : ideas.length === 0 ? (
        <p className="text-slate-500 text-center text-sm">
          Belum ada ide tersimpan. Yuk catat ide pertamamu!
        </p>
      ) : (
        <div className="space-y-3">
          {ideas.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex justify-between items-start gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-slate-700 text-amber-400 font-medium">
                    {item.category}
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      item.priority === "High"
                        ? "bg-red-900/50 text-red-400"
                        : item.priority === "Medium"
                          ? "bg-yellow-900/50 text-yellow-400"
                          : "bg-green-900/50 text-green-400"
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <h3 className="font-semibold text-white">{item.title}</h3>
                {item.description && (
                  <p className="text-slate-400 text-sm mt-1">
                    {item.description}
                  </p>
                )}
              </div>

              <select
                value={item.status}
                onChange={(e) =>
                  handleUpdateStatus(item.id, e.target.value as any)
                }
                className="p-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white"
              >
                <option value="Idea">💡 Draft Ide</option>
                <option value="Planned">📌 Direncanakan</option>
                <option value="Done">✅ Terwujud</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
