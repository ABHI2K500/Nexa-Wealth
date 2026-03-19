"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Wallet, Sparkles } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Signup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    country: "US",
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      router.push("/login?registered=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#020617] relative z-50">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.1),transparent_50%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)] mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Create Account
          </h1>
          <p className="text-slate-400 mt-2">Join NexaWealth today</p>
        </div>

        <Card className="p-8 backdrop-blur-2xl bg-white/5 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">First Name</label>
                <Input
                  type="text"
                  placeholder="Abhijith"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Last Name</label>
                <Input
                  type="text"
                  placeholder="P"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Phone Number</label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-300 ml-1">Country</label>
                <select
                  className="w-full px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-700 glass backdrop-blur-xl transition-all duration-300 outline-none text-white focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 appearance-none"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                >
                  <option value="US" className="bg-slate-900 text-white">United States (USD)</option>
                  <option value="UK" className="bg-slate-900 text-white">United Kingdom (GBP)</option>
                  <option value="EU" className="bg-slate-900 text-white">European Union (EUR)</option>
                  <option value="IN" className="bg-slate-900 text-white">India (INR)</option>
                  <option value="CA" className="bg-slate-900 text-white">Canada (CAD)</option>
                  <option value="AU" className="bg-slate-900 text-white">Australia (AUD)</option>
                  <option value="JP" className="bg-slate-900 text-white">Japan (JPY)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
              <Input
                type="email"
                placeholder="abhijithp2028@cs.sjcetpalai.ac.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full py-3 mt-4" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" /> Creating...
                </span>
              ) : (
                "Complete Sign Up"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-blue-400 transition-colors font-medium">
              Sign In
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
