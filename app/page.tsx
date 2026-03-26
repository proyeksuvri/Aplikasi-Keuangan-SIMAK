"use client";

import React, { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-[#1E293B] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <span className="text-xl font-bold">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">SIMAK</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {[
            { id: "dashboard", label: "Dashboard", icon: "📊" },
            { id: "transactions", label: "Transactions", icon: "💸" },
            { id: "budgets", label: "Budgets", icon: "📅" },
            { id: "reports", label: "Reports", icon: "📈" },
            { id: "settings", label: "Settings", icon: "⚙️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-indigo-50 text-indigo-700 font-semibold shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-900 rounded-xl p-4 text-white">
            <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-wider">Pro Plan</p>
            <p className="font-semibold text-sm mb-3">Upgrade for more insights</p>
            <button className="w-full bg-white text-slate-900 text-xs font-bold py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Upgrade Now
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="relative w-96">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Search transactions, reports..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
              <span>🔔</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 text-sm">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-slate-800 leading-tight">Admin User</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 bg-slate-200 rounded-full overflow-hidden border-2 border-slate-100 flex items-center justify-center font-bold text-slate-500">
                AU
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#F8FAFC]">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
                  <span className="text-[120px] leading-none">💳</span>
                </div>
                <p className="text-indigo-100 text-sm font-medium mb-1">Total Balance</p>
                <h2 className="text-4xl font-bold mb-6">Rp 128.450.000</h2>
                <div className="flex items-center gap-2 text-indigo-100 text-sm bg-indigo-500/30 w-fit px-3 py-1 rounded-full backdrop-blur-sm">
                  <span className="text-emerald-300 font-bold">↑ 12.5%</span>
                  <span>from last month</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl mb-4">
                    📥
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Income this month</p>
                  <h3 className="text-2xl font-bold text-slate-800">Rp 45.300.200</h3>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600 font-bold">
                  <span>+ Rp 5.200k vs prev week</span>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 text-2xl mb-4">
                    📤
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">Expenses this month</p>
                  <h3 className="text-2xl font-bold text-slate-800">Rp 12.840.500</h3>
                </div>
                <div className="mt-4 flex items-center gap-2 text-xs text-rose-600 font-bold">
                  <span>- Rp 1.100k vs prev week</span>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Transactions Table */}
              <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                  <button className="text-indigo-600 text-sm font-semibold hover:text-indigo-700">View All</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-[11px] uppercase tracking-wider font-bold">
                        <th className="px-8 py-4">Transaction</th>
                        <th className="px-8 py-4">Category</th>
                        <th className="px-8 py-4">Date</th>
                        <th className="px-8 py-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {[
                        { title: "Apple Subscription", category: "Entertainment", date: "24 Mar 2024", amount: "- Rp 149.000", color: "rose" },
                        { title: "Salary Payment", category: "Income", date: "22 Mar 2024", amount: "+ Rp 25.000.000", color: "emerald" },
                        { title: "Indomaret Point", category: "Groceries", date: "21 Mar 2024", amount: "- Rp 350.500", color: "rose" },
                        { title: "Interest Earned", category: "Savings", date: "20 Mar 2024", amount: "+ Rp 45.200", color: "emerald" },
                        { title: "Gojek Ride", category: "Transport", date: "19 Mar 2024", amount: "- Rp 22.000", color: "rose" },
                      ].map((tx, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg bg-${tx.color}-50 flex items-center justify-center text-sm font-bold text-${tx.color}-600`}>
                                {tx.title[0]}
                              </div>
                              <span className="font-medium text-slate-700">{tx.title}</span>
                            </div>
                          </td>
                          <td className="px-8 py-4">
                            <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-500 font-medium">{tx.category}</span>
                          </td>
                          <td className="px-8 py-4 text-sm text-slate-500">{tx.date}</td>
                          <td className={`px-8 py-4 text-right font-bold text-sm ${tx.amount.startsWith('+') ? 'text-emerald-600' : 'text-slate-700'}`}>
                            {tx.amount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cash Flow Visual & Fast Info */}
              <div className="space-y-8">
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-6">Monthly Flow</h3>
                  <div className="h-48 flex items-end justify-between gap-2 px-2">
                    {[35, 65, 45, 85, 55, 75, 95].map((height, i) => (
                      <div key={i} className="flex-1 bg-indigo-100 rounded-t-lg relative group transition-all duration-300 hover:bg-indigo-500 cursor-pointer" style={{ height: `${height}%` }}>
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          Rp{height}k
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                  </div>
                </div>

                <div className="bg-indigo-900 rounded-3xl p-8 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
                  <h4 className="font-bold mb-2">New Security Feature</h4>
                  <p className="text-indigo-200 text-xs leading-relaxed mb-6">
                    Turn on Two-Factor Authentication to better protect your financial data from unauthorized access.
                  </p>
                  <button className="flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all">
                    Enable Now <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

