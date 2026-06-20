'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatHeader } from '@/components/control/support/chat-header';
import {
  ChatMessages,
  type Message,
} from '@/components/control/support/chat-messages';
import { ChatInput } from '@/components/control/support/chat-input';

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    content:
        'Xin chào! Tôi là trợ lý ảo của Smart SPM. Tôi có thể giúp gì cho bạn hôm nay?',
    sender: 'bot',
    timestamp: new Date(),
  },
];

type ChatSender = 'user' | 'bot';

type ChatHistoryItem = {
  _id?: string;
  content?: string;
  sender?: string;
  timestamp?: string | Date;
};

type ChatHistoryResponse = {
  success?: boolean;
  data?: ChatHistoryItem[];
};

type ChatSendResponse = {
  success?: boolean;
  reply?: string;
  message?: string;
  data?: {
    _id?: string;
  };
};
function isChatSender(value: unknown): value is ChatSender {
  return value === 'user' || value === 'bot';
}

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('/api/chat');
        const json = await res.json() as ChatHistoryResponse;

        if (json.success && json.data && json.data.length > 0) {
          const formatted: Message[] = json.data.map((item) => ({
            id: item._id || createMessageId(),
            content: item.content || '',
            sender: isChatSender(item.sender) ? item.sender : 'bot',
            timestamp: item.timestamp
                ? new Date(item.timestamp)
                : new Date(),
          }));

          setMessages(formatted);
        } else {
          setMessages(INITIAL_MESSAGES);
        }
      } catch (error: unknown) {
        console.error('Lỗi khi load lịch sử chat từ DB:', error);
        setMessages(INITIAL_MESSAGES);
      }
    };

    void fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages,isSending]);

  const handleSendMessage = async (content: string) => {
    if (isSending) return;

    const userMessage: Message = {
      id: createMessageId(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

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

      const json = await res.json() as ChatSendResponse;

      const botResponse: Message = {
        id: json.data?._id || createMessageId(),
        content:
            json.reply ||
            json.message ||
            'Tôi chưa thể phản hồi lúc này. Bạn vui lòng thử lại sau.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error: unknown) {
      console.error('Chat fetch error:', error);

      const botResponse: Message = {
        id: createMessageId(),
        content: 'Có lỗi khi kết nối SPM AI Copilot. Bạn vui lòng kiểm tra API hoặc thử lại sau.',
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } finally {
      setIsSending(false);
    }
  };

  return (
      <div className="flex h-[calc(100vh-48px)] flex-1 flex-col bg-slate-50 dark:bg-slate-950">
        <ChatHeader />

        <ChatMessages messages={messages} isTyping={isSending} />
        <div ref={messagesEndRef} />

        <ChatInput onSendMessage={handleSendMessage} disabled={isSending} />
      </div>
  );
}