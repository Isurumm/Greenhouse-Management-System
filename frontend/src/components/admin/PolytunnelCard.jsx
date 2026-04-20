import React from "react";
import { Tooltip } from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { RiPlantLine } from "react-icons/ri";
import DeleteConfirm from "../common/DeleteConfirm";

/* ─── Status configuration ───────────────────────────────── */
const STATUS_CONFIG = {
  Active: {
    accent: "from-emerald-500 via-lime-500 to-green-400",
    badge: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    dot: "bg-emerald-500",
    glow: "bg-emerald-800/40",
    soft: "from-emerald-50 via-lime-50 to-white",
    button:
      "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-100",
  },
  Fallow: {
    accent: "from-slate-400 via-slate-500 to-slate-400",
    badge: "bg-slate-100 text-slate-700 border border-slate-200",
    dot: "bg-slate-400",
    glow: "bg-slate-200/50",
    soft: "from-slate-50 via-white to-white",
    button: "bg-gray-100 text-gray-400",
  },
  Maintenance: {
    accent: "from-amber-400 via-orange-400 to-amber-300",
    badge: "bg-amber-50 text-amber-700 border border-amber-200",
    dot: "bg-amber-400",
    glow: "bg-amber-200/40",
    soft: "from-amber-50 via-orange-50 to-white",
    button: "bg-gray-100 text-gray-400",
  },
};

