'use client';

import {cn} from '@/lib/utils';
import {Bot, User} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

interface ChatMessagesProps {
    messages: Message[],
    isTyping?: boolean
}

import {useEffect, useRef} from 'react';

export function ChatMessages({messages, isTyping}: ChatMessagesProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    return (
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6 no-scrollbar">
            {messages.map((message) => {
                const isBot = message.sender === 'bot';
                return (
                    <div
                        key={message.id}
                        className={cn(
                            "flex items-end gap-3",
                            isBot ? "flex-row" : "flex-row-reverse"
                        )}
                    >
                        {/* Avatar */}
                        <div className={cn(
                            "size-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                            isBot ? "bg-[#36caf1]/10 text-[#36caf1]" : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                        )}>
                            {isBot ? <Bot className="size-5"/> : <User className="size-5"/>}
                        </div>

                        {/* Bubble */}
                        <div className={cn(
                            "max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm",
                            isBot
                                ? "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none"
                                : "bg-[#36caf1] text-white rounded-br-none"
                        )}>
                            {isBot ? (
                                <div className="max-w-none break-words text-[13px] leading-relaxed">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                            ul: ({node, ...props}) => <ul
                                                className="list-disc pl-5 mb-2 space-y-1 marker:opacity-50" {...props} />,
                                            ol: ({node, ...props}) => <ol
                                                className="list-decimal pl-5 mb-2 space-y-1 marker:opacity-50" {...props} />,
                                            li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                            strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                            a: ({node, ...props}) => <a
                                                className="underline opacity-80 hover:opacity-100" {...props} />,
                                            h1: ({node, ...props}) => <h1
                                                className="text-base font-bold mt-3 mb-1" {...props} />,
                                            h2: ({node, ...props}) => <h2
                                                className="text-sm font-bold mt-3 mb-1" {...props} />,
                                            h3: ({node, ...props}) => <h3
                                                className="text-[13px] font-bold mt-2 mb-1" {...props} />,
                                        }}
                                    >
                                        {message.content}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                            )}
                            <span className={cn(
                                "text-[10px] mt-1 block opacity-60",
                                isBot ? "text-slate-500" : "text-white"
                            )}>
                {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
              </span>
                        </div>
                    </div>
                );
            })}
            {isTyping && (
                <div className="flex gap-2 p-3 w-max bg-slate-100 rounded-2xl text-sm text-slate-500">
                    AI đang phân tích...
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
    );
}
