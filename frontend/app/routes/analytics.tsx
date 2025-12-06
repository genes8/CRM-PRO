import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Zap,
  Award,
  BarChart3
} from 'lucide-react';
import { analyticsApi } from '~/lib/api';
import { formatCurrency, cn } from '~/lib/utils';
import type { Analytics } from '~/lib/types';

export function meta() {
  return [{ title: "Analytics | CRM Pro" }];
}

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
        <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  // Calculate derived metrics
  const avgDealValue = analytics.total_deals > 0 ? analytics.total_deal_value / analytics.total_deals : 0;
  const wonDeals = analytics.deals_by_stage.find(d => d.stage === 'closed_won');
  const lostDeals = analytics.deals_by_stage.find(d => d.stage === 'closed_lost');
  const wonCount = wonDeals?.count || 0;
  const lostCount = lostDeals?.count || 0;
  const closedDeals = wonCount + lostCount;
  const winRate = closedDeals > 0 ? (wonCount / closedDeals) * 100 : 0;
  const completedTasks = analytics.tasks_by_status.find(t => t.status === 'completed')?.count || 0;
  const taskCompletionRate = analytics.total_tasks > 0 ? (completedTasks / analytics.total_tasks) * 100 : 0;
  const customers = analytics.contacts_by_status.find(c => c.status === 'customer')?.count || 0;
  const leads = analytics.contacts_by_status.find(c => c.status === 'lead')?.count || 0;
  const prospects = analytics.contacts_by_status.find(c => c.status === 'prospect')?.count || 0;
  const churned = analytics.contacts_by_status.find(c => c.status === 'churned')?.count || 0;
  const pendingTasks = analytics.tasks_by_status.find(t => t.status === 'pending')?.count || 0;
  const inProgressTasks = analytics.tasks_by_status.find(t => t.status === 'in_progress')?.count || 0;

  // Pipeline stages
  const stageOrder = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won'];
  const stageLabels: Record<string, string> = {
    lead: 'Lead', qualified: 'Qualified', proposal: 'Proposal', negotiation: 'Negotiation', closed_won: 'Won'
  };
  const sortedStages = analytics.deals_by_stage
    .filter(s => s.stage !== 'closed_lost')
    .sort((a, b) => stageOrder.indexOf(a.stage) - stageOrder.indexOf(b.stage));
  const maxStageValue = Math.max(...sortedStages.map(s => s.total_value), 1);

  // Generate insights
  const insights: { icon: React.ElementType; text: string; type: 'success' | 'warning' | 'info' }[] = [];
  if (winRate >= 50) insights.push({ icon: Award, text: `${winRate.toFixed(0)}% win rate - above average!`, type: 'success' });
  else if (closedDeals > 0 && winRate < 30) insights.push({ icon: AlertCircle, text: `${winRate.toFixed(0)}% win rate needs attention`, type: 'warning' });
  if (taskCompletionRate >= 70) insights.push({ icon: CheckCircle2, text: `${taskCompletionRate.toFixed(0)}% tasks completed`, type: 'success' });
  else if (analytics.total_tasks > 0 && taskCompletionRate < 40) insights.push({ icon: Clock, text: `Only ${taskCompletionRate.toFixed(0)}% tasks done`, type: 'warning' });
  if (leads > customers * 3) insights.push({ icon: Zap, text: `${leads} leads to convert`, type: 'info' });

  return (
    <div className="space-y-4">
      {/* Top Row - Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Pipeline Value', value: formatCurrency(analytics.total_deal_value), sub: `${analytics.total_deals} deals`, icon: DollarSign, color: 'violet' },
          { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, sub: `${wonCount}/${closedDeals} closed`, icon: Target, color: 'emerald', trend: winRate >= 50 ? 12 : -8 },
          { label: 'Avg Deal', value: formatCurrency(avgDealValue), sub: 'Per deal', icon: DollarSign, color: 'amber' },
          { label: 'Conversion', value: `${analytics.conversion_rate}%`, sub: `${customers} customers`, icon: Users, color: 'rose' },
        ].map((m) => (
          <div key={m.label} className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={cn('p-2 rounded-lg', `bg-${m.color}-50`)}>
                <m.icon className={cn('h-4 w-4', `text-${m.color}-600`)} />
              </div>
              {m.trend && (
                <span className={cn('text-xs font-medium flex items-center gap-0.5', m.trend > 0 ? 'text-emerald-600' : 'text-rose-600')}>
                  {m.trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {Math.abs(m.trend)}%
                </span>
              )}
            </div>
            <p className="text-xl font-semibold text-[#0d0c22]">{m.value}</p>
            <p className="text-xs text-gray-500">{m.label} · {m.sub}</p>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Sales Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#0d0c22]">Sales Funnel</h3>
            <span className="text-sm font-semibold text-violet-600">{formatCurrency(analytics.total_deal_value)}</span>
          </div>
          <div className="space-y-2">
            {sortedStages.map((stage) => (
              <div key={stage.stage} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-20 truncate">{stageLabels[stage.stage]}</span>
                <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden relative">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded flex items-center justify-end pr-2"
                    style={{ width: `${Math.max((stage.total_value / maxStageValue) * 100, 5)}%` }}
                  >
                    {(stage.total_value / maxStageValue) * 100 > 25 && (
                      <span className="text-[10px] font-medium text-white">{formatCurrency(stage.total_value)}</span>
                    )}
                  </div>
                  {(stage.total_value / maxStageValue) * 100 <= 25 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-gray-500">{formatCurrency(stage.total_value)}</span>
                  )}
                </div>
                <span className="text-xs text-gray-400 w-8 text-right">{stage.count}</span>
              </div>
            ))}
          </div>
          {lostDeals && lostDeals.count > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-500">Lost</span>
              <span className="text-rose-600 font-medium">{lostDeals.count} ({formatCurrency(lostDeals.total_value)})</span>
            </div>
          )}
        </div>

        {/* Insights */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="h-4 w-4 text-violet-600" />
            <h3 className="text-sm font-semibold text-[#0d0c22]">Insights</h3>
          </div>
          {insights.length > 0 ? (
            <div className="space-y-2">
              {insights.map((i, idx) => (
                <div key={idx} className={cn('p-2.5 rounded-lg text-xs flex items-center gap-2', {
                  'bg-emerald-50 text-emerald-700': i.type === 'success',
                  'bg-amber-50 text-amber-700': i.type === 'warning',
                  'bg-violet-50 text-violet-700': i.type === 'info',
                })}>
                  <i.icon className="h-4 w-4 flex-shrink-0" />
                  <span>{i.text}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 text-center py-4">Add more data for insights</p>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Contact Pipeline */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-[#0d0c22] mb-3">Contacts</h3>
          <div className="space-y-2">
            {[
              { label: 'Leads', value: leads, color: 'bg-violet-500' },
              { label: 'Prospects', value: prospects, color: 'bg-purple-500' },
              { label: 'Customers', value: customers, color: 'bg-emerald-500' },
              { label: 'Churned', value: churned, color: 'bg-gray-400' },
            ].map((c) => (
              <div key={c.label} className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-16">{c.label}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className={cn('h-full rounded-full', c.color)} style={{ width: `${analytics.total_contacts > 0 ? (c.value / analytics.total_contacts) * 100 : 0}%` }} />
                </div>
                <span className="text-xs text-gray-600 w-6 text-right">{c.value}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-xs">
            <span className="text-gray-500">Total: {analytics.total_contacts}</span>
            <span className="text-emerald-600 font-medium">{analytics.conversion_rate}% converted</span>
          </div>
        </div>

        {/* Task Productivity */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-[#0d0c22] mb-3">Tasks</h3>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Pending', value: pendingTasks, bg: 'bg-amber-50', text: 'text-amber-600' },
              { label: 'Active', value: inProgressTasks, bg: 'bg-blue-50', text: 'text-blue-600' },
              { label: 'Done', value: completedTasks, bg: 'bg-emerald-50', text: 'text-emerald-600' },
            ].map((t) => (
              <div key={t.label} className={cn('text-center p-2 rounded-lg', t.bg)}>
                <p className={cn('text-lg font-semibold', t.text)}>{t.value}</p>
                <p className="text-[10px] text-gray-500">{t.label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: `${taskCompletionRate}%` }} />
            </div>
            <span className="text-xs font-medium text-gray-600">{taskCompletionRate.toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">{analytics.tasks_completed_this_week} completed this week</p>
        </div>

        {/* Performance */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-[#0d0c22] mb-3">Performance</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Avg Deal', value: formatCurrency(avgDealValue), icon: DollarSign, color: 'violet' },
              { label: 'Win Rate', value: `${winRate.toFixed(0)}%`, icon: Target, color: 'emerald' },
              { label: 'Per Deal', value: analytics.total_deals > 0 ? (analytics.total_contacts / analytics.total_deals).toFixed(1) : '0', icon: Users, color: 'amber' },
              { label: 'This Month', value: analytics.deals_closed_this_month, icon: CheckCircle2, color: 'rose' },
            ].map((p) => (
              <div key={p.label} className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded-lg', `bg-${p.color}-100`)}>
                  <p.icon className={cn('h-3.5 w-3.5', `text-${p.color}-600`)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0d0c22]">{p.value}</p>
                  <p className="text-[10px] text-gray-500">{p.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
