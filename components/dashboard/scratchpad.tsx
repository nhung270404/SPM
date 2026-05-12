'use client';

import React, { useState } from 'react';
import { StickyNote, Save } from 'lucide-react';

export function ScratchPad() {
    const [note, setNote] = useState('');

    return (
        <div className="relative group overflow-hidden bg-[#fefce8] dark:bg-amber-950/20 p-6 rounded-[2.5rem] border border-amber-100 dark:border-amber-900/50 shadow-lg shadow-amber-500/5 min-h-[160px] flex flex-col">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <StickyNote className="h-24 w-24 rotate-12" />
            </div>

            <div className="flex items-center justify-between mb-3 z-10">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-amber-200/50 dark:bg-amber-800/50 rounded-lg">
                        <StickyNote className="h-4 w-4 text-amber-700 dark:text-amber-400" />
                    </div>
                    <h3 className="text-sm font-bold text-amber-900 dark:text-amber-200 uppercase tracking-widest">Ghi chú nhanh</h3>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-amber-200/50 rounded-lg text-amber-700">
                    <Save className="h-4 w-4" />
                </button>
            </div>

            <textarea 
                className="flex-1 bg-transparent border-none focus:ring-0 text-slate-700 dark:text-amber-100/80 text-sm font-medium placeholder:text-amber-800/30 dark:placeholder:text-amber-100/20 resize-none custom-scrollbar"
                placeholder="Gõ ý tưởng tại đây..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
            />
        </div>
    );
}
