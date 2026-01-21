import { useState, useEffect } from 'react';
import { useGetBillsQuery } from '../redux/api/billsApiSlice';
import { useGetSalesReturnsQuery } from '../redux/api/returnsApiSlice';
import { useCreateSalesReturnMutation } from '../redux/api/returnsApiSlice';

const Billing = () => {
    const [pageNumber, setPageNumber] = useState(1);
    const [keyword, setKeyword] = useState('');

    const [viewMode, setViewMode] = useState('invoices'); // invoices, returns

    const { data, isLoading } = useGetBillsQuery({ keyword, pageNumber });
    const { data: returns, isLoading: returnsLoading } = useGetSalesReturnsQuery();
    const [createSalesReturn] = useCreateSalesReturnMutation();

    const bills = data?.bills || [];
    const pages = data?.pages || 1;

    useEffect(() => {
        setPageNumber(1);
    }, [keyword]);

    // Return Modal State
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedBill, setSelectedBill] = useState(null);
    const [returnItems, setReturnItems] = useState({});

    // Client-side filter removed in favor of server-side

    const getStatusColor = (status) => {
        switch (status) {
            case 'Fully Settled': return 'bg-success bg-opacity-10 text-success';
            case 'Partially Settled': return 'bg-warning bg-opacity-10 text-warning';
            case 'Unsettled': return 'bg-danger bg-opacity-10 text-danger';
            default: return 'bg-light text-muted';
        }
    };

    const handleReturnClick = (bill) => {
        setSelectedBill(bill);
        setReturnItems({});
        setReturnModalOpen(true);
    };

    const [refundMode, setRefundMode] = useState('Ledger');
    const [refundReference, setRefundReference] = useState('');

    const handleReturnSubmit = async (e) => {
        e.preventDefault();
        const itemsToReturn = Object.entries(returnItems)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, qty]) => ({ productId, quantity: parseInt(qty) }));

        if (itemsToReturn.length === 0) return;

        try {
            await createSalesReturn({
                billId: selectedBill._id,
                items: itemsToReturn,
                refundMode,
                refundReference,
                reason: 'Customer Return'
            }).unwrap();
            alert('Return Processed Successfully');
            setReturnModalOpen(false);
            setRefundMode('Ledger');
            setRefundReference('');
        } catch (err) {
            console.error(err);
            alert('Return Failed');
        }
    };

    return (
        <div className="animate-fade-in container-fluid">
            <div className="row mb-4 align-items-center">
                <div className="col-12 col-md-6">
                    <h1 className="h3 fw-bold text-dark mb-1">Billing History</h1>
                    <p className="text-muted small">View and manage all your customer invoices</p>
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
                                    placeholder="Search invoice or customer..."
                                    className="form-control bg-light border-0"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toggle Tabs */}
            <div className="d-flex gap-2 mb-3">
                <button
                    className={`btn btn-sm px-4 ${viewMode === 'invoices' ? 'btn-dark' : 'btn-outline-secondary border-0'}`}
                    onClick={() => setViewMode('invoices')}
                >
                    Invoices
                </button>
                <button
                    className={`btn btn-sm px-4 ${viewMode === 'returns' ? 'btn-dark' : 'btn-outline-secondary border-0'}`}
                    onClick={() => setViewMode('returns')}
                >
                    Sales Returns
                </button>
            </div >

            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    {viewMode === 'invoices' ? (
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="small text-uppercase text-muted">
                                    <th className="px-4 py-3">Invoice #</th>
                                    <th className="py-3">Date</th>
                                    <th className="py-3">Customer</th>
                                    <th className="py-3">Grand Total</th>
                                    <th className="py-3 text-success">Paid</th>
                                    <th className="py-3 text-danger">Balance</th>
                                    <th className="py-3">Status</th>
                                    <th className="px-4 py-3 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="small">
                                {isLoading ? (
                                    <tr><td colSpan="8" className="p-5 text-center"><div className="spinner-border text-primary spinner-border-sm me-2"></div> Loading invoices...</td></tr>
                                ) : bills?.length === 0 ? (
                                    <tr><td colSpan="8" className="p-5 text-center text-muted">No invoices found</td></tr>
                                ) : (
                                    bills?.map((bill) => (
                                        <tr key={bill._id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center gap-2">
                                                    <i className="bi bi-file-earmark-text text-primary fs-5"></i>
                                                    <span className="fw-bold text-dark">{bill.billNumber}</span>
                                                </div>
                                            </td>
                                            <td className="py-3 text-muted">{new Date(bill.createdAt).toLocaleDateString('en-GB')}</td>
                                            <td className="py-3">
                                                {bill.customer ? (
                                                    <div>
                                                        <div className="fw-bold text-dark">{bill.customer.name}</div>
                                                        <span className="xsmall text-muted">{bill.customer.phone}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted italic">Walk-in Customer</span>
                                                )}
                                            </td>
                                            <td className="py-3 fw-bold">₹{bill.grandTotal}</td>
                                            <td className="py-3 text-success fw-medium">₹{bill.paidAmount || 0}</td>
                                            <td className={`py-3 fw-bold ${bill.balanceAmount > 0 ? 'text-danger' : 'text-muted'}`}>₹{bill.balanceAmount || 0}</td>
                                            <td className="py-3">
                                                <span className={`badge rounded-pill ${getStatusColor(bill.status)}`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        onClick={() => window.open(`/#/print/bill/${bill._id}`, '_blank')}
                                                        className="btn btn-sm btn-outline-primary d-flex align-items-center gap-2 px-3"
                                                    >
                                                        <i className="bi bi-printer"></i> Print
                                                    </button>
                                                    <button
                                                        onClick={() => handleReturnClick(bill)}
                                                        className="btn btn-sm btn-outline-secondary"
                                                        title="Process Return"
                                                    >
                                                        <i className="bi bi-arrow-counterclockwise"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    ) : (
                        /* RETURNS TABLE */
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr className="small text-uppercase text-muted">
                                    <th className="px-4 py-3">Date</th>
                                    <th className="py-3">Customer</th>
                                    <th className="py-3">Refund Amount</th>
                                    <th className="py-3">Mode</th>
                                    <th className="py-3">Reason</th>
                                    <th className="px-4 py-3 text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="small">
                                {returnsLoading ? (
                                    <tr><td colSpan="7" className="p-5 text-center"><div className="spinner-border text-primary spinner-border-sm me-2"></div> Loading returns...</td></tr>
                                ) : !returns || returns.length === 0 ? (
                                    <tr><td colSpan="7" className="p-5 text-center text-muted">No returns found</td></tr>
                                ) : (
                                    returns.map((ret) => (
                                        <tr key={ret._id}>
                                            <td className="px-4 py-3 text-muted">{new Date(ret.createdAt).toLocaleDateString()}</td>
                                            <td className="py-3">
                                                {ret.customer ? (
                                                    <span className="fw-bold">{ret.customer.name}</span>
                                                ) : '-'}
                                            </td>
                                            <td className="py-3 fw-bold text-success">₹{ret.totalRefundAmount}</td>
                                            <td className="py-3"><span className="badge bg-light text-dark border">{ret.refundMode}</span></td>
                                            <td className="py-3 text-muted">{ret.reason || '-'}</td>
                                            <td className="px-4 py-3 text-end">
                                                <button
                                                    className="btn btn-sm btn-outline-danger shadow-none"
                                                    onClick={() => window.open(`/#/print/return/${ret._id}`, '_blank')}
                                                >
                                                    <i className="bi bi-printer"></i> Receipt
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Pagination for Invoices Only */}
            {
                viewMode === 'invoices' && pages > 1 && (
                    <div className="d-flex justify-content-center mb-4">
                        <nav aria-label="Page navigation">
                            <ul className="pagination shadow-sm">
                                <li className={`page-item ${pageNumber === 1 ? 'disabled' : ''}`}>
                                    <button className="page-link border-0" onClick={() => setPageNumber(prev => Math.max(prev - 1, 1))}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                </li>
                                {[...Array(pages).keys()].map(x => (
                                    <li key={x + 1} className={`page-item ${pageNumber === x + 1 ? 'active' : ''}`}>
                                        <button className="page-link border-0" onClick={() => setPageNumber(x + 1)}>
                                            {x + 1}
                                        </button>
                                    </li>
                                ))}
                                <li className={`page-item ${pageNumber === pages ? 'disabled' : ''}`}>
                                    <button className="page-link border-0" onClick={() => setPageNumber(prev => Math.min(prev + 1, pages))}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                )
            }

            {/* Return Modal */}
            {
                returnModalOpen && selectedBill && (
                    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                        <div className="modal-dialog modal-dialog-centered modal-lg">
                            <div className="modal-content border-0 shadow-lg animate-fade-in">
                                <div className="modal-header border-0 px-4 pt-4">
                                    <h5 className="modal-title fw-bold">Process Sales Return - {selectedBill.billNumber}</h5>
                                    <button type="button" className="btn-close" onClick={() => setReturnModalOpen(false)}></button>
                                </div>
                                <div className="modal-body p-4">
                                    <div className="alert alert-info border-0 rounded-3 mb-4">
                                        <i className="bi bi-info-circle-fill me-2"></i>
                                        Select the quantity being returned for each item.
                                    </div>

                                    <div className="list-group list-group-flush border rounded-3 mb-4 overflow-auto" style={{ maxHeight: '300px' }}>
                                        {selectedBill.items.map(item => (
                                            <div key={item._id} className="list-group-item p-3 border-0 border-bottom">
                                                <div className="row align-items-center">
                                                    <div className="col">
                                                        <div className="fw-bold text-dark">{item.name}</div>
                                                        <div className="xsmall text-muted">Sold Qty: {item.quantity} | Price: ₹{item.price}</div>
                                                    </div>
                                                    <div className="col-auto">
                                                        <div className="input-group input-group-sm" style={{ width: '150px' }}>
                                                            <span className="input-group-text bg-light border-0 small">Return Qty</span>
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max={item.quantity}
                                                                className="form-control border-0 bg-light text-center fw-bold"
                                                                value={returnItems[item.product] || 0}
                                                                onChange={(e) => setReturnItems({
                                                                    ...returnItems,
                                                                    [item.product]: Math.min(parseInt(e.target.value) || 0, item.quantity)
                                                                })}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="row g-3 items-center mb-4">
                                        <div className="col-md-6 text-md-start">
                                            <div className="h5 fw-bold text-dark mb-0">
                                                Total Refund: ₹{Object.entries(returnItems).reduce((acc, [pid, qty]) => {
                                                    const item = selectedBill.items.find(i => i.product.toString() === pid);
                                                    return acc + (item ? item.price * qty : 0);
                                                }, 0).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="d-flex gap-2 justify-content-md-end">
                                                <select
                                                    className="form-select form-select-sm"
                                                    style={{ width: '130px' }}
                                                    value={refundMode}
                                                    onChange={e => setRefundMode(e.target.value)}
                                                >
                                                    <option value="Ledger">Ledger (Debt)</option>
                                                    <option value="Cash">Cash</option>
                                                    <option value="UPI">UPI</option>
                                                </select>
                                                {(refundMode === 'UPI' || refundMode === 'Cash') && (
                                                    <input
                                                        type="text"
                                                        className="form-control form-control-sm"
                                                        placeholder="Ref/Note"
                                                        value={refundReference}
                                                        onChange={e => setRefundReference(e.target.value)}
                                                        style={{ width: '120px' }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" onClick={() => setReturnModalOpen(false)} className="btn btn-light px-4">Cancel</button>
                                        <button onClick={handleReturnSubmit} className="btn btn-primary px-4 shadow">Process Return & Update Stock</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Billing;
