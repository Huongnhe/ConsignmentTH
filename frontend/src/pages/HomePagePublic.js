import React, { useContext, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import NavbarUser from "./MenuUser";

const PublicPage = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [showHero, setShowHero] = useState(false);

  // Brand story data (same as HomePage)
  const brandSections = [
    {
      title: "Our Heritage",
      content: "Founded in 2010, TH Consignment has grown from a small Hanoi boutique to Vietnam's most trusted luxury resale platform. Our rigorous authentication process is recognized by international luxury houses.",
      image: "https://images.unsplash.com/photo-1601924638867-3a6de6b7a500?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      position: "left"
    },
    {
      title: "Authentication Process",
      content: "Every item undergoes a 42-point inspection by our master authenticators. We accept only pieces that meet our exacting standards for quality and condition.",
      image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?ixlib=rb-4.0.3&auto=format&fit=crop&w=688&q=80",
      position: "right"
    },
    {
      title: "Global Network",
      content: "While rooted in Vietnam, our clientele spans across Asia, Europe and North America. We provide bilingual service in Vietnamese and English.",
      image: "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
      position: "left"
    }
  ];

  useEffect(() => {
    if (user) {
      navigate("/");
    }

    // Check sessionStorage (will auto-reset when tab closes)
    const hasSeenHero = sessionStorage.getItem('hasSeenHero');
    if (!hasSeenHero) {
      setShowHero(true);
      sessionStorage.setItem('hasSeenHero', 'true');
    }
  }, [user, navigate]);

  const handleCloseHero = () => {
    setShowHero(false);
  };

  return (
    <div className="luxury-theme" style={{ backgroundColor: "#FFF9F0", minHeight: "100vh" }}>
      <NavbarUser />

      {/* Hero Section (only shows on first visit) */}
      {showHero ? (
        <div className="d-flex justify-content-center align-items-center vh-100">
          <div className="text-center" style={{ maxWidth: "800px" }}>
            <div className="logo-container mb-4 mx-auto"
              style={{
                width: "100px",
                height: "100px",
                backgroundColor: "#FFF9F0",
                color: "#5A4A3A",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #D4B483",
                margin: "0 auto"
              }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "2.5rem",
                fontWeight: "700",
                lineHeight: "1"
              }}>TH</span>
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: "700",
              color: "#5A4A3A",
              letterSpacing: "1px",
              marginBottom: "1.5rem"
            }}>TH WORLD</h1>

            <p style={{
              color: "#8A7B6D",
              fontSize: "1.25rem",
              fontWeight: "300",
              marginBottom: "2.5rem",
              maxWidth: "600px",
              marginLeft: "auto",
              marginRight: "auto"
            }}>Vietnam's Premier Luxury Consignment Platform</p>

            <div>
              <Link
                to="/login"
                className="btn me-3 px-4 py-2"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "500",
                  backgroundColor: "#D4B483",
                  color: "#FFF",
                  border: "none",
                  minWidth: "200px"
                }}
                onClick={handleCloseHero}
              >
                LOGIN TO CONTINUE
              </Link>

              <button
                className="btn px-4 py-2"
                onClick={handleCloseHero}
                style={{
                  letterSpacing: "1px",
                  fontWeight: "500",
                  backgroundColor: "transparent",
                  color: "#8A7B6D",
                  border: "1px solid #E0D6C2",
                  minWidth: "200px"
                }}
              >
                OUR STORY
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-12 text-center mb-5">
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                color: "#5A4A3A",
                fontWeight: "700",
                letterSpacing: "1px"
              }}>WELCOME TO TH CONSIGNMENT</h2>
              <div style={{
                width: "80px",
                height: "2px",
                backgroundColor: "#D4B483",
                margin: "1rem auto"
              }}></div>
              <p className="lead mb-4" style={{ color: "#8A7B6D" }}>
                Please login to access our consignment services
              </p>
              <Link
                to="/login"
                className="btn px-4 py-2"
                style={{
                  letterSpacing: "1px",
                  fontWeight: "500",
                  backgroundColor: "#5A4A3A",
                  color: "#FFF",
                  border: "none"
                }}
              >
                LOGIN NOW
              </Link>
            </div>
          </div>

          {brandSections.map((section, index) => (
            <div
              key={index}
              className={`row justify-content-center mb-5 ${index % 2 === 0 ? '' : 'flex-row-reverse'}`}
            >
              <div className="col-md-5 mb-4 mb-md-0">
                <div className="h-100 d-flex flex-column justify-content-center">
                  <h3 style={{
                    fontFamily: "'Playfair Display', serif",
                    color: "#5A4A3A",
                    fontWeight: "700",
                    marginBottom: "1.5rem"
                  }}>{section.title}</h3>
                  <p style={{
                    color: "#8A7B6D",
                    lineHeight: "1.8",
                    marginBottom: "2rem"
                  }}>{section.content}</p>
                </div>
              </div>

              <div className="col-md-5">
                <div style={{
                  height: "350px",
                  backgroundImage: `url(${section.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "8px",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)"
                }}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PublicPage;