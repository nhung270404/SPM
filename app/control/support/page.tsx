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
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Load lịch sử từ DATABASE khi vào trang
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/chat');
        const json = await res.json();
        if (json.success && json.data && json.data.length > 0) {
          // Chuyển string timestamp ngược lại thành Date object
          const formatted = json.data.map((m: any) => ({
            id: m._id,
            content: m.content,
            sender: m.sender,
            timestamp: new Date(m.timestamp)
          }));
          setMessages(formatted);
        } else {
          setMessages(INITIAL_MESSAGES);
        }
      } catch (e) {
        console.error("Lỗi khi load lịch sử chat từ DB:", e);
        setMessages(INITIAL_MESSAGES);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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
        id: json.data?._id || (Date.now() + 1).toString(),
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
      <ChatHeader />
      
      {/* Khu vực tin nhắn có thanh cuộn riêng */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <ChatMessages messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      {/* Thanh nhập liệu được GHIM CHẶT ở dưới cùng màn hình */}
      <div className="sticky bottom-0 border-t p-4 bg-white dark:bg-slate-950 z-10">
        <ChatInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
