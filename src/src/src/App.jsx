import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Car, Wrench, Fuel, ClipboardList, Gauge, Plus, Trash2, Globe,
  Settings as GearIcon, BookOpen, LayoutDashboard, X, Check, AlertTriangle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ---------------------------------------------------------------- palette
const NAVY = "#13293D";
const NAVY_SOFT = "#1E3A54";
const ACCENT = "#FF6B35";
const CREAM = "#F7F8FA";
const LINE = "#E2E5EA";
const MUTED = "#6B7280";
const GREEN = "#1E8E5A";
const GREEN_BG = "#E6F4EC";
const YELLOW = "#B8860B";
const YELLOW_BG = "#FDF3D9";
const RED = "#C23B3B";
const RED_BG = "#FBE7E7";
const GREY_BG = "#F0F1F3";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ---------------------------------------------------------------- i18n (UI chrome)
const STR = {
  appName: { en: "AUTOTRACK", sr: "AUTOTRACK" },
  tagline: { en: "Vehicle maintenance & expense tracker", sr: "Tracker troškova i servisa vozila" },
  tabDashboard: { en: "Dashboard", sr: "Dashboard" },
  tabVehicles: { en: "Vehicles", sr: "Vozila" },
  tabEntries: { en: "Log Entries", sr: "Unos" },
  tabSettings: { en: "Settings", sr: "Podešavanja" },
  tabGuide: { en: "Guide", sr: "Uputstvo" },
  selectVehicle: { en: "Vehicle", sr: "Vozilo" },
  noVehicles: { en: "Add a vehicle first", sr: "Prvo dodaj vozilo" },
  kpiMileage: { en: "Current mileage", sr: "Trenutna kilometraža" },
  kpiSpent: { en: "Total spent", sr: "Ukupno potrošeno" },
  kpiPerKm: { en: "Cost per km", sr: "Cena po kilometru" },
  kpiMonthly: { en: "Avg. monthly cost", sr: "Prosečan mesečni trošak" },
  mileageAtPurchase: { en: "Mileage at purchase", sr: "Kilometraža pri kupovini" },
  drivenSince: { en: "Driven since purchase", sr: "Pređeno od kupovine" },
  purchaseDate: { en: "Purchase date", sr: "Datum kupovine" },
  monthsOwned: { en: "Months owned", sr: "Meseci u vlasništvu" },
  serviceStatus: { en: "Service status", sr: "Status servisa" },
  colService: { en: "Service type", sr: "Tip servisa" },
  colInterval: { en: "Interval (km)", sr: "Interval (km)" },
  colLast: { en: "Last service (km)", sr: "Poslednji servis (km)" },
  colNext: { en: "Next service (km)", sr: "Sledeći servis (km)" },
  colRemaining: { en: "Remaining (km)", sr: "Preostalo (km)" },
  colStatus: { en: "Status", sr: "Status" },
  statusOk: { en: "OK", sr: "OK" },
  statusSoon: { en: "SOON", sr: "USKORO" },
  statusUrgent: { en: "URGENT", sr: "HITNO" },
  statusCheckDate: { en: "Check date", sr: "Proveri datum" },
  statusNoData: { en: "No data", sr: "Nema podataka" },
  costByCategory: { en: "Costs by category", sr: "Troškovi po kategoriji" },
  addVehicle: { en: "Add vehicle", sr: "Dodaj vozilo" },
  addEntry: { en: "Add entry", sr: "Dodaj unos" },
  save: { en: "Save", sr: "Sačuvaj" },
  cancel: { en: "Cancel", sr: "Otkaži" },
  delete: { en: "Delete", sr: "Obriši" },
  edit: { en: "Edit", sr: "Izmeni" },
  name: { en: "Vehicle name", sr: "Naziv vozila" },
  brand: { en: "Brand", sr: "Marka" },
  model: { en: "Model", sr: "Model" },
  year: { en: "Year", sr: "Godina" },
  plate: { en: "License plate", sr: "Registracija" },
  purchasePrice: { en: "Purchase price (EUR)", sr: "Cena kupovine (EUR)" },
  noVehiclesEmpty: { en: "No vehicles yet. Add your first one to get started.", sr: "Još nema vozila. Dodaj prvo da bi počeo." },
  date: { en: "Date", sr: "Datum" },
  vehicle: { en: "Vehicle", sr: "Vozilo" },
  expenseType: { en: "Expense type", sr: "Tip troška" },
  serviceItem: { en: "Service type", sr: "Vrsta servisa" },
  none: { en: "—", sr: "—" },
  mileage: { en: "Mileage", sr: "Kilometraža" },
  price: { en: "Price (EUR)", sr: "Cena (EUR)" },
  vendor: { en: "Shop / location", sr: "Prodavnica / lokacija" },
  note: { en: "Note", sr: "Napomena" },
  noEntries: { en: "No expenses logged yet.", sr: "Još nema unetih troškova." },
  intervalKm: { en: "Interval (km)", sr: "Interval (km)" },
  intervalMonths: { en: "Interval (months)", sr: "Interval (meseci)" },
  settingsHint: {
    en: "Adjust the numbers to match your vehicle's manual. Set km interval to 0 for items tracked by date instead (inspection, registration...).",
    sr: "Podesi brojeve prema knjižici svog vozila. Interval u km stavi na 0 za stavke koje se prate po datumu (tehnički pregled, registracija...).",
  },
  addServiceType: { en: "Add service type", sr: "Dodaj tip servisa" },
  nameEn: { en: "Name (English)", sr: "Naziv (engleski)" },
  nameSr: { en: "Name (Serbian)", sr: "Naziv (srpski)" },
  guideTitle: { en: "How to use AutoTrack", sr: "Kako da koristiš AutoTrack" },
  guideIntro: {
    en: "1. Add every vehicle you want to track in the Vehicles tab. 2. Log every expense in Log Entries — pick the vehicle, expense type, and (for services) which service it was. 3. The Dashboard calculates everything else automatically: total cost, cost per km, and a traffic light for your next service.",
    sr: "1. Dodaj svako vozilo koje pratiš u tabu Vozila. 2. Unesi svaki trošak u tab Unos — izaberi vozilo, tip troška, i (za servise) koji je servis u pitanju. 3. Dashboard sam računa sve ostalo: ukupan trošak, cenu po kilometru, i semafor za sledeći servis.",
  },
  guideColors: {
    en: "Traffic light: green = plenty of time left, yellow = under 1000 km left, red = due or overdue, grey = no matching entry logged yet, or that item is tracked by date rather than mileage.",
    sr: "Semafor: zeleno = ima još vremena, žuto = ostalo je manje od 1000 km, crveno = servis je dospeo ili prekoračen, sivo = još nije unet odgovarajući trošak, ili se ta stavka prati po datumu a ne po kilometraži.",
  },
  guideLang: {
    en: "Use the 🌐 button in the header to switch between English and Serbian at any time — your data stays exactly the same, only the interface language changes.",
    sr: "Koristi 🌐 dugme u zaglavlju da bilo kad promeniš prikaz između engleskog i srpskog — podaci ostaju isti, menja se samo jezik interfejsa.",
  },
  guideData: {
    en: "Your data is stored privately in this browser session and persists next time you open this tool.",
    sr: "Tvoji podaci se čuvaju privatno u ovoj sesiji pregledača i ostaju sačuvani kad sledeći put otvoriš ovaj alat.",
  },
  loading: { en: "Loading your data…", sr: "Učitavanje podataka…" },
  confirmDeleteVehicle: {
    en: "Delete this vehicle and all its logged expenses?",
    sr: "Obrisati ovo vozilo i sve njegove troškove?",
  },
  confirmDeleteEntry: { en: "Delete this entry?", sr: "Obrisati ovaj unos?" },
  total: { en: "Total", sr: "Ukupno" },
  category: { en: "Category", sr: "Kategorija" },
};

