import React from 'react';

const LeafWatermark = () => (
  <svg viewBox="0 0 80 80" fill="none" className="w-full h-full opacity-[0.06]">
    <path d="M10 70 C10 70 20 20 70 10 C70 10 60 60 10 70Z" fill="#004B23" />
    <path d="M40 40 L70 10" stroke="#004B23" strokeWidth="2" />
  </svg>
);

const SummaryCard = ({ icon, title, value, extra, prefix, precision }) => (
  <div className="relative overflow-hidden rounded-2xl bg-white border border-[#e8f5e9] shadow-sm hover:shadow-md transition-all duration-200 p-5 group">
    <div className="absolute -top-4 -right-4 w-20 h-20 pointer-events-none">
      <LeafWatermark />
    </div>
    <div className="flex items-center gap-2 mb-3">
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F0FFF1] text-[#004B23] text-base border border-[#CCFF33]/40">
        {icon}
      </span>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider leading-tight">{title}</span>
    </div>
    <div className="text-3xl font-bold text-[#004B23] font-poppins">
      {prefix && <span className="text-lg mr-0.5">{prefix}</span>}
      {precision !== undefined ? Number(value || 0).toFixed(precision) : (value ?? 0)}
    </div>
    <div className="mt-1 text-xs text-gray-400">{extra}</div>
    <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-[#70E000] to-[#CCFF33] transition-all duration-300" />
  </div>
);

export default SummaryCard;
