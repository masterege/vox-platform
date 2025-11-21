import React, { useRef, useEffect } from 'react';
import { Users, Paperclip, Send } from 'lucide-react';

interface Props {
    activeSpace: any | null;
    activeChannelId: string | null;
    messages: any[];
    inputValue: string;
    setInputValue: (v: string) => void;
    onSendMessage: (att?: string | null) => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onToggleFriends: () => void;
    isFriendsOpen: boolean;
}

export const ChatArea: React.FC<Props> = (props) => {
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [props.messages]);

    return (
        <div className="chat-area">
            <div className="chat-messages" style={{ display: 'block', overflowY: 'auto' }}>
                {props.activeChannelId ? props.messages.map((msg, i) => (
                    <div key={i} style={{ marginBottom: 15, display: 'flex', gap: 10 }}>
                        <div style={{ width: 35, height: 35, borderRadius: '50%', background: '#5865F2' }}></div>
                        <div>
                            <div style={{ fontWeight: 600 }}>{msg.username}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
                            {msg.content && <div style={{ color: 'var(--text-primary)', marginTop: 2 }}>{msg.content}</div>}
                            {msg.attachmentUrl && <div style={{ marginTop: 5 }}><img src={msg.attachmentUrl} alt="att" style={{ maxWidth: '300px', borderRadius: '8px' }} /></div>}
                        </div>
                    </div>
                )) : <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Welcome to Vox</div>}
                <div ref={chatEndRef} />
            </div>

            <div className="input-container">
                <button className={`friends-toggle ${props.isFriendsOpen ? 'active' : ''}`} onClick={props.onToggleFriends}>
                    <Users size={20} />
                </button>
                <div className="message-box">
                    <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={props.onFileUpload} />
                    <Paperclip size={20} style={{ cursor: 'pointer', marginRight: 10, color: '#b5bac1' }} onClick={() => fileInputRef.current?.click()} />
                    <input
                        type="text"
                        className="message-input"
                        value={props.inputValue}
                        onChange={e => props.setInputValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && props.onSendMessage(null)}
                        placeholder={props.activeChannelId ? "Message..." : "Select a channel"}
                        disabled={!props.activeChannelId}
                    />
                    <Send size={20} onClick={() => props.onSendMessage(null)} style={{ cursor: 'pointer', color: props.activeChannelId ? 'var(--accent)' : 'gray' }} />
                </div>
            </div>
        </div>
    );
};