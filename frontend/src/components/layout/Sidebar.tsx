import React from 'react';
import {
    Gamepad2, Briefcase, Coffee, Plus, Trash2,
    ArrowLeft, Mic, Hash, Settings, LogOut,
    UserPlus, Link
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';

interface Props {
    currentUser: any;
    spaces: any[];
    channels: any[];
    activeSpace: any | null;
    activeChannelId: string | null;
    filterType: string;

    setFilterType: (t: any) => void;
    openSpace: (id: string) => void;
    exitSpace: () => void;
    selectChannel: (id: string) => void;
    onCreateSpace: () => void;
    onDeleteSpace: (e: any, id: string) => void;
    onCreateChannel: () => void;
    onDeleteChannel: (e: any, id: string) => void;
    onToggleProfile: () => void;
    onToggleSettings: () => void;
    onLogout: () => void;
    onInvite: () => void;
    onJoinSpace: () => void;
}

export const Sidebar: React.FC<Props> = (props) => {
    // Get unread maps
    const unreadMap = useUIStore(state => state.unreadChannels);
    const unreadSpaces = useUIStore(state => state.unreadSpaces);

    return (
        <div className="sidebar">
            {/* 1. PROFILE HEADER */}
            <div className="profile-section" onClick={props.onToggleProfile} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <img src={props.currentUser.avatarUrl || "https://via.placeholder.com/150"} className="sidebar-avatar" alt="me" />
                    <div>
                        <div className="user-name" style={{ fontSize: '0.95rem' }}>{props.currentUser.username}</div>
                        <div className="user-status" style={{ fontSize: '0.75rem' }}>● Online</div>
                    </div>
                </div>
            </div>

            {/* 2. FILTERS (Only show when NO active space) */}
            {!props.activeSpace && (
                <div style={{ padding: '10px', display: 'flex', gap: '5px' }}>
                    {['ALL', 'GAMING', 'SOCIAL', 'PROFESSIONAL'].map(type => (
                        <button key={type} onClick={() => props.setFilterType(type as any)}
                            style={{
                                background: props.filterType === type ? 'var(--accent)' : 'var(--bg-panel)',
                                color: props.filterType === type ? 'white' : 'var(--text-secondary)',
                                border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer'
                            }}>
                            {type.substring(0, 3)}
                        </button>
                    ))}
                </div>
            )}

            <div className="nav-list">
                {!props.activeSpace ? (
                    /* MODE A: SERVER LIST */
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 12px', marginBottom: '10px', color: 'var(--text-secondary)', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem' }}>{props.filterType} SPACES</span>
                            <div style={{ display: 'flex', gap: 5 }}>
                                <div title="Join Server" onClick={props.onJoinSpace} style={{ cursor: 'pointer' }}><Link size={16} /></div>
                                <div title="Create Server" onClick={props.onCreateSpace} style={{ cursor: 'pointer' }}><Plus size={16} /></div>
                            </div>
                        </div>
                        {props.spaces.map(s => (
                            <div key={s.id} className="nav-item" onClick={() => props.openSpace(s.id)} style={{ position: 'relative' }}>

                                {/* UNREAD SERVER INDICATOR (Left Bar) */}
                                {unreadSpaces[s.id] && (
                                    <div style={{
                                        position: 'absolute', left: 0, top: '50%', marginTop: '-4px',
                                        width: '4px', height: '8px',
                                        backgroundColor: 'white', borderRadius: '0 4px 4px 0'
                                    }} />
                                )}

                                {s.type === 'GAMING' ? <Gamepad2 size={20} /> : s.type === 'PROFESSIONAL' ? <Briefcase size={20} /> : <Coffee size={20} />}
                                <span style={{ marginLeft: 10, flex: 1 }}>{s.name}</span>
                                <Trash2 size={14} className="delete-btn" onClick={(e) => props.onDeleteSpace(e, s.id)} style={{ opacity: 0.5 }} />
                            </div>
                        ))}
                    </>
                ) : (
                    /* MODE B: CHANNEL LIST (Inside a Server) */
                    <>
                        {/* SPLIT HEADER: BACK | INVITE */}
                        <div className="space-header" style={{ justifyContent: 'space-between', padding: 0, gap: 0, cursor: 'default' }}>

                            {/* Back Button */}
                            <div
                                className="header-btn"
                                onClick={props.exitSpace}
                                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '15px', flex: 1 }}
                                title="Back to Server List"
                            >
                                <ArrowLeft size={18} />
                                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                                    {props.activeSpace.name}
                                </span>
                            </div>

                            {/* Invite Button */}
                            <div
                                className="header-btn"
                                onClick={(e) => { e.stopPropagation(); props.onInvite(); }}
                                style={{
                                    padding: '15px', borderLeft: '1px solid var(--border)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: 'var(--accent)'
                                }}
                                title="Invite People"
                            >
                                <UserPlus size={20} />
                            </div>
                        </div>

                        {/* CHANNELS */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 12px', color: 'var(--text-secondary)', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem' }}>CHANNELS</span>
                            <Plus size={16} style={{ cursor: 'pointer' }} onClick={props.onCreateChannel} />
                        </div>

                        {props.channels.map(c => (
                            <div
                                key={c.id}
                                className={`nav-item ${props.activeChannelId === c.id ? 'active' : ''}`}
                                onClick={() => props.selectChannel(c.id)}
                                style={{
                                    justifyContent: 'space-between',
                                    fontWeight: unreadMap[c.id] ? 'bold' : 'normal',
                                    color: unreadMap[c.id] ? 'white' : 'inherit'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {c.type === 'VOICE' ? <Mic size={18} /> : <Hash size={18} />}
                                    <span style={{ marginLeft: 10 }}>{c.name}</span>
                                </div>

                                {/* UNREAD CHANNEL DOT (Right Dot) */}
                                {unreadMap[c.id] && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'white', marginRight: 8 }}></div>}

                                <Trash2 size={14} className="delete-btn" style={{ cursor: 'pointer', opacity: 0.3 }} onClick={(e) => props.onDeleteChannel(e, c.id)} />
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* 3. FOOTER */}
            <div style={{ padding: '15px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div title="Log Out" onClick={props.onLogout} style={{ cursor: 'pointer', color: '#f23f42' }}>
                    <LogOut size={20} />
                </div>
                <div title="Settings" onClick={props.onToggleSettings} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Settings size={20} />
                </div>
            </div>
        </div>
    );
};