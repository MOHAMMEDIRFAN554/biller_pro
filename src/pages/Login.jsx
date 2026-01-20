import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useLoginMutation } from '../redux/api/usersApiSlice';
import { setCredentials } from '../redux/slices/authSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [login, { isLoading }] = useLoginMutation();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        if (userInfo) {
            navigate('/dashboard');
        }
    }, [navigate, userInfo]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await login({ email, password }).unwrap();
            dispatch(setCredentials({ ...res }));
            navigate('/dashboard');
        } catch (err) {
            console.error('Failed to login:', err);
            alert(err?.data?.message || err.error);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light animate-fade-in px-3">
            <div className="card border-0 shadow-lg overflow-hidden" style={{ maxWidth: '420px', width: '100%', borderRadius: '1.5rem' }}>
                <div className="bg-primary p-4 text-center text-white">
                    <div className="rounded-circle bg-white bg-opacity-20 d-inline-flex align-items-center justify-content-center mb-3 text-white" style={{ width: '64px', height: '64px' }}>
                        <i className="bi bi-shield-lock-fill fs-2"></i>
                    </div>
                    <h3 className="fw-bold mb-1">Biller Pro</h3>
                    <p className="small mb-0 opacity-75">Secure Access to POS Dashboard</p>
                </div>
                <div className="card-body p-4 p-md-5 bg-white">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">Business Email</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0"><i className="bi bi-envelope text-muted"></i></span>
                                <input
                                    type="email"
                                    required
                                    className="form-control bg-light border-0 py-2 ms-0"
                                    style={{ textTransform: 'none' }}
                                    placeholder="name@business.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="form-label small fw-bold text-muted">Secret Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0"><i className="bi bi-key text-muted"></i></span>
                                <input
                                    type="password"
                                    required
                                    className="form-control bg-light border-0 py-2 ms-0"
                                    style={{ textTransform: 'none' }}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>
                        <button type="submit" className="btn btn-primary w-100 py-2 fw-bold shadow-sm mt-2" disabled={isLoading}>
                            {isLoading ? (
                                <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Signing In...</>
                            ) : 'Sign In Now'}
                        </button>
                    </form>
                    <div className="text-center mt-4">
                        <p className="xsmall text-muted mb-0">Developed for Advanced Retail Management</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
