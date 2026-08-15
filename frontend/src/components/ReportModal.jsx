import React, { useState, useEffect } from 'react';
import { X, RefreshCw, AlertCircle, FileCheck, Building } from 'lucide-react';
import { fetchBusinessReport } from '../api/client';

export default function ReportModal({ business, onClose }) {
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegenerating, setIsRegenerating] = useState(false);

  useEffect(() => {
    if (!business) return;
    setIsLoading(true);
    fetchBusinessReport(business.business_id)
      .then((data) => {
        setReportData(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, [business]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const data = await fetchBusinessReport(business.business_id, true);
      setReportData(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (!business) return null;

  const formatUZS = (val) => {
    if (!val || val === 0) return '0 UZS';
    return `${Number(val).toLocaleString()} UZS`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="business-code" style={{ fontSize: '15px' }}>{business.business_id}</span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {business.name}
              </span>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {business.district} tumani &bull; {business.sector_display}
            </span>
          </div>

          <button 
            className="btn-base btn-outline" 
            style={{ padding: '6px 8px' }}
            onClick={onClose}
          >
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Key Metrics Comparison Grid */}
          <div className="comparison-grid">
            <div className="comparison-box">
              <span className="comparison-box-title">Oylik Deklaratsiya (Soliq)</span>
              <span className="comparison-box-val" style={{ color: business.registered ? 'inherit' : 'var(--risk-high-badge)' }}>
                {business.registered ? formatUZS(business.declared_revenue) : '0 UZS (No-legal)'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Xodimlar: {business.declared_employees} nafar
              </span>
            </div>

            <div className="comparison-box">
              <span className="comparison-box-title">Kuzatilgan POS / E-Wallet</span>
              <span className="comparison-box-val" style={{ color: 'var(--text-primary)' }}>
                {formatUZS(business.observed_volume)}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {business.transaction_count?.toLocaleString() || 0} ta tranzaksiya
              </span>
            </div>

            <div className="comparison-box">
              <span className="comparison-box-title">Farq Ko‘rsatkichi (Gap Ratio)</span>
              <span className="comparison-box-val" style={{ color: business.gap_ratio >= 2.0 ? 'var(--risk-high-badge)' : 'inherit' }}>
                {business.gap_ratio?.toFixed(2)}x
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Sektor bo‘yicha o‘rtacha: {business.sector_avg_gap || 1.1}x
              </span>
            </div>

            <div className="comparison-box">
              <span className="comparison-box-title">Xavf Darajasi & Z-Score</span>
              <span className="comparison-box-val" style={{ textTransform: 'uppercase', color: business.tier === 'high' ? 'var(--risk-high-badge)' : 'inherit' }}>
                {business.tier} Risk ({((business.risk_score || 0) * 100).toFixed(0)}%)
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Z-Score: {business.z_score ? business.z_score.toFixed(2) : '+0.00'}
              </span>
            </div>
          </div>

          {/* AI Compliance Report Box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={16} color="var(--text-primary)" />
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                  Sun'iy Intellekt Audit Xulosasi (AI Financial Compliance Report)
                </span>
              </div>

              <button
                className="btn-base btn-outline"
                style={{ fontSize: '11px', padding: '4px 10px' }}
                onClick={handleRegenerate}
                disabled={isRegenerating || isLoading}
              >
                <RefreshCw size={11} className={isRegenerating ? 'animate-spin' : ''} />
                <span>Qayta baholash</span>
              </button>
            </div>

            {isLoading ? (
              <div className="report-markdown-box" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                Xulosa tahlil qilinmoqda...
              </div>
            ) : reportData?.report_text ? (
              <div className="report-markdown-box">
                {reportData.report_text}
              </div>
            ) : (
              <div className="report-markdown-box" style={{ color: 'var(--text-muted)' }}>
                Hisobot mavjud emas. Yuqoridagi tugma orqali tahlilni boshlang.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
