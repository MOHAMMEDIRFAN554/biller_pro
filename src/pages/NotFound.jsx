import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="vh-100 d-flex flex-column align-items-center justify-content-center bg-dark text-white p-4 text-center overflow-hidden position-relative">
            {/* Background Image with Overlay */}
            <div
                className="position-absolute w-100 h-100 top-0 start-0 opacity-25"
                style={{
                    backgroundImage: `url('/wiring_not_completed_404_illustration_1768915487365.png')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    zIndex: 0
                }}
            />

            <div className="position-relative" style={{ zIndex: 1, maxWidth: '600px' }}>
                <h1 className="display-1 fw-black mb-0 animate-pulse" style={{ fontSize: '8rem', letterSpacing: '-5px' }}>404</h1>
                <div className="bg-warning text-dark px-3 py-1 fw-bold text-uppercase display-inline-block rounded shadow-lg mb-4 transform-rotate-2">
                    Wiring Not Completed - Wrong Way
                </div>

                <h2 className="h4 fw-bold mb-4 opacity-75">
                    Oops! It looks like our electricians took a wrong turn at the junction box.
                </h2>

                <p className="mb-5 text-muted lead">
                    The path you're looking for hasn't been wired yet. Please head back to base before you get a shock!
                </p>

                <button
                    onClick={() => navigate('/')}
                    className="btn btn-primary btn-lg px-5 py-3 rounded-pill shadow-lg fw-bold border-0 transform-hover animate-bounce"
                >
                    <i className="bi bi-house-door-fill me-2"></i> RECONNECT TO BASE
                </button>
            </div>

            <style>{`
                .fw-black { font-weight: 900; }
                .animate-pulse { animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { opacity: 0.8; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.02); }
                    100% { opacity: 0.8; transform: scale(1); }
                }
                .transform-rotate-2 { transform: rotate(-2deg); }
                .transform-hover:hover { transform: translateY(-3px) scale(1.05); transition: all 0.3s ease; }
            `}</style>
        </div>
    );
};

export default NotFound;
