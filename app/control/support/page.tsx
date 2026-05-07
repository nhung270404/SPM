'use client';

import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '@/components/control/support/chat-header';
import { ChatMessages, Message } from '@/components/control/support/chat-messages';
import { ChatInput } from '@/components/control/support/chat-input';
import { Card } from '@/components/ui/card';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    content: 'Xin chào! Tôi là trợ lý ảo của Smart SPM. Tôi có thể giúp gì cho bạn hôm nay?',
    sender: 'bot',
    timestamp: new Date(),
  },
];

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          projectId: 'all',
        }),
      });

      const json = await res.json();

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content:
            json.reply ||
            json.message ||
            'Tôi chưa thể trả lời lúc này. Vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat fetch error:', error);

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Có lỗi khi kết nối AI chatbot.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-48px)] bg-white dark:bg-slate-950">
      <div className="flex-1 flex flex-col min-h-0 relative">
        <ChatHeader />
        <ChatMessages messages={messages} />
        <div ref={messagesEndRef} />
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
