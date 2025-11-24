"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { DataCategory } from "@prisma/client";
import { Loader2, LineChart as ChartIcon } from "lucide-react";

type ReportGraphProps = {
  buildingId: string;
  categories: DataCategory[];
  startDate?: string;
  endDate?: string;
};

type ChartData = {
  date: string;
  value: number;
};

export function ReportGraph({ buildingId, categories, startDate, endDate }: ReportGraphProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
        const firstNumCat = categories.find(c => c.type === 'NUMBER');
        if (firstNumCat) setSelectedCategoryId(firstNumCat.id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (!selectedCategoryId || !buildingId) {
      setChartData([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
            buildingId,
            categoryId: selectedCategoryId,
        });
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);

        const response = await fetch(`/api/reports/graph-data?${params.toString()}`);
        
        if (!response.ok) throw new Error("Failed to fetch chart data");
        const data = await response.json();
        
        const formattedData = data.map((reading: any) => ({
          date: new Date(reading.inspection.date).toLocaleDateString(),
          value: reading.numericalValue,
        }));

        setChartData(formattedData);
      } catch (err) {
        console.error(err);
        setError("Failed to load graph data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedCategoryId, buildingId, startDate, endDate]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);

  const numberCategories = categories.filter(c => c.type === 'NUMBER');

  if (numberCategories.length === 0) {
    return (
       <div className="p-8 border rounded-lg bg-gray-50 text-center text-gray-500 flex flex-col items-center gap-2">
         <ChartIcon className="h-8 w-8 text-gray-400" />
         <p>This building has no numerical data to graph.</p>
       </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-white shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 rounded-lg">
                <ChartIcon className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Trend Analysis</h2>
        </div>
        
        <select 
            value={selectedCategoryId || ''}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full sm:w-[250px] outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
            {numberCategories.map((c) => (
               <option key={c.id} value={c.id}>{c.name}</option>
            ))}
        </select>
      </div>

      {/* Chart Area */}
      <div className="h-[350px] w-full relative mt-6">
          {isLoading && (
              <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center bg-white/80 z-10 backdrop-blur-[1px] transition-all">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  <p className="text-sm text-gray-500 font-medium">Loading data...</p>
              </div>
          )}
          
          {error && (
              <div className="absolute inset-0 flex items-center justify-center text-red-500 bg-red-50/50">
                  <p className="font-medium flex items-center gap-2">
                    ⚠️ {error}
                  </p>
              </div>
          )}

          {!isLoading && !error && chartData.length === 0 && (
             <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center text-gray-400 bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200">
                 <ChartIcon className="h-10 w-10 opacity-20" />
                 <p>No data found for this period.</p>
             </div>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#9ca3af" 
                fontSize={12} 
                tickLine={false}
                axisLine={false}
                dx={-10}
                domain={['auto', 'auto']} 
              />
              <Tooltip 
                contentStyle={{ 
                    borderRadius: '8px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)', 
                    border: 'none',
                    fontSize: '14px'
                }} 
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2563eb"
                strokeWidth={3}
                name={selectedCategory?.name || 'Value'}
                dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#1d4ed8" }}
              />
            </LineChart>
          </ResponsiveContainer>
      </div>
    </div>
  );
}