/* ─── Avatar stack ───────────────────────────────────────── */
const AvatarStack = ({ workerNames }) => {
  const MAX_SHOWN = 3;
  const names = Array.isArray(workerNames) ? workerNames.filter(Boolean) : [];
  const shown = Math.min(names.length, MAX_SHOWN);
  const extra = names.length - shown;

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "WW";
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "WW";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  };

  return (
    <div className="flex items-center">
      {Array.from({ length: shown }).map((_, i) => (
        <div
          key={`${names[i]}-${i}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-blue-100 to-indigo-100 text-[10px] font-semibold text-blue-700 shadow-sm"
          style={{ marginLeft: i === 0 ? 0 : -8, zIndex: shown - i }}
          title={names[i]}
        >
          {getInitials(names[i])}
        </div>
      ))}
      {extra > 0 && (
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-[10px] font-semibold text-gray-500 shadow-sm"
          style={{ marginLeft: -8 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────── */
const PolytunnelCard = ({
  tunnel,
  staffCount,
  workerNames,
  onHarvestClick,
  onEditClick,
  onDeleteClick,
  onAssignClick,
}) => {
  const config = STATUS_CONFIG[tunnel.status] || STATUS_CONFIG.Fallow;
  const isHarvestable = tunnel.status === "Active";

  const prediction = tunnel?.harvestPrediction;
  const predictedKg = prediction?.predictedNextHarvestKg;
  const lastHarvestDate = prediction?.lastHarvestDate
    ? new Date(prediction.lastHarvestDate).toLocaleDateString()
    : null;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-gray-200/80 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(15,23,42,0.10)] font-poppins">
      <div className={`h-1.5 w-full bg-gradient-to-r ${config.accent}`} />

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute -right-12 -top-10 h-36 w-36 rounded-full blur-3xl ${config.glow}`}
        />
        <div className="absolute left-0 top-0 h-32 w-full bg-gradient-to-br from-gray-50/90 via-white to-white" />
        <div
          className={`absolute inset-x-0 top-0 h-40 bg-gradient-to-br ${config.soft} opacity-90`}
        />
        <div className="absolute right-6 top-6 h-24 w-24 rounded-full border border-white/50 bg-white/30 blur-2xl" />
      </div>

      <div className="relative flex flex-1 flex-col px-5 pb-4 pt-5 sm:px-6 sm:pb-5 sm:pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-[20px] font-semibold tracking-tight text-gray-900">
              {tunnel.name}
            </h3>

            <p className="mt-1 text-xs font-medium tracking-wide text-gray-400 tabular-nums">
              {tunnel.size}
            </p>
          </div>

          <div
            className={`inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap shadow-sm backdrop-blur-sm ${config.badge}`}
          >
            <span className={`h-2 w-2 rounded-full ${config.dot}`} />
            {tunnel.status}
          </div>
        </div>

        <div className="flex justify-center items-center gap-10 mt-3 rounded-3xl border border-white/80 bg-white/75 p-2 shadow-[0_6px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm">
          <p className="font-semibold text-gray-400">Planted Crop</p>
          <div className="min-w-0">
            <p
              className={`truncate text-lg font-semibold ${
                tunnel.cropType
                  ? "text-gray-900"
                  : "text-gray-400 italic font-normal"
              }`}
            >
              {tunnel.cropType || "No crop planted"}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 shadow-[0_4px_14px_rgba(16,185,129,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Harvest Prediction
              </p>

              {predictedKg !== null && predictedKg !== undefined ? (
                <>
                  <p className="mt-1 text-lg font-semibold text-emerald-700">
                    {predictedKg} kg
                  </p>
                  <p className="text-sm text-gray-600">Estimated next harvest</p>

                  <div className="mt-2 space-y-1 text-xs text-gray-500">
                    <p>
                      Based on {prediction?.harvestCount || 0} harvest record
                      {(prediction?.harvestCount || 0) === 1 ? "" : "s"}
                    </p>

                    {lastHarvestDate && <p>Last harvest: {lastHarvestDate}</p>}

                    {prediction?.predictedPerSqMKg !== null &&
                      prediction?.predictedPerSqMKg !== undefined && (
                        <p>Yield density: {prediction.predictedPerSqMKg} kg/m²</p>
                      )}

                    {prediction?.totalHarvestedKg !== null &&
                      prediction?.totalHarvestedKg !== undefined && (
                        <p>Total harvested so far: {prediction.totalHarvestedKg} kg</p>
                      )}

                    {prediction?.note && <p>{prediction.note}</p>}
                  </div>
                </>
              ) : (
                <>
                  <p className="mt-1 text-sm font-medium text-gray-500">
                    Not enough data yet
                  </p>
                  <p className="text-xs text-gray-400">
                    Add harvest entries to generate a prediction
                  </p>
                </>
              )}
            </div>

            <div className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm">
              {prediction?.confidence || "Low"}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-gray-100/90 bg-white/80 p-4 shadow-[0_4px_14px_rgba(15,23,42,0.04)] backdrop-blur-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              {staffCount > 0 ? (
                <AvatarStack workerNames={workerNames} />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-400 shadow-sm">
                  <TeamOutlined className="text-sm" />
                </div>
              )}

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Workforce
                </p>
                <p className="truncate text-sm font-medium text-gray-700">
                  {staffCount} {staffCount === 1 ? "employee" : "employees"} assigned
                </p>
              </div>
            </div>

            <button
              onClick={onAssignClick}
              className="inline-flex h-10 items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 shadow-sm transition-all hover:border-gray-300 hover:bg-gray-50 hover:text-gray-900"
            >
              Assign
            </button>
          </div>
        </div>
      </div>

      <div className="relative mt-auto flex items-center justify-between border-t border-gray-100/80 bg-white/85 px-5 py-4 backdrop-blur-sm sm:px-6">
        <Tooltip
          title={isHarvestable ? "Log final harvest" : "Tunnel must be active to harvest"}
        >
          <button
            onClick={isHarvestable ? onHarvestClick : undefined}
            disabled={!isHarvestable}
            className={`inline-flex h-11 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition-all ${
              isHarvestable
                ? config.button
                : "cursor-not-allowed bg-gray-100 text-gray-400"
            }`}
          >
            <RiPlantLine />
            Log harvest
          </button>
        </Tooltip>

        <div className="flex items-center gap-2">
          <Tooltip title="Edit tunnel">
            <button
              onClick={onEditClick}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-400 transition-all hover:border-gray-200 hover:bg-gray-50 hover:text-gray-700"
            >
              <EditOutlined className="text-sm" />
            </button>
          </Tooltip>

          <Tooltip title="Deconstruct tunnel">
            <DeleteConfirm
              title="Remove this tunnel permanently?"
              okText="Remove"
              onConfirm={onDeleteClick}
            >
              <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-transparent text-gray-400 transition-all hover:border-red-100 hover:bg-red-50 hover:text-red-500">
                <DeleteOutlined className="text-sm" />
              </button>
            </DeleteConfirm>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default PolytunnelCard;