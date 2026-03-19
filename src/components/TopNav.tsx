"use client";

import { Bell, Search, User, LogOut } from "lucide-react";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession, signOut } from "next-auth/react";

export function TopNav() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const firstName = session?.user?.firstName || "Guest";

  return (
    <header className="h-24 px-8 w-full flex items-center justify-between sticky top-0 z-40 glass border-b-0 border-white/5">
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 font-sans tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-slate-400 font-medium">
          {mounted ? format(new Date(), "EEEE, MMMM do, yyyy") : "Loading date..."}
        </p>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
          <input
            type="text"
            placeholder="Search transactions..."
            className="pl-12 pr-4 py-2.5 w-72 rounded-full bg-slate-900/50 border border-slate-700 focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-white placeholder-slate-500 transition-all glass"
          />
        </div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-11 h-11 flex items-center justify-center rounded-full bg-slate-800/50 border border-slate-700 text-slate-300 hover:text-white transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_8px_#8b5cf6]" />
        </motion.button>

        <motion.button 
          onClick={() => signOut({ callbackUrl: '/login' })}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-11 h-11 flex items-center justify-center rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </motion.button>
        
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-[2px] cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)] hidden md:block"
        >
          <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center border-2 border-slate-900 overflow-hidden text-sm font-bold text-white">
            {firstName.charAt(0)}
          </div>
        </motion.div>
      </div>
    </header>
  );
}
