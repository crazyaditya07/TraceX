import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import { ethers } from 'ethers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ROLES = {
    MANUFACTURER: ethers.keccak256(ethers.toUtf8Bytes("MANUFACTURER_ROLE")),
    DISTRIBUTOR: ethers.keccak256(ethers.toUtf8Bytes("DISTRIBUTOR_ROLE")),
    RETAILER: ethers.keccak256(ethers.toUtf8Bytes("RETAILER_ROLE")),
    ADMIN: ethers.keccak256(ethers.toUtf8Bytes("ADMIN_ROLE"))
};

const ROLE_OPTIONS = [
    { value: 'MANUFACTURER', label: 'Manufacturer' },
    { value: 'DISTRIBUTOR', label: 'Distributor' },
    { value: 'RETAILER', label: 'Retailer' },
    { value: 'ADMIN', label: 'Admin' }
];

function ManageUsers() {
    const { contracts, isConnected } = useWeb3();
    const { isAuthenticated } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [registrationMode, setRegistrationMode] = useState('database'); // 'database' or 'blockchain'
    const [newUser, setNewUser] = useState({
        walletAddress: '',
        email: '',
        password: '',
        name: '',
        company: '',
        location: '',
        roles: ['MANUFACTURER']
    });

    useEffect(() => { fetchUsers(); }, []);

    // Automatically determine registration mode based on wallet connection
    useEffect(() => {
        if (isConnected && contracts.supplyChainNFT && contracts.accessManager) {
            setRegistrationMode('blockchain');
        } else {
            setRegistrationMode('database');
        }
    }, [isConnected, contracts]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/api/users`);
            if (response.ok) setUsers(await response.json());
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (newUser.roles.length === 0) {
            alert('Please select at least one role');
            return;
        }

        try {
            setProcessing(true);

            if (registrationMode === 'blockchain' && contracts.supplyChainNFT && contracts.accessManager) {
                // Blockchain registration requires wallet address
                if (!newUser.walletAddress) {
                    alert('Wallet address is required for blockchain registration');
                    return;
                }

                // Assign all selected roles in SupplyChainNFT
                for (const role of newUser.roles) {
                    const tx1 = await contracts.supplyChainNFT.assignRole(ROLES[role], newUser.walletAddress);
                    await tx1.wait();
                }

                // Register in AccessManager (use first role for registration)
                const tx2 = await contracts.accessManager.registerParticipant(
                    newUser.walletAddress, newUser.name, newUser.location, ROLES[newUser.roles[0]]
                );
                await tx2.wait();

                // Also save to database
                await fetch(`${API_URL}/api/users`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        walletAddress: newUser.walletAddress.toLowerCase(),
                        name: newUser.name,
                        email: newUser.email || undefined,
                        company: newUser.company,
                        roles: newUser.roles,
                        role: newUser.roles[0],
                        location: { address: newUser.location },
                        isVerified: true
                    })
                });

                alert('User registered on blockchain and database!');
            } else {
                // Database-only registration (email/password based)
                if (!newUser.email || !newUser.password) {
                    alert('Email and password are required for database registration');
                    return;
                }

                const response = await fetch(`${API_URL}/api/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newUser.name,
                        email: newUser.email,
                        password: newUser.password,
                        company: newUser.company,
                        role: newUser.roles[0],
                        roles: newUser.roles,
                        location: newUser.location
                    })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Registration failed');
                }

                alert('User registered successfully!');
            }

            setShowModal(false);
            setNewUser({ walletAddress: '', email: '', password: '', name: '', company: '', location: '', roles: ['MANUFACTURER'] });
            fetchUsers();
        } catch (err) {
            alert('Failed: ' + err.message);
        } finally {
            setProcessing(false);
        }
    };

    const getRoleBadgeClass = (role) => `role-badge ${role?.toLowerCase() || 'consumer'}`;

    const renderUserRoles = (roles) => {
        if (!roles) return <span className={getRoleBadgeClass('CONSUMER')}>CONSUMER</span>;
        const roleArray = Array.isArray(roles) ? roles : roles.split(',');
        return roleArray.map(role => (
            <span key={role.trim()} className={getRoleBadgeClass(role.trim())}>
                {role.trim()}
            </span>
        ));
    };

    if (loading) {
        return <div className="flex items-center justify-center" style={{ minHeight: '60vh' }}><div className="loading-spinner"></div></div>;
    }

    return (
        <div>
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 className="page-title">Manage Users</h1>
                    <p className="page-subtitle">Register and manage supply chain participants</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
            </div>

            {/* Status indicator */}
            <div className="card" style={{ marginBottom: 'var(--spacing-6)', padding: '12px 16px' }}>
                <p style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                    {isConnected && contracts.supplyChainNFT
                        ? '🔗 Connected to blockchain - Users can be registered on-chain'
                        : '📝 Database mode - Users will be registered in database only'
                    }
                </p>
            </div>

            <div className="card">
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email/Wallet</th>
                                <th>Company</th>
                                <th>Role</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.walletAddress || user.email || user._id}>
                                    <td>{user.name}</td>
                                    <td>
                                        {user.email && <span>{user.email}</span>}
                                        {user.walletAddress && (
                                            <code style={{ display: 'block', fontSize: 'var(--font-size-xs)', color: 'var(--text-tertiary)' }}>
                                                {user.walletAddress?.slice(0, 10)}...
                                            </code>
                                        )}
                                    </td>
                                    <td>{user.company || '-'}</td>
                                    <td>
                                        <div className="user-roles" style={{ gap: '4px' }}>
                                            {renderUserRoles(user.roles || user.role)}
                                        </div>
                                    </td>
                                    <td>{user.isVerified || user.isActive ? '✅ Active' : '⏳ Pending'}</td>
                                </tr>
                            ))}
                            {users.length === 0 && (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px' }}>
                                        No users found. Add a new user to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Register New User</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        <form onSubmit={handleRegister}>
                            <div className="modal-body">
                                {/* Registration mode toggle */}
                                <div className="form-group">
                                    <label className="form-label">Registration Type</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            type="button"
                                            className={`btn ${registrationMode === 'database' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setRegistrationMode('database')}
                                            style={{ flex: 1 }}
                                        >
                                            📝 Email/Password
                                        </button>
                                        <button
                                            type="button"
                                            className={`btn ${registrationMode === 'blockchain' ? 'btn-primary' : 'btn-secondary'}`}
                                            onClick={() => setRegistrationMode('blockchain')}
                                            disabled={!isConnected || !contracts.supplyChainNFT}
                                            style={{ flex: 1 }}
                                        >
                                            🔗 Blockchain
                                        </button>
                                    </div>
                                    {registrationMode === 'blockchain' && !contracts.supplyChainNFT && (
                                        <p style={{ color: 'var(--warning)', fontSize: 'var(--font-size-sm)', marginTop: '8px' }}>
                                            ⚠️ Connect wallet to enable blockchain registration
                                        </p>
                                    )}
                                </div>

                                {/* Conditional fields based on registration mode */}
                                {registrationMode === 'blockchain' ? (
                                    <div className="form-group">
                                        <label className="form-label">Wallet Address *</label>
                                        <input type="text" className="form-input" placeholder="0x..." value={newUser.walletAddress}
                                            onChange={e => setNewUser(p => ({ ...p, walletAddress: e.target.value }))} required />
                                    </div>
                                ) : (
                                    <>
                                        <div className="form-group">
                                            <label className="form-label">Email *</label>
                                            <input type="email" className="form-input" placeholder="user@company.com" value={newUser.email}
                                                onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} required />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Password *</label>
                                            <input type="password" className="form-input" placeholder="Min 6 characters" value={newUser.password}
                                                onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))} required minLength={6} />
                                        </div>
                                    </>
                                )}

                                <div className="form-group">
                                    <label className="form-label">Name *</label>
                                    <input type="text" className="form-input" value={newUser.name}
                                        onChange={e => setNewUser(p => ({ ...p, name: e.target.value }))} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Company</label>
                                    <input type="text" className="form-input" value={newUser.company}
                                        onChange={e => setNewUser(p => ({ ...p, company: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Location</label>
                                    <input type="text" className="form-input" value={newUser.location}
                                        onChange={e => setNewUser(p => ({ ...p, location: e.target.value }))} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Role(s) *</label>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                                        {ROLE_OPTIONS.map(option => (
                                            <label key={option.value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={newUser.roles.includes(option.value)}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            setNewUser(p => ({ ...p, roles: [...p.roles, option.value] }));
                                                        } else {
                                                            setNewUser(p => ({ ...p, roles: p.roles.filter(r => r !== option.value) }));
                                                        }
                                                    }}
                                                />
                                                <span>{option.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={processing}>
                                    {processing ? 'Registering...' : 'Register User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ManageUsers;
