import React from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

const KPICard = ({ title, value, unit = "", icon, color = "blue", chartData = [] }) => {
  const colors = {
    blue: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      stroke: "#2563eb",
      fill: "url(#colorBlue)",
    },
    green: {
      bg: "bg-green-50",
      text: "text-green-600",
      stroke: "#16a34a",
      fill: "url(#colorGreen)",
    },
    purple: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      stroke: "#9333ea",
      fill: "url(#colorPurple)",
    },
    orange: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      stroke: "#ea580c",
      fill: "url(#colorOrange)",
    }
  };

  const selectedColor = colors[color] || colors.blue;

  return (
    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden group hover:shadow-md transition-all duration-300 h-44">
      {/* Background Wave Pattern (simplified SVG) */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 pointer-events-none opacity-20 group-hover:opacity-30 transition-opacity">
        <svg viewBox="0 0 400 100" preserveAspectRatio="none" className="w-full h-full">
          <path 
            d="M0 50 C 150 100 250 0 400 50 L 400 100 L 0 100 Z" 
            fill={selectedColor.stroke} 
          />
        </svg>
      </div>

      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className={`p-2 rounded-lg ${selectedColor.bg} ${selectedColor.text}`}>
              {icon}
            </span>
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
          </div>
          <div className="mt-2">
            <span className="text-4xl font-bold text-slate-800">
              {value}
            </span>
            <span className="text-xl font-bold text-slate-400 ml-1">{unit}</span>
          </div>
        </div>

        {/* Mini Sparkline Chart */}
        <div className="w-32 h-16 mr-[-10px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id={`color${color.charAt(0).toUpperCase() + color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selectedColor.stroke} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={selectedColor.stroke} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke={selectedColor.stroke} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={selectedColor.fill} 
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default KPICard;
