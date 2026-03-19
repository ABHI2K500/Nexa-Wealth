"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Plus, Search, Filter, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { formatCurrency } from "@/lib/currency";
import { format, parseISO } from "date-fns";

interface Transaction {
  _id: string;
  name: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  date: string;
}

export default function Transactions() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Transaction form
  const [txType, setTxType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Food & Dining");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);

  const country = session?.user?.country || "US";

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const res = await fetch("/api/transactions");
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }

  const handleSave = async () => {
    if (!amount || !desc) return;
    setSaving(true);
    
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: desc,
          amount: parseFloat(amount),
          type: txType,
          category,
          date: new Date(date).toISOString(),
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setAmount("");
        setDesc("");
        fetchData(); // Refresh list
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Transactions</h2>
          <p className="text-slate-400">View and manage all your financial activity.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Transaction
        </Button>
      </div>

      <Card className="p-6 min-h-[500px]">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
          </div>
          <Button variant="secondary" className="gap-2">
            <Filter className="w-4 h-4" /> Filters
          </Button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Sparkles className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 text-sm">
                  <th className="pb-4 font-medium pl-4">Transaction</th>
                  <th className="pb-4 font-medium">Category</th>
                  <th className="pb-4 font-medium">Date</th>
                  <th className="pb-4 font-medium text-right pr-4">Amount</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((tx, idx) => (
                  <motion.tr
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={tx._id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors group"
                  >
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {tx.type === 'income' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-white group-hover:text-blue-400 transition-colors">
                          {tx.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-300">
                      <span className="px-3 py-1 bg-slate-800 rounded-full text-xs border border-slate-700">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400 text-sm">{format(parseISO(tx.date), "MMM d, yyyy")}</td>
                    <td className={`py-4 text-right pr-4 font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-white'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(Math.abs(tx.amount), country)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length === 0 && (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 opacity-50" />
                </div>
                <p>No transactions found matching "{searchTerm}"</p>
                <p className="text-sm mt-1">Try a different search term or add a new transaction.</p>
              </div>
            )}
            {transactions.length === 0 && !searchTerm && (
               <div className="text-center py-12 text-slate-500 text-lg">
                  You haven't recorded any transactions yet.
               </div>
            )}
          </div>
        )}
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Transaction">
        <div className="space-y-5">
          <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setTxType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${txType === 'expense' ? 'bg-rose-500/20 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.2)]' : 'text-slate-400 hover:text-white'}`}
            >
              Expense
            </button>
            <button
              onClick={() => setTxType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${txType === 'income' ? 'bg-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'text-slate-400 hover:text-white'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">$</span>
              <Input 
                type="number" 
                placeholder="0.00" 
                className="pl-8 text-xl" 
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <Input 
              placeholder="e.g. Groceries..." 
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
              <select 
                className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700 glass backdrop-blur-xl transition-all duration-300 outline-none text-white focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 appearance-none"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                <option className="bg-slate-900 text-white">Food & Dining</option>
                <option className="bg-slate-900 text-white">Transportation</option>
                <option className="bg-slate-900 text-white">Shopping</option>
                <option className="bg-slate-900 text-white">Entertainment</option>
                <option className="bg-slate-900 text-white">Housing</option>
                <option className="bg-slate-900 text-white">Healthcare</option>
                <option className="bg-slate-900 text-white">Utilities</option>
                {txType === 'income' && <option className="bg-slate-900 text-white">Salary</option>}
                {txType === 'income' && <option className="bg-slate-900 text-white">Investment</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
              <Input 
                type="date" 
                className="style-date-input" 
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button className="w-full" onClick={handleSave} disabled={saving || !amount || !desc}>
              {saving ? "Saving..." : "Save Transaction"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
