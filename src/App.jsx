import React, { useState, useMemo, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import {
  LayoutDashboard, Factory, FileText, History, Download,
  AlertTriangle, CheckCircle2, X, Droplet, Zap, Save, Upload,
  TrendingUp, TrendingDown, Database, Building2, Flame,
  Beaker, Package, Truck, FileDown, Boxes, Edit3
} from 'lucide-react';

// ============================================================================
// BRAND TOKENS
// ============================================================================
const C = {
  bg: '#F6F5F0',
  card: '#FFFFFF',
  sidebar: '#0C2C36',
  sidebarHover: '#163B47',
  text: '#1A2332',
  textMuted: '#6B7280',
  textLight: '#9CA3AF',
  border: '#E8E6DE',
  borderStrong: '#D4D2C8',
  primary: '#1B6770',
  primaryDark: '#114C53',
  primaryLight: '#E5F0F1',
  accent: '#C8924B',
  oil: '#D4A24F',
  ghee: '#8B5A2B',
  soap: '#6B7BA8',
  mustard: '#A8842B',
  ryk: '#1B6770',
  skr: '#5B7C99',
  electricity: '#C8924B',
  gas: '#B85450',
  steam: '#5B7C99',
  water: '#1B6770',
  solar: '#E8B547',
  wapda: '#5B7C99',
  generator: '#8B5A2B',
  success: '#4A7C59',
  warning: '#C8924B',
  danger: '#B85450',
};

// ============================================================================
// SHARED STYLES
// ============================================================================
const LBL_STYLE = {
  fontSize: 11.5, fontWeight: 500, color: C.textMuted, display: 'block',
  marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em',
};
const INPUT_STYLE = {
  width: '100%', padding: '9px 12px', fontSize: 13.5,
  border: `1.5px solid ${C.border}`, borderRadius: 7,
  fontFamily: 'Sora, sans-serif', color: C.text,
  background: '#fff', outline: 'none', boxSizing: 'border-box',
};
const CELL_INPUT = {
  width: 110, padding: '7px 9px', fontSize: 12.5,
  border: `1px solid ${C.border}`, borderRadius: 5,
  fontFamily: 'Sora, sans-serif', color: C.text,
  background: '#fff', outline: 'none', textAlign: 'right',
  boxSizing: 'border-box',
};
const TBL_STYLE = { width: '100%', fontSize: 12.5, borderCollapse: 'collapse' };
const TH_STYLE = {
  textAlign: 'left', padding: '10px 9px', fontSize: 10.5, fontWeight: 600,
  color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em',
};
const TD_STYLE = { padding: '10px 9px', color: C.text, fontWeight: 500 };
const TD_STYLE_MUTED = { padding: '10px 9px', color: C.textMuted };
const TD_STYLE_NUM = { padding: '10px 9px', fontFamily: 'Sora, sans-serif', color: C.text };
const GRID_2 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 };
const BTN_PRIMARY = {
  width: '100%', padding: '10px 14px', background: C.primary, color: '#fff',
  border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  fontFamily: 'inherit',
};
const BTN_OUTLINE = {
  width: '100%', padding: '10px 14px', background: '#fff', color: C.primaryDark,
  border: `1.5px solid ${C.primary}`, borderRadius: 7, cursor: 'pointer',
  fontSize: 13, fontWeight: 500,
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
  fontFamily: 'inherit',
};

