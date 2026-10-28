import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FORECAST_DATA } from "../data/forecastData";
import { API_BASE_URL } from "../config";

const Models = () => {
  const navigate = useNavigate();
  const { summary: defaultSummary, modelComparison: defaultComparison, featureImportance } = FORECAST_DATA;

  const [modelStatus, setModelStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [training, setTraining] = useState(false);
  const [trainMessage, setTrainMessage] = useState("");
  const [trainError, setTrainError] = useState("");

  const fetchModelStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/models/status`, {
        withCredentials: true,
      });
      if (res.data?.success && res.data?.trained) {
        setModelStatus(res.data.model);
      } else {
        setModelStatus(null);
      }
    } catch (err) {
      console.warn("Could not fetch dynamic model status:", err.message);
      setModelStatus(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelStatus();
  }, []);

  const handleTrainModel = async () => {
    try {
      setTraining(true);
      setTrainMessage("");
      setTrainError("");

      const res = await axios.post(
        `${API_BASE_URL}/models/train`,
        {},
        { withCredentials: true }
      );

      if (res.data?.success) {
        setTrainMessage(res.data.message || "Model trained successfully!");
        if (res.data.model) {
          setModelStatus(res.data.model);
        } else {
          await fetchModelStatus();
        }
      } else {
        setTrainError(res.data?.message || "Training failed.");
      }
    } catch (err) {
      console.error("Train error:", err);
      setTrainError(
        err.response?.data?.message ||
          "Model training failed. Please ensure your Python ML service is running and connected."
      );
    } finally {
      setTraining(false);
    }
  };

  // Determine active metrics (dynamic if trained, otherwise baseline demo)
  const isDynamic = Boolean(modelStatus);
  const activeModelName = modelStatus?.name || defaultSummary.bestModel;
  const activeMAPE = modelStatus?.metrics?.mape ?? defaultSummary.bestMAPE;
  const activeRMSE = modelStatus?.metrics?.rmse ?? defaultSummary.bestRMSE;
  const activeMAE = modelStatus?.metrics?.mae ?? defaultSummary.bestMAE;
  const activeTrainRecords = modelStatus?.trainingRecords ?? defaultSummary.historicalRecords;
  const activeProducts = modelStatus?.products || ["Tomato", "Potato", "Milk", "Rice", "Onion", "Bread"];

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
          <div className="flex items-center gap-3">
            <button
              onClick={handleTrainModel}
              disabled={training}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {training ? (
                <>
                  <span className="animate-spin inline-block">↻</span>
                  <span>Training ML Model...</span>
                </>
              ) : (
                <>
                  <span>⚡</span>
                  <span>{isDynamic ? "Retrain Model" : "Train ML Model Now"}</span>
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/")}
              className="text-sm text-slate-400 hover:text-white transition hidden sm:inline-block ml-2"
            >
              ← Back to Home
            </button>
          </div>
        </header>

        {/* BODY */}
        <section className="p-6 lg:p-10 max-w-[1400px] mx-auto space-y-8">
          {/* BANNER ALERTS */}
          {trainMessage && (
            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>✓</span>
                <span>{trainMessage}</span>
              </span>
              <button
                onClick={() => setTrainMessage("")}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {trainError && (
            <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>⚠</span>
                <span>{trainError}</span>
              </span>
              <button
                onClick={() => setTrainError("")}
                className="text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <p className="text-emerald-400 font-medium text-sm">MODEL PERFORMANCE</p>
                {isDynamic ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live Custom Model Trained ✓
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                    Demo Baseline (Ready to Train)
                  </span>
                )}
              </div>
              <h2 className="text-3xl lg:text-4xl font-bold mt-1">Trained Forecast Models</h2>
              <p className="text-slate-400 mt-2 max-w-2xl text-sm">
                {isDynamic && modelStatus.trainingPeriod ? (
                  <>
                    Trained on your custom dataset from{" "}
                    <strong className="text-white">{modelStatus.trainingPeriod.start}</strong> to{" "}
                    <strong className="text-white">{modelStatus.trainingPeriod.end}</strong> (
                    {activeTrainRecords.toLocaleString()} training records).
                  </>
                ) : (
                  "Strict chronological 80/20 train/test evaluation on clean multi-factor records."
                )}
              </p>
            </div>

            <button
              onClick={handleTrainModel}
              disabled={training}
              className="sm:hidden w-full py-3 rounded-xl bg-emerald-500 text-slate-950 font-bold text-sm"
            >
              {training ? "Training..." : "⚡ Train ML Model Now"}
            </button>
          </div>

          {/* DYNAMIC PRODUCTS BADGE LIST */}
          <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-400 uppercase font-semibold">
                Active Trained Products ({activeProducts.length})
              </p>
              <button
                onClick={() => navigate("/predictions")}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold"
              >
                Forecast These Products →
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeProducts.map((p) => (
                <span
                  key={p}
                  className="px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                >
                  📦 {p}
                </span>
              ))}
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Selected Best Model</p>
              <h3 className="text-xl font-bold text-white mt-2">{activeModelName}</h3>
              <p className="text-xs text-emerald-400 mt-1 font-semibold">
                {isDynamic ? "Custom Trained ✓" : "Production Baseline ✓"}
              </p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Overall Accuracy Score</p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-2">{(100 - activeMAPE).toFixed(2)}%</h3>
              <p className="text-xs text-slate-400 mt-1">{activeMAPE}% MAPE Deviation</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Model Performance Score</p>
              <h3 className="text-2xl font-bold text-blue-400 mt-2">
                {modelStatus?.metrics?.r2 ? (Number(modelStatus.metrics.r2) * 100).toFixed(2) : (defaultSummary.bestR2 * 100).toFixed(2)}%
              </h3>
              <p className="text-xs text-slate-400 mt-1">R² Variance Explained (0.9528)</p>
            </div>

            <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
              <p className="text-slate-400 text-xs uppercase font-medium">Root Mean Squared Error</p>
              <h3 className="text-2xl font-bold text-teal-300 mt-2">{activeRMSE} units</h3>
              <p className="text-xs text-slate-400 mt-1">MAE: {activeMAE} units/day</p>
            </div>
          </div>

          {/* BENCHMARK TABLE */}
          <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold mb-1">Model Architecture Comparison</h3>
                <p className="text-sm text-slate-500">
                  {isDynamic
                    ? "Candidate models evaluated on your out-of-sample validation period"
                    : "Evaluated on the unseen test period (2025-06-01 to 2025-12-31)"}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#020617] text-slate-400 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Model Architecture</th>
                    <th className="p-3.5">Accuracy Score</th>
                    <th className="p-3.5">Performance Score</th>
                    <th className="p-3.5">MAE (Units)</th>
                    <th className="p-3.5">RMSE (Units)</th>
                    <th className="p-3.5">MAPE (%)</th>
                    <th className="p-3.5 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {modelStatus?.candidates ? (
                    modelStatus.candidates.map((c) => {
                      const isBest = c.model === activeModelName;
                      const mapeVal = Number(c.mape || 0);
                      const accVal = (100 - mapeVal).toFixed(2);
                      const perfVal = c.performanceScore != null
                        ? Number(c.performanceScore).toFixed(2)
                        : c.r2 != null
                        ? (Number(c.r2) * 100).toFixed(2)
                        : (100 - (Number(c.rmse || 33) / 50) * 10).toFixed(2);
                      const r2Display = c.r2 != null ? Number(c.r2).toFixed(4) : null;

                      return (
                        <tr
                          key={c.model}
                          className={isBest ? "bg-emerald-500/10" : "hover:bg-slate-800/40"}
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`font-bold ${isBest ? "text-emerald-400" : "text-white"}`}>
                                {c.model}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                🎯 {accVal}% Acc
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                ⚡ {perfVal}% Perf
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-emerald-400">{accVal}%</span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-blue-400">
                              {perfVal}%
                              {r2Display && (
                                <span className="text-[11px] text-slate-400 ml-1.5 font-normal">(R² {r2Display})</span>
                              )}
                            </div>
                          </td>
                          <td className="p-3.5 font-mono">{c.mae}</td>
                          <td className="p-3.5 font-mono">{c.rmse}</td>
                          <td className="p-3.5 font-mono text-slate-300">{c.mape}%</td>
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
                    })
                  ) : (
                    Object.entries(defaultComparison).map(([name, m]) => {
                      const isBest = name === defaultSummary.bestModel;
                      const mapeVal = Number(m.MAPE);
                      const accVal = (100 - mapeVal).toFixed(2);
                      const perfVal = (Number(m.R2) * 100).toFixed(2);

                      return (
                        <tr
                          key={name}
                          className={isBest ? "bg-emerald-500/10" : "hover:bg-slate-800/40"}
                        >
                          <td className="p-3.5">
                            <div className="flex items-center gap-2.5 flex-wrap">
                              <span className={`font-bold ${isBest ? "text-emerald-400" : "text-white"}`}>
                                {name}
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                🎯 {accVal}% Acc
                              </span>
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                                ⚡ {perfVal}% Perf
                              </span>
                            </div>
                          </td>
                          <td className="p-3.5">
                            <span className="font-mono font-bold text-emerald-400">{accVal}%</span>
                          </td>
                          <td className="p-3.5">
                            <div className="font-mono font-bold text-blue-400">
                              {perfVal}%
                              <span className="text-[11px] text-slate-400 ml-1.5 font-normal">(R² {m.R2.toFixed(4)})</span>
                            </div>
                          </td>
                          <td className="p-3.5 font-mono">{m.MAE.toFixed(2)}</td>
                          <td className="p-3.5 font-mono">{m.RMSE.toFixed(2)}</td>
                          <td className="p-3.5 font-mono text-slate-300">{m.MAPE.toFixed(2)}%</td>
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
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* TOP FEATURES IMPORTANCE */}
          <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7">
            <h3 className="text-xl font-semibold mb-1">Top Demand Drivers (Feature Importance)</h3>
            <p className="text-sm text-slate-500 mb-6">
              Permutation importance score evaluating commercial, seasonal, and temporal lag factors
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
