import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "bootstrap/dist/css/bootstrap.min.css";

const RegisterPage = () => {
    const { registerWithOTPStep1, registerWithOTPStep2 } = useContext(AuthContext);
    const navigate = useNavigate();
    
    // Form state
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
    });
    
    // OTP verification state
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
    const [isLoading, setIsLoading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [redirectTimer, setRedirectTimer] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastConfig, setToastConfig] = useState({
        title: "",
        message: "",
        bg: "danger"
    });

    // Clear timeout khi component unmount
    useEffect(() => {
        return () => {
            if (redirectTimer) {
                clearTimeout(redirectTimer);
            }
        };
    }, [redirectTimer]);

    const displayToast = (title, message, bg = "danger") => {
        setToastConfig({
            title,
            message,
            bg
        });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 5000);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleOTPChange = (e) => {
        setOtp(e.target.value);
    };

    // Validate email format
    const validateEmail = (email) => {
        const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        return re.test(email);
    };

    // Validate username (no spaces or special characters)
    const validateUsername = (username) => {
        const re = /^[a-zA-Z0-9]+$/;
        return re.test(username);
    };

    // Handle OTP sending (step 1)
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate inputs
        if (!formData.username || !formData.email || !formData.password) {
            displayToast("Error", "Please fill in all fields");
            setIsLoading(false);
            return;
        }

        if (!validateUsername(formData.username)) {
            displayToast("Error", "Username cannot contain spaces or special characters");
            setIsLoading(false);
            return;
        }

        if (!validateEmail(formData.email)) {
            displayToast("Error", "Invalid email format (e.g., example@gmail.com)");
            setIsLoading(false);
            return;
        }

        try {
            const result = await registerWithOTPStep1(
                formData.username,
                formData.email,
                formData.password
            );
            
            displayToast("Success", result.message || "OTP code has been sent to your email (valid for 5 minutes)", "success");
            setStep(2);
            startCountdown(300); // Start 300s countdown (5 minutes)
        } catch (error) {
            displayToast("Error", error.message || "Failed to send OTP. Please try again");
        } finally {
            setIsLoading(false);
        }
    };

    // Handle OTP verification (step 2)
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate OTP
        if (!otp || otp.length !== 6) {
            displayToast("Error", "Please enter a 6-digit OTP code");
            setIsLoading(false);
            return;
        }

        try {
            const result = await registerWithOTPStep2(
                formData.username,
                formData.email,
                formData.password,
                otp
            );
            
            displayToast("Success", "Registration successful! Redirecting...", "success");
            
            // Sử dụng biến state để lưu timer và clear khi cần
            const timer = setTimeout(() => {
                navigate("/login", {
                    replace: true, 
                    state: {
                        registeredEmail: formData.email,
                        message: "Registration successful. Please login."
                    }
                });
            }, 2000);
            
            setRedirectTimer(timer);

        } catch (error) {
            let errorMsg = error.message;
            
            if (error.response) {
                errorMsg = error.response.data.message || errorMsg;
                
                if (errorMsg.includes("Email already exists")) {
                    setStep(1);
                }
            } else if (error.request) {
                errorMsg = "No response from server";
            }
            
            displayToast("Error", errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    // Resend OTP
    const handleResendOTP = async () => {
        setIsLoading(true);

        try {
            const result = await registerWithOTPStep1(
                formData.username,
                formData.email,
                formData.password
            );
            
            displayToast("Success", "New OTP code sent (valid for 5 minutes)", "success");
            startCountdown(300); // Reset countdown to 300s (5 minutes)
        } catch (error) {
            displayToast("Error", error.message || "Failed to resend OTP");
        } finally {
            setIsLoading(false);
        }
    };

    // Countdown timer (format minutes:seconds)
    const startCountdown = (seconds) => {
        setCountdown(seconds);
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Format countdown time
    const formatCountdown = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div 
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{
                backgroundImage: "url('https://danviet.ex-cdn.com/files/f1/296231569849192448/2023/1/15/z403556587967736b20440c47ed11d16316bc354242f70-1673776858625-16737768587602017391246.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative"
            }}
        >
            <div
                className="position-absolute top-0 start-0 w-100 h-100"
                style={{
                    backgroundColor: "rgba(0, 0, 0, 0.4)",
                    backdropFilter: "blur(5px)"
                }}
            ></div>

            {/* Toast Notification */}
            <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 11 }}>
                <div 
                    className={`toast ${showToast ? "show" : ""}`} 
                    role="alert" 
                    aria-live="assertive" 
                    aria-atomic="true"
                    data-bs-autohide="true"
                >
                    <div className={`toast-header bg-${toastConfig.bg} text-white`}>
                        <strong className="me-auto">{toastConfig.title}</strong>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            data-bs-dismiss="toast" 
                            aria-label="Close"
                            onClick={() => setShowToast(false)}
                        ></button>
                    </div>
                    <div className="toast-body">
                        {toastConfig.message}
                    </div>
                </div>
            </div>

            <div
                className="card p-4 border-0 shadow-lg position-relative"
                style={{
                    width: "100%",
                    maxWidth: "450px",
                    borderRadius: "15px",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    overflow: "hidden"
                }}
            >
                <div className="text-center mb-4">
                    <h2 className="text-dark mb-1" style={{ fontFamily: "'Playfair Display', serif", fontWeight: "700" }}>
                        {step === 1 ? "CREATE ACCOUNT" : "OTP VERIFICATION"}
                    </h2>
                    <p className="text-muted small">
                        {step === 1 ? "Create an account to get started" : `OTP code sent to ${formData.email} (valid for 5 minutes)`}
                    </p>
                </div>

                {step === 1 ? (
                    // Registration form (step 1)
                    <form onSubmit={handleSendOTP}>
                        <div className="mb-3">
                            <label htmlFor="username" className="form-label small text-uppercase text-muted">
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                id="username"
                                className="form-control border-0 border-bottom rounded-0 py-3 px-0"
                                placeholder="Enter username (no spaces or special characters)"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                style={{
                                    backgroundColor: "rgba(255, 240, 220, 0.3)",
                                    borderBottom: "1px solid #ddd !important"
                                }}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="email" className="form-label small text-uppercase text-muted">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                id="email"
                                className="form-control border-0 border-bottom rounded-0 py-3 px-0"
                                placeholder="example@gmail.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{
                                    backgroundColor: "rgba(255, 240, 220, 0.3)",
                                    borderBottom: "1px solid #ddd !important"
                                }}
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label small text-uppercase text-muted">
                                Password
                            </label>
                            <input
                                type="password"
                                name="password"
                                id="password"
                                className="form-control border-0 border-bottom rounded-0 py-3 px-0"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                style={{
                                    backgroundColor: "rgba(255, 240, 220, 0.3)",
                                    borderBottom: "1px solid #ddd !important"
                                }}
                            />
                        </div>
                        
                        <button
                            type="submit"
                            className="btn btn-dark w-100 py-3 mb-3"
                            disabled={isLoading}
                            style={{
                                letterSpacing: "1px",
                                fontWeight: "500",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {isLoading ? "SENDING OTP..." : "REGISTER"}
                        </button>
                    </form>
                ) : (
                    // OTP verification form (step 2)
                    <form onSubmit={handleVerifyOTP}>
                        <div className="mb-4">
                            <label htmlFor="otp" className="form-label small text-uppercase text-muted">
                                OTP Code (6 digits)
                            </label>
                            <input
                                type="text"
                                id="otp"
                                className="form-control border-0 border-bottom rounded-0 py-3 px-0 text-center"
                                placeholder="Enter OTP code"
                                value={otp}
                                onChange={handleOTPChange}
                                maxLength="6"
                                required
                                style={{
                                    backgroundColor: "rgba(255, 240, 220, 0.3)",
                                    borderBottom: "1px solid #ddd !important",
                                    letterSpacing: "5px",
                                    fontSize: "1.2rem"
                                }}
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-dark w-100 py-3 mb-3"
                            disabled={isLoading}
                            style={{
                                letterSpacing: "1px",
                                fontWeight: "500",
                                transition: "all 0.3s ease"
                            }}
                        >
                            {isLoading ? "VERIFYING..." : "VERIFY OTP"}
                        </button>

                        <div className="text-center mt-3">
                            <p className="small text-muted">
                                Didn't receive code?{" "}
                                <button 
                                    className="btn btn-link p-0 text-decoration-none"
                                    onClick={handleResendOTP}
                                    disabled={countdown > 0 || isLoading}
                                >
                                    Resend Code {countdown > 0 ? `(${formatCountdown(countdown)})` : ""}
                                </button>
                            </p>
                        </div>
                    </form>
                )}

                <div className="position-relative my-4">
                    <hr className="my-0" />
                    <span
                        className="position-absolute top-50 start-50 translate-middle bg-white px-2 small text-muted"
                        style={{ width: "fit-content" }}
                    >
                        OR
                    </span>
                </div>

                <button
                    className="btn btn-outline-dark w-100 py-2"
                    onClick={() => navigate("/login")}
                    style={{
                        letterSpacing: "1px",
                        transition: "all 0.3s ease"
                    }}
                >
                    ALREADY HAVE AN ACCOUNT? LOGIN NOW
                </button>
            </div>
        </div>
    );
};

export default RegisterPage;