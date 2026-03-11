'use client';

import Link from 'next/link';
import React from 'react';

export default function Signup() {
    return (
        <div className="min-h-screen bg-sor7ed-black text-white flex flex-col justify-center items-center p-6 selection:bg-sor7ed-yellow selection:text-black relative">
            <Link href="/" className="absolute top-8 left-8 font-mono-headline text-xs text-zinc-500 hover:text-white transition-colors">
                ← BACK_TO_SYSTEM
            </Link>

            <div className="max-w-md w-full border border-white/10 bg-black p-8 md:p-12 shadow-[0_0_30px_rgba(245,198,20,0.05)] relative overflow-hidden">
                {/* Decorative corner element */}
                <div className="absolute top-0 right-0 w-16 h-16 border-t font-mono-headline border-r border-sor7ed-yellow opacity-50 m-2 pointer-events-none"></div>

                <div className="mb-8 relative z-10">
                    <div className="font-mono-headline text-[10px] text-sor7ed-yellow uppercase tracking-widest border border-sor7ed-yellow/30 px-2 py-1 inline-block mb-4 shadow-[0_0_10px_rgba(245,198,20,0.1)]">
                        INITIALIZE_CONNECTION
                    </div>
                    <h1 className="font-fuel-decay text-5xl md:text-6xl uppercase tracking-tight text-white leading-[0.85]">
                        Create <br /> Account.
                    </h1>
                    <p className="font-roboto text-zinc-400 mt-4 text-sm font-light">
                        Enter your details below to sync with the SOR7ED network and access biometric tasking.
                    </p>
                </div>

                <form className="space-y-6 relative z-10" onSubmit={(e) => { e.preventDefault(); }}>
                    <div className="space-y-2">
                        <label className="font-mono-headline text-xs text-zinc-500 uppercase tracking-widest block">Email Address</label>
                        <input
                            type="email"
                            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-sor7ed-yellow transition-colors font-roboto text-sm placeholder:text-zinc-600 focus:bg-black"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="font-mono-headline text-xs text-zinc-500 uppercase tracking-widest block">Password</label>
                        <input
                            type="password"
                            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-sor7ed-yellow transition-colors font-roboto text-sm placeholder:text-zinc-600 focus:bg-black"
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="w-full bg-sor7ed-yellow text-black font-bold uppercase tracking-widest font-mono-headline text-xs py-4 hover:bg-white transition-colors mt-8 shadow-[0_0_15px_rgba(245,198,20,0.2)] hover:shadow-white/20">
                        Initialize Access →
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center relative z-10">
                    <p className="font-roboto text-sm text-zinc-500">
                        Already have a connection?{' '}
                        <Link href="/login" className="text-white hover:text-sor7ed-yellow transition-colors font-medium border-b border-transparent hover:border-sor7ed-yellow pb-0.5">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
