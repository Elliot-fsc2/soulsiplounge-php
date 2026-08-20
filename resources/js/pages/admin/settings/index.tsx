import { Head, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { ActionButton, StatusPill, EmptyState, ListPanel, Field, Input, Textarea } from '@/components/soul-sips-ui';
import { store as bankStore, destroy as bankDelete } from '@/routes/admin/bank-accounts';
import { store as userStore, destroy as userDelete, update as userUpdate } from '@/routes/admin/users';
import ConfirmModal from '@/components/confirm-modal';

interface BankAccount {
    id: string;
    bank_name: string;
    account_name: string;
    account_number: string;
    type: string;
    qr_code_url: string | null;
}

interface UserRow {
    id: number;
    name: string;
    email: string;
    role: string | null;
    created_at: string;
}

interface Props {
    bankAccounts: BankAccount[];
    users: UserRow[];
}

const BA_TYPES = ['bank', 'gcash', 'maya'];

export default function AdminSettingsIndex({ bankAccounts: initialBankAccounts, users: initialUsers }: Props) {
    const { auth } = usePage<{ auth: { user: { role?: string | null; name?: string } | null } }>().props;
    const isAdmin = auth?.user?.role === 'admin';

    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(initialBankAccounts);
    const [users, setUsers] = useState<UserRow[]>(initialUsers);
    const [baDraft, setBaDraft] = useState<Partial<BankAccount> & { id?: string } | null>(null);
    const [baQrFile, setBaQrFile] = useState<File | null>(null);
    const [userDraft, setUserDraft] = useState<{ id?: number; name: string; email: string; password: string; role: string } | null>(null);

    useEffect(() => { setBankAccounts(initialBankAccounts); }, [initialBankAccounts]);
    useEffect(() => { setUsers(initialUsers); }, [initialUsers]);

    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        action: 'deleteBank' | 'deleteUser' | null;
        target: BankAccount | UserRow | null;
    }>({ isOpen: false, action: null, target: null });
    const [isProcessing, setIsProcessing] = useState(false);

    const openConfirm = (action: 'deleteBank' | 'deleteUser', target: BankAccount | UserRow) => {
        setConfirmState({ isOpen: true, action, target });
    };
    const closeConfirm = () => {
        setConfirmState({ isOpen: false, action: null, target: null });
    };

    const executeAction = () => {
        const { action, target } = confirmState;
        if (!action || !target) return;
        
        setIsProcessing(true);
        const options = {
            preserveScroll: true,
            onFinish: () => {
                setIsProcessing(false);
                closeConfirm();
            }
        };

        if (action === 'deleteBank') {
            const acc = target as BankAccount;
            router.delete(bankDelete.url({ bank_account: acc.id }), {
                ...options,
                onSuccess: () => setBankAccounts((prev) => prev.filter((x) => x.id !== acc.id)),
            });
        } else if (action === 'deleteUser') {
            const u = target as UserRow;
            router.delete(userDelete.url({ user: u.id }), {
                ...options,
                onSuccess: () => setUsers((prev) => prev.filter((x) => x.id !== u.id)),
            });
        }
    };

    const saveBankAccount = () => {
        if (!baDraft || !baDraft.bank_name?.trim() || !baDraft.account_name?.trim() || !baDraft.account_number?.trim()) return;
        const formData = new FormData();
        formData.append('bank_name', baDraft.bank_name);
        formData.append('account_name', baDraft.account_name);
        formData.append('account_number', baDraft.account_number);
        if (baQrFile) formData.append('qr_file', baQrFile);
        const done = () => { setBaDraft(null); setBaQrFile(null); };
        if (baDraft.id) {
            formData.append('_method', 'PUT');
            router.post('/admin/bank-accounts/' + baDraft.id, formData, { preserveScroll: true, onSuccess: done });
        } else {
            router.post(bankStore.url(), formData, { preserveScroll: true, onSuccess: done });
        }
    };

    const deleteBankAccount = (acc: BankAccount) => {
        openConfirm('deleteBank', acc);
    };

    const saveUser = () => {
        if (!userDraft || !userDraft.email.trim()) return;
        const payload: Record<string, any> = { name: userDraft.name, email: userDraft.email, role: userDraft.role };
        if (userDraft.password) payload.password = userDraft.password;
        if (userDraft.id) {
            router.put('/admin/users/' + userDraft.id, payload, {
                preserveScroll: true,
                onSuccess: () => setUserDraft(null),
            });
        } else {
            router.post(userStore.url(), payload, {
                preserveScroll: true,
                onSuccess: () => setUserDraft(null),
            });
        }
    };

    const deleteUser = (u: UserRow) => {
        openConfirm('deleteUser', u);
    };

    return (
        <>
            <Head title="Settings - Soul Sips Lounge" />

            <div className="w-full px-4 py-6 sm:px-6 lg:px-8 space-y-6">
                <h2 className="text-2xl font-serif font-semibold text-stone-100">Settings</h2>

                {/* ── Bank Accounts ── */}
                <ListPanel title={`Bank Accounts (${bankAccounts.length})`} description="Manage payment account details for customer transactions.">
                    <div className="divide-y divide-white/10">
                        {bankAccounts.map((acc) => (
                            <div key={acc.id} className="py-4 space-y-3">
                                {baDraft?.id === acc.id ? (
                                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Field label="Bank Name">
                                                <Input value={baDraft.bank_name || ''} onChange={(v) => setBaDraft((p) => p ? { ...p, bank_name: v } : p)} />
                                            </Field>
                                            <Field label="Account Name">
                                                <Input value={baDraft.account_name || ''} onChange={(v) => setBaDraft((p) => p ? { ...p, account_name: v } : p)} />
                                            </Field>
                                            <Field label="Account Number">
                                                <Input value={baDraft.account_number || ''} onChange={(v) => setBaDraft((p) => p ? { ...p, account_number: v } : p)} />
                                            </Field>
                                            <Field label="Type">
                                                <select value={baDraft.type || 'bank'} onChange={(e) => setBaDraft((p) => p ? { ...p, type: e.target.value } : p)}
                                                    className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                                                    {BA_TYPES.map((t) => <option key={t} value={t} className="bg-stone-950">{t}</option>)}
                                                </select>
                                            </Field>
                                        </div>
                                        <Field label="QR Code Image">
                                            {baDraft.qr_code_url && (
                                                <img src={baDraft.qr_code_url} alt="QR Code" className="mb-2 h-32 w-32 rounded-xl border border-stone-700 bg-white object-contain" />
                                            )}
                                            <input type="file" accept="image/*" onChange={(e) => {
                                                const file = e.target.files?.[0] ?? null;
                                                setBaQrFile(file);
                                                if (file) setBaDraft((p) => p ? { ...p, qr_code_url: URL.createObjectURL(file) } : p);
                                            }} className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-400 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-amber-300" />
                                            {baQrFile && <p className="mt-1 text-xs text-stone-500">{baQrFile.name}</p>}
                                        </Field>
                                        <div className="flex gap-2">
                                            <ActionButton onClick={saveBankAccount}>Save</ActionButton>
                                            <ActionButton variant="ghost" onClick={() => setBaDraft(null)}>Cancel</ActionButton>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.6fr_0.8fr_auto] lg:items-center">
                                        <div>
                                            <div className="font-medium text-white">{acc.bank_name}</div>
                                            <div className="text-sm text-stone-400">{acc.account_name}</div>
                                        </div>
                                        <div className="text-sm text-stone-300 font-mono">{acc.account_number}</div>
                                        <div>
                                            {acc.qr_code_url ? (
                                                <img src={acc.qr_code_url} alt="QR" className="h-10 w-10 rounded-lg border border-stone-700 bg-white object-contain" />
                                            ) : (
                                                <span className="text-xs text-stone-600">—</span>
                                            )}
                                        </div>
                                        {/* <div><StatusPill status={acc.type} compact /></div> */}
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => { setBaDraft({ ...acc }); setBaQrFile(null); }}
                                                className="rounded-full border border-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/10">Edit</button>
                                            <button type="button" onClick={() => deleteBankAccount(acc)}
                                                className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 transition hover:bg-rose-500/20">Delete</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {bankAccounts.length === 0 && !baDraft && <EmptyState message="No bank accounts configured yet." />}
                    </div>
                    {!baDraft && (
                        <div className="mt-4">
                            <ActionButton onClick={() => setBaDraft({ bank_name: '', account_name: '', account_number: '', type: 'bank' })}>
                                + Add Bank Account
                            </ActionButton>
                        </div>
                    )}
                    {baDraft && !baDraft.id && (
                        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Bank Name">
                                    <Input value={baDraft.bank_name || ''} onChange={(v) => setBaDraft((p) => p ? { ...p, bank_name: v } : p)} />
                                </Field>
                                <Field label="Account Name">
                                    <Input value={baDraft.account_name || ''} onChange={(v) => setBaDraft((p) => p ? { ...p, account_name: v } : p)} />
                                </Field>
                                <Field label="Account Number">
                                    <Input value={baDraft.account_number || ''} onChange={(v) => setBaDraft((p) => p ? { ...p, account_number: v } : p)} />
                                </Field>
                                <Field label="Type">
                                    <select value={baDraft.type || 'bank'} onChange={(e) => setBaDraft((p) => p ? { ...p, type: e.target.value } : p)}
                                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                                        {BA_TYPES.map((t) => <option key={t} value={t} className="bg-stone-950">{t}</option>)}
                                    </select>
                                </Field>
                                <Field label="QR Code Image">
                                    <input type="file" accept="image/*" onChange={(e) => {
                                        const file = e.target.files?.[0] ?? null;
                                        setBaQrFile(file);
                                        if (file) setBaDraft((p) => p ? { ...p, qr_code_url: URL.createObjectURL(file) } : p);
                                    }} className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-sm text-stone-400 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-500/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-amber-300" />
                                    {baQrFile && <p className="mt-1 text-xs text-stone-500">{baQrFile.name}</p>}
                                </Field>
                            </div>
                            <div className="flex gap-2">
                                <ActionButton onClick={saveBankAccount}>Save</ActionButton>
                                <ActionButton variant="ghost" onClick={() => { setBaDraft(null); setBaQrFile(null); }}>Cancel</ActionButton>
                            </div>
                        </div>
                    )}
                </ListPanel>

                {/* ── Staff Accounts ── */}
                {isAdmin && (
                    <ListPanel title={`Staff Accounts (${users.length})`} description="Manage admin and staff user accounts.">
                        <div className="divide-y divide-white/10">
                            {users.map((u) => (
                                <div key={u.id} className="py-4 space-y-3">
                                    {userDraft?.id === u.id ? (
                                        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <Field label="Name">
                                                    <Input value={userDraft.name} onChange={(v) => setUserDraft((p) => p ? { ...p, name: v } : p)} />
                                                </Field>
                                                <Field label="Email">
                                                    <Input value={userDraft.email} onChange={(v) => setUserDraft((p) => p ? { ...p, email: v } : p)} type="email" />
                                                </Field>
                                                <Field label="Password">
                                                    <Input value={userDraft.password} onChange={(v) => setUserDraft((p) => p ? { ...p, password: v } : p)} type="password" placeholder="Leave blank to keep current" />
                                                </Field>
                                                <Field label="Role">
                                                    <select value={userDraft.role} onChange={(e) => setUserDraft((p) => p ? { ...p, role: e.target.value } : p)}
                                                        className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                                                        <option value="staff" className="bg-stone-950">Staff</option>
                                                        <option value="admin" className="bg-stone-950">Admin</option>
                                                    </select>
                                                </Field>
                                            </div>
                                            <div className="flex gap-2">
                                                <ActionButton onClick={saveUser}>Save</ActionButton>
                                                <ActionButton variant="ghost" onClick={() => setUserDraft(null)}>Cancel</ActionButton>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 lg:grid-cols-[1.2fr_1.2fr_0.6fr_0.8fr_auto] lg:items-center">
                                            <div className="font-medium text-white">{u.name}</div>
                                            <div className="text-sm text-stone-400">{u.email}</div>
                                            <div><StatusPill status={u.role || 'staff'} compact /></div>
                                            <div className="text-xs text-stone-500">{new Date(u.created_at).toLocaleDateString()}</div>
                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => setUserDraft({ id: u.id, name: u.name, email: u.email, password: '', role: u.role || 'staff' })}
                                                    className="rounded-full border border-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/10">Edit</button>
                                                <button type="button" onClick={() => deleteUser(u)}
                                                    className="rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-xs text-rose-100 transition hover:bg-rose-500/20">Delete</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {users.length === 0 && !userDraft && <EmptyState message="No staff accounts yet." />}
                        </div>
                        {!userDraft && (
                            <div className="mt-4">
                                <ActionButton onClick={() => setUserDraft({ name: '', email: '', password: '', role: 'staff' })}>
                                    + Add User
                                </ActionButton>
                            </div>
                        )}
                        {userDraft && !userDraft.id && (
                            <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Name">
                                        <Input value={userDraft.name} onChange={(v) => setUserDraft((p) => p ? { ...p, name: v } : p)} />
                                    </Field>
                                    <Field label="Email">
                                        <Input value={userDraft.email} onChange={(v) => setUserDraft((p) => p ? { ...p, email: v } : p)} type="email" />
                                    </Field>
                                    <Field label="Password">
                                        <Input value={userDraft.password} onChange={(v) => setUserDraft((p) => p ? { ...p, password: v } : p)} type="password" />
                                    </Field>
                                    <Field label="Role">
                                        <select value={userDraft.role} onChange={(e) => setUserDraft((p) => p ? { ...p, role: e.target.value } : p)}
                                            className="w-full rounded-xl border border-stone-700 bg-stone-950 px-4 py-3 text-stone-100 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20">
                                            <option value="staff" className="bg-stone-950">Staff</option>
                                            <option value="admin" className="bg-stone-950">Admin</option>
                                        </select>
                                    </Field>
                                </div>
                                <div className="flex gap-2">
                                    <ActionButton onClick={saveUser}>Save</ActionButton>
                                    <ActionButton variant="ghost" onClick={() => setUserDraft(null)}>Cancel</ActionButton>
                                </div>
                            </div>
                        )}
                    </ListPanel>
                )}
            </div>

            <ConfirmModal
                isOpen={confirmState.isOpen}
                onClose={closeConfirm}
                onConfirm={executeAction}
                isLoading={isProcessing}
                title={
                    confirmState.action === 'deleteBank' ? 'Delete Bank Account' : 'Delete User'
                }
                description={
                    confirmState.action === 'deleteBank'
                        ? `Are you sure you want to permanently delete the bank account "${(confirmState.target as BankAccount)?.bank_name}"? This action cannot be undone.`
                        : `Are you sure you want to permanently delete the user ${(confirmState.target as UserRow)?.email}? This action cannot be undone.`
                }
                confirmText={
                    confirmState.action === 'deleteBank' ? 'Yes, Delete Account' : 'Yes, Delete User'
                }
            />
        </>
    );
}
