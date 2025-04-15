  import React, { useContext, useState, useEffect } from "react";
  import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
  import LoginPage from "./pages/LoginPage";
  import HomePageUser from "./pages/HomePageUser";
  import RegisterPage from "./pages/RegisterPage";
  import HomePageAdmin from "./pages/HomePageAdmin";
  import ConsignPage from "./pages/ConsignPage";
  import OrderStatusPage from "./pages/OrderStatusPage";
  import { AuthProvider, AuthContext } from "./context/AuthContext";
  import { ConsignProvider } from "./context/AuthConsign";
  import createConsign from "./pages/CreateConsign";
  const PrivateRoute = ({ element, account }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
      return <Navigate to="/login" />;
    }

    if (account && user.Account !== account) {
      return <Navigate to="/home" />;
    }

    return element;
  };

  const App = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      setTimeout(() => {
        setLoading(false);
      }, 500);
    }, []);

    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin" element={<PrivateRoute element={<HomePageAdmin />} account="Manager" />} />
            <Route path="/home" element={<HomePageUser />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/consigns"
              element={
                loading ? (
                  <div>Loading...</div>
                ) : (
                  <ConsignProvider>
                    <ConsignPage />
                  </ConsignProvider>
                )
              }
            />
            <Route path="/create-consign" element={<createConsign />} />
            {/* <Route path="/status" element={<OrderStatusPage />} /> */}
          </Routes>
        </Router>
      </AuthProvider>
    );
  };

  export default App;
