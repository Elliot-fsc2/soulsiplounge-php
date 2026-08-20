import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ActionButton, StatusPill, EmptyState, ListPanel } from '@/components/soul-sips-ui';
import type { Contact } from '@/types/domain';
import ConfirmModal from '@/components/confirm-modal';

interface Props {
  contacts: Contact[];
}

export default function AdminContactsIndex({ contacts }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    action: 'delete' | null;
    contact: Contact | null;
  }>({ isOpen: false, action: null, contact: null });
  const [isProcessing, setIsProcessing] = useState(false);

  const openConfirm = (action: 'delete', contact: Contact) => {
    setConfirmState({ isOpen: true, action, contact });
  };
  const closeConfirm = () => {
    setConfirmState({ isOpen: false, action: null, contact: null });
  };

  const executeAction = () => {
    const { action, contact } = confirmState;
    if (action === 'delete' && contact) {
      setIsProcessing(true);
      router.delete(`/admin/contacts/${contact.id}`, { 
        preserveScroll: true,
        onFinish: () => {
          setIsProcessing(false);
          closeConfirm();
        }
      });
    }
  };

  const updateStatus = (c: Contact, status: 'Read' | 'Archived' | 'New') => {
    router.patch(`/admin/contacts/${c.id}/status`, { status }, { preserveScroll: true });
  };

  const deleteContact = (c: Contact) => {
    openConfirm('delete', c);
  };

  return (
    <>
      <Head title="Contact Inbox - Soul Sips Lounge" />

      <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        <h2 className="text-2xl font-serif font-semibold text-stone-100">Contact Inbox</h2>

        <ListPanel title="Messages" description="Manage every contact request.">
          <div className="divide-y divide-white/10">
            {contacts.map((c) => (
              <div key={c.id} className="py-4 space-y-3">
                <div className="grid gap-4 lg:grid-cols-[1.1fr_1.2fr_auto] lg:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-white">{c.name}</div>
                      <StatusPill status={c.status} compact />
                    </div>
                    <div className="text-sm text-stone-400">{c.email}</div>
                    {c.phone && <div className="text-sm text-stone-400">{c.phone}</div>}
                    <div className="mt-2 text-xs uppercase tracking-[0.2em] text-stone-500">{new Date(c.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{c.subject}</div>
                    <p className={`mt-1 text-sm leading-6 text-stone-300 ${expanded !== c.id ? 'line-clamp-2' : ''}`}>{c.message}</p>
                    {c.message.length > 120 && (
                      <button type="button" onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                        className="mt-1 text-xs text-amber-400 hover:underline">{expanded === c.id ? 'Show less' : 'Show more'}</button>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {c.status === 'New' && (
                    <ActionButton variant="ghost" onClick={() => updateStatus(c, 'Read')}>
                      Mark Read
                    </ActionButton>
                  )}
                  {c.status === 'Read' && (
                    <>
                      <ActionButton variant="ghost" onClick={() => updateStatus(c, 'Archived')}>
                        Archive
                      </ActionButton>
                      <ActionButton variant="ghost" onClick={() => updateStatus(c, 'New')}>
                        Mark Unread
                      </ActionButton>
                    </>
                  )}
                  {c.status === 'Archived' && (
                    <ActionButton variant="ghost" onClick={() => updateStatus(c, 'New')}>
                      Mark Unread
                    </ActionButton>
                  )}
                  <ActionButton variant="ghost" onClick={() => deleteContact(c)}
                    className="!border-rose-400/20 !bg-rose-500/10 !text-rose-300 hover:!bg-rose-500/20">
                    Delete
                  </ActionButton>
                </div>
              </div>
            ))}
            {contacts.length === 0 && <EmptyState message="No contact messages yet." />}
          </div>
        </ListPanel>
      </div>

      <ConfirmModal
        isOpen={confirmState.isOpen}
        onClose={closeConfirm}
        onConfirm={executeAction}
        isLoading={isProcessing}
        title="Delete Message"
        description={`Are you sure you want to permanently delete the message from "${confirmState.contact?.name}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
      />
    </>
  );
}
