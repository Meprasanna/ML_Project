import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { FORECAST_DATA } from "../data/forecastData";
import { API_BASE_URL } from "../config";

const Home = () => {
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(["token"]);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("username") || "Administrator";
  });
  const { summary, festivalUplift, dayOfWeek, productFestivalMatrix } = FORECAST_DATA;

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/logout`, {}, { withCredentials: true });
    } catch (e) {
      // ignore
    }
    removeCookie("token", { path: "/" });
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* ================= SIDEBAR ================= */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-[#07101f] border-r border-slate-800 flex-col">
        {/* Logo */}
        <div className="h-20 px-6 flex items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xl font-bold">↗</span>
            </div>

            <div>
              <h1 className="font-bold text-lg text-white">DemandForecast</h1>
              <span className="text-emerald-400 text-sm font-semibold">AI</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 font-medium"
          >
            <span>⌂</span>
            <span>Home</span>
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/70 hover:text-white transition"
          >
            <span>▦</span>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/predictions")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/70 hover:text-white transition"
          >
            <span>⌁</span>
            <span>Predictions</span>
          </button>

          <button
            onClick={() => navigate("/data")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/70 hover:text-white transition"
          >
            <span>▤</span>
            <span>Data</span>
          </button>

          <button
            onClick={() => navigate("/models")}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-slate-400 hover:bg-slate-800/70 hover:text-white transition"
          >
            <span>◈</span>
            <span>Models</span>
          </button>
        </nav>

        {/* Plan / User */}
        <div className="p-4 border-t border-slate-800">
          <div className="rounded-2xl bg-[#0b1729] border border-slate-800 p-4">
            <p className="text-xs text-slate-400 uppercase font-semibold">Active Pipeline</p>
            <p className="text-emerald-400 font-bold mt-1 text-sm">HistGradientBoosting</p>
            <p className="text-xs text-slate-500 mt-1">MAPE: 4.32% • R²: 0.9528</p>
          </div>

          <button
            onClick={logout}
            className="w-full mt-3 flex items-center gap-3 px-4 py-2.5 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition"
          >
            <span>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-auto">
        {/* TOP BAR */}
        <header className="h-20 border-b border-slate-800 bg-[#020617]/80 backdrop-blur flex items-center justify-between px-6 lg:px-10">
          <div>
            <p className="text-slate-500 text-sm">Executive Overview & Occasion Intelligence</p>
            <h1 className="text-lg font-semibold text-white">Demand & Replenishment Dashboard</h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/predictions")}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm transition"
            >
              New Forecast →
            </button>
          </div>
        </header>

        {/* CONTENT */}
        <section className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-8">
          {/* HERO */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-[#0b1729] to-[#07101f] p-8 lg:p-10">
            <div className="absolute right-0 top-0 w-96 h-96 bg-emerald-500/10 blur-3xl rounded-full"></div>
            <div className="relative z-10 max-w-3xl">
              <p className="text-emerald-400 font-medium mb-2 text-xs uppercase tracking-wider">
                PRODUCTION ML WORKSPACE
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Occasion & Day-wise Demand Intelligence
              </h2>
              <p className="text-slate-400 mt-3 text-sm lg:text-base leading-6">
                Trained on 26,304 clean multi-factor sales records. Real-time predictive forecasts,
                festival surge factors, and automated safety stock material requirement planning.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                  📅 3 Years History (2023–2025)
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-emerald-400">
                  ✓ Model Accuracy: 4.32% MAPE
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-amber-400">
                  🎉 Peak Surge: +18.32% Lift
                </span>
              </div>
            </div>
          </div>

          {/* KPI STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Clean Historical Records</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {summary.historicalRecords.toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-400 mt-2 font-semibold">100% Validated & Deduplicated</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Peak Festival Surge</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-2">+18.32%</h3>
              <p className="text-xs text-slate-400 mt-2">Harvest Festival & Holi</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">ML Model Accuracy (MAPE)</p>
              <h3 className="text-3xl font-bold text-teal-300 mt-2">{summary.bestMAPE}%</h3>
              <p className="text-xs text-slate-400 mt-2">HistGradientBoosting (R²: {summary.bestR2})</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Weekend Demand Lift</p>
              <h3 className="text-3xl font-bold text-amber-400 mt-2">+{summary.weekendUpliftPct}%</h3>
              <p className="text-xs text-slate-400 mt-2">
                {summary.weekendAvg} vs {summary.weekdayAvg} Avg Units/Day
              </p>
            </div>
          </div>

          {/* OCCASION UPLIFT & DAY OF WEEK GRIDS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* OCCASION UPLIFT BARS */}
            <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Occasion & Festival Demand Surge</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Sales uplift % compared against normal days</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Surge Index
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {festivalUplift.map((fest) => {
                  const uplift = fest.upliftVsNormalPct;
                  const isPositive = uplift > 0;
                  const isDip = uplift < 0;
                  return (
                    <div key={fest.festival_clean} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-200">{fest.festival_clean}</span>
                        <span
                          className={`font-mono font-bold ${
                            isPositive ? "text-emerald-400" : isDip ? "text-rose-400" : "text-slate-400"
                          }`}
                        >
                          {uplift > 0 ? `+${uplift.toFixed(1)}%` : `${uplift.toFixed(1)}%`} ({fest.avgSales.toFixed(1)} units)
                        </span>
                      </div>
                      <div className="w-full bg-[#020617] h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            isPositive ? "bg-emerald-500" : isDip ? "bg-rose-500" : "bg-slate-600"
                          }`}
                          style={{
                            width: `${Math.min(100, Math.max(10, (fest.avgSales / 200) * 100))}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* DAY OF WEEK PATTERNS */}
            <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold">Day-of-Week Seasonality</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Average daily sales across Monday through Sunday</p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                  Weekly Cycle
                </span>
              </div>

              <div className="space-y-3 pt-2">
                {dayOfWeek.map((day) => {
                  const isWeekend = day.day_of_week === "Saturday" || day.day_of_week === "Sunday";
                  return (
                    <div key={day.day_of_week} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={`font-semibold ${isWeekend ? "text-amber-400 font-bold" : "text-slate-300"}`}>
                          {day.day_of_week} {isWeekend && "★ Weekend Surge"}
                        </span>
                        <span className="font-mono text-slate-300 font-semibold">{day.avgSales.toFixed(1)} units/day</span>
                      </div>
                      <div className="w-full bg-[#020617] h-2.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full ${isWeekend ? "bg-amber-400" : "bg-blue-500"}`}
                          style={{
                            width: `${(day.avgSales / 170) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* PRODUCT X FESTIVAL MATRIX */}
          <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Product-Level Occasion Sensitivity Matrix</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Mean sales per store per day across individual festivals & baseline days
                </p>
              </div>
              <span className="text-xs text-slate-500">Values in Units/Day</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#020617] text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Product</th>
                    <th className="p-3.5">Normal Day</th>
                    <th className="p-3.5 text-emerald-400 font-bold">Harvest Fest</th>
                    <th className="p-3.5 text-emerald-400 font-bold">Holi</th>
                    <th className="p-3.5 text-emerald-400 font-bold">Diwali</th>
                    <th className="p-3.5">New Year</th>
                    <th className="p-3.5">Makar Sankranti</th>
                    <th className="p-3.5">Christmas</th>
                    <th className="p-3.5 text-rose-400 font-bold rounded-r-xl">Independence Day</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {productFestivalMatrix.map((row) => (
                    <tr key={row.product} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-bold text-white">{row.product}</td>
                      <td className="p-3.5 font-mono">{row["Normal Day"]}</td>
                      <td className="p-3.5 font-mono text-emerald-400 font-semibold">{row["Harvest Festival"]}</td>
                      <td className="p-3.5 font-mono text-emerald-400 font-semibold">{row["Holi"]}</td>
                      <td className="p-3.5 font-mono text-emerald-400 font-semibold">{row["Diwali"]}</td>
                      <td className="p-3.5 font-mono">{row["New Year"]}</td>
                      <td className="p-3.5 font-mono">{row["Makar Sankranti"]}</td>
                      <td className="p-3.5 font-mono">{row["Christmas"]}</td>
                      <td className="p-3.5 font-mono text-rose-400">{row["Independence Day"]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <ToastContainer />
    </div>
  );
};

export default Home;
