import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend
} from 'recharts';

interface VisualizationProps {
  type: 'bar' | 'line' | 'pie' | 'area';
  data: any[];
  title?: string;
  xKey?: string;
  yKey?: string;
}

const COLORS = ['#4F46E5', '#10B981', '#F43F5E', '#8B5CF6', '#F59E0B', '#0EA5E9', '#06B6D4', '#F97316', '#D946EF'];

export const Visualization: React.FC<VisualizationProps> = ({ type, data, title, xKey = 'name', yKey = 'value' }) => {
  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey={xKey} 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff'
              }}
              itemStyle={{ color: '#fff' }}
            />
            <Bar dataKey={yKey} fill="var(--chart-primary)" radius={[4, 4, 0, 0]} />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey={xKey} 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff'
              }}
            />
            <Line type="monotone" dataKey={yKey} stroke="var(--chart-primary)" strokeWidth={2} dot={{ r: 4, fill: 'var(--chart-primary)' }} activeDot={{ r: 6 }} />
          </LineChart>
        );
      case 'pie':
        return (
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey={yKey}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff'
              }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
          </PieChart>
        );
      case 'area':
        return (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--chart-primary)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
            <XAxis 
              dataKey={xKey} 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                border: '1px solid rgba(51, 65, 85, 0.5)',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#fff'
              }}
            />
            <Area type="monotone" dataKey={yKey} stroke="var(--chart-primary)" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
          </AreaChart>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-64 bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] p-4 flex flex-col shadow-sm">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-mono uppercase tracking-widest text-[var(--text-muted)] font-bold">{title}</h4>
          <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-[var(--border-color)]"></div>
            <div className="w-1 h-1 rounded-full bg-[var(--border-color)]"></div>
          </div>
        </div>
      )}
      <div className="flex-1 min-h-0 relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          {renderChart() || <div className="flex items-center justify-center h-full text-[var(--text-muted)] text-xs">No chart data available</div>}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
