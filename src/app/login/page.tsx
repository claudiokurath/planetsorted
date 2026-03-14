'use client';

import Link from 'next/link';
import React, { useState } from 'react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Since we are not doing a full Auth here yet, log it
        console.log("Initialize login for:", email);
    };

    return (
        <div className="min-h-screen bg-sor7ed-black text-white flex flex-col justify-center items-center p-6 selection:bg-sor7ed-yellow selection:text-black relative">
            <Link href="/" className="absolute top-8 left-8 font-mono-headline text-xs text-zinc-500 hover:text-white transition-colors">
                ← BACK_TO_SYSTEM
            </Link>

            <div className="max-w-md w-full border border-white/10 bg-black p-8 md:p-12 shadow-[0_0_30px_rgba(245,198,20,0.05)] relative overflow-hidden group">
                {/* Decorative corner slashes */}
                <div className="absolute top-6 right-8 font-mono-headline text-lg tracking-widest text-sor7ed-yellow opacity-40 select-none pointer-events-none transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-1">
                    //
                </div>

                <div className="mb-8 relative z-10">
                    <div className="font-mono-headline text-[10px] text-sor7ed-yellow uppercase tracking-widest border border-sor7ed-yellow/30 px-2 py-1 inline-block mb-4 shadow-[0_0_10px_rgba(245,198,20,0.1)]">
                        INITIALIZE_CONNECTION
                    </div>
                    <h1 className="font-fuel-decay text-5xl md:text-6xl uppercase tracking-tight text-white leading-[0.85]">
                        Initialize <br /> Access.
                    </h1>
                    <p className="font-roboto text-zinc-400 mt-4 text-sm font-light">
                        Enter your details to access the SOR7ED system.
                    </p>
                </div>

                <form className="space-y-6 relative z-10" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <label className="font-mono-headline text-xs text-zinc-500 uppercase tracking-widest block">Email Address</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-sor7ed-yellow transition-colors font-roboto text-sm placeholder:text-zinc-600 focus:bg-black"
                            placeholder="origin@system.core"
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <div className="flex justify-between items-center mb-1">
                            <label className="font-mono-headline text-xs text-zinc-500 uppercase tracking-widest block">Password</label>
                            <a href="#" className="font-mono-headline text-[10px] text-zinc-600 hover:text-white transition-colors">Forgot?</a>
                        </div>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-800 text-white px-4 py-3 focus:outline-none focus:border-sor7ed-yellow transition-colors font-roboto text-sm placeholder:text-zinc-600 focus:bg-black"
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="w-full bg-sor7ed-yellow text-black font-bold uppercase tracking-widest font-mono-headline text-xs py-4 hover:bg-white transition-colors mt-8 shadow-[0_0_15px_rgba(245,198,20,0.2)] hover:shadow-white/20">
                        Log In →
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center relative z-10">
                    <p className="font-roboto text-sm text-zinc-500">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-white hover:text-sor7ed-yellow transition-colors font-medium border-b border-transparent hover:border-sor7ed-yellow pb-0.5">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