function useT(lang) {
  return useCallback((key) => (STR[key] ? STR[key][lang] : key), [lang]);
}

// ---------------------------------------------------------------- static domain data
const EXPENSE_TYPES = [
  { id: "service", en: "Service", sr: "Servis" },
  { id: "fuel", en: "Fuel", sr: "Gorivo" },
  { id: "registration", en: "Registration", sr: "Registracija" },
  { id: "insurance", en: "Insurance", sr: "Osiguranje" },
  { id: "other", en: "Other", sr: "Ostalo" },
];

const DEFAULT_SETTINGS = [
  { id: "oil", en: "Oil change", sr: "Zamena ulja", km: 10000, months: 12, noteEn: "Standard for most gasoline/diesel engines", noteSr: "Standard za većinu benzinskih/dizel motora" },
  { id: "airfilter", en: "Air filter", sr: "Filter vazduha", km: 15000, months: 12, noteEn: "", noteSr: "" },
  { id: "fuelfilter", en: "Fuel filter", sr: "Filter goriva", km: 20000, months: 24, noteEn: "", noteSr: "" },
  { id: "brakes", en: "Brake pads", sr: "Kočione pločice", km: 30000, months: 24, noteEn: "Depends on driving style", noteSr: "Zavisi od stila vožnje" },
  { id: "tires", en: "Tire rotation/replacement", sr: "Rotacija/zamena guma", km: 10000, months: 6, noteEn: "", noteSr: "" },
  { id: "inspection", en: "Technical inspection", sr: "Tehnički pregled", km: 0, months: 12, noteEn: "Tracked by date, not mileage", noteSr: "Prati se po datumu, ne po km" },
  { id: "registration", en: "Registration", sr: "Registracija", km: 0, months: 12, noteEn: "Tracked by date, not mileage", noteSr: "Prati se po datumu, ne po km" },
  { id: "battery", en: "Battery", sr: "Akumulator", km: 0, months: 48, noteEn: "Tracked by date, not mileage", noteSr: "Prati se po datumu, ne po km" },
  { id: "coolant", en: "Coolant", sr: "Rashladna tečnost", km: 60000, months: 24, noteEn: "", noteSr: "" },
];

