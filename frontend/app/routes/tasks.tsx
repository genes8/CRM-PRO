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
import { Card, Button, Input, Select, Badge, Modal, EmptyState } from '~/components/ui';
import { tasksApi, contactsApi } from '~/lib/api';
import { formatDate, getPriorityColor, getTaskStatusColor, cn } from '~/lib/utils';
import type { Task, TaskCreate, TaskType, TaskPriority, TaskStatus, Contact } from '~/lib/types';

export function meta() {
  return [{ title: "Tasks | Commodo" }];
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

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
    if (!confirm('Are you sure you want to delete this task?')) return;
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

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !tasks.find(t => t.due_date === dueDate)?.is_completed;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter(t => !t.is_completed);
  const completedTasks = tasks.filter(t => t.is_completed);

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-[#0d0c22]">Tasks</h3>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-300 w-48"
            />
          </div>
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-32"
          />
          <Select
            options={priorityOptions}
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-32"
          />
          <Button size="sm" onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            Add
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <Card>
          <EmptyState
            icon={CheckSquare}
            title="No tasks yet"
            description="Get started by adding your first task"
            action={
              <Button onClick={() => openModal()}>
                <Plus className="h-4 w-4" />
                Add Task
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Pending ({pendingTasks.length})
              </h2>
              <div className="space-y-2">
                {pendingTasks.map((task) => {
                  const TypeIcon = getTypeIcon(task.task_type);
                  const overdue = isOverdue(task.due_date);
                  return (
                    <Card key={task.id} padding="none" className="hover:shadow-md transition-shadow">
                      <div className="p-4 flex items-start gap-4">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className={cn(
                            'mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors',
                            task.is_completed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-slate-300 hover:border-blue-500'
                          )}
                        >
                          {task.is_completed && <Check className="h-3 w-3" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className={cn(
                                'font-medium',
                                task.is_completed ? 'text-slate-400 line-through' : 'text-slate-900'
                              )}>
                                {task.title}
                              </h3>
                              {task.description && (
                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <button
                                onClick={() => openModal(task)}
                                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <TypeIcon className="h-3.5 w-3.5" />
                              {task.task_type.replace('_', ' ')}
                            </span>
                            {task.due_date && (
                              <span className={cn(
                                'flex items-center gap-1',
                                overdue && 'text-red-600 font-medium'
                              )}>
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDate(task.due_date)}
                                {overdue && ' (Overdue)'}
                              </span>
                            )}
                            {task.contact_id && (
                              <span className="flex items-center gap-1">
                                <UsersIcon className="h-3.5 w-3.5" />
                                {getContactName(task.contact_id)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Completed ({completedTasks.length})
              </h2>
              <div className="space-y-2">
                {completedTasks.map((task) => {
                  const TypeIcon = getTypeIcon(task.task_type);
                  return (
                    <Card key={task.id} padding="none" className="opacity-60 hover:opacity-100 transition-opacity">
                      <div className="p-4 flex items-start gap-4">
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className="mt-0.5 h-5 w-5 rounded border-2 bg-green-500 border-green-500 text-white flex items-center justify-center"
                        >
                          <Check className="h-3 w-3" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <h3 className="font-medium text-slate-400 line-through">
                              {task.title}
                            </h3>
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                            <span className="flex items-center gap-1">
                              <TypeIcon className="h-3.5 w-3.5" />
                              {task.task_type.replace('_', ' ')}
                            </span>
                            {task.completed_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                Completed {formatDate(task.completed_at)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingTask ? 'Edit Task' : 'Add Task'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Task Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Type"
              options={typeOptions}
              value={formData.task_type}
              onChange={(e) => setFormData({ ...formData, task_type: e.target.value as TaskType })}
            />
            <Select
              label="Priority"
              options={priorityOptions.slice(1)}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions.slice(1)}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            />
          </div>
          <Select
            label="Related Contact"
            options={[
              { value: '', label: 'Select contact' },
              ...contacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))
            ]}
            value={formData.contact_id}
            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingTask ? 'Update' : 'Create'} Task
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
