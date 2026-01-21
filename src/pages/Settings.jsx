import { useState, useEffect } from 'react';
import { useGetUsersQuery, useCreateUserMutation, useDeleteUserMutation } from '../redux/api/usersApiSlice';
import {
    useGetAuditLogsQuery,
    useGetSequencesQuery,
    useUpdatePrefixMutation,
    useGetCompanyProfileQuery,
    useUpdateCompanyProfileMutation
} from '../redux/api/settingsApiSlice';
import { useSelector } from 'react-redux';

const Settings = () => {
    const { userInfo } = useSelector(state => state.auth);
    const [activeTab, setActiveTab] = useState('profile');

    // Profile State
    const [profileForm, setProfileForm] = useState({
        email: '',
        website: '',
        upiId: '',
        upiName: '',
        enableQrPayments: false
    });

    // User Management
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'employee' });

    // Queries
    const { data: profile, isLoading: profileLoading } = useGetCompanyProfileQuery();
    const { data: users, isLoading: usersLoading } = useGetUsersQuery(undefined, { skip: userInfo.role !== 'admin' || activeTab !== 'users' });
    const { data: logs, isLoading: logsLoading } = useGetAuditLogsQuery(undefined, { skip: userInfo.role !== 'admin' || activeTab !== 'logs' });
    const { data: sequences, isLoading: seqLoading } = useGetSequencesQuery(undefined, { skip: userInfo.role !== 'admin' || activeTab !== 'numbering' });

    // Mutations
    const [updateProfile] = useUpdateCompanyProfileMutation();
    const [createUser] = useCreateUserMutation();
    const [deleteUser] = useDeleteUserMutation();
    const [updatePrefix] = useUpdatePrefixMutation();
    const [prefixForm, setPrefixForm] = useState({ BILL: 'INV-', PURCHASE: 'PUR-' });

    useEffect(() => {
        if (profile) {
            setProfileForm({
                email: profile.email || '',
                website: profile.website || '',
                upiId: profile.upiId || '',
                upiName: profile.upiName || '',
                enableQrPayments: profile.enableQrPayments || false
            });
        }
    }, [profile]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(profileForm).unwrap();
            alert('Profile Updated Successfully');
        } catch (err) {
            alert(err?.data?.message || 'Failed to update profile');
        }
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            await createUser(userForm).unwrap();
            setIsUserModalOpen(false);
            setUserForm({ name: '', email: '', password: '', role: 'employee' });
        } catch (err) {
            alert(err?.data?.message || 'Failed');
        }
    };

    const handleDeleteUser = async (id) => {
        if (window.confirm('Delete this user?')) try { await deleteUser(id).unwrap(); } catch (err) { alert(err?.data?.message); }
    }

    const handleUpdatePrefix = async (type) => {
        try {
            await updatePrefix({ type, prefix: prefixForm[type] }).unwrap();
            alert('Prefix Updated');
        } catch (err) {
            console.error(err);
        }
    }

    return (
        <div className="animate-fade-in container-fluid">
            <div className="row mb-4">
                <div className="col-12">
                    <h1 className="h3 fw-bold text-dark mb-1">System Settings</h1>
                    <p className="text-muted small">Configure your business profile, team, and system preferences</p>
                </div>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden mb-4">
                <div className="card-header bg-white border-0 p-0">
                    <ul className="nav nav-tabs nav-fill border-0">
                        <li className="nav-item">
                            <button
                                className={`nav-link border-0 rounded-0 py-3 fw-bold small ${activeTab === 'profile' ? 'active text-primary border-bottom' : 'text-muted'}`}
                                onClick={() => setActiveTab('profile')}
                            >
                                <i className="bi bi-shop me-2"></i> Company Profile
                            </button>
                        </li>
                        {userInfo.role === 'admin' && (
                            <>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 rounded-0 py-3 fw-bold small ${activeTab === 'users' ? 'active text-primary border-bottom' : 'text-muted'}`}
                                        onClick={() => setActiveTab('users')}
                                    >
                                        <i className="bi bi-people me-2"></i> User Management
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 rounded-0 py-3 fw-bold small ${activeTab === 'numbering' ? 'active text-primary border-bottom' : 'text-muted'}`}
                                        onClick={() => setActiveTab('numbering')}
                                    >
                                        <i className="bi bi-hash me-2"></i> Document Series
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 rounded-0 py-3 fw-bold small ${activeTab === 'upi' ? 'active text-primary border-bottom' : 'text-muted'}`}
                                        onClick={() => setActiveTab('upi')}
                                    >
                                        <i className="bi bi-qr-code me-2"></i> UPI Settings
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button
                                        className={`nav-link border-0 rounded-0 py-3 fw-bold small ${activeTab === 'logs' ? 'active text-primary border-bottom' : 'text-muted'}`}
                                        onClick={() => setActiveTab('logs')}
                                    >
                                        <i className="bi bi-activity me-2"></i> Audit Logs
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
                <div className="card-body p-4">
                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="row">
                            <div className="col-12 col-md-7">
                                <h5 className="fw-bold text-dark mb-4">Business Identity</h5>
                                {profileLoading ? (
                                    <div className="text-center py-5">
                                        <div className="spinner-border text-primary"></div>
                                    </div>
                                ) : (
                                    <form className="row g-3" onSubmit={handleUpdateProfile}>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">Shop/Business Name</label>
                                            <input
                                                className="form-control"
                                                value={profileForm.name}
                                                onChange={e => setProfileForm({ ...profileForm, name: e.target.value.toUpperCase() })}
                                                required
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Contact Number</label>
                                            <input
                                                className="form-control"
                                                placeholder="+91 00000 00000"
                                                value={profileForm.phone}
                                                onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label small fw-bold text-muted">Official Email</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                placeholder="contact@business.com"
                                                value={profileForm.email}
                                                onChange={e => setProfileForm({ ...profileForm, email: e.target.value.toLowerCase() })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">Business Address</label>
                                            <textarea
                                                className="form-control"
                                                rows="3"
                                                value={profileForm.address}
                                                onChange={e => setProfileForm({ ...profileForm, address: e.target.value.toUpperCase() })}
                                            />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label small fw-bold text-muted">Website (Optional)</label>
                                            <input
                                                className="form-control"
                                                placeholder="https://www.yourshop.com"
                                                value={profileForm.website}
                                                onChange={e => setProfileForm({ ...profileForm, website: e.target.value })}
                                            />
                                        </div>
                                        <div className="col-12 mt-4">
                                            <button
                                                type="submit"
                                                className="btn btn-primary px-4 shadow"
                                                disabled={userInfo.role !== 'admin'}
                                            >
                                                Save Profile Details
                                            </button>
                                            {userInfo.role !== 'admin' && (
                                                <p className="small text-danger mt-2">Only administrators can modify company profile.</p>
                                            )}
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    {/* UPI TAB */}
                    {activeTab === 'upi' && userInfo.role === 'admin' && (
                        <div className="row">
                            <div className="col-12 col-md-7">
                                <h5 className="fw-bold text-dark mb-4">UPI & QR Configuration</h5>
                                <form className="row g-3" onSubmit={handleUpdateProfile}>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">UPI ID for Payments</label>
                                        <input
                                            className="form-control"
                                            placeholder="example@upi"
                                            value={profileForm.upiId}
                                            onChange={e => setProfileForm({ ...profileForm, upiId: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small fw-bold text-muted">UPI Display Name</label>
                                        <input
                                            className="form-control"
                                            placeholder="Business Name"
                                            value={profileForm.upiName}
                                            onChange={e => setProfileForm({ ...profileForm, upiName: e.target.value })}
                                        />
                                    </div>
                                    <div className="col-12">
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="enableQr"
                                                checked={profileForm.enableQrPayments}
                                                onChange={e => setProfileForm({ ...profileForm, enableQrPayments: e.target.checked })}
                                            />
                                            <label className="form-check-label small fw-bold text-muted" htmlFor="enableQr">
                                                Enable Dynamic UPI QR Generation in POS
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-12 mt-4">
                                        <button
                                            type="submit"
                                            className="btn btn-primary px-4 shadow"
                                        >
                                            Save UPI Settings
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* USERS TAB */}
                    {activeTab === 'users' && userInfo.role === 'admin' && (
                        <div>
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold text-dark mb-0">Staff & Team Members</h5>
                                <button onClick={() => setIsUserModalOpen(true)} className="btn btn-sm btn-primary">
                                    <i className="bi bi-person-plus me-2"></i> Add New User
                                </button>
                            </div>
                            <div className="table-responsive rounded border">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr className="small text-uppercase text-muted">
                                            <th className="px-3 py-2">Member</th>
                                            <th className="py-2">Email Identity</th>
                                            <th className="py-2">Access Level</th>
                                            <th className="px-3 py-2 text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        {usersLoading ? (
                                            <tr><td colSpan="4" className="text-center py-4">Loading system users...</td></tr>
                                        ) : users?.map(user => (
                                            <tr key={user._id}>
                                                <td className="px-3 py-3 fw-bold">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
                                                            {user.role === 'admin' ? <i className="bi bi-shield-check text-primary"></i> : <i className="bi bi-person"></i>}
                                                        </div>
                                                        {user.name}
                                                    </div>
                                                </td>
                                                <td className="py-3 text-muted">{user.email}</td>
                                                <td className="py-3">
                                                    <span className={`badge rounded-pill ${user.role === 'admin' ? 'bg-primary text-white' : 'bg-light text-dark border'}`}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-3 text-end">
                                                    {user._id !== userInfo._id && (
                                                        <button onClick={() => handleDeleteUser(user._id)} className="btn btn-sm btn-outline-danger border-0">
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* NUMBERING TAB */}
                    {activeTab === 'numbering' && userInfo.role === 'admin' && (
                        <div className="row">
                            <div className="col-12 col-md-6">
                                <h5 className="fw-bold text-dark mb-2">Document Sequencing</h5>
                                <p className="text-muted small mb-4">Define prefixes for sales and purchase records.</p>
                                <div className="d-grid gap-3">
                                    <div className="card border p-3">
                                        <label className="form-label small fw-bold text-muted">Sales Invoice Prefix</label>
                                        <div className="input-group">
                                            <input className="form-control"
                                                defaultValue={sequences?.find(s => s.type === 'BILL')?.prefix || 'INV-'}
                                                onChange={e => setPrefixForm({ ...prefixForm, BILL: e.target.value })}
                                            />
                                            <button onClick={() => handleUpdatePrefix('BILL')} className="btn btn-outline-primary">Update</button>
                                        </div>
                                    </div>
                                    <div className="card border p-3">
                                        <label className="form-label small fw-bold text-muted">Purchase Voucher Prefix</label>
                                        <div className="input-group">
                                            <input className="form-control"
                                                defaultValue={sequences?.find(s => s.type === 'PURCHASE')?.prefix || 'PUR-'}
                                                onChange={e => setPrefixForm({ ...prefixForm, PURCHASE: e.target.value })}
                                            />
                                            <button onClick={() => handleUpdatePrefix('PURCHASE')} className="btn btn-outline-primary">Update</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* LOGS TAB */}
                    {activeTab === 'logs' && userInfo.role === 'admin' && (
                        <div>
                            <h5 className="fw-bold text-dark mb-4">Security & Activity Audit</h5>
                            <div className="table-responsive rounded border overflow-auto" style={{ maxHeight: '500px' }}>
                                <table className="table table-sm table-hover align-middle mb-0">
                                    <thead className="table-light sticky-top">
                                        <tr className="xsmall text-uppercase text-muted">
                                            <th className="px-3 py-2">Timestamp</th>
                                            <th className="py-2">Performed By</th>
                                            <th className="py-2">System Action</th>
                                            <th className="px-3 py-2">Operation Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        {logsLoading ? (
                                            <tr><td colSpan="4" className="text-center py-5">Retrieving system logs...</td></tr>
                                        ) : logs?.map(log => (
                                            <tr key={log._id}>
                                                <td className="px-3 py-2 text-muted xsmall whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                                                <td className="py-2 fw-medium">
                                                    {log.user?.name}
                                                    <span className="xsmall text-muted d-block">{log.user?.role}</span>
                                                </td>
                                                <td className="py-2"><span className="text-primary fw-bold">{log.action}</span></td>
                                                <td className="px-3 py-2 text-muted truncate-2" title={log.details}>{log.details}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {isUserModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 px-4 pt-4">
                                <h5 className="modal-title fw-bold">Add Team Member</h5>
                                <button type="button" className="btn-close" onClick={() => setIsUserModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleCreateUser}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Full Name</label>
                                        <input required className="form-control" placeholder="Staff Name" value={userForm.name} onChange={e => setUserForm({ ...userForm, name: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Email Identity</label>
                                        <input required type="email" className="form-control" placeholder="staff@business.com" value={userForm.email} onChange={e => setUserForm({ ...userForm, email: e.target.value })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Login Password</label>
                                        <input required type="password" className="form-control" placeholder="Minimum 6 characters" value={userForm.password} onChange={e => setUserForm({ ...userForm, password: e.target.value })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted">Access Level</label>
                                        <select className="form-select" value={userForm.role} onChange={e => setUserForm({ ...userForm, role: e.target.value })}>
                                            <option value="employee">Employee (Standard Access)</option>
                                            <option value="admin">Admin (Full Access)</option>
                                        </select>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" onClick={() => setIsUserModalOpen(false)} className="btn btn-light px-4">Cancel</button>
                                        <button type="submit" className="btn btn-primary px-4 shadow">Provision User</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
