import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetCustomerByIdQuery } from '../redux/api/customersApiSlice';
import { useCreateLedgerPaymentMutation } from '../redux/api/ledgerApiSlice';

const CustomerReceipt = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: customer, isLoading: customerLoading } = useGetCustomerByIdQuery(id);
    const [createLedgerPayment, { isLoading: isCreating }] = useCreateLedgerPaymentMutation();

    const [paymentLayers, setPaymentLayers] = useState([{ mode: 'Cash', amount: 0, reference: '' }]);
    const [discount, setDiscount] = useState('');
    const [note, setNote] = useState('Payment Received');

    useEffect(() => {
        if (customer) {
            setPaymentLayers([{ mode: 'Cash', amount: customer.ledgerBalance > 0 ? customer.ledgerBalance : 0, reference: '' }]);
        }
    }, [customer]);

    const handleAddMode = () => {
        setPaymentLayers([...paymentLayers, { mode: 'UPI', amount: 0, reference: '' }]);
    };

    const handleRemoveMode = (idx) => {
        setPaymentLayers(paymentLayers.filter((_, i) => i !== idx));
    };

    const handleUpdateMode = (idx, field, val) => {
        const newLayers = [...paymentLayers];
        newLayers[idx][field] = val;
        setPaymentLayers(newLayers);
    };

    const totalPaid = paymentLayers.reduce((acc, p) => acc + Number(p.amount), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (totalPaid <= 0) {
            alert('Amount must be greater than zero');
            return;
        }

        try {
            const res = await createLedgerPayment({
                partyId: customer._id,
                partyType: 'Customer',
                amount: customer.ledgerBalance,
                totalPaid,
                payments: paymentLayers.map(p => ({ ...p, amount: Number(p.amount) })),
                discount: discount ? Number(discount) : 0,
                note
            }).unwrap();

            alert('Receipt Recorded Successfully');
            // Navigate back or to print?
            if (window.confirm('Do you want to print the receipt?')) {
                window.open(`/print/receipt/${res._id}`, '_blank');
            }
            navigate(`/customers/ledger/${id}`);
        } catch (err) {
            alert(err?.data?.message || 'Failed to record payment');
        }
    };

    if (customerLoading) return <div className="p-5 text-center">Loading...</div>;

    return (
        <div className="container-fluid animate-fade-in">
            <div className="row mb-4 align-items-center">
                <div className="col">
                    <button onClick={() => navigate(`/customers/ledger/${id}`)} className="btn btn-link text-decoration-none p-0 mb-2">
                        <i className="bi bi-arrow-left me-1"></i> Back to History
                    </button>
                    <h1 className="h3 fw-bold text-dark">Customer Receipt</h1>
                    <p className="text-muted small">Record payment from {customer?.name}</p>
                </div>
            </div>

            <div className="row g-4">
                <div className="col-12 col-xl-4">
                    <div className="card bg-primary bg-opacity-10 border-0 p-5 rounded-4 text-center shadow-sm">
                        <p className="text-uppercase xsmall fw-bold text-primary mb-2">Total Outstanding</p>
                        <h1 className="fw-bold text-primary mb-0">₹{customer?.ledgerBalance?.toLocaleString()}</h1>
                    </div>

                    <div className="card border-0 shadow-sm mt-4">
                        <div className="card-body">
                            <h6 className="fw-bold mb-3">Receipt Summary</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Amount Paying</span>
                                <span className="fw-bold text-success">₹{totalPaid.toLocaleString()}</span>
                            </div>
                            {Number(discount) > 0 && (
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted small">Discount Given</span>
                                    <span className="fw-bold text-success">₹{Number(discount).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="d-flex justify-content-between pt-2 border-top">
                                <span className="text-muted small">Balance Remaining</span>
                                <span className="fw-bold text-danger">₹{(customer?.ledgerBalance - totalPaid - (Number(discount) || 0)).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-8">
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="card-body p-4">
                            <form onSubmit={handleSubmit}>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h5 className="fw-bold text-dark mb-0">Payment Sources</h5>
                                    <button type="button" onClick={handleAddMode} className="btn btn-sm btn-outline-primary">
                                        <i className="bi bi-plus-circle me-1"></i> Add Split Payment
                                    </button>
                                </div>

                                <div className="payment-stack">
                                    {paymentLayers.map((p, idx) => (
                                        <div key={idx} className="card border-0 bg-light p-3 mb-3 rounded-3 position-relative">
                                            {paymentLayers.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveMode(idx)}
                                                    className="btn-close position-absolute top-0 end-0 m-2"
                                                    style={{ fontSize: '0.6rem' }}
                                                ></button>
                                            )}
                                            <div className="row g-3">
                                                <div className="col-md-5">
                                                    <label className="xsmall fw-bold text-muted mb-1">Mode</label>
                                                    <select
                                                        className="form-select border-0 bg-white"
                                                        value={p.mode}
                                                        onChange={(e) => handleUpdateMode(idx, 'mode', e.target.value)}
                                                    >
                                                        <option value="Cash">Cash</option>
                                                        <option value="UPI">UPI</option>
                                                        <option value="Bank">Bank Transfer</option>
                                                        <option value="Card">Card</option>
                                                    </select>
                                                </div>
                                                <div className="col-md-7">
                                                    <label className="xsmall fw-bold text-muted mb-1">Amount (₹)</label>
                                                    <input
                                                        type="number"
                                                        className="form-control border-0 bg-white fw-bold"
                                                        value={p.amount}
                                                        onChange={(e) => handleUpdateMode(idx, 'amount', e.target.value)}
                                                    />
                                                </div>
                                                {(p.mode === 'UPI' || p.mode === 'Bank' || p.mode === 'Card') && (
                                                    <div className="col-12 mt-0">
                                                        <input
                                                            className="form-control border-0 bg-white small"
                                                            placeholder="Reference (Txn ID, Cheque No, etc.)"
                                                            value={p.reference}
                                                            onChange={(e) => handleUpdateMode(idx, 'reference', e.target.value)}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mb-3">
                                    <label className="xsmall fw-bold text-muted mb-1">Discount / Rebate (₹)</label>
                                    <input
                                        type="number"
                                        className="form-control border-0 bg-light fw-bold text-success"
                                        placeholder="0"
                                        value={discount}
                                        onChange={(e) => setDiscount(e.target.value)}
                                    />
                                    <div className="form-text xsmall">Check this if you are giving a discount on the outstanding balance.</div>
                                </div>

                                <div className="mt-4">
                                    <label className="form-label xsmall fw-bold text-muted">Internal Note / Remarks</label>
                                    <textarea
                                        className="form-control bg-light border-0"
                                        rows="2"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isCreating || totalPaid <= 0}
                                    className="btn btn-primary w-100 py-3 fw-bold shadow mt-4 fs-5"
                                >
                                    {isCreating ? 'Processing...' : 'Record & Generate Receipt'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomerReceipt;
