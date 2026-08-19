"use client";

import {
  ArrowDown,
  ArrowUp,
  Ban,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Headphones,
  Mail,
  MoreHorizontal,
  Search,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type UserRole = "buyer" | "seller" | "both";
type UserStatus = "active" | "suspended" | "pending";

type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  verified: boolean;
  balance: number;
  transactions: number;
  disputes: number;
  joinedAt: string;
  lastActive: string;
};

const users: User[] = [
  {
    id: "01M06Z8K2A",
    name: "Auridia",
    username: "@ALID-ZMY655P4",
    email: "auridia@example.com",
    role: "buyer",
    status: "active",
    verified: true,
    balance: 2450000,
    transactions: 18,
    disputes: 1,
    joinedAt: "12 Agu 2026",
    lastActive: "2 menit lalu",
  },
  {
    id: "01M06X92LP",
    name: "Ulyara",
    username: "@ALID-PBNJCWDD",
    email: "ulyara@example.com",
    role: "seller",
    status: "active",
    verified: true,
    balance: 12850000,
    transactions: 43,
    disputes: 0,
    joinedAt: "4 Agu 2026",
    lastActive: "5 menit lalu",
  },
  {
    id: "01M06K9X2A",
    name: "Rizky",
    username: "@ALID-RZK892KD",
    email: "rizky@example.com",
    role: "buyer",
    status: "active",
    verified: true,
    balance: 890000,
    transactions: 11,
    disputes: 2,
    joinedAt: "28 Jul 2026",
    lastActive: "12 menit lalu",
  },
  {
    id: "01M05Q8W1P",
    name: "Kevin",
    username: "@ALID-KVN827HD",
    email: "kevin@example.com",
    role: "both",
    status: "active",
    verified: true,
    balance: 4200000,
    transactions: 27,
    disputes: 1,
    joinedAt: "21 Jul 2026",
    lastActive: "18 menit lalu",
  },
  {
    id: "01M04P2Q8X",
    name: "Dimas",
    username: "@ALID-DMS821KA",
    email: "dimas@example.com",
    role: "buyer",
    status: "suspended",
    verified: true,
    balance: 120000,
    transactions: 8,
    disputes: 3,
    joinedAt: "16 Jul 2026",
    lastActive: "2 hari lalu",
  },
  {
    id: "01M03X7A2B",
    name: "Bagas",
    username: "@ALID-BGS778QA",
    email: "bagas@example.com",
    role: "seller",
    status: "pending",
    verified: false,
    balance: 750000,
    transactions: 4,
    disputes: 0,
    joinedAt: "15 Agu 2026",
    lastActive: "1 jam lalu",
  },
  {
    id: "01M02AA81C",
    name: "Fahmi Store",
    username: "@ALID-FHM332LA",
    email: "fahmi@example.com",
    role: "seller",
    status: "active",
    verified: true,
    balance: 18750000,
    transactions: 67,
    disputes: 2,
    joinedAt: "8 Jul 2026",
    lastActive: "7 menit lalu",
  },
  {
    id: "01M01BC92D",
    name: "Raka",
    username: "@ALID-RKA228DD",
    email: "raka@example.com",
    role: "both",
    status: "active",
    verified: true,
    balance: 3200000,
    transactions: 31,
    disputes: 0,
    joinedAt: "2 Jul 2026",
    lastActive: "26 menit lalu",
  },
];

const roleConfig: Record<
  UserRole,
  {
    label: string;
    className: string;
  }
