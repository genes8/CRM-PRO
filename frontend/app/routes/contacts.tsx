import { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Mail, 
  Phone, 
  Building2,
  MapPin,
  Trash2,
  Edit,
  Users,
  X,
  Calendar,
  FileText
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, EmptyState, Avatar } from '~/components/ui';
import { contactsApi } from '~/lib/api';
import { formatDate, getStatusColor, cn } from '~/lib/utils';
import type { Contact, ContactCreate, ContactStatus } from '~/lib/types';

export function meta() {
  return [{ title: "Contacts | Commodo" }];
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'lead', label: 'Lead' },
  { value: 'prospect', label: 'Prospect' },
  { value: 'customer', label: 'Customer' },
  { value: 'churned', label: 'Churned' },
];

const sourceOptions = [
  { value: '', label: 'Select source' },
  { value: 'website', label: 'Website' },
  { value: 'referral', label: 'Referral' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'conference', label: 'Conference' },
  { value: 'webinar', label: 'Webinar' },
  { value: 'partner', label: 'Partner' },
];

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [viewingContact, setViewingContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<ContactCreate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    city: '',
    country: '',
    status: 'lead',
    source: '',
    notes: '',
  });

  useEffect(() => {
    loadContacts();
  }, [statusFilter, searchQuery]);

  const loadContacts = async () => {
    try {
      const response = await contactsApi.getAll({
        status: statusFilter || undefined,
        search: searchQuery || undefined,
      });
      setContacts(response.data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingContact) {
        await contactsApi.update(editingContact.id, formData);
      } else {
        await contactsApi.create(formData);
      }
      await loadContacts();
      closeModal();
    } catch (error) {
      console.error('Failed to save contact:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact?')) return;
    try {
      await contactsApi.delete(id);
      await loadContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
    }
  };

  const openModal = (contact?: Contact) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        first_name: contact.first_name,
        last_name: contact.last_name,
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        job_title: contact.job_title || '',
        city: contact.city || '',
        country: contact.country || '',
        status: contact.status,
        source: contact.source || '',
        notes: contact.notes || '',
      });
    } else {
      setEditingContact(null);
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        city: '',
        country: '',
        status: 'lead',
        source: '',
        notes: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
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
      {/* Contacts Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Header with filters */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-base font-semibold text-[#0d0c22]">Contacts</h3>
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
              className="w-36"
            />
            <Button size="sm" onClick={() => openModal()}>
              <Plus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </div>

        {/* Table */}
        {contacts.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Users}
              title="No contacts yet"
              description="Get started by adding your first contact"
              action={
                <Button onClick={() => openModal()}>
                  <Plus className="h-4 w-4" />
                  Add Contact
                </Button>
              }
            />
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Email</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Company</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr 
                  key={contact.id} 
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setViewingContact(contact)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${contact.first_name} ${contact.last_name}`} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-[#0d0c22]">
                          {contact.first_name} {contact.last_name}
                        </p>
                        {contact.job_title && (
                          <p className="text-xs text-gray-500">{contact.job_title}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{contact.email || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{contact.company || '-'}</td>
                  <td className="px-4 py-3">
                    <Badge className={getStatusColor(contact.status)}>{contact.status}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openModal(contact)}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contact.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Contact Modal */}
      <Modal
        isOpen={!!viewingContact}
        onClose={() => setViewingContact(null)}
        title="Contact Details"
      >
        {viewingContact && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
              <Avatar name={`${viewingContact.first_name} ${viewingContact.last_name}`} size="lg" />
              <div>
                <h3 className="text-lg font-semibold text-[#0d0c22]">
                  {viewingContact.first_name} {viewingContact.last_name}
                </h3>
                {viewingContact.job_title && viewingContact.company && (
                  <p className="text-sm text-gray-500">{viewingContact.job_title} at {viewingContact.company}</p>
                )}
                <Badge className={cn('mt-2', getStatusColor(viewingContact.status))}>{viewingContact.status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              {viewingContact.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${viewingContact.email}`} className="text-gray-600 hover:text-[#0d0c22]">{viewingContact.email}</a>
                </div>
              )}
              {viewingContact.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <a href={`tel:${viewingContact.phone}`} className="text-gray-600 hover:text-[#0d0c22]">{viewingContact.phone}</a>
                </div>
              )}
              {viewingContact.company && (
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{viewingContact.company}</span>
                </div>
              )}
              {(viewingContact.city || viewingContact.country) && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">{[viewingContact.city, viewingContact.country].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {viewingContact.source && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Source: {viewingContact.source}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600">Added: {formatDate(viewingContact.created_at)}</span>
              </div>
            </div>

            {viewingContact.notes && (
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-medium text-[#0d0c22]">Notes</span>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{viewingContact.notes}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
              <Button variant="secondary" onClick={() => setViewingContact(null)}>Close</Button>
              <Button onClick={() => { openModal(viewingContact); setViewingContact(null); }}>
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
            />
            <Input
              label="Last Name"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              required
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            />
            <Input
              label="Job Title"
              value={formData.job_title}
              onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="City"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <Input
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              options={statusOptions.slice(1)}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as ContactStatus })}
            />
            <Select
              label="Source"
              options={sourceOptions}
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            />
          </div>
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
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingContact ? 'Update' : 'Create'} Contact
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
