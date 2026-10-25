import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
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
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // violet
  "#f59e0b", // amber
  "#ec4899", // pink
  "#f43f5e", // rose
  "#14b8a6", // teal
  "#6366f1", // indigo
];

// Dark mode glassmorphic tooltip
const CustomTooltip = ({ active, payload, label, valueKey, valueSuffix = "units" }) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-[#0b1729]/95 backdrop-blur-md border border-slate-700/90 p-3.5 rounded-2xl shadow-2xl text-xs space-y-1.5 min-w-[160px]">
        <p className="font-bold text-white text-sm border-b border-slate-800/80 pb-1">
          {label || item.name}
        </p>
        <div className="flex items-center justify-between gap-4 pt-1">
          <span className="flex items-center gap-2 text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: item.color || item.payload?.fill || "#10b981" }}
            />
            {item.name || valueKey}:
          </span>
          <span className="font-mono font-bold text-emerald-400">
            {typeof item.value === "number" ? item.value.toFixed(1) : item.value} {valueSuffix}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export const AnalyticsChartCard = ({
  title,
  subtitle,
  badgeText = "Surge Index",
  badgeColor = "emerald",
  data = [],
  nameKey = "name",
  valueKey = "value",
  valueSuffix = "units",
  defaultChartType = "bar",
}) => {
  const [chartType, setChartType] = useState(defaultChartType); // 'bar' | 'area' | 'pie'

  // Format data for Recharts
  const chartData = data.map((d, idx) => ({
    ...d,
    [nameKey]: d[nameKey],
    [valueKey]: typeof d[valueKey] === "number" ? Number(d[valueKey].toFixed(1)) : d[valueKey],
    fill: PALETTE[idx % PALETTE.length],
  }));

  const badgeColorClasses = {
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  }[badgeColor] || "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  return (
    <div className="bg-[#07101f] border border-slate-800 rounded-3xl p-6 lg:p-7 space-y-5 flex flex-col justify-between">
      {/* CARD HEADER & TOGGLER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold text-white">{title}</h3>
            {badgeText && (
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-bold ${badgeColorClasses}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>

        {/* CHART TYPE TOGGLER */}
        <div className="flex items-center bg-[#020617] p-1 rounded-2xl border border-slate-800 self-start sm:self-auto shadow-inner">
          <button
            type="button"
            onClick={() => setChartType("bar")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              chartType === "bar"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            title="Bar Chart"
          >
            <span>📊</span>
            <span>Bar</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("area")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              chartType === "area"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            title="Line/Area Chart"
          >
            <span>📈</span>
            <span>Area</span>
          </button>

          <button
            type="button"
            onClick={() => setChartType("pie")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              chartType === "pie"
                ? "bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
            title="Donut / Pie Chart"
          >
            <span>🍩</span>
            <span>Donut</span>
          </button>
        </div>
      </div>

      {/* CHART VIEWPORT */}
      <div className="w-full h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "bar" ? (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey={nameKey}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip
                content={<CustomTooltip valueKey={valueKey} valueSuffix={valueSuffix} />}
                cursor={{ fill: "rgba(51, 65, 85, 0.2)" }}
              />
              <Bar dataKey={valueKey} radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          ) : chartType === "area" ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis
                dataKey={nameKey}
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
                angle={-20}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: "#1e293b" }}
              />
              <Tooltip content={<CustomTooltip valueKey={valueKey} valueSuffix={valueSuffix} />} />
              <Area
                type="monotone"
                dataKey={valueKey}
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#areaGradient)"
                activeDot={{ r: 6, fill: "#34d399", stroke: "#020617", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : (
            <PieChart>
              <Tooltip content={<CustomTooltip valueKey={valueKey} valueSuffix={valueSuffix} />} />
              <Pie
                data={chartData}
                dataKey={valueKey}
                nameKey={nameKey}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={105}
                paddingAngle={4}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={{ stroke: "#475569", strokeWidth: 1 }}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }}
              />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalyticsChartCard;
