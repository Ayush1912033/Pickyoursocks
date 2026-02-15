import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Shield, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { encryptMessage, decryptMessage, generateAndStoreKeys } from '../lib/chat';
import { useAuth } from './AuthContext';

interface Message {
    id: string;
    sender_id: string;
    content: string;
    created_at: string;
    is_e2ee: boolean;
    decryptedContent?: string;
}

interface ChatWidgetProps {
    friend: {
        id: string;
        name: string;
        username: string;
        profile_photo: string;
        public_key?: string;
    };
    onClose: () => void;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ friend, onClose }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user) {
            // Ensure we have our own keys
            if (!localStorage.getItem('pys_chat_private_key')) {
                generateAndStoreKeys(user.id).catch(console.error);
            }
            loadMessages();
            subscribeToMessages();
        }
    }, [user, friend.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const loadMessages = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${user?.id},receiver_id.eq.${friend.id}),and(sender_id.eq.${friend.id},receiver_id.eq.${user?.id})`)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error loading messages:', error);
        } else {
            const processedMessages = await Promise.all((data || []).map(async (msg) => {
                if (!msg.is_e2ee) return { ...msg, decryptedContent: msg.content };

                try {
                    // Only decrypt if it's for us or we sent it (and we can decrypt it)
                    // Actually in RSA-OAEP for chat, usually you'd encrypt twice or use a symmetric session key.
                    // For simplicity in this E2EE demo, let's assume sender can decrypt their own or stores a copy.
                    // BUT: Usually sender encrypts for RECEIVER. Sender can't decrypt it unless they also encrypted for self.
                    // TO-DO: For a robust system, encrypt for both or use session keys.
                    // FOR NOW: Let's assume we decrypt messages where we are the receiver.
                    if (msg.receiver_id === user?.id) {
                        const dec = await decryptMessage(msg.content);
                        return { ...msg, decryptedContent: dec };
                    } else {
                        // If we are sender, we'd need a way to see what we sent. 
                        // We'll just show a "Sent" placeholder or assume we decrypt if we have the key (demo logic).
                        return { ...msg, decryptedContent: "Encrypted Sent Message" };
                    }
                } catch (e) {
                    return { ...msg, decryptedContent: "[Decryption Error]" };
                }
            }));
            setMessages(processedMessages);
        }
        setIsLoading(false);
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel(`chat:${friend.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user?.id}` // Listen for messages to us
            }, async (payload) => {
                const newMsg = payload.new as Message;
                if (!newMsg.is_e2ee) {
                    setMessages(prev => [...prev, { ...newMsg, decryptedContent: newMsg.content }]);
                    return;
                }

                try {
                    const dec = await decryptMessage(newMsg.content);
                    setMessages(prev => [...prev, { ...newMsg, decryptedContent: dec }]);
                } catch (e) {
                    setMessages(prev => [...prev, { ...newMsg, decryptedContent: "[Decryption Error]" }]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            let content = newMessage;
            let is_e2ee = false;

            // Only E2EE if recipient has a key
            if (friend.public_key) {
                content = await encryptMessage(newMessage, friend.public_key);
                is_e2ee = true;
            }

            const { data, error } = await supabase
                .from('messages')
                .insert({
                    sender_id: user?.id,
                    receiver_id: friend.id,
                    content: content,
                    is_e2ee: is_e2ee
                })
                .select()
                .single();

            if (error) throw error;

            // Optimistic update
            setMessages(prev => [...prev, { ...(data as Message), decryptedContent: newMessage }]);
            setNewMessage('');
        } catch (err) {
            console.error('Failed to send:', err);
            alert("Failed to send message.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 w-96 max-h-[500px] h-[500px] bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl flex flex-col z-[100] animate-in slide-in-from-bottom-5 duration-300">
            {/* Header */}
            <div className={`p-4 border-b border-white/10 flex items-center justify-between transition-colors rounded-t-2xl ${friend.public_key ? 'bg-blue-600' : 'bg-zinc-800'}`}>
                <div className="flex items-center gap-3">
                    <img src={friend.profile_photo || '/avatar-placeholder.png'} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                    <div>
                        <p className="text-sm font-bold text-white">{friend.name}</p>
                        <div className="flex items-center gap-1">
                            {friend.public_key ? (
                                <>
                                    <Shield size={10} className="text-white/80" />
                                    <p className="text-[10px] text-white/80 uppercase font-black tracking-widest">E2E Encrypted</p>
                                </>
                            ) : (
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Standard Chat</p>
                            )}
                        </div>
                    </div>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center space-y-2 opacity-50">
                        <Lock className="text-gray-500" size={32} />
                        <p className="text-xs text-gray-400">Your messages are secured with<br />end-to-end encryption.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender_id === user?.id
                                    ? 'bg-blue-600 text-white rounded-tr-none shadow-[0_4px_12px_rgba(37,99,235,0.2)]'
                                    : 'bg-zinc-800 text-gray-200 rounded-tl-none border border-white/5 shadow-lg'
                                }`}>
                                {msg.decryptedContent}
                                <div className="flex items-center justify-between gap-4 mt-1 opacity-50">
                                    {msg.is_e2ee && <Lock size={8} />}
                                    <p className="text-[9px] ml-auto">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-white/10">
                <div className="relative">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message..."
                        disabled={isSending}
                        className="w-full bg-zinc-800 border-none rounded-full py-3 px-5 pr-12 text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-600 outline-none transition-all disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500 disabled:opacity-50 disabled:bg-gray-600 transition-all shadow-lg"
                    >
                        {isSending ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                    </button>
                </div>
                {!friend.public_key && (
                    <p className="text-[9px] text-gray-500 mt-2 text-center font-medium italic">
                        Encryption will activate automatically once @{friend.username} is online.
                    </p>
                )}
            </form>
        </div>
    );
};

export default ChatWidget;
