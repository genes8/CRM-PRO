import { useState, useEffect } from 'react';
import type { DragEvent } from 'react';
import {
  Plus,
  Search,
  Briefcase,
  Trash2,
  Edit,
  Calendar,
  GripVertical,
  User
} from 'lucide-react';
import { Card, Button, Input, Select, Modal, EmptyState } from '~/components/ui';
import { dealsApi, contactsApi } from '~/lib/api';
import { formatCurrency, formatDate, getStageColor, cn } from '~/lib/utils';
import type { Deal, DealCreate, DealStage, Contact } from '~/lib/types';

export function meta() {
  return [{ title: "Deals | CRM Pro" }];
}

const stageOptions = [
  { value: '', label: 'All' },
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
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

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
        dealsApi.getAll({ stage: stageFilter || undefined, search: searchQuery || undefined }),
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
      if (editingDeal) await dealsApi.update(editingDeal.id, submitData);
      else await dealsApi.create(submitData);
      await loadData();
      closeModal();
    } catch (error) {
      console.error('Failed to save deal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this deal?')) return;
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
      console.error('Failed to update stage:', error);
    }
  };

  const openModal = (deal?: Deal, mode: 'view' | 'edit' = 'view') => {
    setModalMode(mode);
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
        title: '', value: 0, currency: 'USD', stage: 'lead',
        probability: 10, expected_close_date: '', notes: '', contact_id: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => { setIsModalOpen(false); setEditingDeal(null); setModalMode('view'); };

  const getContactName = (contactId: string | null) => {
    if (!contactId) return null;
    const contact = contacts.find(c => c.id === contactId);
    return contact ? `${contact.first_name} ${contact.last_name}` : null;
  };

  const getDealsByStage = (stage: DealStage) => deals.filter(d => d.stage === stage);

  // Drag & Drop
  const handleDragStart = (e: DragEvent<HTMLDivElement>, deal: Deal) => {
    setDraggedDeal(deal);
    e.dataTransfer.effectAllowed = 'move';
  };
  const handleDragEnd = () => { setDraggedDeal(null); setDragOverStage(null); };
  const handleDragOver = (e: DragEvent<HTMLDivElement>, stage: DealStage) => {
    e.preventDefault();
    setDragOverStage(stage);
  };
  const handleDragLeave = () => setDragOverStage(null);
  const handleDrop = async (e: DragEvent<HTMLDivElement>, targetStage: DealStage) => {
    e.preventDefault();
    if (draggedDeal && draggedDeal.stage !== targetStage) {
      await handleStageChange(draggedDeal.id, targetStage);
    }
    setDraggedDeal(null);
    setDragOverStage(null);
  };

  const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-3 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('pipeline')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                viewMode === 'pipeline' ? 'bg-white shadow-sm text-[#0d0c22]' : 'text-gray-500'
              )}
            >
              Pipeline
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-colors',
                viewMode === 'list' ? 'bg-white shadow-sm text-[#0d0c22]' : 'text-gray-500'
              )}
            >
              List
            </button>
          </div>
          <span className="text-xs text-gray-500">{deals.length} deals</span>
          <span className="text-sm font-semibold text-[#0d0c22]">{formatCurrency(totalValue)}</span>
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
          {viewMode === 'list' && (
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-2 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-600"
            >
              <option value="">Stage</option>
              {stageOptions.slice(1).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          )}
          <Button size="sm" onClick={() => openModal()} className="text-xs px-3 py-1.5 h-auto">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </div>
      </div>

      {/* Pipeline View */}
      {viewMode === 'pipeline' ? (
        <div className="overflow-x-auto -mx-6 px-6 pb-2">
          <div className="flex gap-2 min-w-max">
            {stageFlow.map((stage) => {
              const stageDeals = getDealsByStage(stage);
              const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
              const isDropTarget = dragOverStage === stage;
              const stageColors = {
                closed_won: { header: 'bg-emerald-100', text: 'text-emerald-700', badge: 'bg-emerald-200 text-emerald-800' },
                closed_lost: { header: 'bg-rose-100', text: 'text-rose-700', badge: 'bg-rose-200 text-rose-800' },
                default: { header: 'bg-gray-100', text: 'text-gray-700', badge: 'bg-gray-200 text-gray-700' }
              };
              const colors = stageColors[stage as keyof typeof stageColors] || stageColors.default;

              return (
                <div
                  key={stage}
                  className="w-48 flex-shrink-0"
                  onDragOver={(e) => handleDragOver(e, stage)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, stage)}
                >
                  <div className={cn('rounded-t-lg px-3 py-2', colors.header)}>
                    <div className="flex items-center justify-between">
                      <span className={cn('text-xs font-semibold', colors.text)}>{stageLabels[stage]}</span>
                      <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', colors.badge)}>
                        {stageDeals.length}
                      </span>
                    </div>
                    <p className={cn('text-[11px] mt-0.5', colors.text)}>{formatCurrency(stageValue)}</p>
                  </div>
                  <div className={cn(
                    'rounded-b-lg p-1.5 min-h-[280px] space-y-1.5 transition-colors',
                    isDropTarget ? 'bg-violet-50 ring-2 ring-violet-400 ring-inset' : 'bg-gray-50'
                  )}>
                    {stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, deal)}
                        onDragEnd={handleDragEnd}
                        onClick={() => openModal(deal, 'view')}
                        className={cn(
                          'bg-white rounded-lg border border-gray-200 p-2.5 hover:shadow-sm transition-all cursor-grab active:cursor-grabbing group',
                          draggedDeal?.id === deal.id && 'opacity-50 scale-95'
                        )}
                      >
                        <div className="flex items-start gap-1.5">
                          <GripVertical className="h-3.5 w-3.5 text-gray-300 mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-[#0d0c22] truncate">
                              {deal.title}
                            </p>
                            <p className="text-sm font-semibold text-[#0d0c22] mt-1">{formatCurrency(deal.value)}</p>
                            <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-500">
                              {deal.contact_id && (
                                <span className="flex items-center gap-0.5 truncate">
                                  <User className="h-2.5 w-2.5" />
                                  {getContactName(deal.contact_id)}
                                </span>
                              )}
                              {deal.expected_close_date && (
                                <span className="flex items-center gap-0.5">
                                  <Calendar className="h-2.5 w-2.5" />
                                  {formatDate(deal.expected_close_date)}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                              <span className="text-[10px] text-gray-400">{deal.probability}%</span>
                              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100">
                                <button onClick={(e) => { e.stopPropagation(); openModal(deal, 'edit'); }} className="p-1 text-gray-400 hover:text-violet-600">
                                  <Edit className="h-3 w-3" />
                                </button>
                                <button onClick={(e) => { e.stopPropagation(); handleDelete(deal.id); }} className="p-1 text-gray-400 hover:text-red-600">
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {stageDeals.length === 0 && (
                      <div className={cn(
                        'flex items-center justify-center h-20 text-[10px] border border-dashed rounded-lg',
                        isDropTarget ? 'border-violet-400 text-violet-500' : 'border-gray-200 text-gray-400'
                      )}>
                        {isDropTarget ? 'Drop here' : 'Empty'}
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
            <EmptyState icon={Briefcase} title="No deals yet" description="Add your first deal"
              action={<Button onClick={() => openModal()} size="sm"><Plus className="h-4 w-4" /> Add</Button>}
            />
          </Card>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {deals.map((deal) => (
              <div key={deal.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => openModal(deal, 'view')}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#0d0c22] truncate">{deal.title}</span>
                    <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', getStageColor(deal.stage))}>
                      {stageLabels[deal.stage]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-500">
                    <span className="font-medium text-[#0d0c22]">{formatCurrency(deal.value)}</span>
                    <span>{deal.probability}%</span>
                    {deal.contact_id && <span className="truncate max-w-[120px]">{getContactName(deal.contact_id)}</span>}
                    {deal.expected_close_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(deal.expected_close_date)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => openModal(deal, 'edit')} className="p-1 text-gray-400 hover:text-gray-600 rounded">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(deal.id)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title={modalMode === 'edit' ? (editingDeal ? 'Edit Deal' : 'New Deal') : (editingDeal ? 'Deal Details' : 'New Deal')} size="md">
        {modalMode === 'view' && editingDeal ? (
          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Title</label>
              <p className="text-sm text-[#0d0c22]">{editingDeal.title}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Value</label>
                <p className="text-sm font-semibold text-[#0d0c22]">{formatCurrency(editingDeal.value)}</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Stage</label>
                <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', getStageColor(editingDeal.stage))}>
                  {stageLabels[editingDeal.stage]}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Probability</label>
                <p className="text-sm text-[#0d0c22]">{editingDeal.probability}%</p>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Expected Close Date</label>
                <p className="text-sm text-[#0d0c22]">{editingDeal.expected_close_date ? formatDate(editingDeal.expected_close_date) : 'Not set'}</p>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Contact</label>
              <p className="text-sm text-[#0d0c22]">{getContactName(editingDeal.contact_id) || 'None'}</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-500 mb-1">Notes</label>
              <div className="text-sm text-[#0d0c22] bg-gray-50 rounded-lg p-3 min-h-[80px]">
                {editingDeal.notes || 'No notes'}
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="secondary" size="sm" onClick={closeModal}>Close</Button>
              <Button type="button" size="sm" onClick={() => setModalMode('edit')}>
                <Edit className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
            <div className="grid grid-cols-2 gap-3">
              <Input label="Value" type="number" value={formData.value} onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })} />
              <Select label="Stage" options={stageOptions.slice(1)} value={formData.stage} onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Probability %" type="number" min="0" max="100" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) || 0 })} />
              <Input label="Close Date" type="date" value={formData.expected_close_date} onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })} />
            </div>
            <Select
              label="Contact"
              options={[{ value: '', label: 'None' }, ...contacts.map(c => ({ value: c.id, label: `${c.first_name} ${c.last_name}` }))]}
              value={formData.contact_id}
              onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
            />
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-violet-300"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t">
              <Button type="button" variant="secondary" size="sm" onClick={closeModal}>Cancel</Button>
              <Button type="submit" size="sm" isLoading={isSubmitting}>{editingDeal ? 'Update' : 'Create'}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
