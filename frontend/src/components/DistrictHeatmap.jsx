import React from 'react';
import { MapPin } from 'lucide-react';

export default function DistrictHeatmap({ 
  districts, 
  selectedDistrict, 
  onSelectDistrict 
}) {
  const getRiskColor = (pct) => {
    if (pct >= 40) return { bar: 'var(--risk-high-badge)', text: 'var(--risk-high-text)', bg: 'var(--risk-high-bg)', border: 'var(--risk-high-border)' };
    if (pct >= 25) return { bar: 'var(--risk-med-badge)', text: 'var(--risk-med-text)', bg: 'var(--risk-med-bg)', border: 'var(--risk-med-border)' };
    return { bar: 'var(--risk-low-badge)', text: 'var(--risk-low-text)', bg: 'var(--risk-low-bg)', border: 'var(--risk-low-border)' };
  };

  return (
    <section className="district-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Tumanlar Bo‘yicha Xavf Xaritasi (Heatmap Rollup)</h2>
          <p className="section-subtitle">
            Haqiqiy tranzaksiyalar va deklaratsiyalar asosidagi norasmiy iqtisodiyot ulushi
          </p>
        </div>
        {selectedDistrict && selectedDistrict !== 'all' && (
          <button 
            className="btn-base btn-outline" 
            style={{ fontSize: '11px', padding: '4px 10px' }}
            onClick={() => onSelectDistrict('all')}
          >
            Filtrni bekor qilish ({selectedDistrict})
          </button>
        )}
      </div>

      <div className="districts-grid">
        {districts.map((d) => {
          const colors = getRiskColor(d.informal_economy_pct);
          const isSelected = selectedDistrict === d.district;

          return (
            <div 
              key={d.district} 
              className={`district-card ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectDistrict(isSelected ? 'all' : d.district)}
              style={isSelected ? { borderColor: colors.bar, backgroundColor: 'var(--bg-card-hover)' } : {}}
            >
              <div className="district-card-top">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="var(--text-muted)" />
                  <span className="district-name">{d.district}</span>
                </div>
                <span 
                  className="district-badge"
                  style={{ backgroundColor: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                >
                  {d.informal_economy_pct}% Norasmiy
                </span>
              </div>

              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(100, d.informal_economy_pct * 1.5)}%`, backgroundColor: colors.bar }}
                />
              </div>

              <div className="district-stats-row">
                <span>Jami: <strong>{d.total_businesses}</strong></span>
                <span>Yuqori xavf: <strong style={{ color: d.high_risk_count > 0 ? 'var(--risk-high-badge)' : 'inherit' }}>{d.high_risk_count}</strong></span>
                <span>Gap: <strong>{d.weighted_gap_ratio}x</strong></span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
