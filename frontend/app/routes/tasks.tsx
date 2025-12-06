import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  CheckSquare,
  Trash2,
  Edit,
  Calendar,
  Phone,
  Mail,
  Users as UsersIcon,
  Clock,
  Check
} from 'lucide-react';
import { Card, Button, Input, Select, Modal, EmptyState } from '~/components/ui';
import { tasksApi, contactsApi } from '~/lib/api';
import { formatDate, getPriorityColor, cn } from '~/lib/utils';
import type { Task, TaskCreate, TaskType, TaskPriority, TaskStatus, Contact } from '~/lib/types';

export function meta() {
  return [{ title: "Tasks | CRM Pro" }];
}

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const typeOptions = [
  { value: 'task', label: 'Task' },
  { value: 'call', label: 'Call' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'email', label: 'Email' },
  { value: 'follow_up', label: 'Follow Up' },
];

const statusOptions = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<TaskCreate>({
    title: '',
    description: '',
    task_type: 'task',
    priority: 'medium',
    status: 'pending',
    due_date: '',
    contact_id: '',
  });

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter, searchQuery]);

  const loadData = async () => {
    try {
      const [tasksRes, contactsRes] = await Promise.all([
        tasksApi.getAll({
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          search: searchQuery || undefined,
        }),
        contactsApi.getAll(),
      ]);
      setTasks(tasksRes.data);
      setContacts(contactsRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        contact_id: formData.contact_id || undefined,
        due_date: formData.due_date || undefined,
      };
      if (editingTask) {
        await tasksApi.update(editingTask.id, submitData);
      } else {
        await tasksApi.create(submitData);
      }
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await tasksApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      await tasksApi.update(task.id, { is_completed: !task.is_completed });
      await loadData();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        task_type: task.task_type,
        priority: task.priority,
        status: task.status,
        due_date: task.due_date?.split('T')[0] || '',
        contact_id: task.contact_id || '',
      });
    } else {
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        task_type: 'task',
        priority: 'medium',
        status: 'pending',
        due_date: '',
        contact_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const getContactName = (contactId: string | null) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : null;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return Phone;
      case 'email': return Mail;
      case 'meeting': return UsersIcon;
      default: return CheckSquare;
    }
  };

  const isOverdue = (dueDate: string | null, isCompleted: boolean) => {
    if (!dueDate || isCompleted) return false;
    return new Date(dueDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
  const sortedPending = [...pendingTasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-[#0d0c22]">{pendingTasks.length} pending</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-xs text-gray-500">{completedTasks.length} done</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300 w-36"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600"
          >
            <option value="">Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">Active</option>
            <option value="completed">Done</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600"
          >
            <option value="">Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <Button size="sm" onClick={() => openModal()} className="text-xs px-3 py-1.5 h-auto">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Tasks */}
      {tasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description="Get started by adding your first task"
            action={<Button onClick={() => openModal()} size="sm"><Plus className="h-4 w-4" /> Add Task</Button>}
          />
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {/* Pending */}
          {sortedPending.map((task) => {
            const TypeIcon = getTypeIcon(task.task_type);
            const overdue = isOverdue(task.due_date, task.is_completed);
            return (
              <div key={task.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group">
                <button
                  onClick={() => handleToggleComplete(task)}
                  className="h-4 w-4 rounded border-2 border-gray-300 hover:border-violet-500 flex items-center justify-center flex-shrink-0 transition-colors"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#0d0c22] truncate">{task.title}</span>
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded font-medium',
                      getPriorityColor(task.priority)
                    )}>{task.priority}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
                    <span className="flex items-center gap-1">
                      <TypeIcon className="h-3 w-3" />
                      {task.task_type.replace('_', ' ')}
                    </span>
                    {task.due_date && (
                      <span className={cn('flex items-center gap-1', overdue && 'text-red-600 font-medium')}>
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.due_date)}{overdue && ' !'}
                      </span>
                    )}
                    {task.contact_id && (
                      <span className="flex items-center gap-1 truncate max-w-[120px]">
                        <UsersIcon className="h-3 w-3" />
                        {getContactName(task.contact_id)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openModal(task)} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Completed section */}
          {completedTasks.length > 0 && (
            <>
              <div className="px-4 py-2 bg-gray-50">
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">Completed ({completedTasks.length})</span>
              </div>
              {completedTasks.slice(0, 5).map((task) => {
                const TypeIcon = getTypeIcon(task.task_type);
                return (
                  <div key={task.id} className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors group opacity-60">
                    <button
                      onClick={() => handleToggleComplete(task)}
                      className="h-4 w-4 rounded border-2 bg-emerald-500 border-emerald-500 flex items-center justify-center flex-shrink-0"
                    >
                      <Check className="h-2.5 w-2.5 text-white" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm text-gray-400 line-through truncate block">{task.title}</span>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-gray-400">
                        <TypeIcon className="h-3 w-3" />
                        {task.completed_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(task.completed_at)}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {completedTasks.length > 5 && (
                <div className="px-4 py-2 text-center">
                  <span className="text-xs text-gray-400">+{completedTasks.length - 5} more completed</span>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTask ? 'Edit Task' : 'New Task'} size="md">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Type" options={typeOptions} value={formData.task_type} onChange={(e) => setFormData({ ...formData, task_type: e.target.value as TaskType })} />
            <Select label="Priority" options={priorityOptions.slice(1)} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Select label="Status" options={statusOptions.slice(1)} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })} />
            <Input label="Due Date" type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} />
          </div>
          <Select
            label="Contact"
            options={[{ value: '', label: 'None' }, ...contacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))]}
            value={formData.contact_id}
            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
          />
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={closeModal}>Cancel</Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>{editingTask ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
