import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetProductsQuery, useDeleteProductMutation } from '../redux/api/productsApiSlice';

const Inventory = () => {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState('');
    const [pageNumber, setPageNumber] = useState(1);

    const { data, isLoading, error } = useGetProductsQuery({ pageNumber, keyword });
    const [deleteProduct] = useDeleteProductMutation();

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
            } catch (err) {
                console.error(err);
            }
        }
    };

    return (
        <div className="animate-fade-in container-fluid">
            <div className="row mb-4 align-items-center">
                <div className="col-12 col-md-6">
                    <h1 className="h3 fw-bold text-dark mb-1">Inventory Management</h1>
                    <p className="text-muted small">Manage your products and stock levels</p>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                    <button
                        onClick={() => navigate('/inventory/add')}
                        className="btn btn-primary shadow-sm"
                    >
                        <i className="bi bi-plus-lg me-2"></i> Add New Product
                    </button>
                </div>
            </div>

            {/* Filters */}
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
                                    placeholder="Search by product name..."
                                    className="form-control bg-light border-0"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="card border-0 shadow-sm overflow-hidden">
                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                            <tr className="small text-uppercase text-muted">
                                <th className="px-4 py-3">Product Name</th>
                                <th className="py-3">Price (Inc. GST)</th>
                                <th className="py-3">Stock</th>
                                <th className="py-3">Barcode</th>
                                <th className="py-3 text-center">GST %</th>
                                <th className="px-4 py-3 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="small">
                            {isLoading ? (
                                <tr><td colSpan="6" className="p-5 text-center"><div className="spinner-border text-primary spinner-border-sm me-2"></div> Loading products...</td></tr>
                            ) : error ? (
                                <tr><td colSpan="6" className="p-5 text-center text-danger"><i className="bi bi-exclamation-circle me-2"></i> Error loading products</td></tr>
                            ) : data?.products.length === 0 ? (
                                <tr><td colSpan="6" className="p-5 text-center text-muted">No products found in inventory</td></tr>
                            ) : (
                                data?.products.map((product) => (
                                    <tr key={product._id}>
                                        <td className="px-4 py-3">
                                            <div className="fw-bold text-dark">{product.name}</div>
                                            <span className="xsmall text-muted">{product.hsn ? `HSN: ${product.hsn}` : ''}</span>
                                        </td>
                                        <td className="py-3 fw-medium">₹{product.price}</td>
                                        <td className="py-3 text-center">
                                            <span className={`badge rounded-pill ${product.stock <= 5 ? 'bg-danger bg-opacity-10 text-danger' : 'bg-primary bg-opacity-10 text-primary'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="py-3 text-muted">{product.barcode || '-'}</td>
                                        <td className="py-3 text-center">{product.gstRate}%</td>
                                        <td className="px-4 py-3 text-end">
                                            <div className="btn-group shadow-sm border rounded">
                                                <button
                                                    onClick={() => navigate(`/inventory/edit/${product._id}`)}
                                                    className="btn btn-sm btn-white text-primary border-0"
                                                >
                                                    <i className="bi bi-pencil-square"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    className="btn btn-sm btn-white text-danger border-0 border-start"
                                                >
                                                    <i className="bi bi-trash"></i>
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
    );
};

export default Inventory;
