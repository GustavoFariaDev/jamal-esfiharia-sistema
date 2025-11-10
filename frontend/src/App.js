import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import AdminPanel from "./components/AdminPanel";
import AdminLogin from "./components/AdminLogin";
import FullMenu from "./components/FullMenu";
import ConsultarStatus from "./components/ConsultarStatus";
import AcompanhamentoPedido from "./components/AcompanhamentoPedido";

import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import NetworkStatus from "./components/NetworkStatus";
import { ToastProvider } from "./contexts/ToastContext";

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="App">
          <BrowserRouter>
            <NetworkStatus />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/menu" element={<FullMenu />} />
              <Route path="/cardapio" element={<FullMenu />} />
              <Route path="/status" element={<ConsultarStatus />} />
              <Route path="/consultar-status" element={<ConsultarStatus />} />
              <Route path="/acompanhar-pedido" element={<AcompanhamentoPedido />} />
              <Route path="/meu-pedido" element={<AcompanhamentoPedido />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminPanel />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;