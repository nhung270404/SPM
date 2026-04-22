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

  const handleSendMessage = (content: string) => {
    // Thêm tin nhắn của người dùng
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Giả lập phản hồi của bot sau 1 giây
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: `Cảm ơn bạn đã hỏi về "${content}". Đây là phản hồi tự động từ hệ thống. Chúng tôi sẽ kết nối bạn với hỗ trợ viên nếu cần thiết.`,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
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
