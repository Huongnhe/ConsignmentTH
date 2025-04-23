import React from "react";

const Footer = () => {
    return (
        <footer className="bg-dark text-white pt-4 mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-md-6 mb-4">
                        <h5>Cửa hàng ký gửi TH</h5>
                        <p>Địa chỉ: 99 Đ. Nguyễn Chí Thanh, Láng Hạ, Đống Đa, Hà Nội , Việt Nam</p>
                        <p>Email: contact@THstore.vn</p>
                        <p>Điện thoại: 0123 456 789</p>
                    </div>
                    <div className="col-md-6 mb-4">
                        <h5>Vị trí cửa hàng</h5>
                        <div className="ratio ratio-4x3">
                            <iframe
                                title="Google Map"             
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14896.821776544346!2d105.79376432968857!3d21.02446413858829!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ab672f111093%3A0x61d52fd7f92e046!2zS8O9IHTDumMgeMOhIMSQ4bqhaSBo4buNYyBHaWFvIFRow7RuZw!5e0!3m2!1svi!2s!4v1745374644545!5m2!1svi!2s"
                                width="100%"
                                height="100%"
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                style={{ border: 0 }}
                            ></iframe>
                        </div>
                    </div>
                </div>

                <div className="text-center py-3 border-top">
                    &copy; {new Date().getFullYear()} Cửa hàng ký gửi TH. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