// ============================================================================
// EMPTY RECORD STRUCTURE
// ============================================================================
const createEmptyRecord = (plant, dateStr) => ({
  id: `${plant}-${dateStr}`,
  uploadDate: dateStr,
  reportDate: dateStr,
  plant,
  fileName: `${plant}_${dateStr}`,
  status: 'processed',
  data: {
    production: {
      cr_chemical_oil: { standard: 200, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      cr_physical_ghee: { standard: 210, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      cr_physical_oil: { standard: 200, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      br_hydrogenation: { standard: 180, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      br_blending: { standard: 230, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      br_final_deo_ghee: { standard: 180, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      br_final_deo_oil: { standard: 17, actual: 0, mtd: 0, downtime: 0, remarks: '' },
    },
    filling: {
      ryk_oil: 0, ryk_ghee: 0, ryk_total: 0, ryk_mtd: 0,
      skr_oil: 0, skr_ghee: 0, skr_total: 0, skr_mtd: 0,
      total_oil: 0, total_ghee: 0, grand_total: 0,
      brands: {
        shahbaz_ghee: 0, shahbaz_oil: 0,
        gharana_ghee: 0, gharana_oil: 0,
        rite_ghee: 0, rite_oil: 0,
      },
    },
    soap: { total_actual: 0, total_mtd: 0, forecast: 0, compliance: 0 },
    mustard: {
      ml_125: 0, ml_250: 0, ml_500: 0, ml_1000: 0,
      total_kg: 0, mtd_kg: 0, dispatch_kg: 0, mtd_dispatch_kg: 0,
    },
    utilities: {
      electricity: { wapda_peak: 0, wapda_offpeak: 0, generator: 0, solar: 0, total: 0, mtd: 0 },
      naturalGas: { boiler: 0, cr: 0, hydrogen: 0, remaining: 0, total: 0, mtd: 0 },
      steam: { cr: 0, br: 0, soap: 0, gasPlant: 0, total: 0, mtd: 0 },
      water: { ro_plant1: 0, ro_plant2: 0, total: 0, mtd: 0 },
      diesel: { total: 0, mtd: 0, vehicle: 0, genset: 0 },
      hydrogen_lb: 0, hydrogen_mtd: 0, furnaceOil: 0,
    },
    stock: {
      fg_ghee: 0, fg_oil: 0, packable_ghee: 0, packable_oil: 0,
      hard_blended_ghee: 0, hard_ghee: 0, mustard_packable: 0, ost_total: 0,
      ost_breakdown: { olein: 0, rbd: 0, canola: 0, soybean: 0, cottonseed: 0 },
    },
    quality: {
      cr_samples_passed: 0, cr_samples_failed: 0,
      br_samples_passed: 0, br_samples_failed: 0,
      avg_ffa: 0, avg_color_red: 0, avg_color_yellow: 0,
      avg_mp: 0, avg_pv: 0, customer_complaints: 0,
    },
    maintenance: { total_complaints: 0, total_completed: 0, mtd_complaints: 0, mtd_completed: 0 },
    dispatch: { ghee_consumer: 0, oil_consumer: 0, rso: 0, soap: 0, total_mt: 0, vehicles: 0 },
  },
});

// ============================================================================
// DEMO DATA — for first-time users to see the dashboard with sample numbers
// ============================================================================
const generateDemoData = () => {
  const today = new Date();
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const isSunday = d.getDay() === 0;

    ['RYK', 'SKR'].forEach(plant => {
      const base = plant === 'RYK' ? 1 : 0.78;
      const noise = () => 0.92 + Math.random() * 0.16;
      const downFactor = isSunday ? 0.3 : 1;
      const rec = createEmptyRecord(plant, dateStr);

      rec.data.production.cr_chemical_oil.actual = Math.random() > 0.3 ? Math.round(220 * base * noise() * downFactor) : 0;
      rec.data.production.cr_physical_ghee.actual = Math.round(220 * base * noise() * downFactor);
      rec.data.production.cr_physical_oil.actual = Math.random() > 0.4 ? Math.round(195 * base * noise() * downFactor) : 0;
      rec.data.production.br_hydrogenation.actual = Math.round(160 * base * noise() * downFactor);
      rec.data.production.br_blending.actual = Math.round(290 * base * noise() * downFactor);
      rec.data.production.br_final_deo_ghee.actual = Math.random() > 0.6 ? Math.round(150 * base * noise()) : 0;

      const rykOil = plant === 'RYK' ? Math.round(15 * noise() * downFactor) : 0;
      const rykGhee = plant === 'RYK' ? Math.round(140 * noise() * downFactor) : 0;
      const skrOil = plant === 'SKR' ? (Math.random() > 0.5 ? Math.round(7 * noise()) : 0) : 0;
      rec.data.filling = {
        ryk_oil: rykOil, ryk_ghee: rykGhee, ryk_total: rykOil + rykGhee, ryk_mtd: 4632 * (i / 30),
        skr_oil: skrOil, skr_ghee: 0, skr_total: skrOil, skr_mtd: 123 * (i / 30),
        total_oil: rykOil + skrOil, total_ghee: rykGhee, grand_total: rykOil + rykGhee + skrOil,
        brands: {
          shahbaz_ghee: Math.round(rykGhee * 0.84),
          shahbaz_oil: Math.round((rykOil + skrOil) * 0.9),
          gharana_ghee: Math.round(rykGhee * 0.16),
          gharana_oil: Math.round((rykOil + skrOil) * 0.1),
          rite_ghee: 0, rite_oil: skrOil,
        },
      };

      if (plant === 'RYK') {
        rec.data.soap = {
          total_actual: Math.random() > 0.5 ? Math.round(3 * noise() * 100) / 100 : 0,
          total_mtd: 187, forecast: 256, compliance: 73.2,
        };
        rec.data.mustard = {
          ml_125: Math.random() > 0.7 ? 137 : 0,
          ml_250: Math.round(1218 * noise()),
          ml_500: Math.random() > 0.7 ? 109 : 0,
          ml_1000: Math.random() > 0.8 ? 75 : 0,
          total_kg: 1218, mtd_kg: 34589, dispatch_kg: 737, mtd_dispatch_kg: 33120,
        };
      }

      const wapdaPeak = Math.round((1750 + Math.random() * 800) * base);
      const wapdaOff = Math.round((7040 + Math.random() * 2500) * base);
      const solar = Math.round(1474 * base * (Math.random() * 0.6 + 0.4));
      rec.data.utilities = {
        electricity: {
          wapda_peak: wapdaPeak, wapda_offpeak: wapdaOff,
          generator: 0, solar: solar, total: wapdaPeak + wapdaOff + solar,
          mtd: 263475 * (i / 30),
        },
        naturalGas: {
          boiler: Math.round(298268 * base * noise()),
          cr: Math.round(17410 * base * noise()),
          hydrogen: Math.round(21930 * base * noise()),
          remaining: Math.round(170916 * base * noise()),
          total: Math.round(508524 * base * noise()),
          mtd: 16376642 * (i / 30) * base,
        },
        steam: {
          cr: Math.round(21 * base * noise()),
          br: Math.round(55 * base * noise()),
          soap: Math.round(Math.random() * 5),
          gasPlant: Math.round(11 * base * noise()),
          total: Math.round(87 * base * noise()),
          mtd: 3443 * (i / 30) * base,
        },
        water: { ro_plant1: 54, ro_plant2: 122, total: 176, mtd: 4949 * (i / 30) * base },
        diesel: { total: 147, mtd: 5186 * (i / 30), vehicle: 147, genset: 0 },
        hydrogen_lb: Math.round(1780 * base * noise()),
        hydrogen_mtd: 33895 * (i / 30) * base,
        furnaceOil: 0,
      };

      rec.data.stock = {
        fg_ghee: 374, fg_oil: 96, packable_ghee: 852, packable_oil: 739,
        hard_blended_ghee: 1036, hard_ghee: 916, mustard_packable: 39, ost_total: 3953,
        ost_breakdown: { olein: 1479, rbd: 1417, canola: 242, soybean: 98, cottonseed: 533 },
      };

      rec.data.dispatch = {
        ghee_consumer: Math.round(150 * base * noise() * downFactor),
        oil_consumer: Math.round(13 * base * noise() * downFactor),
        rso: Math.round(0.9 * noise()), soap: 0,
        total_mt: Math.round(164 * base * noise() * downFactor),
        vehicles: Math.round(19 * base * noise()),
      };

      data.push(rec);
    });
  }
  return data;
};

// ============================================================================
// HELPERS
// ============================================================================
const fmt = (n, dec = 0) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec });
};

const filterByPeriod = (records, period) => {
  const today = new Date();
  const cutoff = new Date(today);
  if (period === 'daily') cutoff.setDate(today.getDate() - 1);
  else if (period === 'weekly') cutoff.setDate(today.getDate() - 7);
  else if (period === 'monthly') cutoff.setDate(today.getDate() - 30);
  else if (period === 'quarterly') cutoff.setDate(today.getDate() - 90);
  else cutoff.setDate(today.getDate() - 365);
  return records.filter(r => new Date(r.reportDate) >= cutoff);
};

const groupByDate = (records) => {
  const map = {};
  records.forEach(r => {
    if (!map[r.reportDate]) {
      map[r.reportDate] = {
        date: r.reportDate, oil: 0, ghee: 0, soap: 0,
        electricity: 0, gas: 0, steam: 0, water: 0,
        wapda: 0, solar: 0, generator: 0,
        boiler_gas: 0, cr_gas: 0, h2_gas: 0, factory_gas: 0,
        hydrogen: 0, dispatch: 0, RYK: 0, SKR: 0,
      };
    }
    const e = map[r.reportDate];
    e.oil += r.data.filling.total_oil;
    e.ghee += r.data.filling.total_ghee;
    e.soap += r.data.soap.total_actual;
    e.electricity += r.data.utilities.electricity.total;
    e.gas += r.data.utilities.naturalGas.total;
    e.steam += r.data.utilities.steam.total;
    e.water += r.data.utilities.water.total;
    e.wapda += r.data.utilities.electricity.wapda_peak + r.data.utilities.electricity.wapda_offpeak;
    e.solar += r.data.utilities.electricity.solar;
    e.generator += r.data.utilities.electricity.generator;
    e.boiler_gas += r.data.utilities.naturalGas.boiler;
    e.cr_gas += r.data.utilities.naturalGas.cr;
    e.h2_gas += r.data.utilities.naturalGas.hydrogen;
    e.factory_gas += r.data.utilities.naturalGas.remaining;
    e.hydrogen += r.data.utilities.hydrogen_lb;
    e.dispatch += r.data.dispatch.total_mt;
    e[r.plant] = r.data.filling.grand_total;
  });
  return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
};

const aggregate = (records) => {
  const agg = {
    oil: 0, ghee: 0, soap: 0, mustard: 0,
    electricity: 0, gas: 0, steam: 0, water: 0,
    wapda: 0, solar: 0, generator: 0, hydrogen: 0,
    boiler_gas: 0, cr_gas: 0, h2_gas: 0, factory_gas: 0,
    cr_steam: 0, br_steam: 0, soap_steam: 0, gas_steam: 0,
    diesel: 0, dispatch: 0, vehicles: 0,
    cr_chemical_actual: 0, cr_physical_ghee_actual: 0, cr_physical_oil_actual: 0,
    br_hydro_actual: 0, br_blend_actual: 0, br_deo_actual: 0,
    cr_chemical_std: 0, cr_physical_ghee_std: 0, cr_physical_oil_std: 0,
    br_hydro_std: 0, br_blend_std: 0, br_deo_std: 0,
    count: 0,
  };
  records.forEach(r => {
    agg.oil += r.data.filling.total_oil;
    agg.ghee += r.data.filling.total_ghee;
    agg.soap += r.data.soap.total_actual;
    agg.mustard += r.data.mustard.total_kg / 1000;
    agg.electricity += r.data.utilities.electricity.total;
    agg.gas += r.data.utilities.naturalGas.total;
    agg.steam += r.data.utilities.steam.total;
    agg.water += r.data.utilities.water.total;
    agg.wapda += r.data.utilities.electricity.wapda_peak + r.data.utilities.electricity.wapda_offpeak;
    agg.solar += r.data.utilities.electricity.solar;
    agg.generator += r.data.utilities.electricity.generator;
    agg.hydrogen += r.data.utilities.hydrogen_lb;
    agg.boiler_gas += r.data.utilities.naturalGas.boiler;
    agg.cr_gas += r.data.utilities.naturalGas.cr;
    agg.h2_gas += r.data.utilities.naturalGas.hydrogen;
    agg.factory_gas += r.data.utilities.naturalGas.remaining;
    agg.cr_steam += r.data.utilities.steam.cr;
    agg.br_steam += r.data.utilities.steam.br;
    agg.soap_steam += r.data.utilities.steam.soap;
    agg.gas_steam += r.data.utilities.steam.gasPlant;
    agg.diesel += r.data.utilities.diesel.total;
    agg.dispatch += r.data.dispatch.total_mt;
    agg.vehicles += r.data.dispatch.vehicles;
    agg.cr_chemical_actual += r.data.production.cr_chemical_oil.actual;
    agg.cr_physical_ghee_actual += r.data.production.cr_physical_ghee.actual;
    agg.cr_physical_oil_actual += r.data.production.cr_physical_oil.actual;
    agg.br_hydro_actual += r.data.production.br_hydrogenation.actual;
    agg.br_blend_actual += r.data.production.br_blending.actual;
    agg.br_deo_actual += r.data.production.br_final_deo_ghee.actual + r.data.production.br_final_deo_oil.actual;
    agg.cr_chemical_std += r.data.production.cr_chemical_oil.standard;
    agg.cr_physical_ghee_std += r.data.production.cr_physical_ghee.standard;
    agg.cr_physical_oil_std += r.data.production.cr_physical_oil.standard;
    agg.br_hydro_std += r.data.production.br_hydrogenation.standard;
    agg.br_blend_std += r.data.production.br_blending.standard;
    agg.br_deo_std += r.data.production.br_final_deo_ghee.standard + r.data.production.br_final_deo_oil.standard;
    agg.count += 1;
  });
  agg.totalProduction = agg.oil + agg.ghee;
  return agg;
};

const computeAlerts = (records) => {
  const alerts = [];
  if (records.length < 2) return alerts;
  const trend = groupByDate(records).slice(-7);
  if (trend.length < 2) return alerts;
  const last = trend[trend.length - 1];
  const prevAvg = trend.slice(0, -1).reduce((s, r) => s + r.oil + r.ghee, 0) / (trend.length - 1);
  const lastTotal = last.oil + last.ghee;
  if (prevAvg > 0 && lastTotal < prevAvg * 0.85) {
    alerts.push({
      type: 'warning',
      title: 'Production below 7-day average',
      detail: `${last.date}: ${fmt(lastTotal)} MT vs avg ${fmt(prevAvg, 0)} MT (${fmt((lastTotal / prevAvg - 1) * 100, 1)}%)`,
    });
  }
  const elecPrev = trend.slice(0, -1).reduce((s, r) => s + r.electricity, 0) / (trend.length - 1);
  if (elecPrev > 0 && last.electricity > elecPrev * 1.15) {
    alerts.push({
      type: 'danger',
      title: 'Electricity consumption spike',
      detail: `${last.date}: ${fmt(last.electricity)} kWh — ${fmt((last.electricity / elecPrev - 1) * 100, 1)}% above average`,
    });
  }
  return alerts;
};

// ============================================================================
// SHARED COMPONENTS
// ============================================================================
const Sidebar = ({ page, setPage }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'production', icon: Factory, label: 'Production' },
    { id: 'filling', icon: Package, label: 'Filling & Brands' },
    { id: 'utilities', icon: Zap, label: 'Utilities' },
    { id: 'stock', icon: Boxes, label: 'Stock & Inventory' },
    { id: 'dispatch', icon: Truck, label: 'Dispatch' },
    { id: 'entry', icon: Edit3, label: 'Enter Daily Data' },
    { id: 'reports', icon: FileText, label: 'Generate Report' },
    { id: 'history', icon: History, label: 'History' },
  ];
  return (
    <aside style={{ background: C.sidebar, color: '#fff', width: 220, flexShrink: 0, padding: '24px 0', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: '0 18px 22px', borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, background: C.primary, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Factory size={17} color="#fff" />
          </div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600 }}>Ahmed Group</div>
            <div style={{ fontSize: 10.5, color: '#8FA8AE', letterSpacing: '0.06em' }}>OF INDUSTRIES</div>
          </div>
        </div>
      </div>
      <nav style={{ padding: '14px 10px', flex: 1 }}>
        {items.map(item => {
          const Icon = item.icon;
          const active = page === item.id;
          return (
            <button key={item.id} onClick={() => setPage(item.id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 11,
              padding: '10px 12px', borderRadius: 6, marginBottom: 2,
              background: active ? C.sidebarHover : 'transparent',
              color: active ? '#fff' : '#B0C2C7',
              border: 'none', cursor: 'pointer', fontSize: 13,
              fontWeight: active ? 500 : 400, textAlign: 'left',
              fontFamily: 'inherit',
            }}>
              <Icon size={15} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div style={{ padding: '14px 18px', fontSize: 10.5, color: '#6B848A', borderTop: `1px solid rgba(255,255,255,0.06)`, lineHeight: 1.5 }}>
        Group Technical Head<br />Console
      </div>
    </aside>
  );
};

const KPICard = ({ label, value, unit, sub, accent, icon: Icon }) => (
  <div style={{
    background: C.card, border: `1px solid ${C.border}`, borderRadius: 9,
    padding: '17px 19px', display: 'flex', flexDirection: 'column', gap: 6,
    minHeight: 105, position: 'relative', overflow: 'hidden',
  }}>
    {accent && <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: accent }} />}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <span style={{ fontSize: 11.5, color: C.textMuted, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
      {Icon && <Icon size={15} color={C.textLight} />}
    </div>
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 5 }}>
      <span style={{ fontSize: 24, fontWeight: 600, color: C.text, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>{value}</span>
      {unit && <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 500 }}>{unit}</span>}
    </div>
    {sub && <div style={{ fontSize: 11.5, color: C.textMuted }}>{sub}</div>}
  </div>
);

const Card = ({ title, subtitle, children, action }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 20 }}>
    {(title || action) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          {title && <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 600, color: C.text, fontFamily: 'Sora, sans-serif' }}>{title}</h3>}
          {subtitle && <p style={{ margin: '3px 0 0', fontSize: 12, color: C.textMuted }}>{subtitle}</p>}
        </div>
        {action}
      </div>
    )}
    {children}
  </div>
);

