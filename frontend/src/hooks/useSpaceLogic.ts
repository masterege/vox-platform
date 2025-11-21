import { useUIStore } from '../store/uiStore';

// ⚠️ YOUR IP
const API_URL = 'http://192.168.1.148:8080/api';

export function useSpaceLogic(
    setSpaces: React.Dispatch<React.SetStateAction<any[]>>,
    setChannels: React.Dispatch<React.SetStateAction<any[]>>,
    setMessages: React.Dispatch<React.SetStateAction<any[]>>,
    socket: any
) {
    const store = useUIStore();

    const fetchSpaces = async (filterType: string) => {
        if (!store.currentUser) return;
        let sUrl = `${API_URL}/spaces?userId=${store.currentUser.id}`;
        if (filterType !== 'ALL') sUrl += `&type=${filterType}`;

        const res = await fetch(sUrl);
        const data = await res.json();
        setSpaces(data);
        return data;
    };

    const fetchChannels = async (sid: string) => {
        const res = await fetch(`${API_URL}/spaces/${sid}/channels`);
        setChannels(await res.json());
    };

    const createSpace = async (name: string, type: string) => {
        if (!store.currentUser) return;
        const res = await fetch(`${API_URL}/spaces`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type, ownerId: store.currentUser.id })
        });
        if (res.ok) {
            const newSpace = await res.json();
            setSpaces(prev => [...prev, newSpace]);
            socket.subscribeToSpaceChannels(newSpace.id);
        }
    };

    const joinSpace = async (spaceId: string, filterType: string) => {
        if (!store.currentUser) return;
        try {
            const res = await fetch(`${API_URL}/spaces/${spaceId}/join`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: store.currentUser.id })
            });
            if (res.ok) {
                alert("Joined!");
                fetchSpaces(filterType);
                socket.subscribeToSpaceChannels(spaceId);
            } else alert(await res.text());
        } catch { alert("Invalid ID"); }
    };

    const createChannel = async (name: string, type: string) => {
        // 1. Send Request
        const res = await fetch(`${API_URL}/spaces/${store.activeSpaceId}/channels`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, type })
        });

        // 2. REMOVED: setChannels(...) 
        // We now wait for the WebSocket event to update the UI. 
        // This prevents the double-channel glitch.

        if (res.ok) {
            // We still subscribe immediately just in case the event was missed (safety net)
            // or to ensure we have the listener ready for messages in this new channel.
            const newChannel = await res.json();
            if (socket.stompClientRef.current?.connected) {
                socket.subscribeToChannelTopic(newChannel.id, newChannel.spaceId, socket.stompClientRef.current);
            }
        }
    };

    const deleteSpace = async (id: string, filterType: string) => {
        if (!confirm("Delete?")) return;
        await fetch(`${API_URL}/spaces/${id}`, { method: 'DELETE' });
        if (store.activeSpaceId === id) store.exitSpace();
        fetchSpaces(filterType);
    };

    const deleteChannel = async (id: string) => {
        if (!confirm("Delete?")) return;
        await fetch(`${API_URL}/spaces/channels/${id}`, { method: 'DELETE' });

        // REMOVED: setChannels(...)
        // The WebSocket 'CHANNEL_DELETED' event will handle the removal from the list.

        if (store.activeChannelId === id) {
            useUIStore.setState({ activeChannelId: null });
            setMessages([]);
        }
    };

    return { fetchSpaces, fetchChannels, createSpace, joinSpace, createChannel, deleteSpace, deleteChannel };
}