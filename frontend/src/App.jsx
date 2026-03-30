import { Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import OfferDashboardPage from "./pages/OfferDashboardPage";
import SalaryEstimatorPage from "./pages/SalaryEstimatorPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/salary" element={<SalaryEstimatorPage />} />
        <Route path="/offers" element={<OfferDashboardPage />} />
      </Routes>
    </Layout>
  );
}
