import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCustomerByIdQuery, useGetCustomerTransactionsQuery } from '../redux/api/customersApiSlice';

const CustomerLedger = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    const { data: customer, isLoading: customerLoading } = useGetCustomerByIdQuery(id);
    const { data: transactions, isLoading: transLoading } = useGetCustomerTransactionsQuery({
        id,
        startDate: dateRange.start,
        endDate: dateRange.end
    });

    if (customerLoading) return <div className="p-5 text-center">Loading...</div>;

    const getBadgeClass = (type) => {
        switch (type) {
            case 'SALE': return 'bg-primary bg-opacity-10 text-primary';
            case 'RETURN': return 'bg-danger bg-opacity-10 text-danger';
            case 'PAYMENT': return 'bg-success bg-opacity-10 text-success';
            default: return 'bg-light text-muted';
        }
    };

    return (
        <div className="container-fluid animate-fade-in">
            <div className="row mb-4 align-items-center d-print-none">
                <div className="col">
                    <button onClick={() => navigate('/customers')} className="btn btn-link text-decoration-none p-0 mb-2">
                        <i className="bi bi-arrow-left me-1"></i> Back to Customers
                    </button>
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h1 className="h3 fw-bold text-dark mb-1">{customer?.name}</h1>
                            <p className="text-muted small mb-0">
                                <i className="bi bi-telephone mb-1"></i> {customer?.phone} |
                                <i className="bi bi-geo-alt ms-2"></i> {customer?.address || 'NO ADDRESS'}
                            </p>
                        </div>
                        <div className="text-end">
                            <p className="xsmall fw-bold text-muted text-uppercase mb-1">Current Ledger Balance</p>
                            <h3 className={`fw-bold ${customer?.ledgerBalance > 0 ? 'text-danger' : 'text-success'}`}>
                                ₹{customer?.ledgerBalance?.toLocaleString() || '0'}
                            </h3>
                            <button
                                onClick={() => navigate(`/customers/receipt/${id}`)}
                                className="btn btn-primary shadow-sm mt-2"
                            >
                                <i className="bi bi-cash-stack me-2"></i> Collect Receipt
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Header */}
            <div className="d-none d-print-block mb-4 text-center">
                <h3>Statement of Account</h3>
                <h4 className="fw-bold">{customer?.name}</h4>
                <p>{customer?.address} | {customer?.phone}</p>
                {dateRange.start && dateRange.end && (
                    <p className="small text-muted">Period: {new Date(dateRange.start).toLocaleDateString('en-GB')} to {new Date(dateRange.end).toLocaleDateString('en-GB')}</p>
                )}
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm mb-4 d-print-none">
                <div className="card-body p-3">
                    <div className="row align-items-end g-2">
                        <div className="col-md-3">
                            <label className="form-label xsmall fw-bold text-muted">From Date</label>
                            <input type="date" className="form-control form-control-sm" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <label className="form-label xsmall fw-bold text-muted">To Date</label>
                            <input type="date" className="form-control form-control-sm" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                            <button className="btn btn-sm btn-outline-secondary w-100" onClick={() => setDateRange({ start: '', end: '' })}>Clear Filter</button>
                        </div>
                        <div className="col-md-3 text-end">
                            <button className="btn btn-sm btn-dark w-100" onClick={() => window.print()}>
                                <i className="bi bi-printer me-2"></i> Print Statement
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="card-header bg-white py-3 border-0 d-print-none">
                    <h5 className="fw-bold mb-0 text-dark">Transaction Records</h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="small text-uppercase text-muted">
                                <th className="px-4 py-3">Date</th>
                                <th className="py-3">Type</th>
                                <th className="py-3">ID / Number</th>
                                <th className="py-3 text-end">Amount</th>
                                <th className="py-3">Mode / Status</th>
                                <th className="px-4 py-3 text-end d-print-none">Action</th>
                            </tr>
                        </thead>
                        <tbody className="small">
                            {transLoading ? (
                                <tr><td colSpan="6" className="text-center py-5">Loading history...</td></tr>
                            ) : transactions?.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No transactions found</td></tr>
                            ) : (
                                transactions.map((t, idx) => (
                                    <tr key={idx}>
                                        <td className="px-4 py-3 text-muted">{new Date(t.date).toLocaleDateString('en-GB')}</td>
                                        <td className="py-3">
                                            <span className={`badge rounded-pill px-3 ${getBadgeClass(t.type)} border d-print-none`}>
                                                {t.type}
                                            </span>
                                            <span className="d-none d-print-inline fw-bold small">{t.type}</span>
                                        </td>
                                        <td className="py-3 fw-bold">{t.id}</td>
                                        <td className={`py-3 text-end fw-bold ${t.type === 'RETURN' || t.type === 'PAYMENT' ? 'text-success' : 'text-dark'}`}>
                                            {t.type === 'RETURN' || t.type === 'PAYMENT' ? '-' : ''}₹{t.amount?.toLocaleString() || '0'}
                                        </td>
                                        <td className="py-3 text-muted">{t.status || t.mode || '-'}</td>
                                        <td className="px-4 py-3 text-end d-print-none">
                                            {t.type === 'SALE' && (
                                                <a href={`/print/bill/${t.refId}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-primary shadow-none border-0">
                                                    <i className="bi bi-printer"></i>
                                                </a>
                                            )}
                                            {t.type === 'RETURN' && (
                                                <a href={`/print/return/${t.refId}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-danger shadow-none border-0">
                                                    <i className="bi bi-printer"></i>
                                                </a>
                                            )}
                                            {t.type === 'PAYMENT' && (
                                                <a href={`/print/receipt/${t.refId}`} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-success shadow-none border-0">
                                                    <i className="bi bi-printer"></i>
                                                </a>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Print Footer */}
            <div className="d-none d-print-block mt-4 text-center text-muted small">
                <p>Printed on {new Date().toLocaleString('en-GB')}</p>
            </div>
        </div>
    );
};

export default CustomerLedger;
