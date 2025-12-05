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
  return [{ title: "Dashboard | Commodo" }];
}

// Tab component
function Tabs({ tabs, activeTab, onChange }: { 
  tabs: string[]; 
  activeTab: string; 
  onChange: (tab: string) => void;
}) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg w-fit">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
            activeTab === tab
              ? 'bg-white text-[#0d0c22] shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
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
  const [activeTab, setActiveTab] = useState('Overview');

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
      {/* Top Bar with Tabs and Actions */}
      <div className="flex items-center justify-between">
        <Tabs 
          tabs={['Overview', 'Sales', 'Order']} 
          activeTab={activeTab} 
          onChange={setActiveTab} 
        />
        <div className="flex items-center gap-2">
          {isEmpty && (
            <Button onClick={handleSeedData} isLoading={isSeeding} size="sm">
              <Plus className="h-4 w-4" />
              Load Example Data
            </Button>
          )}
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-white bg-[#0d0c22] rounded-lg hover:bg-[#1a1930] transition-colors">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-semibold text-[#0d0c22]">Analytics</h3>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4" />
                Filter
              </button>
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
                <button className="px-3 py-1 text-sm text-gray-500 rounded-md">This Year</button>
                <button className="px-3 py-1 text-sm bg-white text-[#0d0c22] rounded-md shadow-sm">Last Year</button>
              </div>
            </div>
          </div>
          
          {/* Chart Area */}
          <div className="h-64 relative">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-xs text-gray-400 w-8">
              <span>$5K</span>
              <span>$4K</span>
              <span>$3K</span>
              <span>$2K</span>
              <span>$1K</span>
              <span>0</span>
            </div>
            
            {/* Chart content */}
            <div className="ml-10 h-[calc(100%-24px)] flex items-end gap-3 pb-0 border-b border-gray-100">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, i) => {
                const heights = [60, 70, 80, 90, 100, 110, 120, 130, 150, 170, 140, 120];
                const maxHeight = 180;
                const barHeight = (heights[i] / maxHeight) * 100;
                const isHighlighted = month === 'Oct';
                return (
                  <div key={month} className="flex-1 flex flex-col items-center h-full justify-end">
                    <div className="relative w-full flex justify-center h-full items-end">
                      {isHighlighted && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-[#0d0c22] text-white text-xs px-2 py-1 rounded-md whitespace-nowrap z-10">
                          Oct, 2024<br/>$3,722 - 7.2%
                        </div>
                      )}
                      <div 
                        className={cn(
                          'w-2 rounded-t-sm transition-all',
                          isHighlighted ? 'bg-orange-500' : 'bg-orange-200 hover:bg-orange-300'
                        )}
                        style={{ height: `${barHeight}%`, minHeight: '8px' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            
            {/* X-axis labels */}
            <div className="ml-10 flex gap-3 text-xs text-gray-400 pt-1.5">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                <span key={month} className="flex-1 text-center">{month}</span>
              ))}
            </div>
          </div>
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
