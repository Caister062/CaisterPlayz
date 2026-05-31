import { useEffect, useState } from 'react';
import pb from '../pocketbase';

export default function LiveChat({ streamId, user }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    if (!streamId) return;

    const loadMessages = async () => {
      const result = await pb.collection('cplayz_live_chat').getList(1, 100, {
        filter: `streamId="${streamId}"`,
        sort: 'created'
      });

      setMessages(result.items);
    };

    loadMessages();

    pb.collection('cplayz_live_chat').subscribe('*', (e) => {
      if (e.record.streamId === streamId) {
        setMessages(prev => [...prev, e.record]);
      }
    });

    return () => {
      pb.collection('cplayz_live_chat').unsubscribe('*');
    };
  }, [streamId]);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await pb.collection('cplayz_live_chat').create({
      streamId,
      senderId: user.id,
      senderName: user.displayName,
      message: text
    });

    setText('');
  };

  return (
    <div>
      {messages.map(msg => (
        <div key={msg.id}>
          <strong>{msg.senderName}:</strong> {msg.message}
        </div>
      ))}

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Chat..."
      />

      <button onClick={sendMessage}>
        Send
      </button>
    </div>
  );
}
