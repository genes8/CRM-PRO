import { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  DollarSign,
  TrendingUp,
  Target,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { Card, CardHeader } from '~/components/ui';
import { analyticsApi } from '~/lib/api';
import { formatCurrency, cn } from '~/lib/utils';
import type { Analytics } from '~/lib/types';

export function meta() {
  return [{ title: "Analytics | Commodo" }];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#6b7280'];

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await analyticsApi.get();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Failed to load analytics data</p>
      </div>
    );
  }

  const dealsPipelineData = analytics.deals_by_stage.map(stage => ({
    name: stage.stage.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count: stage.count,
    value: stage.total_value,
  }));

  const contactsStatusData = analytics.contacts_by_status.map(status => ({
    name: status.status.replace(/\b\w/g, l => l.toUpperCase()),
    value: status.count,
  }));

  const tasksStatusData = analytics.tasks_by_status.map(status => ({
    name: status.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: status.count,
  }));

  const stats = [
    {
      name: 'Total Contacts',
      value: analytics.total_contacts,
      icon: Users,
      color: 'bg-blue-500',
      lightColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      name: 'Active Deals',
      value: analytics.total_deals,
      icon: Briefcase,
      color: 'bg-purple-500',
      lightColor: 'bg-purple-100',
      textColor: 'text-purple-600',
    },
    {
      name: 'Total Tasks',
      value: analytics.total_tasks,
      icon: CheckSquare,
      color: 'bg-amber-500',
      lightColor: 'bg-amber-100',
      textColor: 'text-amber-600',
    },
    {
      name: 'Pipeline Value',
      value: formatCurrency(analytics.total_deal_value),
      icon: DollarSign,
      color: 'bg-green-500',
      lightColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
  ];

  const kpis = [
    {
      name: 'Conversion Rate',
      value: `${analytics.conversion_rate}%`,
      description: 'Leads to customers',
      icon: Target,
      trend: '+2.5%',
      trendUp: true,
    },
    {
      name: 'Tasks This Week',
      value: analytics.tasks_completed_this_week,
      description: 'Completed tasks',
      icon: CheckSquare,
      trend: '+12',
      trendUp: true,
    },
    {
      name: 'Deals This Month',
      value: analytics.deals_closed_this_month,
      description: 'Closed won deals',
      icon: TrendingUp,
      trend: '+3',
      trendUp: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#0d0c22]">Analytics</h3>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-xl', stat.lightColor)}>
                <stat.icon className={cn('h-6 w-6', stat.textColor)} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{stat.name}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* KPIs */}
      <div className="grid md:grid-cols-3 gap-6">
        {kpis.map((kpi) => (
          <Card key={kpi.name}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{kpi.name}</p>
                <p className="text-3xl font-bold text-slate-900 mt-1">{kpi.value}</p>
                <p className="text-sm text-slate-500 mt-1">{kpi.description}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <kpi.icon className="h-5 w-5 text-slate-600" />
                </div>
                <span className={cn(
                  'text-sm font-medium',
                  kpi.trendUp ? 'text-green-600' : 'text-red-600'
                )}>
                  {kpi.trend}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Deals Pipeline Chart */}
        <Card>
          <CardHeader 
            title="Deals Pipeline" 
            description="Deals by stage with value"
          />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dealsPipelineData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'value' ? formatCurrency(value) : value,
                    name === 'value' ? 'Total Value' : 'Count'
                  ]}
                />
                <Legend />
                <Bar dataKey="count" name="Deals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="value" name="Value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Contacts Distribution */}
        <Card>
          <CardHeader 
            title="Contacts Distribution" 
            description="Contacts by status"
          />
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={contactsStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {contactsStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Tasks Chart */}
      <Card>
        <CardHeader 
          title="Tasks Overview" 
          description="Tasks by status"
        />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tasksStatusData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={{ stroke: '#e2e8f0' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
              />
              <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Quick Stats" />
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Average Deal Value</span>
              <span className="font-semibold text-slate-900">
                {analytics.total_deals > 0 
                  ? formatCurrency(analytics.total_deal_value / analytics.total_deals)
                  : formatCurrency(0)
                }
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-slate-100">
              <span className="text-slate-600">Contacts per Deal</span>
              <span className="font-semibold text-slate-900">
                {analytics.total_deals > 0 
                  ? (analytics.total_contacts / analytics.total_deals).toFixed(1)
                  : '0'
                }
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-slate-600">Tasks per Contact</span>
              <span className="font-semibold text-slate-900">
                {analytics.total_contacts > 0 
                  ? (analytics.total_tasks / analytics.total_contacts).toFixed(1)
                  : '0'
                }
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Performance Metrics" />
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Lead Conversion</span>
                <span className="text-sm font-medium text-slate-900">{analytics.conversion_rate}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all"
                  style={{ width: `${Math.min(analytics.conversion_rate, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Task Completion</span>
                <span className="text-sm font-medium text-slate-900">
                  {analytics.total_tasks > 0 
                    ? Math.round((analytics.tasks_by_status.find(t => t.status === 'completed')?.count || 0) / analytics.total_tasks * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all"
                  style={{ 
                    width: `${analytics.total_tasks > 0 
                      ? Math.round((analytics.tasks_by_status.find(t => t.status === 'completed')?.count || 0) / analytics.total_tasks * 100)
                      : 0
                    }%` 
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Deal Win Rate</span>
                <span className="text-sm font-medium text-slate-900">
                  {analytics.total_deals > 0 
                    ? Math.round((analytics.deals_by_stage.find(d => d.stage === 'closed_won')?.count || 0) / analytics.total_deals * 100)
                    : 0
                  }%
                </span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ 
                    width: `${analytics.total_deals > 0 
                      ? Math.round((analytics.deals_by_stage.find(d => d.stage === 'closed_won')?.count || 0) / analytics.total_deals * 100)
                      : 0
                    }%` 
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
