import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGetProductDetailsQuery as useGetProductByIdQuery, useUpdateProductMutation } from '../redux/api/productsApiSlice';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { data: product, isLoading: isFetching } = useGetProductByIdQuery(id);
    const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

    const [formData, setFormData] = useState({
        name: '',
        purchasePrice: '',
        price: '',
        gstRate: '18',
        hsn: '',
        barcode: '',
        stock: ''
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                purchasePrice: product.purchasePrice || 0,
                price: product.price,
                gstRate: product.gstRate,
                hsn: product.hsn || '',
                barcode: product.barcode || '',
                stock: product.stock
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'name' || name === 'hsn' || name === 'barcode' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateProduct({ productId: id, ...formData }).unwrap();
            alert('Product Updated Successfully');
            navigate('/inventory');
        } catch (err) {
            alert(err?.data?.message || 'Update failed');
        }
    };

    if (isFetching) return <div className="p-5 text-center">Loading...</div>;

    return (
        <div className="container-fluid animate-fade-in">
            <div className="row mb-4 align-items-center">
                <div className="col">
                    <button onClick={() => navigate('/inventory')} className="btn btn-link text-decoration-none p-0 mb-2">
                        <i className="bi bi-arrow-left me-1"></i> Back to Inventory
                    </button>
                    <h1 className="h3 fw-bold text-dark">Edit Product</h1>
                    <p className="text-muted small">Update details for {product?.name}</p>
                </div>
            </div>

            <div className="card border-0 shadow-sm">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted text-uppercase">Product Name*</label>
                                <input
                                    required
                                    name="name"
                                    className="form-control form-control-lg"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted text-uppercase">Barcode / SKU</label>
                                <input
                                    name="barcode"
                                    className="form-control form-control-lg"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted text-uppercase">Purchase Price (₹)</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-light text-muted">₹</span>
                                    <input
                                        type="number"
                                        name="purchasePrice"
                                        className="form-control"
                                        value={formData.purchasePrice}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted text-uppercase">Selling Price (₹)*</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-light">₹</span>
                                    <input
                                        required
                                        type="number"
                                        name="price"
                                        className="form-control"
                                        value={formData.price}
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted text-uppercase">Current Stock</label>
                                <input
                                    required
                                    type="number"
                                    name="stock"
                                    className="form-control form-control-lg"
                                    value={formData.stock}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-3">
                                <label className="form-label small fw-bold text-muted text-uppercase">GST Rate (%)*</label>
                                <select
                                    name="gstRate"
                                    className="form-select form-select-lg"
                                    value={formData.gstRate}
                                    onChange={handleChange}
                                >
                                    <option value="0">0%</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                </select>
                            </div>
                            <div className="col-12">
                                <label className="form-label small fw-bold text-muted text-uppercase">HSN Code</label>
                                <input
                                    name="hsn"
                                    className="form-control form-control-lg"
                                    value={formData.hsn}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12 mt-5">
                                <div className="d-flex gap-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-5 py-3 fw-bold shadow-sm"
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/inventory')}
                                        className="btn btn-light px-5 py-3 fw-bold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProduct;
