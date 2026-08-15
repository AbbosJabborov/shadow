import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import DistrictHeatmap from './components/DistrictHeatmap';
import BusinessTable from './components/BusinessTable';
import ReportModal from './components/ReportModal';
import { 
  fetchStats, 
  fetchDistrictsSummary, 
  fetchBusinesses, 
  runScoringAnalysis 
} from './api/client';

export default function App() {
  const [theme, setTheme] = useState('light');
  const [stats, setStats] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  const [filters, setFilters] = useState({
    tier: 'all',
    district: 'all',
    sector: 'all',
    search: '',
  });

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Load all initial data
  const loadDashboardData = useCallback(async () => {
    try {
      const [statsData, districtsData] = await Promise.all([
        fetchStats(),
        fetchDistrictsSummary(),
      ]);
      setStats(statsData);
      setDistricts(districtsData);
    } catch (err) {
      console.error('Error loading summary stats:', err);
    }
  }, []);

  // Load businesses with filters
  const loadBusinesses = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchBusinesses(filters);
      setBusinesses(data);
    } catch (err) {
      console.error('Error fetching businesses:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    loadBusinesses();
  }, [loadBusinesses]);

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await runScoringAnalysis();
      await Promise.all([loadDashboardData(), loadBusinesses()]);
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="app-container">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onRunAnalysis={handleRunAnalysis}
        isAnalyzing={isAnalyzing}
      />

      <KpiCards stats={stats} isLoading={isLoading && !stats} />

      <DistrictHeatmap
        districts={districts}
        selectedDistrict={filters.district}
        onSelectDistrict={(dist) => handleFilterChange({ district: dist })}
      />

      <BusinessTable
        businesses={businesses}
        isLoading={isLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSelectBusiness={(b) => setSelectedBusiness(b)}
      />

      {selectedBusiness && (
        <ReportModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
    </div>
  );
}
