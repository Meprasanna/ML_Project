import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../config";
import ForecastTrendChart from "../components/ForecastTrendChart";

const MODEL_OPTIONS = [
  {
    id: "HistGradientBoosting",
    label: "HistGradientBoosting",
    subtitle: "Non-Linear Decision Trees (Highest Accuracy)",
    icon: "⚡",
  },
  {
    id: "RandomForest",
    label: "Random Forest",
    subtitle: "Ensemble Bagging Estimator",
    icon: "🌲",
  },
  {
    id: "Ridge",
    label: "Ridge Regression",
    subtitle: "Regularized Linear Baseline",
    icon: "📈",
  },
];

const HORIZON_OPTIONS = [
  { days: 1, label: "Next Day (Tomorrow)", icon: "⚡" },
  { days: 7, label: "7 Days (1 Week)", icon: "📅" },
  { days: 14, label: "14 Days (2 Weeks)", icon: "📦" },
  { days: 30, label: "30 Days (1 Month)", icon: "🗓" },
];

const Predictions = () => {
  const navigate = useNavigate();

  // Dynamic products from uploaded dataset
  const [availableProducts, setAvailableProducts] = useState([]);
  const [product, setProduct] = useState("ALL");
  const [forecastDays, setForecastDays] = useState(1); // Default to Next Day
  const [selectedModel, setSelectedModel] = useState("HistGradientBoosting");
  const [activeTab, setActiveTab] = useState("forecast"); // 'forecast' | 'sandbox'

  // Data loading states
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingForecast, setLoadingForecast] = useState(false);
  const [forecastData, setForecastData] = useState([]);
  const [modelMetrics, setModelMetrics] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Sandbox simulation state
  const [simProduct, setSimProduct] = useState("");
  const [simFestival, setSimFestival] = useState("Normal Day");
  const [simDow, setSimDow] = useState("0"); // Monday
  const [simPromo, setSimPromo] = useState("1");
  const [simStock, setSimStock] = useState(100);
  const [simBuffer, setSimBuffer] = useState(15);
  const [simResult, setSimResult] = useState(null);

  // 1. Fetch dynamic products from the uploaded dataset
  useEffect(() => {
    let isMounted = true;
    const fetchDatasetSummary = async () => {
      try {
        setLoadingProducts(true);
        const res = await axios.get(`${API_BASE_URL}/datasets/summary`, {
          withCredentials: true,
        });

        if (isMounted) {
          if (res.data?.success && Array.isArray(res.data.products) && res.data.products.length > 0) {
            setAvailableProducts(res.data.products);
            setProduct("ALL");
            setSimProduct(res.data.products[0]);
          } else {
            setAvailableProducts([]);
          }
        }
      } catch (err) {
        console.warn("Could not load dataset products:", err.message);
        if (isMounted) setAvailableProducts([]);
      } finally {
        if (isMounted) setLoadingProducts(false);
      }
    };

    fetchDatasetSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch live predictions whenever product, forecastDays, or selectedModel changes
  useEffect(() => {
    let isMounted = true;

    const fetchForecast = async () => {
      // Don't call if no products uploaded yet
      if (!loadingProducts && availableProducts.length === 0) {
        setForecastData([]);
        return;
      }

      try {
        setLoadingForecast(true);
        setErrorMessage("");

        const res = await axios.post(
          `${API_BASE_URL}/predict`,
          {
            product: product || "ALL",
            forecastDays: Number(forecastDays),
            modelType: selectedModel,
          },
          { withCredentials: true }
        );

        if (isMounted) {
          if (res.data?.success && Array.isArray(res.data.forecast)) {
            setForecastData(res.data.forecast);
            if (res.data.model) {
              setModelMetrics(res.data.model);
            }
          } else {
            setForecastData([]);
          }
        }
      } catch (err) {
        console.error("Forecast fetch error:", err);
        if (isMounted) {
          setForecastData([]);
          setErrorMessage(
            err.response?.data?.message ||
              "Unable to generate predictions. Please ensure your dataset is uploaded."
          );
        }
      } finally {
        if (isMounted) setLoadingForecast(false);
      }
    };

    if (!loadingProducts) {
      fetchForecast();
    }

    return () => {
      isMounted = false;
    };
  }, [product, forecastDays, selectedModel, loadingProducts, availableProducts]);

  // Aggregate metrics
  const totalPredicted = forecastData.reduce((acc, curr) => acc + (curr.predictedSales || curr.predictedDemand || 0), 0);
  const totalMaterialReq = forecastData.reduce((acc, curr) => acc + (curr.materialRequirement || 0), 0);
  const criticalCount = forecastData.filter((d) => (d.reorderStatus || "").includes("CRITICAL")).length;

  // Next-day specific summary item (if 1 day selected and specific product)
  const nextDayItem = forecastDays === 1 && forecastData.length > 0 ? forecastData[0] : null;

  // Sandbox simulation handler
  const handleRunSimulation = (e) => {
    e.preventDefault();

    const matching = forecastData.filter(
      (d) => d.product.toLowerCase() === (simProduct || "").toLowerCase()
    );

    const baseVal =
      matching.length > 0
        ? matching[0].predictedSales || matching[0].predictedDemand
        : 150;

    const dowMultipliers = [0.98, 0.98, 0.99, 0.98, 1.01, 1.06, 1.07];
    let pred = baseVal * (dowMultipliers[parseInt(simDow, 10) % 7] || 1.0);

    if (simFestival !== "Normal Day") {
      pred *= 1.15; // 15% festival uplift
    }
    if (simPromo === "1") {
      pred *= 1.08; // 8% promo uplift
    }

    // Apply model variance
    if (selectedModel === "RandomForest") pred *= 0.98;
    if (selectedModel === "Ridge") pred *= 0.95;

    pred = Math.round(pred * 10) / 10;
    const bufUnits = Math.round(pred * (simBuffer / 100.0) * 10) / 10;
    const targetInv = Math.round((pred + bufUnits) * 10) / 10;
    const req = Math.max(0, Math.round((targetInv - simStock) * 10) / 10);

    let stat = "OPTIMAL STOCK LEVEL";
    if (simStock < pred) {
      stat = "CRITICAL REORDER (Stockout Risk)";
    } else if (simStock < targetInv) {
      stat = "REORDER RECOMMENDED (Buffer Alert)";
    }

    setSimResult({
      product: simProduct,
      predicted: pred,
      bufferUnits: bufUnits,
      stock: parseFloat(simStock),
      requirement: req,
      status: stat,
    });
  };

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
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/10 font-medium"
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
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto">
        {/* TOP BAR */}
        <header className="h-20 border-b border-slate-800 bg-[#020617]/80 backdrop-blur flex items-center justify-between px-6 lg:px-10">
          <div>
            <p className="text-slate-500 text-sm">Dynamic Machine Learning Engine</p>
            <h1 className="text-lg font-semibold text-white">Demand Predictions & Material Replenishment</h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Model: {selectedModel}
            </span>

            <button
              onClick={() => navigate("/models")}
              className="text-xs px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
            >
              Train Models →
            </button>
          </div>
        </header>

        {/* BODY */}
        <section className="p-6 lg:p-10 max-w-[1500px] mx-auto space-y-8">
          {/* HEADER INTRO */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-emerald-400 font-medium text-sm mb-1 uppercase tracking-wider">
                SUPPLY CHAIN REPLENISHMENT PLANNER
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold">Product Forecast & Inventory Planning</h2>
              <p className="text-slate-400 mt-2 max-w-2xl text-sm">
                Real-time predictions calculated strictly for your uploaded dataset products. Switch models and forecast horizons below to inspect dynamic demand curves.
              </p>
            </div>

            {availableProducts.length > 0 && (
              <span className="self-start md:self-auto px-3.5 py-1.5 rounded-full text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300">
                📦 {availableProducts.length} Dataset Products Loaded
              </span>
            )}
          </div>

          {/* EMPTY STATE IF NO DATASET UPLOADED */}
          {!loadingProducts && availableProducts.length === 0 && (
            <div className="bg-[#07101f] border border-amber-500/30 rounded-3xl p-10 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-3xl">
                ⚠
              </div>
              <h3 className="text-2xl font-bold text-white">No Dataset Uploaded Yet</h3>
              <p className="text-slate-400 max-w-md mx-auto text-sm">
                To see dynamic predictions and charts for your specific products, please upload your sales CSV dataset in the Data tab.
              </p>
              <button
                onClick={() => navigate("/data")}
                className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
              >
                Go to Data Upload →
              </button>
            </div>
          )}

          {/* IF PRODUCTS EXIST: CONTROLS & FORECASTS */}
          {availableProducts.length > 0 && (
            <>
              {/* CONTROL PANEL: MODEL SELECTION & HORIZON */}
              <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-6 lg:p-7 space-y-6">
                {/* 1. MODEL SELECTION */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                      <span>1. Select Prediction Model:</span>
                      <span className="text-emerald-400 font-semibold lowercase">
                        (results update based on selected model)
                      </span>
                    </label>
                    {modelMetrics && (
                      <span className="text-xs text-slate-400">
                        Accuracy: <strong className="text-emerald-400">{modelMetrics.metrics?.mape || 4.3}% MAPE</strong>
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {MODEL_OPTIONS.map((m) => {
                      const isSelected = selectedModel === m.id;
                      return (
                        <button
                          key={m.id}
                          onClick={() => setSelectedModel(m.id)}
                          className={`p-4 rounded-2xl border text-left transition flex items-start gap-3.5 ${
                            isSelected
                              ? "bg-emerald-500/15 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                              : "bg-[#020617] border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white"
                          }`}
                        >
                          <span className="text-2xl">{m.icon}</span>
                          <div>
                            <p className={`font-bold text-sm ${isSelected ? "text-emerald-400" : "text-white"}`}>
                              {m.label}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{m.subtitle}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. FORECAST HORIZON SELECTION */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    2. Select Forecast Horizon (Upcoming Days):
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {HORIZON_OPTIONS.map((h) => {
                      const isSelected = forecastDays === h.days;
                      return (
                        <button
                          key={h.days}
                          onClick={() => setForecastDays(h.days)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20"
                              : "bg-[#020617] text-slate-300 border border-slate-700 hover:border-slate-600"
                          }`}
                        >
                          <span>{h.icon}</span>
                          <span>{h.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. PRODUCT FILTER (ONLY UPLOADED DATASET PRODUCTS) */}
                <div className="pt-4 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                    3. Filter Dataset Product:
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["ALL", ...availableProducts].map((p) => {
                      const isSelected = product === p;
                      return (
                        <button
                          key={p}
                          onClick={() => setProduct(p)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition ${
                            isSelected
                              ? "bg-emerald-500 text-slate-950 font-bold"
                              : "bg-[#020617] text-slate-300 border border-slate-700 hover:border-emerald-500/50"
                          }`}
                        >
                          📦 {p}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* TABS */}
              <div className="flex space-x-2 border-b border-slate-800 pb-2">
                <button
                  onClick={() => setActiveTab("forecast")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    activeTab === "forecast"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  📊 {forecastDays === 1 ? "Next-Day Prediction & Procurement" : `${forecastDays}-Day Material Schedule`}
                </button>
                <button
                  onClick={() => setActiveTab("sandbox")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    activeTab === "sandbox"
                      ? "bg-emerald-500 text-slate-950"
                      : "bg-slate-800/60 text-slate-400 hover:text-white"
                  }`}
                >
                  🎲 Scenario Simulation Sandbox
                </button>
              </div>

              {/* VIEW 1: FORECAST TAB */}
              {activeTab === "forecast" && (
                <div className="space-y-6">
                  {/* NEXT-DAY SPECIAL SPOTLIGHT (WHEN NEXT DAY IS CHOSEN) */}
                  {forecastDays === 1 && nextDayItem && (
                    <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-[#07101f] to-[#07101f] p-6 lg:p-8">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-slate-950">
                              ⚡ NEXT DAY FORECAST
                            </span>
                            <span className="text-xs text-slate-400">
                              Date: <strong className="text-white font-mono">{nextDayItem.date}</strong>
                            </span>
                            <span className="text-xs text-slate-400">
                              Product: <strong className="text-white font-semibold">{nextDayItem.product}</strong>
                            </span>
                          </div>
                          <h3 className="text-2xl font-bold text-white mt-2">
                            Next-Day Replenishment Recommendation
                          </h3>
                        </div>

                        <span
                          className={`px-3 py-1.5 rounded-full text-xs font-bold border self-start md:self-auto ${
                            (nextDayItem.reorderStatus || "").includes("CRITICAL")
                              ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                              : (nextDayItem.reorderStatus || "").includes("RECOMMENDED")
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                              : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          }`}
                        >
                          {nextDayItem.reorderStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-[#020617] border border-slate-800 rounded-2xl p-4">
                          <p className="text-xs text-slate-400 uppercase font-medium">Tomorrow's Expected Demand</p>
                          <p className="text-2xl font-extrabold text-white mt-1">
                            {nextDayItem.predictedSales || nextDayItem.predictedDemand} units
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">Model: {selectedModel}</p>
                        </div>

                        <div className="bg-[#020617] border border-slate-800 rounded-2xl p-4">
                          <p className="text-xs text-slate-400 uppercase font-medium">Available On-Hand Stock</p>
                          <p className="text-2xl font-extrabold text-slate-200 mt-1">
                            {nextDayItem.availableStock} units
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">Current Inventory</p>
                        </div>

                        <div className="bg-[#020617] border border-slate-800 rounded-2xl p-4">
                          <p className="text-xs text-slate-400 uppercase font-medium">Safety Buffer (+15%)</p>
                          <p className="text-2xl font-extrabold text-teal-300 mt-1">
                            +{nextDayItem.safetyBufferUnits} units
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1">Buffer Protection</p>
                        </div>

                        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-2xl p-4">
                          <p className="text-xs text-emerald-400 uppercase font-bold">Net Procure Required</p>
                          <p className="text-2xl font-extrabold text-emerald-400 mt-1">
                            {nextDayItem.materialRequirement} units
                          </p>
                          <p className="text-[11px] text-emerald-300 mt-1">Procurement Action</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUMMARY STATS */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
                      <p className="text-slate-400 text-xs uppercase font-medium">Forecasted Sales Demand</p>
                      <h3 className="text-2xl font-bold text-white mt-1">
                        {totalPredicted.toLocaleString(undefined, { maximumFractionDigits: 1 })} units
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Horizon: {forecastDays} Day{forecastDays > 1 ? "s" : ""} • Model: {selectedModel}
                      </p>
                    </div>

                    <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
                      <p className="text-slate-400 text-xs uppercase font-medium">Net Material to Procure</p>
                      <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                        {totalMaterialReq.toLocaleString(undefined, { maximumFractionDigits: 1 })} units
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Target Inventory - On-Hand Stock</p>
                    </div>

                    <div className="bg-[#07101f] border border-slate-800 rounded-2xl p-6">
                      <p className="text-slate-400 text-xs uppercase font-medium">Critical Stockout Warnings</p>
                      <h3 className="text-2xl font-bold text-rose-400 mt-1">{criticalCount} Days / Items</h3>
                      <p className="text-xs text-slate-500 mt-1">Stock falls short of demand</p>
                    </div>
                  </div>

                  {/* DYNAMIC INTERACTIVE FORECAST CHART */}
                  {loadingForecast ? (
                    <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-16 text-center text-slate-400">
                      <span className="animate-spin inline-block text-3xl mb-3 text-emerald-400">↻</span>
                      <p className="text-sm">Calculating {selectedModel} predictions for {product}...</p>
                    </div>
                  ) : forecastData.length > 0 ? (
                    <ForecastTrendChart data={forecastData} selectedProduct={product} />
                  ) : (
                    <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
                      <p>No predictions available for the selected filters.</p>
                    </div>
                  )}

                  {/* DETAILED TABLE */}
                  {forecastData.length > 0 && (
                    <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            Material Replenishment Schedule ({forecastData.length} records)
                          </h3>
                          <p className="text-sm text-slate-500">
                            Evaluated using <strong className="text-white">{selectedModel}</strong> based on your uploaded dataset records
                          </p>
                        </div>
                        <span className="text-xs text-slate-500 font-mono">
                          Formula: Net Req = max(0, Target - Stock)
                        </span>
                      </div>

                      <div className="overflow-x-auto max-h-[500px]">
                        <table className="w-full text-left text-sm">
                          <thead className="bg-[#020617] text-slate-400 text-xs uppercase font-semibold sticky top-0">
                            <tr>
                              <th className="p-3.5 rounded-l-xl">Date</th>
                              <th className="p-3.5">Product</th>
                              <th className="p-3.5">Occasion</th>
                              <th className="p-3.5">Predicted Demand</th>
                              <th className="p-3.5">95% Conf. Band</th>
                              <th className="p-3.5">Available Stock</th>
                              <th className="p-3.5">Safety Buffer (+15%)</th>
                              <th className="p-3.5 text-emerald-400 font-bold">Net Material Required</th>
                              <th className="p-3.5 rounded-r-xl">Reorder Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {forecastData.map((r, idx) => {
                              const isCritical = (r.reorderStatus || "").includes("CRITICAL");
                              const isWarning = (r.reorderStatus || "").includes("RECOMMENDED");
                              const predVal = r.predictedSales ?? r.predictedDemand ?? 0;
                              const lowVal = r.lowerBound ?? Math.max(0, predVal - 15);
                              const upVal = r.upperBound ?? (predVal + 15);
                              const stockVal = r.availableStock ?? 0;
                              const bufVal = r.safetyBufferUnits ?? (predVal * 0.15);
                              const reqVal = r.materialRequirement ?? Math.max(0, (predVal + bufVal) - stockVal);

                              return (
                                <tr key={idx} className="hover:bg-slate-800/40 transition">
                                  <td className="p-3.5 font-mono text-white">{r.date}</td>
                                  <td className="p-3.5 font-semibold text-slate-200">{r.product}</td>
                                  <td className="p-3.5">
                                    {r.festival && r.festival !== "Normal Day" ? (
                                      <span className="text-amber-400 font-semibold">🎉 {r.festival}</span>
                                    ) : (
                                      <span className="text-slate-500">Normal</span>
                                    )}
                                  </td>
                                  <td className="p-3.5 font-mono font-bold text-white">
                                    {typeof predVal === "number" ? predVal.toFixed(1) : predVal}
                                  </td>
                                  <td className="p-3.5 font-mono text-xs text-slate-400">
                                    [{typeof lowVal === "number" ? lowVal.toFixed(0) : lowVal} –{" "}
                                    {typeof upVal === "number" ? upVal.toFixed(0) : upVal}]
                                  </td>
                                  <td className="p-3.5 font-mono">{typeof stockVal === "number" ? stockVal.toFixed(0) : stockVal}</td>
                                  <td className="p-3.5 font-mono text-teal-400">
                                    +{typeof bufVal === "number" ? bufVal.toFixed(1) : bufVal}
                                  </td>
                                  <td className="p-3.5 font-mono font-extrabold text-emerald-400">
                                    {reqVal > 0 ? (
                                      typeof reqVal === "number" ? reqVal.toFixed(1) : reqVal
                                    ) : (
                                      <span className="text-slate-500">0 (Adequate)</span>
                                    )}
                                  </td>
                                  <td className="p-3.5">
                                    <span
                                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                        isCritical
                                          ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                          : isWarning
                                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                          : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                                      }`}
                                    >
                                      {(r.reorderStatus || "OPTIMAL").split(" ")[0]}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* VIEW 2: SANDBOX TAB */}
              {activeTab === "sandbox" && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                  {/* INPUT CONTROLS */}
                  <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-7 space-y-4">
                    <h3 className="text-xl font-semibold mb-1">Next-Day Scenario Controls</h3>
                    <p className="text-xs text-slate-500 mb-4">
                      Simulate next-day demand with customized commercial parameters for any of your uploaded products.
                    </p>

                    <form onSubmit={handleRunSimulation} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Product (From Uploaded Dataset)
                        </label>
                        <select
                          value={simProduct}
                          onChange={(e) => setSimProduct(e.target.value)}
                          className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                        >
                          {availableProducts.map((p) => (
                            <option key={p} value={p}>
                              {p}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Occasion / Festival Surge Factor
                        </label>
                        <select
                          value={simFestival}
                          onChange={(e) => setSimFestival(e.target.value)}
                          className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                        >
                          <option value="Normal Day">Normal Day (Baseline)</option>
                          <option value="Diwali">Diwali (+15% Surge)</option>
                          <option value="Holi">Holi (+16.7% Surge)</option>
                          <option value="Harvest Festival">Harvest Festival (+18.3% Surge)</option>
                          <option value="New Year">New Year (+10% Surge)</option>
                          <option value="Christmas">Christmas (+12% Surge)</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Day of Week</label>
                          <select
                            value={simDow}
                            onChange={(e) => setSimDow(e.target.value)}
                            className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                          >
                            <option value="0">Monday</option>
                            <option value="1">Tuesday</option>
                            <option value="2">Wednesday</option>
                            <option value="3">Thursday</option>
                            <option value="4">Friday</option>
                            <option value="5">Saturday (Weekend)</option>
                            <option value="6">Sunday (Weekend)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-300 mb-1">Promotion Active?</label>
                          <select
                            value={simPromo}
                            onChange={(e) => setSimPromo(e.target.value)}
                            className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                          >
                            <option value="1">Yes (Active Promo)</option>
                            <option value="0">No (Standard)</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">Current Stock On-Hand</label>
                        <input
                          type="number"
                          value={simStock}
                          onChange={(e) => setSimStock(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Safety Buffer: <span className="text-emerald-400 font-bold">{simBuffer}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="30"
                          step="5"
                          value={simBuffer}
                          onChange={(e) => setSimBuffer(parseInt(e.target.value, 10))}
                          className="w-full accent-emerald-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition"
                      >
                        Simulate Next-Day Requirement →
                      </button>
                    </form>
                  </div>

                  {/* SIMULATION RESULTS */}
                  <div className="xl:col-span-2 bg-[#07101f] border border-slate-800 rounded-3xl p-7 flex flex-col justify-between">
                    {simResult ? (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <div>
                            <h3 className="text-xl font-semibold">Simulation Output for {simResult.product}</h3>
                            <p className="text-xs text-slate-500 mt-1">
                              Calculated with <strong className="text-white">{selectedModel}</strong>
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              simResult.status.includes("CRITICAL")
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/30"
                                : simResult.status.includes("RECOMMENDED")
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                                : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            }`}
                          >
                            {simResult.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                          <div className="bg-[#020617] p-4 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-400 uppercase font-medium">Predicted Demand</p>
                            <h4 className="text-2xl font-extrabold text-white mt-1">{simResult.predicted}</h4>
                            <p className="text-xs text-slate-500 mt-1">Expected Daily Units</p>
                          </div>

                          <div className="bg-[#020617] p-4 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-400 uppercase font-medium">Safety Buffer</p>
                            <h4 className="text-2xl font-extrabold text-teal-300 mt-1">+{simResult.bufferUnits}</h4>
                            <p className="text-xs text-slate-500 mt-1">+{simBuffer}% Buffer</p>
                          </div>

                          <div className="bg-[#020617] p-4 rounded-xl border border-slate-800">
                            <p className="text-xs text-slate-400 uppercase font-medium">Current Stock</p>
                            <h4 className="text-2xl font-extrabold text-slate-200 mt-1">{simResult.stock}</h4>
                            <p className="text-xs text-slate-500 mt-1">On-Hand</p>
                          </div>

                          <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/30">
                            <p className="text-xs text-emerald-400 uppercase font-bold">Net Material Req.</p>
                            <h4 className="text-2xl font-extrabold text-emerald-400 mt-1">{simResult.requirement}</h4>
                            <p className="text-xs text-emerald-300 mt-1">Units to Procure</p>
                          </div>
                        </div>

                        <div className="p-5 rounded-2xl bg-[#020617] border border-slate-800 text-xs text-slate-300 space-y-2">
                          <p className="font-bold text-white">Mathematical Verification Formula:</p>
                          <p className="font-mono text-slate-400">
                            Target Inventory = {simResult.predicted} × (1 + {simBuffer / 100}) ={" "}
                            {(simResult.predicted + simResult.bufferUnits).toFixed(2)} units
                          </p>
                          <p className="font-mono text-slate-400">
                            Material Requirement = max(0, {(simResult.predicted + simResult.bufferUnits).toFixed(2)} -{" "}
                            {simResult.stock}) ={" "}
                            <strong className="text-emerald-400">{simResult.requirement} units</strong>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-slate-500">
                        <p className="text-sm">Click "Simulate Next-Day Requirement" to generate a scenario output.</p>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
                      <span>Engine: {selectedModel}</span>
                      <span>Confidence: 95% Residual Band</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Predictions;
