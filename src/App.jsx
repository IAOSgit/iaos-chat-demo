// Local-hostable IAOS Chat Demo (React + Tailwind) with Floating Chat Bubble

import React, { useEffect, useRef, useState } from "react";
import azureOpenAI from './azureOpenAI.js';

function StatusLight({ connected }) {
  return (
    <div className="flex items-center gap-2 text-sm text-neutral-600">
      <div className={`h-2.5 w-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-red-400'}`} />
      <span>Azure model {connected ? 'connected' : 'offline'}</span>
    </div>
  );
}

function Message({ role, content }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[82%] rounded-2xl px-3 py-2 text-sm leading-relaxed shadow-sm ${
          isUser ? "bg-black text-white rounded-tr-sm" : "bg-neutral-100 text-neutral-900 rounded-tl-sm"
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function ChatBubbleButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-black text-white w-14 h-14 flex items-center justify-center shadow-lg hover:bg-black/90"
      aria-label="Open chat"
    >
      💬
    </button>
  );
}

export default function App() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I’m your demo assistant. Ask me anything." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [modelConnected, setModelConnected] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, open]);

  useEffect(() => {
    const checkConnection = async () => {
      console.log('App: Checking Azure OpenAI connection...');
      
      if (azureOpenAI.isReady()) {
        console.log('App: Azure OpenAI is ready, testing connection...');
        try {
          const connected = await azureOpenAI.testConnection();
          console.log('App: Connection test result:', connected);
          setModelConnected(connected);
        } catch (error) {
          console.error('App: Connection test error:', error);
          setModelConnected(false);
        }
      } else {
        console.log('App: Azure OpenAI is not ready');
        setModelConnected(false);
      }
    };
    
    // Add a small delay to ensure environment variables are loaded
    setTimeout(checkConnection, 1000);
  }, []);

  async function sendMessage(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    setMessages((m) => [...m, userMessage]);
    setInput("");
    setLoading(true);

    try {
      console.log('App: Sending message, modelConnected:', modelConnected, 'azureOpenAI.isReady():', azureOpenAI.isReady());
      
      if (azureOpenAI.isReady()) {
        // Always try Azure OpenAI first
        console.log('App: Attempting to send to Azure OpenAI...');
        const conversationHistory = [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        const response = await azureOpenAI.sendMessage(conversationHistory);
        setMessages((m) => [...m, { role: "assistant", content: response }]);
        
        // Update connection status if this succeeds
        if (!modelConnected) {
          setModelConnected(true);
        }
      } else {
        // Fallback to demo mode
        console.log('App: Using demo mode fallback');
        setTimeout(() => {
          setMessages((m) => [...m, { role: "assistant", content: `Echo: ${text}` }]);
        }, 600);
      }
    } catch (error) {
      console.error('App: Error sending message:', error);
      
      // Mark as disconnected and use demo mode
      setModelConnected(false);
      setMessages((m) => [...m, { 
        role: "assistant", 
        content: "Sorry, I'm having trouble connecting to Azure OpenAI. Falling back to demo mode: " + text
      }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <main className="min-h-screen w-full bg-gray-50 text-neutral-900">
      {/* Header */}
      <nav className="mx-auto max-w-6xl px-4 sm:px-6 py-4 flex items-center gap-3">
        <div>
          <div className="font-semibold tracking-tight text-lg">IAOS Solutions</div>
          <div className="text-xs text-neutral-500 -mt-0.5">Intelligent Automated Systems</div>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-[1.1fr_.9fr] gap-10 items-center">
        <div>
          <h1 className="text-3xl sm:text-5xl font-semibold">Welcome to IAOS</h1>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 max-w-prose">
            IAOS AI — the best enterprise grade LLM on the market.
          </p>
        </div>
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-lg p-6">
          <StatusLight connected={modelConnected} />
          <div className="mt-4 space-y-2 text-sm">
            <div className="rounded-2xl bg-neutral-100 px-3 py-2 w-fit max-w-[85%]">Hello! How can I help today?</div>
            <div className="rounded-2xl bg-black text-white px-3 py-2 w-fit ml-auto max-w-[85%]">Summarize our product in one line.</div>
            <div className="rounded-2xl bg-neutral-100 px-3 py-2 w-fit max-w-[85%]">IAOS delivers a secure, Azure-ready chat experience in a single elegant page.</div>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-6xl px-4 sm:px-6 pb-24 text-xs text-neutral-500 flex items-center gap-2">
        © {new Date().getFullYear()} IAOS Solutions. Demo interface.
      </footer>

      {/* Chat Drawer */}
      {open ? (
        <div className="fixed bottom-20 right-6 z-50 w-[min(92vw,440px)] max-h-[72vh] grid grid-rows-[auto_1fr_auto] rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
            <StatusLight connected={modelConnected} />
            <button onClick={() => setOpen(false)} className="text-xs px-2 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200">Close</button>
          </div>
          <div ref={listRef} className="p-4 overflow-y-auto space-y-3">
            {messages.map((m, i) => (
              <Message key={i} role={m.role} content={m.content} />
            ))}
            {loading && <div className="text-xs text-neutral-500">Thinking…</div>}
          </div>
          <form onSubmit={sendMessage} className="flex items-center gap-2 p-3 border-t bg-white">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask me anything…"
              className="flex-1 min-h-[42px] max-h-40 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/20 resize-y"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="rounded-xl text-sm px-3 py-2 bg-black text-white hover:bg-black/90 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      ) : (
        <ChatBubbleButton onClick={() => setOpen(true)} />
      )}
    </main>
  );
}
