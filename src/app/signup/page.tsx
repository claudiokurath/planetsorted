'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function Signup() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [consent, setConsent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!consent) {
            setError('You must agree to receive WhatsApp messages to continue.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerName: name,
                    email,
                    phoneNumber: phone,
                    creditsBalance: 0,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to initialize connection.');
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-sor7ed-black text-white flex flex-col justify-center items-center p-6 selection:bg-sor7ed-yellow selection:text-black relative">
            <Link href="/" className="absolute top-8 left-8 font-mono-headline text-xs text-zinc-500 hover:text-white transition-colors">
                ← BACK_TO_SYSTEM
            </Link>

            <div className="max-w-md w-full border border-white/10 bg-black p-8 md:p-12 shadow-[0_0_30px_rgba(245,198,20,0.05)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 border-t font-mono-headline border-r border-sor7ed-yellow opacity-50 m-2 pointer-events-none"></div>

                <div className="mb-8 relative z-10">
                    <div className="font-mono-headline text-[10px] text-sor7ed-yellow uppercase tracking-widest border border-sor7ed-yellow/30 px-2 py-1 inline-block mb-4 shadow-[0_0_10px_rgba(245,198,20,0.1)]">
                        WHATSAPP INTEGRATION
                    </div>
                    <h1 className="font-fuel-decay text-5xl md:text-6xl uppercase tracking-tight text-white leading-[0.85]">
                        Create <br /> Account.
                    </h1>
                    <p className="font-roboto text-zinc-400 mt-4 text-sm font-light">
                        {success
                            ? "Your account is created. Let's finish setup in WhatsApp."
                            : "Enter your details to create your account and connect SOR7ED to your WhatsApp."}
                    </p>
                </div>

                {success ? (
                    <div className="relative z-10 space-y-6 text-center pt-4">
                        <div className="w-16 h-16 rounded-full border border-sor7ed-yellow flex items-center justify-center mx-auto mb-6 text-sor7ed-yellow shadow-[0_0_15px_rgba(245,198,20,0.2)]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                        <h3 className="font-mono-headline tracking-widest text-sor7ed-yellow text-xl">ALMOST THERE</h3>
                        <p className="font-roboto text-zinc-400 text-sm">Tap the button below to open WhatsApp and send your first message to activate your assistant.</p>
                        <a
                            href="https://wa.me/447360277713"
                            target="_blank"
                            rel="noreferrer"
                            className="block w-full bg-sor7ed-yellow text-black font-bold uppercase tracking-widest font-mono-headline text-xs py-4 hover:bg-white transition-colors mt-8 shadow-[0_0_15px_rgba(245,198,20,0.2)] hover:shadow-white/20"
                        >
                            Open WhatsApp →
                        </a>
                    </div>
                ) : (
                    <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-3 text-sm font-mono-headline tracking-wider">
                                [ERROR]: {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label className="font-mono-headline text-xs text-zinc-500 uppercase tracking-widest block">Full Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-sor7ed-yellow transition-colors font-roboto text-sm placeholder:text-zinc-600 focus:bg-black"
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-mono-headline text-xs text-zinc-500 uppercase tracking-widest block">Email Address (Optional)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-sor7ed-yellow transition-colors font-roboto text-sm placeholder:text-zinc-600 focus:bg-black"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="font-mono-headline text-xs text-zinc-500 uppercase tracking-widest block">WhatsApp Number</label>
                            <input
                                type="tel"
                                required
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-sor7ed-yellow transition-colors font-roboto text-sm placeholder:text-zinc-600 focus:bg-black"
                                placeholder="+1234567890"
                            />
                        </div>

                        <div className="flex items-start space-x-3">
                            <input
                                type="checkbox"
                                id="consentCheckbox"
                                required
                                checked={consent}
                                onChange={(e) => setConsent(e.target.checked)}
                                className="mt-1 w-4 h-4 text-sor7ed-yellow bg-zinc-900 border-zinc-800 rounded focus:ring-sor7ed-yellow focus:ring-2"
                            />
                            <label htmlFor="consentCheckbox" className="font-roboto text-sm text-zinc-400">
                                I agree to receive WhatsApp messages to activate and use my account.
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-sor7ed-yellow text-black font-bold uppercase tracking-widest font-mono-headline text-xs py-4 hover:bg-white transition-colors mt-8 shadow-[0_0_15px_rgba(245,198,20,0.2)] hover:shadow-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Creating Account..." : "Create Account →"}
                        </button>
                    </form>
                )}

                {!success && (
                    <div className="mt-8 pt-8 border-t border-white/5 text-center relative z-10">
                        <p className="font-roboto text-sm text-zinc-500">
                            Already have an account?{' '}
                            <Link href="/login" className="text-white hover:text-sor7ed-yellow transition-colors font-medium border-b border-transparent hover:border-sor7ed-yellow pb-0.5">
                                Log in here
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
