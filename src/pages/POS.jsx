import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGetProductsQuery } from '../redux/api/productsApiSlice';
import { useGetCustomersQuery } from '../redux/api/customersApiSlice';
import { useCreateBillMutation } from '../redux/api/billsApiSlice';
import { addToCart, updateCartQty, removeFromCart, updateCartDiscount, setGlobalDiscount, setCustomer, clearCart } from '../redux/slices/cartSlice';

const POS = () => {
    const dispatch = useDispatch();
    const { cartItems, customer, discount: globalDiscount } = useSelector((state) => state.cart);
    const [keyword, setKeyword] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [showSettlement, setShowSettlement] = useState(false);

    // Settlement State
    const [payments, setPayments] = useState([{ mode: 'Cash', amount: 0, reference: '' }]);
    const [overpaymentAction, setOverpaymentAction] = useState('return'); // 'return', 'ledger'
    const [lastBillId, setLastBillId] = useState(null);
    const [showSuccess, setShowSuccess] = useState(false);

    const { data: productsData } = useGetProductsQuery({ keyword, limit: 100 });
    const { data: customersData } = useGetCustomersQuery({ keyword: customerSearch });
    const [createBill, { isLoading: isCreating }] = useCreateBillMutation();

    const calculateTotals = () => {
        let totalTax = 0;
        let totalBase = 0;
        let totalItemDiscount = 0;

        cartItems.forEach(item => {
            const price = item.price || 0;
            const qty = item.quantity || 0;
            const lineTotalBeforeDiscount = price * qty;
            const lineDiscount = (item.itemDiscount || 0) * qty;
            const netLineTotal = lineTotalBeforeDiscount - lineDiscount;

            totalItemDiscount += lineDiscount;

            const basePrice = (price - (item.itemDiscount || 0)) / (1 + (item.gstRate / 100));
            const taxPerUnit = (price - (item.itemDiscount || 0)) - basePrice;

            totalBase += basePrice * qty;
            totalTax += taxPerUnit * qty;
        });

        const cartTotal = cartItems.reduce((acc, item) => acc + ((item.price || 0) * (item.quantity || 0)) - ((item.itemDiscount || 0) * (item.quantity || 0)), 0);
        const finalTotalRaw = cartTotal - globalDiscount;
        const totalDiscount = totalItemDiscount + globalDiscount;

        return {
            totalTax,
            totalDiscount,
            grandTotal: Math.round(finalTotalRaw),
            roundOff: Math.round(finalTotalRaw) - finalTotalRaw
        };
    };

    const { totalTax, totalDiscount, grandTotal, roundOff } = calculateTotals();

    useEffect(() => {
        if (showSettlement) {
            setPayments([{ mode: 'Cash', amount: grandTotal, reference: '' }]);
            setOverpaymentAction('return');
        }
    }, [showSettlement, grandTotal]);

    const totalPaid = payments.reduce((acc, p) => acc + (p.mode === 'Credit' ? 0 : Number(p.amount)), 0);
    const balance = grandTotal - totalPaid;

    const handleAddPayment = () => {
        if (balance > 0) {
            setPayments([...payments, { mode: 'UPI', amount: balance, reference: '' }]);
        }
    };

    const handleRemovePayment = (index) => {
        const newPayments = payments.filter((_, i) => i !== index);
        setPayments(newPayments);
    };

    const handleUpdatePayment = (index, field, value) => {
        const newPayments = [...payments];
        newPayments[index][field] = value;
        setPayments(newPayments);
    };

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        if ((balance > 0 || payments.some(p => p.mode === 'Credit')) && !customer) {
            alert('A registered customer is required for transactions with remaining balance or credit.');
            return;
        }

        const billData = {
            customer: customer?._id || null,
            items: cartItems.map(item => ({
                product: item.product,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                gstRate: item.gstRate,
                discountAmount: (item.itemDiscount || 0) * item.quantity,
                totalAmount: (item.price * item.quantity) - ((item.itemDiscount || 0) * item.quantity)
            })),
            subTotal: grandTotal + totalDiscount - totalTax,
            taxAmount: totalTax,
            discountAmount: globalDiscount,
            totalDiscount: totalDiscount,
            grandTotal: grandTotal,
            roundOff: roundOff,
            payments: payments.map(p => ({ ...p, amount: Number(p.amount) })),
            overpaymentAction
        };

        try {
            const res = await createBill(billData).unwrap();
            setLastBillId(res._id);
            setShowSuccess(true);
            setShowSettlement(false);
            dispatch(clearCart());
        } catch (err) {
            console.error(err);
            alert(err?.data?.message || 'Billing Failed');
        }
    };

    const handleReset = () => {
        setShowSuccess(false);
        setLastBillId(null);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (!keyword) return;

            // Allow exact match search
            // If the query is just finished, productsData should contain the filtered item
            const exactMatch = productsData?.products?.find(
                p => p.barcode === keyword || p.name.toLowerCase() === keyword.toLowerCase()
            );

            if (exactMatch) {
                // Check Stock
                if (exactMatch.stock <= 0) {
                    alert('Negative stock billing is not available!');
                    setKeyword('');
                    return;
                }
                const inCart = cartItems.find(x => x.product === exactMatch._id);
                if (inCart && (inCart.quantity + 1 > exactMatch.stock)) {
                    alert('Insufficient stock!');
                    setKeyword('');
                    return;
                }

                dispatch(addToCart({ ...exactMatch, product: exactMatch._id }));
                setKeyword('');
            }
        }
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 992);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 992);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="row g-4 animate-fade-in" style={{
            height: isMobile ? 'auto' : 'calc(100vh - 120px)',
            overflow: isMobile ? 'visible' : 'hidden',
            paddingBottom: isMobile ? '80px' : '0' // Extra padding for mobile scrolling
        }}>
            {/* Left: Products */}
            <div className="col-12 col-lg-8 d-flex flex-column h-100">
                <div className="input-group mb-4 shadow-sm">
                    <span className="input-group-text bg-white border-end-0">
                        <i className="bi bi-search text-muted"></i>
                    </span>
                    <input
                        className="form-control border-start-0 ps-0"
                        placeholder="Search Products by name or barcode..."
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                    />
                </div>

                <div className="row g-3 overflow-auto flex-grow-1 pe-2 pb-2" style={{ maxHeight: isMobile ? '60vh' : '100%' }}>
                    {productsData?.products?.map(product => (
                        <div key={product._id} className="col-6 col-md-4 col-xl-3">
                            <div
                                className={`card h-100 border-0 shadow-sm cursor-pointer hover-border-primary transition-all position-relative ${product.stock <= 0 ? 'opacity-50' : ''}`}
                                onClick={() => {
                                    if (product.stock <= 0) {
                                        alert('Negative stock billing is not available!');
                                        return;
                                    }
                                    const inCart = cartItems.find(x => x.product === product._id);
                                    if (inCart && (inCart.quantity + 1 > product.stock)) {
                                        alert('Insufficient stock!');
                                        return;
                                    }
                                    dispatch(addToCart({ ...product, product: product._id }));
                                }}
                            >
                                <div className="card-body d-flex flex-column">
                                    <h6 className="fw-bold text-dark text-truncate mb-1" title={product.name}>{product.name}</h6>
                                    <span className="badge bg-light text-muted fw-normal align-self-start mb-2">Stock: {product.stock}</span>
                                    <div className="mt-auto d-flex justify-content-between align-items-center">
                                        <span className="fw-bold text-primary">₹{product.price}</span>
                                        <div className="btn btn-sm btn-primary rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px' }}>
                                            <i className="bi bi-plus fs-5"></i>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Cart */}
            <div className="col-12 col-lg-4 d-flex flex-column h-100">
                <div className="card border-0 shadow flex-grow-1 overflow-hidden" style={{ height: '100%' }}>
                    <div className="card-header bg-white py-3 border-0">
                        <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                            <i className="bi bi-cart3 text-primary"></i> Current Cart
                        </h5>

                        {/* Customer Info */}
                        {customer ? (
                            <div className="alert alert-primary py-2 px-3 d-flex justify-content-between align-items-center mb-0 border-0 rounded-3">
                                <div>
                                    <p className="small fw-bold mb-0 text-truncate"><i className="bi bi-person-fill me-1"></i> {customer.name}</p>
                                    <p className="xsmall mb-0 opacity-75">Balance: ₹{customer.ledgerBalance || 0}</p>
                                </div>
                                <button className="btn-close small" onClick={() => dispatch(setCustomer(null))} style={{ fontSize: '0.6rem' }}></button>
                            </div>
                        ) : (
                            <div className="position-relative">
                                <span className="position-absolute translate-middle-y top-50 start-0 ps-3">
                                    <i className="bi bi-person text-muted"></i>
                                </span>
                                <input
                                    className="form-control form-control-sm ps-5 bg-light border-0 py-2 rounded-3"
                                    placeholder="Select Customer (Optional)"
                                    value={customerSearch}
                                    onChange={(e) => setCustomerSearch(e.target.value)}
                                />
                                {customerSearch && customersData?.customers?.length > 0 && (
                                    <div className="list-group position-absolute w-100 z-3 shadow-lg mt-1 rounded-3 overflow-hidden">
                                        {customersData?.customers?.map(c => (
                                            <button
                                                key={c._id}
                                                className="list-group-item list-group-item-action small py-2"
                                                onClick={() => {
                                                    dispatch(setCustomer(c));
                                                    setCustomerSearch('');
                                                }}
                                            >
                                                {c.name} <span className="text-muted">({c.phone})</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="card-body overflow-auto p-4 flex-grow-1" style={{ minHeight: 0 }}>
                        {cartItems.length === 0 ? (
                            <div className="text-center text-muted py-5 mt-4">
                                <i className="bi bi-cart-x fs-1 opacity-25 d-block mb-2"></i>
                                <p className="mb-0">Cart is empty</p>
                            </div>
                        ) : (
                            <div className="d-flex flex-column gap-3">
                                {cartItems.map((item, index) => (
                                    <div key={index} className="d-flex flex-column border-bottom pb-3">
                                        <div className="d-flex align-items-center justify-content-between mb-2">
                                            <div className="flex-grow-1 overflow-hidden me-2">
                                                <p className="fw-bold small text-dark mb-0 text-truncate">{item.name}</p>
                                                <span className="xsmall text-muted">₹{item.price || 0} x {item.quantity || 0}</span>
                                            </div>
                                            <div className="d-flex align-items-center gap-2">
                                                <input
                                                    type="number"
                                                    className="form-control form-control-sm text-center bg-light border-0"
                                                    style={{ width: '50px' }}
                                                    value={item.quantity}
                                                    onChange={(e) => {
                                                        const val = parseFloat(e.target.value);
                                                        if (val > item.stock) {
                                                            alert('Cannot exceed available stock!');
                                                            return;
                                                        }
                                                        dispatch(updateCartQty({ product: item.product, quantity: e.target.value }))
                                                    }}
                                                />
                                                <span className="fw-bold small" style={{ minWidth: '60px', textAlign: 'right' }}>₹{((item.price || 0) * (item.quantity || 0)).toFixed(0)}</span>
                                                <button
                                                    onClick={() => dispatch(removeFromCart(item.product))}
                                                    className="btn btn-sm btn-link text-danger p-0 ms-1"
                                                >
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div className="d-flex align-items-center gap-2 xsmall">
                                            <span className="text-muted">Discount (Per Unit):</span>
                                            <input
                                                type="number"
                                                className="form-control form-control-sm bg-light border-0 py-0"
                                                style={{ width: '60px', fontSize: '0.7rem' }}
                                                placeholder="0.00"
                                                value={item.itemDiscount || ''}
                                                onChange={(e) => dispatch(updateCartDiscount({ product: item.product, discount: e.target.value }))}
                                            />
                                            {item.itemDiscount > 0 && <span className="text-success fw-bold">-₹{item.itemDiscount * item.quantity}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card-footer bg-white border-0 p-4 pt-0">
                        <div className="border-top pt-3 mb-4 mt-2">
                            <div className="d-flex justify-content-between small text-muted mb-1">
                                <span>Subtotal</span>
                                <span>₹{(grandTotal + totalDiscount - totalTax).toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between small text-muted mb-1">
                                <span>Total Discount</span>
                                <span className="text-success fw-bold">-₹{totalDiscount.toFixed(2)}</span>
                            </div>
                            <div className="d-flex justify-content-between small text-muted mb-1">
                                <span>Tax Amount</span>
                                <span>₹{totalTax.toFixed(2)}</span>
                            </div>

                            <div className="d-flex justify-content-between align-items-center border-top border-bottom py-2 my-2">
                                <span className="xsmall fw-bold text-muted text-uppercase">Extra Discount</span>
                                <div className="input-group input-group-sm" style={{ width: '100px' }}>
                                    <span className="input-group-text bg-light border-0">₹</span>
                                    <input
                                        type="number"
                                        className="form-control bg-light border-0 fw-bold"
                                        value={globalDiscount || ''}
                                        onChange={(e) => dispatch(setGlobalDiscount(e.target.value))}
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center pt-1">
                                <span className="h5 fw-bold mb-0 text-dark">Grand Total</span>
                                <span className="h4 fw-bold mb-0 text-primary">₹{grandTotal}</span>
                            </div>
                        </div>

                        <button
                            onClick={() => setShowSettlement(true)}
                            disabled={cartItems.length === 0}
                            className="btn btn-primary w-100 py-3 fw-bold fs-5 shadow"
                        >
                            Proceed to Pay
                        </button>
                    </div>
                </div>
            </div>

            {/* Settlement Modal */}
            {showSettlement && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">Settlement Details</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSettlement(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row">
                                    <div className="col-md-5">
                                        <div className="card bg-primary bg-opacity-10 border-0 p-4 rounded-4 text-center mb-3">
                                            <p className="text-uppercase xsmall fw-bold text-primary mb-1">Grand Total</p>
                                            <h1 className="fw-bold text-primary mb-0">₹{grandTotal}</h1>
                                        </div>
                                        <div className="card border-0 bg-light p-3 rounded-4 mb-3">
                                            <div className="d-flex justify-content-between mb-2">
                                                <span className="small text-muted">Paid</span>
                                                <span className="small fw-bold text-success">₹{totalPaid}</span>
                                            </div>
                                            <div className="d-flex justify-content-between align-items-center">
                                                <span className="small text-muted">{balance >= 0 ? 'Remaining' : 'Excess Amount'}</span>
                                                <span className={`small fw-bold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
                                                    ₹{Math.abs(balance)}
                                                </span>
                                            </div>

                                            {/* Overpayment Options */}
                                            {balance < 0 && (
                                                <div className="mt-3 pt-3 border-top">
                                                    <p className="xsmall fw-bold text-muted text-uppercase mb-2">Action for Excess ₹{Math.abs(balance)}</p>
                                                    {customer ? (
                                                        <div className="d-flex gap-2">
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="overaction" id="retCash"
                                                                    checked={overpaymentAction === 'return'} onChange={() => setOverpaymentAction('return')} />
                                                                <label className="form-check-label small" htmlFor="retCash">Return Cash</label>
                                                            </div>
                                                            <div className="form-check">
                                                                <input className="form-check-input" type="radio" name="overaction" id="addLedger"
                                                                    checked={overpaymentAction === 'ledger'} onChange={() => setOverpaymentAction('ledger')} />
                                                                <label className="form-check-label small" htmlFor="addLedger">Add to Ledger</label>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="alert alert-warning py-1 px-2 small mb-0 d-flex align-items-center">
                                                            <i className="bi bi-arrow-return-left me-2"></i> Return Change (No Customer)
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4">
                                            <p className="small fw-bold text-muted text-uppercase mb-2">Quick Shortcuts</p>
                                            <div className="d-flex flex-wrap gap-2">
                                                {['Cash', 'UPI', 'Card', 'Credit'].map(mode => (
                                                    <button
                                                        key={mode}
                                                        className="btn btn-sm btn-outline-primary fw-bold"
                                                        onClick={() => setPayments([{ mode, amount: grandTotal, reference: '' }])}
                                                    >
                                                        Pay Full {mode}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-7">
                                        <p className="small fw-bold text-muted text-uppercase mb-3 d-flex justify-content-between">
                                            Payments
                                            <button className="btn btn-sm btn-link p-0 text-decoration-none" onClick={handleAddPayment}>
                                                <i className="bi bi-plus-circle-fill me-1"></i> Add Split
                                            </button>
                                        </p>
                                        <div className="payment-list overflow-auto pe-2" style={{ maxHeight: '300px' }}>
                                            {payments.map((p, idx) => (
                                                <div key={idx} className="card border-0 bg-light p-3 mb-2 rounded-3 shadow-sm border-start border-4 border-primary">
                                                    <div className="row g-2">
                                                        <div className="col-5">
                                                            <select
                                                                className="form-select form-select-sm border-0 bg-white"
                                                                value={p.mode}
                                                                onChange={(e) => handleUpdatePayment(idx, 'mode', e.target.value)}
                                                            >
                                                                <option value="Cash">Cash</option>
                                                                <option value="UPI">UPI</option>
                                                                <option value="Card">Card</option>
                                                                <option value="Credit">Credit/Pending</option>
                                                            </select>
                                                        </div>
                                                        <div className="col-5">
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm border-0 bg-white"
                                                                value={p.amount}
                                                                onChange={(e) => handleUpdatePayment(idx, 'amount', e.target.value)}
                                                            />
                                                        </div>
                                                        <div className="col-2 text-end">
                                                            <button className="btn btn-sm btn-link text-danger p-0" onClick={() => handleRemovePayment(idx)} disabled={payments.length === 1}>
                                                                <i className="bi bi-x-circle"></i>
                                                            </button>
                                                        </div>
                                                        {(p.mode === 'UPI' || p.mode === 'Card') && (
                                                            <div className="col-12 mt-2">
                                                                <input
                                                                    className="form-control form-control-sm border-0 bg-white"
                                                                    placeholder="Txn Reference ID (optional)"
                                                                    value={p.reference}
                                                                    onChange={(e) => handleUpdatePayment(idx, 'reference', e.target.value)}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={handleCheckout}
                                            disabled={isCreating}
                                            className="btn btn-primary w-100 py-3 fw-bold fs-5 mt-4 shadow d-flex align-items-center justify-content-center gap-2"
                                        >
                                            {isCreating ? <span className="spinner-border spinner-border-sm"></span> : <><i className="bi bi-check-circle-fill"></i> Complete Sale</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1060 }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg text-center p-5 rounded-5">
                            <div className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '100px', height: '100px' }}>
                                <i className="bi bi-check-circle-fill" style={{ fontSize: '3.5rem' }}></i>
                            </div>
                            <h2 className="fw-bold mb-2">Payment Successful!</h2>
                            <p className="text-muted mb-4 px-4">The transaction has been successfully recorded and stock has been updated.</p>

                            <div className="d-grid gap-3">
                                <a
                                    href={`/#/print/bill/${lastBillId}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-primary py-3 fw-bold fs-5 shadow-sm d-flex align-items-center justify-content-center gap-2"
                                >
                                    <i className="bi bi-printer-fill"></i> Print Bill Now
                                </a>
                                <button
                                    onClick={handleReset}
                                    className="btn btn-outline-dark py-3 fw-bold"
                                >
                                    New Transaction
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default POS;
