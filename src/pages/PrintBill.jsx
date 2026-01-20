import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetBillByIdQuery } from '../redux/api/billsApiSlice';
import { useGetCompanyProfileQuery } from '../redux/api/settingsApiSlice';

const PrintBill = () => {
    const { id } = useParams();

    const { data: bill, isLoading: billLoading } = useGetBillByIdQuery(id);
    const { data: profile } = useGetCompanyProfileQuery();
    const [printMode, setPrintMode] = useState('thermal'); // thermal, a4

    if (billLoading || !bill) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3"></div>
                <p className="text-muted fw-bold">Generating Invoice Preview...</p>
            </div>
        </div>
    );

    return (
        <div className="bg-light min-h-screen p-4 d-flex flex-column align-items-center">
            {/* Print Controls (Hidden on Print) */}
            <div className="print-btns d-flex gap-2 mb-4 p-3 bg-white rounded-3 shadow-sm d-print-none border">
                <div className="btn-group">
                    <button
                        onClick={() => setPrintMode('thermal')}
                        className={`btn btn-sm ${printMode === 'thermal' ? 'btn-dark' : 'btn-outline-dark'}`}
                    >
                        <i className="bi bi-printer me-2"></i> Thermal (80mm)
                    </button>
                    <button
                        onClick={() => setPrintMode('a5')}
                        className={`btn btn-sm ${printMode === 'a5' ? 'btn-dark' : 'btn-outline-dark'}`}
                    >
                        <i className="bi bi-journal-text me-2"></i> A5
                    </button>
                    <button
                        onClick={() => setPrintMode('a4')}
                        className={`btn btn-sm ${printMode === 'a4' ? 'btn-dark' : 'btn-outline-dark'}`}
                    >
                        <i className="bi bi-file-earmark-text me-2"></i> A4 Standard
                    </button>
                </div>
                <button onClick={() => window.print()} className="btn btn-sm btn-primary px-4 shadow-sm fw-bold">
                    <i className="bi bi-printer-fill me-2"></i> EXECUTE PRINT
                </button>
            </div>

            {/* THERMAL TEMPLATE */}
            {printMode === 'thermal' && (
                <div className="bg-white text-black text-sm font-monospace w-[80mm] p-3 shadow-sm border d-print-block" id="thermal-invoice" style={{ width: '80mm' }}>
                    {/* Header */}
                    <div className="text-center mb-3 border-bottom border-dark pb-2">
                        <h4 className="fw-bold mb-0 text-uppercase">{profile?.name || 'My Business'}</h4>
                        <p className="xsmall mb-0">{profile?.address}</p>
                        {profile?.phone && <p className="xsmall mb-0">Ph: {profile.phone}</p>}
                        {profile?.email && <p className="xsmall mb-0">{profile.email}</p>}
                    </div>

                    {/* Bill Details */}
                    <div className="mb-3 xsmall">
                        <div className="d-flex justify-content-between">
                            <span>Invoice:</span>
                            <span className="fw-bold">{bill.billNumber}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Date:</span>
                            <span>{new Date(bill.createdAt).toLocaleDateString('en-GB')}</span>
                        </div>
                        {bill.customer && (
                            <div className="d-flex justify-content-between">
                                <span>Customer:</span>
                                <span className="text-uppercase">{bill.customer.name}</span>
                            </div>
                        )}
                    </div>

                    {/* Items */}
                    <table className="table table-sm table-borderless xsmall mb-3">
                        <thead className="border-bottom border-dark border-dashed">
                            <tr>
                                <th className="ps-0">Item</th>
                                <th className="text-center">Qty</th>
                                <th className="text-end pe-0">Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="ps-0 py-1" style={{ maxWidth: '100px', overflow: 'hidden' }}>
                                        {item.name}
                                        {item.itemDiscount > 0 && <div className="xxsmall text-muted">(-{item.itemDiscount})</div>}
                                    </td>
                                    <td className="text-center py-1">{item.quantity}</td>
                                    <td className="text-end pe-0 py-1">{item.totalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="border-top border-dark border-dashed pt-2 xsmall">
                        <div className="d-flex justify-content-between">
                            <span>Subtotal:</span>
                            <span>{bill.subTotal.toFixed(2)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Tax Amount:</span>
                            <span>{bill.taxAmount.toFixed(2)}</span>
                        </div>
                        {bill.discountAmount > 0 && (
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Discount:</span>
                                <span>-{bill.discountAmount}</span>
                            </div>
                        )}
                        {bill.roundOff !== 0 && (
                            <div className="d-flex justify-content-between">
                                <span>Round Off:</span>
                                <span>{bill.roundOff}</span>
                            </div>
                        )}
                        <div className="d-flex justify-content-between fw-bold fs-6 border-top border-dark border-dashed pt-2 mt-2">
                            <span>GRAND TOTAL:</span>
                            <span>₹{bill.grandTotal}</span>
                        </div>
                        {(bill.paidAmount < bill.grandTotal || (bill.customer?.ledgerBalance > 0)) && (
                            <div className="border-top border-dark border-dashed pt-2 mt-2">
                                <div className="d-flex justify-content-between">
                                    <span>Paid Amount:</span>
                                    <span>{bill.paidAmount}</span>
                                </div>
                                {bill.returnedAmount > 0 && (
                                    <div className="d-flex justify-content-between text-muted">
                                        <span>Change Returned:</span>
                                        <span>{bill.returnedAmount}</span>
                                    </div>
                                )}
                                {((bill.customer?.ledgerBalance || 0) - bill.balanceAmount > 0) && (
                                    <div className="d-flex justify-content-between text-muted">
                                        <span>Previous Outstanding:</span>
                                        <span>{(bill.customer.ledgerBalance - bill.balanceAmount).toFixed(2)}</span>
                                    </div>
                                )}
                                {bill.balanceAmount > 0 && (
                                    <div className="d-flex justify-content-between">
                                        <span>Balance Due:</span>
                                        <span>{bill.balanceAmount}</span>
                                    </div>
                                )}
                                {bill.customer?.ledgerBalance > 0 && (
                                    <div className="d-flex justify-content-between fw-bold border-top border-dark border-dashed pt-1 mt-1">
                                        <span>Total Outstanding:</span>
                                        <span>{bill.customer.ledgerBalance}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="mt-4 text-center xsmall border-top border-dark pt-2 opacity-75">
                        <p className="mb-0">Thank you for your visit!</p>
                        <p className="mb-0 fw-bold">{profile?.name || 'Biller Pro'}</p>
                    </div>
                </div>
            )}

            {/* A5 TEMPLATE */}
            {printMode === 'a5' && (
                <div className="bg-white text-black w-100 p-4 shadow-sm border d-print-block mx-auto" style={{ maxWidth: '148mm', minHeight: '210mm', fontSize: '0.85rem' }}>
                    <div className="d-flex justify-content-between align-items-start mb-4 pb-2 border-bottom border-dark">
                        <div>
                            <h4 className="fw-bold text-dark mb-0 text-uppercase">{profile?.name || 'My Business'}</h4>
                            <p className="small mb-0 text-muted">{profile?.address}</p>
                            {profile?.phone && <p className="small mb-0 text-muted">Ph: {profile.phone}</p>}
                        </div>
                        <div className="text-end">
                            <h5 className="fw-bold text-primary mb-1">INVOICE</h5>
                            <p className="small mb-0 fw-bold">#{bill.billNumber}</p>
                            <p className="small mb-0 text-muted">{new Date(bill.createdAt).toLocaleDateString('en-GB')}</p>
                        </div>
                    </div>

                    <div className="row mb-3 gx-3">
                        <div className="col-7">
                            <p className="text-muted xsmall text-uppercase fw-bold mb-1">Billed To</p>
                            {bill.customer ? (
                                <div>
                                    <p className="fw-bold mb-0 text-dark">{bill.customer.name}</p>
                                    <p className="xsmall mb-0 text-muted">{bill.customer.phone}</p>
                                </div>
                            ) : (
                                <p className="fw-bold mb-0 text-muted">Cash Customer</p>
                            )}
                        </div>
                    </div>

                    <table className="table table-sm mb-4 border-top border-dark">
                        <thead>
                            <tr className="xsmall text-uppercase fw-bold border-bottom border-dark">
                                <th className="ps-0 py-2">Item</th>
                                <th className="text-center py-2">Qty</th>
                                <th className="text-end py-2">Rate</th>
                                <th className="text-end pe-0 py-2">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="ps-0 py-1 border-0">
                                        <div className="lh-1">
                                            <span className="fw-bold">{item.name}</span>
                                            {item.itemDiscount > 0 && <span className="ms-1 text-muted xxsmall">(-{item.itemDiscount})</span>}
                                        </div>
                                    </td>
                                    <td className="text-center py-1 border-0">{item.quantity}</td>
                                    <td className="text-end py-1 border-0">{item.price}</td>
                                    <td className="text-end pe-0 py-1 border-0 fw-bold">{item.totalAmount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-top border-dark pt-2">
                        <div className="d-flex justify-content-between mb-1">
                            <span className="small">Subtotal</span>
                            <span className="fw-bold small">{bill.subTotal}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-1">
                            <span className="small">Tax</span>
                            <span className="small">{bill.taxAmount}</span>
                        </div>
                        {bill.discountAmount > 0 && (
                            <div className="d-flex justify-content-between mb-1 text-danger">
                                <span className="small">Discount</span>
                                <span className="small fw-bold">-{bill.discountAmount}</span>
                            </div>
                        )}
                        <div className="d-flex justify-content-between border-top border-dark mt-2 pt-2">
                            <span className="fw-bold">Total</span>
                            <span className="fw-bold fs-5">₹{bill.grandTotal}</span>
                        </div>

                        {(bill.paidAmount < bill.grandTotal || (bill.customer?.ledgerBalance > 0)) && (
                            <div className="mt-2 pt-2 border-top border-dashed">
                                <div className="d-flex justify-content-between xsmall">
                                    <span className="text-muted">Paid</span>
                                    <span className="fw-bold">{bill.paidAmount}</span>
                                </div>
                                {bill.returnedAmount > 0 && (
                                    <div className="d-flex justify-content-between xsmall text-muted">
                                        <span>Change Returned</span>
                                        <span className="fw-bold">{bill.returnedAmount}</span>
                                    </div>
                                )}
                                {((bill.customer?.ledgerBalance || 0) - bill.balanceAmount > 0) && (
                                    <div className="d-flex justify-content-between xsmall">
                                        <span className="text-muted">Prev. Due</span>
                                        <span className="fw-bold">{(bill.customer.ledgerBalance - bill.balanceAmount).toFixed(2)}</span>
                                    </div>
                                )}
                                {bill.balanceAmount > 0 && (
                                    <div className="d-flex justify-content-between xsmall">
                                        <span className="text-muted">Balance Due</span>
                                        <span className="fw-bold text-danger">{bill.balanceAmount}</span>
                                    </div>
                                )}
                                {bill.customer?.ledgerBalance > 0 && (
                                    <div className="d-flex justify-content-between small fw-bold mt-1">
                                        <span>Total Outstanding</span>
                                        <span className="text-danger">₹{bill.customer.ledgerBalance}</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* A4 TEMPLATE */}
            {printMode === 'a4' && (
                <div className="bg-white text-black w-100 p-5 shadow-sm border d-print-block mx-auto" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
                    <div className="d-flex justify-content-between align-items-start mb-5 pb-3 border-bottom border-2">
                        <div>
                            <h1 className="display-6 fw-bold text-primary mb-0 text-uppercase">TAX INVOICE</h1>
                            <p className="text-muted">Serial No. <span className="text-dark fw-bold">#{bill.billNumber}</span></p>
                        </div>
                        <div className="text-end">
                            <h3 className="fw-bold mb-1 text-uppercase">{profile?.name || 'My Business'}</h3>
                            <p className="small mb-0 text-muted">{profile?.address}</p>
                            {profile?.phone && <p className="small mb-0 text-muted">Phone: {profile.phone}</p>}
                            {profile?.email && <p className="small mb-0 text-muted">Email: {profile.email}</p>}
                            {profile?.website && <p className="small mb-0 text-muted">Web: {profile.website}</p>}
                        </div>
                    </div>

                    <div className="row mb-5">
                        <div className="col-6">
                            <p className="text-muted small text-uppercase fw-bold mb-2 ls-1">Billed To</p>
                            {bill.customer ? (
                                <div className="border-start border-primary border-4 ps-3 py-1">
                                    <p className="fw-bold fs-5 mb-0 text-dark text-uppercase">{bill.customer.name}</p>
                                    <p className="small mb-0 text-muted">{bill.customer.phone}</p>
                                    <p className="small mb-0 text-muted">{bill.customer.address || bill.customer.email}</p>
                                </div>
                            ) : (
                                <div className="border-start border-secondary border-4 ps-3 py-1 text-muted">
                                    <p className="fw-bold fs-5 mb-0">Cash Customer</p>
                                    <p className="small mb-0">Walk-in client</p>
                                </div>
                            )}
                        </div>
                        <div className="col-6 text-end">
                            <p className="text-muted small text-uppercase fw-bold mb-2 ls-1">Invoice Details</p>
                            <p className="mb-1"><span className="text-muted">Date:</span> <span className="fw-bold">{new Date(bill.createdAt).toLocaleDateString('en-GB')}</span></p>
                            <p className="mb-1"><span className="text-muted">Status:</span> <span className="badge bg-success bg-opacity-10 text-success border border-success fw-bold px-3">PAID</span></p>
                        </div>
                    </div>

                    <table className="table table-hover mb-5">
                        <thead className="table-light border-top border-bottom border-2 border-dark" style={{ display: 'table-header-group' }}>
                            <tr className="small text-uppercase fw-bold">
                                <th className="py-3">Description</th>
                                <th className="py-3 text-end">Unit Price</th>
                                <th className="py-3 text-center">Qty</th>
                                <th className="py-3 text-end">Discount</th>
                                <th className="py-3 text-end">Item Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bill.items.map((item, index) => (
                                <tr key={index} style={{ pageBreakInside: 'avoid' }}>
                                    <td className="py-3 fw-medium text-uppercase">{item.name}</td>
                                    <td className="py-3 text-end">₹{item.price.toLocaleString()}</td>
                                    <td className="py-3 text-center">{item.quantity}</td>
                                    <td className="py-3 text-end text-danger">{item.itemDiscount > 0 ? `-₹${item.itemDiscount}` : '-'}</td>
                                    <td className="py-3 text-end fw-bold text-dark">₹{item.totalAmount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="row justify-content-end" style={{ pageBreakInside: 'avoid' }}>
                        <div className="col-5">
                            <div className="list-group list-group-flush">
                                <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-0">
                                    <span className="text-muted">Sub-Total Amount</span>
                                    <span className="fw-bold text-dark">₹{bill.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-0">
                                    <span className="text-muted">GST & Taxes</span>
                                    <span className="fw-bold text-dark">₹{bill.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                {bill.discountAmount > 0 && (
                                    <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-0 text-danger">
                                        <span className="text-muted">Total Discount</span>
                                        <span className="fw-bold">-₹{bill.discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                    </div>
                                )}
                                <div className="list-group-item d-flex justify-content-between bg-transparent px-0 pt-3 mt-2 border-top border-2 border-dark">
                                    <span className="h5 fw-bold mb-0">GRAND TOTAL</span>
                                    <span className="h5 fw-bold mb-0 text-primary">₹{bill.grandTotal.toLocaleString()}</span>
                                </div>
                                {(bill.paidAmount < bill.grandTotal || (bill.customer?.ledgerBalance > 0)) && (
                                    <div className="mt-2 pt-2 border-top">
                                        <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-0 py-1">
                                            <span className="text-muted">Paid Amount</span>
                                            <span className="fw-bold text-dark">₹{bill.paidAmount.toLocaleString()}</span>
                                        </div>
                                        {bill.returnedAmount > 0 && (
                                            <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-0 py-1">
                                                <span className="text-muted">Change Returned</span>
                                                <span className="fw-bold text-muted">₹{bill.returnedAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {((bill.customer?.ledgerBalance || 0) - bill.balanceAmount > 0) && (
                                            <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-0 py-1">
                                                <span className="text-muted">Previous Outstanding</span>
                                                <span className="fw-bold text-muted">₹{(bill.customer.ledgerBalance - bill.balanceAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        {bill.balanceAmount > 0 && (
                                            <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-0 py-1">
                                                <span className="text-muted">Balance Due (Inv)</span>
                                                <span className="fw-bold text-danger">₹{bill.balanceAmount.toLocaleString()}</span>
                                            </div>
                                        )}
                                        {bill.customer?.ledgerBalance > 0 && (
                                            <div className="list-group-item d-flex justify-content-between bg-transparent px-0 border-0 py-1 mt-2 border-top border-dashed">
                                                <span className="text-muted fw-bold">Total Ledger Due</span>
                                                <span className="fw-bold text-danger">₹{bill.customer.ledgerBalance.toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 text-center text-muted small border-top pt-4">
                        <p className="mb-0 fw-bold">Thank you for choosing {profile?.name || 'our business'}!</p>
                        <p className="mb-0">This is a system generated tax invoice.</p>
                    </div>
                </div>
            )}

            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { background: white !important; }
                    .print-btns { display: none !important; }
                    .min-h-screen { min-height: initial !important; background: white !important; padding: 0 !important; }
                    .shadow-sm, .border { box-shadow: none !important; border: none !important; }
                }
                .ls-1 { letter-spacing: 1px; }
                .truncate-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
            `}</style>
        </div>
    );
};

export default PrintBill;
