import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  DollarSign,
  TrendingUp,
  ArrowRight,
  Plus,
  Filter,
  Download,
  Search
} from 'lucide-react';
import { Card, Button, Badge, Avatar } from '~/components/ui';
import { analyticsApi, seedApi } from '~/lib/api';
import { formatCurrency, formatRelativeTime, cn } from '~/lib/utils';
import type { Analytics } from '~/lib/types';

export function meta() {
  return [{ title: "Dashboard | CRM Pro" }];
}


// Stat Card component matching the design
function StatCard({ 
  title, 
  value, 
  change, 
  changeType,
  href 
}: { 
  title: string; 
  value: string | number; 
  change?: string;
  changeType?: 'positive' | 'negative';
  href: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[28px] font-semibold text-[#0d0c22] leading-tight">{value}</p>
          {change && (
            <p className="text-xs text-gray-400 mt-1">
              vs last month{' '}
              <span className={cn(
                'font-medium',
                changeType === 'positive' ? 'text-green-500' : 'text-red-500'
              )}>
                {change}
              </span>
            </p>
          )}
        </div>
        <Link 
          to={href}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#0d0c22] transition-colors"
        >
          See Details <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

// Progress bar for country stats
function CountryProgress({ 
  country, 
  flag, 
  value, 
  percentage 
}: { 
  country: string; 
  flag: string; 
  value: string; 
  percentage: number;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-lg">{flag}</span>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-[#0d0c22]">{country}</span>
          <span className="text-sm text-gray-500">{value} ({percentage}%)</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-orange-500 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// Sample data for the table
const sampleTransactions = [
  { id: 'FR128934', name: 'Livia Torff', email: 'liviator@mail.com', product: 'Support Package', value: '$780.00', date: 'Oct 10, 2024', avatar: '' },
  { id: 'FR128944', name: 'Mira Baptista', email: 'miraba@mail.com', product: 'Software License', value: '$1,829.00', date: 'Oct 23, 2024', avatar: '' },
  { id: 'FR128954', name: 'Ahmad Levin', email: 'ahmadlev@mail.com', product: 'Premium Plan', value: '$2,450.00', date: 'Oct 25, 2024', avatar: '' },
];

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');

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

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedApi.seed();
      await loadAnalytics();
    } catch (error) {
      console.error('Failed to seed data:', error);
    } finally {
      setIsSeeding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-3 border-[#0d0c22] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty = analytics && analytics.total_contacts === 0 && analytics.total_deals === 0;

  return (
    <div className="space-y-5">
      {/* Top Bar with Actions */}
      <div className="flex items-center justify-between">
        <div>
          {isEmpty && (
            <Button onClick={handleSeedData} isLoading={isSeeding} size="sm">
              <Plus className="h-4 w-4" />
              Load Example Data
            </Button>
          )}
        </div>
        <div></div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard 
          title="Active Sales" 
          value={`$${((analytics?.total_deal_value || 0) / 1000).toFixed(0)},${String((analytics?.total_deal_value || 0) % 1000).padStart(3, '0').slice(0, 3)}`}
          change="+12%"
          changeType="positive"
          href="/deals"
        />
        <StatCard 
          title="Product Revenue" 
          value={formatCurrency(analytics?.total_deal_value ? analytics.total_deal_value * 0.6 : 18680)}
          change="+18%"
          changeType="positive"
          href="/deals"
        />
        <StatCard 
          title="Product Sold" 
          value={analytics?.total_deals || 3423}
          change="+8%"
          changeType="positive"
          href="/contacts"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Analytics Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-[#0d0c22]">Revenue Analytics</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                {chartPeriod === 'weekly' ? 'Last 7 weeks' : chartPeriod === 'monthly' ? 'Monthly revenue this year' : 'Yearly revenue trends'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-gray-100/80 p-1 rounded-lg">
                <button
                  onClick={() => setChartPeriod('weekly')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    chartPeriod === 'weekly'
                      ? "bg-white text-[#0d0c22] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setChartPeriod('monthly')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    chartPeriod === 'monthly'
                      ? "bg-white text-[#0d0c22] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setChartPeriod('yearly')}
                  className={cn(
                    "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                    chartPeriod === 'yearly'
                      ? "bg-white text-[#0d0c22] shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Yearly
                </button>
              </div>
            </div>
          </div>

          {/* Stats Summary */}
          {(() => {
            const totalRevenue = analytics?.total_deal_value || 0;
            const monthlyData = analytics?.monthly_revenue || [];
            const currentMonth = new Date().getMonth() + 1;
            const currentMonthRevenue = monthlyData.find(m => m.month === currentMonth)?.revenue || 0;
            const lastMonthRevenue = monthlyData.find(m => m.month === currentMonth - 1)?.revenue || 0;
            const growthRate = lastMonthRevenue > 0 ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue * 100) : 0;
            const avgMonthly = monthlyData.length > 0
              ? monthlyData.reduce((sum, m) => sum + m.revenue, 0) / monthlyData.filter(m => m.revenue > 0).length || 0
              : 0;

            return (
              <div className="flex items-center gap-8 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-purple-500"></div>
                  <div>
                    <p className="text-xs text-gray-500">Total Revenue</p>
                    <p className="text-lg font-semibold text-[#0d0c22]">{formatCurrency(totalRevenue)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                  <div>
                    <p className="text-xs text-gray-500">Growth Rate</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      growthRate >= 0 ? "text-emerald-600" : "text-red-500"
                    )}>
                      {growthRate >= 0 ? '+' : ''}{growthRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500"></div>
                  <div>
                    <p className="text-xs text-gray-500">Avg. Monthly</p>
                    <p className="text-lg font-semibold text-[#0d0c22]">{formatCurrency(avgMonthly)}</p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Chart Area */}
          {(() => {
            let chartData: { label: string; revenue: number; deals: number }[] = [];
            let maxRevenue = 0;

            if (chartPeriod === 'monthly' && analytics?.monthly_revenue) {
              const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              chartData = analytics.monthly_revenue.map(m => ({
                label: monthNames[m.month - 1],
                revenue: m.revenue,
                deals: m.deals_count
              }));
              maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
            } else if (chartPeriod === 'weekly' && analytics?.weekly_revenue) {
              chartData = analytics.weekly_revenue.map(w => {
                const date = new Date(w.week_start);
                return {
                  label: `${date.getMonth() + 1}/${date.getDate()}`,
                  revenue: w.revenue,
                  deals: w.deals_count
                };
              });
              maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
            } else if (chartPeriod === 'yearly' && analytics?.yearly_revenue) {
              chartData = analytics.yearly_revenue.map(y => ({
                label: y.year.toString(),
                revenue: y.revenue,
                deals: y.deals_count
              }));
              maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
            }

            const formatAxisValue = (value: number) => {
              if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
              if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
              return `$${value}`;
            };

            const yAxisValues = [maxRevenue, maxRevenue * 0.75, maxRevenue * 0.5, maxRevenue * 0.25, 0];
            const currentMonth = new Date().getMonth();
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            return (
              <div className="h-56 relative">
                {/* Grid lines */}
                <div className="absolute inset-0 ml-12 flex flex-col justify-between pointer-events-none">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-dashed border-gray-100 w-full"></div>
                  ))}
                </div>

                {/* Y-axis labels */}
                <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 w-10">
                  {yAxisValues.map((val, i) => (
                    <span key={i}>{formatAxisValue(val)}</span>
                  ))}
                </div>

                {/* Chart content */}
                <div className="ml-12 h-[calc(100%-24px)] flex items-end gap-2 pb-0">
                  {chartData.map((item, i) => {
                    const barHeight = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    const isHighlighted = chartPeriod === 'monthly' && item.label === monthNames[currentMonth];

                    return (
                      <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                        <div className="relative w-full flex justify-center h-full items-end">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-16 left-1/2 -translate-x-1/2 bg-[#0d0c22] text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
                            <p className="font-medium">{item.label}</p>
                            <p className="text-gray-300">{formatCurrency(item.revenue)}</p>
                            <p className="text-gray-400">{item.deals} deals</p>
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#0d0c22]"></div>
                          </div>
                          <div
                            className={cn(
                              'w-full max-w-[32px] rounded-lg transition-all duration-300 cursor-pointer',
                              isHighlighted
                                ? 'bg-gradient-to-t from-violet-600 to-purple-500 shadow-lg shadow-violet-200'
                                : item.revenue > 0
                                  ? 'bg-gradient-to-t from-violet-300 to-violet-200 group-hover:from-violet-500 group-hover:to-violet-400'
                                  : 'bg-gray-100'
                            )}
                            style={{ height: `${Math.max(barHeight, item.revenue > 0 ? 5 : 2)}%`, minHeight: '4px' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* X-axis labels */}
                <div className="ml-12 flex gap-2 text-xs text-gray-400 pt-3">
                  {chartData.map((item, i) => {
                    const isHighlighted = chartPeriod === 'monthly' && item.label === monthNames[currentMonth];
                    return (
                      <span key={i} className={cn(
                        "flex-1 text-center font-medium",
                        isHighlighted && "text-violet-600"
                      )}>{item.label}</span>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Customers Active Section */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-base font-semibold text-[#0d0c22] mb-1">Customers Active</h3>
          <p className="text-[32px] font-semibold text-[#0d0c22]">
            {((analytics?.total_contacts || 0) * 100 + 48928).toLocaleString()}
            <span className="text-sm font-normal text-gray-400 ml-2">Accounts</span>
          </p>
          <p className="text-xs text-gray-400 mb-6">
            Compare from last month is <span className="text-green-500 font-medium">36,738</span> accounts
          </p>
          
          <div className="space-y-4">
            <CountryProgress country="United States" flag="🇺🇸" value="19,814" percentage={87} />
            <CountryProgress country="Italy" flag="🇮🇹" value="12,650" percentage={64} />
            <CountryProgress country="Germany" flag="🇩🇪" value="16,431" percentage={78} />
          </div>
        </div>
      </div>

      {/* Sales Data Table */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-base font-semibold text-[#0d0c22]">Sales Data Table</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 w-48"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Transaction ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Customer Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Customer Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Product/Service</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Deal Value</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {(analytics?.recent_activities?.length ? analytics.recent_activities.slice(0, 3) : sampleTransactions).map((item, index) => {
                const transaction = 'id' in item ? item : {
                  id: `FR12893${index}`,
                  name: item.title || 'Customer',
                  email: 'customer@mail.com',
                  product: 'Support Package',
                  value: '$780.00',
                  date: 'Oct 10, 2024'
                };
                return (
                  <tr key={index} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-600">{transaction.id}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={transaction.name} size="sm" />
                        <span className="text-sm font-medium text-[#0d0c22]">{transaction.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{transaction.email}</td>
                    <td className="px-5 py-4">
                      <Badge variant="orange">{transaction.product}</Badge>
                    </td>
                    <td className="px-5 py-4 text-sm font-medium text-[#0d0c22]">{transaction.value}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{transaction.date}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
