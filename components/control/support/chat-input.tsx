'use client';

import { useState } from 'react';
import { SendHorizonal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shrink-0">
      <form onSubmit={handleSubmit} className="flex items-center gap-2 w-full">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập câu hỏi của bạn tại đây..."
          className="flex-1 bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-1 focus-visible:ring-[#36caf1] h-12 rounded-xl"
        />
        <Button 
          type="submit" 
          disabled={!input.trim()}
          className="bg-[#36caf1] hover:bg-[#36caf1]/90 text-white size-12 rounded-xl p-0 transition-all active:scale-95 shrink-0"
        >
          <SendHorizonal className="size-6" />
        </Button>
      </form>
    </div>
  );
}
