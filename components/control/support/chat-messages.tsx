'use client';

import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatMessagesProps {
  messages: Message[];
}

export function ChatMessages({ messages }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
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
              {isBot ? <Bot className="size-5" /> : <User className="size-5" />}
            </div>

            {/* Bubble */}
            <div className={cn(
              "max-w-[80%] md:max-w-[70%] px-4 py-3 rounded-2xl text-sm",
              isBot 
                ? "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-bl-none" 
                : "bg-[#36caf1] text-white rounded-br-none"
            )}>
              <p className="leading-relaxed">{message.content}</p>
              <span className={cn(
                "text-[10px] mt-1 block opacity-60",
                isBot ? "text-slate-500" : "text-white"
              )}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
