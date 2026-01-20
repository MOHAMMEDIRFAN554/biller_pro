import { useState } from 'react';
import { useGetExpensesQuery, useCreateExpenseMutation, useDeleteExpenseMutation } from '../redux/api/expensesApiSlice';
import { useGetCollectionReportQuery, useGetPnLReportQuery } from '../redux/api/reportsApiSlice';
import { useSelector } from 'react-redux';

const Reports = () => {
    const [activeTab, setActiveTab] = useState('collection'); // 'collection', 'pnl', 'expenses'
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [expenseForm, setExpenseForm] = useState({ category: '', amount: '', description: '' });

    // Report Date Filter
    const today = new Date().toISOString().split('T')[0];
    const [dateRange, setDateRange] = useState({ start: today, end: today });

    const { userInfo } = useSelector((state) => state.auth);

    // Data Hooks
    const { data: expenses, isLoading: expLoading } = useGetExpensesQuery();
    const { data: reportData, isLoading: reportLoading, refetch: refetchReport } = useGetCollectionReportQuery({
        startDate: dateRange.start,
        endDate: dateRange.end
    });
    const { data: pnlData, isLoading: pnlLoading, refetch: refetchPnL } = useGetPnLReportQuery({
        startDate: dateRange.start,
        endDate: dateRange.end
    });

    const [createExpense] = useCreateExpenseMutation();
    const [deleteExpense] = useDeleteExpenseMutation();

    const handleCreateExpense = async (e) => {
        e.preventDefault();
        try {
            await createExpense(expenseForm).unwrap();
            setIsExpenseModalOpen(false);
            setExpenseForm({ category: '', amount: '', description: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteExpense = async (id) => {
        if (window.confirm('Delete this expense?')) {
            try {
                await deleteExpense(id).unwrap();
            } catch (err) {
                alert(err?.data?.message || err.error);
            }
        }
    }

    const setQuickRange = (rangeType) => {
        const end = new Date();
        let start = new Date();
        if (rangeType === 'weekly') start.setDate(end.getDate() - 7);
        if (rangeType === 'monthly') start.setMonth(end.getMonth() - 1);
        if (rangeType === 'today') {
            start = end;
        }
        setDateRange({
            start: start.toISOString().split('T')[0],
            end: end.toISOString().split('T')[0]
        });
    }

    return (
        <div className="animate-fade-in container-fluid">
            <div className="row mb-4 align-items-center">
                <div className="col-12 col-md-6">
                    <h1 className="h3 fw-bold text-dark mb-1">Reports & Financials</h1>
                    <p className="text-muted small">Insights into collections, sales, and expenses</p>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <div className="btn-group shadow-sm p-1 bg-white rounded-3">
                        <button
                            className={`btn btn-sm px-4 rounded-2 border-0 ${activeTab === 'collection' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => setActiveTab('collection')}
                        >
                            Collection
                        </button>
                        <button
                            className={`btn btn-sm px-4 rounded-2 border-0 ${activeTab === 'pnl' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => setActiveTab('pnl')}
                        >
                            Profit & Loss
                        </button>
                        <button
                            className={`btn btn-sm px-4 rounded-2 border-0 ${activeTab === 'expenses' ? 'btn-primary shadow-sm' : 'btn-light text-muted'}`}
                            onClick={() => setActiveTab('expenses')}
                        >
                            Expenses
                        </button>
                    </div>
                </div>
            </div>

            {activeTab === 'collection' && (
                <div className="collection-report-tab pb-5">
                    {/* Filters */}
                    <div className="card border-0 shadow-sm mb-4 d-print-none">
                        <div className="card-body p-4">
                            <div className="row align-items-end g-3">
                                <div className="col-md-3">
                                    <label className="form-label xsmall fw-bold text-muted text-uppercase ls-1">From Date</label>
                                    <input type="date" className="form-control" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label xsmall fw-bold text-muted text-uppercase ls-1">To Date</label>
                                    <input type="date" className="form-control" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => setQuickRange('today')}>Today</button>
                                        <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => setQuickRange('weekly')}>7 Days</button>
                                        <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => setQuickRange('monthly')}>30 Days</button>
                                    </div>
                                </div>
                                <div className="col-md-2 text-md-end">
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-primary w-100" onClick={refetchReport} disabled={reportLoading}>
                                            {reportLoading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-arrow-clockwise"></i></>}
                                        </button>
                                        <button className="btn btn-outline-dark w-100" onClick={() => window.print()}>
                                            <i className="bi bi-printer"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Summary Cards */}
                    <div className="row g-3 mb-4">
                        <div className="col-6 col-md">
                            <div className="card border-0 shadow-sm bg-success text-white p-3 h-100">
                                <span className="xsmall fw-bold text-uppercase opacity-75">Cash</span>
                                <h3 className="fw-bold mb-0">₹{reportData?.summary?.totalCash.toLocaleString()}</h3>
                                <i className="bi bi-cash position-absolute end-0 bottom-0 m-2 fs-4 opacity-25"></i>
                            </div>
                        </div>
                        <div className="col-6 col-md">
                            <div className="card border-0 shadow-sm bg-info text-white p-3 h-100">
                                <span className="xsmall fw-bold text-uppercase opacity-75">UPI</span>
                                <h3 className="fw-bold mb-0">₹{reportData?.summary?.totalUPI.toLocaleString()}</h3>
                                <i className="bi bi-phone position-absolute end-0 bottom-0 m-2 fs-4 opacity-25"></i>
                            </div>
                        </div>
                        <div className="col-6 col-md">
                            <div className="card border-0 shadow-sm bg-primary text-white p-3 h-100">
                                <span className="xsmall fw-bold text-uppercase opacity-75">Card</span>
                                <h3 className="fw-bold mb-0">₹{reportData?.summary?.totalCard.toLocaleString()}</h3>
                                <i className="bi bi-credit-card position-absolute end-0 bottom-0 m-2 fs-4 opacity-25"></i>
                            </div>
                        </div>
                        <div className="col-6 col-md">
                            <div className="card border-0 shadow-sm bg-warning text-dark p-3 h-100">
                                <span className="xsmall fw-bold text-uppercase opacity-75">Credit (Unpaid)</span>
                                <h3 className="fw-bold mb-0">₹{reportData?.summary?.totalCredit.toLocaleString()}</h3>
                                <i className="bi bi-journal-text position-absolute end-0 bottom-0 m-2 fs-4 opacity-25"></i>
                            </div>
                        </div>
                        <div className="col-12 col-md">
                            <div className="card border-0 shadow-sm bg-dark text-white p-3 h-100">
                                <span className="xsmall fw-bold text-uppercase opacity-75">Net Collection</span>
                                <h3 className="fw-bold mb-0 text-success">₹{reportData?.summary?.netCollection.toLocaleString()}</h3>
                                <i className="bi bi-wallet2 position-absolute end-0 bottom-0 m-2 fs-4 opacity-25"></i>
                            </div>
                        </div>
                    </div>

                    {/* Table Details */}
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0 p-4">
                            <h5 className="fw-bold text-dark mb-0">Transaction List</h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="border-0 px-4 py-3">Date</th>
                                            <th className="border-0 py-3">Customer</th>
                                            <th className="border-0 py-3">ID</th>
                                            <th className="border-0 py-3">Mode(s)</th>
                                            <th className="border-0 py-3 text-end px-4">Net Collected</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportLoading ? (
                                            <tr><td colSpan="5" className="text-center py-5">Loading report...</td></tr>
                                        ) : [
                                            ...(reportData?.details?.bills || []),
                                            ...(reportData?.details?.returns || []),
                                            ...(reportData?.details?.ledgerPayments || [])
                                        ].length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-5 text-muted">No transactions found for this period.</td></tr>
                                        ) : [
                                            ...(reportData?.details?.bills.map(b => ({ ...b, tType: 'SALE', collected: b.payments.reduce((acc, p) => acc + p.amount, 0), modes: b.payments.map(p => p.mode).join(', ') })) || []),
                                            ...(reportData?.details?.returns.map(r => ({ ...r, tType: 'RETURN', collected: -r.totalRefundAmount, modes: r.refundMode })) || []),
                                            ...(reportData?.details?.ledgerPayments.map(l => ({ ...l, tType: 'LEDGER', collected: l.payments.reduce((acc, p) => acc + p.amount, 0), modes: l.payments.map(p => p.mode).join(', ') })) || [])
                                        ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((tx, idx) => (
                                            <tr key={idx}>
                                                <td className="px-4 py-3 small">{new Date(tx.createdAt).toLocaleString('en-GB')}</td>
                                                <td className="py-3">
                                                    <div className="fw-bold small">{tx.customer?.name || tx.partyId?.name || 'N/A'}</div>
                                                    <div className="xsmall text-muted">{tx.customer?.phone || tx.partyId?.phone}</div>
                                                </td>
                                                <td className="py-3">
                                                    <span className={`badge px-3 rounded-pill ${tx.tType === 'SALE' ? 'bg-primary' : tx.tType === 'RETURN' ? 'bg-danger' : 'bg-success'} bg-opacity-10 text-${tx.tType === 'SALE' ? 'primary' : tx.tType === 'RETURN' ? 'danger' : 'success'} xsmall fw-bold`}>
                                                        {tx.tType}
                                                    </span>
                                                    <span className="ms-2 xsmall fw-bold text-muted">{tx.billNumber || tx._id.slice(-6).toUpperCase()}</span>
                                                </td>
                                                <td className="py-3 xsmall text-muted">{tx.modes || 'N/A'}</td>
                                                <td className={`py-3 text-end px-4 fw-bold ${tx.collected < 0 ? 'text-danger' : 'text-success'}`}>
                                                    {tx.collected < 0 ? '-' : '+'}₹{Math.abs(tx.collected).toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'pnl' && (
                <div className="pnl-report-tab pb-5">
                    {/* Filters */}
                    <div className="card border-0 shadow-sm mb-4 d-print-none">
                        <div className="card-body p-4">
                            <div className="row align-items-end g-3">
                                <div className="col-md-3">
                                    <label className="form-label xsmall fw-bold text-muted text-uppercase ls-1">From Date</label>
                                    <input type="date" className="form-control" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} />
                                </div>
                                <div className="col-md-3">
                                    <label className="form-label xsmall fw-bold text-muted text-uppercase ls-1">To Date</label>
                                    <input type="date" className="form-control" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} />
                                </div>
                                <div className="col-md-4">
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => setQuickRange('today')}>Today</button>
                                        <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => setQuickRange('weekly')}>7 Days</button>
                                        <button className="btn btn-outline-secondary btn-sm px-3" onClick={() => setQuickRange('monthly')}>30 Days</button>
                                    </div>
                                </div>
                                <div className="col-md-2 text-md-end">
                                    <div className="d-flex gap-2">
                                        <button className="btn btn-primary w-100" onClick={refetchPnL} disabled={pnlLoading}>
                                            {pnlLoading ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-arrow-clockwise"></i></>}
                                        </button>
                                        <button className="btn btn-outline-dark w-100" onClick={() => window.print()}>
                                            <i className="bi bi-printer"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="row g-4">
                        <div className="col-md-8">
                            <div className="card border-0 shadow-sm mb-4">
                                <div className="card-header bg-white border-0 p-4 pb-0">
                                    <h5 className="fw-bold mb-0">Income Statement Summary</h5>
                                </div>
                                <div className="card-body p-4 mt-2">
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <div className="p-3 bg-light rounded-3">
                                                <p className="xsmall fw-bold text-muted text-uppercase mb-1">Gross Revenue</p>
                                                <h4 className="fw-bold text-dark">₹{pnlData?.revenue?.totalSales.toLocaleString()}</h4>
                                                <hr className="my-2" />
                                                <div className="d-flex justify-content-between xsmall text-muted">
                                                    <span>Sales Return:</span>
                                                    <span className="text-danger">-₹{pnlData?.revenue?.totalSalesReturns.toLocaleString()}</span>
                                                </div>
                                                <div className="d-flex justify-content-between small fw-bold mt-1">
                                                    <span>Net Revenue:</span>
                                                    <span className="text-primary">₹{pnlData?.revenue?.netRevenue.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="p-3 bg-light rounded-3">
                                                <div className="mb-3">
                                                    <p className="xsmall fw-bold text-muted text-uppercase mb-1">Cost of Goods Sold (COGS)</p>
                                                    <h4 className="fw-bold text-dark">₹{pnlData?.cogs?.netPurchases?.toLocaleString()}</h4>
                                                    <p className="xsmall text-muted mb-0">Consumed Value (Sale Basis)</p>
                                                </div>
                                                <div className="border-top pt-2">
                                                    <p className="xsmall fw-bold text-muted text-uppercase mb-1">Actual Inventory Purchases</p>
                                                    <h5 className="fw-bold text-secondary">₹{pnlData?.cogs?.actualPurchaseOutflow?.toLocaleString()}</h5>
                                                    <p className="xsmall text-muted mb-0">Voucher Value (Cash Flow)</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="p-4 bg-primary bg-opacity-10 text-primary rounded-4 mb-3">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <p className="xsmall fw-bold text-uppercase mb-0">Gross Profit (Sale - Cost - Discount - Tax)</p>
                                                        <h2 className="fw-bold mb-0">₹{pnlData?.profit?.userGrossProfit?.toLocaleString()}</h2>
                                                        <span className="xsmall opacity-75">Trading Profit Excl. Tax</span>
                                                    </div>
                                                    <i className="bi bi-graph-up-arrow fs-1 opacity-25"></i>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-info bg-opacity-10 text-primary rounded-4">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <p className="xsmall fw-bold text-uppercase mb-0 text-info">Net Profit (Sale - Cost - Discount)</p>
                                                        <h2 className="fw-bold mb-0 text-info">₹{pnlData?.profit?.userNetProfit?.toLocaleString()}</h2>
                                                        <span className="xsmall opacity-75 text-info">Profit With Tax Component</span>
                                                    </div>
                                                    <i className="bi bi-pie-chart fs-1 opacity-25 text-info"></i>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="col-md-6 pt-3">
                                            <div className="p-3">
                                                <p className="xsmall fw-bold text-muted text-uppercase mb-2">Operating Expenses</p>
                                                <div className="d-flex justify-content-between small mb-2">
                                                    <span className="text-muted">Total Expenses:</span>
                                                    <span className="fw-bold text-danger">-₹{pnlData?.expenses?.totalExpenses.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className={`card border-0 shadow-sm h-100 ${pnlData?.profit?.netProfit >= 0 ? 'bg-success' : 'bg-danger'} text-white text-center p-5 rounded-4`}>
                                <div className="my-auto">
                                    <i className={`bi ${pnlData?.profit?.netProfit >= 0 ? 'bi-emoji-smile' : 'bi-emoji-frown'} display-1 opacity-25 mb-4 d-block`}></i>
                                    <p className="text-uppercase fw-bold ls-1 mb-1">Final Net Profit / Loss</p>
                                    <h1 className="display-4 fw-bold mb-0">₹{pnlData?.profit?.netProfit?.toLocaleString()}</h1>
                                    <p className="opacity-75 mt-3 px-3">Gross Profit (User) - Expenses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'expenses' && (
                <div className="expenses-tab">
                    <div className="row g-4">
                        <div className="col-12 col-lg-7">
                            <div className="card border-0 shadow-sm">
                                <div className="card-header bg-white border-0 py-3 d-flex justify-content-between align-items-center">
                                    <h5 className="fw-bold text-dark mb-0">Expense Ledger</h5>
                                    <button className="btn btn-sm btn-primary rounded-pill px-3" onClick={() => setIsExpenseModalOpen(true)}>
                                        <i className="bi bi-plus-lg me-1"></i> New
                                    </button>
                                </div>
                                <div className="card-body p-0">
                                    <div className="list-group list-group-flush overflow-auto" style={{ maxHeight: '600px' }}>
                                        {expLoading ? (
                                            <div className="p-5 text-center text-muted">Loading...</div>
                                        ) : expenses?.length === 0 ? (
                                            <div className="p-5 text-center text-muted">No expenses found.</div>
                                        ) : (
                                            expenses?.map(exp => (
                                                <div key={exp._id} className="list-group-item p-3 border-0 border-bottom">
                                                    <div className="row align-items-center">
                                                        <div className="col">
                                                            <div className="fw-bold text-dark">{exp.category}</div>
                                                            <div className="xsmall text-muted">{new Date(exp.date).toLocaleDateString('en-GB')} | {exp.description}</div>
                                                        </div>
                                                        <div className="col-auto text-end">
                                                            <div className="fw-bold text-danger">-₹{exp.amount.toLocaleString()}</div>
                                                            {userInfo.role === 'admin' && (
                                                                <button onClick={() => handleDeleteExpense(exp._id)} className="btn btn-sm btn-link text-muted p-0"><i className="bi bi-trash"></i></button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-lg-5">
                            <div className="card border-0 shadow-sm bg-light p-5 text-center h-100">
                                <div className="my-auto">
                                    <h4 className="fw-bold text-dark">Quick Summary</h4>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Total Expenses</span>
                                        <span className="fw-bold text-danger">₹{expenses?.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Net Outflow</span>
                                        <span className="fw-bold text-danger">₹{expenses?.reduce((acc, e) => acc + e.amount, 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Expense Modal */}
            {isExpenseModalOpen && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0 px-3 pt-3">
                                <h5 className="modal-title fw-bold">Add Expense</h5>
                                <button type="button" className="btn-close" onClick={() => setIsExpenseModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-3">
                                <form onSubmit={handleCreateExpense}>
                                    <div className="row g-3 mb-3">
                                        <div className="col-md-6">
                                            <label className="form-label xsmall fw-bold text-muted text-uppercase ls-1">Category</label>
                                            <select className="form-select" value={expenseForm.category} onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })} required>
                                                <option value="">Select Category</option>
                                                <option value="Rent">Rent</option>
                                                <option value="Salary">Salary</option>
                                                <option value="Utility">Utility</option>
                                                <option value="Maintenance">Maintenance</option>
                                                <option value="General">General</option>
                                            </select>
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label xsmall fw-bold text-muted text-uppercase ls-1">Amount</label>
                                            <input type="number" className="form-control" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label xsmall fw-bold text-muted text-uppercase ls-1">Description</label>
                                        <textarea className="form-control" rows="2" value={expenseForm.description} onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 py-2 shadow-sm">Save Expense</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Reports;
