import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, FileText, Package, Warehouse, BarChart3, Users, Settings, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
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
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);
    const location = useLocation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [logoutApiCall] = useLogoutMutation();
    const { userInfo } = useSelector((state) => state.auth);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth >= 768) {
                setShowMobileSidebar(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Close mobile sidebar on route change
    useEffect(() => {
        if (isMobile) {
            setShowMobileSidebar(false);
        }
    }, [location, isMobile]);

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

    const sidebarWidth = isMobile ? '280px' : (collapsed ? '80px' : '280px');
    const sidebarTransform = isMobile ? (showMobileSidebar ? 'translateX(0)' : 'translateX(-100%)') : 'none';

    return (
        <div className="d-flex vw-100 vh-100 bg-light text-dark overflow-hidden position-relative">
            {/* Mobile Backdrop */}
            {isMobile && showMobileSidebar && (
                <div
                    className="position-absolute top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
                    style={{ zIndex: 1040 }}
                    onClick={() => setShowMobileSidebar(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-white border-end d-flex flex-column h-100 shadow-sm transition-all ${isMobile ? 'position-absolute top-0 start-0' : ''}`}
                style={{
                    width: sidebarWidth,
                    minWidth: sidebarWidth,
                    zIndex: 1050,
                    transform: sidebarTransform,
                    transition: 'all 0.3s ease'
                }}
            >
                <div className="p-4 border-bottom d-flex align-items-center justify-content-between" style={{ height: '72px' }}>
                    {(!collapsed || isMobile) && (
                        <div className="d-flex align-items-center gap-2">
                            <div className="rounded bg-primary p-1 d-flex align-items-center justify-content-center text-white fw-bold" style={{ width: '32px', height: '32px' }}>B</div>
                            <span className="fw-bold fs-5 text-dark">Biller Pro</span>
                        </div>
                    )}
                    {collapsed && !isMobile && (
                        <div className="rounded bg-primary d-flex align-items-center justify-content-center fw-bold text-white mx-auto" style={{ width: '32px', height: '32px' }}>B</div>
                    )}
                    {isMobile && (
                        <button className="btn btn-sm btn-light border-0" onClick={() => setShowMobileSidebar(false)}>
                            <i className="bi bi-x-lg"></i>
                        </button>
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
                            collapsed={collapsed && !isMobile}
                        />
                    ))}
                </div>

                <div className="p-3 border-top bg-white">
                    {!isMobile && (
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="btn btn-light w-100 d-flex align-items-center gap-3 px-3 py-2 mb-2 text-secondary border-0"
                        >
                            {collapsed ? <i className="bi bi-layout-sidebar-inset fs-5 mx-auto"></i> : <><i className="bi bi-layout-sidebar fs-5"></i> <span className="small fw-medium">Collapse</span></>}
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="btn btn-outline-danger w-100 d-flex align-items-center gap-3 px-3 py-2 border-0"
                    >
                        <i className={`bi bi-box-arrow-right fs-5 ${collapsed && !isMobile ? "mx-auto" : ""}`}></i>
                        {(!collapsed || isMobile) && <span className="small fw-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="d-flex flex-column flex-grow-1 overflow-hidden h-100">
                {/* Header */}
                <header className="navbar navbar-expand bg-white border-bottom px-4 py-2 shadow-sm sticky-top" style={{ height: '72px', zIndex: 1020 }}>
                    <div className="container-fluid p-0">
                        <div className="d-flex align-items-center gap-3">
                            {isMobile && (
                                <button className="btn btn-light border p-1 px-2" onClick={() => setShowMobileSidebar(true)}>
                                    <i className="bi bi-list fs-4"></i>
                                </button>
                            )}
                            <h2 className="navbar-brand mb-0 h4 fw-bold text-capitalize text-muted">
                                {location.pathname.split('/')[1] || 'Dashboard'}
                            </h2>
                        </div>
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
