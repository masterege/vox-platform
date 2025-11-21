import React, { useState } from 'react';
import { useUIStore } from '../store/uiStore';
import { useNavigate, Link } from 'react-router-dom';

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const login = useUIStore(state => state.login);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://192.168.1.148:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            if (res.ok) {
                const user = await res.json();
                login(user); // Save user to store
                navigate('/app'); // Redirect to app
            } else {
                // Handle backend error message
                const errText = await res.text();
                try {
                    const jsonErr = JSON.parse(errText);
                    setError(jsonErr.message || "Registration failed");
                } catch {
                    setError("Username or Email already taken.");
                }
            }
        } catch (err) {
            setError("Server unreachable");
        }
    };

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-main)' }}>
            <div style={{ width: 400, padding: 40, backgroundColor: 'var(--bg-panel)', borderRadius: 8, boxShadow: '0 10px 25px var(--shadow)' }}>
                <h1 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: 10 }}>Create an Account</h1>
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: 30, fontSize: '0.9rem' }}>Join the Vox platform today.</p>

                {error && <div style={{ color: '#f23f42', marginBottom: 20, textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>EMAIL</label>
                        <input className="vox-input" type="email" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>USERNAME</label>
                        <input className="vox-input" required value={username} onChange={e => setUsername(e.target.value)} />
                    </div>

                    <div style={{ marginBottom: 30 }}>
                        <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: 12, fontWeight: 'bold', marginBottom: 8 }}>PASSWORD</label>
                        <input className="vox-input" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                    </div>

                    <button className="vox-btn-primary" style={{ width: '100%' }}>Sign Up</button>
                </form>

                <div style={{ marginTop: 20, fontSize: 14, color: 'var(--text-secondary)', textAlign: 'center' }}>
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Log In</Link>
                </div>
            </div>
        </div>
    );
}