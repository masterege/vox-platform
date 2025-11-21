import React, { useState, useEffect, useRef } from 'react';
import { X, MessageSquare, User, UserMinus, VolumeX, Star } from 'lucide-react';
import { useUIStore } from './store/uiStore';
import { useDashboard } from './hooks/useDashboard';

// Components
import { Sidebar } from './components/layout/Sidebar';
import { ChatArea } from './components/layout/ChatArea';
import { ProfileModal } from './components/modals/ProfileModal';
import { SettingsModal } from './components/modals/SettingsModal';

function App() {
  const store = useUIStore();

  const {
    spaces, channels, friends, messages, inputValue, setInputValue, filterType, setFilterType,
    contextMenu, profileTarget,
    handleCreateSpace, handleJoinSpace, handleCreateChannel, handleDeleteSpace, handleDeleteChannel,
    handleAddFriend, handleStartDM, handleRemoveFriend, handleMuteFriend, handleViewFriendProfile,
    handleToggleFavorite,
    handleViewMyProfile, handleInvite, handleFileUpload, handleChangePassword, handleLogout,
    sendMessage, selectChannel, handleRightClickFriend
  } = useDashboard();

  if (!store.currentUser) return null;

  // Sort Friends
  const favorites = friends.filter(f => f.isFavorite);
  const others = friends.filter(f => !f.isFavorite);

  return (
    <div className="app-container">
      {/* LEFT SIDEBAR (Servers Only) */}
      <Sidebar
        currentUser={store.currentUser}
        spaces={spaces}
        channels={channels}
        activeSpace={store.activeSpaceId ? spaces.find(s => s.id === store.activeSpaceId) : null}
        activeChannelId={store.activeChannelId}
        filterType={filterType}
        // view={store.view}  <--- REMOVED THIS PROP (Fixes the error)
        setFilterType={setFilterType}
        openSpace={store.openSpace}
        exitSpace={store.exitSpace}
        selectChannel={selectChannel}
        onCreateSpace={handleCreateSpace}
        onDeleteSpace={handleDeleteSpace}
        onCreateChannel={handleCreateChannel}
        onDeleteChannel={handleDeleteChannel}
        onToggleProfile={handleViewMyProfile}
        onToggleSettings={store.toggleSettings}
        onLogout={handleLogout}
        onInvite={handleInvite}
        onJoinSpace={handleJoinSpace}
      />

      <ChatArea
        activeSpace={store.activeSpaceId}
        activeChannelId={store.activeChannelId}
        messages={messages}
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSendMessage={sendMessage}
        onFileUpload={handleFileUpload}
        onToggleFriends={store.toggleFriends}
        isFriendsOpen={store.isFriendsOpen}
      />

      {/* RIGHT SIDEBAR (Friends & Favorites) */}
      <div className={`friends-sidebar ${store.isFriendsOpen ? 'open' : ''}`}>
        <div className="friends-header"><span>Friends</span><X size={20} className="close-btn" onClick={store.toggleFriends} /></div>
        <div style={{ padding: 10 }}><button className="vox-btn-secondary" style={{ width: '100%', border: '1px dashed var(--border)' }} onClick={handleAddFriend}>+ Add Friend</button></div>

        <div className="nav-list">
          {/* FAVORITES CATEGORY */}
          {favorites.length > 0 && (
            <div style={{ padding: '10px 10px 5px', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>FAVORITES</div>
          )}
          {favorites.map(f => (
            <div key={f.id} className="nav-item"
              onClick={() => handleStartDM(f.friendId)}
              onContextMenu={(e) => handleRightClickFriend(e, f)}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginRight: 10 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.friendProfile?.username}</span>
              <Star size={12} fill="gold" color="gold" style={{ marginLeft: 5, opacity: 0.8 }} />
              {store.unreadDMs[f.friendId] && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f23f42', marginLeft: 8 }}></div>}
            </div>
          ))}

          {/* ALL FRIENDS CATEGORY */}
          <div style={{ padding: '15px 10px 5px', fontSize: '0.7rem', fontWeight: 'bold', color: 'var(--text-secondary)' }}>ALL FRIENDS</div>
          {others.map(f => (
            <div key={f.id} className="nav-item"
              onClick={() => handleStartDM(f.friendId)}
              onContextMenu={(e) => handleRightClickFriend(e, f)}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', marginRight: 10 }} />
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.friendProfile?.username}</span>
              <MessageSquare size={14} style={{ marginLeft: 'auto', opacity: 0.5 }} />
              {store.unreadDMs[f.friendId] && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#f23f42', marginLeft: 5 }}></div>}
            </div>
          ))}
        </div>
      </div>

      {/* CONTEXT MENU */}
      {contextMenu && (
        <div className="context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
          <div className="context-item" onClick={handleViewFriendProfile}>
            <User size={16} /> Profile
          </div>

          {/* Toggle Favorite Option */}
          <div className="context-item" onClick={handleToggleFavorite}>
            <Star size={16} /> {contextMenu.friend.isFavorite ? 'Unfavorite' : 'Favorite'}
          </div>

          <div className="context-item" onClick={handleMuteFriend}><VolumeX size={16} /> Mute</div>
          <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }}></div>
          <div className="context-item danger" onClick={handleRemoveFriend}><UserMinus size={16} /> Remove Friend</div>
        </div>
      )}

      <ProfileModal currentUser={profileTarget || store.currentUser} isOpen={store.isProfileOpen} onClose={store.toggleProfile} onSave={(u) => { if (profileTarget?.id === store.currentUser?.id) store.login(u); }} />
      <SettingsModal isOpen={store.isSettingsOpen} onClose={store.toggleSettings} currentUser={store.currentUser} theme={store.theme} setTheme={store.setTheme} onChangePassword={handleChangePassword} />
    </div>
  );
}

export default App;