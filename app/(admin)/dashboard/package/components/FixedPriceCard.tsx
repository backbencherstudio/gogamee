"use client";
import React, { useState, useEffect, useCallback } from "react";
import { DollarSign, Edit, Save, X, RefreshCw, Calendar } from "lucide-react";
import {
  getStartingPrice,
  updateStartingPrice,
} from "../../../../../services/packageService";
import { useToast } from "../../../../../components/ui/toast";

const DURATION_OPTIONS = [
  { value: 1 as const, label: "1 Night" },
  { value: 2 as const, label: "2 Nights" },
  { value: 3 as const, label: "3 Nights" },
  { value: 4 as const, label: "4 Nights" },
];

type DurationValue = (typeof DURATION_OPTIONS)[number]["value"];
type SportKey = "football" | "basketball" | "combined";

interface DurationPriceData { standardPrice: number; premiumPrice: number; }
type SportPriceData = { currency: string; } & Record<DurationValue, DurationPriceData>;

export default function FixedPriceCard({ onPriceUpdate, onDurationChange }: any) {
  const { addToast } = useToast();
  const [selectedDuration, setSelectedDuration] = useState<DurationValue>(1);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modifiedSports, setModifiedSports] = useState<Set<SportKey>>(new Set());

  const [priceData, setPriceData] = useState<Record<SportKey, SportPriceData>>({
    football: { 1: { standardPrice: 0, premiumPrice: 0 }, 2: { standardPrice: 0, premiumPrice: 0 }, 3: { standardPrice: 0, premiumPrice: 0 }, 4: { standardPrice: 0, premiumPrice: 0 }, currency: "EUR" },
    basketball: { 1: { standardPrice: 0, premiumPrice: 0 }, 2: { standardPrice: 0, premiumPrice: 0 }, 3: { standardPrice: 0, premiumPrice: 0 }, 4: { standardPrice: 0, premiumPrice: 0 }, currency: "EUR" },
    combined: { 1: { standardPrice: 0, premiumPrice: 0 }, 2: { standardPrice: 0, premiumPrice: 0 }, 3: { standardPrice: 0, premiumPrice: 0 }, 4: { standardPrice: 0, premiumPrice: 0 }, currency: "EUR" },
  });

  const [backupPriceData, setBackupPriceData] = useState<any>(null);

  const fetchPrices = useCallback(async () => {
    setLoading(true);
    try {
      const [f, b, c] = await Promise.all([getStartingPrice("football"), getStartingPrice("basketball"), getStartingPrice("combined")]);
      const newData = { ...priceData };
      const process = (res: any, s: SportKey) => {
        if (res.success && res.data?.[0]) {
          const item = res.data[0];
          newData[s].currency = item.currency || "EUR";
          Object.keys(item.pricesByDuration || {}).forEach(d => {
            const dv = parseInt(d) as DurationValue;
            if (newData[s][dv]) {
              newData[s][dv].standardPrice = item.pricesByDuration[d].standard || 0;
              newData[s][dv].premiumPrice = item.pricesByDuration[d].premium || 0;
            }
          });
        }
      };
      process(f, "football"); process(b, "basketball"); process(c, "combined");
      setPriceData(newData);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPrices(); }, [fetchPrices]);

  const handlePriceChange = (s: SportKey, d: DurationValue, type: "standardPrice" | "premiumPrice", val: string) => {
    const num = val === "" ? 0 : parseFloat(val);
    setPriceData(prev => ({ ...prev, [s]: { ...prev[s], [d]: { ...prev[s][d], [type]: isNaN(num) ? 0 : num } } }));
    setModifiedSports(prev => new Set(prev).add(s));
  };

  const handleSave = async () => {
    if (modifiedSports.size === 0) { setIsEditing(false); return; }
    setIsSaving(true);
    try {
      await Promise.all(Array.from(modifiedSports).map(async (s) => {
        const info = priceData[s];
        const payload = {
          type: s,
          currency: info.currency,
          pricesByDuration: {
            "1": { standard: info[1].standardPrice, premium: info[1].premiumPrice },
            "2": { standard: info[2].standardPrice, premium: info[2].premiumPrice },
            "3": { standard: info[3].standardPrice, premium: info[3].premiumPrice },
            "4": { standard: info[4].standardPrice, premium: info[4].premiumPrice },
          },
          isActive: true
        };
        return updateStartingPrice(s, payload);
      }));
      setIsEditing(false);
      setModifiedSports(new Set());
      addToast({ type: "success", title: "Saved", description: "Prices updated." });
    } catch (err) { 
      console.error(err);
      addToast({ type: "error", title: "Error", description: "Failed to save." });
    } finally { setIsSaving(false); }
  };

  if (loading) return <div className="p-8 text-center"><RefreshCw className="animate-spin mx-auto mb-2" />Loading...</div>;

  return (
    <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col">
      <div className="px-4 sm:px-6 py-4 border-b border-zinc-100 flex flex-col sm:flex-row sm:items-center justify-between bg-zinc-50/50 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#76C043]/10 flex items-center justify-center shrink-0"><DollarSign className="w-5 h-5 text-[#76C043]" /></div>
          <div><h2 className="text-base sm:text-lg font-bold text-zinc-900 font-['Poppins']">Starting Prices Configuration</h2><p className="text-[10px] sm:text-xs text-zinc-500 font-['Poppins']">Set base prices for each sport and duration</p></div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {!isEditing ? <button onClick={() => { setBackupPriceData(JSON.parse(JSON.stringify(priceData))); setIsEditing(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-[#76C043] text-white rounded-lg text-sm font-semibold hover:bg-lime-600 transition-all shadow-sm"><Edit className="w-4 h-4" />Edit Prices</button> : 
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button onClick={() => { setPriceData(backupPriceData); setIsEditing(false); setModifiedSports(new Set()); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white border border-zinc-200 text-zinc-600 rounded-lg text-sm font-semibold hover:bg-zinc-50 transition-all"><X className="w-4 h-4" />Cancel</button>
              <button onClick={handleSave} disabled={isSaving} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm disabled:opacity-50">{isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Save Changes</button>
            </div>}
        </div>
      </div>
      <div className="px-4 sm:px-6 py-3 bg-zinc-50/30 border-b border-zinc-100 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase mr-2 font-['Poppins']">Nights:</span>
          {DURATION_OPTIONS.map((opt) => (
            <button key={opt.value} onClick={() => { setSelectedDuration(opt.value); if (onDurationChange) onDurationChange(opt.value); }} className={`px-3 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${selectedDuration === opt.value ? "bg-[#76C043] text-white shadow-sm" : "bg-white border border-zinc-200 text-zinc-600 hover:border-[#76C043]/50"}`}>{opt.label}</button>
          ))}
        </div>
      </div>
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {(["football", "basketball", "combined"] as SportKey[]).map(s => (
            <div key={s} className="space-y-4 bg-zinc-50/50 p-4 rounded-xl border border-zinc-100">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-200"><span className="text-xl">{s === "football" ? "⚽" : s === "basketball" ? "🏀" : "⚽🏀"}</span><h3 className="font-bold text-zinc-800 font-['Poppins'] capitalize">{s}</h3></div>
              <div className="space-y-4">
                <PriceInput label="Standard" value={priceData[s][selectedDuration].standardPrice} onChange={(val: any) => handlePriceChange(s, selectedDuration, "standardPrice", val)} isEditing={isEditing} />
                <PriceInput label="Premium" value={priceData[s][selectedDuration].premiumPrice} onChange={(val: any) => handlePriceChange(s, selectedDuration, "premiumPrice", val)} isEditing={isEditing} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PriceInput({ label, value, onChange, isEditing }: any) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <label className="text-[10px] sm:text-xs font-semibold text-zinc-500 font-['Poppins'] ml-1">{label}</label>
      <div className={`relative flex items-center transition-all ${isEditing ? "ring-2 ring-[#76C043]/20" : ""}`}>
        <div className="absolute left-3 text-zinc-400 font-medium text-sm">€</div>
        <input type={isEditing ? "number" : "text"} readOnly={!isEditing} value={isEditing ? value : `${Math.round(value)}`} onChange={(e) => onChange(e.target.value)} className={`w-full pl-8 pr-4 py-2 sm:py-2.5 rounded-xl border text-sm font-bold font-['Poppins'] outline-none ${isEditing ? "bg-white border-[#76C043] text-zinc-900 shadow-sm" : "bg-zinc-50 border-zinc-100 text-zinc-600 cursor-not-allowed"}`} />
        {!isEditing && <div className="absolute right-3 text-[9px] font-bold text-zinc-300 uppercase tracking-tighter">Fixed</div>}
      </div>
    </div>
  );
}
