import React from "react";

const Footer = () => {
    return (
        <footer className="pt-5 pb-4" style={{ 
            backgroundColor: "#1a1a1a",
            color: "#e0e0e0",
            fontFamily: "'Helvetica Neue', Arial, sans-serif"
        }}>
            <div className="container">
                <div className="row">
                    {/* Store Information */}
                    <div className="col-md-6 mb-4">
                        <h5 style={{
                            color: "#ffffff",
                            fontWeight: "300",
                            letterSpacing: "1px",
                            marginBottom: "1.5rem",
                            position: "relative",
                            display: "inline-block"
                        }}>
                            <span style={{
                                position: "absolute",
                                bottom: "-8px",
                                left: "0",
                                width: "50px",
                                height: "2px",
                                backgroundColor: "#d4af37"
                            }}></span>
                            TH WORLD
                        </h5>
                        <ul className="list-unstyled" style={{ lineHeight: "2" }}>
                            <li className="mb-2">
                                <i className="bi bi-geo-alt-fill me-2" style={{ color: "#d4af37" }}></i>
                                <span>99 Nguyen Chi Thanh, Lang Ha, Dong Da, Hanoi, Vietnam</span>
                            </li>
                            <li className="mb-2">
                                <i className="bi bi-envelope-fill me-2" style={{ color: "#d4af37" }}></i>
                                <span>contact@THworld.com</span>
                            </li>
                            <li className="mb-2">
                                <i className="bi bi-telephone-fill me-2" style={{ color: "#d4af37" }}></i>
                                <span>+84 123 456 789</span>
                            </li>
                        </ul>
                    </div>

                    {/* Map Location */}
                    <div className="col-md-6 mb-4">
                        <h5 style={{
                            color: "#ffffff",
                            fontWeight: "300",
                            letterSpacing: "1px",
                            marginBottom: "1.5rem",
                            position: "relative",
                            display: "inline-block"
                        }}>
                            <span style={{
                                position: "absolute",
                                bottom: "-8px",
                                left: "0",
                                width: "50px",
                                height: "2px",
                                backgroundColor: "#d4af37"
                            }}></span>
                            STORE LOCATION
                        </h5>
                        <div className="ratio ratio-16x9" style={{ 
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            borderRadius: "4px",
                            overflow: "hidden"
                        }}>
                            <iframe
                                title="Google Map"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14896.821776544346!2d105.79376432968857!3d21.02446413858829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab672f111093%3A0x61d52fd7f92e046!2zS8O9IHTDumMgeMOhIMSQ4bqhaSBo4buNYyBHaWFvIFRow7RuZw!5e0!3m2!1svi!2s!4v1745374644545!5m2!1svi!2s"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                style={{ border: "none" }}
                            ></iframe>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="text-center pt-3 mt-3" style={{ 
                    borderTop: "1px solid rgba(255,255,255,0.1)",
                    color: "#999",
                    fontSize: "0.9rem",
                    letterSpacing: "0.5px"
                }}>
                    &copy; {new Date().getFullYear()} <span style={{ color: "#d4af37" }}>TH WORLD</span>. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;