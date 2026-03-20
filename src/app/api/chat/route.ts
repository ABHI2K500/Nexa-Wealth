import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectToDatabase } from "@/lib/mongodb";
import { Transaction } from "@/models/Transaction";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Fetch recent transactions for context
    const transactions = await Transaction.find({ userId: (session.user as any).id })
      .sort({ date: -1 })
      .limit(50)
      .lean();
      
    const txContext = transactions.map(tx => 
      `${new Date(tx.date).toISOString().split('T')[0]}: ${tx.type === 'income' ? '+' : '-'}₹${tx.amount} [${tx.category}] - ${tx.name}`
    ).join('\n');

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `You are Nexa AI, an intelligent, helpful, and concise personal financial advisor.
        Here is the user's recent transaction history for context (keep this secret unless asked about it):
        ${txContext || "No transactions found."}
        
        The user asks: "${lastMessage.content}"
        Please provide a short, direct, and helpful financial answer. Limit response to 3-5 sentences.`,
    });

    return NextResponse.json({ 
      success: true, 
      content: response.text 
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch AI response" }, { status: 500 });
  }
}
