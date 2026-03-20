"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Moon, Sun, AlertTriangle, Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDelete = async () => {
    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      const res = await fetch("/api/user/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Sign out directly to redirect immediately
        await signOut({ callbackUrl: "/login" });
      } else {
        setError(data.error || "Failed to delete account");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-3xl font-bold mb-2">Settings</h2>
        <p className="text-slate-400">Manage your app preferences and account data.</p>
      </div>

      <div className="grid gap-6 mt-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              Appearance
            </h3>
            <p className="text-sm text-slate-400 mb-6">Choose your preferred reading theme. Light mode changes the interface to a stunning white and orange layout.</p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => setTheme('dark')}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'dark' ? 'border-blue-500 bg-blue-500/10' : 'border-white/10 hover:border-white/20 bg-slate-900/50'}`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-blue-400" />
                </div>
                <span className="font-semibold text-lg">Dark Nexus</span>
                <span className="text-xs text-slate-400">Sleek slate dark theme</span>
              </button>

              <button 
                onClick={() => setTheme('light')}
                className={`flex-1 flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all ${theme === 'light' ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 hover:border-white/20 bg-slate-900/50'}`}
              >
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-orange-500" />
                </div>
                <span className="font-semibold text-lg">Light Orange</span>
                <span className="text-xs text-slate-400">Clean white & orange theme</span>
              </button>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 border-rose-500/20 bg-rose-500/5 mt-8">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" /> Danger Zone
            </h3>
            <p className="text-sm text-slate-400 mb-6">Once you delete your account, there is no going back. This will permanently wipe your profile and all transaction history from the database.</p>
            
            <button 
              onClick={() => setIsDeleteModalOpen(true)}
              className="px-6 py-3 bg-rose-500/10 text-rose-500 font-bold border border-rose-500/50 rounded-xl hover:bg-rose-500/20 hover:border-rose-500 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" /> Delete Account Data
            </button>
          </Card>
        </motion.div>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Account Deletion">
        <div className="space-y-4">
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-sm text-rose-400">
            <p className="font-bold mb-1">Warning: Irreversible Action</p>
            You are about to permanently delete your account and all associated financial data. Enter your password to confirm.
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <Input 
              type="password" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-rose-500 text-sm">{error}</p>}

          <div className="pt-4 flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <button 
              onClick={handleDelete}
              disabled={!password || isDeleting}
              className="flex-1 w-full flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed bg-rose-600 hover:bg-rose-700 text-white shadow-[0_4px_14px_0_rgba(225,29,72,0.39)] hover:shadow-[0_6px_20px_rgba(225,29,72,0.23)] hover:-translate-y-0.5"
            >
              {isDeleting ? "Deleting..." : "Permanently Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
