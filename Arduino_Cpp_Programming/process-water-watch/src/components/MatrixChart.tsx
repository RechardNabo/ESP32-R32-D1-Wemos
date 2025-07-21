import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, Cell, Tooltip, BarChart, Bar, XAxis, YAxis } from 'recharts';

interface MatrixChartProps {
  title: string;
  data: Array<{
    name: string;
    value: number;
    status: 'normal' | 'warning' | 'critical';
  }>;
}

export function MatrixChart({ title, data }: MatrixChartProps) {
  const getColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'hsl(var(--success))';
      case 'warning':
        return 'hsl(var(--warning))';
      case 'critical':
        return 'hsl(var(--critical))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  return (
    <Card className="animate-slide-up">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis 
              dataKey="name" 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              fontSize={12}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--card-foreground))'
              }}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.status)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}