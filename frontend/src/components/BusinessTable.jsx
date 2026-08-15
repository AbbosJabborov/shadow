import React from 'react';
import { Search, FileText, AlertCircle, CheckCircle2, ShieldOff } from 'lucide-react';

export default function BusinessTable({
  businesses,
  isLoading,
  filters,
  onFilterChange,
  onSelectBusiness,
}) {
  const formatMoney = (val) => {
    if (!val || val === 0) return '0 UZS';
    if (val >= 1_000_000_000) return `${(val / 1_000_000_000).toFixed(2)} mlrd UZS`;
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)} mln UZS`;
    return `${val.toLocaleString()} UZS`;
  };

  const getTierBadge = (tier, registered) => {
    if (!registered) {
      return (
        <span className="badge badge-unregistered">
          <ShieldOff size={11} /> Ro‘yxatdan o‘tmagan
        </span>
      );
    }
    if (tier === 'high') {
      return (
        <span className="badge badge-high">
          <AlertCircle size={11} /> Yuqori Xavf
        </span>
      );
    }
    if (tier === 'medium') {
      return (
        <span className="badge badge-medium">
          O‘rta Xavf
        </span>
      );
    }
    return (
      <span className="badge badge-low">
        <CheckCircle2 size={11} /> Quyi Xavf
      </span>
    );
  };

  const getGapClass = (ratio) => {
    if (ratio >= 3.0) return 'gap-high';
    if (ratio >= 1.5) return 'gap-medium';
    return 'gap-low';
  };

  return (
    <div className="table-panel">
      <div className="table-toolbar">
        <div className="toolbar-left">
          <div className="search-input-wrapper">
            <Search size={14} className="search-icon" />
            <input
              type="text"
              placeholder="Nomi, ID yoki Tuman bo‘yicha qidirish..."
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value })}
            />
          </div>

          <select
            className="filter-select"
            value={filters.district || 'all'}
            onChange={(e) => onFilterChange({ district: e.target.value })}
          >
            <option value="all">Barcha Tumanlar</option>
            <option value="Qarshi">Qarshi</option>
            <option value="Shahrisabz">Shahrisabz</option>
            <option value="Kitob">Kitob</option>
            <option value="Koson">Koson</option>
            <option value="G'uzor">G'uzor</option>
          </select>

          <select
            className="filter-select"
            value={filters.sector || 'all'}
            onChange={(e) => onFilterChange({ sector: e.target.value })}
          >
            <option value="all">Barcha Sohalar</option>
            <option value="retail">Chakana Savdo</option>
            <option value="food_service">Umumiy Ovqatlanish</option>
            <option value="services">Xizmat Ko‘rsatish</option>
            <option value="trade">Ulgurji Savdo</option>
            <option value="construction">Qurilish</option>
          </select>
        </div>

        <div className="tab-group">
          {[
            { key: 'all', label: 'Barchasi' },
            { key: 'high', label: 'Yuqori Xavf' },
            { key: 'medium', label: 'O‘rta' },
            { key: 'low', label: 'Quyi' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`tab-btn ${(filters.tier || 'all') === tab.key ? 'active' : ''}`}
              onClick={() => onFilterChange({ tier: tab.key })}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Korxona Nomi & Soha</th>
              <th>Tuman</th>
              <th>Deklaratsiya (Oylik)</th>
              <th>Kuzatilgan POS Hajmi</th>
              <th>Farq (Gap Ratio)</th>
              <th>Xavf Holati</th>
              <th style={{ textAlign: 'right' }}>Amal</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Ma'lumotlar yuklanmoqda...
                </td>
              </tr>
            ) : businesses.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  Filtr bo‘yicha korxonalar topilmadi.
                </td>
              </tr>
            ) : (
              businesses.map((b) => (
                <tr key={b.business_id}>
                  <td className="business-code">{b.business_id}</td>
                  <td>
                    <div className="business-name-cell">
                      <span className="business-title">{b.name}</span>
                      <span className="business-subtitle">
                        {b.sector_display} &bull; {b.declared_employees} xodim
                      </span>
                    </div>
                  </td>
                  <td>{b.district}</td>
                  <td>
                    {b.registered ? formatMoney(b.declared_revenue) : (
                      <span style={{ color: 'var(--risk-high-badge)', fontWeight: 600 }}>0 UZS (Mavjud emas)</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {formatMoney(b.observed_volume)}
                  </td>
                  <td>
                    <span className={`gap-indicator ${getGapClass(b.gap_ratio)}`}>
                      {b.gap_ratio.toFixed(2)}x
                    </span>
                  </td>
                  <td>
                    {getTierBadge(b.tier, b.registered)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn-base btn-outline"
                      style={{ fontSize: '11px', padding: '5px 10px' }}
                      onClick={() => onSelectBusiness(b)}
                    >
                      <FileText size={12} />
                      <span>{b.has_report ? 'AI Xulosa' : 'Tahlil Qilish'}</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
