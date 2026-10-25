import React from "react";
import { useNavigate } from "react-router-dom";
import { FORECAST_DATA } from "../data/forecastData";

const Models = () => {
  const navigate = useNavigate();
  const { summary, modelComparison, featureImportance } = FORECAST_DATA;

  return (
    <div className="min-h-screen bg-[#020617] text-white flex">
      {/* SIDEBAR */}
      <aside className="hidden lg:flex w-64 min-h-screen bg-[#07101f] border-r border-slate-800 flex-col">
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

        <nav className="flex-1 px-4 py-6 space-y-2">
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
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 font-medium"
          >
            <span>◈</span>
            <span>Models</span>
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        {/* TOP BAR */}
        <header className="h-20 border-b border-slate-800 bg-[#020617]/80 backdrop-blur flex items-center justify-between px-6 lg:px-10">
          <div>
            <p className="text-slate-500 text-sm">Machine Learning Architecture</p>
            <h1 className="text-lg font-semibold text-white">Model Benchmark & Diagnostics</h1>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-400 hover:text-white transition"
          >
            ← Back to Home
          </button>
        </header>

        {/* BODY */}
        <section className="p-6 lg:p-10 max-w-[1400px] mx-auto space-y-8">
          <div>
            <p className="text-emerald-400 font-medium text-sm mb-2">MODEL PERFORMANCE</p>
            <h2 className="text-3xl lg:text-4xl font-bold">Trained Forecast Models</h2>
            <p className="text-slate-400 mt-2 max-w-2xl">
              Strict chronological 80/20 train/test evaluation (5,112 train records, 1,284 out-of-time test records).
            </p>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Selected Best Model</p>
              <h3 className="text-xl font-bold text-white mt-2">{summary.bestModel}</h3>
              <p className="text-xs text-emerald-400 mt-1 font-semibold">Production Ready ✓</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Mean Absolute % Error</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-2">{summary.bestMAPE}%</h3>
              <p className="text-xs text-slate-400 mt-1">Under 5% Error Rate</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">R² Variance Explained</p>
              <h3 className="text-2xl font-bold text-teal-300 mt-2">{summary.bestR2}</h3>
              <p className="text-xs text-slate-400 mt-1">95.28% Explained Variance</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Root Mean Squared Error</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-2">{summary.bestRMSE} units</h3>
              <p className="text-xs text-slate-400 mt-1">MAE: {summary.bestMAE} units</p>
            </div>
          </div>

          {/* BENCHMARK TABLE */}
          <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7">
            <h3 className="text-xl font-semibold mb-1">Model Architecture Comparison</h3>
            <p className="text-sm text-slate-500 mb-6">
              Evaluated on the unseen test period (2025-06-01 to 2025-12-31)
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#020617] text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Model</th>
                    <th className="p-3.5">MAE (Units)</th>
                    <th className="p-3.5">RMSE (Units)</th>
                    <th className="p-3.5">MAPE (%)</th>
                    <th className="p-3.5">R² Score</th>
                    <th className="p-3.5">Training Time</th>
                    <th className="p-3.5 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {Object.entries(modelComparison).map(([name, m]) => {
                    const isBest = name === summary.bestModel;
                    return (
                      <tr key={name} className={isBest ? "bg-emerald-500/10" : "hover:bg-slate-800/40"}>
                        <td className={`p-3.5 font-bold ${isBest ? "text-emerald-400" : "text-white"}`}>
                          {name}
                        </td>
                        <td className="p-3.5 font-mono">{m.MAE.toFixed(2)}</td>
                        <td className="p-3.5 font-mono">{m.RMSE.toFixed(2)}</td>
                        <td className="p-3.5 font-mono font-bold text-emerald-400">{m.MAPE.toFixed(2)}%</td>
                        <td className="p-3.5 font-mono">{m.R2.toFixed(4)}</td>
                        <td className="p-3.5 font-mono text-slate-400">{m.TrainingTimeSec}s</td>
                        <td className="p-3.5">
                          {isBest ? (
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              ✓ SELECTED BEST
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Evaluated Candidate</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOP FEATURES IMPORTANCE */}
          <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7">
            <h3 className="text-xl font-semibold mb-1">Top Demand Drivers (Feature Importance)</h3>
            <p className="text-sm text-slate-500 mb-6">
              Permutation importance score on out-of-time test set
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {featureImportance.map((feat, idx) => (
                <div
                  key={feat.Feature}
                  className="p-4 rounded-xl bg-[#020617] border border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white font-mono">{feat.Feature}</p>
                      <p className="text-xs text-slate-500">
                        {feat.Feature.startsWith("rolling")
                          ? "Moving Window Average"
                          : feat.Feature.startsWith("lag")
                          ? "Autoregressive Lag"
                          : feat.Feature.includes("festival") || feat.Feature.includes("holiday")
                          ? "Occasion / Event Indicator"
                          : "Commercial / Environmental Feature"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-mono font-bold text-sm">
                      {feat.Importance.toFixed(3)}
                    </span>
                    <p className="text-[10px] text-slate-500">Importance Score</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Models;
