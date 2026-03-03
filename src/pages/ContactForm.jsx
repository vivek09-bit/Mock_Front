import { useState, useContext } from 'react';
import axios from 'axios';
import { ThemeContext } from '../context/ThemeContext';

export default function ContactForm() {
    const { apiBase } = useContext(ThemeContext);
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [status, setStatus] = useState({ loading: false, success: null, error: null });

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ loading: true, success: null, error: null });

        try {
            const base = apiBase || '';
            await axios.post(`${base}/api/contact`, form);
            setStatus({ loading: false, success: 'Message sent. Thank you!', error: null });
            setForm({ name: '', email: '', subject: '', message: '' });
        } catch (err) {
            console.error('Contact submit error', err);
            setStatus({ loading: false, success: null, error: err?.response?.data?.error || 'Failed to send message' });
        }
    };

    return (
        <div className="max-w-xl mx-auto bg-white p-6 rounded-lg shadow">
            <h2 className="text-2xl font-bold mb-4">Contact Us</h2>
            {status.success && <div className="mb-3 text-green-600">{status.success}</div>}
            {status.error && <div className="mb-3 text-red-600">{status.error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold">Name</label>
                    <input name="name" value={form.name} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-semibold">Email</label>
                    <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-semibold">Subject</label>
                    <input name="subject" value={form.subject} onChange={handleChange} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <label className="block text-sm font-semibold">Message</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={6} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                    <button type="submit" disabled={status.loading} className="bg-blue-600 text-white px-4 py-2 rounded">
                        {status.loading ? 'Sending...' : 'Send Message'}
                    </button>
                </div>
            </form>
        </div>
    );
}