const STORAGE_KEY = "autotrack-data-v1";

// ---------------------------------------------------------------- small UI atoms
function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-lg border ${className}`} style={{ borderColor: LINE }}>
      {children}
    </div>
  );
}

function KpiCard({ label, value, sub }) {
  return (
    <Card className="p-4 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: ACCENT }} />
      <div className="pl-2">
        <div className="text-[11px] font-semibold tracking-wide uppercase" style={{ color: MUTED }}>{label}</div>
        <div className="mt-1 text-2xl font-bold tabular-nums" style={{ color: NAVY, fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}>
          {value}
        </div>
        {sub && <div className="text-xs mt-0.5" style={{ color: MUTED }}>{sub}</div>}
      </div>
    </Card>
  );
}

function Button({ children, onClick, variant = "primary", type = "button", className = "", disabled }) {
  const base = "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const styles = {
    primary: { background: NAVY, color: "white" },
    accent: { background: ACCENT, color: "white" },
    ghost: { background: "transparent", color: NAVY, border: `1px solid ${LINE}` },
    danger: { background: "transparent", color: RED, border: `1px solid ${RED_BG}` },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${className}`} style={styles[variant]}>
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1" style={{ color: MUTED }}>{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full px-2.5 py-1.5 rounded-md border text-sm outline-none focus:ring-2";
const inputStyle = { borderColor: LINE };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(19,41,61,0.45)" }}>
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b sticky top-0 bg-white" style={{ borderColor: LINE }}>
          <h3 className="font-bold" style={{ color: NAVY }}>{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function StatusPill({ status, t }) {
  const map = {
    ok: { bg: GREEN_BG, fg: GREEN, label: t("statusOk") },
    soon: { bg: YELLOW_BG, fg: YELLOW, label: t("statusSoon") },
    urgent: { bg: RED_BG, fg: RED, label: t("statusUrgent") },
    checkdate: { bg: GREY_BG, fg: MUTED, label: t("statusCheckDate") },
    nodata: { bg: GREY_BG, fg: MUTED, label: t("statusNoData") },
  };
  const s = map[status];
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold" style={{ background: s.bg, color: s.fg }}>
      {s.label}
    </span>
  );
}

