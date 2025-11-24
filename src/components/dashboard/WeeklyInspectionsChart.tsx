"use client";

import Image from "next/image";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

type ChartData = {
  name: string;
  count: number;
};

const WeeklyInspectionsChart = ({ 
  data, 
  className 
}: { 
  data: ChartData[], 
  className?: string 
}) => {
  return (
    <div className={`bg-white rounded-lg p-4 ${className}`}>
      <div className='flex justify-between items-center mb-4'>
        <h1 className='text-lg font-semibold'>Weekly Inspections</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20}/>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={20}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ddd" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tick={{fill:"#9ca3af"}} 
            tickLine={false}
          />
          <YAxis 
            axisLine={false} 
            tick={{fill:"#9ca3af"}} 
            tickLine={false} 
            allowDecimals={false}
          />
          <Tooltip 
            contentStyle={{borderRadius:"10px", borderColor:"lightgray"}}
            cursor={{fill: 'transparent'}}
          />
          <Legend 
            verticalAlign="top" 
            align="left" 
            iconType="circle"
            wrapperStyle={{paddingBottom: "20px"}}
          />
          <Bar 
            dataKey="count" 
            fill="#FAE27C" 
            legendType="circle" 
            radius={[10,10,0,0]} 
            name="Inspections" 
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default WeeklyInspectionsChart;