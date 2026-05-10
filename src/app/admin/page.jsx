"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import StatCard from "@/components/StatCard";
import PendingActionCard from "@/components/PendingActionCard";
import TransactionChart from "@/components/TransactionChart";
import { DollarSign, Users, Briefcase, ArrowDownRight, Clock, RefreshCw } from "lucide-react";
import UserActivitiesTable from "@/components/tables/UserActivitiesTable";
import { useFetchData } from "@/hooks/useApi";
import { useCurrencyFormat } from "@/hooks/use-currency-formatter"

export default function DashboardPage() {
  const pathname = usePathname();
  const { data } = useFetchData("/api/admin/dashboard-stats");
  const formatCurrency = useCurrencyFormat("USD")

  const statsData = [
  {
    title: "Total Users",
    value: data?.data.totals.users ?? 0,
    icon: Users,
    color: "green",
  },
  {
    title: "Total Investments",
    value: formatCurrency(Number(data?.data.totals.investments ?? 0)),
    icon: Briefcase,
    color: "red",
  },
  {
    title: "Total Deposit",
    value: formatCurrency(Number(data?.data.totals.deposits ?? 0)),
    icon: DollarSign,
    color: "yellow",
  },
  {
    title: "Total Withdrawal",
    value: formatCurrency(Number(data?.data.totals.withdrawals ?? 0)),
    icon: ArrowDownRight,
    color: "blue",
  },
];

  const pendingCardsData = [
    {
      title: "Pending Deposits",
      count: data?.data.totals.pendingDepositsCount ?? 0,
      amount: formatCurrency(Number(data?.data.totals.pendingDeposits ?? 0)),
      label: "Awaiting approval",
      color: "orange",
      href: "/admin/transactions",
    },
    {
      title: "Pending Withdrawals",
      count: data?.data.totals.pendingWithdrawalsCount ?? 0,
      amount: formatCurrency(Number(data?.data.totals.pendingWithdrawals ?? 0)),
      label: "Awaiting processing",
      color: "purple",
      href: "/admin/transactions",
    },
  ];


  return (
    <motion.div
      key={pathname} // this makes the animation replay on route change
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      {/* Stat Cards Section */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {statsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.15, duration: 0.4 }}
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              delta={stat.delta}
              icon={stat.icon}
              color={stat.color}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Pending Action Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
      >
        {pendingCardsData.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.15, duration: 0.4 }}
          >
            <PendingActionCard {...card} />
          </motion.div>
        ))}
      </motion.div>

      {/* Transaction Chart Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.4 }}
      >
        <TransactionChart />
      </motion.div>
      {/* User Activities Table Section */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut", delay: 0.6 }}
      >
        <UserActivitiesTable />
      </motion.div>
    </motion.div>
  );
}
