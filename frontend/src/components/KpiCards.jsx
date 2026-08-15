import React from 'react';
import { Building2, AlertTriangle, Coins, TrendingUp } from 'lucide-react';

export default function KpiCards({ stats, isLoading }) {
  if (isLoading && !stats) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="kpi-card" style={{ opacity: 0.6 }}>
            <div className="kpi-label">Yuklanmoqda...</div>
            <div className="kpi-value">---</div>
          </div>
        ))}
      </div>
    );
  }

  const formatUZS = (val) => {
    if (!val) return '0 UZS';
    if (val >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(2)} mlrd UZS`;
    }
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)} mln UZS`;
    }
    return `${val.toLocaleString()} UZS`;
  };

  const highRiskPct = stats?.total_businesses 
    ? ((stats.high_risk_count / stats.total_businesses) * 100).toFixed(1)
    : 0;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Monitoringdagi Korxonalar</span>
          <Building2 size={16} color="var(--text-muted)" />
        </div>
        <div className="kpi-value">{stats?.total_businesses || 0}</div>
        <div className="kpi-subtext">
          <span>Qashqadaryo bo‘yicha faol subyektlar</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Yuqori Xavf Belgisi (High Risk)</span>
          <AlertTriangle size={16} color="var(--risk-high-badge)" />
        </div>
        <div className="kpi-value" style={{ color: 'var(--risk-high-badge)' }}>
          {stats?.high_risk_count || 0}
        </div>
        <div className="kpi-subtext">
          <span>Jami korxonalarning <strong>{highRiskPct}%</strong> qismi</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">Yashirin Aylanma Hajmi (Est.)</span>
          <Coins size={16} color="var(--risk-med-badge)" />
        </div>
        <div className="kpi-value">{formatUZS(stats?.est_shadow_volume)}</div>
        <div className="kpi-subtext">
          <span>POS/e-wallet vs Soliq deklaratsiyasi farqi</span>
        </div>
      </div>

      <div className="kpi-card">
        <div className="kpi-card-header">
          <span className="kpi-label">O‘rtacha Sektor Gap Nisbati</span>
          <TrendingUp size={16} color="var(--text-muted)" />
        </div>
        <div className="kpi-value">{stats?.avg_gap_ratio ? `${stats.avg_gap_ratio}x` : '1.0x'}</div>
        <div className="kpi-subtext">
          <span>Haqiqiy aylanma / Deklaratsiya ko‘rsatkichi</span>
        </div>
      </div>
    </div>
  );
}