> = {
  buyer: {
    label: "Buyer",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  seller: {
    label: "Seller",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  both: {
    label: "Buyer & Seller",
    className: "bg-purple-50 text-purple-700 ring-purple-100",
  },
};

const statusConfig: Record<
  UserStatus,
  {
    label: string;
    className: string;
    dot: string;
  }
> = {
  active: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    dot: "bg-emerald-500",
  },
  suspended: {
    label: "Suspended",
    className: "bg-red-50 text-red-700 ring-red-100",
    dot: "bg-red-500",
  },
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700 ring-amber-100",
    dot: "bg-amber-500",
  },
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

function RoleBadge({ role }: { role: UserRole }) {
  const config = roleConfig[role];

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ring-1 ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-bold ring-1 ${config.className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<"all" | UserRole>("all");
  const [status, setStatus] = useState<"all" | UserStatus>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const router = useRouter();

  const filteredUsers = useMemo(() => {
    const keyword = search.toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(keyword) ||
        user.username.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.id.toLowerCase().includes(keyword);

      const matchesRole = role === "all" || user.role === role;
      const matchesStatus = status === "all" || user.status === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [search, role, status]);

  const activeUsers = users.filter((user) => user.status === "active").length;
  const suspendedUsers = users.filter(
    (user) => user.status === "suspended",
  ).length;
  const pendingUsers = users.filter((user) => user.status === "pending").length;

  const totalBalance = users.reduce((total, user) => total + user.balance, 0);

  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#172033]">
      {/* HEADER */}
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
                User Management
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
        {/* BREADCRUMB */}
        <div className="mb-3 flex items-center gap-2 text-xs font-medium text-slate-400">
          <span>Dashboard</span>
          <ChevronRight size={13} />
          <span className="font-semibold text-[#6B1E2C]">Users</span>
        </div>

        <PeopleTabs
          active="customers"
          onChange={(view) => {
            if (view === "support") {
              router.push("/dashboard/users/disputeteam");
            }
          }}
        />

        {/* TITLE */}
        <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <h2 className="text-3xl font-black tracking-tight">
              User Management
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Kelola pengguna AlidPay, pantau aktivitas akun, status verifikasi,
              saldo, transaksi, dan riwayat dispute.
            </p>
          </div>

          <button className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6B1E2C] px-5 text-sm font-bold text-white shadow-lg shadow-[#6B1E2C]/15 transition hover:-translate-y-0.5 hover:bg-[#581824]">
            <Users size={16} />
            Add User
          </button>
        </div>

        {/* STATS */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users size={19} />}
            iconClass="bg-[#F2E7E9] text-[#6B1E2C]"
            label="Total Users"
            value={users.length.toString()}
            change="+14%"
            changeUp
            description="Seluruh pengguna terdaftar"
          />

          <StatCard
            icon={<CheckCircle2 size={19} />}
            iconClass="bg-emerald-50 text-emerald-600"
            label="Active Users"
            value={activeUsers.toString()}
            change="+8%"
            changeUp
            description="Akun yang aktif"
          />

          <StatCard
            icon={<Clock3 size={19} />}
            iconClass="bg-amber-50 text-amber-600"
            label="Pending Verification"
            value={pendingUsers.toString()}
            change="Needs review"
            description="Menunggu verifikasi"
          />

          <StatCard
            icon={<Wallet size={19} />}
            iconClass="bg-blue-50 text-blue-600"
            label="User Balance"
            value={formatRupiah(totalBalance)}
            change={`${suspendedUsers} suspended`}
            description="Total saldo pengguna"
          />
        </section>

        {/* MAIN CARD */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* FILTER */}
          <div className="border-b border-slate-100 p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-base font-extrabold">All Users</h3>

                <p className="mt-1 text-xs text-slate-400">
                  Menampilkan {filteredUsers.length} dari {users.length} user
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {/* SEARCH */}
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari user..."
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

                {/* ROLE */}
                <div className="relative">
                  <select
                    value={role}
                    onChange={(e) =>
                      setRole(e.target.value as "all" | UserRole)
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                  >
                    <option value="all">All Roles</option>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                    <option value="both">Buyer & Seller</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>

                {/* STATUS */}
                <div className="relative">
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "all" | UserStatus)
                    }
                    className="h-10 appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-9 text-xs font-semibold outline-none focus:border-[#6B1E2C]"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Transactions</TableHead>
                  <TableHead>Disputes</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead align="right">Action</TableHead>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition hover:bg-[#FCFAFA]"
                  >
                    {/* USER */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F2E7E9] text-xs font-black text-[#6B1E2C]">
                          {user.name.charAt(0)}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-extrabold">
                              {user.name}
                            </p>

                            {user.verified && (
                              <CheckCircle2
                                size={13}
                                className="text-blue-500"
                              />
                            )}
                          </div>

                          <p className="mt-1 text-[10px] text-slate-400">
                            {user.username}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* ROLE */}
                    <td className="px-6 py-5">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* BALANCE */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <CircleDollarSign
                          size={14}
                          className="text-slate-400"
                        />

                        <p className="text-xs font-extrabold text-slate-700">
                          {formatRupiah(user.balance)}
                        </p>
                      </div>
                    </td>

                    {/* TRANSACTIONS */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <ShoppingBag size={14} className="text-slate-400" />

                        <span className="text-xs font-bold text-slate-700">
                          {user.transactions}
                        </span>
                      </div>
                    </td>

                    {/* DISPUTES */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Ban
                          size={14}
                          className={
                            user.disputes > 0
                              ? "text-red-500"
                              : "text-slate-300"
                          }
                        />

                        <span
                          className={`text-xs font-bold ${
                            user.disputes > 0
                              ? "text-red-600"
                              : "text-slate-400"
                          }`}
                        >
                          {user.disputes}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-5">
                      <StatusBadge status={user.status} />
                    </td>

                    {/* LAST ACTIVE */}
                    <td className="px-6 py-5">
                      <p className="text-[11px] font-semibold text-slate-600">
                        {user.lastActive}
                      </p>

                      <p className="mt-1 text-[9px] text-slate-400">
                        Joined {user.joinedAt}
                      </p>
                    </td>

                    {/* ACTION */}
                    <td className="px-6 py-5 text-right">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-[11px] font-bold text-slate-600 transition hover:border-[#6B1E2C]/20 hover:bg-[#FDF7F8] hover:text-[#6B1E2C]"
                      >
                        View
                        <ChevronRight size={13} />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-16 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                        <Search size={20} />
                      </div>

                      <p className="mt-4 text-sm font-bold">
                        User tidak ditemukan
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Coba ubah kata pencarian atau filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 sm:flex-row">
            <p className="text-[11px] text-slate-400">
              Showing{" "}
              <span className="font-bold text-slate-600">
                1–{filteredUsers.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-slate-600">
                {filteredUsers.length}
              </span>{" "}
              users
            </p>

            <div className="flex items-center gap-1">
              <button
                disabled
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
              >
                ‹
              </button>

              <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6B1E2C] text-xs font-bold text-white">
                1
              </button>

              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                2
              </button>

              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50">
                3
              </button>

              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50">
                ›
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* USER DRAWER */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
            onClick={() => setSelectedUser(null)}
          />

          <aside className="relative h-full w-full max-w-[500px] overflow-y-auto bg-white shadow-2xl">
            {/* DRAWER HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-5 backdrop-blur">
              <div>
                <p className="font-mono text-[10px] font-bold text-[#6B1E2C]">
                  {selectedUser.id}
                </p>

                <h3 className="mt-1 text-lg font-black">User Profile</h3>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              {/* PROFILE */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2E7E9] text-xl font-black text-[#6B1E2C]">
                    {selectedUser.name.charAt(0)}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black">
                        {selectedUser.name}
                      </h4>

                      {selectedUser.verified && (
                        <CheckCircle2 size={15} className="text-blue-500" />
                      )}
                    </div>

                    <p className="mt-1 text-xs text-slate-400">
                      {selectedUser.username}
                    </p>

                    <div className="mt-2">
                      <StatusBadge status={selectedUser.status} />
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Role
                    </p>

                    <div className="mt-2">
                      <RoleBadge role={selectedUser.role} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Verification
                    </p>

                    <p className="mt-2 text-xs font-bold text-emerald-600">
                      {selectedUser.verified
                        ? "Verified Account"
                        : "Not Verified"}
                    </p>
                  </div>
                </div>
              </div>

              {/* CONTACT */}
              <div>
                <p className="mb-3 text-xs font-extrabold">
                  Contact Information
                </p>

                <div className="rounded-xl border border-slate-200">
                  <div className="flex items-center gap-3 border-b border-slate-100 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <Mail size={15} />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        Email
                      </p>

                      <p className="mt-1 text-xs font-semibold">
                        {selectedUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                      <UserRound size={15} />
                    </div>

                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400">
                        User ID
                      </p>

                      <p className="mt-1 font-mono text-xs font-semibold">
                        {selectedUser.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACCOUNT STATS */}
              <div>
                <p className="mb-3 text-xs font-extrabold">Account Overview</p>

                <div className="grid grid-cols-2 gap-3">
                  <DetailStat
                    icon={<Wallet size={16} />}
                    label="Balance"
                    value={formatRupiah(selectedUser.balance)}
                  />

                  <DetailStat
                    icon={<ShoppingBag size={16} />}
                    label="Transactions"
                    value={selectedUser.transactions.toString()}
                  />

                  <DetailStat
                    icon={<Ban size={16} />}
                    label="Disputes"
                    value={selectedUser.disputes.toString()}
                  />

                  <DetailStat
                    icon={<Clock3 size={16} />}
                    label="Last Active"
                    value={selectedUser.lastActive}
                  />
                </div>
              </div>

              {/* ACTIVITY */}
              <div>
                <p className="mb-4 text-xs font-extrabold">Recent Activity</p>

                <div className="space-y-4">
                  <Activity
                    title="Transaction completed"
                    description="Pembayaran escrow berhasil diselesaikan."
                    time="18 menit lalu"
                    dot="bg-emerald-500"
                  />

                  <Activity
                    title="Opened dispute"
                    description="User mengajukan dispute pada transaksi."
                    time="1 jam lalu"
                    dot="bg-red-500"
                  />

                  <Activity
                    title="Login"
                    description="Login berhasil dari perangkat baru."
                    time="2 jam lalu"
                    dot="bg-blue-500"
                  />
                </div>
              </div>

              {/* ADMIN ACTION */}
              <div className="border-t border-slate-100 pt-6">
                <p className="mb-3 text-xs font-extrabold">
                  Administrative Actions
                </p>

                <div className="space-y-2">
                  {selectedUser.status === "suspended" ? (
                    <button className="flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100">
                      Activate User
                      <CheckCircle2 size={15} />
                    </button>
                  ) : (
                    <button className="flex w-full items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-700 transition hover:bg-red-100">
                      Suspend User
                      <Ban size={15} />
                    </button>
                  )}

                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                    View Transactions
                    <ChevronRight size={15} />
                  </button>

                  <button className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-600 transition hover:bg-slate-50">
                    View Disputes
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

/* COMPONENTS */

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
        type="button"
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
        type="button"
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

function Activity({
  title,
  description,
  time,
  dot,
}: {
  title: string;
  description: string;
  time: string;
  dot: string;
}) {
  return (
    <div className="flex gap-3">
      <div className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />

      <div className="min-w-0">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-bold">{title}</p>

          <span className="shrink-0 text-[9px] text-slate-400">{time}</span>
        </div>

        <p className="mt-1 text-[10px] leading-5 text-slate-400">
          {description}
        </p>
      </div>
    </div>
  );
}
