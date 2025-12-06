export interface User {
  id: string;
  email: string;
  name: string;
  picture: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: string;
  owner_id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  job_title: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  status: ContactStatus;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type ContactStatus = 'lead' | 'prospect' | 'customer' | 'churned';

export interface ContactCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  job_title?: string;
  address?: string;
  city?: string;
  country?: string;
  status?: ContactStatus;
  source?: string;
  notes?: string;
}

export interface Deal {
  id: string;
  owner_id: string;
  contact_id: string | null;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  probability: number;
  expected_close_date: string | null;
  actual_close_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DealStage = 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export interface DealCreate {
  title: string;
  value?: number;
  currency?: string;
  stage?: DealStage;
  probability?: number;
  expected_close_date?: string;
  notes?: string;
  contact_id?: string;
}

export interface Task {
  id: string;
  owner_id: string;
  contact_id: string | null;
  title: string;
  description: string | null;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  is_completed: boolean;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type TaskType = 'task' | 'call' | 'meeting' | 'email' | 'follow_up';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TaskCreate {
  title: string;
  description?: string;
  task_type?: TaskType;
  priority?: TaskPriority;
  status?: TaskStatus;
  due_date?: string;
  contact_id?: string;
}

export interface DealsByStage {
  stage: string;
  count: number;
  total_value: number;
}

export interface TasksByStatus {
  status: string;
  count: number;
}

export interface ContactsByStatus {
  status: string;
  count: number;
}

export interface RecentActivity {
  type: 'contact' | 'deal' | 'task';
  action: string;
  title: string;
  timestamp: string;
}

export interface MonthlyRevenue {
  month: number;
  year: number;
  revenue: number;
  deals_count: number;
}

export interface WeeklyRevenue {
  week_start: string;
  revenue: number;
  deals_count: number;
}

export interface YearlyRevenue {
  year: number;
  revenue: number;
  deals_count: number;
}

export interface Analytics {
  total_contacts: number;
  total_deals: number;
  total_tasks: number;
  total_deal_value: number;
  deals_by_stage: DealsByStage[];
  tasks_by_status: TasksByStatus[];
  contacts_by_status: ContactsByStatus[];
  conversion_rate: number;
  tasks_completed_this_week: number;
  deals_closed_this_month: number;
  recent_activities: RecentActivity[];
  monthly_revenue: MonthlyRevenue[];
  weekly_revenue: WeeklyRevenue[];
  yearly_revenue: YearlyRevenue[];
}

export interface AuthCheck {
  authenticated: boolean;
  user: User | null;
}
