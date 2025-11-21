import React from 'react';
import { decryptMessage } from '../utils/crypto';
import { useUIStore } from '../store/uiStore';

// ⚠️ IP CONFIGURATION
const API_URL = 'http://192.168.1.148:8080/api';

export function useFriendLogic(
    setFriends: React.Dispatch<React.SetStateAction<any[]>>,
    setMessages: React.Dispatch<React.SetStateAction<any[]>>
) {
    const store = useUIStore();

    const fetchFriends = async () => {
        if (!store.currentUser) return;
        const res = await fetch(`${API_URL}/friends/${store.currentUser.id}`);
        setFriends(await res.json());
    };

    const addFriend = async (username: string) => {
        if (!store.currentUser) return;
        const res = await fetch(`${API_URL}/friends/add`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: store.currentUser.id, username })
        });
        if (res.ok) fetchFriends(); else alert("User not found");
    };

    const removeFriend = async (friendId: string) => {
        if (!store.currentUser) return;
        await fetch(`${API_URL}/friends/remove`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: store.currentUser.id, friendId })
        });
        fetchFriends();
    };

    // --- TOGGLE FAVORITE ---
    const toggleFavorite = async (friendId: string) => {
        if (!store.currentUser) return;
        await fetch(`${API_URL}/friends/${friendId}/favorite?userId=${store.currentUser.id}`, {
            method: 'PUT'
        });
        fetchFriends(); // Refresh list to re-sort
    };

    const startDM = async (friendId: string) => {
        if (!store.currentUser) return;
        store.markDMRead(friendId);
        const res = await fetch(`${API_URL}/dm/start`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user1Id: store.currentUser.id, user2Id: friendId })
        });
        const conversation = await res.json();
        store.openDM(conversation.id);
    };

    const loadDMHistory = async (convId: string) => {
        const res = await fetch(`${API_URL}/dm/${convId}/messages`);
        const enc = await res.json();
        setMessages(enc.map((m: any) => ({ ...m, content: decryptMessage(m.content) })));
    };

    return { fetchFriends, addFriend, removeFriend, toggleFavorite, startDM, loadDMHistory };
}