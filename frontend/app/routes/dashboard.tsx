import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  Users, 
  Briefcase, 
  CheckSquare, 
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  Phone,
  Mail,
  Calendar
} from 'lucide-react';
import { Card, CardHeader, Button, Badge } from '~/components/ui';
import { analyticsApi, seedApi } from '~/lib/api';
import { formatCurrency, formatRelativeTime, cn } from '~/lib/utils';
import type { Analytics, RecentActivity } from '~/lib/types';

export function meta() {
  return [{ title: "Dashboard | CRM Pro" }];
}

export default function Dashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

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
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty = analytics && analytics.total_contacts === 0 && analytics.total_deals === 0;

  const stats = [
    {
      name: 'Total Contacts',
      value: analytics?.total_contacts || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      trend: 'up',
      href: '/contacts'
    },
    {
      name: 'Active Deals',
      value: analytics?.total_deals || 0,
      icon: Briefcase,
      color: 'bg-purple-500',
      change: '+8%',
      trend: 'up',
      href: '/deals'
    },
    {
      name: 'Open Tasks',
      value: analytics?.total_tasks || 0,
      icon: CheckSquare,
      color: 'bg-amber-500',
      change: '-3%',
      trend: 'down',
      href: '/tasks'
    },
    {
      name: 'Deal Value',
      value: formatCurrency(analytics?.total_deal_value || 0),
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+23%',
      trend: 'up',
      href: '/deals'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'contact': return Users;
      case 'deal': return Briefcase;
      case 'task': return CheckSquare;
      default: return Clock;
    }
  };

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return Calendar;
      default: return CheckSquare;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>
        {isEmpty && (
          <Button onClick={handleSeedData} isLoading={isSeeding}>
            <Plus className="h-4 w-4" />
            Load Example Data
          </Button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.name} to={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                </div>
                <div className={cn('p-3 rounded-xl', stat.color)}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex items-center gap-1 mt-3">
                {stat.trend === 'up' ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span className={cn(
                  'text-sm font-medium',
                  stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {stat.change}
                </span>
                <span className="text-sm text-slate-500">vs last month</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Deals by Stage */}
        <Card className="lg:col-span-2">
          <CardHeader 
            title="Deal Pipeline" 
            description="Overview of deals by stage"
            action={
              <Link to="/deals">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            }
          />
          <div className="space-y-4">
            {analytics?.deals_by_stage.length ? (
              analytics.deals_by_stage.map((stage) => {
                const percentage = analytics.total_deals > 0 
                  ? (stage.count / analytics.total_deals) * 100 
                  : 0;
                return (
                  <div key={stage.stage} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700 capitalize">
                        {stage.stage.replace('_', ' ')}
                      </span>
                      <span className="text-slate-500">
                        {stage.count} deals · {formatCurrency(stage.total_value)}
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={cn(
                          'h-full rounded-full transition-all',
                          stage.stage === 'closed_won' ? 'bg-green-500' :
                          stage.stage === 'closed_lost' ? 'bg-red-500' :
                          stage.stage === 'negotiation' ? 'bg-amber-500' :
                          stage.stage === 'proposal' ? 'bg-purple-500' :
                          'bg-blue-500'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-center py-8">No deals yet</p>
            )}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader 
            title="Recent Activity" 
            description="Latest updates"
          />
          <div className="space-y-4">
            {analytics?.recent_activities.length ? (
              analytics.recent_activities.slice(0, 5).map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={index} className="flex items-start gap-3">
                    <div className={cn(
                      'p-2 rounded-lg',
                      activity.type === 'contact' ? 'bg-blue-100' :
                      activity.type === 'deal' ? 'bg-purple-100' :
                      'bg-green-100'
                    )}>
                      <Icon className={cn(
                        'h-4 w-4',
                        activity.type === 'contact' ? 'text-blue-600' :
                        activity.type === 'deal' ? 'text-purple-600' :
                        'text-green-600'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {activity.action} · {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </Card>
      </div>

      {/* Bottom Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Conversion Rate */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics?.conversion_rate || 0}%
              </p>
            </div>
          </div>
        </Card>

        {/* Tasks Completed */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <CheckSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Tasks This Week</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics?.tasks_completed_this_week || 0}
              </p>
            </div>
          </div>
        </Card>

        {/* Deals Closed */}
        <Card>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Briefcase className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Deals This Month</p>
              <p className="text-2xl font-bold text-slate-900">
                {analytics?.deals_closed_this_month || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
