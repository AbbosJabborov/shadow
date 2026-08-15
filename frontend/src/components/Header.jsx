import React from 'react';
import { ShieldAlert, RefreshCw, Sun, Moon, Database } from 'lucide-react';

export default function Header({ 
  theme, 
  onToggleTheme, 
  onRunAnalysis, 
  isAnalyzing 
}) {
  return (
    <header className="app-header">
      <div className="header-brand">
        <div className="radar-logo-badge">
          <ShieldAlert size={22} />
        </div>
        <div className="header-title-group">
          <h1>Shadow Economy Radar</h1>
          <p>Davlat Soliq Qo‘mitasi &bull; Qashqadaryo Viloyati Iqtisodiy Monitoring Tizimi</p>
        </div>
      </div>

      <div className="header-actions">
        <button 
          className="btn-base btn-primary"
          onClick={onRunAnalysis}
          disabled={isAnalyzing}
          title="Recalculate statistical z-scores and gap ratios across all monitored businesses"
        >
          <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
          {isAnalyzing ? 'Tahlil Qilinmoqda...' : 'Tahlilni Yangilash'}
        </button>

        <button 
          className="btn-base btn-outline"
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Kunduzgi rejimga o‘tish' : 'Tungi rejimga o‘tish'}
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
          <span>{theme === 'dark' ? 'Day Mode' : 'Dark Mode'}</span>
        </button>
      </div>
    </header>
  );
}
