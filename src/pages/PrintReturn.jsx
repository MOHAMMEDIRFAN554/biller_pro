import { useRef, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGetSalesReturnQuery } from '../redux/api/returnsApiSlice';
import { useGetCompanyProfileQuery } from '../redux/api/settingsApiSlice';

const PrintReturn = () => {
    const { id } = useParams();
    const { data: salesReturn, isLoading } = useGetSalesReturnQuery(id);
    const { data: profile } = useGetCompanyProfileQuery();
    const [printMode, setPrintMode] = useState('thermal'); // thermal, a4

    if (isLoading || !salesReturn) return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center">
                <div className="spinner-border text-primary mb-3"></div>
                <p className="text-muted fw-bold">Loading Return Note...</p>
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
                    <div className="text-center mb-3 border-bottom border-dark pb-2">
                        <h4 className="fw-bold mb-0 text-uppercase">{profile?.name || 'My Business'}</h4>
                        <p className="fw-bold xsmall mb-0 mt-1">SALES RETURN NOTE</p>
                    </div>

                    <div className="mb-3 xsmall">
                        <div className="d-flex justify-content-between">
                            <span>Return ID:</span>
                            <span className="fw-bold">#{salesReturn._id.slice(-6).toUpperCase()}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                            <span>Date:</span>
                            <span>{new Date(salesReturn.createdAt).toLocaleDateString()}</span>
                        </div>
                        {salesReturn.customer && (
                            <div className="d-flex justify-content-between">
                                <span>Customer:</span>
                                <span className="text-uppercase">{salesReturn.customer.name}</span>
                            </div>
                        )}
                    </div>

                    <table className="table table-sm table-borderless xsmall mb-3">
                        <thead className="border-bottom border-dark border-dashed">
                            <tr>
                                <th className="ps-0">Item</th>
                                <th className="text-center">Qty</th>
                                <th className="text-end pe-0">Refund</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(salesReturn.items || []).map((item, index) => (
                                <tr key={index}>
                                    <td className="ps-0 py-1">{item.product?.name || 'Item'}</td>
                                    <td className="text-center py-1">{item.quantity || 0}</td>
                                    <td className="text-end pe-0 py-1">{item.refundAmount || 0}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="border-top border-dark border-dashed pt-2 xsmall">
                        <div className="d-flex justify-content-between fw-bold fs-6">
                            <span>TOTAL REFUND:</span>
                            <span>₹{salesReturn.totalRefundAmount || 0}</span>
                        </div>
                        <div className="d-flex justify-content-between mt-1 opacity-75">
                            <span>Refund Mode:</span>
                            <span>{salesReturn.refundMode || 'N/A'}</span>
                        </div>
                    </div>

                    <div className="mt-4 text-center xsmall border-top border-dark pt-2 opacity-75">
                        <p className="mb-0 italic">{salesReturn.reason || 'Goods Returned'}</p>
                    </div>
                </div>
            )}

            {/* A4 TEMPLATE */}
            {printMode === 'a4' && (
                <div className="bg-white text-black w-100 p-5 shadow-sm border d-print-block mx-auto" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
                    <div className="row mb-5 pb-3 border-bottom border-2">
                        <div className="col-6">
                            <h1 className="display-6 fw-bold text-danger mb-0 text-uppercase">CREDIT NOTE</h1>
                            <p className="text-muted">Return ID: <span className="text-dark fw-bold">#{salesReturn._id.toUpperCase()}</span></p>
                        </div>
                        <div className="col-6 text-end">
                            <h3 className="fw-bold mb-1 text-uppercase">{profile?.name || 'My Business'}</h3>
                            <p className="small mb-0 text-muted">{profile?.address}</p>
                            <p className="small mb-0 text-muted">{profile?.phone}</p>
                        </div>
                    </div>

                    <div className="row mb-5">
                        <div className="col-6">
                            <p className="text-muted small text-uppercase fw-bold mb-2 ls-1">Customer Details</p>
                            {salesReturn.customer ? (
                                <div className="border-start border-danger border-4 ps-3 py-1">
                                    <p className="fw-bold fs-5 mb-0 text-dark text-uppercase">{salesReturn.customer.name}</p>
                                    <p className="small mb-0 text-muted">{salesReturn.customer.phone}</p>
                                    <p className="small mb-0 text-muted">{salesReturn.customer.address}</p>
                                </div>
                            ) : (
                                <p className="text-muted">Walk-in Customer</p>
                            )}
                        </div>
                        <div className="col-6 text-end">
                            <p className="text-muted small text-uppercase fw-bold mb-2 ls-1">Return Summary</p>
                            <p className="mb-1"><span className="text-muted">Return Date:</span> <span className="fw-bold">{new Date(salesReturn.createdAt).toLocaleDateString()}</span></p>
                            <p className="mb-1"><span className="text-muted">Refund Mode:</span> <span className="badge bg-danger bg-opacity-10 text-danger border border-danger fw-bold px-3">{salesReturn.refundMode.toUpperCase()}</span></p>
                        </div>
                    </div>

                    <table className="table table-hover mb-5">
                        <thead className="table-light border-top border-bottom border-2 border-dark">
                            <tr className="small text-uppercase fw-bold">
                                <th className="py-3">Description of Goods Returned</th>
                                <th className="py-3 text-center">Qty</th>
                                <th className="py-3 text-end">Refund Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(salesReturn.items || []).map((item, index) => (
                                <tr key={index}>
                                    <td className="py-3 fw-medium text-uppercase">{item.product?.name || 'Product'}</td>
                                    <td className="py-3 text-center">{item.quantity || 0}</td>
                                    <td className="py-3 text-end fw-bold text-danger">₹{(item.refundAmount || 0).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="row justify-content-end">
                        <div className="col-5">
                            <div className="card bg-light border-0 p-4 rounded-4">
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="h5 fw-bold mb-0">TOTAL CREDIT</span>
                                    <span className="h5 fw-bold mb-0 text-danger">₹{(salesReturn.totalRefundAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 text-center text-muted small">
                        <p className="mb-0">Note: This amount has been {salesReturn.refundMode === 'Ledger' ? 'credited to your account' : `refunded via ${salesReturn.refundMode}`}.</p>
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
            `}</style>
        </div>
    );
};

export default PrintReturn;
