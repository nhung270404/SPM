"use client";

import React from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function ChatbotWidget({ projectId = "all" }: { projectId?: string }) {
    const [messages, setMessages] = React.useState([
        {
            role: "assistant",
            content: "Xin chào, tôi có thể phân tích tiến độ, task trễ và rủi ro dự án cho bạn.",
        },
    ]);

    const [input, setInput] = React.useState("");
    const [loading, setLoading] = React.useState(false);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMessage = input;

        setMessages((prev) => [
            ...prev,
            { role: "user", content: userMessage },
        ]);

        setInput("");
        setLoading(true);

        try {
            const res = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMessage,
                    projectId,
                }),
            });

            const json = await res.json();

            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: json.reply || "Tôi chưa thể trả lời lúc này.",
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    role: "assistant",
                    content: "Có lỗi khi gọi chatbot.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-[360px] bg-white border rounded-2xl shadow-xl overflow-hidden z-50">
            <div className="p-4 border-b font-bold">
                AI Project Assistant
            </div>

            <div className="h-[360px] overflow-y-auto p-4 space-y-3 text-sm">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={
                            msg.role === "user"
                                ? "ml-auto bg-cyan-600 text-white p-3 rounded-xl max-w-[80%]"
                                : "mr-auto bg-slate-100 text-slate-700 p-3 rounded-xl max-w-[80%]"
                        }
                    >
                        <div className="max-w-none break-words text-[13px] leading-relaxed">
                          <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                  p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                  ul: ({node, ...props}) => <ul className="list-disc pl-5 mb-2 space-y-1 marker:opacity-50" {...props} />,
                                  ol: ({node, ...props}) => <ol className="list-decimal pl-5 mb-2 space-y-1 marker:opacity-50" {...props} />,
                                  li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                  strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                                  a: ({node, ...props}) => <a className="underline opacity-80 hover:opacity-100" {...props} />,
                                  h1: ({node, ...props}) => <h1 className="text-base font-bold mt-3 mb-1" {...props} />,
                                  h2: ({node, ...props}) => <h2 className="text-sm font-bold mt-3 mb-1" {...props} />,
                                  h3: ({node, ...props}) => <h3 className="text-[13px] font-bold mt-2 mb-1" {...props} />,
                              }}
                          >
                              {msg.content}
                          </ReactMarkdown>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="text-xs text-slate-400">
                        AI đang suy nghĩ...
                    </div>
                )}
            </div>

            <div className="p-3 border-t flex gap-2">
                <input
                    className="flex-1 border rounded-xl px-3 py-2 text-sm"
                    placeholder="Hỏi AI..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") sendMessage();
                    }}
                />

                <button
                    onClick={sendMessage}
                    disabled={loading}
                    className="bg-cyan-600 text-white px-4 py-2 rounded-xl text-sm"
                >
                    Gửi
                </button>
            </div>
        </div>
    );
}