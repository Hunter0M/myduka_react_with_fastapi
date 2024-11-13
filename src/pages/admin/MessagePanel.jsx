import { useState } from 'react';

export default function MessagePanel() {
  const [messages, setMessages] = useState([]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>
      <div className="grid gap-4">
        {messages.map((message) => (
          <div key={message.id} className="border rounded-lg p-4 shadow-sm">
            <p><strong>Name:</strong> {message.name}</p>
            <p><strong>Email:</strong> {message.email}</p>
            <p><strong>Message:</strong> {message.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 