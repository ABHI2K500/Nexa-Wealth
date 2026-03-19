"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from "recharts";
import { TrendingDown, TrendingUp, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";

export default function Analytics() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const country = session?.user?.country || "US";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/transactions");
        const json = await res.json();
        if (json.success) {
          setTransactions(json.data);
        }
      } catch (err) { } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const { monthlyTrends, categorySpending, avgSpend } = useMemo(() => {
    const monthMap = new Map<string, number>();
    const catMap = new Map<string, number>();
    
    let totalSpend = 0;
    let expenseTxCount = 0;

    transactions.forEach(tx => {
      const monthName = format(new Date(tx.date), "MMM");
      if (tx.type === "expense") {
        const amt = Math.abs(tx.amount);
        totalSpend += amt;
        expenseTxCount++;

        monthMap.set(monthName, (monthMap.get(monthName) || 0) + amt);
        catMap.set(tx.category, (catMap.get(tx.category) || 0) + amt);
      }
    });

    const chartData = Array.from(monthMap.entries()).map(([name, spend]) => ({
      name,
      spend,
      limit: 2500 // Arbitrary budget limit for visualization
    })).reverse();

    const barData = Array.from(catMap.entries()).map(([category, amount]) => ({
      category,
      amount
    })).sort((a, b) => b.amount - a.amount).slice(0, 5); // top 5

    return {
      monthlyTrends: chartData.length ? chartData : [{ name: format(new Date(), "MMM"), spend: 0, limit: 2500 }],
      categorySpending: barData,
      avgSpend: expenseTxCount > 0 ? (totalSpend / Math.max(monthMap.size, 1)) : 0
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
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Analytics</h2>
        <p className="text-slate-400">Deep dive into your financial habits and trends.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <Card className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-rose-500/20 rounded-xl">
                <TrendingDown className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-400">Monthly Avg Spend</p>
                <h3 className="text-2xl font-bold text-white">{formatCurrency(avgSpend, country)}</h3>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
          <Card className="p-6 relative overflow-hidden neon-border-blue min-h-[120px] h-full col-span-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl -mr-10 -mt-10" />
            <div className="relative z-10 flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-cyan-400 shrink-0 mt-1" />
              <div>
                <p className="text-sm font-bold text-white mb-1">AI Observation</p>
                <p className="text-sm text-slate-300">
                  {transactions.length > 0 
                    ? `You are spending an average of ${formatCurrency(avgSpend, country)} each month across your tracked history.`
                    : "Add some transactions to receive personalized data analytics."}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {transactions.length === 0 ? (
        <Card className="p-12 flex flex-col items-center justify-center border-dashed border-slate-700 bg-slate-900/30">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-slate-500 pointer-events-none" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Analytics Data</h3>
          <p className="text-slate-400 text-center max-w-sm">We need more transaction data to build your personalized financial trends. Head over to the dashboard to begin tracking.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Card className="p-6 h-[400px] flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6">Spending vs Simulated Budget</h3>
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatCurrency(value, country).replace(/\.00$/, '')} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                      formatter={(val: any) => formatCurrency(val, country)}
                    />
                    <Line type="monotone" dataKey="spend" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="stepAfter" dataKey="limit" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <Card className="p-6 h-[400px] flex flex-col">
              <h3 className="text-xl font-bold text-white mb-6">Top Spending Categories</h3>
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categorySpending} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={13} tickLine={false} axisLine={false} width={100} />
                    <Tooltip
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.9)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}
                      formatter={(val: any) => formatCurrency(val, country)}
                    />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {categorySpending.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#colorBar${index})`} />
                      ))}
                    </Bar>
                    <defs>
                      {categorySpending.map((_, index) => (
                        <linearGradient key={`grad-${index}`} id={`colorBar${index}`} x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#3b82f6" />
                        </linearGradient>
                      ))}
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
}
