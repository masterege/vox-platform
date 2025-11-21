import React, { useState } from 'react';

interface User { id: string; username: string; avatarUrl?: string; email?: string; aboutMe?: string; }

interface Props {
    currentUser: User;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<Props> = ({ currentUser, isOpen, onClose, onSave }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [form, setForm] = useState(currentUser);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(form);
        setIsEditing(false);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="profile-card" onClick={(e) => e.stopPropagation()}>
                <div className="profile-banner" style={{ height: 100, background: 'linear-gradient(90deg, var(--accent) 0%, #724cff 100%)' }}></div>
                <div className="profile-content" style={{ padding: 16, position: 'relative' }}>
                    <img
                        src={isEditing ? (form.avatarUrl || currentUser.avatarUrl) : currentUser.avatarUrl}
                        className="profile-avatar-large"
                        alt="avatar"
                        style={{ width: 90, height: 90, borderRadius: '50%', border: '6px solid var(--bg-panel)', position: 'absolute', top: -50, left: 20, objectFit: 'cover' }}
                    />

                    <div style={{ marginTop: '45px' }}>
                        {isEditing ? (
                            <>
                                <label style={{ fontSize: '0.7rem', color: 'gray' }}>USERNAME</label>
                                <input className="vox-input" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
                                <label style={{ fontSize: '0.7rem', color: 'gray' }}>AVATAR URL</label>
                                <input className="vox-input" value={form.avatarUrl} onChange={e => setForm({ ...form, avatarUrl: e.target.value })} />
                            </>
                        ) : (
                            <>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{currentUser.username}</h2>
                                <p style={{ margin: '5px 0', color: 'var(--text-secondary)' }}>{currentUser.email}</p>
                            </>
                        )}
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                        {isEditing ? (
                            <>
                                <button onClick={() => setIsEditing(false)} className="vox-btn-secondary">Cancel</button>
                                <button onClick={handleSave} className="vox-btn-primary">Save</button>
                            </>
                        ) : (
                            <button onClick={() => { setForm(currentUser); setIsEditing(true); }} className="vox-btn-primary">Edit Profile</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};