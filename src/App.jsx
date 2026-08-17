import { Route, Routes } from "react-router-dom"

import { AppLayout } from "@/components/layout/app-layout"
import LandingPage from "@/pages/landing"
import DashboardPage from "@/pages/dashboard"
import BusinessesPage from "@/pages/businesses"
import BusinessDetailPage from "@/pages/business-detail"
import RegionDetailPage from "@/pages/region-detail"
import NotFoundPage from "@/pages/not-found"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/regions/:id" element={<RegionDetailPage />} />
        <Route path="/businesses" element={<BusinessesPage />} />
        <Route path="/businesses/:id" element={<BusinessDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

