import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import { FORECAST_DATA } from "../data/forecastData";
import { API_BASE_URL } from "../config";
import AnalyticsChartCard from "../components/AnalyticsChartCard";

const Home = () => {
  const navigate = useNavigate();
  const [cookies, , removeCookie] = useCookies(["token"]);
  const [username, setUsername] = useState(() => {
    return localStorage.getItem("username") || "Administrator";
  });

  const {
    summary: defaultSummary,
    festivalUplift: defaultFestivalUplift,
    dayOfWeek: defaultDayOfWeek,
    productFestivalMatrix: defaultMatrix,
  } = FORECAST_DATA;

  const [analyticsData, setAnalyticsData] = useState(null);
  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        const [analyticsRes, modelRes] = await Promise.allSettled([
          axios.get(`${API_BASE_URL}/datasets/analytics`, { withCredentials: true }),
          axios.get(`${API_BASE_URL}/models/status`, { withCredentials: true }),
        ]);

        if (isMounted) {
          if (analyticsRes.status === "fulfilled" && analyticsRes.value.data?.success) {
            setAnalyticsData(analyticsRes.value.data);
          }
          if (modelRes.status === "fulfilled" && modelRes.value.data?.success && modelRes.value.data?.trained) {
            setModelStatus(modelRes.value.data.model);
          }
        }
      } catch (err) {
        console.warn("Could not load dynamic dashboard data:", err.message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

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

  const isDynamic = Boolean(analyticsData && analyticsData.summary?.historicalRecords > 0);

  const historicalRecords = isDynamic
    ? analyticsData.summary.historicalRecords
    : defaultSummary.historicalRecords;

  const activeModelName = modelStatus?.name || defaultSummary.bestModel;
  const activeMAPE = modelStatus?.metrics?.mape ?? defaultSummary.bestMAPE;
  const activeR2 = defaultSummary.bestR2;

  const weekendUplift = isDynamic
    ? analyticsData.summary.weekendUpliftPct
    : defaultSummary.weekendUpliftPct;

  const weekendAvg = isDynamic
    ? analyticsData.summary.weekendAvg
    : defaultSummary.weekendAvg;

  const weekdayAvg = isDynamic
    ? analyticsData.summary.weekdayAvg
    : defaultSummary.weekdayAvg;

  const festivalData = isDynamic && analyticsData.festivalUplift?.length > 0
    ? analyticsData.festivalUplift
    : defaultFestivalUplift;

  const dayOfWeekData = isDynamic && analyticsData.dayOfWeek?.length > 0
    ? analyticsData.dayOfWeek
    : defaultDayOfWeek;

  const productDistribution = analyticsData?.productDistribution || [];
  const productsList = analyticsData?.products || [];

  const topFestival = festivalData.find((f) => (f.upliftVsNormalPct || 0) > 0) || festivalData[0];
  const peakSurgeVal = topFestival?.upliftVsNormalPct ? topFestival.upliftVsNormalPct.toFixed(1) : "18.3";

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
            <p className="text-emerald-400 font-bold mt-1 text-sm">{activeModelName}</p>
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                🎯 Acc: {(100 - activeMAPE).toFixed(1)}%
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                ⚡ Perf: {(activeR2 * 100).toFixed(1)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5 font-mono">MAPE: {activeMAPE}% • R²: {activeR2}</p>
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
              <div className="flex items-center gap-2 mb-2">
                <p className="text-emerald-400 font-medium text-xs uppercase tracking-wider">
                  PRODUCTION ML WORKSPACE
                </p>
                {isDynamic && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Live Dataset Connected ✓
                  </span>
                )}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold leading-tight">
                Occasion & Day-wise Demand Intelligence
              </h2>
              <p className="text-slate-400 mt-3 text-sm lg:text-base leading-6">
                Calculated on {historicalRecords.toLocaleString()} clean multi-factor sales records across{" "}
                {productsList.length > 0 ? `${productsList.length} products` : "all categories"}.
                Real-time predictive forecasts, occasion surge factors, and automated safety stock material replenishment.
              </p>

              <div className="flex flex-wrap gap-3 mt-6">
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300">
                  📅 {analyticsData?.dateRange?.start && analyticsData?.dateRange?.end
                    ? `${analyticsData.dateRange.start.slice(0, 10)} to ${analyticsData.dateRange.end.slice(0, 10)}`
                    : "Multi-Year Historical Horizon"}
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-emerald-400">
                  🎯 Accuracy: {(100 - activeMAPE).toFixed(1)}% ({activeMAPE}% MAPE)
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-blue-400">
                  ⚡ Performance: {(activeR2 * 100).toFixed(1)}% (R² {activeR2})
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-amber-400">
                  🎉 Peak Surge: +{peakSurgeVal}% Lift
                </span>
              </div>
            </div>
          </div>

          {/* KPI STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Clean Historical Records</p>
              <h3 className="text-3xl font-bold text-white mt-2">
                {historicalRecords.toLocaleString()}
              </h3>
              <p className="text-xs text-emerald-400 mt-2 font-semibold">100% Validated & Deduplicated</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Peak Festival Surge</p>
              <h3 className="text-3xl font-bold text-emerald-400 mt-2">+{peakSurgeVal}%</h3>
              <p className="text-xs text-slate-400 mt-2">{topFestival?.festival_clean || "Occasion Spike"}</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">ML Model Accuracy (MAPE)</p>
              <h3 className="text-3xl font-bold text-teal-300 mt-2">{activeMAPE}%</h3>
              <p className="text-xs text-slate-400 mt-2">{activeModelName}</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Weekend Demand Lift</p>
              <h3 className="text-3xl font-bold text-amber-400 mt-2">+{weekendUplift}%</h3>
              <p className="text-xs text-slate-400 mt-2">
                {weekendAvg} vs {weekdayAvg} Avg Units/Day
              </p>
            </div>
          </div>

          {/* OCCASION UPLIFT & DAY OF WEEK DYNAMIC CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <AnalyticsChartCard
              title="Occasion & Festival Demand Surge"
              subtitle="Average sales and uplift across festivals vs normal baseline days"
              badgeText="Surge Index"
              badgeColor="emerald"
              data={festivalData}
              nameKey="festival_clean"
              valueKey="avgSales"
              valueSuffix="units"
              defaultChartType="bar"
            />

            <AnalyticsChartCard
              title="Day-of-Week Seasonality"
              subtitle="Average daily sales patterns across weekdays and weekends"
              badgeText="Weekly Cycle"
              badgeColor="amber"
              data={dayOfWeekData}
              nameKey={isDynamic ? "day_name" : "day_of_week"}
              valueKey="avgSales"
              valueSuffix="units/day"
              defaultChartType="area"
            />
          </div>

          {/* DYNAMIC PRODUCT VOLUME DISTRIBUTION CHART */}
          {productDistribution.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
              <AnalyticsChartCard
                title="Product Sales Volume Breakdown"
                subtitle="Total historical sales volume distribution across detected dataset products"
                badgeText="Product Distribution"
                badgeColor="blue"
                data={productDistribution}
                nameKey="name"
                valueKey="totalSales"
                valueSuffix="units"
                defaultChartType="bar"
              />
            </div>
          )}

          {/* PRODUCT SENSITIVITY TABLE */}
          <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold">Active Dataset Product Portfolio</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Real-time sales velocity and performance summary across your uploaded products
                </p>
              </div>
              <button
                onClick={() => navigate("/predictions")}
                className="text-xs font-bold text-emerald-400 hover:text-emerald-300"
              >
                Run Forecasts →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#020617] text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Product Name</th>
                    <th className="p-3.5">Historical Sales</th>
                    <th className="p-3.5">Avg Daily Sales</th>
                    <th className="p-3.5">Recorded Observations</th>
                    <th className="p-3.5 rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {productDistribution.length > 0 ? (
                    productDistribution.map((row) => (
                      <tr key={row.name} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-bold text-white flex items-center gap-2">
                          <span>📦</span>
                          <span>{row.name}</span>
                        </td>
                        <td className="p-3.5 font-mono text-emerald-400 font-semibold">
                          {row.totalSales.toLocaleString()} units
                        </td>
                        <td className="p-3.5 font-mono text-white">
                          {row.avgSales} units/day
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">
                          {row.recordCount.toLocaleString()} records
                        </td>
                        <td className="p-3.5">
                          <button
                            onClick={() => navigate("/predictions")}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                          >
                            Forecast →
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    defaultMatrix.map((row) => (
                      <tr key={row.product} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-bold text-white flex items-center gap-2">
                          <span>📦</span>
                          <span>{row.product}</span>
                        </td>
                        <td className="p-3.5 font-mono">{row["Normal Day"]} units/day</td>
                        <td className="p-3.5 font-mono text-emerald-400 font-semibold">
                          {row["Harvest Festival"]} units/day
                        </td>
                        <td className="p-3.5 font-mono text-slate-400">Baseline Records</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => navigate("/predictions")}
                            className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition"
                          >
                            Forecast →
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
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
