"use client";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type GrowthPoint = {
  month: string;
  members: number;
};

type MembersGrowthChartProps = {
  data: GrowthPoint[];
};

export default function MembersGrowthChart({
  data,
}: MembersGrowthChartProps) {



  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="membersGrowth" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1680c4" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#1680c4" stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="members"
            stroke="#0a3d82"
            strokeWidth={3}
            fill="url(#membersGrowth)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}