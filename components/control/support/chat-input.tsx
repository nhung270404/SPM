'use client';

import { useState } from 'react';
import { Loader2, SendHorizonal, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
    onSendMessage: (content: string) => void | Promise<void>;
    disabled?: boolean;
}

const QUICK_PROMPTS = [
    'Tóm tắt tiến độ công việc của tôi',
    'Việc nào đang trễ hạn?',
    'Tôi nên ưu tiên việc gì trước?',
];

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
    const [input, setInput] = useState('');

    const submitMessage = async (content: string) => {
        const message = content.trim();
        if (!message || disabled) return;

        setInput('');
        await onSendMessage(message);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await submitMessage(input);
    };

    return (
        <div className="shrink-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <div className="mb-3 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                    <button
                        key={prompt}
                        type="button"
                        disabled={disabled}
                        onClick={() => submitMessage(prompt)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-cyan-900 dark:hover:bg-cyan-950/40 dark:hover:text-cyan-300"
                    >
                        <Sparkles className="size-3.5" />
                        {prompt}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="flex items-end gap-3">
                <Textarea
                    value={input}
                    disabled={disabled}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void submitMessage(input);
                        }
                    }}
                    placeholder="Hỏi SPM AI Copilot về tiến độ, deadline, task trễ hoặc cách xử lý công việc..."
                    className="min-h-12 flex-1 resize-none rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed focus-visible:ring-1 focus-visible:ring-cyan-400 dark:border-slate-800 dark:bg-slate-900"
                />

                <Button
                    type="submit"
                    disabled={!input.trim() || disabled}
                    className="h-12 w-12 shrink-0 rounded-2xl bg-cyan-500 p-0 text-white shadow-sm transition hover:bg-cyan-600 active:scale-95 disabled:opacity-60"
                >
                    {disabled ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <SendHorizonal className="size-5" />
                    )}
                </Button>
            </form>
        </div>
    );
}