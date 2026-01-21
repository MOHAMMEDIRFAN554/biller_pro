import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useGetLedgerPaymentByIdQuery } from '../redux/api/ledgerApiSlice';
import { useGetCompanyProfileQuery } from '../redux/api/settingsApiSlice';

const PrintReceipt = () => {
    const { id } = useParams();
    const { data: payment, isLoading } = useGetLedgerPaymentByIdQuery(id);
    const { data: profile } = useGetCompanyProfileQuery();
    const [printMode, setPrintMode] = useState('thermal'); // thermal, a4

    useEffect(() => {
        if (payment && profile) {
            // Uncomment to auto-print
            // window.print();
        }
    }, [payment, profile]);

    if (isLoading || !payment) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3"></div>
                <p className="text-muted fw-bold">Fetching receipt data...</p>
            </div>
        </div>
    );

    const handlePrint = () => {
        window.print();
    };

    const party = payment.partyId;

    return (
        <div className="bg-light min-vh-100 py-5 d-print-none overflow-auto">
            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="btn-group">
                        <button
                            className={`btn ${printMode === 'thermal' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setPrintMode('thermal')}
                        >
                            80mm Thermal
                        </button>
                        <button
                            className={`btn ${printMode === 'a4' ? 'btn-primary' : 'btn-outline-primary'}`}
                            onClick={() => setPrintMode('a4')}
                        >
                            A4 Paper
                        </button>
                    </div>
                    <button className="btn btn-dark px-4 shadow-sm" onClick={handlePrint}>
                        <i className="bi bi-printer me-2"></i> Print Receipt
                    </button>
                </div>

                {/* THERMAL TEMPLATE */}
                {printMode === 'thermal' && (
                    <div className="bg-white mx-auto shadow-sm p-3" style={{ width: '80mm', minHeight: '100mm', color: '#000', fontFamily: 'monospace' }}>
                        <div className="text-center mb-2">
                            <h4 className="fw-bold mb-1 text-uppercase">{profile?.name || 'BILLING STORE'}</h4>
                            <p className="small mb-0" style={{ fontSize: '10px' }}>{profile?.address}</p>
                            <p className="small mb-0" style={{ fontSize: '10px' }}>Phone: {profile?.phone}</p>
                        </div>

                        <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>
                        <h6 className="text-center fw-bold text-uppercase my-2">Payment Receipt</h6>
                        <div style={{ borderTop: '1px dashed #000', margin: '5px 0' }}></div>

                        <div className="small mb-2" style={{ fontSize: '11px' }}>
                            <div className="d-flex justify-content-between">
                                <span>No: {payment.paymentNumber}</span>
                                <span>Date: {new Date(payment.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-1">Party: <strong>{party?.name}</strong></div>
                            <div>Phone: {party?.phone}</div>
                        </div>

                        <div style={{ borderTop: '1px solid #000', margin: '5px 0' }}></div>

                        <div className="my-3">
                            <div className="d-flex justify-content-between">
                                <span>Amount Received:</span>
                                <span className="fw-bold">₹{payment.totalPaid || 0}</span>
                            </div>
                            {(payment.payments || []).map((p, i) => (
                                <div key={i} className="d-flex justify-content-between xsmall opacity-75" style={{ fontSize: '10px' }}>
                                    <span>- {p.mode} {p.reference ? `(${p.reference})` : ''}</span>
                                    <span>₹{p.amount || 0}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 p-2 bg-light text-center" style={{ fontSize: '10px' }}>
                            Note: {payment.note || 'Thank you!'}
                        </div>

                        <div className="mt-4 text-center pb-3" style={{ fontSize: '10px' }}>
                            <p className="mb-0">This is a system generated document.</p>
                        </div>
                    </div>
                )}

                {/* A4 TEMPLATE */}
                {printMode === 'a4' && (
                    <div className="bg-white shadow-sm p-5 mx-auto" style={{ width: '210mm', minHeight: '148mm', color: '#333' }}>
                        <div className="row mb-5">
                            <div className="col-6">
                                <h2 className="fw-bold text-primary mb-1">{profile?.name}</h2>
                                <p className="text-muted small mb-0" style={{ whiteSpace: 'pre-line' }}>{profile?.address}</p>
                                <p className="text-muted small">Ph: {profile?.phone}</p>
                            </div>
                            <div className="col-6 text-end">
                                <h1 className="display-6 fw-bold text-muted text-uppercase mb-0">Receipt</h1>
                                <p className="lead mb-0">#{payment.paymentNumber}</p>
                                <p className="text-muted">Date: {new Date(payment.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="row mb-5">
                            <div className="col-6">
                                <p className="text-uppercase xsmall fw-bold text-muted mb-2">Received From</p>
                                <h5 className="fw-bold mb-1">{party?.name}</h5>
                                <p className="text-muted mb-0">{party?.phone}</p>
                                <p className="text-muted small">{party?.address}</p>
                            </div>
                        </div>

                        <div className="card border-0 bg-light p-4 mb-5">
                            <div className="row align-items-center">
                                <div className="col-8">
                                    <h4 className="mb-0 fw-bold">Amount Received ({(payment.payments || []).map(p => p.mode).join(', ')})</h4>
                                    <p className="text-muted mb-0 mt-1">{payment.note}</p>
                                </div>
                                <div className="col-4 text-end">
                                    <h2 className="fw-bold text-primary mb-0">₹{(payment.totalPaid || 0).toLocaleString()}</h2>
                                </div>
                            </div>
                        </div>

                        <div className="table-responsive mb-5">
                            <table className="table table-sm">
                                <thead>
                                    <tr className="small text-muted text-uppercase">
                                        <th>Payment Mode</th>
                                        <th>Reference Details</th>
                                        <th className="text-end">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(payment.payments || []).map((p, idx) => (
                                        <tr key={idx}>
                                            <td className="fw-bold py-2">{p.mode}</td>
                                            <td className="text-muted py-2">{p.reference || '-'}</td>
                                            <td className="text-end fw-bold py-2">₹{(p.amount || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="row mt-auto pt-5">
                            <div className="col-6 text-center">
                                <div className="border-bottom mx-auto mb-2" style={{ width: '200px' }}></div>
                                <p className="small text-muted">Customer Signature</p>
                            </div>
                            <div className="col-6 text-center">
                                <div className="border-bottom mx-auto mb-2" style={{ width: '200px' }}></div>
                                <p className="small text-muted">Authorized Signatory</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* PRINT ONLY STYLES */}
            <style>
                {`
                @media print {
                    body { background: white !important; padding: 0 !important; }
                    .container { max-width: none !important; margin: 0 !important; padding: 0 !important; }
                    ${printMode === 'thermal' ? `
                        @page { size: 80mm auto; margin: 0; }
                        body { width: 80mm; }
                    ` : `
                        @page { size: A4; margin: 20mm; }
                    `}
                }
                `}
            </style>
        </div>
    );
};

export default PrintReceipt;
