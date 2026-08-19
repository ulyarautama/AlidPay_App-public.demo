"use client";

import {
  AlertTriangle,
  ArrowUp,
  Ban,
  Banknote,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Headphones,
  Mail,
  MessageSquareText,
  Search,
  ShieldCheck,
  Star,
  Target,
  UserPlus,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type StaffStatus = "active" | "inactive" | "on_leave";
type EmploymentType = "employee" | "freelancer";

type SupportStaff = {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: EmploymentType;
  status: StaffStatus;
  specialty: string;
  activeCases: number;
  maxCases: number;
  resolvedCases: number;
  ratePerCase: number;
  pendingPayout: number;
  rating: number;
  sla: number;
  joinedAt: string;
  lastActive: string;
};

const initialSupportStaff: SupportStaff[] = [
  {
    id: "CS-0018",
    name: "Nadia Putri",
    email: "nadia@support.alidpay.com",
    phone: "+62 812-9054-1120",
    type: "employee",
    status: "active",
    specialty: "Produk digital & akun",
    activeCases: 4,
    maxCases: 8,
    resolvedCases: 126,
    ratePerCase: 18000,
    pendingPayout: 324000,
    rating: 4.9,
    sla: 96,
    joinedAt: "14 Jan 2026",
    lastActive: "Online sekarang",
  },
  {
    id: "CS-0024",
    name: "Adit Pranata",
    email: "adit.freelance@alidpay.com",
    phone: "+62 857-2291-0041",
    type: "freelancer",
    status: "active",
    specialty: "Barang fisik & pengiriman",
    activeCases: 7,
    maxCases: 10,
    resolvedCases: 89,
    ratePerCase: 25000,
    pendingPayout: 475000,
    rating: 4.8,
    sla: 91,
    joinedAt: "2 Mar 2026",
    lastActive: "3 menit lalu",
  },
  {
    id: "CS-0031",
    name: "Salma Anindya",
    email: "salma.freelance@alidpay.com",
    phone: "+62 813-7712-9503",
    type: "freelancer",
    status: "active",
    specialty: "Jasa kreatif & milestone",
    activeCases: 2,
    maxCases: 6,
    resolvedCases: 64,
    ratePerCase: 22000,
    pendingPayout: 264000,
    rating: 4.7,
    sla: 94,
    joinedAt: "18 Apr 2026",
    lastActive: "11 menit lalu",
  },
  {
    id: "CS-0012",
    name: "Bima Saputra",
    email: "bima@support.alidpay.com",
    phone: "+62 821-3901-7288",
    type: "employee",
    status: "on_leave",
    specialty: "Fraud & pembayaran",
    activeCases: 0,
    maxCases: 8,
    resolvedCases: 173,
    ratePerCase: 20000,
    pendingPayout: 180000,
    rating: 4.9,
    sla: 98,
    joinedAt: "9 Nov 2025",
    lastActive: "2 hari lalu",
  },
  {
    id: "CS-0038",
    name: "Rafi Maulana",
    email: "rafi.freelance@alidpay.com",
    phone: "+62 895-6672-1304",
    type: "freelancer",
    status: "inactive",
    specialty: "General dispute",
    activeCases: 0,
    maxCases: 5,
    resolvedCases: 31,
    ratePerCase: 20000,
    pendingPayout: 0,
    rating: 4.5,
    sla: 88,
    joinedAt: "27 Mei 2026",
    lastActive: "8 hari lalu",
  },
];

function PeopleTabs({
  active,
  onChange,
}: {
  active: "customers" | "support";
  onChange: (view: "customers" | "support") => void;
}) {
  return (
    <div className="mb-7 inline-flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
      <button
        onClick={() => onChange("customers")}
        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
          active === "customers"
            ? "bg-[#6B1E2C] text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        <Users size={15} />
        Buyer & Seller
      </button>

      <button
        onClick={() => onChange("support")}
        className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition ${
          active === "support"
            ? "bg-[#6B1E2C] text-white shadow-sm"
            : "text-slate-500 hover:bg-slate-50"
        }`}
      >
        <Headphones size={15} />
        Dispute Team
      </button>
    </div>
  );
}

function StaffStatusBadge({ status }: { status: StaffStatus }) {
  const config = {
    active: {
      label: "Active",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
      dot: "bg-emerald-500",
    },
    inactive: {
      label: "Inactive",
      className: "bg-slate-100 text-slate-600 ring-slate-200",
      dot: "bg-slate-400",
    },
    on_leave: {
      label: "On leave",
      className: "bg-amber-50 text-amber-700 ring-amber-100",
      dot: "bg-amber-500",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function DisputeTeamPage() {
  const router = useRouter();

  const [team, setTeam] = useState(initialSupportStaff);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"all" | EmploymentType>("all");
  const [status, setStatus] = useState<"all" | StaffStatus>("all");
  const [selectedStaff, setSelectedStaff] = useState<SupportStaff | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  const filteredTeam = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return team.filter((staff) => {
      const matchesSearch =
        staff.name.toLowerCase().includes(keyword) ||
        staff.email.toLowerCase().includes(keyword) ||
        staff.id.toLowerCase().includes(keyword) ||
        staff.specialty.toLowerCase().includes(keyword);
      const matchesType = type === "all" || staff.type === type;
      const matchesStatus = status === "all" || staff.status === status;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [search, status, team, type]);

  const activeStaff = team.filter((staff) => staff.status === "active").length;
  const activeCases = team.reduce(
    (total, staff) => total + staff.activeCases,
    0,
  );
  const resolvedCases = team.reduce(
    (total, staff) => total + staff.resolvedCases,
    0,
  );
  const pendingPayout = team.reduce(
    (total, staff) => total + staff.pendingPayout,
    0,
  );

  function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  }

  function updateStaff(staffId: string, update: Partial<SupportStaff>) {
    setTeam((current) =>
      current.map((staff) =>
        staff.id === staffId ? { ...staff, ...update } : staff,
      ),
    );
    setSelectedStaff((current) =>
      current?.id === staffId ? { ...current, ...update } : current,
    );
  }

  function handleInvite(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const staffType = form.get("type") as EmploymentType;
    const newStaff: SupportStaff = {
      id: `CS-${String(team.length + 40).padStart(4, "0")}`,
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone") || "Belum diisi"),
      type: staffType,
      status: "active",
      specialty: String(form.get("specialty")),
      activeCases: 0,
      maxCases: Number(form.get("maxCases")),
      resolvedCases: 0,
      ratePerCase: Number(form.get("ratePerCase")),
      pendingPayout: 0,
      rating: 0,
      sla: 0,
      joinedAt: "18 Agu 2026",
      lastActive: "Baru diundang",
    };

    setTeam((current) => [newStaff, ...current]);
    setShowInvite(false);
  }

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#172033]">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1500px] items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6B1E2C] text-white shadow-sm">
              <ShieldCheck size={21} />
            </div>
            <div>
              <h1 className="text-[15px] font-extrabold tracking-tight">
                AlidPay
              </h1>
              <p className="text-[11px] font-medium text-slate-400">
                People Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50">
              <BellIcon />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>
            <div className="hidden items-center gap-3 border-l border-slate-200 pl-4 sm:flex">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2E7E9] text-sm font-bold text-[#6B1E2C]">
                A
              </div>
              <div className="leading-tight">
                <p className="text-xs font-bold">Administrator</p>
                <p className="text-[10px] text-slate-400">AlidPay Team</p>
              </div>
              <ChevronDown size={15} className="text-slate-400" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] px-6 py-8 lg:px-8">
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={13} />
          <span>Users</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#6B1E2C]">Dispute Team</span>
        </div>

        <PeopleTabs
          active="support"
          onChange={(view) => {
            if (view === "customers") {
              router.push("/dashboard/users");
            }
          }}
        />

        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-[#F2E7E9] px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6B1E2C]">
              <Headphones size={13} />
              Dispute Operations
            </div>
            <h2 className="text-3xl font-black tracking-tight">
              Customer Service Team
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Kelola pegawai dan freelancer penangan dispute, kapasitas kasus,
              performa SLA, serta fee yang dibayarkan per transaksi selesai.
            </p>
          </div>

          <button
            onClick={() => setShowInvite(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6B1E2C] px-5 text-sm font-bold text-white shadow-lg shadow-[#6B1E2C]/15 transition hover:-translate-y-0.5 hover:bg-[#581824]"
          >
            <UserPlus size={16} />
            Tambah anggota
          </button>
        </div>

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Headphones size={19} />}
            iconClass="bg-[#F2E7E9] text-[#6B1E2C]"
            label="Tim Aktif"
            value={`${activeStaff} anggota`}
            change={`${team.length} total`}
            description="Siap menerima dispute baru"
          />
          <StatCard
            icon={<MessageSquareText size={19} />}
            iconClass="bg-amber-50 text-amber-600"
            label="Kasus Ditangani"
            value={activeCases.toString()}
            change="Live workload"
            description="Dispute yang sedang berjalan"
          />
          <StatCard
            icon={<CheckCircle2 size={19} />}
            iconClass="bg-emerald-50 text-emerald-600"
            label="Kasus Selesai"
            value={resolvedCases.toString()}
            change="+12% bulan ini"
            changeUp
            description="Akumulasi penyelesaian tim"
          />
          <StatCard
            icon={<Banknote size={19} />}
            iconClass="bg-blue-50 text-blue-600"
            label="Pending Payout"
            value={formatRupiah(pendingPayout)}
            change="Per resolved case"
            description="Fee yang belum dibayarkan"
          />
        </section>

        <section className="mb-8 grid gap-4 xl:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-slate-200 bg-[#172033] p-6 text-white shadow-sm">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                  Skema kompensasi
                </p>
                <h3 className="mt-2 text-lg font-black">
                  Bayar hanya untuk kasus yang selesai
                </h3>
                <p className="mt-2 max-w-xl text-xs leading-5 text-white/60">
                  Fee masuk ke pending payout setelah dispute berstatus resolved
                  dan hasilnya lolos review admin. Kasus batal tidak dihitung.
                </p>
              </div>
              <div className="grid shrink-0 grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-[9px] uppercase text-white/50">Employee</p>
                  <p className="mt-1 text-sm font-black">Rp18–20k</p>
                </div>
                <div className="rounded-xl bg-white/10 px-4 py-3">
                  <p className="text-[9px] uppercase text-white/50">
                    Freelancer
                  </p>
                  <p className="mt-1 text-sm font-black">Rp20–25k</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                  Team target
                </p>
                <p className="mt-2 text-sm font-black">SLA resolution ≥ 90%</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Target size={20} />
              </div>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[94%] rounded-full bg-emerald-500" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
              <span>Rata-rata tim</span>
              <span className="text-emerald-600">94% on time</span>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-base font-extrabold">
                  Anggota dispute team
                </h3>
                <p className="mt-1 text-xs text-slate-400">
                  Menampilkan {filteredTeam.length} dari {team.length} anggota
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Cari anggota..."
                    className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs font-medium outline-none transition placeholder:text-slate-400 focus:border-[#6B1E2C] focus:bg-white sm:w-[230px]"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                <div className="relative">
                  <select
                    value={type}
                    onChange={(event) =>
                      setType(event.target.value as "all" | EmploymentType)
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                  >
                    <option value="all">Semua tipe</option>
                    <option value="employee">Pegawai</option>
                    <option value="freelancer">Freelancer</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                <div className="relative">
                  <select
                    value={status}
                    onChange={(event) =>
                      setStatus(event.target.value as "all" | StaffStatus)
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                  >
                    <option value="all">Semua status</option>
                    <option value="active">Active</option>
                    <option value="on_leave">On leave</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1180px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <TableHead>Anggota</TableHead>
                  <TableHead>Tipe & spesialisasi</TableHead>
                  <TableHead>Workload</TableHead>
                  <TableHead>Resolved</TableHead>
                  <TableHead>Fee / kasus</TableHead>
                  <TableHead>Pending payout</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead align="right">Action</TableHead>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeam.map((staff) => {
                  const workload = Math.round(
                    (staff.activeCases / staff.maxCases) * 100,
                  );

                  return (
                    <tr
                      key={staff.id}
                      className="transition hover:bg-[#FCFAFA]"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2E7E9] text-xs font-black text-[#6B1E2C]">
                            {staff.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </div>
                          <div>
                            <p className="text-xs font-extrabold">
                              {staff.name}
                            </p>
                            <p className="mt-1 font-mono text-[9px] text-slate-400">
                              {staff.id}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {staff.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${
                            staff.type === "employee"
                              ? "bg-blue-50 text-blue-700 ring-blue-100"
                              : "bg-purple-50 text-purple-700 ring-purple-100"
                          }`}
                        >
                          {staff.type === "employee" ? "Pegawai" : "Freelancer"}
                        </span>
                        <p className="mt-2 text-[10px] font-medium text-slate-500">
                          {staff.specialty}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-bold text-slate-700">
                            {staff.activeCases}/{staff.maxCases} kasus
                          </span>
                          <span className="text-slate-400">{workload}%</span>
                        </div>
                        <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${
                              workload >= 80
                                ? "bg-red-500"
                                : workload >= 60
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                            }`}
                            style={{ width: `${workload}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-extrabold text-slate-700">
                          {staff.resolvedCases}
                        </p>
                        <p className="mt-1 text-[9px] text-slate-400">
                          lifetime cases
                        </p>
                      </td>
                      <td className="px-6 py-5 text-xs font-extrabold text-slate-700">
                        {formatRupiah(staff.ratePerCase)}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs font-extrabold text-[#6B1E2C]">
                          {formatRupiah(staff.pendingPayout)}
                        </p>
                        <p className="mt-1 text-[9px] text-slate-400">
                          next: 25 Agu
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1 text-xs font-extrabold text-slate-700">
                          <Star
                            size={12}
                            className="fill-amber-400 text-amber-400"
                          />
                          {staff.rating || "—"}
                        </div>
                        <p className="mt-1 text-[9px] text-emerald-600">
                          {staff.sla ? `${staff.sla}% SLA` : "Belum ada data"}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <StaffStatusBadge status={staff.status} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => setSelectedStaff(staff)}
                          className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-600 transition hover:border-[#6B1E2C]/20 hover:bg-[#FDF7F8] hover:text-[#6B1E2C]"
                        >
                          Manage
                          <ChevronRight size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredTeam.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Search size={20} />
                      </div>
                      <p className="mt-4 text-sm font-bold">
                        Anggota tidak ditemukan
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Coba ubah pencarian atau filter tim.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {selectedStaff && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            aria-label="Tutup detail anggota"
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            onClick={() => setSelectedStaff(null)}
          />
          <aside className="relative h-full w-full max-w-[560px] overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="font-mono text-[10px] font-bold text-[#6B1E2C]">
                  {selectedStaff.id}
                </p>
                <h3 className="mt-1 text-lg font-black">Manage team member</h3>
              </div>
              <button
                onClick={() => setSelectedStaff(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#6B1E2C] text-base font-black text-white">
                    {selectedStaff.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <h4 className="text-base font-black">
                          {selectedStaff.name}
                        </h4>
                        <p className="mt-1 text-[10px] text-slate-400">
                          {selectedStaff.specialty}
                        </p>
                      </div>
                      <StaffStatusBadge status={selectedStaff.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                      <span className="flex items-center gap-2">
                        <Mail size={12} /> {selectedStaff.email}
                      </span>
                      <span className="flex items-center gap-2">
                        <CalendarDays size={12} /> Sejak{" "}
                        {selectedStaff.joinedAt}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <DetailStat
                  icon={<MessageSquareText size={15} />}
                  label="Active workload"
                  value={`${selectedStaff.activeCases}/${selectedStaff.maxCases} kasus`}
                />
                <DetailStat
                  icon={<CheckCircle2 size={15} />}
                  label="Resolved"
                  value={`${selectedStaff.resolvedCases} kasus`}
                />
                <DetailStat
                  icon={<Banknote size={15} />}
                  label="Pending payout"
                  value={formatRupiah(selectedStaff.pendingPayout)}
                />
                <DetailStat
                  icon={<Star size={15} />}
                  label="Quality & SLA"
                  value={`${selectedStaff.rating || "—"} · ${selectedStaff.sla || 0}%`}
                />
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-extrabold">Payment settings</p>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">
                    Per resolved case
                  </span>
                </div>
                <div className="rounded-xl border border-slate-200 p-4">
                  <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Fee per transaksi selesai
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Rp</span>
                    <input
                      type="number"
                      value={selectedStaff.ratePerCase}
                      onChange={(event) =>
                        updateStaff(selectedStaff.id, {
                          ratePerCase: Number(event.target.value),
                        })
                      }
                      className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs font-extrabold outline-none focus:border-[#6B1E2C]"
                    />
                  </div>
                  <p className="mt-2 text-[9px] leading-4 text-slate-400">
                    Fee otomatis tercatat setelah admin mengesahkan resolusi
                    dispute.
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-3 text-xs font-extrabold">
                  Operational controls
                </p>
                <div className="space-y-2">
                  <button
                    disabled={
                      selectedStaff.status !== "active" ||
                      selectedStaff.activeCases >= selectedStaff.maxCases
                    }
                    onClick={() =>
                      updateStaff(selectedStaff.id, {
                        activeCases: selectedStaff.activeCases + 1,
                      })
                    }
                    className="flex w-full items-center justify-between rounded-xl bg-[#6B1E2C] px-4 py-3 text-xs font-bold text-white transition hover:bg-[#581824] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <span className="flex items-center gap-2">
                      <BriefcaseBusiness size={14} />
                      Assign dispute berikutnya
                    </span>
                    <ChevronRight size={15} />
                  </button>
                  <button
                    disabled={selectedStaff.pendingPayout === 0}
                    onClick={() =>
                      updateStaff(selectedStaff.id, { pendingPayout: 0 })
                    }
                    className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                  >
                    <span className="flex items-center gap-2">
                      <Wallet size={14} />
                      Tandai payout sudah dibayar
                    </span>
                    <ChevronRight size={15} />
                  </button>
                  <button
                    onClick={() =>
                      updateStaff(selectedStaff.id, {
                        status:
                          selectedStaff.status === "inactive"
                            ? "active"
                            : "inactive",
                        activeCases:
                          selectedStaff.status === "inactive"
                            ? selectedStaff.activeCases
                            : 0,
                      })
                    }
                    className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-xs font-bold transition ${
                      selectedStaff.status === "inactive"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {selectedStaff.status === "inactive" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <Ban size={14} />
                      )}
                      {selectedStaff.status === "inactive"
                        ? "Aktifkan kembali"
                        : "Nonaktifkan anggota"}
                    </span>
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex gap-3">
                  <AlertTriangle
                    size={16}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />
                  <p className="text-[10px] leading-5 text-amber-800">
                    Menonaktifkan anggota akan mengosongkan workload aktif.
                    Dalam integrasi backend, kasus harus direassign sebelum
                    status diubah.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {showInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="Tutup form tambah anggota"
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
            onClick={() => setShowInvite(false)}
          />
          <form
            onSubmit={handleInvite}
            className="relative w-full max-w-[560px] rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#6B1E2C]">
                  Dispute Operations
                </p>
                <h3 className="mt-1 text-lg font-black">Tambah anggota tim</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X size={17} />
              </button>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <FormField
                label="Nama lengkap"
                name="name"
                placeholder="Nama anggota"
              />
              <FormField
                label="Email kerja"
                name="email"
                type="email"
                placeholder="nama@alidpay.com"
              />
              <FormField
                label="Nomor WhatsApp"
                name="phone"
                placeholder="+62..."
              />
              <label className="block">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  Tipe anggota
                </span>
                <select
                  name="type"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                >
                  <option value="freelancer">Freelancer</option>
                  <option value="employee">Pegawai</option>
                </select>
              </label>
              <FormField
                label="Spesialisasi"
                name="specialty"
                placeholder="Contoh: Produk digital"
              />
              <FormField
                label="Maksimum kasus aktif"
                name="maxCases"
                type="number"
                defaultValue="6"
              />
              <div className="sm:col-span-2">
                <FormField
                  label="Fee per transaksi selesai (Rp)"
                  name="ratePerCase"
                  type="number"
                  defaultValue="20000"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowInvite(false)}
                className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold text-slate-500"
              >
                Batal
              </button>
              <button className="h-10 rounded-xl bg-[#6B1E2C] px-5 text-xs font-bold text-white">
                Simpan & kirim undangan
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  );
}

function FormField({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </span>
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-xs font-semibold outline-none transition placeholder:text-slate-300 focus:border-[#6B1E2C]"
      />
    </label>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function TableHead({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-6 py-4 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function StatCard({
  icon,
  iconClass,
  label,
  value,
  change,
  changeUp,
  description,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value: string;
  change: string;
  changeUp?: boolean;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          {icon}
        </div>

        <span
          className={`flex items-center gap-1 text-[11px] font-bold ${
            changeUp ? "text-emerald-600" : "text-slate-400"
          }`}
        >
          {changeUp && <ArrowUp size={12} />}
          {change}
        </span>
      </div>

      <p className="text-xs font-semibold text-slate-400">{label}</p>

      <h3 className="mt-1 truncate text-2xl font-black">{value}</h3>

      <p className="mt-2 text-[11px] text-slate-400">{description}</p>
    </div>
  );
}

function DetailStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>

      <p className="mt-3 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-xs font-extrabold">{value}</p>
    </div>
  );
}