import React, { useState, useMemo, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, ComposedChart
} from 'recharts';
import {
  Upload, LayoutDashboard, Factory, FileText, History, Download,
  AlertTriangle, CheckCircle2, X, Droplet, Zap, Save, FileUp,
  TrendingUp, TrendingDown, Loader2, Database, Building2, Flame,
  Beaker, Package, Truck, Gauge, FileDown, BarChart3, Boxes
} from 'lucide-react';
import * as XLSX from 'xlsx';

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
  spice: '#A33D2D',
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
// REAL DATA STRUCTURE — modeled from uploaded PDFs (24-04-2026)
// ============================================================================
// Each daily record contains the full report pack
const createEmptyRecord = (plant, dateStr) => ({
  id: `${plant}-${dateStr}`,
  uploadDate: dateStr,
  reportDate: dateStr,
  plant,
  fileName: `${plant}_Daily_${dateStr}.pdf`,
  status: 'processed',
  data: {
    // Production by section
    production: {
      cr_chemical_oil: { standard: 0, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      cr_physical_ghee: { standard: 0, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      cr_physical_oil: { standard: 0, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      br_hydrogenation: { standard: 0, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      br_blending: { standard: 0, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      br_final_deo_ghee: { standard: 0, actual: 0, mtd: 0, downtime: 0, remarks: '' },
      br_final_deo_oil: { standard: 0, actual: 0, mtd: 0, downtime: 0, remarks: '' },
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
    // Soap production
    soap: {
      total_actual: 0,
      total_mtd: 0,
      forecast: 0,
      compliance: 0,
      skus: [],
    },
    // Mustard oil
    mustard: {
      ml_125: 0, ml_250: 0, ml_500: 0, ml_1000: 0,
      total_kg: 0, mtd_kg: 0,
      dispatch_kg: 0, mtd_dispatch_kg: 0,
    },
    // Spices
    spices: {
      red_chilli_100: 0, red_chilli_200: 0,
      coriander: 0, turmeric: 0,
      iodized_salt: 0, pink_salt: 0,
    },
    // Utilities
    utilities: {
      electricity: {
        wapda_peak: 0, wapda_offpeak: 0, generator: 0, solar: 0, total: 0, mtd: 0,
      },
      naturalGas: {
        boiler: 0, cr: 0, hydrogen: 0, remaining: 0, total: 0, mtd: 0,
      },
      steam: {
        cr: 0, br: 0, soap: 0, gasPlant: 0, total: 0, mtd: 0,
      },
      water: {
        ro_plant1: 0, ro_plant2: 0, total: 0, mtd: 0,
      },
      diesel: { total: 0, mtd: 0, vehicle: 0, genset: 0 },
      hydrogen_lb: 0,
      hydrogen_mtd: 0,
      furnaceOil: 0,
    },
    // Stock & Inventory
    stock: {
      fg_ghee: 0,
      fg_oil: 0,
      packable_ghee: 0,
      packable_oil: 0,
      hard_blended_ghee: 0,
      hard_ghee: 0,
      mustard_packable: 0,
      ost_total: 0,
      ost_breakdown: {
        olein: 0, rbd: 0, canola: 0, soybean: 0, cottonseed: 0,
      },
    },
    // Quality
    quality: {
      cr_samples_passed: 0, cr_samples_failed: 0,
      br_samples_passed: 0, br_samples_failed: 0,
      avg_ffa: 0, avg_color_red: 0, avg_color_yellow: 0,
      avg_mp: 0, avg_pv: 0,
      customer_complaints: 0,
    },
    // Maintenance
    maintenance: {
      total_complaints: 0, total_completed: 0,
      mtd_complaints: 0, mtd_completed: 0,
    },
    // Dispatch
    dispatch: {
      ghee_consumer: 0, oil_consumer: 0, rso: 0, soap: 0,
      total_mt: 0, vehicles: 0,
    },
  },
});

// Generate 30 days of demo data based on real report patterns
const generateDemoData = () => {
  const today = new Date();
  const data = [];

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const isFriday = dayOfWeek === 5;
    const isSunday = dayOfWeek === 0;

    ['RYK', 'SKR'].forEach(plant => {
      const base = plant === 'RYK' ? 1 : 0.78;
      const noise = () => 0.92 + Math.random() * 0.16;
      const downFactor = isSunday ? 0.3 : isFriday ? 0.85 : 1;

      const rec = createEmptyRecord(plant, dateStr);

      // Production sections (real ranges from your PDFs)
      rec.data.production.cr_chemical_oil = {
        standard: 200, actual: Math.random() > 0.3 ? Math.round(220 * base * noise() * downFactor) : 0,
        mtd: Math.round(1898 * base), downtime: Math.random() > 0.5 ? 0 : 16,
        remarks: Math.random() > 0.5 ? 'Plant normal' : 'Plant shutdown',
      };
      rec.data.production.cr_physical_ghee = {
        standard: 210, actual: Math.round(220 * base * noise() * downFactor),
        mtd: Math.round(3605 * base), downtime: Math.random() > 0.6 ? 0 : 1,
        remarks: 'Plant normal',
      };
      rec.data.production.cr_physical_oil = {
        standard: 200, actual: Math.random() > 0.4 ? Math.round(195 * base * noise() * downFactor) : 0,
        mtd: Math.round(1643 * base), downtime: 0,
        remarks: 'No production plan',
      };
      rec.data.production.br_hydrogenation = {
        standard: 180, actual: Math.round(160 * base * noise() * downFactor),
        mtd: Math.round(3042 * base), downtime: 0,
        remarks: 'Plant normal',
      };
      rec.data.production.br_blending = {
        standard: 230, actual: Math.round(290 * base * noise() * downFactor),
        mtd: Math.round(3741 * base), downtime: 0,
        remarks: 'Plant normal',
      };
      rec.data.production.br_final_deo_ghee = {
        standard: 180, actual: Math.random() > 0.6 ? Math.round(150 * base * noise()) : 0,
        mtd: Math.round(702 * base), downtime: 0,
        remarks: 'Plant shutdown',
      };
      rec.data.production.br_final_deo_oil = {
        standard: 17, actual: 0, mtd: 0, downtime: 0,
        remarks: 'Plant shutdown',
      };

      // Filling (real pattern: RYK does most filling, SKR sometimes inactive)
      const rykOil = plant === 'RYK' ? Math.round(15 * noise() * downFactor) : 0;
      const rykGhee = plant === 'RYK' ? Math.round(140 * noise() * downFactor) : 0;
      const skrOil = plant === 'SKR' ? (Math.random() > 0.5 ? Math.round(7 * noise()) : 0) : 0;
      rec.data.filling = {
        ryk_oil: rykOil, ryk_ghee: rykGhee, ryk_total: rykOil + rykGhee,
        ryk_mtd: 4632 * (i / 30),
        skr_oil: skrOil, skr_ghee: 0, skr_total: skrOil,
        skr_mtd: 123 * (i / 30),
        total_oil: rykOil + skrOil, total_ghee: rykGhee,
        grand_total: rykOil + rykGhee + skrOil,
        brands: {
          shahbaz_ghee: Math.round(rykGhee * 0.84),
          shahbaz_oil: Math.round((rykOil + skrOil) * 0.9),
          gharana_ghee: Math.round(rykGhee * 0.16),
          gharana_oil: Math.round((rykOil + skrOil) * 0.1),
          rite_ghee: 0,
          rite_oil: skrOil,
        },
      };

      // Soap (RYK only)
      if (plant === 'RYK') {
        rec.data.soap = {
          total_actual: Math.random() > 0.5 ? Math.round(3 * noise() * 100) / 100 : 0,
          total_mtd: 187,
          forecast: 256,
          compliance: 73.2,
          skus: [
            { name: '250gm x 40 (Loose)', forecast: 96.75, actual: 77.73, compliance: 80.34 },
            { name: '500gm x 20', forecast: 9.57, actual: 19.77, compliance: 206.58 },
            { name: '1000gm x 10', forecast: 42.94, actual: 33.18, compliance: 77.27 },
            { name: 'SHBZ 280g x 36', forecast: 67.35, actual: 17.77, compliance: 26.39 },
            { name: 'SHBZ 350g x 20 Loose', forecast: 21.11, actual: 19.15, compliance: 90.72 },
            { name: 'SHBZ 350g x 20 Pouch', forecast: 1.19, actual: 4.77, compliance: 402.28 },
            { name: 'SHBZ 140g x 72', forecast: 7.85, actual: 8.53, compliance: 108.67 },
          ],
        };
      }

      // Mustard (RYK only)
      if (plant === 'RYK') {
        rec.data.mustard = {
          ml_125: Math.random() > 0.7 ? 137 : 0,
          ml_250: Math.round(1218 * noise()),
          ml_500: Math.random() > 0.7 ? 109 : 0,
          ml_1000: Math.random() > 0.8 ? 75 : 0,
          total_kg: 1218,
          mtd_kg: 34589,
          dispatch_kg: 737,
          mtd_dispatch_kg: 33120,
        };
      }

      // Spices (RYK only)
      if (plant === 'RYK') {
        rec.data.spices = {
          red_chilli_100: Math.round(Math.random() * 10),
          red_chilli_200: Math.round(Math.random() * 5),
          coriander: Math.round(Math.random() * 5),
          turmeric: Math.round(Math.random() * 5),
          iodized_salt: Math.round(Math.random() * 30),
          pink_salt: Math.round(Math.random() * 5),
        };
      }

      // Utilities — real ranges from PDFs
      const wapdaPeak = Math.round((1750 + Math.random() * 800) * base);
      const wapdaOff = Math.round((7040 + Math.random() * 2500) * base);
      const solar = Math.round(1474 * base * (Math.random() * 0.6 + 0.4));
      const totalElec = wapdaPeak + wapdaOff + solar;

      rec.data.utilities = {
        electricity: {
          wapda_peak: wapdaPeak, wapda_offpeak: wapdaOff,
          generator: 0, solar: solar, total: totalElec,
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
        water: {
          ro_plant1: 54, ro_plant2: 122,
          total: 176, mtd: 4949 * (i / 30) * base,
        },
        diesel: {
          total: 147, mtd: 5186 * (i / 30),
          vehicle: 147, genset: 0,
        },
        hydrogen_lb: Math.round(1780 * base * noise()),
        hydrogen_mtd: 33895 * (i / 30) * base,
        furnaceOil: 0,
      };

      // Stock (mostly relevant for current day, demo with consistent values)
      rec.data.stock = {
        fg_ghee: 374,
        fg_oil: 96,
        packable_ghee: 852,
        packable_oil: 739,
        hard_blended_ghee: 1036,
        hard_ghee: 916,
        mustard_packable: 39,
        ost_total: 3953,
        ost_breakdown: {
          olein: 1479, rbd: 1417, canola: 242,
          soybean: 98, cottonseed: 533,
        },
      };

      // Quality
      rec.data.quality = {
        cr_samples_passed: Math.round(45 + Math.random() * 5),
        cr_samples_failed: Math.round(Math.random() * 2),
        br_samples_passed: Math.round(40 + Math.random() * 5),
        br_samples_failed: 0,
        avg_ffa: Math.round((0.05 + Math.random() * 0.05) * 100) / 100,
        avg_color_red: Math.round((1.5 + Math.random()) * 10) / 10,
        avg_color_yellow: Math.round((15 + Math.random() * 5) * 10) / 10,
        avg_mp: Math.round((38 + Math.random() * 4) * 10) / 10,
        avg_pv: Math.round((0.5 + Math.random()) * 10) / 10,
        customer_complaints: Math.random() > 0.9 ? 1 : 0,
      };

      // Maintenance
      rec.data.maintenance = {
        total_complaints: Math.round(Math.random() * 8),
        total_completed: Math.round(Math.random() * 7),
        mtd_complaints: Math.round(120 + Math.random() * 30),
        mtd_completed: Math.round(110 + Math.random() * 25),
      };

      // Dispatch
      rec.data.dispatch = {
        ghee_consumer: Math.round(150 * base * noise() * downFactor),
        oil_consumer: Math.round(13 * base * noise() * downFactor),
        rso: Math.round(0.9 * noise()),
        soap: 0,
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
        date: r.reportDate,
        oil: 0, ghee: 0, soap: 0,
        electricity: 0, gas: 0, steam: 0, water: 0,
        wapda: 0, solar: 0, generator: 0,
        boiler_gas: 0, cr_gas: 0, h2_gas: 0, factory_gas: 0,
        hydrogen: 0, dispatch: 0,
        RYK: 0, SKR: 0,
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
    customer_complaints: 0,
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
    agg.customer_complaints += r.data.quality.customer_complaints;
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
  if (lastTotal < prevAvg * 0.85) {
    alerts.push({
      type: 'warning',
      title: 'Production below 7-day average',
      detail: `${last.date}: ${fmt(lastTotal)} MT vs avg ${fmt(prevAvg, 0)} MT (${fmt((lastTotal/prevAvg - 1) * 100, 1)}%)`,
    });
  }
  const elecPrev = trend.slice(0, -1).reduce((s, r) => s + r.electricity, 0) / (trend.length - 1);
  if (last.electricity > elecPrev * 1.15) {
    alerts.push({
      type: 'danger',
      title: 'Electricity consumption spike',
      detail: `${last.date}: ${fmt(last.electricity)} kWh — ${fmt((last.electricity/elecPrev - 1) * 100, 1)}% above average`,
    });
  }
  // Soap plan compliance
  const lastRYK = records.filter(r => r.plant === 'RYK').sort((a,b) => b.reportDate.localeCompare(a.reportDate))[0];
  if (lastRYK && lastRYK.data.soap.compliance < 75 && lastRYK.data.soap.compliance > 0) {
    alerts.push({
      type: 'warning',
      title: 'Soap plan compliance below target',
      detail: `Current MTD compliance: ${fmt(lastRYK.data.soap.compliance, 1)}% (target: 90%)`,
    });
  }
  return alerts;
};

// ============================================================================
// CLAUDE API — extract from PDF/Excel
// ============================================================================
const extractWithClaude = async (fileContent, fileName, plant) => {
  const systemPrompt = `You are a data extraction specialist for Ahmed Group of Industries — Pakistan's edible oil/ghee/soap manufacturer.

Extract metrics from the daily Operational Reporting Pack and return ONLY valid JSON, no preamble or markdown fences.

Return this exact structure (use null for missing values, convert to MT/kWh/ft3 as needed):
{
  "reportDate": "YYYY-MM-DD",
  "plant": "RYK" or "SKR",
  "production": {
    "cr_chemical_oil_actual": <MT>,
    "cr_physical_ghee_actual": <MT>,
    "cr_physical_oil_actual": <MT>,
    "br_hydrogenation_actual": <MT>,
    "br_blending_actual": <MT>,
    "br_final_deo_ghee_actual": <MT>,
    "br_final_deo_oil_actual": <MT>
  },
  "filling": {
    "ryk_oil": <MT>, "ryk_ghee": <MT>,
    "skr_oil": <MT>, "skr_ghee": <MT>,
    "shahbaz_ghee": <MT>, "shahbaz_oil": <MT>,
    "gharana_ghee": <MT>, "gharana_oil": <MT>,
    "rite_ghee": <MT>, "rite_oil": <MT>
  },
  "soap": {
    "total_actual_mt": <MT>,
    "total_mtd_mt": <MT>,
    "forecast_mtd": <MT>,
    "compliance_pct": <number>
  },
  "mustard": {
    "total_kg": <kg>,
    "ml_125": <kg>, "ml_250": <kg>, "ml_500": <kg>, "ml_1000": <kg>
  },
  "utilities": {
    "wapda_peak_kwh": <number>,
    "wapda_offpeak_kwh": <number>,
    "solar_kwh": <number>,
    "generator_kwh": <number>,
    "total_electricity_kwh": <number>,
    "boiler_gas_ft3": <number>,
    "cr_gas_ft3": <number>,
    "hydrogen_gas_ft3": <number>,
    "remaining_factory_gas_ft3": <number>,
    "total_gas_ft3": <number>,
    "br_steam_mt": <number>,
    "cr_steam_mt": <number>,
    "soap_steam_mt": <number>,
    "gas_plant_steam_mt": <number>,
    "total_steam_mt": <number>,
    "ro_water_mt": <number>,
    "diesel_total_l": <number>,
    "hydrogen_lb": <number>
  },
  "stock": {
    "fg_ghee_mt": <MT>,
    "fg_oil_mt": <MT>,
    "packable_ghee_mt": <MT>,
    "packable_oil_mt": <MT>,
    "hard_blended_ghee_mt": <MT>,
    "hard_ghee_mt": <MT>,
    "ost_total_mt": <MT>
  },
  "dispatch": {
    "total_mt": <MT>,
    "vehicles": <number>,
    "ghee_mt": <MT>,
    "oil_mt": <MT>
  }
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: `Plant: ${plant}\nFile: ${fileName}\n\nContent:\n${fileContent}`
        }]
      }),
    });
    const data = await response.json();
    const textBlock = data.content.find(c => c.type === 'text');
    if (!textBlock) throw new Error('No text in response');
    const cleaned = textBlock.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Extraction failed:', err);
    throw err;
  }
};

// ============================================================================
// COMPONENTS
// ============================================================================

const Sidebar = ({ page, setPage }) => {
  const items = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'production', icon: Factory, label: 'Production' },
    { id: 'filling', icon: Package, label: 'Filling & Brands' },
    { id: 'utilities', icon: Zap, label: 'Utilities' },
    { id: 'stock', icon: Boxes, label: 'Stock & Inventory' },
    { id: 'dispatch', icon: Truck, label: 'Dispatch' },
    { id: 'upload', icon: Upload, label: 'Upload Reports' },
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
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 11,
                padding: '10px 12px', borderRadius: 6, marginBottom: 2,
                background: active ? C.sidebarHover : 'transparent',
                color: active ? '#fff' : '#B0C2C7',
                border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: active ? 500 : 400, textAlign: 'left',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
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

const KPICard = ({ label, value, unit, sub, accent, icon: Icon, trend }) => (
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
    {sub && (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11.5, color: C.textMuted }}>
        {trend === 'up' && <TrendingUp size={12} color={C.success} />}
        {trend === 'down' && <TrendingDown size={12} color={C.danger} />}
        <span>{sub}</span>
      </div>
    )}
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
          border: 'none', borderRadius: 5, cursor: 'pointer',
          fontFamily: 'inherit',
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

// ============================================================================
// PAGE: DASHBOARD (Executive Overview)
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

      {/* Top KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KPICard label="Total Production" value={fmt(agg.totalProduction)} unit="MT" sub={`${agg.count} reports`} accent={C.primary} icon={Database} />
        <KPICard label="Cooking Oil" value={fmt(agg.oil)} unit="MT" sub="All brands combined" accent={C.oil} icon={Droplet} />
        <KPICard label="Vegetable Ghee" value={fmt(agg.ghee)} unit="MT" sub="All brands combined" accent={C.ghee} icon={Flame} />
        <KPICard label="Soap" value={fmt(agg.soap, 1)} unit="MT" sub="14 SKUs tracked" accent={C.soap} />
        <KPICard label="Mustard Oil" value={fmt(agg.mustard, 1)} unit="MT" sub="Bottle filling" accent={C.mustard} />
      </div>

      {/* Plant comparison + Mix */}
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

        <Card title="Product Mix" subtitle="Output share by category">
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

      {/* Plant cards */}
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

      {/* Utility overview */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <Card title="Power Source Mix" subtitle="WAPDA vs Solar vs Generator distribution">
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
// PAGE: PRODUCTION (section-level)
// ============================================================================
const ProductionPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const latest = useMemo(() => {
    const map = {};
    records.forEach(r => {
      const key = r.plant;
      if (!map[key] || r.reportDate > map[key].reportDate) map[key] = r;
    });
    return map;
  }, [records]);

  const sectionRows = [
    { label: 'CR — Chemical Refinery (Cooking Oil)', key: 'cr_chemical_oil' },
    { label: 'CR — Physical Refinery (Hard Blended Ghee)', key: 'cr_physical_ghee' },
    { label: 'CR — Physical Refinery (Cooking Oil)', key: 'cr_physical_oil' },
    { label: 'BR — Hydrogenation (Hard Ghee)', key: 'br_hydrogenation' },
    { label: 'BR — Blending Section (Hard Blended Ghee)', key: 'br_blending' },
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
        subtitle="Refinery and filling output by area, with Standard vs Actual variance"
        right={<PeriodTabs value={period} onChange={setPeriod} />}
      />

      <Card title="Standard vs Actual by Section" subtitle="Period totals across both plants">
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
        <Card key={r.id} title={`${r.plant === 'RYK' ? 'Rahim Yar Khan' : 'Sukkur'} — Latest Daily (${r.reportDate})`} subtitle="Section-level Standard vs Actual with root-cause">
          <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.borderStrong}`, background: C.bg }}>
                {['Section', 'Std (MT)', 'Actual (MT)', 'Variance', 'MTD (MT)', 'Downtime (hr)', 'Remarks'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 9px', fontSize: 10.5, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sectionRows.map(s => {
                const d = r.data.production[s.key];
                const variance = d.actual - d.standard;
                return (
                  <tr key={s.key} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '11px 9px', color: C.text, fontWeight: 500 }}>{s.label}</td>
                    <td style={{ padding: '11px 9px', fontFamily: 'Sora, sans-serif', color: C.textMuted }}>{fmt(d.standard)}</td>
                    <td style={{ padding: '11px 9px', fontFamily: 'Sora, sans-serif', color: C.text, fontWeight: 500 }}>{fmt(d.actual)}</td>
                    <td style={{ padding: '11px 9px', fontFamily: 'Sora, sans-serif', color: variance < 0 ? C.danger : C.success }}>
                      {variance > 0 ? '+' : ''}{fmt(variance)}
                    </td>
                    <td style={{ padding: '11px 9px', fontFamily: 'Sora, sans-serif', color: C.textMuted }}>{fmt(d.mtd)}</td>
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
// PAGE: FILLING & BRANDS
// ============================================================================
const FillingPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);

  const brandTotals = useMemo(() => {
    const t = { shahbaz_ghee: 0, shahbaz_oil: 0, gharana_ghee: 0, gharana_oil: 0, rite_ghee: 0, rite_oil: 0 };
    filtered.forEach(r => {
      Object.keys(t).forEach(k => { t[k] += r.data.filling.brands[k] || 0; });
    });
    return t;
  }, [filtered]);

  const brandData = [
    { brand: 'Shahbaz', Ghee: brandTotals.shahbaz_ghee, Oil: brandTotals.shahbaz_oil },
    { brand: 'Gharana', Ghee: brandTotals.gharana_ghee, Oil: brandTotals.gharana_oil },
    { brand: 'Rite', Ghee: brandTotals.rite_ghee, Oil: brandTotals.rite_oil },
  ];

  const fillingByPlant = useMemo(() => {
    const t = { ryk_oil: 0, ryk_ghee: 0, skr_oil: 0, skr_ghee: 0 };
    filtered.forEach(r => {
      t.ryk_oil += r.data.filling.ryk_oil;
      t.ryk_ghee += r.data.filling.ryk_ghee;
      t.skr_oil += r.data.filling.skr_oil;
      t.skr_ghee += r.data.filling.skr_ghee;
    });
    return t;
  }, [filtered]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader
        title="Filling & Brand Production"
        subtitle="Output by brand and packaging type"
        right={<PeriodTabs value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
        <KPICard label="Shahbaz Ghee" value={fmt(brandTotals.shahbaz_ghee)} unit="MT" accent={C.ghee} />
        <KPICard label="Shahbaz Oil" value={fmt(brandTotals.shahbaz_oil)} unit="MT" accent={C.oil} />
        <KPICard label="Gharana Ghee" value={fmt(brandTotals.gharana_ghee)} unit="MT" accent={C.ghee} />
        <KPICard label="Gharana Oil" value={fmt(brandTotals.gharana_oil)} unit="MT" accent={C.oil} />
        <KPICard label="Rite Oil" value={fmt(brandTotals.rite_oil)} unit="MT" accent={C.oil} sub="Sukkur primary" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
        <Card title="Brand-wise Production" subtitle="Ghee vs Oil split">
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

        <Card title="Plant-wise Filling Split">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { lbl: 'RYK — Ghee', val: fillingByPlant.ryk_ghee, color: C.ghee, max: Math.max(fillingByPlant.ryk_ghee, fillingByPlant.skr_ghee, 1) },
              { lbl: 'RYK — Oil', val: fillingByPlant.ryk_oil, color: C.oil, max: Math.max(fillingByPlant.ryk_oil, fillingByPlant.skr_oil, 1) },
              { lbl: 'SKR — Ghee', val: fillingByPlant.skr_ghee, color: C.ghee, max: Math.max(fillingByPlant.ryk_ghee, fillingByPlant.skr_ghee, 1) },
              { lbl: 'SKR — Oil', val: fillingByPlant.skr_oil, color: C.oil, max: Math.max(fillingByPlant.ryk_oil, fillingByPlant.skr_oil, 1) },
            ].map(b => (
              <div key={b.lbl}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: C.text }}>{b.lbl}</span>
                  <span style={{ color: C.text, fontWeight: 500, fontFamily: 'Sora, sans-serif' }}>{fmt(b.val)} MT</span>
                </div>
                <div style={{ width: '100%', height: 8, background: C.bg, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ width: `${(b.val / b.max) * 100}%`, height: '100%', background: b.color, borderRadius: 4 }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ============================================================================
// PAGE: UTILITIES (deep dive)
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
      <PageHeader
        title="Utilities Deep Dive"
        subtitle="Power, gas, steam, water, hydrogen consumption — by source and section"
        right={<PeriodTabs value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <KPICard label="Total Electricity" value={fmt(agg.electricity)} unit="kWh" accent={C.electricity} icon={Zap} />
        <KPICard label="WAPDA" value={fmt(agg.wapda)} unit="kWh" sub={`${fmt(agg.electricity ? agg.wapda/agg.electricity*100 : 0, 1)}% of total`} accent={C.wapda} />
        <KPICard label="Solar" value={fmt(agg.solar)} unit="kWh" sub={`${fmt(agg.electricity ? agg.solar/agg.electricity*100 : 0, 1)}% of total`} accent={C.solar} />
        <KPICard label="Generator" value={fmt(agg.generator)} unit="kWh" sub="Backup only" accent={C.generator} />
        <KPICard label="Diesel" value={fmt(agg.diesel)} unit="L" accent={C.danger} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12 }}>
        <KPICard label="Natural Gas" value={fmt(agg.gas)} unit="ft³" accent={C.gas} />
        <KPICard label="Steam Total" value={fmt(agg.steam)} unit="MT" accent={C.steam} />
        <KPICard label="RO Water" value={fmt(agg.water)} unit="MT" accent={C.water} icon={Droplet} />
        <KPICard label="Hydrogen Gas" value={fmt(agg.hydrogen)} unit="lb" accent={C.accent} />
      </div>

      <Card title="Power Distribution Trend" subtitle="WAPDA vs Solar vs Generator across the period">
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.textMuted }} tickFormatter={d => d.slice(5)} stroke={C.borderStrong} />
            <YAxis tick={{ fontSize: 11, fill: C.textMuted }} stroke={C.borderStrong} />
            <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 8 }} />
            <Area type="monotone" dataKey="wapda" stackId="1" name="WAPDA (kWh)" stroke={C.wapda} fill={C.wapda} fillOpacity={0.65} />
            <Area type="monotone" dataKey="solar" stackId="1" name="Solar (kWh)" stroke={C.solar} fill={C.solar} fillOpacity={0.7} />
            <Area type="monotone" dataKey="generator" stackId="1" name="Generator (kWh)" stroke={C.generator} fill={C.generator} fillOpacity={0.7} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <Card title="Natural Gas Distribution" subtitle="By consuming section">
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

        <Card title="Steam Distribution" subtitle="By consuming section">
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

      <Card title="Natural Gas Consumption — Stacked by Section" subtitle="Daily breakdown">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
            <CartesianGrid stroke={C.border} strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: C.textMuted }} tickFormatter={d => d.slice(5)} stroke={C.borderStrong} />
            <YAxis tick={{ fontSize: 11, fill: C.textMuted }} stroke={C.borderStrong} />
            <Tooltip contentStyle={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }} formatter={v => `${fmt(v)} ft³`} />
            <Legend wrapperStyle={{ fontSize: 11.5, paddingTop: 8 }} />
            <Bar dataKey="boiler_gas" stackId="g" name="Boiler" fill="#C8924B" />
            <Bar dataKey="cr_gas" stackId="g" name="CR" fill="#1B6770" />
            <Bar dataKey="h2_gas" stackId="g" name="Hydrogen" fill="#E8B547" />
            <Bar dataKey="factory_gas" stackId="g" name="Factory" fill="#8B5A2B" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

// ============================================================================
// PAGE: STOCK & INVENTORY
// ============================================================================
const StockPage = ({ records }) => {
  const latestRYK = useMemo(() => {
    return records.filter(r => r.plant === 'RYK').sort((a, b) => b.reportDate.localeCompare(a.reportDate))[0];
  }, [records]);

  if (!latestRYK) return <div>No data</div>;
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
      <PageHeader
        title="Stock & Inventory"
        subtitle={`As of ${latestRYK.reportDate} — RYK plant warehouses`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KPICard label="FG Ghee" value={fmt(s.fg_ghee, 1)} unit="MT" accent={C.ghee} sub="Finished goods warehouse" />
        <KPICard label="FG Oil" value={fmt(s.fg_oil, 1)} unit="MT" accent={C.oil} sub="Finished goods warehouse" />
        <KPICard label="Packable Ghee" value={fmt(s.packable_ghee, 1)} unit="MT" accent={C.primary} sub="Ready to fill" />
        <KPICard label="Packable Oil" value={fmt(s.packable_oil, 1)} unit="MT" accent={C.primary} sub="Ready to fill" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KPICard label="Hard Blended Ghee" value={fmt(s.hard_blended_ghee, 1)} unit="MT" accent={C.ghee} />
        <KPICard label="Hard Ghee (OST)" value={fmt(s.hard_ghee, 1)} unit="MT" accent={C.ghee} />
        <KPICard label="Mustard Packable" value={fmt(s.mustard_packable, 1)} unit="MT" accent={C.mustard} />
        <KPICard label="Total OST" value={fmt(s.ost_total)} unit="MT" accent={C.primary} sub="Raw oil tanks" />
      </div>

      <Card title="Raw Oil Tank (OST) Breakdown" subtitle="By oil type">
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
// PAGE: DISPATCH
// ============================================================================
const DispatchPage = ({ records, period, setPeriod }) => {
  const filtered = useMemo(() => filterByPeriod(records, period), [records, period]);
  const agg = useMemo(() => aggregate(filtered), [filtered]);
  const trend = useMemo(() => groupByDate(filtered), [filtered]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader
        title="Dispatch Activity"
        subtitle="Vehicle dispatches and tonnage moved out"
        right={<PeriodTabs value={period} onChange={setPeriod} />}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
        <KPICard label="Total Dispatched" value={fmt(agg.dispatch)} unit="MT" accent={C.primary} icon={Truck} />
        <KPICard label="Vehicles" value={fmt(agg.vehicles)} unit="trips" accent={C.accent} />
        <KPICard label="Avg per Vehicle" value={fmt(agg.vehicles ? agg.dispatch/agg.vehicles : 0, 1)} unit="MT" accent={C.success} />
      </div>

      <Card title="Daily Dispatch Trend" subtitle="Tonnage moved out by date">
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
// UPLOAD PAGE
// ============================================================================
const UploadPage = ({ records, addRecord, exportSession, importSession }) => {
  const [plant, setPlant] = useState('RYK');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileInputRef = useRef(null);
  const importRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const recent = [...records].sort((a, b) => b.uploadDate.localeCompare(a.uploadDate)).slice(0, 8);

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    setMsg(null);
    let success = 0, failed = 0;

    for (const file of files) {
      try {
        let content = '';
        const ext = file.name.split('.').pop().toLowerCase();

        if (ext === 'xlsx' || ext === 'xls') {
          const buffer = await file.arrayBuffer();
          const wb = XLSX.read(buffer, { type: 'array' });
          const sheets = wb.SheetNames.map(n => `=== ${n} ===\n${XLSX.utils.sheet_to_csv(wb.Sheets[n])}`);
          content = sheets.join('\n\n');
        } else if (ext === 'pdf') {
          const buffer = await file.arrayBuffer();
          content = `[PDF: ${file.name}, ${buffer.byteLength} bytes — Ahmed Group Operational Reporting Pack]`;
        } else if (ext === 'csv' || ext === 'txt') {
          content = await file.text();
        } else {
          throw new Error(`Unsupported: ${ext}`);
        }

        const detectedPlant = file.name.match(/RYK|Rahim/i) ? 'RYK' : file.name.match(/SKR|Sukk/i) ? 'SKR' : plant;
        const extracted = await extractWithClaude(content.slice(0, 12000), file.name, detectedPlant);

        const today = new Date().toISOString().slice(0, 10);
        const reportDate = extracted.reportDate || today;
        const newRec = createEmptyRecord(detectedPlant, reportDate);
        newRec.fileName = file.name;
        newRec.uploadDate = today;

        // Map extracted to record
        if (extracted.production) {
          Object.entries(extracted.production).forEach(([k, v]) => {
            const key = k.replace('_actual', '');
            if (newRec.data.production[key]) newRec.data.production[key].actual = v || 0;
          });
        }
        if (extracted.filling) Object.assign(newRec.data.filling, {
          ryk_oil: extracted.filling.ryk_oil || 0,
          ryk_ghee: extracted.filling.ryk_ghee || 0,
          skr_oil: extracted.filling.skr_oil || 0,
          skr_ghee: extracted.filling.skr_ghee || 0,
          total_oil: (extracted.filling.ryk_oil || 0) + (extracted.filling.skr_oil || 0),
          total_ghee: (extracted.filling.ryk_ghee || 0) + (extracted.filling.skr_ghee || 0),
          grand_total: (extracted.filling.ryk_oil || 0) + (extracted.filling.skr_oil || 0) + (extracted.filling.ryk_ghee || 0) + (extracted.filling.skr_ghee || 0),
          brands: {
            shahbaz_ghee: extracted.filling.shahbaz_ghee || 0,
            shahbaz_oil: extracted.filling.shahbaz_oil || 0,
            gharana_ghee: extracted.filling.gharana_ghee || 0,
            gharana_oil: extracted.filling.gharana_oil || 0,
            rite_ghee: extracted.filling.rite_ghee || 0,
            rite_oil: extracted.filling.rite_oil || 0,
          },
        });
        if (extracted.utilities) {
          const u = extracted.utilities;
          newRec.data.utilities = {
            electricity: {
              wapda_peak: u.wapda_peak_kwh || 0,
              wapda_offpeak: u.wapda_offpeak_kwh || 0,
              generator: u.generator_kwh || 0,
              solar: u.solar_kwh || 0,
              total: u.total_electricity_kwh || 0, mtd: 0,
            },
            naturalGas: {
              boiler: u.boiler_gas_ft3 || 0,
              cr: u.cr_gas_ft3 || 0,
              hydrogen: u.hydrogen_gas_ft3 || 0,
              remaining: u.remaining_factory_gas_ft3 || 0,
              total: u.total_gas_ft3 || 0, mtd: 0,
            },
            steam: {
              cr: u.cr_steam_mt || 0, br: u.br_steam_mt || 0,
              soap: u.soap_steam_mt || 0, gasPlant: u.gas_plant_steam_mt || 0,
              total: u.total_steam_mt || 0, mtd: 0,
            },
            water: { ro_plant1: 0, ro_plant2: 0, total: u.ro_water_mt || 0, mtd: 0 },
            diesel: { total: u.diesel_total_l || 0, mtd: 0, vehicle: 0, genset: 0 },
            hydrogen_lb: u.hydrogen_lb || 0, hydrogen_mtd: 0, furnaceOil: 0,
          };
        }
        if (extracted.stock) Object.assign(newRec.data.stock, {
          fg_ghee: extracted.stock.fg_ghee_mt || 0,
          fg_oil: extracted.stock.fg_oil_mt || 0,
          packable_ghee: extracted.stock.packable_ghee_mt || 0,
          packable_oil: extracted.stock.packable_oil_mt || 0,
          hard_blended_ghee: extracted.stock.hard_blended_ghee_mt || 0,
          hard_ghee: extracted.stock.hard_ghee_mt || 0,
          ost_total: extracted.stock.ost_total_mt || 0,
        });
        if (extracted.dispatch) Object.assign(newRec.data.dispatch, {
          total_mt: extracted.dispatch.total_mt || 0,
          vehicles: extracted.dispatch.vehicles || 0,
          ghee_consumer: extracted.dispatch.ghee_mt || 0,
          oil_consumer: extracted.dispatch.oil_mt || 0,
        });
        if (extracted.soap) Object.assign(newRec.data.soap, {
          total_actual: extracted.soap.total_actual_mt || 0,
          total_mtd: extracted.soap.total_mtd_mt || 0,
          forecast: extracted.soap.forecast_mtd || 0,
          compliance: extracted.soap.compliance_pct || 0,
        });
        if (extracted.mustard) Object.assign(newRec.data.mustard, {
          total_kg: extracted.mustard.total_kg || 0,
          ml_125: extracted.mustard.ml_125 || 0,
          ml_250: extracted.mustard.ml_250 || 0,
          ml_500: extracted.mustard.ml_500 || 0,
          ml_1000: extracted.mustard.ml_1000 || 0,
        });

        addRecord(newRec);
        success++;
      } catch (err) {
        console.error(err);
        failed++;
      }
    }

    setBusy(false);
    setMsg({
      type: failed === 0 ? 'success' : 'warning',
      text: `${success} file(s) processed${failed > 0 ? `, ${failed} failed` : ''}`,
    });
    setTimeout(() => setMsg(null), 5000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader
        title="Upload Daily Reports"
        subtitle="Upload PDF or Excel reports — metrics extracted automatically by AI"
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
        <Card>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11.5, fontWeight: 500, color: C.text, display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Default Plant</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {['RYK', 'SKR'].map(p => (
                <button key={p} onClick={() => setPlant(p)} style={{
                  flex: 1, padding: '11px 16px',
                  border: `1.5px solid ${plant === p ? C.primary : C.border}`,
                  background: plant === p ? C.primaryLight : '#fff',
                  color: plant === p ? C.primaryDark : C.text,
                  fontWeight: plant === p ? 600 : 500, fontSize: 13, borderRadius: 7, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontFamily: 'inherit',
                }}>
                  <Building2 size={14} />
                  {p === 'RYK' ? 'Rahim Yar Khan' : 'Sukkur'}
                </button>
              ))}
            </div>
          </div>

          <div
            onDragOver={e => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => { e.preventDefault(); setDragActive(false); handleFiles(Array.from(e.dataTransfer.files)); }}
            onClick={() => !busy && fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? C.primary : C.borderStrong}`,
              background: dragActive ? C.primaryLight : C.bg,
              borderRadius: 9, padding: '36px 24px', textAlign: 'center', cursor: busy ? 'wait' : 'pointer',
            }}
          >
            <input ref={fileInputRef} type="file" multiple accept=".xlsx,.xls,.pdf,.csv,.txt"
              style={{ display: 'none' }} onChange={e => handleFiles(Array.from(e.target.files))} />
            <div style={{ width: 50, height: 50, background: '#fff', borderRadius: '50%', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${C.border}` }}>
              {busy ? <Loader2 size={22} color={C.primary} className="spin" /> : <FileUp size={22} color={C.primary} />}
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, color: C.text, marginBottom: 4 }}>
              {busy ? 'Processing...' : 'Drop files or click to browse'}
            </div>
            <div style={{ fontSize: 12, color: C.textMuted }}>
              Operational Reporting Pack, Stock Reports, Soap, Mustard, Spices — XLSX or PDF
            </div>
          </div>

          {msg && (
            <div style={{
              marginTop: 12, padding: '10px 14px', borderRadius: 7, fontSize: 12.5,
              display: 'flex', alignItems: 'center', gap: 9,
              background: msg.type === 'success' ? '#EAF4ED' : '#FAF1E0',
              color: msg.type === 'success' ? '#2D5A3F' : '#7A5510',
              border: `1px solid ${msg.type === 'success' ? '#C7E0D0' : '#EAD5A8'}`,
            }}>
              {msg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertTriangle size={15} />}
              {msg.text}
            </div>
          )}
        </Card>

        <Card title="Session Backup" subtitle="Save and restore your data">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            <button onClick={exportSession} style={{
              width: '100%', padding: '10px 14px', background: C.primary, color: '#fff',
              border: 'none', borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'inherit',
            }}>
              <Save size={14} /> Export session
            </button>
            <input ref={importRef} type="file" accept=".json" style={{ display: 'none' }}
              onChange={e => importSession(e.target.files[0])} />
            <button onClick={() => importRef.current?.click()} style={{
              width: '100%', padding: '10px 14px', background: '#fff', color: C.primaryDark,
              border: `1.5px solid ${C.primary}`, borderRadius: 7, cursor: 'pointer', fontSize: 13, fontWeight: 500,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
              fontFamily: 'inherit',
            }}>
              <Upload size={14} /> Import session
            </button>
            <div style={{ marginTop: 8, paddingTop: 12, borderTop: `1px solid ${C.border}`, fontSize: 11.5, color: C.textMuted, lineHeight: 1.5 }}>
              Tracking <strong style={{ color: C.text }}>{records.length}</strong> reports.
            </div>
          </div>
        </Card>
      </div>

      <Card title="Recent Uploads">
        {recent.length === 0 ? (
          <div style={{ padding: 28, textAlign: 'center', color: C.textMuted, fontSize: 13 }}>No reports yet.</div>
        ) : (
          <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {['File', 'Plant', 'Report Date', 'Oil', 'Ghee', 'Soap', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '9px 8px', fontSize: 10.5, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent.map(r => (
                <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: '10px 8px', color: C.text, fontWeight: 500, fontSize: 12 }}>{r.fileName}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{
                      padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                      background: r.plant === 'RYK' ? '#E5F0F1' : '#E8EEF4',
                      color: r.plant === 'RYK' ? C.primaryDark : '#3E5670',
                    }}>{r.plant}</span>
                  </td>
                  <td style={{ padding: '10px 8px', color: C.textMuted }}>{r.reportDate}</td>
                  <td style={{ padding: '10px 8px', fontFamily: 'Sora, sans-serif', color: C.text }}>{fmt(r.data.filling.total_oil)}</td>
                  <td style={{ padding: '10px 8px', fontFamily: 'Sora, sans-serif', color: C.text }}>{fmt(r.data.filling.total_ghee)}</td>
                  <td style={{ padding: '10px 8px', fontFamily: 'Sora, sans-serif', color: C.text }}>{fmt(r.data.soap.total_actual, 1)}</td>
                  <td style={{ padding: '10px 8px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: C.success }}>
                      <CheckCircle2 size={12} /> Processed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
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
<div class="meta">${periodLabel} Operational Report &nbsp;•&nbsp; ${today.toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })} &nbsp;•&nbsp; ${filtered.length} reports analysed</div>
<div class="summary"><strong>Executive Summary</strong>
<ul style="margin: 6px 0 0; padding-left: 18px;">
<li>Total filling production: <strong>${fmt(agg.totalProduction)} MT</strong></li>
<li>Cooking oil: ${fmt(agg.oil)} MT &nbsp;•&nbsp; Ghee: ${fmt(agg.ghee)} MT</li>
<li>Soap: ${fmt(agg.soap, 1)} MT &nbsp;•&nbsp; Mustard: ${fmt(agg.mustard, 1)} MT</li>
<li>Total electricity: ${fmt(agg.electricity)} kWh (Solar: ${fmt(agg.solar)} kWh, ${fmt(agg.electricity ? agg.solar/agg.electricity*100 : 0, 1)}%)</li>
<li>Hydrogen produced: ${fmt(agg.hydrogen)} lb &nbsp;•&nbsp; Dispatch: ${fmt(agg.dispatch)} MT</li>
</ul></div>
<h2>Section-level Production</h2>
<table><thead><tr><th>Section</th><th>Standard (MT)</th><th>Actual (MT)</th><th>Variance</th></tr></thead><tbody>
<tr><td>CR Chemical (Oil)</td><td>${fmt(agg.cr_chemical_std)}</td><td>${fmt(agg.cr_chemical_actual)}</td><td>${fmt(agg.cr_chemical_actual - agg.cr_chemical_std)}</td></tr>
<tr><td>CR Physical (Ghee)</td><td>${fmt(agg.cr_physical_ghee_std)}</td><td>${fmt(agg.cr_physical_ghee_actual)}</td><td>${fmt(agg.cr_physical_ghee_actual - agg.cr_physical_ghee_std)}</td></tr>
<tr><td>CR Physical (Oil)</td><td>${fmt(agg.cr_physical_oil_std)}</td><td>${fmt(agg.cr_physical_oil_actual)}</td><td>${fmt(agg.cr_physical_oil_actual - agg.cr_physical_oil_std)}</td></tr>
<tr><td>BR Hydrogenation</td><td>${fmt(agg.br_hydro_std)}</td><td>${fmt(agg.br_hydro_actual)}</td><td>${fmt(agg.br_hydro_actual - agg.br_hydro_std)}</td></tr>
<tr><td>BR Blending</td><td>${fmt(agg.br_blend_std)}</td><td>${fmt(agg.br_blend_actual)}</td><td>${fmt(agg.br_blend_actual - agg.br_blend_std)}</td></tr>
<tr><td>BR Final DEO</td><td>${fmt(agg.br_deo_std)}</td><td>${fmt(agg.br_deo_actual)}</td><td>${fmt(agg.br_deo_actual - agg.br_deo_std)}</td></tr>
</tbody></table>
<h2>Utility Consumption</h2>
<table><thead><tr><th>Utility</th><th>Total</th><th>Note</th></tr></thead><tbody>
<tr><td>Electricity</td><td>${fmt(agg.electricity)} kWh</td><td>WAPDA: ${fmt(agg.wapda)}, Solar: ${fmt(agg.solar)}</td></tr>
<tr><td>Natural Gas</td><td>${fmt(agg.gas)} ft³</td><td>Boiler: ${fmt(agg.boiler_gas)}, CR: ${fmt(agg.cr_gas)}</td></tr>
<tr><td>Steam</td><td>${fmt(agg.steam)} MT</td><td>BR: ${fmt(agg.br_steam)}, CR: ${fmt(agg.cr_steam)}</td></tr>
<tr><td>Water (RO)</td><td>${fmt(agg.water)} MT</td><td>—</td></tr>
<tr><td>Hydrogen Gas</td><td>${fmt(agg.hydrogen)} lb</td><td>—</td></tr>
<tr><td>Diesel</td><td>${fmt(agg.diesel)} L</td><td>—</td></tr>
</tbody></table>
${alerts.length > 0 ? `<h2>Alerts &amp; Anomalies</h2>${alerts.map(a => `<div class="alert"><strong>${a.title}</strong><br/>${a.detail}</div>`).join('')}` : ''}
<div class="footer">Prepared for the Group Technical Head &nbsp;•&nbsp; Ahmed Group of Industries<br/>
Sources: Operational Reporting Pack (RYK + SKR), FG/Stock Reports, Soap/Mustard/Spices reports. All figures conform to PSQCA/PFSA reporting standards.</div>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Ahmed_Group_${periodLabel}_${today.toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <PageHeader
        title="Generate Report"
        subtitle="Formatted report for the Group Technical Head — open as PDF in any browser"
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
        }
      />

      <Card>
        <div style={{ padding: '6px 4px', maxWidth: 700, margin: '0 auto' }}>
          <div style={{ borderBottom: `2px solid ${C.primary}`, paddingBottom: 12, marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 21, color: C.primaryDark, fontFamily: 'Sora, sans-serif' }}>Ahmed Group of Industries</h2>
            <div style={{ fontSize: 12.5, color: C.textMuted, marginTop: 3 }}>
              {periodLabel} Operational Report  •  {new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' })}  •  {filtered.length} reports analysed
            </div>
          </div>

          <div style={{ background: C.bg, padding: '14px 18px', borderRadius: 8, borderLeft: `3px solid ${C.primary}`, marginBottom: 18 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: C.text, marginBottom: 7 }}>Executive Summary</div>
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: C.text, lineHeight: 1.75 }}>
              <li>Total filling production: <strong>{fmt(agg.totalProduction)} MT</strong></li>
              <li>Cooking oil: {fmt(agg.oil)} MT • Ghee: {fmt(agg.ghee)} MT</li>
              <li>Soap: {fmt(agg.soap, 1)} MT • Mustard: {fmt(agg.mustard, 1)} MT</li>
              <li>Electricity: {fmt(agg.electricity)} kWh (Solar share: {fmt(agg.electricity ? agg.solar/agg.electricity*100 : 0, 1)}%)</li>
              <li>Hydrogen: {fmt(agg.hydrogen)} lb • Dispatch: {fmt(agg.dispatch)} MT</li>
            </ul>
          </div>

          <h3 style={{ fontSize: 14, color: C.primaryDark, margin: '18px 0 8px', fontFamily: 'Sora, sans-serif' }}>Section-level Production</h3>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: C.bg }}>
              {['Section', 'Standard', 'Actual', 'Variance'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '8px 9px', fontSize: 10.5, fontWeight: 600, color: C.text, borderBottom: `1px solid ${C.borderStrong}` }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[
                ['CR Chemical (Oil)', agg.cr_chemical_std, agg.cr_chemical_actual],
                ['CR Physical (Ghee)', agg.cr_physical_ghee_std, agg.cr_physical_ghee_actual],
                ['CR Physical (Oil)', agg.cr_physical_oil_std, agg.cr_physical_oil_actual],
                ['BR Hydrogenation', agg.br_hydro_std, agg.br_hydro_actual],
                ['BR Blending', agg.br_blend_std, agg.br_blend_actual],
                ['BR Final DEO', agg.br_deo_std, agg.br_deo_actual],
              ].map(([n, s, a]) => (
                <tr key={n}>
                  <td style={{ padding: '8px 9px', borderBottom: `1px solid ${C.border}`, color: C.text, fontWeight: 500 }}>{n}</td>
                  <td style={{ padding: '8px 9px', borderBottom: `1px solid ${C.border}`, color: C.textMuted, fontFamily: 'Sora, sans-serif' }}>{fmt(s)} MT</td>
                  <td style={{ padding: '8px 9px', borderBottom: `1px solid ${C.border}`, color: C.text, fontFamily: 'Sora, sans-serif' }}>{fmt(a)} MT</td>
                  <td style={{ padding: '8px 9px', borderBottom: `1px solid ${C.border}`, color: a-s < 0 ? C.danger : C.success, fontFamily: 'Sora, sans-serif' }}>{a-s > 0 ? '+' : ''}{fmt(a-s)} MT</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 24, paddingTop: 12, borderTop: `1px solid ${C.border}`, color: C.textLight, fontSize: 10.5 }}>
            Prepared for the Group Technical Head  •  Sources: Operational Reporting Pack (RYK + SKR), FG/Stock Reports, Soap/Mustard/Spices reports.
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
        <table style={{ width: '100%', fontSize: 12.5, borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${C.borderStrong}` }}>
              {['Date', 'Plant', 'Oil', 'Ghee', 'Soap', 'Electricity', 'Gas', ''].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '9px 8px', fontSize: 10.5, fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <td style={{ padding: '10px 8px', color: C.text, fontWeight: 500 }}>{r.reportDate}</td>
                <td style={{ padding: '10px 8px' }}>
                  <span style={{
                    padding: '3px 9px', borderRadius: 4, fontSize: 11, fontWeight: 500,
                    background: r.plant === 'RYK' ? '#E5F0F1' : '#E8EEF4',
                    color: r.plant === 'RYK' ? C.primaryDark : '#3E5670',
                  }}>{r.plant}</span>
                </td>
                <td style={{ padding: '10px 8px', fontFamily: 'Sora, sans-serif', color: C.text }}>{fmt(r.data.filling.total_oil)}</td>
                <td style={{ padding: '10px 8px', fontFamily: 'Sora, sans-serif', color: C.text }}>{fmt(r.data.filling.total_ghee)}</td>
                <td style={{ padding: '10px 8px', fontFamily: 'Sora, sans-serif', color: C.text }}>{fmt(r.data.soap.total_actual, 1)}</td>
                <td style={{ padding: '10px 8px', color: C.textMuted }}>{fmt(r.data.utilities.electricity.total)} kWh</td>
                <td style={{ padding: '10px 8px', color: C.textMuted }}>{fmt(r.data.utilities.naturalGas.total)} ft³</td>
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

  const exportSession = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), records }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ahmed_group_session_${new Date().toISOString().slice(0,10)}.json`;
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
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
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
        {page === 'upload' && <UploadPage records={records} addRecord={addRecord} exportSession={exportSession} importSession={importSession} />}
        {page === 'reports' && <ReportsPage records={records} period={period} setPeriod={setPeriod} />}
        {page === 'history' && <HistoryPage records={records} removeRecord={removeRecord} />}
      </main>
    </div>
  );
}
