import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCustomerMutation } from '../redux/api/customersApiSlice';

const AddCustomer = () => {
    const navigate = useNavigate();
    const [createCustomer, { isLoading }] = useCreateCustomerMutation();

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        openingBalance: '0'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'name' || name === 'address' ? value.toUpperCase() : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createCustomer(formData).unwrap();
            alert('Customer Created Successfully');
            navigate('/customers');
        } catch (err) {
            alert(err?.data?.message || 'Creation failed');
        }
    };

    return (
        <div className="container-fluid animate-fade-in">
            <div className="row mb-4 align-items-center">
                <div className="col">
                    <button onClick={() => navigate('/customers')} className="btn btn-link text-decoration-none p-0 mb-2">
                        <i className="bi bi-arrow-left me-1"></i> Back to Customers
                    </button>
                    <h1 className="h3 fw-bold text-dark">Add New Customer</h1>
                    <p className="text-muted small">Register a new client in your database</p>
                </div>
            </div>

            <div className="card border-0 shadow-sm col-xl-8">
                <div className="card-body p-4">
                    <form onSubmit={handleSubmit}>
                        <div className="row g-4">
                            <div className="col-md-7">
                                <label className="form-label small fw-bold text-muted text-uppercase">Full Name*</label>
                                <input
                                    required
                                    name="name"
                                    autoFocus
                                    placeholder="CUSTOMER NAME"
                                    className="form-control form-control-lg"
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-5">
                                <label className="form-label small fw-bold text-muted text-uppercase">Phone Number*</label>
                                <input
                                    required
                                    name="phone"
                                    placeholder="10-DIGIT NUMBER"
                                    className="form-control form-control-lg"
                                    value={formData.phone}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-12">
                                <label className="form-label small fw-bold text-muted text-uppercase">Address</label>
                                <textarea
                                    name="address"
                                    rows="3"
                                    placeholder="FULL ADDRESS"
                                    className="form-control form-control-lg"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label small fw-bold text-muted text-uppercase">Opening Balance (₹)</label>
                                <div className="input-group input-group-lg">
                                    <span className="input-group-text bg-light">₹</span>
                                    <input
                                        type="number"
                                        name="openingBalance"
                                        className="form-control"
                                        value={formData.openingBalance}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p className="xsmall text-muted mt-2">Positive value means they owe you, negative means advance.</p>
                            </div>
                            <div className="col-12 mt-4">
                                <hr />
                                <div className="d-flex gap-3">
                                    <button
                                        type="submit"
                                        className="btn btn-primary px-5 py-3 fw-bold shadow-sm"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Registering...' : 'Register Customer'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/customers')}
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

export default AddCustomer;