// ================================================================== APP
export default function AutoTrack() {
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [selectedVehicleId, setSelectedVehicleId] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [vehicleModal, setVehicleModal] = useState(null); // {} = new, {...v} = edit
  const [entryModal, setEntryModal] = useState(null);
  const [settingModal, setSettingModal] = useState(null);
  const t = useT(lang);

  // ---- load once (plain browser localStorage - works standalone, no Claude runtime needed)
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setLang(data.lang || "en");
        setVehicles(data.vehicles || []);
        setExpenses(data.expenses || []);
        setSettings(data.settings && data.settings.length ? data.settings : DEFAULT_SETTINGS);
        setSelectedVehicleId(data.selectedVehicleId || (data.vehicles && data.vehicles[0]?.id) || null);
      }
    } catch (e) {
      // no saved data yet, or it's corrupted - start fresh
    } finally {
      setLoading(false);
    }
  }, []);

  // ---- persist on change (skip until initial load finished)
  useEffect(() => {
    if (loading) return;
    try {
      const payload = JSON.stringify({ lang, vehicles, expenses, settings, selectedVehicleId });
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      // storage full or unavailable (e.g. private browsing) - data just won't persist
    }
  }, [lang, vehicles, expenses, settings, selectedVehicleId, loading]);

  useEffect(() => {
    if (!selectedVehicleId && vehicles.length) setSelectedVehicleId(vehicles[0].id);
  }, [vehicles, selectedVehicleId]);

  const vehicle = vehicles.find((v) => v.id === selectedVehicleId) || null;
  const vehicleExpenses = useMemo(
    () => expenses.filter((e) => e.vehicleId === selectedVehicleId),
    [expenses, selectedVehicleId]
  );

  // ---- derived dashboard numbers
  const currentMileage = useMemo(() => {
    if (!vehicle) return 0;
    const maxLogged = vehicleExpenses.reduce((m, e) => (e.mileage ? Math.max(m, Number(e.mileage)) : m), 0);
    return Math.max(maxLogged, Number(vehicle.mileageAtPurchase || 0));
  }, [vehicle, vehicleExpenses]);

  const totalSpent = useMemo(() => vehicleExpenses.reduce((s, e) => s + Number(e.price || 0), 0), [vehicleExpenses]);
  const drivenSincePurchase = vehicle ? currentMileage - Number(vehicle.mileageAtPurchase || 0) : 0;
  const monthsOwned = useMemo(() => {
    if (!vehicle?.purchaseDate) return 0;
    const p = new Date(vehicle.purchaseDate);
    const now = new Date();
    return Math.max(0, (now.getFullYear() - p.getFullYear()) * 12 + (now.getMonth() - p.getMonth()));
  }, [vehicle]);
  const costPerKm = drivenSincePurchase > 0 ? totalSpent / drivenSincePurchase : 0;
  const avgMonthly = monthsOwned > 0 ? totalSpent / monthsOwned : 0;

  const serviceStatusRows = useMemo(() => {
    return settings.map((s) => {
      const matching = vehicleExpenses.filter((e) => e.serviceItemId === s.id && e.mileage);
      const lastServiceKm = matching.length ? Math.max(...matching.map((e) => Number(e.mileage))) : 0;
      const nextServiceKm = s.km > 0 && lastServiceKm > 0 ? lastServiceKm + s.km : 0;
      const remaining = nextServiceKm > 0 ? nextServiceKm - currentMileage : 0;
      let status;
      if (s.km === 0) status = "checkdate";
      else if (lastServiceKm === 0) status = "nodata";
      else if (remaining <= 0) status = "urgent";
      else if (remaining <= 1000) status = "soon";
      else status = "ok";
      return { ...s, lastServiceKm, nextServiceKm, remaining, status };
    });
  }, [settings, vehicleExpenses, currentMileage]);

  const categoryTotals = useMemo(() => {
    return EXPENSE_TYPES.map((cat) => ({
      key: cat.id,
      label: lang === "en" ? cat.en : cat.sr,
      total: vehicleExpenses.filter((e) => e.expenseType === cat.id).reduce((s, e) => s + Number(e.price || 0), 0),
    }));
  }, [vehicleExpenses, lang]);

  const fmtNum = (n) => Number(n || 0).toLocaleString(lang === "en" ? "en-US" : "sr-RS", { maximumFractionDigits: 0 });
  const fmtEur = (n) => `${Number(n || 0).toLocaleString(lang === "en" ? "en-US" : "sr-RS", { maximumFractionDigits: 2 })} EUR`;

  // ---------------------------------------------------------------- CRUD
  const saveVehicle = (v) => {
    if (v.id) setVehicles((list) => list.map((x) => (x.id === v.id ? v : x)));
    else {
      const nv = { ...v, id: uid() };
      setVehicles((list) => [...list, nv]);
      setSelectedVehicleId(nv.id);
    }
    setVehicleModal(null);
  };
  const deleteVehicle = (id) => {
    if (!window.confirm(t("confirmDeleteVehicle"))) return;
    setVehicles((list) => list.filter((v) => v.id !== id));
    setExpenses((list) => list.filter((e) => e.vehicleId !== id));
    if (selectedVehicleId === id) setSelectedVehicleId(null);
  };

  const saveEntry = (e) => {
    if (e.id) setExpenses((list) => list.map((x) => (x.id === e.id ? e : x)));
    else setExpenses((list) => [...list, { ...e, id: uid() }]);
    setEntryModal(null);
  };
  const deleteEntry = (id) => {
    if (!window.confirm(t("confirmDeleteEntry"))) return;
    setExpenses((list) => list.filter((e) => e.id !== id));
  };

  const saveSetting = (s) => {
    if (s.id && settings.some((x) => x.id === s.id)) {
      setSettings((list) => list.map((x) => (x.id === s.id ? s : x)));
    } else {
      setSettings((list) => [...list, { ...s, id: uid() }]);
    }
    setSettingModal(null);
  };
  const deleteSetting = (id) => setSettings((list) => list.filter((s) => s.id !== id));

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center" style={{ background: CREAM }}>
        <div className="text-sm" style={{ color: MUTED }}>{t("loading")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: CREAM, fontFamily: "Arial, ui-sans-serif, system-ui" }}>
      {/* header */}
      <div style={{ background: NAVY }} className="text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <Car size={22} style={{ color: ACCENT }} />
            <div>
              <div className="font-bold tracking-wide leading-none">{t("appName")}</div>
              <div className="text-[11px] leading-none mt-0.5" style={{ color: "#D9E4EC" }}>{t("tagline")}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedVehicleId || ""}
              onChange={(ev) => setSelectedVehicleId(ev.target.value || null)}
              className="rounded-md px-2 py-1.5 text-sm text-white border"
              style={{ background: NAVY_SOFT, borderColor: "#2C4A64" }}
            >
              {vehicles.length === 0 && <option value="">{t("noVehicles")}</option>}
              {vehicles.map((v) => (
                <option key={v.id} value={v.id} style={{ color: "black" }}>{v.name}</option>
              ))}
            </select>
            <button
              onClick={() => setLang((l) => (l === "en" ? "sr" : "en"))}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-sm font-bold"
              style={{ background: "#0E7C7B" }}
              title="English / Srpski"
            >
              <Globe size={14} /> {lang === "en" ? "EN" : "SR"}
            </button>
          </div>
        </div>
        {/* tabs */}
        <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
          {[
            ["dashboard", LayoutDashboard, "tabDashboard"],
            ["vehicles", Car, "tabVehicles"],
            ["entries", ClipboardList, "tabEntries"],
            ["settings", GearIcon, "tabSettings"],
            ["guide", BookOpen, "tabGuide"],
          ].map(([key, Icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold border-b-2 whitespace-nowrap"
              style={{
                borderColor: tab === key ? ACCENT : "transparent",
                color: tab === key ? "white" : "#9FB2C3",
              }}
            >
              <Icon size={15} /> {t(label)}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        {tab === "dashboard" && (
          <DashboardTab
            t={t} lang={lang} vehicle={vehicle} vehicles={vehicles}
            currentMileage={currentMileage} totalSpent={totalSpent} costPerKm={costPerKm} avgMonthly={avgMonthly}
            drivenSincePurchase={drivenSincePurchase} monthsOwned={monthsOwned}
            serviceStatusRows={serviceStatusRows} categoryTotals={categoryTotals}
            fmtNum={fmtNum} fmtEur={fmtEur}
          />
        )}

        {tab === "vehicles" && (
          <VehiclesTab
            t={t} vehicles={vehicles} onAdd={() => setVehicleModal({})}
            onEdit={(v) => setVehicleModal(v)} onDelete={deleteVehicle} fmtEur={fmtEur}
          />
        )}

        {tab === "entries" && (
          <EntriesTab
            t={t} lang={lang} vehicles={vehicles} expenses={expenses} settings={settings}
            onAdd={() => setEntryModal({})} onEdit={(e) => setEntryModal(e)} onDelete={deleteEntry}
            fmtEur={fmtEur}
          />
        )}

        {tab === "settings" && (
          <SettingsTab
            t={t} lang={lang} settings={settings}
            onAdd={() => setSettingModal({})} onEdit={(s) => setSettingModal(s)} onDelete={deleteSetting}
          />
        )}

        {tab === "guide" && <GuideTab t={t} />}
      </div>

      {vehicleModal && (
        <VehicleModal t={t} initial={vehicleModal} onSave={saveVehicle} onClose={() => setVehicleModal(null)} />
      )}
      {entryModal && (
        <EntryModal
          t={t} lang={lang} vehicles={vehicles} settings={settings}
          defaultVehicleId={selectedVehicleId} initial={entryModal}
          onSave={saveEntry} onClose={() => setEntryModal(null)}
        />
      )}
      {settingModal && (
        <SettingModal t={t} initial={settingModal} onSave={saveSetting} onClose={() => setSettingModal(null)} />
      )}
    </div>
  );
}

// ================================================================== DASHBOARD
function DashboardTab({ t, lang, vehicle, vehicles, currentMileage, totalSpent, costPerKm, avgMonthly, drivenSincePurchase, monthsOwned, serviceStatusRows, categoryTotals, fmtNum, fmtEur }) {
  if (!vehicles.length) {
    return <EmptyState t={t} />;
  }
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label={t("kpiMileage")} value={`${fmtNum(currentMileage)} km`} />
        <KpiCard label={t("kpiSpent")} value={fmtEur(totalSpent)} />
        <KpiCard label={t("kpiPerKm")} value={fmtEur(costPerKm)} />
        <KpiCard label={t("kpiMonthly")} value={fmtEur(avgMonthly)} />
      </div>

      <Card className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label={t("mileageAtPurchase")} value={`${fmtNum(vehicle?.mileageAtPurchase)} km`} />
        <MiniStat label={t("drivenSince")} value={`${fmtNum(drivenSincePurchase)} km`} />
        <MiniStat label={t("purchaseDate")} value={vehicle?.purchaseDate || "—"} />
        <MiniStat label={t("monthsOwned")} value={fmtNum(monthsOwned)} />
      </Card>

      <div>
        <SectionHeader icon={Wrench} title={t("serviceStatus")} />
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: NAVY }} className="text-white">
                {["colService", "colInterval", "colLast", "colNext", "colRemaining", "colStatus"].map((k) => (
                  <th key={k} className="text-left px-3 py-2 font-semibold whitespace-nowrap">{t(k)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {serviceStatusRows.map((r, i) => (
                <tr key={r.id} style={{ background: i % 2 ? GREY_BG : "white" }} className="border-t" >
                  <td className="px-3 py-2 font-medium" style={{ color: NAVY }}>{lang === "en" ? r.en : r.sr}</td>
                  <td className="px-3 py-2 tabular-nums">{r.km ? fmtNum(r.km) : "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{r.lastServiceKm ? fmtNum(r.lastServiceKm) : "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{r.nextServiceKm ? fmtNum(r.nextServiceKm) : "—"}</td>
                  <td className="px-3 py-2 tabular-nums">{r.remaining ? fmtNum(r.remaining) : "—"}</td>
                  <td className="px-3 py-2"><StatusPill status={r.status} t={t} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>

      <div>
        <SectionHeader icon={Gauge} title={t("costByCategory")} />
        <Card className="p-4">
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: NAVY }} className="text-white">
                  <th className="text-left px-3 py-2 font-semibold">{t("category")}</th>
                  <th className="text-left px-3 py-2 font-semibold">{t("total")}</th>
                </tr>
              </thead>
              <tbody>
                {categoryTotals.map((c, i) => (
                  <tr key={c.key} style={{ background: i % 2 ? GREY_BG : "white" }} className="border-t">
                    <td className="px-3 py-2">{c.label}</td>
                    <td className="px-3 py-2 tabular-nums">{fmtEur(c.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryTotals}>
                  <CartesianGrid strokeDasharray="3 3" stroke={LINE} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: MUTED }} />
                  <YAxis tick={{ fontSize: 11, fill: MUTED }} />
                  <Tooltip formatter={(v) => fmtEur(v)} />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {categoryTotals.map((_, i) => <Cell key={i} fill={ACCENT} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase" style={{ color: MUTED }}>{label}</div>
      <div className="font-bold tabular-nums" style={{ color: NAVY, fontFamily: "ui-monospace, monospace" }}>{value}</div>
    </div>
  );
}

function SectionHeader({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-2 px-1">
      <Icon size={16} style={{ color: ACCENT }} />
      <h3 className="font-bold text-sm" style={{ color: NAVY }}>{title}</h3>
    </div>
  );
}

function EmptyState({ t }) {
  return (
    <Card className="p-10 text-center">
      <Car size={32} className="mx-auto mb-2" style={{ color: MUTED }} />
      <p style={{ color: MUTED }}>{t("noVehiclesEmpty")}</p>
    </Card>
  );
}

// ================================================================== VEHICLES
function VehiclesTab({ t, vehicles, onAdd, onEdit, onDelete, fmtEur }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="accent" onClick={onAdd}><Plus size={15} /> {t("addVehicle")}</Button>
      </div>
      {!vehicles.length && <EmptyState t={t} />}
      <div className="grid md:grid-cols-2 gap-3">
        {vehicles.map((v) => (
          <Card key={v.id} className="p-4 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: "#0E7C7B" }} />
            <div className="pl-2 flex justify-between items-start">
              <div>
                <div className="font-bold" style={{ color: NAVY }}>{v.name}</div>
                <div className="text-sm" style={{ color: MUTED }}>{v.brand} {v.model} · {v.year}</div>
                <div className="text-sm mt-1" style={{ color: MUTED }}>{v.plate}</div>
                <div className="text-sm mt-1 tabular-nums">{Number(v.mileageAtPurchase || 0).toLocaleString()} km · {fmtEur(v.purchasePrice)}</div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => onEdit(v)} className="p-1.5 rounded hover:bg-gray-100" title={t("edit")}>✏️</button>
                <button onClick={() => onDelete(v.id)} className="p-1.5 rounded hover:bg-gray-100" title={t("delete")}><Trash2 size={15} style={{ color: RED }} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function VehicleModal({ t, initial, onSave, onClose }) {
  const [f, setF] = useState({
    name: "", brand: "", model: "", year: "", plate: "",
    purchaseDate: todayISO(), mileageAtPurchase: "", purchasePrice: "",
    ...initial,
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={initial?.id ? t("edit") : t("addVehicle")} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><Field label={t("name")}><input className={inputCls} style={inputStyle} value={f.name} onChange={set("name")} /></Field></div>
        <Field label={t("brand")}><input className={inputCls} style={inputStyle} value={f.brand} onChange={set("brand")} /></Field>
        <Field label={t("model")}><input className={inputCls} style={inputStyle} value={f.model} onChange={set("model")} /></Field>
        <Field label={t("year")}><input type="number" className={inputCls} style={inputStyle} value={f.year} onChange={set("year")} /></Field>
        <Field label={t("plate")}><input className={inputCls} style={inputStyle} value={f.plate} onChange={set("plate")} /></Field>
        <Field label={t("purchaseDate")}><input type="date" className={inputCls} style={inputStyle} value={f.purchaseDate} onChange={set("purchaseDate")} /></Field>
        <Field label={t("mileageAtPurchase")}><input type="number" className={inputCls} style={inputStyle} value={f.mileageAtPurchase} onChange={set("mileageAtPurchase")} /></Field>
        <div className="col-span-2"><Field label={t("purchasePrice")}><input type="number" className={inputCls} style={inputStyle} value={f.purchasePrice} onChange={set("purchasePrice")} /></Field></div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        <Button variant="primary" onClick={() => onSave({ ...f, mileageAtPurchase: Number(f.mileageAtPurchase || 0), purchasePrice: Number(f.purchasePrice || 0) })} disabled={!f.name}>
          <Check size={15} /> {t("save")}
        </Button>
      </div>
    </Modal>
  );
}

// ================================================================== ENTRIES
function EntriesTab({ t, lang, vehicles, expenses, settings, onAdd, onEdit, onDelete, fmtEur }) {
  const sorted = [...expenses].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const vName = (id) => vehicles.find((v) => v.id === id)?.name || "—";
  const svcName = (id) => {
    const s = settings.find((x) => x.id === id);
    return s ? (lang === "en" ? s.en : s.sr) : "—";
  };
  const typeName = (id) => {
    const et = EXPENSE_TYPES.find((x) => x.id === id);
    return et ? (lang === "en" ? et.en : et.sr) : id;
  };
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button variant="accent" onClick={onAdd} disabled={!vehicles.length}><Plus size={15} /> {t("addEntry")}</Button>
      </div>
      {!sorted.length && <Card className="p-8 text-center" ><p style={{ color: MUTED }}>{t("noEntries")}</p></Card>}
      <Card className="overflow-x-auto">
        {sorted.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: NAVY }} className="text-white">
                {["date", "vehicle", "expenseType", "serviceItem", "mileage", "price", "vendor"].map((k) => (
                  <th key={k} className="text-left px-3 py-2 font-semibold whitespace-nowrap">{t(k)}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {sorted.map((e, i) => (
                <tr key={e.id} style={{ background: i % 2 ? GREY_BG : "white" }} className="border-t">
                  <td className="px-3 py-2 whitespace-nowrap">{e.date}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{vName(e.vehicleId)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{typeName(e.expenseType)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.serviceItemId ? svcName(e.serviceItemId) : "—"}</td>
                  <td className="px-3 py-2 tabular-nums whitespace-nowrap">{e.mileage ? Number(e.mileage).toLocaleString() : "—"}</td>
                  <td className="px-3 py-2 tabular-nums whitespace-nowrap">{fmtEur(e.price)}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{e.vendor}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <div className="flex gap-1">
                      <button onClick={() => onEdit(e)} className="p-1 rounded hover:bg-gray-100">✏️</button>
                      <button onClick={() => onDelete(e.id)} className="p-1 rounded hover:bg-gray-100"><Trash2 size={14} style={{ color: RED }} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

function EntryModal({ t, lang, vehicles, settings, defaultVehicleId, initial, onSave, onClose }) {
  const [f, setF] = useState({
    date: todayISO(), vehicleId: defaultVehicleId || vehicles[0]?.id || "", expenseType: "service",
    serviceItemId: "", mileage: "", price: "", vendor: "", note: "",
    ...initial,
  });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={initial?.id ? t("edit") : t("addEntry")} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("date")}><input type="date" className={inputCls} style={inputStyle} value={f.date} onChange={set("date")} /></Field>
        <Field label={t("vehicle")}>
          <select className={inputCls} style={inputStyle} value={f.vehicleId} onChange={set("vehicleId")}>
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </Field>
        <Field label={t("expenseType")}>
          <select className={inputCls} style={inputStyle} value={f.expenseType} onChange={set("expenseType")}>
            {EXPENSE_TYPES.map((et) => <option key={et.id} value={et.id}>{lang === "en" ? et.en : et.sr}</option>)}
          </select>
        </Field>
        {f.expenseType === "service" && (
          <Field label={t("serviceItem")}>
            <select className={inputCls} style={inputStyle} value={f.serviceItemId} onChange={set("serviceItemId")}>
              <option value="">{t("none")}</option>
              {settings.map((s) => <option key={s.id} value={s.id}>{lang === "en" ? s.en : s.sr}</option>)}
            </select>
          </Field>
        )}
        <Field label={t("mileage")}><input type="number" className={inputCls} style={inputStyle} value={f.mileage} onChange={set("mileage")} /></Field>
        <Field label={t("price")}><input type="number" className={inputCls} style={inputStyle} value={f.price} onChange={set("price")} /></Field>
        <div className="col-span-2"><Field label={t("vendor")}><input className={inputCls} style={inputStyle} value={f.vendor} onChange={set("vendor")} /></Field></div>
        <div className="col-span-2"><Field label={t("note")}><input className={inputCls} style={inputStyle} value={f.note} onChange={set("note")} /></Field></div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        <Button
          variant="primary"
          disabled={!f.vehicleId}
          onClick={() => onSave({ ...f, mileage: Number(f.mileage || 0), price: Number(f.price || 0), serviceItemId: f.expenseType === "service" ? f.serviceItemId : "" })}
        >
          <Check size={15} /> {t("save")}
        </Button>
      </div>
    </Modal>
  );
}

// ================================================================== SETTINGS
function SettingsTab({ t, lang, settings, onAdd, onEdit, onDelete }) {
  return (
    <div className="space-y-3">
      <Card className="p-3 flex items-start gap-2" style={{ background: YELLOW_BG }}>
        <AlertTriangle size={16} style={{ color: YELLOW, flexShrink: 0, marginTop: 2 }} />
        <p className="text-sm" style={{ color: "#7A5B00" }}>{t("settingsHint")}</p>
      </Card>
      <div className="flex justify-end">
        <Button variant="accent" onClick={onAdd}><Plus size={15} /> {t("addServiceType")}</Button>
      </div>
      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: NAVY }} className="text-white">
              <th className="text-left px-3 py-2 font-semibold">{t("colService")}</th>
              <th className="text-left px-3 py-2 font-semibold">{t("intervalKm")}</th>
              <th className="text-left px-3 py-2 font-semibold">{t("intervalMonths")}</th>
              <th className="text-left px-3 py-2 font-semibold">{t("note")}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {settings.map((s, i) => (
              <tr key={s.id} style={{ background: i % 2 ? GREY_BG : "white" }} className="border-t">
                <td className="px-3 py-2 font-medium" style={{ color: NAVY }}>{lang === "en" ? s.en : s.sr}</td>
                <td className="px-3 py-2 tabular-nums">{s.km ? s.km.toLocaleString() : "—"}</td>
                <td className="px-3 py-2 tabular-nums">{s.months}</td>
                <td className="px-3 py-2 italic" style={{ color: MUTED }}>{lang === "en" ? s.noteEn : s.noteSr}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => onEdit(s)} className="p-1 rounded hover:bg-gray-100">✏️</button>
                    <button onClick={() => onDelete(s.id)} className="p-1 rounded hover:bg-gray-100"><Trash2 size={14} style={{ color: RED }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function SettingModal({ t, initial, onSave, onClose }) {
  const [f, setF] = useState({ en: "", sr: "", km: 0, months: 0, noteEn: "", noteSr: "", ...initial });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <Modal title={initial?.id ? t("edit") : t("addServiceType")} onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t("nameEn")}><input className={inputCls} style={inputStyle} value={f.en} onChange={set("en")} /></Field>
        <Field label={t("nameSr")}><input className={inputCls} style={inputStyle} value={f.sr} onChange={set("sr")} /></Field>
        <Field label={t("intervalKm")}><input type="number" className={inputCls} style={inputStyle} value={f.km} onChange={set("km")} /></Field>
        <Field label={t("intervalMonths")}><input type="number" className={inputCls} style={inputStyle} value={f.months} onChange={set("months")} /></Field>
        <div className="col-span-2"><Field label={t("note") + " (EN)"}><input className={inputCls} style={inputStyle} value={f.noteEn} onChange={set("noteEn")} /></Field></div>
        <div className="col-span-2"><Field label={t("note") + " (SR)"}><input className={inputCls} style={inputStyle} value={f.noteSr} onChange={set("noteSr")} /></Field></div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="ghost" onClick={onClose}>{t("cancel")}</Button>
        <Button variant="primary" onClick={() => onSave({ ...f, km: Number(f.km || 0), months: Number(f.months || 0) })} disabled={!f.en}>
          <Check size={15} /> {t("save")}
        </Button>
      </div>
    </Modal>
  );
}

// ================================================================== GUIDE
function GuideTab({ t }) {
  return (
    <Card className="p-6 space-y-4 max-w-2xl">
      <div className="flex items-center gap-2">
        <BookOpen size={18} style={{ color: ACCENT }} />
        <h2 className="font-bold text-lg" style={{ color: NAVY }}>{t("guideTitle")}</h2>
      </div>
      <p className="text-sm leading-relaxed" style={{ color: TEXT_DARK_FALLBACK }}>{t("guideIntro")}</p>
      <p className="text-sm leading-relaxed" style={{ color: TEXT_DARK_FALLBACK }}>{t("guideColors")}</p>
      <p className="text-sm leading-relaxed" style={{ color: TEXT_DARK_FALLBACK }}>{t("guideLang")}</p>
      <p className="text-sm leading-relaxed" style={{ color: MUTED }}>{t("guideData")}</p>
    </Card>
  );
}
const TEXT_DARK_FALLBACK = "#1B1F23";
