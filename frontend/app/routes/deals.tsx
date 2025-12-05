import { useState, useEffect } from 'react';
import type { DragEvent } from 'react';
import { 
  Plus, 
  Search, 
  Briefcase,
  Trash2,
  Edit,
  DollarSign,
  Calendar,
  GripVertical
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, EmptyState } from '~/components/ui';
import { dealsApi, contactsApi } from '~/lib/api';
import { formatCurrency, formatDate, getStageColor, cn } from '~/lib/utils';
import type { Deal, DealCreate, DealStage, Contact } from '~/lib/types';

export function meta() {
  return [{ title: "Deals | CRM Pro" }];
}

const stageOptions = [
  { value: '', label: 'All Stages' },
  { value: 'lead', label: 'Lead' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'proposal', label: 'Proposal' },
  { value: 'negotiation', label: 'Negotiation' },
  { value: 'closed_won', label: 'Won' },
  { value: 'closed_lost', label: 'Lost' },
];

const stageLabels: Record<DealStage, string> = {
  lead: 'Lead',
  qualified: 'Qualified',
  proposal: 'Proposal',
  negotiation: 'Negotiation',
  closed_won: 'Won',
  closed_lost: 'Lost',
};

const stageFlow: DealStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('pipeline');
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null);
  const [dragOverStage, setDragOverStage] = useState<DealStage | null>(null);

  const [formData, setFormData] = useState<DealCreate>({
    title: '',
    value: 0,
    currency: 'USD',
    stage: 'lead',
    probability: 10,
    expected_close_date: '',
    notes: '',
    contact_id: '',
  });

  useEffect(() => {
    loadData();
  }, [stageFilter, searchQuery]);

  const loadData = async () => {
    try {
      const [dealsRes, contactsRes] = await Promise.all([
        dealsApi.getAll({
          stage: stageFilter || undefined,
          search: searchQuery || undefined,
        }),
        contactsApi.getAll(),
      ]);
      setDeals(dealsRes.data);
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
        expected_close_date: formData.expected_close_date || undefined,
      };
      if (editingDeal) {
        await dealsApi.update(editingDeal.id, submitData);
      } else {
        await dealsApi.create(submitData);
      }
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save deal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this deal?')) return;
    try {
      await dealsApi.delete(id);
      await loadData();
    } catch (error) {
      console.error('Failed to delete deal:', error);
    }
  };

  const handleStageChange = async (dealId: string, newStage: DealStage) => {
    try {
      await dealsApi.update(dealId, { stage: newStage });
      await loadData();
    } catch (error) {
      console.error('Failed to update deal stage:', error);
    }
  };

  const openModal = (deal?: Deal) => {
    if (deal) {
      setEditingDeal(deal);
      setFormData({
        title: deal.title,
        value: deal.value,
        currency: deal.currency,
        stage: deal.stage,
        probability: deal.probability,
        expected_close_date: deal.expected_close_date?.split('T')[0] || '',
        notes: deal.notes || '',
        contact_id: deal.contact_id || '',
      });
    } else {
      setEditingDeal(null);
      setFormData({
        title: '',
        value: 0,
        currency: 'USD',
        stage: 'lead',
        probability: 10,
        expected_close_date: '',
        notes: '',
        contact_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingDeal(null);
  };

  const getContactName = (contactId: string | null) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : null;
  };

  const getDealsByStage = (stage: DealStage) => {
    return deals.filter(d => d.stage === stage);
  };

  // Drag & Drop handlers
  const handleDragStart = (e: DragEvent<HTMLDivElement>, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, stage: DealStage) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>, targetStage: DealStage) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== targetStage) {
      await handleStageChange(draggedDeal.id, targetStage);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deals</h1>
          <p className="text-slate-500 mt-1">Track your sales pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('pipeline')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'pipeline' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              )}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white shadow text-slate-900' : 'text-slate-600'
              )}
            >
              List
            </button>
          </div>
          <Button onClick={() => openModal()}>
            <Plus className="h-4 w-4" />
            Add Deal
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card padding="sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search deals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          {viewMode === 'list' && (
            <Select
              options={stageOptions}
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="w-full sm:w-48"
            />
          )}
        </div>
      </Card>

      {/* Pipeline View */}
      {viewMode === 'pipeline' ? (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4 min-w-max">
            {stageFlow.map((stage) => {
              const stageDeals = getDealsByStage(stage);
              const totalValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
              const isDropTarget = dragOverStage === stage;
              return (
                <div 
                  key={stage} 
                  className="w-72 flex-shrink-0"
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <div className={cn(
                    "rounded-t-xl px-4 py-3 transition-colors",
                    stage === 'closed_won' ? 'bg-green-100' : 
                    stage === 'closed_lost' ? 'bg-red-100' : 'bg-slate-100'
                  )}>
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-semibold",
                        stage === 'closed_won' ? 'text-green-800' : 
                        stage === 'closed_lost' ? 'text-red-800' : 'text-slate-900'
                      )}>
                        {stageLabels[stage]}
                      </h3>
                      <span className={cn(
                        "text-sm px-2 py-0.5 rounded-full",
                        stage === 'closed_won' ? 'bg-green-200 text-green-800' : 
                        stage === 'closed_lost' ? 'bg-red-200 text-red-800' : 'bg-slate-200 text-slate-600'
                      )}>
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className={cn(
                      "text-sm mt-0.5",
                      stage === 'closed_won' ? 'text-green-700' : 
                      stage === 'closed_lost' ? 'text-red-700' : 'text-slate-500'
                    )}>
                      {formatCurrency(totalValue)}
                    </p>
                  </div>
                  <div className={cn(
                    "rounded-b-xl p-2 min-h-[400px] space-y-2 transition-colors",
                    isDropTarget ? 'bg-blue-50 ring-2 ring-blue-400 ring-inset' : 'bg-slate-50'
                  )}>
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onDragEnd={handleDragEnd}
                        className={cn(
                          "bg-white rounded-lg border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
                          draggedDeal?.id === deal.id && "opacity-50 scale-95"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-slate-300 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-medium text-slate-900 mb-2 cursor-pointer hover:text-blue-600"
                              onClick={() => openModal(deal)}
                            >
                              {deal.title}
                            </h4>
                            <p className="text-lg font-semibold text-slate-900">
                              {formatCurrency(deal.value)}
                            </p>
                            {deal.contact_id && (
                              <p className="text-sm text-slate-500 mt-2">
                                {getContactName(deal.contact_id)}
                              </p>
                            )}
                            {deal.expected_close_date && (
                              <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                                <Calendar className="h-3 w-3" />
                                {formatDate(deal.expected_close_date)}
                              </div>
                            )}
                            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                              <span className="text-xs text-slate-500">{deal.probability}%</span>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openModal(deal);
                                  }}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(deal.id);
                                  }}
                                  className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className={cn(
                        "flex items-center justify-center h-32 text-sm border-2 border-dashed rounded-lg",
                        isDropTarget ? 'border-blue-400 text-blue-500' : 'border-slate-200 text-slate-400'
                      )}>
                        {isDropTarget ? 'Drop here' : 'No deals'}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        deals.length === 0 ? (
          <Card>
            <EmptyState
              icon={Briefcase}
              title="No deals yet"
              description="Get started by adding your first deal"
              action={
                <Button onClick={() => openModal()}>
                  <Plus className="h-4 w-4" />
                  Add Deal
                </Button>
              }
            />
          </Card>
        ) : (
          <div className="grid gap-4">
            {deals.map((deal) => (
              <Card key={deal.id} padding="none" className="hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-purple-100 rounded-xl">
                        <Briefcase className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">{deal.title}</h3>
                        {deal.contact_id && (
                          <p className="text-sm text-slate-500">{getContactName(deal.contact_id)}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStageColor(deal.stage)}>
                        {stageLabels[deal.stage]}
                      </Badge>
                      <button
                        onClick={() => openModal(deal)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(deal.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">{formatCurrency(deal.value)}</span>
                    </div>
                    <div className="text-slate-500">
                      {deal.probability}% probability
                    </div>
                    {deal.expected_close_date && (
                      <div className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-4 w-4" />
                        Expected: {formatDate(deal.expected_close_date)}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingDeal ? 'Edit Deal' : 'Add Deal'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Deal Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Value"
              type="number"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
            />
            <Select
              label="Stage"
              options={stageOptions.slice(1)}
              value={formData.stage}
              onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Probability (%)"
              type="number"
              min="0"
              max="100"
              value={formData.probability}
              onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Expected Close Date"
              type="date"
              value={formData.expected_close_date}
              onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
            />
          </div>
          <Select
            label="Contact"
            options={[
              { value: '', label: 'Select contact' },
              ...contacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))
            ]}
            value={formData.contact_id}
            onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingDeal ? 'Update' : 'Create'} Deal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
