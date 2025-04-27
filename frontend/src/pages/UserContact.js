import React from 'react';
import Navbar from "./MenuUser.js";

const ContactForm = () => {
  return (
    
    <div className="bg-amber-50 min-vh-100 py-5">
        <Navbar />
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-lg overflow-hidden">
              <div className="card-header py-4" style={{ backgroundColor: '#d4a762' }}>
                <h2 className="text-center text-white mb-0">
                  <i className="bi bi-envelope-paper me-2"></i>
                  Contact Us
                </h2>
              </div>
              <div className="card-body p-5" style={{ backgroundColor: '#f9fafb' }}>
                <form>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="name" className="form-label fw-medium text-amber-900 mb-2">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control py-3"
                          id="name"
                          placeholder="Enter your name"
                          style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="email" className="form-label fw-medium text-amber-900 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control py-3"
                          id="email"
                          placeholder="Enter your email"
                          style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label htmlFor="subject" className="form-label fw-medium text-amber-900 mb-2">
                          Subject
                        </label>
                        <input
                          type="text"
                          className="form-control py-3"
                          id="subject"
                          placeholder="What's this about?"
                          style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                        />
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-group">
                        <label htmlFor="message" className="form-label fw-medium text-amber-900 mb-2">
                          Message
                        </label>
                        <textarea
                          className="form-control"
                          id="message"
                          rows={5}
                          placeholder="Type your message here..."
                          style={{ borderColor: '#d1d5db', backgroundColor: '#f3f4f6' }}
                        ></textarea>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="newsletter"
                          style={{ borderColor: '#d1d5db' }}
                        />
                        <label className="form-check-label text-amber-900 ms-2" htmlFor="newsletter">
                          Subscribe to our newsletter
                        </label>
                      </div>
                    </div>
                    <div className="col-12 text-center mt-4">
                      <button
                        type="submit"
                        className="btn px-5 py-3"
                        style={{
                          backgroundColor: '#d4a762',
                          borderColor: '#b88c4a',
                          color: '#ffffff',
                          fontSize: '1.1rem'
                        }}
                      >
                        <i className="bi bi-send-check me-2"></i>
                        Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-control:focus, .form-select:focus {
          border-color: #d4a762;
          box-shadow: 0 0 0 0.25rem rgba(212, 167, 98, 0.25);
        }
        .btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
      `}</style>
    </div>
  );
};

export default ContactForm;