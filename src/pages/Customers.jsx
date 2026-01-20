import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetCustomersQuery } from '../redux/api/customersApiSlice';

const Customers = () => {
    const navigate = useNavigate();
    const [pageNumber, setPageNumber] = useState(1);
    const [keyword, setKeyword] = useState('');

    const { data, isLoading } = useGetCustomersQuery({ keyword, page: pageNumber });

    useEffect(() => {
        setPageNumber(1);
    }, [keyword]);

    return (
        <div className="animate-fade-in container-fluid">
            <div className="row mb-4 align-items-center">
                <div className="col-12 col-md-6">
                    <h1 className="h3 fw-bold text-dark mb-1">Customer Management</h1>
                    <p className="text-muted small">Manage your customer database and ledgers</p>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <button
                        onClick={() => navigate('/customers/add')}
                        className="btn btn-primary shadow-sm"
                    >
                        <i className="bi bi-person-plus me-2"></i> Add New Customer
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm mb-4">
                <div className="card-body">
                    <div className="row align-items-center">
                        <div className="col-12 col-md-4">
                            <div className="input-group">
                                <span className="input-group-text bg-light border-0">
                                    <i className="bi bi-search text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search customers..."
                                    className="form-control bg-light border-0"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row g-4">
                {isLoading ? (
                    <div className="col-12 text-center p-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-2 text-muted">Loading customers...</p>
                    </div>
                ) : data?.customers?.map(customer => (
                    <div key={customer._id} className="col-12 col-md-6 col-lg-4">
                        <div
                            className="card border-0 shadow-sm h-100 hover-shadow transition-all cursor-pointer"
                            onClick={() => navigate(`/customers/ledger/${customer._id}`)}
                        >
                            <div className="card-body p-4">
                                <div className="d-flex align-items-center justify-content-between mb-4">
                                    <div className="d-flex align-items-center gap-3">
                                        <div className="rounded-circle bg-primary bg-opacity-10 text-primary d-flex align-items-center justify-content-center fw-bold fs-4" style={{ width: '56px', height: '56px' }}>
                                            {customer.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="overflow-hidden">
                                            <h5 className="fw-bold text-dark mb-0 text-truncate">{customer.name}</h5>
                                            <p className="xsmall text-muted mb-0 text-truncate">{customer.email || 'NO EMAIL'}</p>
                                        </div>
                                    </div>
                                    <button
                                        className="btn btn-sm btn-light rounded-pill px-3 shadow-sm border"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/customers/receipt/${customer._id}`);
                                        }}
                                    >
                                        Receipt
                                    </button>
                                </div>
                                <div className="d-flex flex-column gap-2 mb-4">
                                    <div className="d-flex align-items-center gap-2 text-muted small">
                                        <i className="bi bi-telephone"></i>
                                        <span>{customer.phone}</span>
                                    </div>
                                    <div className="d-flex align-items-center gap-2 text-muted small">
                                        <i className="bi bi-geo-alt"></i>
                                        <span className="text-truncate">{customer.address || 'NO ADDRESS'}</span>
                                    </div>
                                </div>
                                <div className="pt-3 border-top mt-auto d-flex justify-content-between align-items-center">
                                    <span className="small text-muted fw-bold text-uppercase ls-1">Ledger Balance</span>
                                    <span className={`fw-bold h5 mb-0 ${customer.ledgerBalance > 0 ? 'text-danger' : 'text-success'}`}>
                                        ₹{customer.ledgerBalance?.toLocaleString() || 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}{data?.pages > 1 && (
                <div className="d-flex justify-content-center mt-5 mb-4">
                    <nav aria-label="Page navigation">
                        <ul className="pagination shadow-sm">
                            <li className={`page-item ${data.page === 1 ? 'disabled' : ''}`}>
                                <button className="page-link border-0" onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}>
                                    <i className="bi bi-chevron-left"></i>
                                </button>
                            </li>
                            {[...Array(data.pages).keys()].map(x => (
                                <li key={x + 1} className={`page-item ${data.page === x + 1 ? 'active' : ''}`}>
                                    <button className="page-link border-0" onClick={() => setPageNumber(x + 1)}>
                                        {x + 1}
                                    </button>
                                </li>
                            ))}
                            <li className={`page-item ${data.page === data.pages ? 'disabled' : ''}`}>
                                <button className="page-link border-0" onClick={() => setPageNumber(prev => Math.min(prev + 1, data.pages))}>
                                    <i className="bi bi-chevron-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default Customers;
