import { useRef } from 'react';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { decryptMessage, encryptMessage } from '../utils/crypto';
import { useUIStore } from '../store/uiStore';

// ⚠️ CHECK IP
const SOCKET_URL = 'http://192.168.1.148:8080/ws';
const NOTIFY_SOUND = "data:audio/mp3;base64,SUQzBAAAAAAAI1RTSVMAAAAPAAADTGF2ZjU4LjI5LjEwMAAAAAAAAAAAAAAA//OEAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAABIQAQCg0PEhUXGh0gIyYpKy0wMzY5PD9BSUpNT1FUV1pcX2FiZWZoa21wc3Z5fH6AhIeJi42PkJOVl5qbnZ+ipKWnqauusbO1t7m8vsHDxcjLzs/S1NXY2tzf4uPk5ujp6uzt7/Hz9vf5+/0AAAAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAAASAAAaAAw8J0AAAAAA//OEzAAACAgAAAAAAACAgAAAAAA//OEzAAACAgAAAAAAACAgAAAAAA//OEzAAACAgAAAAAAACAgAAAAAA//OEzAAACAgAAAAAAACAgAAAAAA";

interface SocketRefs {
    activeChannelIdRef: React.MutableRefObject<string | null>;
    viewRef: React.MutableRefObject<'SERVER' | 'DM'>;
    currentUserRef: React.MutableRefObject<any>;
    activeSpaceIdRef: React.MutableRefObject<string | null>; // Added this
}

export function useSocketLogic(
    setMessages: React.Dispatch<React.SetStateAction<any[]>>,
    setChannels: React.Dispatch<React.SetStateAction<any[]>>, // Added this to update channels
    refs: SocketRefs
) {
    const store = useUIStore();
    const stompClientRef = useRef<any>(null);
    const audioRef = useRef(new Audio(NOTIFY_SOUND));
    const subscriptionsRef = useRef<Set<string>>(new Set());

    const connect = (allSpaces: any[]) => {
        if (stompClientRef.current?.connected) {
            allSpaces.forEach(s => subscribeToSpace(s.id));
            return;
        }

        const socket = new SockJS(SOCKET_URL);
        const client = Stomp.over(socket);
        client.debug = () => { };

        client.connect({}, () => {
            // 1. Private Inbox
            if (store.currentUser?.id) {
                client.subscribe(`/topic/private/${store.currentUser.id}`, (msg: any) => {
                    handleIncomingDM(JSON.parse(msg.body));
                });
            }
            // 2. Server Events & Channels
            allSpaces.forEach(s => subscribeToSpace(s.id, client));
        });
        stompClientRef.current = client;
    };

    const subscribeToSpace = async (spaceId: string, clientOverride?: any) => {
        const client = clientOverride || stompClientRef.current;
        if (!client?.connected) return;

        // A. Subscribe to SPACE EVENTS (Create/Delete Channel)
        const spaceTopic = `/topic/space/${spaceId}`;
        if (!subscriptionsRef.current.has(spaceTopic)) {
            client.subscribe(spaceTopic, (msg: any) => {
                handleSpaceEvent(JSON.parse(msg.body), spaceId);
            });
            subscriptionsRef.current.add(spaceTopic);
        }

        // B. Subscribe to EXISTING CHANNELS
        try {
            const res = await fetch(`http://192.168.1.148:8080/api/spaces/${spaceId}/channels`);
            const data = await res.json();
            data.forEach((c: any) => subscribeToChannelTopic(c.id, c.spaceId, client));
        } catch (e) { console.error(e); }
    };

    const subscribeToChannelTopic = (channelId: string, spaceId: string, client: any) => {
        const topic = `/topic/channel/${channelId}`;
        if (!subscriptionsRef.current.has(topic)) {
            client.subscribe(topic, (msg: any) => {
                handleIncomingMessage(JSON.parse(msg.body), channelId, spaceId);
            });
            subscriptionsRef.current.add(topic);
        }
    };

    // --- HANDLERS ---

    const handleSpaceEvent = (event: any, spaceId: string) => {
        // Check if we are looking at this space
        const isViewingSpace = refs.viewRef.current === 'SERVER' && refs.activeSpaceIdRef.current === spaceId;

        if (event.type === 'CHANNEL_CREATED') {
            const newChannel = event.payload;
            // 1. Subscribe to it immediately
            subscribeToChannelTopic(newChannel.id, spaceId, stompClientRef.current);

            // 2. Update UI if looking at this space
            if (isViewingSpace) {
                setChannels(prev => {
                    if (prev.find(c => c.id === newChannel.id)) return prev; // Dedup
                    return [...prev, newChannel];
                });
            }
        }
        else if (event.type === 'CHANNEL_DELETED') {
            const deletedId = event.deletedId;
            if (isViewingSpace) {
                setChannels(prev => prev.filter(c => c.id !== deletedId));
            }
            // If we were looking at that channel, clear view
            if (refs.activeChannelIdRef.current === deletedId) {
                useUIStore.setState({ activeChannelId: null });
                setMessages([]);
            }
        }
    };

    const handleIncomingMessage = (msg: any, channelId: string, spaceId: string) => {
        const isViewing = refs.viewRef.current === 'SERVER' && refs.activeChannelIdRef.current === channelId;

        if (isViewing) {
            setMessages(prev => {
                // FIX: Double Message Deduplication
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, msg];
            });
        } else {
            store.markChannelUnread(channelId, spaceId);
            audioRef.current.play().catch(() => { });
        }
    };

    const handleIncomingDM = (msg: any) => {
        const decrypted = { ...msg, content: decryptMessage(msg.content) };
        const isViewing = refs.viewRef.current === 'DM' && refs.activeChannelIdRef.current === msg.conversationId;

        if (isViewing) {
            setMessages(prev => {
                // FIX: Double Message Deduplication
                if (prev.some(m => m.id === msg.id)) return prev;
                return [...prev, decrypted];
            });
        } else {
            if (msg.authorId !== refs.currentUserRef.current?.id) {
                store.markDMUnread(msg.authorId);
                audioRef.current.play().catch(() => { });
            }
        }
    };

    const sendMessage = (text: string, attachmentUrl: string | null) => {
        if ((!text.trim() && !attachmentUrl) || !store.activeChannelId || !store.currentUser) return;

        if (store.view === 'DM') {
            const encrypted = encryptMessage(text);
            stompClientRef.current.send(`/app/dm/${store.activeChannelId}`, {},
                JSON.stringify({ encryptedContent: encrypted, attachmentUrl, authorId: store.currentUser.id }));
        } else {
            stompClientRef.current.send(`/app/chat/${store.activeChannelId}`, {},
                JSON.stringify({ content: text, attachmentUrl, authorId: store.currentUser.id }));
        }
    };

    return { connect, subscribeToSpace, subscribeToChannelTopic, sendMessage, stompClientRef };
}