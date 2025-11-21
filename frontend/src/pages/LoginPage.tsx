import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const login = useUIStore(state => state.login);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://192.168.1.148:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (res.ok) {
                const user = await res.json();
                login(user);
                navigate('/app');
            } else {
                setError("Invalid credentials.");
            }
        } catch (err) {
            setError("Server unreachable");
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ width: 400, padding: 40, backgroundColor: 'var(--bg-panel)', borderRadius: 8, boxShadow: '0 10px 25px var(--shadow)', position: 'relative', zIndex: 10 }}>
                <h1 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: 30 }}>Welcome Back!</h1>

                {error && <div style={{ color: '#f23f42', marginBottom: 20, textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>USERNAME</label>
                        <input className="vox-input" value={username} onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: 30 }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>PASSWORD</label>
                        <input className="vox-input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <button className="vox-btn-primary" style={{ width: '100%' }}>Log In</button>
                </form>

                {/* FORCE NAVIGATION BUTTON */}
                <div style={{ marginTop: 20, fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Need an account?
                    <span
                        onClick={() => navigate('/register')}
                        style={{ color: 'var(--accent)', fontWeight: 'bold', cursor: 'pointer', marginLeft: 5 }}
                    >
                        Register
                    </span>
                </div>

            </div>
        </div>
    );
}