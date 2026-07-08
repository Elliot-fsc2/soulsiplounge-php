import { Head, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ActionButton, ContactLine, Field, Input, Textarea } from '@/components/soul-sips-ui';

export default function ContactCreate() {
    const { errors, flash, settings } = usePage<{
        errors: Record<string, string>;
        flash: { success?: string };
        settings?: {
            business_name?: string;
            tagline?: string;
            description?: string;
            address?: string;
            phone?: string;
            email?: string;
            hours?: string;
            response_time?: string;
        };
    }>().props;

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const address = settings?.address || 'My Ville Co Living 24 Ortigas Avenue Extension Barangay Rosario Pasig City 2nd floor';
    const phoneNum = settings?.phone || '0917 716 8618';
    const emailAddr = settings?.email || 'soulsipslounge@gmail.com';
    const hours = settings?.hours || 'Daily: 10:00 AM – 10:00 PM';

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        router.post('/contact', { name, email, phone, subject, message }, {
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <>
            <Head title="Contact Us" />

            <section className="mx-auto grid min-h-[calc(100vh-81px)] w-full max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-amber-400 mb-3">
                            <span>✉️</span>
                            <span className="text-xs uppercase tracking-[0.35em] font-sans">Contact Us</span>
                        </div>
                        <h2 className="mt-1 text-4xl font-serif font-semibold tracking-tight text-stone-100">
                            Send us your thoughts and inquiries
                        </h2>
                        <p className="mt-4 max-w-2xl text-stone-400 leading-relaxed">
                            Questions, large group inquiries (13+ pax), and custom arrangements are handled here. We'd love to hear from you!
                        </p>
                    </div>
                    <div className="space-y-4 border-t border-stone-800 pt-6 text-sm">
                        <ContactLine label="Address" value={address} />
                        <ContactLine label="Phone" value={phoneNum} />
                        <ContactLine label="Email" value={emailAddr} />
                        <ContactLine label="Hours" value={hours} />
                    </div>
                    <div className="overflow-hidden rounded-2xl border border-stone-800 shadow-lg">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d965.2872151339158!2d121.08549330550758!3d14.590592164365615!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c7006def589b%3A0x3420f31f99668511!2sMy-Ville%20Co%20Living!5e0!3m2!1sen!2sph!4v1782082075596!5m2!1sen!2sph"
                            width="100%" height="250" style={{ border: 0 }} allowFullScreen loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade" className="w-full" title="Location"
                        />
                    </div>
                </div>

                <motion.form initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                    onSubmit={handleSubmit}
                    className="space-y-4 rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-2xl shadow-stone-950/60"
                >
                    <Field label="Full name">
                        <Input value={name} onChange={setName} placeholder="Your name" required />
                    </Field>
                    {errors.name && <p className="text-xs text-rose-400">{errors.name}</p>}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Email">
                            <Input value={email} onChange={setEmail} type="email" placeholder="you@example.com" required />
                        </Field>
                        {errors.email && <p className="text-xs text-rose-400">{errors.email}</p>}
                        <Field label="Phone">
                            <Input value={phone} onChange={setPhone} type="tel" placeholder="Mobile Number" />
                        </Field>
                    </div>
                    <Field label="Subject">
                        <Input value={subject} onChange={setSubject} placeholder="How can we help?" required />
                    </Field>
                    {errors.subject && <p className="text-xs text-rose-400">{errors.subject}</p>}
                    <Field label="Message">
                        <Textarea value={message} onChange={setMessage} placeholder="Tell us about your request" rows={6} required />
                    </Field>
                    {errors.message && <p className="text-xs text-rose-400">{errors.message}</p>}

                    <ActionButton type="submit" disabled={submitting} className="w-full">
                        {submitting ? 'Sending...' : 'Send message'}
                    </ActionButton>
                </motion.form>
            </section>
        </>
    );
}
