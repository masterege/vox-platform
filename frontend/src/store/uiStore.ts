import { create } from 'zustand';

interface User { id: string; username: string; avatarUrl?: string; email?: string; aboutMe?: string; }

interface UIState {
    currentUser: User | null;
    isAuthenticated: boolean;
    theme: 'dark' | 'light';

    view: 'SERVER' | 'DM';
    activeSpaceId: string | null;
    activeChannelId: string | null;

    unreadChannels: Record<string, boolean>;
    unreadSpaces: Record<string, boolean>;
    unreadDMs: Record<string, boolean>;

    isFriendsOpen: boolean;
    isProfileOpen: boolean;
    isSettingsOpen: boolean;

    login: (user: User) => void;
    logout: () => void;
    setTheme: (theme: 'dark' | 'light') => void;

    openSpace: (spaceId: string) => void;
    openDM: (conversationId: string) => void;
    exitSpace: () => void;

    markChannelUnread: (channelId: string, spaceId: string) => void;
    markChannelRead: (channelId: string) => void;
    markDMUnread: (friendId: string) => void;
    markDMRead: (friendId: string) => void;

    toggleFriends: () => void;
    toggleProfile: () => void;
    toggleSettings: () => void;
}

export const useUIStore = create<UIState>((set) => ({
    currentUser: null,
    isAuthenticated: false,
    theme: 'dark',

    view: 'SERVER',
    activeSpaceId: null,
    activeChannelId: null,

    unreadChannels: {},
    unreadSpaces: {},
    unreadDMs: {},

    isFriendsOpen: false,
    isProfileOpen: false,
    isSettingsOpen: false,

    login: (user) => set({ currentUser: user, isAuthenticated: true, view: 'SERVER' }),
    logout: () => set({ currentUser: null, isAuthenticated: false, activeSpaceId: null, isSettingsOpen: false }),
    setTheme: (theme) => { document.documentElement.setAttribute('data-theme', theme); set({ theme }); },

    // FIXED: Removed unused 'state' parameter
    openSpace: (spaceId) => set(() => {
        return { view: 'SERVER', activeSpaceId: spaceId, activeChannelId: null };
    }),

    openDM: (conversationId) => set({ view: 'DM', activeSpaceId: null, activeChannelId: conversationId }),
    exitSpace: () => set({ view: 'DM', activeSpaceId: null, activeChannelId: null }),

    markChannelUnread: (channelId, spaceId) => set((state) => ({
        unreadChannels: { ...state.unreadChannels, [channelId]: true },
        unreadSpaces: { ...state.unreadSpaces, [spaceId]: true }
    })),

    markChannelRead: (channelId) => set((state) => {
        const newCh = { ...state.unreadChannels };
        delete newCh[channelId];
        return { unreadChannels: newCh };
    }),

    markDMUnread: (friendId) => set((state) => ({
        unreadDMs: { ...state.unreadDMs, [friendId]: true }
    })),

    markDMRead: (friendId) => set((state) => {
        const newDMs = { ...state.unreadDMs };
        delete newDMs[friendId];
        return { unreadDMs: newDMs };
    }),

    toggleFriends: () => set((state) => ({ isFriendsOpen: !state.isFriendsOpen })),
    toggleProfile: () => set((state) => ({ isProfileOpen: !state.isProfileOpen })),
    toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
}));