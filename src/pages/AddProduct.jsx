import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProductMutation } from '../redux/api/productsApiSlice';

const AddProduct = () => {
    const navigate = useNavigate();
    const [createProduct, { isLoading }] = useCreateProductMutation();

    const [formData, setFormData] = useState({
        name: '',
        purchasePrice: '0',
        price: '0',
        stock: '0',
        gstRate: '18',
        barcode: '',
        hsn: ''
    });

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
            await createProduct(formData).unwrap();
            alert('Product Created Successfully');
            navigate('/inventory');
        } catch (err) {
            alert(err?.data?.message || 'Creation failed');
        }
    };

    return (
        <div className="container-fluid animate-fade-in">
            <div className="row mb-4 align-items-center">
                <div className="col">
                    <button onClick={() => navigate('/inventory')} className="btn btn-link text-decoration-none p-0 mb-2">
                        <i className="bi bi-arrow-left me-1"></i> Back to Inventory
                    </button>
                    <h1 className="h3 fw-bold text-dark">Add New Product</h1>
                    <p className="text-muted small">Enter details to add a new item to your stock</p>
                </div>
            </div>

            <div className="card border-0 shadow-sm col-xl-10">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-8">
                                <label className="form-label small fw-bold text-muted text-uppercase">Product Name*</label>
                                <input
                                    required
                                    name="name"
                                    autoFocus
                                    placeholder="e.g. SAMSUNG GALAXY S24"
                                    className="form-control form-control-lg"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">Barcode / SKU</label>
                                <input
                                    name="barcode"
                                    placeholder="Scan or Enter"
                                    className="form-control form-control-lg"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-4">
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
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">Selling Price (₹)*</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-light text-muted">₹</span>
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
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">Opening Stock</label>
                                <input
                                    required
                                    type="number"
                                    name="stock"
                                    className="form-control form-control-lg"
                                    value={formData.stock}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-4">
                                <label className="form-label small fw-bold text-muted text-uppercase">GST Rate (%)*</label>
                                <select
                                    name="gstRate"
                                    className="form-select form-select-lg"
                                    value={formData.gstRate}
                                    onChange={handleChange}
                                >
                                    <option value="0">0% (Exempt)</option>
                                    <option value="5">5%</option>
                                    <option value="12">12%</option>
                                    <option value="18">18%</option>
                                    <option value="28">28%</option>
                                </select>
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted text-uppercase">HSN Code</label>
                                <input
                                    name="hsn"
                                    placeholder="8-Digit Code"
                                    className="form-control form-control-lg"
                                    value={formData.hsn}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12 mt-4 pt-3 border-top">
                                <div className="d-flex gap-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-5 py-3 fw-bold shadow-sm"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Creating...' : 'Create Product'}
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

export default AddProduct;
