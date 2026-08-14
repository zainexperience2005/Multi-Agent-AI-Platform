import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/redux/store";
import { setUserdata } from "@/redux/userSlice.ts";
import api from "@/utils/axios.ts";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/utils/firebase.ts";
import { Button } from "@/components/ui/button.tsx";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  CreditCard,
  Settings,
  LogOut,
  User as UserIcon,
  Play,
  Square,
  Activity,
  Cpu,
  Shield,
} from "lucide-react";

export const Home: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.userData);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data for our services (which we created!)
  const [services, setServices] = useState([
    { name: "Auth Service", port: 8001, status: "active", uptime: "2h 45m" },
    { name: "Chat Service", port: 8002, status: "active", uptime: "2h 45m" },
    { name: "Agent Service", port: 8003, status: "active", uptime: "2h 45m" },
    { name: "Billing Service", port: 8004, status: "active", uptime: "2h 45m" },
  ]);

  const toggleService = (index: number) => {
    setServices((prev) =>
      prev.map((s, idx) =>
        idx === index
          ? {
              ...s,
              status: s.status === "active" ? "inactive" : "active",
              uptime: s.status === "active" ? "-" : "0m",
            }
          : s,
      )
    );
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
      await firebaseSignOut(auth);
      dispatch(setUserdata(null));
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Background Glows */}
      <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      {/* Sidebar */}
      <aside className="relative z-10 flex w-64 flex-col border-r border-slate-800 bg-slate-900/40 backdrop-blur-md">
        {/* Brand Header */}
        <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4.5 w-4.5 text-white"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            Nexus AI
          </span>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 space-y-1.5 px-4 py-6">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
            }`}
          >
            <LayoutDashboard className="h-4.5 w-4.5" />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab("agents")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              activeTab === "agents"
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
            }`}
          >
            <Bot className="h-4.5 w-4.5" />
            Agents
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
            }`}
          >
            <MessageSquare className="h-4.5 w-4.5" />
            Chat Simulator
          </button>
          <button
            onClick={() => setActiveTab("billing")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              activeTab === "billing"
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            Billing
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-indigo-600/15 text-indigo-400 border border-indigo-500/20"
                : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            Settings
          </button>
        </nav>

        {/* User Card & Logout */}
        <div className="border-t border-slate-800 p-4 bg-slate-900/20">
          <div className="flex items-center gap-3 mb-4">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full border border-slate-700 shadow-sm"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 border border-slate-700">
                <UserIcon className="h-5 w-5 text-slate-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-200">{user?.name}</p>
              <p className="truncate text-xs text-slate-500">{user?.email}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full flex items-center justify-center gap-2 border border-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-400 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="relative z-10 flex-1 flex flex-col overflow-y-auto bg-slate-950/20">
        {/* Top Navbar */}
        <header className="flex h-16 items-center justify-between px-8 border-b border-slate-800 bg-slate-900/10 backdrop-blur-md">
          <h2 className="text-xl font-bold capitalize tracking-wide text-slate-200">
            {activeTab} Overview
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              System Status: Operational
            </span>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-8 max-w-6xl w-full mx-auto space-y-8">
          {activeTab === "dashboard" && (
            <>
              {/* Welcome Card */}
              <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-violet-950/20 to-slate-900/40 p-8 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
                <h3 className="text-2xl font-bold text-white mb-2">
                  Welcome back, {user?.name || "Developer"}!
                </h3>
                <p className="text-slate-400 max-w-xl">
                  Your multi-agent platform is running smoothly. All gateway routes, database
                  models, and service registries are fully active and listening.
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">
                      Active Services
                    </span>
                    <Activity className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">4 / 4</div>
                  <p className="text-xs text-slate-500 mt-1">All services online</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Gateway Port</span>
                    <Cpu className="h-5 w-5 text-violet-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">8000</div>
                  <p className="text-xs text-slate-500 mt-1">Routing requests</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Redis Cache</span>
                    <Shield className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">6379</div>
                  <p className="text-xs text-emerald-400 mt-1">Connected</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-5 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Session Limit</span>
                    <UserIcon className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="text-2xl font-bold text-white">7 Days</div>
                  <p className="text-xs text-slate-500 mt-1">TTL sliding window</p>
                </div>
              </div>

              {/* Service Control Center */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/20 backdrop-blur-sm p-6 shadow-md">
                <h4 className="text-lg font-bold text-slate-200 mb-6">Backend Service Registry</h4>
                <div className="divide-y divide-slate-800/60">
                  {services.map((service, index) => (
                    <div
                      key={service.name}
                      className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-2.5 w-2.5 rounded-full ${
                            service.status === "active"
                              ? "bg-emerald-500 animate-pulse"
                              : "bg-slate-600"
                          }`}
                        />
                        <div>
                          <p className="font-semibold text-slate-200">{service.name}</p>
                          <p className="text-xs text-slate-500">
                            Port: {service.port} | Uptime: {service.uptime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium capitalize ${
                            service.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-800 text-slate-400 border border-slate-700/50"
                          }`}
                        >
                          {service.status}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleService(index)}
                          className={`flex items-center gap-1.5 h-8 border cursor-pointer ${
                            service.status === "active"
                              ? "hover:bg-red-500/10 hover:text-red-400 border-slate-800 text-slate-400"
                              : "hover:bg-emerald-500/10 hover:text-emerald-400 border-slate-800 text-slate-400"
                          }`}
                        >
                          {service.status === "active" ? (
                            <>
                              <Square className="h-3 w-3" /> Stop
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" /> Start
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "agents" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center backdrop-blur-sm">
              <Bot className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Agent Orchestrator</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Configure, deploy, and inspect AI agent instances. Deploy custom agents on the
                `agent` microservice.
              </p>
              <Button className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all cursor-pointer">
                Deploy New Agent
              </Button>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center backdrop-blur-sm">
              <MessageSquare className="h-12 w-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Chat Sandbox</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Simulate multi-agent conversations and verify WebSockets or proxy route latency through
                gateway configurations.
              </p>
              <Button className="bg-violet-600 hover:bg-violet-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all cursor-pointer">
                Open Sandbox
              </Button>
            </div>
          )}

          {activeTab === "billing" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center backdrop-blur-sm">
              <CreditCard className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Billing Ledger</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Track agent run costs, API consumption limits, and active stripe subscriptions mapped to
                MongoDB billing indexes.
              </p>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-lg font-semibold transition-all cursor-pointer">
                Manage Billing
              </Button>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center backdrop-blur-sm">
              <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">System Settings</h3>
              <p className="text-slate-400 max-w-md mx-auto mb-6">
                Configure general platform tokens, OAuth providers, CORS policies, and local environment
                bindings.
              </p>
              <Button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all cursor-pointer">
                Configure Environment
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
export default Home;