const PeriodTabs = ({ value, onChange }) => {
  const tabs = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'quarterly', label: 'Quarterly' },
    { id: 'yearly', label: 'Yearly' },
  ];
  return (
    <div style={{ display: 'inline-flex', background: C.card, border: `1px solid ${C.border}`, borderRadius: 7, padding: 3 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '6px 14px', fontSize: 12.5, fontWeight: 500,
          background: value === t.id ? C.primary : 'transparent',
          color: value === t.id ? '#fff' : C.textMuted,
          border: 'none', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit',
        }}>{t.label}</button>
      ))}
    </div>
  );
};

const PageHeader = ({ title, subtitle, right }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
    <div>
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: C.text, fontFamily: 'Sora, sans-serif', letterSpacing: '-0.02em' }}>{title}</h1>
      {subtitle && <p style={{ margin: '3px 0 0', fontSize: 13, color: C.textMuted }}>{subtitle}</p>}
    </div>
    {right}
  </div>
);

const Field = ({ label, value, onChange }) => (
  <div>
    <label style={LBL_STYLE}>{label}</label>
    <input
      type="number" value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="0" step="0.01" style={INPUT_STYLE}
    />
  </div>
);

// ============================================================================
// PAGES — DASHBOARD
// ============================================================================
const DashboardPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const trend = useMemo(() => groupByDate(filtered), [filtered]);
  const alerts = useMemo(() => computeAlerts(records), [records]);
  const rykAgg = useMemo(() => aggregate(filtered.filter(r => r.plant === 'RYK')), [filtered]);
  const skrAgg = useMemo(() => aggregate(filtered.filter(r => r.plant === 'SKR')), [filtered]);

  const productMix = [
    { name: 'Ghee', value: agg.ghee, color: C.ghee },
    { name: 'Cooking Oil', value: agg.oil, color: C.oil },
    { name: 'Soap', value: agg.soap, color: C.soap },
    { name: 'Mustard', value: agg.mustard, color: C.mustard },
  ];

  const elecMix = [
    { name: 'WAPDA', value: agg.wapda, color: C.wapda },
    { name: 'Solar', value: agg.solar, color: C.solar },
    { name: 'Generator', value: agg.generator, color: C.generator },
  ];

  const periodLabel = { daily: 'last 24 hours', weekly: 'last 7 days', monthly: 'last 30 days', quarterly: 'last 90 days', yearly: 'last 12 months' }[period];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader
        title="Executive Overview"
        subtitle={`Combined snapshot — Rahim Yar Khan and Sukkur — ${periodLabel}`}
        right={<PeriodTabs value={period} onChange={setPeriod} />}
      />

      {alerts.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
          {alerts.map((a, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 11, padding: '11px 15px',
              background: a.type === 'danger' ? '#FBEBEA' : '#FAF1E0',
              border: `1px solid ${a.type === 'danger' ? '#F0C5C2' : '#EAD5A8'}`,
              borderRadius: 8,
            }}>
              <AlertTriangle size={16} color={a.type === 'danger' ? C.danger : C.warning} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: C.text }}>{a.title}</div>
                <div style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{a.detail}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KPICard label="Total Production" value={fmt(agg.totalProduction)} unit="MT" sub={`${agg.count} reports`} accent={C.primary} icon={Database} />
        <KPICard label="Cooking Oil" value={fmt(agg.oil)} unit="MT" sub="All brands combined" accent={C.oil} icon={Droplet} />
        <KPICard label="Vegetable Ghee" value={fmt(agg.ghee)} unit="MT" sub="All brands combined" accent={C.ghee} icon={Flame} />
        <KPICard label="Soap" value={fmt(agg.soap, 1)} unit="MT" sub="14 SKUs tracked" accent={C.soap} />
        <KPICard label="Mustard Oil" value={fmt(agg.mustard, 1)} unit="MT" sub="Bottle filling" accent={C.mustard} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <Card title="Production Trend" subtitle="Daily output by product line">
          <ResponsiveContainer width="100%" height={290}>
            <ComposedChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.textMuted }} tickFormatter={d => d.slice(5)} stroke={C.borderStrong} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} stroke={C.borderStrong} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 8 }} />
              <Bar dataKey="ghee" stackId="a" name="Ghee (MT)" fill={C.ghee} />
              <Bar dataKey="oil" stackId="a" name="Oil (MT)" fill={C.oil} radius={[3, 3, 0, 0]} />
              <Line type="monotone" dataKey="dispatch" name="Dispatch (MT)" stroke={C.primary} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Product Mix" subtitle="Output share">
          <ResponsiveContainer width="100%" height={290}>
            <PieChart>
              <Pie data={productMix.filter(x => x.value > 0)} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={2} dataKey="value">
                {productMix.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v, 1)} MT`} />
              <Legend wrapperStyle={{ fontSize: 11.5 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {[
          { name: 'Rahim Yar Khan', code: 'RYK', data: rykAgg, color: C.ryk },
          { name: 'Sukkur', code: 'SKR', data: skrAgg, color: C.skr },
        ].map(p => (
          <Card key={p.code}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 6, height: 28, background: p.color, borderRadius: 2 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{p.name}</div>
                <div style={{ fontSize: 11, color: C.textMuted, letterSpacing: '0.06em' }}>{p.code} • {p.data.count} REPORTS</div>
              </div>
              <Building2 size={18} color={p.color} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                ['Oil', `${fmt(p.data.oil)} MT`],
                ['Ghee', `${fmt(p.data.ghee)} MT`],
                ['Soap', `${fmt(p.data.soap, 1)} MT`],
                ['Electricity', `${fmt(p.data.electricity)} kWh`],
                ['Gas', `${fmt(p.data.gas)} ft³`],
                ['Steam', `${fmt(p.data.steam)} MT`],
              ].map(([k, v]) => (
                <div key={k} style={{ paddingTop: 8, borderTop: `1px solid ${C.border}` }}>
                  <div style={{ fontSize: 10.5, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{k}</div>
                  <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginTop: 2, fontFamily: 'Sora, sans-serif' }}>{v}</div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <Card title="Power Source Mix" subtitle="WAPDA vs Solar vs Generator">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.textMuted }} tickFormatter={d => d.slice(5)} stroke={C.borderStrong} />
              <YAxis tick={{ fontSize: 11, fill: C.textMuted }} stroke={C.borderStrong} />
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 8 }} />
              <Area type="monotone" dataKey="wapda" stackId="1" name="WAPDA (kWh)" stroke={C.wapda} fill={C.wapda} fillOpacity={0.7} />
              <Area type="monotone" dataKey="solar" stackId="1" name="Solar (kWh)" stroke={C.solar} fill={C.solar} fillOpacity={0.7} />
              <Area type="monotone" dataKey="generator" stackId="1" name="Generator (kWh)" stroke={C.generator} fill={C.generator} fillOpacity={0.7} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Energy Source Total" subtitle="Period totals">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={elecMix.filter(x => x.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                {elecMix.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v)} kWh`} />
              <Legend wrapperStyle={{ fontSize: 11.5 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// PRODUCTION PAGE
// ============================================================================
const ProductionPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const latest = useMemo(() => {
    const map = {};
    records.forEach(r => {
      if (!map[r.plant] || r.reportDate > map[r.plant].reportDate) map[r.plant] = r;
    });
    return map;
  }, [records]);

  const sectionRows = [
    { label: 'CR — Chemical (Cooking Oil)', key: 'cr_chemical_oil' },
    { label: 'CR — Physical (Hard Blended Ghee)', key: 'cr_physical_ghee' },
    { label: 'CR — Physical (Cooking Oil)', key: 'cr_physical_oil' },
    { label: 'BR — Hydrogenation (Hard Ghee)', key: 'br_hydrogenation' },
    { label: 'BR — Blending (Hard Blended Ghee)', key: 'br_blending' },
    { label: 'BR — Final DEO (Blended Ghee)', key: 'br_final_deo_ghee' },
    { label: 'BR — Final DEO (Cooking Oil)', key: 'br_final_deo_oil' },
  ];

  const sectionChart = [
    { name: 'CR Chem.', actual: agg.cr_chemical_actual, std: agg.cr_chemical_std },
    { name: 'CR Phy. Ghee', actual: agg.cr_physical_ghee_actual, std: agg.cr_physical_ghee_std },
    { name: 'CR Phy. Oil', actual: agg.cr_physical_oil_actual, std: agg.cr_physical_oil_std },
    { name: 'BR Hydro.', actual: agg.br_hydro_actual, std: agg.br_hydro_std },
    { name: 'BR Blend', actual: agg.br_blend_actual, std: agg.br_blend_std },
    { name: 'BR Final DEO', actual: agg.br_deo_actual, std: agg.br_deo_std },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader
        title="Section-level Production"
        subtitle="Refinery output by area, with Standard vs Actual variance"
        right={<PeriodTabs value={period} onChange={setPeriod} />}
      />

      <Card title="Standard vs Actual by Section">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sectionChart} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 11.5, fill: C.text }} stroke={C.borderStrong} />
            <YAxis tick={{ fontSize: 11, fill: C.textMuted }} stroke={C.borderStrong} />
            <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v)} MT`} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="std" name="Standard (MT)" fill={C.borderStrong} radius={[3, 3, 0, 0]} />
            <Bar dataKey="actual" name="Actual (MT)" fill={C.primary} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {Object.values(latest).map(r => (
        <Card key={r.id} title={`${r.plant === 'RYK' ? 'Rahim Yar Khan' : 'Sukkur'} — Latest (${r.reportDate})`} subtitle="Section-level Standard vs Actual">
          <table style={TBL_STYLE}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.borderStrong}`, background: C.bg }}>
                {['Section', 'Std', 'Actual', 'Variance', 'MTD', 'Downtime', 'Remarks'].map(h => (
                  <th key={h} style={TH_STYLE}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectionRows.map(s => {
                const d = r.data.production[s.key];
                const variance = d.actual - d.standard;
                return (
                  <tr key={s.key} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={TD_STYLE}>{s.label}</td>
                    <td style={TD_STYLE_MUTED}>{fmt(d.standard)}</td>
                    <td style={TD_STYLE_NUM}>{fmt(d.actual)}</td>
                    <td style={{ padding: '11px 9px', fontFamily: 'Sora, sans-serif', color: variance < 0 ? C.danger : C.success }}>
                      {variance > 0 ? '+' : ''}{fmt(variance)}
                    </td>
                    <td style={TD_STYLE_MUTED}>{fmt(d.mtd)}</td>
                    <td style={{ padding: '11px 9px', color: d.downtime > 0 ? C.warning : C.textMuted }}>{fmt(d.downtime, 1)}</td>
                    <td style={{ padding: '11px 9px', color: C.textMuted, fontSize: 12, fontStyle: 'italic' }}>{d.remarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
};

// ============================================================================
// FILLING PAGE
// ============================================================================
const FillingPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);
  const brandTotals = useMemo(() => {
    const t = { shahbaz_ghee: 0, shahbaz_oil: 0, gharana_ghee: 0, gharana_oil: 0, rite_ghee: 0, rite_oil: 0 };
    filtered.forEach(r => Object.keys(t).forEach(k => { t[k] += r.data.filling.brands[k] || 0; }));
    return t;
  }, [filtered]);

  const brandData = [
    { brand: 'Shahbaz', Ghee: brandTotals.shahbaz_ghee, Oil: brandTotals.shahbaz_oil },
    { brand: 'Gharana', Ghee: brandTotals.gharana_ghee, Oil: brandTotals.gharana_oil },
    { brand: 'Rite', Ghee: brandTotals.rite_ghee, Oil: brandTotals.rite_oil },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader title="Filling & Brand Production" subtitle="Output by brand and packaging type"
        right={<PeriodTabs value={period} onChange={setPeriod} />} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <KPICard label="Shahbaz Ghee" value={fmt(brandTotals.shahbaz_ghee)} unit="MT" accent={C.ghee} />
        <KPICard label="Shahbaz Oil" value={fmt(brandTotals.shahbaz_oil)} unit="MT" accent={C.oil} />
        <KPICard label="Gharana Ghee" value={fmt(brandTotals.gharana_ghee)} unit="MT" accent={C.ghee} />
        <KPICard label="Gharana Oil" value={fmt(brandTotals.gharana_oil)} unit="MT" accent={C.oil} />
        <KPICard label="Rite Oil" value={fmt(brandTotals.rite_oil)} unit="MT" accent={C.oil} sub="Sukkur primary" />
      </div>

      <Card title="Brand-wise Production">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={brandData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="brand" tick={{ fontSize: 12, fill: C.text }} stroke={C.borderStrong} />
            <YAxis tick={{ fontSize: 11, fill: C.textMuted }} stroke={C.borderStrong} />
            <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v)} MT`} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="Ghee" fill={C.ghee} radius={[3, 3, 0, 0]} />
            <Bar dataKey="Oil" fill={C.oil} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ============================================================================
// UTILITIES PAGE
// ============================================================================
const UtilitiesPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const trend = useMemo(() => groupByDate(filtered), [filtered]);

  const gasMix = [
    { name: 'Boiler', value: agg.boiler_gas, color: '#C8924B' },
    { name: 'Continuous Refinery', value: agg.cr_gas, color: '#1B6770' },
    { name: 'Hydrogen Plant', value: agg.h2_gas, color: '#E8B547' },
    { name: 'Remaining Factory', value: agg.factory_gas, color: '#8B5A2B' },
  ];
  const steamMix = [
    { name: 'Batch Refinery', value: agg.br_steam, color: C.primary },
    { name: 'Continuous Refinery', value: agg.cr_steam, color: C.accent },
    { name: 'Soap Plant', value: agg.soap_steam, color: C.soap },
    { name: 'Gas Plant', value: agg.gas_steam, color: C.steam },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader title="Utilities Deep Dive"
        subtitle="Power, gas, steam, water, hydrogen — by source and section"
        right={<PeriodTabs value={period} onChange={setPeriod} />} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <KPICard label="Total Electricity" value={fmt(agg.electricity)} unit="kWh" accent={C.electricity} icon={Zap} />
        <KPICard label="WAPDA" value={fmt(agg.wapda)} unit="kWh" sub={`${fmt(agg.electricity ? agg.wapda / agg.electricity * 100 : 0, 1)}% of total`} accent={C.wapda} />
        <KPICard label="Solar" value={fmt(agg.solar)} unit="kWh" sub={`${fmt(agg.electricity ? agg.solar / agg.electricity * 100 : 0, 1)}% of total`} accent={C.solar} />
        <KPICard label="Generator" value={fmt(agg.generator)} unit="kWh" sub="Backup only" accent={C.generator} />
        <KPICard label="Diesel" value={fmt(agg.diesel)} unit="L" accent={C.danger} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <KPICard label="Natural Gas" value={fmt(agg.gas)} unit="ft³" accent={C.gas} />
        <KPICard label="Steam Total" value={fmt(agg.steam)} unit="MT" accent={C.steam} />
        <KPICard label="RO Water" value={fmt(agg.water)} unit="MT" accent={C.water} icon={Droplet} />
        <KPICard label="Hydrogen Gas" value={fmt(agg.hydrogen)} unit="lb" accent={C.accent} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card title="Natural Gas Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={gasMix.filter(x => x.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                {gasMix.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v)} ft³`} />
              <Legend wrapperStyle={{ fontSize: 11.5 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Steam Distribution">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={steamMix.filter(x => x.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                {steamMix.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v, 1)} MT`} />
              <Legend wrapperStyle={{ fontSize: 11.5 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// STOCK PAGE
// ============================================================================
const StockPage = ({ records }) => {
  const latestRYK = useMemo(() =>
    records.filter(r => r.plant === 'RYK').sort((a, b) => b.reportDate.localeCompare(a.reportDate))[0]
  , [records]);

  if (!latestRYK) return <div style={{ padding: 30, color: C.textMuted }}>No stock data yet.</div>;
  const s = latestRYK.data.stock;

  const ostBreakdown = [
    { name: 'Olein', value: s.ost_breakdown.olein, color: '#D4A24F' },
    { name: 'RBD', value: s.ost_breakdown.rbd, color: '#C8924B' },
    { name: 'Canola', value: s.ost_breakdown.canola, color: '#A8842B' },
    { name: 'Soybean', value: s.ost_breakdown.soybean, color: '#8B5A2B' },
    { name: 'Cottonseed', value: s.ost_breakdown.cottonseed, color: '#6B7BA8' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader title="Stock & Inventory" subtitle={`As of ${latestRYK.reportDate} — RYK plant`} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KPICard label="FG Ghee" value={fmt(s.fg_ghee, 1)} unit="MT" accent={C.ghee} sub="Finished goods" />
        <KPICard label="FG Oil" value={fmt(s.fg_oil, 1)} unit="MT" accent={C.oil} sub="Finished goods" />
        <KPICard label="Packable Ghee" value={fmt(s.packable_ghee, 1)} unit="MT" accent={C.primary} />
        <KPICard label="Packable Oil" value={fmt(s.packable_oil, 1)} unit="MT" accent={C.primary} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KPICard label="Hard Blended Ghee" value={fmt(s.hard_blended_ghee, 1)} unit="MT" accent={C.ghee} />
        <KPICard label="Hard Ghee (OST)" value={fmt(s.hard_ghee, 1)} unit="MT" accent={C.ghee} />
        <KPICard label="Mustard Packable" value={fmt(s.mustard_packable, 1)} unit="MT" accent={C.mustard} />
        <KPICard label="Total OST" value={fmt(s.ost_total)} unit="MT" accent={C.primary} sub="Raw oil tanks" />
      </div>

      <Card title="Raw Oil Tank (OST) Breakdown">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={ostBreakdown.filter(x => x.value > 0)} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                {ostBreakdown.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v)} MT`} />
              <Legend wrapperStyle={{ fontSize: 11.5 }} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '20px 0' }}>
            {ostBreakdown.map(item => (
              <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: C.bg, borderRadius: 6 }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color }} />
                <span style={{ flex: 1, fontSize: 13, color: C.text }}>{item.name}</span>
                <span style={{ fontFamily: 'Sora, sans-serif', fontSize: 13, fontWeight: 500, color: C.text }}>{fmt(item.value)} MT</span>
                <span style={{ fontSize: 11.5, color: C.textMuted, minWidth: 45, textAlign: 'right' }}>{fmt((item.value / s.ost_total) * 100, 1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// DISPATCH PAGE
// ============================================================================
const DispatchPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const trend = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader title="Dispatch Activity" subtitle="Vehicle dispatches and tonnage moved out"
        right={<PeriodTabs value={period} onChange={setPeriod} />} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KPICard label="Total Dispatched" value={fmt(agg.dispatch)} unit="MT" accent={C.primary} icon={Truck} />
        <KPICard label="Vehicles" value={fmt(agg.vehicles)} unit="trips" accent={C.accent} />
        <KPICard label="Avg per Vehicle" value={fmt(agg.vehicles ? agg.dispatch / agg.vehicles : 0, 1)} unit="MT" accent={C.success} />
      </div>

      <Card title="Daily Dispatch Trend">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.textMuted }} tickFormatter={d => d.slice(5)} stroke={C.borderStrong} />
            <YAxis tick={{ fontSize: 11, fill: C.textMuted }} stroke={C.borderStrong} />
            <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v)} MT`} />
            <Bar dataKey="dispatch" name="Dispatch (MT)" fill={C.primary} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ============================================================================
// MANUAL ENTRY PAGE — replaces upload
// ============================================================================
const EntryPage = ({ records, addRecord, exportSession, importSession, clearDemoData }) => {
  const today = new Date().toISOString().slice(0, 10);
  const [plant, setPlant] = useState('RYK');
  const [reportDate, setReportDate] = useState(today);
  const [activeSection, setActiveSection] = useState('production');
  const [msg, setMsg] = useState(null);
  const importRef = useRef(null);
  const [form, setForm] = useState(() => createEmptyRecord('RYK', today).data);

  const recent = [...records].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate)).slice(0, 5);

  const update = (path, value) => {
    setForm(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      const finalKey = keys[keys.length - 1];
      if (typeof obj[finalKey] === 'string' || finalKey === 'remarks') {
        obj[finalKey] = value;
      } else {
        obj[finalKey] = value === '' ? 0 : Number(value) || 0;
      }
      return next;
    });
  };

  const num = (path) => {
    const keys = path.split('.');
    let v = form;
    for (const k of keys) v = v?.[k];
    return v === 0 ? '' : v;
  };

  const handleSave = () => {
    const finalData = JSON.parse(JSON.stringify(form));
    finalData.filling.total_oil = (finalData.filling.ryk_oil || 0) + (finalData.filling.skr_oil || 0);
    finalData.filling.total_ghee = (finalData.filling.ryk_ghee || 0) + (finalData.filling.skr_ghee || 0);
    finalData.filling.ryk_total = (finalData.filling.ryk_oil || 0) + (finalData.filling.ryk_ghee || 0);
    finalData.filling.skr_total = (finalData.filling.skr_oil || 0) + (finalData.filling.skr_ghee || 0);
    finalData.filling.grand_total = finalData.filling.total_oil + finalData.filling.total_ghee;

    const e = finalData.utilities.electricity;
    e.total = (e.wapda_peak || 0) + (e.wapda_offpeak || 0) + (e.solar || 0) + (e.generator || 0);
    const g = finalData.utilities.naturalGas;
    g.total = (g.boiler || 0) + (g.cr || 0) + (g.hydrogen || 0) + (g.remaining || 0);
    const s = finalData.utilities.steam;
    s.total = (s.cr || 0) + (s.br || 0) + (s.soap || 0) + (s.gasPlant || 0);
    finalData.mustard.total_kg = (finalData.mustard.ml_125 || 0) + (finalData.mustard.ml_250 || 0) +
      (finalData.mustard.ml_500 || 0) + (finalData.mustard.ml_1000 || 0);

    const newRec = {
      id: `${plant}-${reportDate}-${Date.now()}`,
      uploadDate: today, reportDate, plant,
      fileName: `Manual entry — ${plant} ${reportDate}`,
      fileType: 'manual', status: 'processed', data: finalData,
    };
    addRecord(newRec);
    setMsg({ type: 'success', text: `Saved ${plant} report for ${reportDate}` });
    setForm(createEmptyRecord(plant, reportDate).data);
    setActiveSection('production');
    setTimeout(() => setMsg(null), 4000);
  };

  const handleClear = () => {
    if (window.confirm('Clear all entered values?')) {
      setForm(createEmptyRecord(plant, reportDate).data);
    }
  };

  const sections = [
    { id: 'production', label: 'Production', icon: Factory },
    { id: 'filling', label: 'Filling', icon: Package },
    { id: 'soap', label: 'Soap', icon: Beaker },
    { id: 'mustard', label: 'Mustard', icon: Droplet },
    { id: 'utilities', label: 'Utilities', icon: Zap },
    { id: 'stock', label: 'Stock', icon: Boxes },
    { id: 'dispatch', label: 'Dispatch', icon: Truck },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader title="Enter Daily Report Data"
        subtitle="Type in the numbers from your daily PDFs — totals calculate automatically" />

      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto auto', gap: 14, alignItems: 'end' }}>
          <div>
            <label style={LBL_STYLE}>Plant</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['RYK', 'SKR'].map(p => (
                <button key={p} onClick={() => setPlant(p)} style={{
                  flex: 1, padding: '10px 16px',
                  border: `1.5px solid ${plant === p ? C.primary : C.border}`,
                  background: plant === p ? C.primaryLight : '#fff',
                  color: plant === p ? C.primaryDark : C.text,
                  fontWeight: plant === p ? 600 : 500, fontSize: 13, borderRadius: 7, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  fontFamily: 'inherit',
                }}>
                  <Building2 size={14} />
                  {p === 'RYK' ? 'Rahim Yar Khan' : 'Sukkur'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={LBL_STYLE}>Report Date</label>
            <input type="date" value={reportDate} onChange={e => setReportDate(e.target.value)} style={INPUT_STYLE} />
          </div>
          <button onClick={handleClear} style={{
            padding: '10px 16px', background: '#fff', color: C.textMuted,
            border: `1.5px solid ${C.border}`, borderRadius: 7, cursor: 'pointer',
            fontSize: 13, fontWeight: 500, fontFamily: 'inherit',
          }}>Clear</button>
          <button onClick={handleSave} style={{
            padding: '10px 22px', background: C.primary, color: '#fff',
            border: 'none', borderRadius: 7, cursor: 'pointer',
            fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Save size={14} /> Save Report
          </button>
        </div>

        {msg && (
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 7, fontSize: 12.5,
            display: 'flex', alignItems: 'center', gap: 9,
            background: msg.type === 'success' ? '#EAF4ED' : '#FAF1E0',
            color: msg.type === 'success' ? '#2D5A3F' : '#7A5510',
            border: `1px solid ${msg.type === 'success' ? '#C7E0D0' : '#EAD5A8'}`,
          }}>
            <CheckCircle2 size={15} /> {msg.text}
          </div>
        )}
      </Card>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {sections.map(s => {
          const Icon = s.icon;
          const active = activeSection === s.id;
          return (
            <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
              padding: '9px 16px', borderRadius: 7,
              border: `1px solid ${active ? C.primary : C.border}`,
              background: active ? C.primary : '#fff',
              color: active ? '#fff' : C.textMuted,
              fontSize: 12.5, fontWeight: 500, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
            }}>
              <Icon size={14} />
              {s.label}
            </button>
          );
        })}
      </div>

      {activeSection === 'production' && (
        <Card title="Production by Section" subtitle="From page 1 of the Operational Reporting Pack PDF">
          <table style={TBL_STYLE}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.borderStrong}`, background: C.bg }}>
                {['Section', 'Std', 'Actual', 'MTD', 'Downtime', 'Remarks'].map(h => (
                  <th key={h} style={TH_STYLE}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['cr_chemical_oil', 'CR — Chemical (Oil)'],
                ['cr_physical_ghee', 'CR — Physical (Ghee)'],
                ['cr_physical_oil', 'CR — Physical (Oil)'],
                ['br_hydrogenation', 'BR — Hydrogenation'],
                ['br_blending', 'BR — Blending'],
                ['br_final_deo_ghee', 'BR — Final DEO (Ghee)'],
                ['br_final_deo_oil', 'BR — Final DEO (Oil)'],
              ].map(([key, label]) => (
                <tr key={key} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={TD_STYLE}>{label}</td>
                  <td style={TD_STYLE_MUTED}>{form.production[key].standard}</td>
                  <td style={{ padding: '6px' }}>
                    <input type="number" value={num(`production.${key}.actual`)}
                      onChange={e => update(`production.${key}.actual`, e.target.value)}
                      style={CELL_INPUT} placeholder="0" step="0.01" />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="number" value={num(`production.${key}.mtd`)}
                      onChange={e => update(`production.${key}.mtd`, e.target.value)}
                      style={CELL_INPUT} placeholder="0" step="0.01" />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="number" value={num(`production.${key}.downtime`)}
                      onChange={e => update(`production.${key}.downtime`, e.target.value)}
                      style={CELL_INPUT} placeholder="0" step="0.1" />
                  </td>
                  <td style={{ padding: '6px' }}>
                    <input type="text" value={form.production[key].remarks}
                      onChange={e => update(`production.${key}.remarks`, e.target.value)}
                      style={{ ...CELL_INPUT, width: 180, textAlign: 'left' }} placeholder="Plant normal" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 14, padding: 12, background: C.bg, borderRadius: 7, fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
            <strong style={{ color: C.text }}>Tip:</strong> Open page 1 of today's Reporting Pack PDF — copy the
            "Actual Production (MT/D)" column directly into the Actual cells.
          </div>
        </Card>
      )}

      {activeSection === 'filling' && (
        <>
          <Card title="Filling — by Plant">
            <div style={GRID_2}>
              <Field label="RYK Cooking Oil (MT)" value={num('filling.ryk_oil')} onChange={v => update('filling.ryk_oil', v)} />
              <Field label="RYK Vegetable Ghee (MT)" value={num('filling.ryk_ghee')} onChange={v => update('filling.ryk_ghee', v)} />
              <Field label="SKR Cooking Oil (MT)" value={num('filling.skr_oil')} onChange={v => update('filling.skr_oil', v)} />
              <Field label="SKR Vegetable Ghee (MT)" value={num('filling.skr_ghee')} onChange={v => update('filling.skr_ghee', v)} />
            </div>
          </Card>
          <Card title="Filling — by Brand">
            <div style={GRID_2}>
              <Field label="Shahbaz Ghee (MT)" value={num('filling.brands.shahbaz_ghee')} onChange={v => update('filling.brands.shahbaz_ghee', v)} />
              <Field label="Shahbaz Oil (MT)" value={num('filling.brands.shahbaz_oil')} onChange={v => update('filling.brands.shahbaz_oil', v)} />
              <Field label="Gharana Ghee (MT)" value={num('filling.brands.gharana_ghee')} onChange={v => update('filling.brands.gharana_ghee', v)} />
              <Field label="Gharana Oil (MT)" value={num('filling.brands.gharana_oil')} onChange={v => update('filling.brands.gharana_oil', v)} />
              <Field label="Rite Ghee (MT)" value={num('filling.brands.rite_ghee')} onChange={v => update('filling.brands.rite_ghee', v)} />
              <Field label="Rite Oil (MT)" value={num('filling.brands.rite_oil')} onChange={v => update('filling.brands.rite_oil', v)} />
            </div>
          </Card>
        </>
      )}

      {activeSection === 'soap' && (
        <Card title="Soap Production" subtitle="From Monthly Soap Production Plan Compliance report">
          <div style={GRID_2}>
            <Field label="Total Daily Production (MT)" value={num('soap.total_actual')} onChange={v => update('soap.total_actual', v)} />
            <Field label="Total MTD Production (MT)" value={num('soap.total_mtd')} onChange={v => update('soap.total_mtd', v)} />
            <Field label="Forecast MTD (MT)" value={num('soap.forecast')} onChange={v => update('soap.forecast', v)} />
            <Field label="Plan Compliance (%)" value={num('soap.compliance')} onChange={v => update('soap.compliance', v)} />
          </div>
        </Card>
      )}

      {activeSection === 'mustard' && (
        <Card title="Mustard Oil Filling" subtitle="From Mustard Oil Report / FG Warehouse Report">
          <div style={GRID_2}>
            <Field label="125 ml Bottle (kg)" value={num('mustard.ml_125')} onChange={v => update('mustard.ml_125', v)} />
            <Field label="250 ml Bottle (kg)" value={num('mustard.ml_250')} onChange={v => update('mustard.ml_250', v)} />
            <Field label="500 ml Bottle (kg)" value={num('mustard.ml_500')} onChange={v => update('mustard.ml_500', v)} />
            <Field label="1000 ml Bottle (kg)" value={num('mustard.ml_1000')} onChange={v => update('mustard.ml_1000', v)} />
            <Field label="MTD Production (kg)" value={num('mustard.mtd_kg')} onChange={v => update('mustard.mtd_kg', v)} />
            <Field label="Daily Dispatch (kg)" value={num('mustard.dispatch_kg')} onChange={v => update('mustard.dispatch_kg', v)} />
          </div>
        </Card>
      )}

      {activeSection === 'utilities' && (
        <>
          <Card title="Electricity Consumption">
            <div style={GRID_2}>
              <Field label="WAPDA Peak (kWh)" value={num('utilities.electricity.wapda_peak')} onChange={v => update('utilities.electricity.wapda_peak', v)} />
              <Field label="WAPDA Off-peak (kWh)" value={num('utilities.electricity.wapda_offpeak')} onChange={v => update('utilities.electricity.wapda_offpeak', v)} />
              <Field label="Solar (kWh)" value={num('utilities.electricity.solar')} onChange={v => update('utilities.electricity.solar', v)} />
              <Field label="Generator (kWh)" value={num('utilities.electricity.generator')} onChange={v => update('utilities.electricity.generator', v)} />
            </div>
          </Card>
          <Card title="Natural Gas — by Section">
            <div style={GRID_2}>
              <Field label="Boiler House (ft³)" value={num('utilities.naturalGas.boiler')} onChange={v => update('utilities.naturalGas.boiler', v)} />
              <Field label="Continuous Refinery (ft³)" value={num('utilities.naturalGas.cr')} onChange={v => update('utilities.naturalGas.cr', v)} />
              <Field label="Hydrogen Plant (ft³)" value={num('utilities.naturalGas.hydrogen')} onChange={v => update('utilities.naturalGas.hydrogen', v)} />
              <Field label="Remaining Factory (ft³)" value={num('utilities.naturalGas.remaining')} onChange={v => update('utilities.naturalGas.remaining', v)} />
            </div>
          </Card>
          <Card title="Steam Production & Distribution">
            <div style={GRID_2}>
              <Field label="Batch Refinery (MT)" value={num('utilities.steam.br')} onChange={v => update('utilities.steam.br', v)} />
              <Field label="Continuous Refinery (MT)" value={num('utilities.steam.cr')} onChange={v => update('utilities.steam.cr', v)} />
              <Field label="Soap Plant (MT)" value={num('utilities.steam.soap')} onChange={v => update('utilities.steam.soap', v)} />
              <Field label="Gas Plant (MT)" value={num('utilities.steam.gasPlant')} onChange={v => update('utilities.steam.gasPlant', v)} />
            </div>
          </Card>
          <Card title="Other Utilities">
            <div style={GRID_2}>
              <Field label="RO Water Total (MT)" value={num('utilities.water.total')} onChange={v => update('utilities.water.total', v)} />
              <Field label="Hydrogen Gas (lb)" value={num('utilities.hydrogen_lb')} onChange={v => update('utilities.hydrogen_lb', v)} />
              <Field label="Total Diesel (L)" value={num('utilities.diesel.total')} onChange={v => update('utilities.diesel.total', v)} />
              <Field label="Furnace Oil (L)" value={num('utilities.furnaceOil')} onChange={v => update('utilities.furnaceOil', v)} />
            </div>
          </Card>
        </>
      )}

      {activeSection === 'stock' && (
        <>
          <Card title="Finished Goods & Packable">
            <div style={GRID_2}>
              <Field label="FG Ghee (MT)" value={num('stock.fg_ghee')} onChange={v => update('stock.fg_ghee', v)} />
              <Field label="FG Oil (MT)" value={num('stock.fg_oil')} onChange={v => update('stock.fg_oil', v)} />
              <Field label="Packable Ghee (MT)" value={num('stock.packable_ghee')} onChange={v => update('stock.packable_ghee', v)} />
              <Field label="Packable Oil (MT)" value={num('stock.packable_oil')} onChange={v => update('stock.packable_oil', v)} />
              <Field label="Hard Blended Ghee (MT)" value={num('stock.hard_blended_ghee')} onChange={v => update('stock.hard_blended_ghee', v)} />
              <Field label="Hard Ghee in OST (MT)" value={num('stock.hard_ghee')} onChange={v => update('stock.hard_ghee', v)} />
              <Field label="Mustard Packable (MT)" value={num('stock.mustard_packable')} onChange={v => update('stock.mustard_packable', v)} />
              <Field label="Total OST (MT)" value={num('stock.ost_total')} onChange={v => update('stock.ost_total', v)} />
            </div>
          </Card>
          <Card title="OST Tank Breakdown — by Oil Type">
            <div style={GRID_2}>
              <Field label="Olein (MT)" value={num('stock.ost_breakdown.olein')} onChange={v => update('stock.ost_breakdown.olein', v)} />
              <Field label="RBD (MT)" value={num('stock.ost_breakdown.rbd')} onChange={v => update('stock.ost_breakdown.rbd', v)} />
              <Field label="Canola (MT)" value={num('stock.ost_breakdown.canola')} onChange={v => update('stock.ost_breakdown.canola', v)} />
              <Field label="Soybean (MT)" value={num('stock.ost_breakdown.soybean')} onChange={v => update('stock.ost_breakdown.soybean', v)} />
              <Field label="Cottonseed (MT)" value={num('stock.ost_breakdown.cottonseed')} onChange={v => update('stock.ost_breakdown.cottonseed', v)} />
            </div>
          </Card>
        </>
      )}

      {activeSection === 'dispatch' && (
        <Card title="Dispatch Activity">
          <div style={GRID_2}>
            <Field label="Total Dispatch (MT)" value={num('dispatch.total_mt')} onChange={v => update('dispatch.total_mt', v)} />
            <Field label="Vehicles Dispatched" value={num('dispatch.vehicles')} onChange={v => update('dispatch.vehicles', v)} />
            <Field label="Ghee Consumer (MT)" value={num('dispatch.ghee_consumer')} onChange={v => update('dispatch.ghee_consumer', v)} />
            <Field label="Oil Consumer (MT)" value={num('dispatch.oil_consumer')} onChange={v => update('dispatch.oil_consumer', v)} />
            <Field label="RSO Dispatch (MT)" value={num('dispatch.rso')} onChange={v => update('dispatch.rso', v)} />
            <Field label="Soap Dispatch (MT)" value={num('dispatch.soap')} onChange={v => update('dispatch.soap', v)} />
          </div>
        </Card>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 14 }}>
        <Card title="Session Backup">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <button onClick={exportSession} style={BTN_PRIMARY}>
              <Save size={14} /> Export all data
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }}
              onChange={e => importSession(e.target.files[0])} />
            <button onClick={() => importRef.current?.click()} style={BTN_OUTLINE}>
              <Upload size={14} /> Import data
            </button>
            <button onClick={clearDemoData} style={{
              ...BTN_OUTLINE, color: C.danger, border: `1.5px solid ${C.danger}`,
            }}>
              <X size={14} /> Clear demo data
            </button>
            <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
              Tracking <strong style={{ color: C.text }}>{records.length}</strong> reports.
            </div>
          </div>
        </Card>

        <Card title="Recent Entries">
          {recent.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>No entries yet.</div>
          ) : (
            <table style={TBL_STYLE}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                  {['Date', 'Plant', 'Oil', 'Ghee', 'Soap'].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {recent.map(r => (
                  <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={TD_STYLE}>{r.reportDate}</td>
                    <td style={TD_STYLE_MUTED}>{r.plant}</td>
                    <td style={TD_STYLE_NUM}>{fmt(r.data.filling.total_oil)}</td>
                    <td style={TD_STYLE_NUM}>{fmt(r.data.filling.total_ghee)}</td>
                    <td style={TD_STYLE_NUM}>{fmt(r.data.soap.total_actual, 1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// REPORTS PAGE
// ============================================================================
const ReportsPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const alerts = useMemo(() => computeAlerts(records), [records]);
  const periodLabel = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly', yearly: 'Annual' }[period];

  const downloadReport = () => {
    const today = new Date();
    const html = `<!DOCTYPE html><html><head><title>Ahmed Group ${periodLabel} Report</title>
<style>
body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1A2332; max-width: 800px; margin: 30px auto; padding: 30px; line-height: 1.6; }
h1 { color: #114C53; font-size: 26px; margin: 0 0 4px; }
h2 { color: #1B6770; font-size: 17px; margin: 24px 0 10px; padding-bottom: 6px; border-bottom: 1.5px solid #E8E6DE; }
.meta { color: #6B7280; font-size: 13px; margin-bottom: 22px; }
.summary { background: #F6F5F0; padding: 14px 18px; border-radius: 8px; border-left: 3px solid #1B6770; margin: 16px 0; }
table { width: 100%; border-collapse: collapse; font-size: 12.5px; margin: 6px 0; }
th { text-align: left; padding: 8px; background: #F6F5F0; font-weight: 600; border-bottom: 1px solid #D4D2C8; }
td { padding: 7px 8px; border-bottom: 1px solid #E8E6DE; }
.alert { padding: 9px 13px; background: #FAF1E0; border: 1px solid #EAD5A8; border-radius: 6px; margin: 5px 0; font-size: 12.5px; }
.footer { margin-top: 36px; padding-top: 14px; border-top: 1px solid #E8E6DE; color: #6B7280; font-size: 11px; }
</style></head><body>
<h1>Ahmed Group of Industries</h1>
<div class="meta">${periodLabel} Operational Report &nbsp;•&nbsp; ${today.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;•&nbsp; ${filtered.length} reports</div>
<div class="summary"><strong>Executive Summary</strong>
<ul style="margin: 6px 0 0; padding-left: 18px;">
<li>Total filling production: <strong>${fmt(agg.totalProduction)} MT</strong></li>
<li>Cooking oil: ${fmt(agg.oil)} MT &nbsp;•&nbsp; Ghee: ${fmt(agg.ghee)} MT</li>
<li>Soap: ${fmt(agg.soap, 1)} MT &nbsp;•&nbsp; Mustard: ${fmt(agg.mustard, 1)} MT</li>
<li>Total electricity: ${fmt(agg.electricity)} kWh (Solar: ${fmt(agg.solar)} kWh)</li>
<li>Hydrogen: ${fmt(agg.hydrogen)} lb &nbsp;•&nbsp; Dispatch: ${fmt(agg.dispatch)} MT</li>
</ul></div>
<h2>Section-level Production</h2>
<table><thead><tr><th>Section</th><th>Standard</th><th>Actual</th><th>Variance</th></tr></thead><tbody>
<tr><td>CR Chemical</td><td>${fmt(agg.cr_chemical_std)} MT</td><td>${fmt(agg.cr_chemical_actual)} MT</td><td>${fmt(agg.cr_chemical_actual - agg.cr_chemical_std)} MT</td></tr>
<tr><td>CR Physical (Ghee)</td><td>${fmt(agg.cr_physical_ghee_std)} MT</td><td>${fmt(agg.cr_physical_ghee_actual)} MT</td><td>${fmt(agg.cr_physical_ghee_actual - agg.cr_physical_ghee_std)} MT</td></tr>
<tr><td>CR Physical (Oil)</td><td>${fmt(agg.cr_physical_oil_std)} MT</td><td>${fmt(agg.cr_physical_oil_actual)} MT</td><td>${fmt(agg.cr_physical_oil_actual - agg.cr_physical_oil_std)} MT</td></tr>
<tr><td>BR Hydrogenation</td><td>${fmt(agg.br_hydro_std)} MT</td><td>${fmt(agg.br_hydro_actual)} MT</td><td>${fmt(agg.br_hydro_actual - agg.br_hydro_std)} MT</td></tr>
<tr><td>BR Blending</td><td>${fmt(agg.br_blend_std)} MT</td><td>${fmt(agg.br_blend_actual)} MT</td><td>${fmt(agg.br_blend_actual - agg.br_blend_std)} MT</td></tr>
</tbody></table>
<h2>Utility Consumption</h2>
<table><thead><tr><th>Utility</th><th>Total</th></tr></thead><tbody>
<tr><td>Electricity</td><td>${fmt(agg.electricity)} kWh (WAPDA: ${fmt(agg.wapda)}, Solar: ${fmt(agg.solar)})</td></tr>
<tr><td>Natural Gas</td><td>${fmt(agg.gas)} ft³</td></tr>
<tr><td>Steam</td><td>${fmt(agg.steam)} MT</td></tr>
<tr><td>RO Water</td><td>${fmt(agg.water)} MT</td></tr>
<tr><td>Hydrogen Gas</td><td>${fmt(agg.hydrogen)} lb</td></tr>
<tr><td>Diesel</td><td>${fmt(agg.diesel)} L</td></tr>
</tbody></table>
${alerts.length > 0 ? `<h2>Alerts</h2>${alerts.map(a => `<div class="alert"><strong>${a.title}</strong><br/>${a.detail}</div>`).join('')}` : ''}
<div class="footer">Prepared for the Group Technical Head &nbsp;•&nbsp; Ahmed Group of Industries</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ahmed_Group_${periodLabel}_${today.toISOString().slice(0, 10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader title="Generate Report"
        subtitle="Formatted report for the Group Technical Head — opens in any browser, prints to PDF"
        right={
          <div style={{ display: 'flex', gap: 11, alignItems: 'center' }}>
            <PeriodTabs value={period} onChange={setPeriod} />
            <button onClick={downloadReport} style={{
              padding: '9px 16px', background: C.primary, color: '#fff', border: 'none',
              borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', gap: 7, fontFamily: 'inherit',
            }}>
              <FileDown size={14} /> Download
            </button>
          </div>
        } />

      <Card>
        <div style={{ padding: '6px 4px', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ borderBottom: `2px solid ${C.primary}`, paddingBottom: 12, marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 21, color: C.primaryDark, fontFamily: 'Sora, sans-serif' }}>Ahmed Group of Industries</h2>
            <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 3 }}>
              {periodLabel} Operational Report  •  {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}  •  {filtered.length} reports
            </div>
          </div>

          <div style={{ background: C.bg, padding: '14px 18px', borderRadius: 8, borderLeft: `3px solid ${C.primary}`, marginBottom: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 7 }}>Executive Summary</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: C.text, lineHeight: 1.75 }}>
              <li>Total filling production: <strong>{fmt(agg.totalProduction)} MT</strong></li>
              <li>Cooking oil: {fmt(agg.oil)} MT • Ghee: {fmt(agg.ghee)} MT</li>
              <li>Soap: {fmt(agg.soap, 1)} MT • Mustard: {fmt(agg.mustard, 1)} MT</li>
              <li>Electricity: {fmt(agg.electricity)} kWh (Solar share: {fmt(agg.electricity ? agg.solar / agg.electricity * 100 : 0, 1)}%)</li>
              <li>Hydrogen: {fmt(agg.hydrogen)} lb • Dispatch: {fmt(agg.dispatch)} MT</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

// ============================================================================
// HISTORY PAGE
// ============================================================================
const HistoryPage = ({ records, removeRecord }) => {
  const [filter, setFilter] = useState('all');
  const sorted = useMemo(() => {
    const list = filter === 'all' ? records : records.filter(r => r.plant === filter);
    return [...list].sort((a, b) => b.reportDate.localeCompare(a.reportDate));
  }, [records, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader title="Upload History" subtitle="All reports submitted to date" />
      <Card>
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          {[['all', 'All Plants'], ['RYK', 'Rahim Yar Khan'], ['SKR', 'Sukkur']].map(([id, lbl]) => (
            <button key={id} onClick={() => setFilter(id)} style={{
              padding: '6px 13px', fontSize: 12, fontWeight: 500,
              background: filter === id ? C.primaryLight : 'transparent',
              color: filter === id ? C.primaryDark : C.textMuted,
              border: `1px solid ${filter === id ? C.primary : C.border}`,
              borderRadius: 6, cursor: 'pointer', fontFamily: 'inherit',
            }}>{lbl}</button>
          ))}
          <div style={{ marginLeft: 'auto', fontSize: 12, color: C.textMuted, alignSelf: 'center' }}>
            {sorted.length} records
          </div>
        </div>
        <table style={TBL_STYLE}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.borderStrong}` }}>
              {['Date', 'Plant', 'Oil', 'Ghee', 'Soap', 'Electricity', 'Gas', ''].map(h => <th key={h} style={TH_STYLE}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={TD_STYLE}>{r.reportDate}</td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{
                    padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                    background: r.plant === 'RYK' ? '#E5F0F1' : '#E8EEF4',
                    color: r.plant === 'RYK' ? C.primaryDark : '#3E5670',
                  }}>{r.plant}</span>
                </td>
                <td style={TD_STYLE_NUM}>{fmt(r.data.filling.total_oil)}</td>
                <td style={TD_STYLE_NUM}>{fmt(r.data.filling.total_ghee)}</td>
                <td style={TD_STYLE_NUM}>{fmt(r.data.soap.total_actual, 1)}</td>
                <td style={TD_STYLE_MUTED}>{fmt(r.data.utilities.electricity.total)} kWh</td>
                <td style={TD_STYLE_MUTED}>{fmt(r.data.utilities.naturalGas.total)} ft³</td>
                <td style={{ padding: '10px 8px' }}>
                  <button onClick={() => removeRecord(r.id)} style={{
                    background: 'transparent', border: 'none', cursor: 'pointer', color: C.textLight,
                    padding: 4, borderRadius: 4, display: 'flex',
                  }}><X size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {sorted.length === 0 && <div style={{ padding: 32, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>No records.</div>}
      </Card>
    </div>
  );
};

// ============================================================================
// ROOT
// ============================================================================
export default function App() {
  const [page, setPage] = useState('dashboard');
  const [records, setRecords] = useState(generateDemoData());
  const [period, setPeriod] = useState('monthly');

  const addRecord = (rec) => setRecords(prev => [...prev, rec]);
  const removeRecord = (id) => setRecords(prev => prev.filter(r => r.id !== id));
  const clearDemoData = () => {
    if (window.confirm('This will clear all demo data. Real entries will be kept. Continue?')) {
      setRecords(prev => prev.filter(r => r.fileName.startsWith('Manual entry')));
    }
  };

  const exportSession = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ahmed_group_session_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importSession = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (data.records && Array.isArray(data.records)) setRecords(data.records);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg, display: 'flex',
      fontFamily: '"DM Sans", -apple-system, sans-serif', color: C.text,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Sora:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:hover { opacity: 0.92; }
        table tr:hover { background: rgba(0,0,0,0.015); }
      `}</style>
      <Sidebar page={page} setPage={setPage} />
      <main style={{ flex: 1, padding: '28px 34px', overflow: 'auto', maxWidth: 1500 }}>
        {page === 'dashboard' && <DashboardPage records={records} period={period} setPeriod={setPeriod} />}
        {page === 'production' && <ProductionPage records={records} period={period} setPeriod={setPeriod} />}
        {page === 'filling' && <FillingPage records={records} period={period} setPeriod={setPeriod} />}
        {page === 'utilities' && <UtilitiesPage records={records} period={period} setPeriod={setPeriod} />}
        {page === 'stock' && <StockPage records={records} />}
        {page === 'dispatch' && <DispatchPage records={records} period={period} setPeriod={setPeriod} />}
        {page === 'entry' && <EntryPage records={records} addRecord={addRecord} exportSession={exportSession} importSession={importSession} clearDemoData={clearDemoData} />}
        {page === 'reports' && <ReportsPage records={records} period={period} setPeriod={setPeriod} />}
        {page === 'history' && <HistoryPage records={records} removeRecord={removeRecord} />}
      </main>
    </div>
  );
}
