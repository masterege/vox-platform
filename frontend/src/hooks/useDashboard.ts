import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../store/uiStore';

// Sub-Hooks
import { useSocketLogic } from './useSocketLogic';
import { useSpaceLogic } from './useSpaceLogic';
import { useFriendLogic } from './useFriendLogic';

// ⚠️ IP CONFIGURATION
const API_URL = 'http://192.168.1.148:8080/api';

export function useDashboard() {
    const store = useUIStore();
    const navigate = useNavigate();

    // --- GLOBAL STATE ---
    const [spaces, setSpaces] = useState<any[]>([]);
    const [channels, setChannels] = useState<any[]>([]);
    const [friends, setFriends] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [filterType, setFilterType] = useState('ALL');

    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, friend: any } | null>(null);
    const [profileTarget, setProfileTarget] = useState<any>(null);

    // --- REFS (For Socket Logic) ---
    const activeChannelIdRef = useRef(store.activeChannelId);
    const activeSpaceIdRef = useRef(store.activeSpaceId);
    const viewRef = useRef(store.view);
    const currentUserRef = useRef(store.currentUser);

    useEffect(() => { activeChannelIdRef.current = store.activeChannelId; }, [store.activeChannelId]);
    useEffect(() => { activeSpaceIdRef.current = store.activeSpaceId; }, [store.activeSpaceId]);
    useEffect(() => { viewRef.current = store.view; }, [store.view]);
    useEffect(() => { currentUserRef.current = store.currentUser; }, [store.currentUser]);

    // --- INITIALIZE HOOKS ---
    const socket = useSocketLogic(setMessages, setChannels, { activeChannelIdRef, activeSpaceIdRef, viewRef, currentUserRef });
    const spaceLogic = useSpaceLogic(setSpaces, setChannels, setMessages, socket);
    const friendLogic = useFriendLogic(setFriends, setMessages);

    // --- INIT ---
    useEffect(() => {
        if (!store.isAuthenticated) navigate('/login');
        else if (store.currentUser) initData();
    }, [store.isAuthenticated, filterType]);

    const initData = async () => {
        await friendLogic.fetchFriends();
        const loadedSpaces = await spaceLogic.fetchSpaces(filterType);
        if (loadedSpaces) socket.connect(loadedSpaces);
    };

    // --- VIEW SWITCHING ---
    useEffect(() => {
        if (store.view === 'SERVER' && store.activeSpaceId) {
            const found = spaces.find(s => s.id === store.activeSpaceId);
            if (found) spaceLogic.fetchChannels(store.activeSpaceId);
        } else if (store.view === 'DM' && store.activeChannelId) {
            friendLogic.loadDMHistory(store.activeChannelId);
        } else {
            setChannels([]);
            setMessages([]);
        }
    }, [store.view, store.activeSpaceId, store.activeChannelId]);

    // --- COMBINED HANDLERS ---
    const selectChannel = (cid: string) => {
        store.markChannelRead(cid);
        useUIStore.setState({ activeChannelId: cid });
        // Load history
        fetch(`${API_URL}/channels/${cid}/messages`).then(r => r.json()).then(d => setMessages(d));
    };

    const handleCreateSpace = () => {
        const name = prompt("Server Name:"); if (!name) return;
        const type = prompt("Type (GAMING, SOCIAL, PROFESSIONAL):", "GAMING");
        spaceLogic.createSpace(name, type?.toUpperCase() || 'GAMING');
    };

    const handleCreateChannel = () => {
        const name = prompt("Channel Name:"); if (!name) return;
        const typeInput = prompt("Type 'voice' or 'text':", "text");
        const type = (typeInput?.toLowerCase() === 'voice') ? 'VOICE' : 'TEXT';
        spaceLogic.createChannel(name, type);
    };

    const handleJoinSpace = () => {
        let spaceId = prompt("Invite Code:"); if (!spaceId) return;
        spaceLogic.joinSpace(spaceId.trim(), filterType);
    };

    const handleAddFriend = () => {
        const u = prompt("Username:"); if (u) friendLogic.addFriend(u);
    };

    const sendMessage = (att: string | null = null) => {
        socket.sendMessage(inputValue, att);
        setInputValue("");
    };

    const handleInvite = () => {
        if (store.activeSpaceId) {
            const c = store.activeSpaceId;
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(c).then(() => alert("Copied")).catch(() => prompt("Copy:", c)); else prompt("Copy:", c);
        }
    };
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const fd = new FormData(); fd.append("file", e.target.files[0]);
        const res = await fetch(`${API_URL}/files/upload`, { method: 'POST', body: fd });
        const d = await res.json();
        socket.sendMessage("", d.url);
    };
    const handleDeleteSpace = (e: any, id: string) => { e.stopPropagation(); spaceLogic.deleteSpace(id, filterType); };
    const handleDeleteChannel = (e: any, id: string) => { e.stopPropagation(); spaceLogic.deleteChannel(id); };

    // --- FRIEND CONTEXT MENU HANDLERS ---
    const handleRightClickFriend = (e: React.MouseEvent, f: any) => { e.preventDefault(); setContextMenu({ x: e.clientX, y: e.clientY, friend: f }); };

    const handleRemoveFriend = () => {
        if (contextMenu) {
            friendLogic.removeFriend(contextMenu.friend.friendId);
            setContextMenu(null);
        }
    };

    // <--- THIS IS THE MISSING HANDLER --->
    const handleToggleFavorite = () => {
        if (contextMenu) {
            friendLogic.toggleFavorite(contextMenu.friend.friendId);
            setContextMenu(null);
        }
    };

    const handleMuteFriend = () => { alert("Muted"); setContextMenu(null); };

    const handleViewFriendProfile = () => {
        if (contextMenu) {
            setProfileTarget(contextMenu.friend.friendProfile);
            store.toggleProfile();
            setContextMenu(null);
        }
    };

    const handleViewMyProfile = () => { setProfileTarget(store.currentUser); store.toggleProfile(); };
    const handleChangePassword = async (np: string) => { if (!np) return; await fetch(`${API_URL}/auth/change-password`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: store.currentUser?.id, newPassword: np }) }); alert("Updated"); };
    const handleLogout = () => { store.logout(); navigate('/login'); };

    return {
        spaces, channels, friends, messages, inputValue, setInputValue, filterType, setFilterType,
        contextMenu, profileTarget,
        handleCreateSpace, handleJoinSpace, handleCreateChannel, handleDeleteSpace, handleDeleteChannel,
        handleAddFriend, handleStartDM: friendLogic.startDM, handleRemoveFriend, handleMuteFriend, handleViewFriendProfile,
        handleToggleFavorite, // <--- EXPORTED HERE
        handleViewMyProfile, handleInvite, handleFileUpload, handleChangePassword, handleLogout,
        sendMessage, selectChannel, handleRightClickFriend
    };
}