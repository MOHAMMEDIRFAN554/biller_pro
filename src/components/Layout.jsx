import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, FileText, Package, Warehouse, BarChart3, Users, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLogoutMutation } from '../redux/api/usersApiSlice';
import { logout } from '../redux/slices/authSlice';
import { Outlet, useNavigate } from 'react-router-dom';

const SidebarItem = ({ to, icon, label, active, collapsed }) => (
    <Link
        to={to}
        className={`nav-link d-flex align-items-center gap-3 px-4 py-3 rounded mb-1 transition-all ${active
            ? 'active bg-primary text-white shadow-sm'
            : 'text-secondary bg-transparent hover-bg-light'
            }`}
    >
        <i className={`bi bi-${icon} fs-5`}></i>
        {!collapsed && <span className="fw-medium">{label}</span>}
    </Link>
);

const Layout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useLogoutMutation();
    const { userInfo } = useSelector((state) => state.auth);

    const handleLogout = async () => {
        try {
            await logoutApiCall().unwrap();
            dispatch(logout());
            navigate('/login');
        } catch (err) {
            console.error(err);
        }
    };

    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: 'speedometer2' },
        { to: '/pos', label: 'Point of Sale', icon: 'cart-fill' },
        { to: '/billing', label: 'Billing', icon: 'file-earmark-text' },
        { to: '/inventory', label: 'Inventory', icon: 'box-seam' },
        { to: '/warehouse', label: 'Warehouse', icon: 'house' },
        { to: '/reports', label: 'Reports', icon: 'graph-up' },
        { to: '/customers', label: 'Customers', icon: 'people' },
        { to: '/settings', label: 'Settings', icon: 'gear' },
    ];

    return (
        <div className="d-flex vw-100 vh-100 bg-light text-dark overflow-hidden">
            {/* Sidebar */}
            <aside
                className={`bg-white border-end d-flex flex-column h-100 shadow-sm transition-all`}
                style={{
                    width: collapsed ? '80px' : '280px',
                    minWidth: collapsed ? '80px' : '280px',
                    transition: 'width 0.3s ease'
                }}
            >
                <div className="p-4 border-bottom d-flex align-items-center justify-content-between" style={{ height: '72px' }}>
                    {!collapsed && (
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-primary p-1 d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '32px', height: '32px' }}>B</div>
                            <span className="fw-bold fs-5 text-dark">Biller Pro</span>
                        </div>
                    )}
                    {collapsed && (
                        <div className="rounded bg-primary d-flex align-items-center justify-content-center fw-bold text-white mx-auto" style={{ width: '32px', height: '32px' }}>B</div>
                    )}
                </div>

                <div className="flex-grow-1 overflow-y-auto py-4 px-2">
                    {navItems.map((item) => (
                        <SidebarItem
                            key={item.to}
                            to={item.to}
                            icon={item.icon}
                            label={item.label}
                            active={location.pathname === item.to}
                            collapsed={collapsed}
                        />
                    ))}
                </div>

                <div className="p-3 border-top bg-white">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="btn btn-light w-100 d-flex align-items-center gap-3 px-3 py-2 mb-2 text-secondary border-0"
                    >
                        {collapsed ? <i className="bi bi-layout-sidebar-inset fs-5 mx-auto"></i> : <><i className="bi bi-layout-sidebar fs-5"></i> <span className="small fw-medium">Collapse</span></>}
                    </button>

                    <button
                        onClick={handleLogout}
                        className="btn btn-outline-danger w-100 d-flex align-items-center gap-3 px-3 py-2 border-0"
                    >
                        <i className={`bi bi-box-arrow-right fs-5 ${collapsed ? "mx-auto" : ""}`}></i>
                        {!collapsed && <span className="small fw-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="d-flex flex-column flex-grow-1 overflow-hidden h-100">
                {/* Header */}
                <header className="navbar navbar-expand bg-white border-bottom px-4 py-2 shadow-sm sticky-top" style={{ height: '72px', zIndex: 1020 }}>
                    <div className="container-fluid p-0">
                        <h2 className="navbar-brand mb-0 h4 fw-bold text-capitalize text-muted">
                            {location.pathname.split('/')[1] || 'Dashboard'}
                        </h2>
                        <div className="ms-auto d-flex align-items-center gap-3">
                            <div className="text-end d-none d-sm-block">
                                <p className="mb-0 small fw-bold text-dark">{userInfo?.name}</p>
                                <p className="mb-0 xsmall text-muted text-capitalize">{userInfo?.role}</p>
                            </div>
                            <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold border border-primary border-opacity-25" style={{ width: '40px', height: '40px' }}>
                                {userInfo?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-grow-1 overflow-auto bg-light p-4">
                    <div className="container-fluid p-0">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
