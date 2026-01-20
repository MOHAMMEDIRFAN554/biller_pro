import { useState } from 'react';
import { useGetPurchasesQuery, useCreatePurchaseMutation } from '../redux/api/purchasesApiSlice';
import { useGetVendorsQuery, useCreateVendorMutation } from '../redux/api/vendorsApiSlice';
import { useGetProductsQuery } from '../redux/api/productsApiSlice';
import { useCreateLedgerPaymentMutation } from '../redux/api/ledgerApiSlice';
import { useCreatePurchaseReturnMutation } from '../redux/api/returnsApiSlice';

const Warehouse = () => {
    const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
    const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

    // Vendor Settlement State
    const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [paymentLayers, setPaymentLayers] = useState([{ mode: 'Cash', amount: 0, reference: '' }]);

    // Purchase Form State
    const [purchaseForm, setPurchaseForm] = useState({
        vendor: '',
        items: [],
        payments: [{ mode: 'Cash', amount: 0, reference: '' }]
    });
    // Temporary item state before adding to list
    const [currentItem, setCurrentItem] = useState({ product: '', quantity: '', purchasePrice: '', newSellingPrice: '' });

    // Vendor Form State
    const [vendorForm, setVendorForm] = useState({ name: '', address: '', openingBalance: '' });
    const [productKeyword, setProductKeyword] = useState('');

    // Purchase Return State
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [selectedPurchase, setSelectedPurchase] = useState(null);
    const [returnItems, setReturnItems] = useState({});
    const [refundMode, setRefundMode] = useState('Ledger');

    // RTK Queries
    const { data: purchases, isLoading: isPurchasesLoading } = useGetPurchasesQuery();
    const { data: vendors, isLoading: isVendorsLoading } = useGetVendorsQuery();
    const { data: productsData } = useGetProductsQuery({ keyword: productKeyword });

    // Mutations
    const [createPurchase, { isLoading: isCreatingPurchase }] = useCreatePurchaseMutation();
    const [createVendor] = useCreateVendorMutation();
    const [createLedgerPayment, { isLoading: isSettling }] = useCreateLedgerPaymentMutation();
    const [createPurchaseReturn] = useCreatePurchaseReturnMutation();

    const handleAddVendor = async (e) => {
        e.preventDefault();
        try {
            await createVendor(vendorForm).unwrap();
            setIsVendorModalOpen(false);
            setVendorForm({ name: '', address: '', openingBalance: '' });
        } catch (err) {
            console.error(err);
        }
    };

    const addItemToPurchase = () => {
        if (!currentItem.product || !currentItem.quantity || !currentItem.purchasePrice) return;
        const totalAmount = currentItem.quantity * currentItem.purchasePrice;
        const productDetails = productsData?.products.find(p => p._id === currentItem.product);

        const newItems = [...purchaseForm.items, { ...currentItem, totalAmount, productName: productDetails?.name }];
        const newTotal = newItems.reduce((acc, i) => acc + Number(i.totalAmount), 0);

        setPurchaseForm({
            ...purchaseForm,
            items: newItems,
            payments: [{ mode: 'Cash', amount: newTotal, reference: '' }]
        });
        setCurrentItem({ product: '', quantity: '', purchasePrice: '', newSellingPrice: '' });
    };

    const handleUpdatePurchasePayment = (idx, field, val) => {
        const newPayments = [...purchaseForm.payments];
        newPayments[idx][field] = val;
        setPurchaseForm({ ...purchaseForm, payments: newPayments });
    };

    const handleCreatePurchase = async (e) => {
        e.preventDefault();
        try {
            const totalAmount = purchaseForm.items.reduce((acc, item) => acc + Number(item.totalAmount), 0);
            await createPurchase({
                ...purchaseForm,
                totalAmount,
                payments: purchaseForm.payments.map(p => ({ ...p, amount: Number(p.amount) }))
            }).unwrap();
            setIsPurchaseModalOpen(false);
            setPurchaseForm({ vendor: '', items: [], payments: [{ mode: 'Cash', amount: 0, reference: '' }] });
        } catch (err) {
            console.error(err);
            alert(err?.data?.message || 'Failed to create purchase');
        }
    };

    // Vendor Settlement Logic
    const handleOpenSettle = (vendor) => {
        setSelectedVendor(vendor);
        setPaymentLayers([{ mode: 'Cash', amount: vendor.ledgerBalance, reference: '' }]);
        setIsSettleModalOpen(true);
    };

    const totalSettling = paymentLayers.reduce((acc, p) => acc + Number(p.amount), 0);

    const handleSettleSubmit = async () => {
        try {
            await createLedgerPayment({
                partyId: selectedVendor._id,
                partyType: 'Vendor',
                amount: selectedVendor.ledgerBalance,
                totalPaid: totalSettling,
                payments: paymentLayers.map(p => ({ ...p, amount: Number(p.amount) })),
                note: 'Vendor Balance Settlement'
            }).unwrap();

            alert('Payment Recorded');
            setIsSettleModalOpen(false);
        } catch (err) {
            alert('Payment failed');
        }
    };

    const handleReturnClick = (purchase) => {
        setSelectedPurchase(purchase);
        setReturnItems({});
        setReturnModalOpen(true);
    };

    const handleReturnSubmit = async () => {
        const itemsToReturn = Object.entries(returnItems)
            .filter(([_, qty]) => qty > 0)
            .map(([productId, qty]) => ({ productId, quantity: parseInt(qty) }));

        if (itemsToReturn.length === 0) return;

        try {
            await createPurchaseReturn({
                purchaseId: selectedPurchase._id,
                items: itemsToReturn,
                reason: 'Vendor Return'
            }).unwrap();
            alert('Purchase Return Processed');
            setReturnModalOpen(false);
        } catch (err) {
            alert('Return failed');
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Fully Settled': return 'bg-success bg-opacity-10 text-success';
            case 'Partially Settled': return 'bg-warning bg-opacity-10 text-warning';
            case 'Unsettled': return 'bg-danger bg-opacity-10 text-danger';
            default: return 'bg-light text-muted';
        }
    };

    return (
        <div className="animate-fade-in container-fluid">
            <div className="row mb-4 align-items-center">
                <div className="col-12 col-md-6">
                    <h1 className="h3 fw-bold text-dark mb-1">Warehouse & Purchases</h1>
                    <p className="text-muted small">Manage vendor relationships and inventory procurement</p>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <div className="btn-group">
                        <button
                            onClick={() => setIsVendorModalOpen(true)}
                            className="btn btn-outline-primary shadow-sm"
                        >
                            <i className="bi bi-person-plus me-2"></i> Add Vendor
                        </button>
                        <button
                            onClick={() => setIsPurchaseModalOpen(true)}
                            className="btn btn-primary shadow-sm"
                        >
                            <i className="bi bi-cart-plus me-2"></i> New Purchase
                        </button>
                    </div>
                </div>
            </div>

            <div className="row g-4 mb-4">
                {/* Vendor Balances */}
                <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="fw-bold mb-0">Vendor Ledger Balances</h5>
                        </div>
                        <div className="card-body p-0 overflow-auto" style={{ maxHeight: '400px' }}>
                            {isVendorsLoading ? <div className="p-4 text-center">Loading...</div> :
                                vendors?.length === 0 ? <div className="p-4 text-center text-muted">No vendors found</div> :
                                    <div className="list-group list-group-flush">
                                        {Array.isArray(vendors) && vendors.map(v => (
                                            <div key={v._id} className="list-group-item d-flex justify-content-between align-items-center py-3 px-4">
                                                <div>
                                                    <div className="fw-bold text-dark">{v.name}</div>
                                                    <div className="xsmall text-muted">{v.address || 'No address'}</div>
                                                </div>
                                                <div className="text-end">
                                                    <div className={`fw-bold ${v.ledgerBalance > 0 ? 'text-danger' : 'text-dark'}`}>₹{v.ledgerBalance?.toLocaleString() || '0'}</div>
                                                    {v.ledgerBalance > 0 && (
                                                        <button className="btn btn-sm btn-link p-0 text-decoration-none xsmall fw-bold" onClick={() => handleOpenSettle(v)}>Settle Now</button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                            }
                        </div>
                    </div>
                </div>

                {/* Purchase History */}
                <div className="col-12 col-xl-8">
                    <div className="card border-0 shadow-sm overflow-hidden h-100">
                        <div className="card-header bg-white border-0 py-3">
                            <h5 className="fw-bold text-dark mb-0">Recent Purchase History</h5>
                        </div>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle mb-0">
                                <thead className="table-light">
                                    <tr className="small text-uppercase text-muted">
                                        <th className="px-4 py-3">Voucher #</th>
                                        <th className="py-3">Date</th>
                                        <th className="py-3">Vendor</th>
                                        <th className="py-3">Amount</th>
                                        <th className="py-3">Balance</th>
                                        <th className="px-4 py-3 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="small">
                                    {isPurchasesLoading ? (
                                        <tr><td colSpan="6" className="p-5 text-center"><div className="spinner-border spinner-border-sm me-2 text-primary"></div></td></tr>
                                    ) : purchases?.length === 0 ? (
                                        <tr><td colSpan="6" className="p-5 text-center text-muted">No purchase records found</td></tr>
                                    ) : (
                                        purchases?.map(purchase => (
                                            <tr key={purchase._id}>
                                                <td className="px-4 py-3 fw-bold text-primary">{purchase.voucherNumber}</td>
                                                <td className="py-3 text-muted">{new Date(purchase.createdAt).toLocaleDateString()}</td>
                                                <td className="py-3 fw-medium text-dark">{purchase.vendor?.name || 'Deleted Vendor'}</td>
                                                <td className="py-3 fw-bold">₹{purchase.totalAmount.toLocaleString()}</td>
                                                <td className={`py-3 ${purchase.balanceAmount > 0 ? 'text-danger fw-bold' : 'text-muted'}`}>₹{(purchase.balanceAmount || 0).toLocaleString()}</td>
                                                <td className="px-4 py-3 text-end">
                                                    <div className="d-flex justify-content-end gap-2">
                                                        <span className={`badge rounded-pill ${getStatusBadge(purchase.status)} d-flex align-items-center`}>
                                                            {purchase.status || 'Settled'}
                                                        </span>
                                                        <button className="btn btn-sm btn-outline-secondary" onClick={() => handleReturnClick(purchase)} title="Purchase Return">
                                                            <i className="bi bi-arrow-counterclockwise"></i>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Vendor Modal */}
            {isVendorModalOpen && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered text-dark">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 px-4 pt-4">
                                <h5 className="modal-title fw-bold">Add New Vendor</h5>
                                <button type="button" className="btn-close" onClick={() => setIsVendorModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleAddVendor}>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Vendor Name*</label>
                                        <input required className="form-control" placeholder="BUSINESS NAME" value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value.toUpperCase() })} />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label small fw-bold text-muted">Address</label>
                                        <input className="form-control" placeholder="CITY, STATE" value={vendorForm.address} onChange={e => setVendorForm({ ...vendorForm, address: e.target.value.toUpperCase() })} />
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label small fw-bold text-muted">Opening Balance (₹)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0">₹</span>
                                            <input type="number" className="form-control" placeholder="0.00" value={vendorForm.openingBalance} onChange={e => setVendorForm({ ...vendorForm, openingBalance: e.target.value })} />
                                        </div>
                                    </div>
                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" onClick={() => setIsVendorModalOpen(false)} className="btn btn-light px-4">Cancel</button>
                                        <button type="submit" className="btn btn-primary px-4 shadow">Register Vendor</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Modal */}
            {isPurchaseModalOpen && (
                <div className="modal fade show d-block text-dark" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 px-4 pt-4">
                                <h5 className="modal-title fw-bold">Create Purchase Voucher</h5>
                                <button type="button" className="btn-close" onClick={() => { setIsPurchaseModalOpen(false); setProductKeyword(''); }}></button>
                            </div>
                            <div className="modal-body p-4">
                                <form onSubmit={handleCreatePurchase}>
                                    <div className="row g-3 mb-4">
                                        <div className="col-md-12">
                                            <label className="form-label small fw-bold text-muted">Select Vendor*</label>
                                            <select
                                                className="form-select"
                                                value={purchaseForm.vendor}
                                                onChange={e => setPurchaseForm({ ...purchaseForm, vendor: e.target.value })}
                                                required
                                            >
                                                <option value="">Choose a registered vendor...</option>
                                                {vendors?.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Add Item Section */}
                                    <div className="bg-light p-3 rounded-4 mb-4 border">
                                        <h6 className="fw-bold small mb-3 text-uppercase text-muted">Add Products to Purchase</h6>
                                        <div className="row g-3">
                                            <div className="col-md-12 position-relative">
                                                <label className="form-label small fw-bold">Search Product*</label>
                                                <div className="input-group">
                                                    <span className="input-group-text bg-white border-end-0"><i className="bi bi-search"></i></span>
                                                    <input
                                                        type="text"
                                                        className="form-control border-start-0"
                                                        placeholder="SEARCH BY NAME OR BARCODE..."
                                                        value={productKeyword}
                                                        onChange={(e) => setProductKeyword(e.target.value)}
                                                    />
                                                </div>
                                                {productKeyword && productsData?.products.length > 0 && (
                                                    <div className="list-group position-absolute w-100 z-3 shadow-lg mt-1 rounded-3 overflow-hidden" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                        {productsData.products.map(p => (
                                                            <button
                                                                key={p._id}
                                                                type="button"
                                                                className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                                                                onClick={() => {
                                                                    setCurrentItem({ ...currentItem, product: p._id, newSellingPrice: p.price });
                                                                    setProductKeyword(p.name);
                                                                }}
                                                            >
                                                                <span className="fw-bold small">{p.name}</span>
                                                                <span className="badge bg-primary rounded-pill xsmall">Stock: {p.stock}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Quantity</label>
                                                <input type="number" placeholder="0" className="form-control" value={currentItem.quantity} onChange={e => setCurrentItem({ ...currentItem, quantity: e.target.value })} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">Purchase Price (₹)</label>
                                                <input type="number" placeholder="0.00" className="form-control" value={currentItem.purchasePrice} onChange={e => setCurrentItem({ ...currentItem, purchasePrice: e.target.value })} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label small fw-bold">New Sale Price (Opt)</label>
                                                <input type="number" placeholder="Optional" className="form-control text-primary fw-bold" value={currentItem.newSellingPrice} onChange={e => setCurrentItem({ ...currentItem, newSellingPrice: e.target.value })} />
                                            </div>
                                            <div className="col-md-3">
                                                <label className="form-label d-block small fw-bold opacity-0">Action</label>
                                                <button type="button" onClick={() => { addItemToPurchase(); setProductKeyword(''); }} className="btn btn-dark w-100 fw-bold">Add Item</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Items List */}
                                    <div className="border rounded-3 p-3 mb-4 bg-white" style={{ minHeight: '100px' }}>
                                        {purchaseForm.items.length === 0 ? (
                                            <div className="text-center text-muted small py-4">No products added yet.</div>
                                        ) : (
                                            <>
                                                <div className="table-responsive">
                                                    <table className="table table-sm table-borderless align-middle mb-0">
                                                        <thead>
                                                            <tr className="small text-muted border-bottom">
                                                                <th>Product</th>
                                                                <th className="text-center">Qty</th>
                                                                <th className="text-end">Unit Cost</th>
                                                                <th className="text-end">Total</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {purchaseForm.items.map((item, idx) => (
                                                                <tr key={idx} className="small">
                                                                    <td className="fw-medium">{item.productName}</td>
                                                                    <td className="text-center">{item.quantity}</td>
                                                                    <td className="text-end">₹{item.purchasePrice}</td>
                                                                    <td className="text-end fw-bold">₹{item.totalAmount}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                                                    <h6 className="fw-bold mb-0">Grand Total:</h6>
                                                    <h5 className="fw-bold text-primary mb-0">₹{purchaseForm.items.reduce((acc, i) => acc + Number(i.totalAmount), 0)}</h5>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Purchase Payments */}
                                    {purchaseForm.items.length > 0 && (
                                        <div className="mb-4">
                                            <p className="small fw-bold text-muted text-uppercase mb-2">Payment Details</p>
                                            {purchaseForm.payments.map((p, idx) => (
                                                <div key={idx} className="row g-2 mb-2">
                                                    <div className="col-md-5">
                                                        <select className="form-select form-select-sm" value={p.mode} onChange={e => handleUpdatePurchasePayment(idx, 'mode', e.target.value)}>
                                                            <option value="Cash">Cash</option>
                                                            <option value="UPI">UPI</option>
                                                            <option value="Bank">Bank Transfer</option>
                                                            <option value="Credit">Ledger Credit</option>
                                                        </select>
                                                    </div>
                                                    <div className="col-md-5">
                                                        <input type="number" className="form-control form-control-sm" value={p.amount} onChange={e => handleUpdatePurchasePayment(idx, 'amount', e.target.value)} />
                                                    </div>
                                                    <div className="col-md-2">
                                                        <button
                                                            type="button"
                                                            className="btn btn-sm btn-outline-primary w-100"
                                                            onClick={() => setPurchaseForm({ ...purchaseForm, payments: [...purchaseForm.payments, { mode: 'Credit', amount: 0 }] })}
                                                        >
                                                            <i className="bi bi-plus"></i>
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="d-flex justify-content-end gap-2">
                                        <button type="button" onClick={() => { setIsPurchaseModalOpen(false); setProductKeyword(''); }} className="btn btn-light px-4">Cancel</button>
                                        <button type="submit" className="btn btn-primary px-5 shadow" disabled={isCreatingPurchase || purchaseForm.items.length === 0 || !purchaseForm.vendor}>
                                            {isCreatingPurchase ? 'Creating...' : 'Register Purchase'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Vendor Settlement Modal */}
            {isSettleModalOpen && selectedVendor && (
                <div className="modal fade show d-block text-dark" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 px-4 pt-4">
                                <h5 className="modal-title fw-bold">Pay Vendor - {selectedVendor.name}</h5>
                                <button type="button" className="btn-close" onClick={() => setIsSettleModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="card bg-primary bg-opacity-10 border-0 p-3 mb-4 rounded-3 text-center">
                                    <p className="xsmall fw-bold text-primary text-uppercase mb-1">Pending Balance</p>
                                    <h3 className="fw-bold text-primary mb-0">₹{selectedVendor.ledgerBalance}</h3>
                                </div>

                                <p className="small fw-bold text-muted text-uppercase mb-3">Payment Sources</p>
                                {paymentLayers.map((layer, idx) => (
                                    <div key={idx} className="card border-0 bg-light p-3 mb-2">
                                        <div className="row g-2 align-items-center">
                                            <div className="col-5">
                                                <select className="form-select form-select-sm" value={layer.mode} onChange={e => {
                                                    const newLayers = [...paymentLayers];
                                                    newLayers[idx].mode = e.target.value;
                                                    setPaymentLayers(newLayers);
                                                }}>
                                                    <option value="Cash">Cash</option>
                                                    <option value="UPI">UPI</option>
                                                    <option value="Bank">Bank Transfer</option>
                                                </select>
                                            </div>
                                            <div className="col-7">
                                                <input type="number" className="form-control form-control-sm" value={layer.amount} onChange={e => {
                                                    const newLayers = [...paymentLayers];
                                                    newLayers[idx].amount = e.target.value;
                                                    setPaymentLayers(newLayers);
                                                }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    className="btn btn-primary w-100 py-3 fw-bold shadow mt-4"
                                    onClick={handleSettleSubmit}
                                    disabled={isSettling}
                                >
                                    {isSettling ? 'Processing...' : 'Complete Payment'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Purchase Return Modal */}
            {returnModalOpen && selectedPurchase && (
                <div className="modal fade show d-block text-dark" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0 px-4 pt-4">
                                <h5 className="modal-title fw-bold">Purchase Return - {selectedPurchase.voucherNumber}</h5>
                                <button type="button" className="btn-close" onClick={() => setReturnModalOpen(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="list-group list-group-flush mb-4 border rounded">
                                    {selectedPurchase.items.map(item => (
                                        <div key={item._id} className="list-group-item p-3">
                                            <div className="row align-items-center">
                                                <div className="col">
                                                    <div className="fw-bold">{item.product?.name || 'Product'}</div>
                                                    <div className="xsmall text-muted">Bought: {item.quantity} @ ₹{item.purchasePrice}</div>
                                                </div>
                                                <div className="col-auto">
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        style={{ width: '80px' }}
                                                        placeholder="Qty"
                                                        value={returnItems[item.product._id] || 0}
                                                        onChange={e => setReturnItems({ ...returnItems, [item.product._id]: Math.min(parseInt(e.target.value) || 0, item.quantity) })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <button className="btn btn-danger w-100 py-3 fw-bold shadow" onClick={handleReturnSubmit}>Confirm Return to Vendor</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Warehouse;
