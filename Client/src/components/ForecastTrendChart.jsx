import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

const PALETTE = [
  "#10b981", // emerald
  "#3b82f6", // blue
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#8b5cf6", // violet
  "#06b6d4", // cyan
];

const MultiTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0b1729]/95 backdrop-blur-md border border-slate-700/90 p-3.5 rounded-2xl shadow-2xl text-xs space-y-2 min-w-[200px]">
        <p className="font-bold text-white text-sm border-b border-slate-800 pb-1 flex items-center justify-between">
          <span>📅 {label}</span>
          {payload[0]?.payload?.festival && payload[0]?.payload?.festival !== "Normal Day" && (
            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              🎉 {payload[0]?.payload?.festival}
            </span>
          )}
        </p>

        {payload.map((entry, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-white">
              {typeof entry.value === "number" ? entry.value.toFixed(1) : entry.value} units
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const ForecastTrendChart = ({ data = [], selectedProduct = "ALL" }) => {
  const [chartType, setChartType] = useState("area"); // 'area' | 'bar' | 'pie'

  // Prepare data for line/bar trend
  const formattedData = data.map((d) => ({
    ...d,
    dateLabel: d.date ? d.date.slice(5) : "",
    predictedSales: Number(d.predictedSales.toFixed(1)),
    availableStock: Number(d.availableStock.toFixed(1)),
    materialRequirement: Number(d.materialRequirement.toFixed(1)),
    safetyBuffer: Number(d.safetyBufferUnits.toFixed(1)),
  }));

  // Aggregate for Pie Chart (Occasion Share or Product Share)
  const pieMap = {};
  data.forEach((d) => {
    const key = selectedProduct === "ALL" ? d.product : d.festival || "Normal Day";
    pieMap[key] = (pieMap[key] || 0) + d.predictedSales;
  });

  const pieData = Object.entries(pieMap).map(([name, value], idx) => ({
    name,
    value: Number(value.toFixed(1)),
    fill: PALETTE[idx % PALETTE.length],
  }));

  return (
    <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-6 lg:p-7 space-y-5">
      {/* HEADER & TOGGLER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">14-Day Forecast & Inventory Trajectory</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
              Dynamic Visualizer
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracking predicted demand, on-hand available stock, and net procurement needs
          </p>
        </div>

        {/* CHART TOGGLER BUTTONS */}
        <div className="flex items-center bg-[#020617] p-1 rounded-2xl border border-slate-800 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setChartType("area")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              chartType === "area"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📈</span>
            <span>Trend Area</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              chartType === "bar"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>📊</span>
            <span>Bar Compare</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("pie")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              chartType === "pie"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <span>🍩</span>
            <span>{selectedProduct === "ALL" ? "Product Share" : "Occasion Share"}</span>
          </button>
        </div>
      </div>

      {/* CHART VIEWPORT */}
      <div className="w-full h-[340px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "area" ? (
            <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <defs>
                <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="reqGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
              />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: "#1e293b" }} />
              <Tooltip content={<MultiTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "10px" }} />
              <Area
                type="monotone"
                name="Predicted Demand"
                dataKey="predictedSales"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#predictedGrad)"
              />
              <Area
                type="monotone"
                name="Available Stock"
                dataKey="availableStock"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#stockGrad)"
              />
              <Area
                type="monotone"
                name="Net Requirement"
                dataKey="materialRequirement"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#reqGrad)"
              />
            </AreaChart>
          ) : chartType === "bar" ? (
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey="dateLabel"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
              />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={{ stroke: "#1e293b" }} />
              <Tooltip content={<MultiTooltip />} cursor={{ fill: "rgba(51, 65, 85, 0.2)" }} />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94a3b8", paddingTop: "10px" }} />
              <Bar name="Predicted Demand" dataKey="predictedSales" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar name="Available Stock" dataKey="availableStock" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar name="Net Requirement" dataKey="materialRequirement" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0];
                    return (
                      <div className="bg-[#0b1729]/95 backdrop-blur-md border border-slate-700/90 p-3 rounded-xl shadow-2xl text-xs space-y-1">
                        <p className="font-bold text-white text-sm">{item.name}</p>
                        <p className="text-emerald-400 font-mono font-bold">
                          {item.value.toFixed(1)} total units
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={115}
                paddingAngle={4}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: "#475569", strokeWidth: 1 }}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }} />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastTrendChart;
