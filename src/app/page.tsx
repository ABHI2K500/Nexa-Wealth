"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowDownRight, ArrowUpRight, Sparkles, Wallet, TrendingUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/currency";
import { format, parseISO } from "date-fns";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell
} from "recharts";

interface Transaction {
  _id: string;
  name: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
  icon?: string;
}

export default function Dashboard() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const country = session?.user?.country || "IN";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/transactions");
        const json = await res.json();
        if (json.success) {
          setTransactions(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch transactions");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const { totalIncome, totalExpense, totalBalance, categoryData, monthlyData, recentTx } = useMemo(() => {
    let income = 0;
    let expense = 0;
    const catMap = new Map<string, number>();
    const monthMap = new Map<string, { income: number, spend: number }>();

    transactions.forEach(tx => {
      const amount = Math.abs(tx.amount);
      const dateObj = new Date(tx.date);
      const monthName = format(dateObj, "MMM");

      if (!monthMap.has(monthName)) {
        monthMap.set(monthName, { income: 0, spend: 0 });
      }

      if (tx.type === "income") {
        income += amount;
        monthMap.get(monthName)!.income += amount;
      } else {
        expense += amount;
        monthMap.get(monthName)!.spend += amount;
        catMap.set(tx.category, (catMap.get(tx.category) || 0) + amount);
      }
    });

    const colors = ["#3b82f6", "#8b5cf6", "#22d3ee", "#a855f7", "#ec4899", "#f43f5e", "#10b981"];
    const donutData = Array.from(catMap.entries()).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length]
    })).sort((a, b) => b.value - a.value);

    // Get unique months from data or at least empty array
    const chartData = Array.from(monthMap.entries()).map(([name, data]) => ({
      name,
      income: data.income,
      spend: data.spend
    })).reverse(); // Assuming DB returns newest first, we reverse to show chronological

    return {
      totalIncome: income,
      totalExpense: expense,
      totalBalance: income - expense,
      categoryData: donutData,
      monthlyData: chartData.length ? chartData : [{ name: format(new Date(), "MMM"), income: 0, spend: 0 }],
      recentTx: transactions.slice(0, 4)
    };
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <Sparkles className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-7xl mx-auto space-y-4 pb-4 overflow-hidden">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between shrink-0 mt-4 md:mt-0">
        <div>
          <h2 className="text-3xl font-bold text-white mb-1">Overview</h2>
          <p className="text-slate-400">Your financial snapshot at a glance.</p>
        </div>
      </div>

      {/* Top Info Cards - Fixed */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Total Balance</p>
              <h3 className="text-4xl font-bold text-white text-glow-blue tracking-tight">
                {formatCurrency(totalBalance, country)}
              </h3>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card className="p-6 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all duration-500" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <ArrowUpRight className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Total Income</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {formatCurrency(totalIncome, country)}
              </h3>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
          <Card className="p-6 relative overflow-hidden group h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-rose-500/20 transition-all duration-500" />
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <ArrowDownRight className="w-6 h-6 text-rose-400" />
              </div>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Total Expenses</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">
                {formatCurrency(totalExpense, country)}
              </h3>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Split Layout - Scrollable */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0 pb-4">
        
        {/* Left Column (Charts & Transactions) */}
        <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto hidden-scrollbar pr-1 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="p-6 h-[400px] flex flex-col shrink-0">
              <h3 className="text-xl font-bold text-white mb-6">Cash Flow</h3>
              <div className="flex-1 w-full h-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value, country).replace(/\.00$/, '')} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    <Area type="monotone" dataKey="spend" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
            <Card className="p-6 shrink-0">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              </div>
              {recentTx.length > 0 ? (
                <div className="space-y-4">
                  {recentTx.map((tx) => (
                    <div key={tx._id} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                          {tx.icon || (tx.type === "income" ? "💰" : "💳")}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{tx.name}</p>
                          <p className="text-sm text-slate-400">{format(parseISO(tx.date), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <span className={`font-bold text-lg ${tx.type === 'income' ? "text-emerald-400" : "text-white"}`}>
                        {tx.type === 'income' ? "+" : "-"}{formatCurrency(Math.abs(tx.amount), country)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-6">Your transaction list is empty.</p>
              )}
            </Card>
          </motion.div>
        </div>

        {/* Right Column (Categories & Insights) */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto hidden-scrollbar md:pl-1 pb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="flex flex-col gap-6">
            <Card className="p-6 flex flex-col shrink-0 min-h-[350px]">
              <h3 className="text-xl font-bold text-white mb-4">Expense Categories</h3>
              {categoryData.length > 0 ? (
                <>
                  <div className="flex-1 min-h-[200px] flex items-center justify-center -my-8">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: 'none' }}
                          formatter={(val: any) => formatCurrency(val, country)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {categoryData.slice(0, 4).map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-slate-300 truncate">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <p>No expenses tracked yet.</p>
                </div>
              )}
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
            <Card className="p-6 relative overflow-hidden h-full neon-border-blue shrink-0 min-h-[160px]">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Sparkles className="w-5 h-5 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white text-glow-cyan">AI Insights</h3>
              </div>
              <div className="space-y-4 relative z-10">
                {categoryData.length > 0 ? (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Most of your spending goes towards <span className="text-blue-400 font-semibold">{categoryData[0].name}</span>. Try to reduce this by 10% next month.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Welcome to NexaWealth! Add your first transaction to get personalized AI financial insights.
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
