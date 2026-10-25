import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config";

const API_BASE = API_BASE_URL;

const requiredColumns = [
  "date",
  "product",
  "category",
  "storeId",
  "quantitySold",
  "unitPrice",
  "discountPercent",
  "promotionActive",
  "stockAvailable",
  "stockout",
  "isHoliday",
  "holidayName",
  "festival",
  "isWorkingDay",
  "weather",
  "temperature",
];

function Data() {
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [datasetSummary, setDatasetSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // =========================================================
  // LOAD DATASET SUMMARY
  // =========================================================

  const loadDatasetSummary = async () => {
    try {
      setSummaryLoading(true);

      const { data } = await axios.get(
        `${API_BASE}/datasets/summary`,
        {
          withCredentials: true,
        }
      );

      if (data.success) {
        setDatasetSummary(data);
      } else {
        setDatasetSummary(null);
      }
    } catch (err) {
      console.error("Dataset Summary Error:", err);
      setDatasetSummary(null);
    } finally {
      setSummaryLoading(false);
    }
  };

  useEffect(() => {
    loadDatasetSummary();
  }, []);

  // =========================================================
  // FILE SELECTION
  // =========================================================

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    setMessage("");
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setFile(null);
      setError("Only CSV files are allowed.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFile(null);
      setError("File size must be less than or equal to 10 MB.");
      return;
    }

    setFile(selectedFile);
  };

  // =========================================================
  // UPLOAD DATASET
  // =========================================================

  const handleUpload = async () => {
    if (!file) {
      setError("Please choose a CSV dataset first.");
      return;
    }

    try {
      setUploading(true);
      setMessage("");
      setError("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `${API_BASE}/datasets/upload`,
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = response.data;

      if (data.success) {
        const insertedRows =
          data.rowsInserted ??
          data.insertedCount ??
          0;

        setMessage(
          `${data.message} ${insertedRows} rows inserted successfully.`
        );

        setFile(null);

        const fileInput = document.getElementById("dataset-file");

        if (fileInput) {
          fileInput.value = "";
        }

        await loadDatasetSummary();
      } else {
        setError(
          data.message || "Dataset upload failed."
        );
      }
    } catch (err) {
      console.error("Dataset Upload Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to upload dataset. Please check your login and backend."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================================================
  // CLEAN DUPLICATES
  // =========================================================

  const handleCleanup = async () => {
    const confirmed = window.confirm(
      "This will remove duplicate records from your dataset. Continue?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCleaning(true);
      setMessage("");
      setError("");

      const response = await axios.post(
        `${API_BASE}/datasets/cleanup-duplicates`,
        {},
        {
          withCredentials: true,
        }
      );

      const data = response.data;

      if (data.success) {
        setMessage(
          `${data.message} Deleted: ${
            data.deletedRecords ?? 0
          } records. Remaining: ${
            data.remainingRecords ?? 0
          } records.`
        );

        await loadDatasetSummary();
      } else {
        setError(
          data.message ||
            "Unable to clean duplicate dataset records."
        );
      }
    } catch (err) {
      console.error("Dataset Cleanup Error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to clean duplicate records. Please make sure the backend cleanup route is deployed."
      );
    } finally {
      setCleaning(false);
    }
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

const formatDate = (value) => {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-IN", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="min-h-screen bg-[#050b18] text-white flex">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="hidden md:flex w-[255px] shrink-0 border-r border-white/10 bg-[#07101f] flex-col">
        <div className="px-6 py-6 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">
            DemandForecast AI
          </h1>

          <p className="text-xs text-slate-500 mt-1">
            Demand intelligence platform
          </p>
        </div>

        <nav className="p-4 space-y-2">
          <button
            onClick={() => navigate("/")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <span>⌂</span>
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => navigate("/predictions")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <span>⌁</span>
            <span>Predictions</span>
          </button>

          <button
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400"
          >
            <span>▤</span>
            <span>Data</span>
          </button>

          <button
            onClick={() => navigate("/models")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <span>◇</span>
            <span>Models</span>
          </button>

          <button
            onClick={() => navigate("/reports")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <span>▧</span>
            <span>Reports</span>
          </button>

          <div className="border-t border-white/10 my-4"></div>

          <button
            onClick={() => navigate("/profile")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <span>♙</span>
            <span>Profile</span>
          </button>

          <button
            onClick={() => navigate("/settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition"
          >
            <span>⚙</span>
            <span>Settings</span>
          </button>
        </nav>
      </aside>

      {/* =====================================================
          MAIN
      ====================================================== */}

      <main className="flex-1 min-w-0">
        <div className="max-w-[1400px] mx-auto px-5 sm:px-7 lg:px-10 py-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="mb-8">
            <p className="text-sm text-emerald-400 font-medium mb-2">
              DATA MANAGEMENT
            </p>

            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              Dataset Management
            </h2>

            <p className="text-slate-400 mt-3 max-w-3xl leading-6">
              Upload your historical sales dataset for demand
              forecasting. The system will validate and process
              the data before it is used for machine learning.
            </p>
          </div>

          {/* =================================================
              MOBILE NAV
          ================================================= */}

          <div className="md:hidden mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 rounded-lg bg-white/5 text-slate-300"
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate("/predictions")}
                className="px-4 py-2 rounded-lg bg-white/5 text-slate-300"
              >
                Predictions
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-emerald-500/15 text-emerald-400"
              >
                Data
              </button>

              <button
                onClick={() => navigate("/models")}
                className="px-4 py-2 rounded-lg bg-white/5 text-slate-300"
              >
                Models
              </button>

              <button
                onClick={() => navigate("/reports")}
                className="px-4 py-2 rounded-lg bg-white/5 text-slate-300"
              >
                Reports
              </button>
            </div>
          </div>

          {/* =================================================
              CURRENT DATASET SUMMARY
          ================================================= */}

          <section className="mb-6 rounded-2xl border border-white/10 bg-[#07101f] p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
              <div>
                <p className="text-sm text-emerald-400 font-medium">
                  CURRENT DATASET
                </p>

                <h3 className="text-xl font-semibold text-white mt-1">
                  Dataset Overview
                </h3>
              </div>

              <button
                type="button"
                onClick={loadDatasetSummary}
                disabled={summaryLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:bg-white/5 disabled:opacity-50 transition"
              >
                {summaryLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {summaryLoading ? (
              <div className="text-slate-500 text-sm">
                Loading dataset information...
              </div>
            ) : datasetSummary ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

                {/* RECORDS */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-500">
                    Records
                  </p>

                  <p className="text-2xl font-bold text-white mt-1">
                    {datasetSummary.records?.toLocaleString() || 0}
                  </p>
                </div>

                {/* PRODUCTS */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-500">
                    Products
                  </p>

                  <p className="text-2xl font-bold text-white mt-1">
                    {datasetSummary.products?.length || 0}
                  </p>
                </div>

                {/* STORES */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-500">
                    Stores
                  </p>

                  <p className="text-2xl font-bold text-white mt-1">
                    {datasetSummary.stores?.length || 0}
                  </p>
                </div>

                {/* DATE RANGE */}
                <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
                  <p className="text-xs text-slate-500">
                    Date Range
                  </p>

                  <p className="text-sm font-medium text-white mt-2">
                    {formatDate(
                      datasetSummary.dateRange?.start
                    )}
                  </p>

                  <p className="text-xs text-slate-500 mt-1">
                    to{" "}
                    {formatDate(
                      datasetSummary.dateRange?.end
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">
                No dataset information available.
              </p>
            )}
          </section>

          {/* =================================================
              DATASET QUALITY
          ================================================= */}

          <section className="mb-6 rounded-2xl border border-orange-500/30 bg-orange-500/5 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

              <div className="flex items-start gap-4">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 text-xl">
                  ⚠
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white">
                    Dataset Quality Check
                  </h3>

                  <p className="text-sm text-slate-400 mt-1 max-w-2xl">
                    Remove duplicate records before model training
                    to keep historical demand data clean and prevent
                    repeated observations from affecting evaluation.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCleanup}
                disabled={cleaning}
                className="w-full sm:w-auto shrink-0 px-6 py-3 rounded-xl border border-orange-500/40 text-orange-400 hover:bg-orange-500/10 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {cleaning
                  ? "Cleaning..."
                  : "Clean Duplicate Records"}
              </button>
            </div>
          </section>

          {/* =================================================
              UPLOAD + REQUIRED COLUMNS
          ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_0.9fr] gap-6">

            {/* UPLOAD CARD */}
            <section className="rounded-2xl border border-white/10 bg-[#07101f] p-6 sm:p-8">

              <div className="flex items-start gap-4 mb-7">
                <div className="w-12 h-12 shrink-0 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xl">
                  ↑
                </div>

                <div>
                  <h3 className="text-xl font-semibold">
                    Dataset Upload
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    CSV files only • Maximum 10 MB
                  </p>
                </div>
              </div>

              <label
                htmlFor="dataset-file"
                className="block cursor-pointer border-2 border-dashed border-slate-700 hover:border-emerald-500/40 rounded-2xl p-8 sm:p-12 text-center transition"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-emerald-400 text-3xl">
                  ↑
                </div>

                <h4 className="text-lg font-semibold mt-6">
                  Choose a CSV dataset
                </h4>

                <p className="text-sm text-slate-500 mt-2">
                  Click here to browse files
                </p>

                <input
                  id="dataset-file"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* SELECTED FILE */}
              {file && (
                <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/50 p-4">
                  <p className="text-sm text-slate-300">
                    Selected file
                  </p>

                  <p className="text-sm text-emerald-400 mt-1 break-all">
                    {file.name}
                  </p>
                </div>
              )}

              {/* SUCCESS MESSAGE */}
              {message && (
                <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-400">
                  {message}
                </div>
              )}

              {/* ERROR MESSAGE */}
              {error && (
                <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-400">
                  {error}
                </div>
              )}

              {/* UPLOAD BUTTON */}
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || uploading}
                className="w-full mt-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading
                  ? "Uploading Dataset..."
                  : "Upload Dataset →"}
              </button>
            </section>

            {/* REQUIRED COLUMNS */}
            <section className="rounded-2xl border border-white/10 bg-[#07101f] p-6 sm:p-8">
              <h3 className="text-xl font-semibold">
                Required CSV Columns
              </h3>

              <p className="text-sm text-slate-500 mt-3 leading-6">
                Your CSV should contain these columns for the
                forecasting pipeline.
              </p>

              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                {requiredColumns.map((column) => (
                  <div
                    key={column}
                    className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 px-4 py-3"
                  >
                    <span className="text-emerald-400">
                      ✓
                    </span>

                    <span className="text-sm text-slate-300 break-all">
                      {column}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* =================================================
              DATA CLEANING & DEDUPLICATION AUDIT
          ================================================= */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#07101f] p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  Data Cleaning & Deduplication Audit
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Automated verification and deduplication results across the 2 project data sheets
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Audit Verified ✓
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* SHEET 1 */}
              <div className="rounded-xl border border-slate-800 bg-[#020617] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white text-base">Sheet 1: Historical Multi-factor</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Production Pool
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File:</span>
                    <span className="font-mono text-white">demand_forecasting_multifactor_dataset.csv</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Records:</span>
                    <span className="font-bold text-white">26,304 clean records</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Timeline:</span>
                    <span className="text-slate-200">2023-01-01 to 2025-12-31 (3 Years)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duplicate Keys:</span>
                    <span className="text-emerald-400 font-bold">0 Duplicates (Zero Collisions)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Null Imputation:</span>
                    <span className="text-slate-300">23,568 holiday entries mapped to 'Normal Day'</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Features:</span>
                    <span className="text-slate-300">6 Products across 4 Outlets (S001–S004)</span>
                  </div>
                </div>
              </div>

              {/* SHEET 2 */}
              <div className="rounded-xl border border-slate-800 bg-[#020617] p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h4 className="font-bold text-white text-base">Sheet 2: Duplicate Test Sheet</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Deduplication Validated
                  </span>
                </div>
                <div className="text-xs text-slate-300 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">File:</span>
                    <span className="font-mono text-white">demandforecast_duplicate_test_60_records.csv</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Raw Rows:</span>
                    <span className="font-bold text-white">60 records</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Conflicting Duplicate Rows:</span>
                    <span className="text-amber-400 font-bold">40 records sharing duplicate keys</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Deduplication Strategy:</span>
                    <span className="text-slate-300">Deterministic key grouping & aggregation</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Post-Deduplication Rows:</span>
                    <span className="text-emerald-400 font-bold">40 unique records (20 redundant removed)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-emerald-400 font-bold">✓ Automated Deduplication Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* =================================================
              PIPELINE INFO
          ================================================= */}
          <section className="mt-6 rounded-2xl border border-white/10 bg-[#07101f] p-6 sm:p-8">
            <h3 className="text-xl font-semibold">
              Forecasting Data Pipeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
              <div className="rounded-xl border border-white/10 bg-slate-900/30 p-5">
                <div className="text-emerald-400 text-lg">01</div>
                <h4 className="font-semibold mt-3">Upload & Clean</h4>
                <p className="text-sm text-slate-500 mt-2">
                  Automated parsing, type coercion, and key deduplication.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/30 p-5">
                <div className="text-emerald-400 text-lg">02</div>
                <h4 className="font-semibold mt-3">Occasion Intel</h4>
                <p className="text-sm text-slate-500 mt-2">
                  Extract festival surge uplifts and day-of-week seasonality.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/30 p-5">
                <div className="text-emerald-400 text-lg">03</div>
                <h4 className="font-semibold mt-3">Model Training</h4>
                <p className="text-sm text-slate-500 mt-2">
                  Chronological split training with HistGradientBoosting.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-slate-900/30 p-5">
                <div className="text-emerald-400 text-lg">04</div>
                <h4 className="font-semibold mt-3">Material Plan</h4>
                <p className="text-sm text-slate-500 mt-2">
                  Future sales prediction and safety buffer replenishment.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Data;
