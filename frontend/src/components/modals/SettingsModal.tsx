import React, { useState } from 'react';
import { X, Monitor, Shield } from 'lucide-react';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    theme: 'dark' | 'light';
    setTheme: (t: 'dark' | 'light') => void;
    onChangePassword: (newPass: string) => void;
    // Removed onLogout from props here since we don't use it anymore
}

export const SettingsModal: React.FC<Props> = ({ isOpen, onClose, currentUser, theme, setTheme, onChangePassword }) => {
    const [activeTab, setActiveTab] = useState('account');
    const [newPass, setNewPass] = useState('');

    if (!isOpen) return null;

    return (
        <div className="settings-overlay">
            <div className="settings-sidebar" style={{ backgroundColor: 'var(--bg-sidebar)' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-secondary)', padding: '0 10px 5px' }}>USER SETTINGS</div>
                <div className={`settings-item ${activeTab === 'account' ? 'active' : ''}`} onClick={() => setActiveTab('account')}>
                    <Shield size={16} style={{ marginRight: 10 }} /> My Account
                </div>
                <div className={`settings-item ${activeTab === 'appearance' ? 'active' : ''}`} onClick={() => setActiveTab('appearance')}>
                    <Monitor size={16} style={{ marginRight: 10 }} /> Appearance
                </div>
                {/* LOGOUT BUTTON REMOVED FROM HERE */}
            </div>
            <div className="settings-content" style={{ backgroundColor: 'var(--bg-main)' }}>
                {activeTab === 'account' && (
                    <div>
                        <h2>My Account</h2>
                        <div className="profile-badges" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'var(--bg-panel)', padding: 20, borderRadius: 8 }}>
                            <img src={currentUser.avatarUrl} style={{ width: 80, height: 80, borderRadius: '50%' }} alt="avatar" />
                            <div>
                                <h3>{currentUser.username}</h3>
                                <p style={{ color: 'var(--text-secondary)' }}>{currentUser.email}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: 30 }}>
                            <h3>Password</h3>
                            <div style={{ marginTop: 20, background: 'var(--bg-panel)', padding: 20, borderRadius: 8 }}>
                                <label style={{ display: 'block', marginBottom: 5 }}>New Password</label>
                                <input className="vox-input" type="password" value={newPass} onChange={e => setNewPass(e.target.value)} />
                                <button className="vox-btn-primary" onClick={() => { onChangePassword(newPass); setNewPass(''); }} style={{ marginTop: 10 }}>Update Password</button>
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'appearance' && (
                    <div>
                        <h2>Appearance</h2>
                        <div style={{ marginTop: 20 }}>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <div onClick={() => setTheme('dark')} style={{ width: 100, height: 60, background: '#313338', border: theme === 'dark' ? '2px solid var(--accent)' : '1px solid gray', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>Dark</div>
                                <div onClick={() => setTheme('light')} style={{ width: 100, height: 60, background: '#f2f3f5', border: theme === 'light' ? '2px solid var(--accent)' : '1px solid gray', borderRadius: 8, color: 'black', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>Light</div>
                            </div>
                        </div>
                    </div>
                )}
                <div style={{ position: 'absolute', right: 40, top: 40, cursor: 'pointer' }} onClick={onClose}>
                    <div style={{ border: '1px solid var(--text-secondary)', borderRadius: '50%', padding: 5 }}>
                        <X size={24} color="var(--text-secondary)" />
                    </div>
                </div>
            </div>
        </div>
    );
};