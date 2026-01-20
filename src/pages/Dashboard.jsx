import { useGetDashboardStatsQuery } from '../redux/api/analyticsApiSlice';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, color, subValue = '' }) => (
    <div className="card border-0 shadow-sm h-100 animate-fade-in hover-shadow transition-all">
        <div className="card-body d-flex justify-content-between align-items-start">
            <div>
                <p className="text-muted small fw-bold text-uppercase mb-1">{title}</p>
                <h3 className="fw-bold mb-0">{value}</h3>
                {subValue && <p className="text-muted xsmall mt-1 mb-0">{subValue}</p>}
            </div>
            <div className={`rounded-3 p-3 d-flex align-items-center justify-content-center ${color}`}>
                <i className={`bi bi-${icon} fs-4`}></i>
            </div>
        </div>
    </div>
);

const Dashboard = () => {
    const { data: stats, isLoading } = useGetDashboardStatsQuery();

    if (isLoading) return (
        <div className="d-flex justify-content-center align-items-center p-5">
            <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading Dashboard...</span>
            </div>
        </div>
    );

    return (
        <div className="animate-fade-in">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 fw-bold text-dark mb-1">Dashboard</h1>
                    <p className="text-muted small mb-0">Overview of your business performance</p>
                </div>
                <div className="badge bg-white text-dark border px-3 py-2 fw-normal rounded-pill">
                    <i className="bi bi-calendar3 me-2"></i>
                    {new Date().toDateString()}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="Total Sales"
                        value={`₹${stats?.totalSales?.toLocaleString() || 0}`}
                        icon="graph-up-arrow"
                        color="bg-primary bg-opacity-10 text-primary"
                        subValue={`${stats?.totalOrders || 0} Orders`}
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="Total Expenses"
                        value={`₹${stats?.totalExpenses?.toLocaleString() || 0}`}
                        icon="wallet2"
                        color="bg-danger bg-opacity-10 text-danger"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="Customers"
                        value={stats?.customerCount || 0}
                        icon="people"
                        color="bg-info bg-opacity-10 text-info"
                    />
                </div>
                <div className="col-12 col-md-6 col-lg-3">
                    <StatCard
                        title="Products"
                        value={stats?.productCount || 0}
                        icon="box-seam"
                        color="bg-warning bg-opacity-10 text-warning"
                    />
                </div>
            </div>

            {/* Recent & Low Stock */}
            <div className="row g-4 mb-4">
                {/* Recent Activity */}
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                            <h2 className="h6 fw-bold mb-0">Recent Billing</h2>
                            <Link to="/billing" className="btn btn-sm btn-link text-decoration-none">View All</Link>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr className="small text-uppercase text-muted">
                                            <th className="px-4 py-3">Bill #</th>
                                            <th className="py-3">Customer</th>
                                            <th className="py-3">Amount</th>
                                            <th className="py-3">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="small">
                                        {stats?.recentBills?.map(bill => (
                                            <tr key={bill._id}>
                                                <td className="px-4 py-3 fw-medium text-primary">{bill.billNumber}</td>
                                                <td className="py-3">{bill.customer?.name || 'Walk-in'}</td>
                                                <td className="py-3 fw-bold">₹{bill.grandTotal}</td>
                                                <td className="py-3">
                                                    <span className={`badge rounded-pill ${bill.status === 'Fully Settled' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-warning'
                                                        }`}>
                                                        {bill.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Low Stock Alert */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                        <div className="card-header bg-white border-0 py-3 d-flex align-items-center gap-2">
                            <i className="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
                            <h2 className="h6 fw-bold mb-0">Low Stock Alert</h2>
                        </div>
                        <div className="card-body">
                            <div className="d-flex flex-column gap-2">
                                {stats?.lowStockProducts?.length === 0 ? (
                                    <div className="alert alert-success d-flex align-items-center small py-2 mb-0" role="alert">
                                        <i className="bi bi-check-circle-fill me-2"></i>
                                        All stock levels abundant.
                                    </div>
                                ) : (
                                    stats?.lowStockProducts?.map(prod => (
                                        <div key={prod._id} className="d-flex justify-content-between align-items-center p-2 rounded-2 bg-light border">
                                            <div className="flex-grow-1 text-truncate pe-2">
                                                <span className="small fw-medium d-block text-truncate text-dark">{prod.name}</span>
                                            </div>
                                            <div className="text-end">
                                                <span className="badge bg-danger">{prod.stock} left</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <Link to="/inventory" className="btn btn-sm btn-outline-primary w-100 mt-4">
                                Manage Inventory
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="row g-3">
                <div className="col-6 col-md-3">
                    <Link to="/pos" className="btn btn-primary w-100 py-3 d-flex flex-column align-items-center gap-2 shadow-sm">
                        <i className="bi bi-cart-plus-fill fs-3"></i>
                        <span className="fw-bold">New Sale</span>
                    </Link>
                </div>
                <div className="col-6 col-md-3">
                    <Link to="/inventory" className="btn btn-white border w-100 py-3 d-flex flex-column align-items-center gap-2 shadow-sm">
                        <i className="bi bi-plus-circle-fill fs-3 text-success"></i>
                        <span className="fw-bold text-dark">Add Product</span>
                    </Link>
                </div>
                <div className="col-6 col-md-3">
                    <Link to="/customers" className="btn btn-white border w-100 py-3 d-flex flex-column align-items-center gap-2 shadow-sm">
                        <i className="bi bi-person-plus-fill fs-3 text-info"></i>
                        <span className="fw-bold text-dark">Add Customer</span>
                    </Link>
                </div>
                <div className="col-6 col-md-3">
                    <Link to="/reports" className="btn btn-white border w-100 py-3 d-flex flex-column align-items-center gap-2 shadow-sm">
                        <i className="bi bi-bar-chart-fill fs-3 text-primary"></i>
                        <span className="fw-bold text-dark">View Reports</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
