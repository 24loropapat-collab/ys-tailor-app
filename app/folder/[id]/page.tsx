"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Search,
  Ruler,
  ShoppingBag,
  Trash2,
  Edit,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  X,
  Printer,
  Tag,
  Scissors,
  CreditCard,
  Sliders,
  Banknote,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function DetailFolderPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params?.id as string;

  const [folderInfo, setFolderInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State Modal Tambah/Edit Member & Pesanan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Quick Payment / Tambah DP & Pelunasan
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedPayMember, setSelectedPayMember] = useState<any>(null);
  const [payAmountInput, setPayAmountInput] = useState("");
  const [payMethod, setPayMethod] = useState<"CASH" | "TRANSFER">("CASH");
  const [payNote, setPayNote] = useState("");
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // 1. IDENTITAS CUSTOMER
  const [memberName, setMemberName] = useState("");
  const [rankTitle, setRankTitle] = useState("");
  const [badgeName, setBadgeName] = useState("");
  const [patchBadges, setPatchBadges] = useState("");

  // 2. JENIS PESANAN & TIPE FIT (A/B/C)
  const [itemCode, setItemCode] = useState("");
  const [itemType, setItemType] = useState("PDL 1 Setel");
  const [fabricType, setFabricType] = useState("Ripstop Drill");
  const [fitType, setFitType] = useState<"A" | "B" | "C">("B");

  // 3. UKURAN & RIKWES ATASAN
  const [topPb, setTopPb] = useState("");
  const [topLb, setTopLb] = useState("");
  const [topPl, setTopPl] = useState("");
  const [topLlg, setTopLlg] = useState("");
  const [topLpgk, setTopLpgk] = useState("");
  const [topLd, setTopLd] = useState("");
  const [topLpt, setTopLpt] = useState("");
  const [topLpg, setTopLpg] = useState("");
  const [topKerahOpt, setTopKerahOpt] = useState("");
  const [topReq, setTopReq] = useState("");

  // 4. UKURAN & RIKWES BAWAHAN
  const [botPj, setBotPj] = useState("");
  const [botLp, setBotLp] = useState("");
  const [botLpg, setBotLpg] = useState("");
  const [botPesak, setBotPesak] = useState("");
  const [botPaha, setBotPaha] = useState("");
  const [botLutut, setBotLutut] = useState("");
  const [botKaki, setBotKaki] = useState("");
  const [botReq, setBotReq] = useState("");

  // 5. HARGA & PEMBAYARAN
  const [rawPriceInput, setRawPriceInput] = useState<string>("");
  const [downPaymentInput, setDownPaymentInput] = useState<string>("");

  const parsePriceInput = (input: string): number => {
    if (!input) return 0;
    try {
      const parts = input.split("+");
      return parts.reduce((acc, curr) => {
        const num = parseFloat(curr.replace(/[^\d.]/g, ""));
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    if (folderId) {
      fetchData();
    }
  }, [folderId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: folderData, error: folderErr } = await (
        supabase.from("folders") as any
      )
        .select("*")
        .eq("id", folderId)
        .single();
      if (folderErr) throw folderErr;
      setFolderInfo(folderData);

      const { data: memberData, error: memberErr } = await (
        supabase.from("members") as any
      )
        .select("*, order_items(*)")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false });
      if (memberErr) throw memberErr;
      setMembers(memberData || []);
    } catch (err: any) {
      console.error("Gagal memuat data folder:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetForm = () => {
    setEditingMemberId(null);
    setMemberName("");
    setRankTitle("");
    setBadgeName("");
    setPatchBadges("");
    setItemCode(`YS-${Math.floor(1000 + Math.random() * 9000)}`);
    setItemType("PDL 1 Setel");
    setFabricType("Ripstop Drill");
    setFitType("B");

    setTopPb("");
    setTopLb("");
    setTopPl("");
    setTopLlg("");
    setTopLpgk("");
    setTopLd("");
    setTopLpt("");
    setTopLpg("");
    setTopKerahOpt("");
    setTopReq("");
    setBotPj("");
    setBotLp("");
    setBotLpg("");
    setBotPesak("");
    setBotPaha("");
    setBotLutut("");
    setBotKaki("");
    setBotReq("");

    setRawPriceInput("");
    setDownPaymentInput("");
  };

  const handleOpenCreateModal = () => {
    handleResetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: any) => {
    setEditingMemberId(member.id);
    setMemberName(member.member_name || "");
    setRankTitle(member.rank_title || "");
    setBadgeName(member.badge_name || "");
    setPatchBadges(member.patch_badges || "");

    const order = member.order_items?.[0] || {};
    setItemCode(
      order.item_code || `YS-${Math.floor(1000 + Math.random() * 9000)}`,
    );
    setItemType(order.item_type || "PDL 1 Setel");
    setFabricType(order.fabric_type || "Ripstop Drill");
    setFitType(order.fit_type || "B");

    const size = member.sizes || {};
    setTopPb(size.top_pb || "");
    setTopLb(size.top_lb || "");
    setTopPl(size.top_pl || "");
    setTopLlg(size.top_llg || "");
    setTopLpgk(size.top_lpgk || "");
    setTopLd(size.top_ld || "");
    setTopLpt(size.top_lpt || "");
    setTopLpg(size.top_lpg || "");
    setTopKerahOpt(size.top_kerah_opt || "");
    setTopReq(size.top_req || "");
    setBotPj(size.bot_pj || "");
    setBotLp(size.bot_lp || "");
    setBotLpg(size.bot_lpg || "");
    setBotPesak(size.bot_pesak || "");
    setBotPaha(size.bot_paha || "");
    setBotLutut(size.bot_lutut || "");
    setBotKaki(size.bot_kaki || "");
    setBotReq(size.bot_req || "");

    setRawPriceInput(order.price ? String(order.price) : "");
    setDownPaymentInput(order.down_payment ? String(order.down_payment) : "");

    setIsModalOpen(true);
  };

  // HANDLER OPEN MODAL TAMBAH PEMBAYARAN / DP
  const handleOpenPayModal = (member: any) => {
    setSelectedPayMember(member);
    setPayAmountInput("");
    setPayNote("");
    setPayMethod("CASH");
    setIsPayModalOpen(true);
  };

  // HANDLER SUBMIT PEMBAYARAN / PELUNASAN BARU
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayMember) return;

    const addedAmount = parsePriceInput(payAmountInput);
    if (addedAmount <= 0) {
      alert("Masukkan nominal pembayaran yang valid!");
      return;
    }

    setIsSubmittingPay(true);
    try {
      const order = selectedPayMember.order_items?.[0];
      if (!order) {
        alert("Data pesanan anggota tidak ditemukan.");
        return;
      }

      const currentPrice = Number(order.price) || 0;
      const currentDp = Number(order.down_payment) || 0;
      const newTotalDp = currentDp + addedAmount;

      let newStatus = "BELUM_BAYAR";
      if (newTotalDp >= currentPrice && currentPrice > 0) {
        newStatus = "LUNAS";
      } else if (newTotalDp > 0) {
        newStatus = "DP";
      }

      // 1. Update order_items di Supabase
      const { error: ordErr } = await (supabase.from("order_items") as any)
        .update({
          down_payment: newTotalDp,
          payment_status: newStatus,
        })
        .eq("id", order.id);

      if (ordErr) throw ordErr;

      // 2. Opsi: Cetak Kwitansi Sobekan Pembayaran
      if (
        confirm(
          `Pembayaran Rp ${addedAmount.toLocaleString(
            "id-ID",
          )} berhasil dicatat!\nApakah kamu ingin mencetak Kwitansi Sobekan Nota?`,
        )
      ) {
        handlePrintReceipt(
          selectedPayMember,
          addedAmount,
          newTotalDp,
          newStatus,
        );
      }

      setIsPayModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert("Gagal mencatat pembayaran: " + err.message);
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName) return;

    setIsSubmitting(true);
    try {
      const calculatedTotalPrice = parsePriceInput(rawPriceInput);
      const calculatedDp = parsePriceInput(downPaymentInput);

      const sizePayload = {
        top_pb: topPb,
        top_lb: topLb,
        top_pl: topPl,
        top_llg: topLlg,
        top_lpgk: topLpgk,
        top_ld: topLd,
        top_lpt: topLpt,
        top_lpg: topLpg,
        top_kerah_opt: topKerahOpt,
        top_req: topReq,
        bot_pj: botPj,
        bot_lp: botLp,
        bot_lpg: botLpg,
        bot_pesak: botPesak,
        bot_paha: botPaha,
        bot_lutut: botLutut,
        bot_kaki: botKaki,
        bot_req: botReq,
      };

      let currentMemberId = editingMemberId;

      const memberPayload: any = {
        member_name: memberName,
        rank_title: rankTitle,
        badge_name: badgeName,
        patch_badges: patchBadges,
        sizes: sizePayload,
      };

      if (editingMemberId) {
        let { error: memErr } = await (supabase.from("members") as any)
          .update(memberPayload)
          .eq("id", editingMemberId);

        if (memErr) {
          if (memErr.message.includes("sizes")) delete memberPayload.sizes;
          if (memErr.message.includes("patch_badges"))
            delete memberPayload.patch_badges;

          const { error: retryErr } = await (supabase.from("members") as any)
            .update(memberPayload)
            .eq("id", editingMemberId);
          if (retryErr) throw retryErr;
        }
      } else {
        memberPayload.folder_id = folderId;
        let { data: newMem, error: memErr } = await (
          supabase.from("members") as any
        )
          .insert([memberPayload])
          .select()
          .single();

        if (memErr) {
          if (memErr.message.includes("sizes")) delete memberPayload.sizes;
          if (memErr.message.includes("patch_badges"))
            delete memberPayload.patch_badges;

          const { data: retryMem, error: retryErr } = await (
            supabase.from("members") as any
          )
            .insert([memberPayload])
            .select()
            .single();
          if (retryErr) throw retryErr;
          currentMemberId = retryMem.id;
        } else {
          currentMemberId = newMem.id;
        }
      }

      let paymentStatus = "BELUM_BAYAR";
      if (calculatedDp >= calculatedTotalPrice && calculatedTotalPrice > 0) {
        paymentStatus = "LUNAS";
      } else if (calculatedDp > 0) {
        paymentStatus = "DP";
      }

      const orderPayload: any = {
        member_id: currentMemberId,
        item_code: itemCode,
        item_type: itemType,
        fabric_type: fabricType,
        fit_type: fitType,
        price: calculatedTotalPrice,
        down_payment: calculatedDp,
        payment_status: paymentStatus,
      };

      if (editingMemberId) {
        const existingOrder = members.find((m) => m.id === editingMemberId)
          ?.order_items?.[0];
        if (existingOrder) {
          let { error: ordErr } = await (supabase.from("order_items") as any)
            .update(orderPayload)
            .eq("id", existingOrder.id);
          if (ordErr && ordErr.message.includes("fit_type")) {
            delete orderPayload.fit_type;
            await (supabase.from("order_items") as any)
              .update(orderPayload)
              .eq("id", existingOrder.id);
          }
        } else {
          let { error: ordErr } = await (
            supabase.from("order_items") as any
          ).insert([orderPayload]);
          if (ordErr && ordErr.message.includes("fit_type")) {
            delete orderPayload.fit_type;
            await (supabase.from("order_items") as any).insert([orderPayload]);
          }
        }
      } else {
        let { error: ordErr } = await (
          supabase.from("order_items") as any
        ).insert([orderPayload]);
        if (ordErr && ordErr.message.includes("fit_type")) {
          delete orderPayload.fit_type;
          await (supabase.from("order_items") as any).insert([orderPayload]);
        }
      }

      setIsModalOpen(false);
      handleResetForm();
      fetchData();
    } catch (err: any) {
      alert("Gagal menyimpan data pesanan: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Yakin ingin menghapus data anggota "${name}"?`)) return;

    try {
      await (supabase.from("members") as any).delete().eq("id", id);
      fetchData();
    } catch (err: any) {
      alert("Gagal menghapus data: " + err.message);
    }
  };

  // CETAK KWITANSI PEMBAYARAN
  const handlePrintReceipt = (
    member: any,
    addedAmount: number,
    newTotalDp: number,
    status: string,
  ) => {
    const order = member.order_items?.[0] || {};
    const totalPrice = Number(order.price) || 0;
    const sisa = totalPrice - newTotalDp;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>KWITANSI PEMBAYARAN - ${member.member_name}</title>
          <style>
            body { font-family: monospace, sans-serif; padding: 15px; color: #000; width: 80mm; margin: 0 auto; }
            .ticket { border: 2px dashed #000; padding: 10px; }
            .title { text-align: center; font-weight: bold; font-size: 14px; text-transform: uppercase; border-bottom: 2px solid #000; pb: 4px; mb: 6px; }
            .info { font-size: 11px; margin-bottom: 8px; border-bottom: 1px solid #000; padding-bottom: 6px; }
            .info div { margin-bottom: 3px; }
            .amount-box { background: #eee; border: 1px solid #000; padding: 6px; text-align: center; margin-bottom: 8px; }
            .amount-box .label { font-size: 10px; font-weight: bold; }
            .amount-box .val { font-size: 14px; font-weight: bold; }
            .summary { font-size: 11px; margin-bottom: 8px; }
            .summary div { display: flex; justify-content: space-between; margin-bottom: 2px; }
            .footer { font-size: 9px; text-align: center; border-top: 1px solid #000; pt: 4px; margin-top: 6px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="title">YS TAILOR KWITANSI</div>
            <div class="info">
              <div><strong>Instansi:</strong> ${folderInfo?.folder_name || "-"}</div>
              <div><strong>Nama:</strong> ${member.member_name} (${member.rank_title || "-"})</div>
              <div><strong>Pesanan:</strong> ${order.item_type || "-"}</div>
              <div><strong>Tanggal:</strong> ${new Date().toLocaleDateString("id-ID")}</div>
            </div>

            <div class="amount-box">
              <div class="label">SETORAN HARI INI:</div>
              <div class="val">Rp ${addedAmount.toLocaleString("id-ID")}</div>
            </div>

            <div class="summary">
              <div><span>Total Tagihan:</span> <strong>Rp ${totalPrice.toLocaleString("id-ID")}</strong></div>
              <div><span>Total Terbayar:</span> <strong>Rp ${newTotalDp.toLocaleString("id-ID")}</strong></div>
              <div><span>Sisa Pembayaran:</span> <strong>Rp ${sisa > 0 ? sisa.toLocaleString("id-ID") : 0}</strong></div>
              <div><span>Status:</span> <strong>${status}</strong></div>
            </div>

            <div class="footer">
              Terima kasih atas kepercayaan Anda!<br/>YS TAILOR • DEMAK
            </div>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintMember = (
    member: any,
    printTarget: "ATASAN" | "BAWAHAN" | "KEDUA",
  ) => {
    const order = member.order_items?.[0] || {};
    const size = member.sizes || {};
    const fit = order.fit_type || "B";

    const fitLabel =
      fit === "A"
        ? "JENIS A (Press Body / Slim Fit)"
        : fit === "B"
          ? "JENIS B (Pas Body Normal)"
          : "JENIS C (Comfort / Longgar)";

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlAtasan = `
      <div class="section">
        <div class="title">STRUK PRODUKSI (ATASAN)</div>
        <div class="fit-tag">POTONGAN: ${fitLabel}</div>
        <table class="info-table">
          <tr><td><strong>Instansi:</strong> ${folderInfo?.folder_name || "-"}</td></tr>
          <tr><td><strong>Nama:</strong> ${member.member_name} (${member.rank_title || "-"})</td></tr>
          <tr><td><strong>Nama Dada:</strong> ${member.badge_name || "-"}</td></tr>
          <tr><td><strong>Bet:</strong> ${member.patch_badges || "-"}</td></tr>
          <tr><td><strong>Model/Bahan:</strong><br/><span class="pre-text">${order.item_type || "-"}</span> / <span class="pre-text">${order.fabric_type || "-"}</span></td></tr>
        </table>

        <div style="font-weight:bold; font-size:11px; margin-bottom:2px;">UKURAN PAS BADAN ATASAN:</div>
        <div class="size-grid">
          <div>PB   : <strong>${size.top_pb || "-"}</strong></div>
          <div>LD   : <strong>${size.top_ld || "-"}</strong></div>
          <div>LB   : <strong>${size.top_lb || "-"}</strong></div>
          <div>LPT  : <strong>${size.top_lpt || "-"}</strong></div>
          <div>PL   : <strong>${size.top_pl || "-"}</strong></div>
          <div>LPg  : <strong>${size.top_lpg || "-"}</strong></div>
          <div>LLg  : <strong>${size.top_llg || "-"}</strong></div>
          <div>Kerah: <strong>${size.top_kerah_opt || "-"}</strong></div>
          <div>LPGK : <strong>${size.top_lpgk || "-"}</strong></div>
        </div>

        <div class="req-box">
          <strong>Rikwes / Variasi:</strong><br/>
          ${size.top_req || "- Tanpa Variasi -"}
        </div>

        <div class="block-container">
          <div class="block-box">Blok 4 Finishing</div>
          <div class="block-grid">
            <div class="block-box">3A L.Kancing</div>
            <div class="block-box">3B Kancing</div>
            <div class="block-box">3C Setrika</div>
          </div>
          <div class="block-box">Blok 2 Penjahit</div>
          <div class="block-box">Blok 1 Tukang Potong</div>
        </div>
      </div>
    `;

    const htmlBawahan = `
      <div class="section">
        <div class="title">STRUK PRODUKSI (BAWAHAN)</div>
        <div class="fit-tag">POTONGAN: ${fitLabel}</div>
        <table class="info-table">
          <tr><td><strong>Instansi:</strong> ${folderInfo?.folder_name || "-"}</td></tr>
          <tr><td><strong>Nama:</strong> ${member.member_name} (${member.rank_title || "-"})</td></tr>
          <tr><td><strong>Model/Bahan:</strong> Celana / <span class="pre-text">${order.fabric_type || "-"}</span></td></tr>
        </table>

        <div style="font-weight:bold; font-size:11px; margin-bottom:2px;">UKURAN PAS BADAN BAWAHAN:</div>
        <div class="size-grid">
          <div>Pj   : <strong>${size.bot_pj || "-"}</strong></div>
          <div>LPg  : <strong>${size.bot_lpg || "-"}</strong></div>
          <div>LP   : <strong>${size.bot_lp || "-"}</strong></div>
          <div>Pesak: <strong>${size.bot_pesak || "-"}</strong></div>
          <div>Paha : <strong>${size.bot_paha || "-"}</strong></div>
          <div>Lutut: <strong>${size.bot_lutut || "-"}</strong></div>
          <div>Kaki : <strong>${size.bot_kaki || "-"}</strong></div>
        </div>

        <div class="req-box">
          <strong>Rikwes / Variasi:</strong><br/>
          ${size.bot_req || "- Tanpa Variasi -"}
        </div>

        <div class="block-container">
          <div class="block-box">Blok 4 Finishing</div>
          <div class="block-grid">
            <div class="block-box">3A L.Kancing</div>
            <div class="block-box">3B Kancing</div>
            <div class="block-box">3C Setrika</div>
          </div>
          <div class="block-box">Blok 2 Penjahit</div>
          <div class="block-box">Blok 1 Tukang Potong</div>
        </div>
      </div>
    `;

    let finalHtmlContent = "";
    if (printTarget === "ATASAN") {
      finalHtmlContent = htmlAtasan;
    } else if (printTarget === "BAWAHAN") {
      finalHtmlContent = htmlBawahan;
    } else {
      finalHtmlContent = `${htmlAtasan} <div class="page-break"></div> ${htmlBawahan}`;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>STRUK PRODUKSI - ${member.member_name}</title>
          <style>
            body { font-family: monospace, sans-serif; padding: 15px; color: #000; width: 85mm; margin: 0 auto; }
            .section { border: 2px solid #000; padding: 8px; margin-bottom: 12px; }
            .title { text-align: center; font-weight: bold; font-size: 13px; text-transform: uppercase; border-bottom: 2px solid #000; padding-bottom: 4px; margin-bottom: 6px; }
            .fit-tag { text-align: center; background: #000; color: #fff; font-weight: bold; padding: 3px; font-size: 11px; margin-bottom: 8px; }
            .info-table { width: 100%; font-size: 11px; margin-bottom: 6px; border-collapse: collapse; }
            .info-table td { padding: 2px 0; vertical-align: top; }
            .size-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; border: 1px solid #000; padding: 6px; font-size: 11px; margin-bottom: 6px; }
            .req-box { border: 1px dashed #000; padding: 6px; font-size: 10px; margin-bottom: 6px; background: #fdfdfd; }
            .block-container { font-size: 10px; }
            .block-box { border: 1px solid #000; padding: 4px; text-align: center; font-weight: bold; margin-top: 3px; }
            .block-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-top: 3px; }
            .page-break { page-break-after: always; }
            .pre-text { white-space: pre-line; }
          </style>
        </head>
        <body>
          ${finalHtmlContent}
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredMembers = members.filter(
    (m) =>
      m.member_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.rank_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.badge_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col items-center justify-center text-amber-400 gap-2">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <p className="text-xs font-semibold">
          Memuat Data Instansi & Anggota...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 p-6 font-sans relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto space-y-6 relative z-10">
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
                📁 Folder Instansi: {folderInfo?.folder_name}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Pencatatan kolektif ukuran badan, pesanan baju, HPP modal, dan
                kasir SPJ instansi.
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4" /> Tambah Anggota / Pesanan Baru
          </button>
        </div>

        <div className="bg-slate-800/80 backdrop-blur-md p-4 rounded-2xl border border-slate-700 shadow-md flex justify-between items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Cari nama anggota, pangkat, atau nama dada..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-xs text-slate-200 font-semibold outline-none focus:border-amber-500 placeholder:text-slate-500"
            />
          </div>

          <span className="text-xs text-slate-400 font-bold whitespace-nowrap">
            Total Terdata:{" "}
            <strong className="text-amber-400 font-mono text-sm">
              {filteredMembers.length}
            </strong>{" "}
            Anggota
          </span>
        </div>

        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="p-12 text-center bg-slate-800/60 backdrop-blur-md rounded-2xl border border-dashed border-slate-700 text-xs text-slate-400">
              Belum ada data anggota / pemesan seragam di instansi ini.
            </div>
          ) : (
            filteredMembers.map((member) => {
              const order = member.order_items?.[0] || {};
              const priceNum = Number(order.price) || 0;
              const dpNum = Number(order.down_payment) || 0;
              const sisa = priceNum - dpNum;
              const isLunas =
                order.payment_status === "LUNAS" || (sisa <= 0 && priceNum > 0);
              const fit = order.fit_type || "B";
              const size = member.sizes || {};

              return (
                <div
                  key={member.id}
                  className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-5 border border-slate-700/80 shadow-xl space-y-4 hover:border-amber-500/60 transition"
                >
                  <div className="flex justify-between items-start border-b border-slate-700/70 pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-extrabold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-md">
                          {member.rank_title || "Anggota"}
                        </span>

                        <span
                          className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md border ${
                            fit === "A"
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                              : fit === "B"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                          }`}
                        >
                          {fit === "A"
                            ? "JENIS A (Press Body)"
                            : fit === "B"
                              ? "JENIS B (Pas Normal)"
                              : "JENIS C (Comfort)"}
                        </span>

                        {member.badge_name && (
                          <span className="text-xs font-bold text-slate-300 bg-slate-700/60 px-2 py-0.5 rounded-md">
                            Dada: {member.badge_name}
                          </span>
                        )}
                        {member.patch_badges && (
                          <span className="text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Tag className="w-3 h-3 text-emerald-400" /> Bet:{" "}
                            {member.patch_badges}
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-white text-lg">
                        {member.member_name}
                      </h3>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center rounded-xl bg-slate-900 border border-amber-500/40 p-1">
                        <button
                          onClick={() => handlePrintMember(member, "ATASAN")}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 text-[11px] font-extrabold rounded-lg transition flex items-center gap-1"
                          title="Cetak Struk Atasan Sahaja"
                        >
                          <Printer className="w-3 h-3" /> Atasan
                        </button>
                        <button
                          onClick={() => handlePrintMember(member, "BAWAHAN")}
                          className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-[11px] font-extrabold rounded-lg transition flex items-center gap-1 border-l border-slate-700"
                          title="Cetak Struk Bawahan Sahaja"
                        >
                          <Printer className="w-3 h-3" /> Bawahan
                        </button>
                        <button
                          onClick={() => handlePrintMember(member, "KEDUA")}
                          className="px-2 py-1 hover:bg-slate-800 text-slate-300 text-[11px] font-extrabold rounded-lg transition border-l border-slate-700"
                          title="Cetak Atasan & Bawahan Lengkap"
                        >
                          Lengkap
                        </button>
                      </div>

                      {/* INDIKATOR STATUS & TOMBOL BAYAR / TAMBAH DP */}
                      {isLunas ? (
                        <span className="flex items-center gap-1.5 text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-full font-extrabold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />{" "}
                          LUNAS
                        </span>
                      ) : (
                        <button
                          onClick={() => handleOpenPayModal(member)}
                          className="flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-slate-950 px-3 py-1.5 rounded-xl font-extrabold shadow-md transition"
                          title="Tambah DP atau Pelunasan"
                        >
                          <Banknote className="w-4 h-4" />
                          <span>+ Bayar / DP</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEditModal(member)}
                        className="p-2 bg-slate-700 hover:bg-slate-600 text-amber-400 rounded-xl transition shadow-sm"
                        title="Edit Data & Ukuran"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteMember(member.id, member.member_name)
                        }
                        className="p-2 bg-rose-950/60 hover:bg-rose-900 text-rose-400 rounded-xl transition shadow-sm"
                        title="Hapus Anggota"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                    <div className="md:col-span-4 bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60 space-y-3">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5 border-b border-slate-700/60 pb-1.5">
                        <ShoppingBag className="w-4 h-4" /> Detail Model & Sales
                      </span>
                      <div className="space-y-1">
                        <div className="text-slate-300 font-semibold">
                          Model:{" "}
                          <strong className="text-white whitespace-pre-line block mt-0.5">
                            {order.item_type || "-"}
                          </strong>
                        </div>
                        <div className="text-slate-300 font-semibold pt-1">
                          Bahan:{" "}
                          <strong className="text-white whitespace-pre-line block mt-0.5">
                            {order.fabric_type || "-"}
                          </strong>
                        </div>
                        <div className="pt-2 border-t border-slate-800 space-y-1">
                          <p className="text-slate-300 font-semibold">
                            Harga Total:{" "}
                            <strong className="text-emerald-400 font-mono">
                              Rp {priceNum.toLocaleString("id-ID")}
                            </strong>
                          </p>
                          <p className="text-slate-300 font-semibold">
                            Total Masuk:{" "}
                            <strong className="text-amber-400 font-mono">
                              Rp {dpNum.toLocaleString("id-ID")}
                            </strong>
                          </p>
                          {!isLunas && (
                            <p className="text-slate-300 font-semibold">
                              Sisa Tagihan:{" "}
                              <strong className="text-rose-400 font-mono">
                                Rp {sisa.toLocaleString("id-ID")}
                              </strong>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-4 bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                      <span className="font-bold text-amber-400 block border-b border-slate-700/60 pb-1.5 flex items-center gap-1.5">
                        <Ruler className="w-4 h-4" /> Ukuran Pas Badan Atasan
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-slate-300">
                        <div>
                          PB:{" "}
                          <strong className="text-white">
                            {size.top_pb || "-"}
                          </strong>
                        </div>
                        <div>
                          LB:{" "}
                          <strong className="text-white">
                            {size.top_lb || "-"}
                          </strong>
                        </div>
                        <div>
                          PL:{" "}
                          <strong className="text-white">
                            {size.top_pl || "-"}
                          </strong>
                        </div>
                        <div>
                          LLg:{" "}
                          <strong className="text-white">
                            {size.top_llg || "-"}
                          </strong>
                        </div>
                        <div>
                          LPGK:{" "}
                          <strong className="text-white">
                            {size.top_lpgk || "-"}
                          </strong>
                        </div>
                        <div>
                          LD:{" "}
                          <strong className="text-white">
                            {size.top_ld || "-"}
                          </strong>
                        </div>
                        <div>
                          LPT:{" "}
                          <strong className="text-white">
                            {size.top_lpt || "-"}
                          </strong>
                        </div>
                        <div>
                          LPg:{" "}
                          <strong className="text-white">
                            {size.top_lpg || "-"}
                          </strong>
                        </div>
                      </div>
                      {size.top_kerah_opt && (
                        <p className="text-[10px] text-amber-300 font-semibold bg-slate-950 p-1 rounded border border-slate-800">
                          Kerah: {size.top_kerah_opt} cm
                        </p>
                      )}
                      {size.top_req && (
                        <p className="text-[10px] text-amber-300 italic bg-amber-500/10 p-1 rounded border border-amber-500/20">
                          Rikwes: {size.top_req}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-4 bg-slate-900/70 p-3.5 rounded-xl border border-slate-700/60 space-y-2">
                      <span className="font-bold text-emerald-400 block border-b border-slate-700/60 pb-1.5 flex items-center gap-1.5">
                        <Scissors className="w-4 h-4" /> Ukuran Pas Badan
                        Bawahan
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 text-[10px] font-mono text-slate-300">
                        <div>
                          Pj:{" "}
                          <strong className="text-white">
                            {size.bot_pj || "-"}
                          </strong>
                        </div>
                        <div>
                          LPg:{" "}
                          <strong className="text-white">
                            {size.bot_lpg || "-"}
                          </strong>
                        </div>
                        <div>
                          LP:{" "}
                          <strong className="text-white">
                            {size.bot_lp || "-"}
                          </strong>
                        </div>
                        <div>
                          Psk:{" "}
                          <strong className="text-white">
                            {size.bot_pesak || "-"}
                          </strong>
                        </div>
                        <div>
                          Paha:{" "}
                          <strong className="text-white">
                            {size.bot_paha || "-"}
                          </strong>
                        </div>
                        <div>
                          Lutut:{" "}
                          <strong className="text-white">
                            {size.bot_lutut || "-"}
                          </strong>
                        </div>
                        <div>
                          Kaki:{" "}
                          <strong className="text-white">
                            {size.bot_kaki || "-"}
                          </strong>
                        </div>
                      </div>
                      {size.bot_req && (
                        <p className="text-[10px] text-emerald-300 italic bg-emerald-500/10 p-1 rounded border border-emerald-500/20">
                          Rikwes: {size.bot_req}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL QUICK PAYMENT / TAMBAH DP & PELUNASAN */}
      {isPayModalOpen && selectedPayMember && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-amber-500/30 text-slate-100 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3">
              <div>
                <h3 className="font-extrabold text-amber-400 text-base">
                  💵 Catat Pembayaran / Pelunasan
                </h3>
                <p className="text-xs text-slate-400">
                  Anggota: {selectedPayMember.member_name}
                </p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Tagihan:</span>
                  <strong className="text-emerald-400 font-mono">
                    Rp{" "}
                    {Number(
                      selectedPayMember.order_items?.[0]?.price || 0,
                    ).toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Sudah Dibayar:</span>
                  <strong className="text-amber-400 font-mono">
                    Rp{" "}
                    {Number(
                      selectedPayMember.order_items?.[0]?.down_payment || 0,
                    ).toLocaleString("id-ID")}
                  </strong>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1">
                  <span className="text-slate-300 font-bold">
                    Sisa Tagihan:
                  </span>
                  <strong className="text-rose-400 font-mono font-bold">
                    Rp{" "}
                    {(
                      Number(selectedPayMember.order_items?.[0]?.price || 0) -
                      Number(
                        selectedPayMember.order_items?.[0]?.down_payment || 0,
                      )
                    ).toLocaleString("id-ID")}
                  </strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-300 block mb-1">
                  Nominal Pembayaran Masuk (Rp) *
                </label>
                <input
                  type="text"
                  required
                  value={payAmountInput}
                  onChange={(e) => setPayAmountInput(e.target.value)}
                  placeholder="Contoh: 100000"
                  className="w-full p-2.5 border border-amber-500/50 rounded-xl bg-slate-950 font-extrabold text-amber-400 text-sm outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Metode Pembayaran
                  </label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as any)}
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-medium"
                  >
                    <option value="CASH">💵 Tunai / Cash</option>
                    <option value="TRANSFER">💳 Transfer Bank</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Catatan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                    placeholder="Ket DP ke-2, dll."
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-700 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPay}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl shadow transition flex items-center gap-2"
                >
                  {isSubmittingPay && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  Simpan Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL FORM INPUT ANGCOTA / PESANAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-3xl w-full my-8 overflow-hidden shadow-2xl border border-slate-700 text-slate-100 max-h-[90vh] flex flex-col">
            <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700 shrink-0">
              <div>
                <h3 className="text-sm font-extrabold text-amber-400">
                  {editingMemberId
                    ? "Edit Data Anggota & Pesanan"
                    : "Tambah Anggota & Pesanan Seragam Baru"}
                </h3>
                <p className="text-xs text-slate-400">
                  Folder: {folderInfo?.folder_name}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmitForm}
              className="p-5 space-y-4 overflow-y-auto text-xs"
            >
              {/* TAHAP 1. IDENTITAS CUSTOMER */}
              <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <span className="font-extrabold text-amber-400 block border-b border-slate-700 pb-1 text-xs">
                  👤 1. Identitas Customer
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Nama Lengkap *
                    </label>
                    <input
                      type="text"
                      value={memberName}
                      onChange={(e) => setMemberName(e.target.value)}
                      placeholder="Nama Lengkap"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-semibold text-white outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Pangkat / Jabatan
                    </label>
                    <input
                      type="text"
                      value={rankTitle}
                      onChange={(e) => setRankTitle(e.target.value)}
                      placeholder="Pangkat / Jabatan"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-semibold text-slate-200 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Nama Dada (Bordir)
                    </label>
                    <input
                      type="text"
                      value={badgeName}
                      onChange={(e) => setBadgeName(e.target.value)}
                      placeholder="Nama Dada"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-semibold text-slate-200 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Jenis Bet yang Dibutuhkan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={patchBadges}
                    onChange={(e) => setPatchBadges(e.target.value)}
                    placeholder="Jenis Bet"
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 font-semibold text-slate-200 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* TAHAP 2. JENIS PESANAN & TIPE POTONGAN */}
              <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <span className="font-extrabold text-amber-400 block border-b border-slate-700 pb-1 text-xs flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-amber-400" /> 2. Jenis
                  Pesanan & Tipe Potongan
                </span>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Pilih Tipe Kelonggaran Baju (Jenis Fit) *
                  </label>
                  <select
                    value={fitType}
                    onChange={(e) =>
                      setFitType(e.target.value as "A" | "B" | "C")
                    }
                    className="w-full p-2.5 border border-amber-500/50 rounded-xl bg-slate-950 font-bold text-amber-400 outline-none focus:border-amber-500"
                  >
                    <option value="A">Jenis A (Press Body / Slim Fit)</option>
                    <option value="B">Jenis B (Pas Body Normal)</option>
                    <option value="C">Jenis C (Comfort / Longgar)</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Model Pakaian *
                    </label>
                    <textarea
                      rows={2}
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value)}
                      placeholder="Model Pakaian"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-semibold outline-none focus:border-amber-500 resize-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Bahan Kain
                    </label>
                    <textarea
                      rows={2}
                      value={fabricType}
                      onChange={(e) => setFabricType(e.target.value)}
                      placeholder="Bahan Kain"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white font-semibold outline-none focus:border-amber-500 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* TAHAP 3. UKURAN & RIKWES ATASAN */}
              <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center border-b border-slate-700 pb-1">
                  <span className="font-extrabold text-amber-400 text-xs">
                    🧵 3. Ukuran Pas Badan & Rikwes ATASAN
                  </span>
                  <span className="text-[10px] text-slate-400 italic">
                    *Isi angka pengukuran asli pas badan
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-mono">
                  <div>
                    <label className="text-slate-300 font-medium block mb-0.5">
                      PB (Panjang Baju)
                    </label>
                    <input
                      type="text"
                      value={topPb}
                      onChange={(e) => setTopPb(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-0.5">
                      LB (Lebar Bahu)
                    </label>
                    <input
                      type="text"
                      value={topLb}
                      onChange={(e) => setTopLb(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-0.5">
                      PL (Panjang Lengan)
                    </label>
                    <input
                      type="text"
                      value={topPl}
                      onChange={(e) => setTopPl(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-0.5">
                      LLg (Lingkar Lengan)
                    </label>
                    <input
                      type="text"
                      value={topLlg}
                      onChange={(e) => setTopLlg(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-0.5">
                      LPGK (Pergelangan)
                    </label>
                    <input
                      type="text"
                      value={topLpgk}
                      onChange={(e) => setTopLpgk(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-0.5">
                      LD (Pas Badan)
                    </label>
                    <input
                      type="text"
                      value={topLd}
                      onChange={(e) => setTopLd(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-0.5">
                      LPT (Pas Badan)
                    </label>
                    <input
                      type="text"
                      value={topLpt}
                      onChange={(e) => setTopLpt(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-medium block mb-0.5">
                      LPg (Pas Badan)
                    </label>
                    <input
                      type="text"
                      value={topLpg}
                      onChange={(e) => setTopLpg(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/50">
                  <div className="w-full md:w-1/2">
                    <label className="text-amber-400 font-bold block mb-1">
                      Ukuran Kerah / Leher (Opsional)
                    </label>
                    <input
                      type="text"
                      value={topKerahOpt}
                      onChange={(e) => setTopKerahOpt(e.target.value)}
                      placeholder="Ukuran Kerah"
                      className="w-full p-2 border border-amber-500/40 rounded-lg bg-slate-950 text-amber-300 font-bold outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Rikwes / Variasi Atasan
                  </label>
                  <input
                    type="text"
                    value={topReq}
                    onChange={(e) => setTopReq(e.target.value)}
                    placeholder="Rikwes / Variasi Atasan"
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-amber-300 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* TAHAP 4. UKURAN & RIKWES BAWAHAN */}
              <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <span className="font-extrabold text-emerald-400 block border-b border-slate-700 pb-1 text-xs">
                  ✂️ 4. Ukuran Pas Badan & Rikwes BAWAHAN
                </span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-mono">
                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      Pj (Panjang Celana)
                    </label>
                    <input
                      type="text"
                      value={botPj}
                      onChange={(e) => setBotPj(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      LP (Pinggang Pas)
                    </label>
                    <input
                      type="text"
                      value={botLp}
                      onChange={(e) => setBotLp(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      LPg (Pinggul Pas)
                    </label>
                    <input
                      type="text"
                      value={botLpg}
                      onChange={(e) => setBotLpg(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Pesak</label>
                    <input
                      type="text"
                      value={botPesak}
                      onChange={(e) => setBotPesak(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">
                      Paha Pas
                    </label>
                    <input
                      type="text"
                      value={botPaha}
                      onChange={(e) => setBotPaha(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Lutut</label>
                    <input
                      type="text"
                      value={botLutut}
                      onChange={(e) => setBotLutut(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-0.5">Kaki</label>
                    <input
                      type="text"
                      value={botKaki}
                      onChange={(e) => setBotKaki(e.target.value)}
                      placeholder="cm"
                      className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-white outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-bold text-slate-300 block mb-1">
                    Rikwes / Variasi Bawahan
                  </label>
                  <input
                    type="text"
                    value={botReq}
                    onChange={(e) => setBotReq(e.target.value)}
                    placeholder="Rikwes / Variasi Bawahan"
                    className="w-full p-2 border border-slate-700 rounded-lg bg-slate-950 text-emerald-300 outline-none"
                  />
                </div>
              </div>

              {/* TAHAP 5. HARGA & PEMBAYARAN */}
              <div className="space-y-3 bg-slate-800/60 p-4 rounded-xl border border-slate-700">
                <span className="font-extrabold text-amber-400 block border-b border-slate-700 pb-1 text-xs flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-400" /> 5. Harga &
                  Pembayaran
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="font-bold text-slate-300 block">
                        Harga (Rp)
                      </label>
                      {rawPriceInput.includes("+") && (
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">
                          Total: Rp{" "}
                          {parsePriceInput(rawPriceInput).toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={rawPriceInput}
                      onChange={(e) => setRawPriceInput(e.target.value)}
                      placeholder="Masukkan Harga"
                      className="w-full p-2.5 border border-slate-700 rounded-lg bg-slate-950 text-emerald-400 font-extrabold text-sm outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-300 block mb-1">
                      Uang Muka / DP (Rp)
                    </label>
                    <input
                      type="text"
                      value={downPaymentInput}
                      onChange={(e) => setDownPaymentInput(e.target.value)}
                      placeholder="Masukkan DP"
                      className="w-full p-2.5 border border-slate-700 rounded-lg bg-slate-950 text-amber-400 font-extrabold text-sm outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* FOOTER MODAL */}
              <div className="pt-2 flex justify-end gap-2 border-t border-slate-700 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow transition flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingMemberId
                    ? "Simpan Perubahan"
                    : "Simpan Anggota & Pesanan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
