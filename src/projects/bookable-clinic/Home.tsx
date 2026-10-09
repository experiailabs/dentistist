import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CalendarCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Clock3,
  Filter,
  Globe2,
  HeartPulse,
  History,
  Inbox,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  MessageSquareText,
  Network,
  PhoneCall,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Sparkles,
  Target,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { toast } from "sonner";

type NavKey = "Overview" | "Waitlist" | "No-shows" | "Insights";
type DeliveryStatus = "idle" | "sent" | "delivered" | "read";
type ContactPreference = "SMS" | "WhatsApp" | "Email";
type DeliveryStep = Exclude<DeliveryStatus, "idle">;
type RecoveryPeriod = "Today" | "This Week" | "This Month";

const deliverySteps: DeliveryStep[] = ["sent", "delivered", "read"];

function formatTimestamp(timestamp?: string) {
  if (!timestamp) return "Waiting for an update";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" }).format(new Date(timestamp));
}

type WaitlistPerson = {
  id: number;
  initials: string;
  name: string;
  detail: string;
  preference: string;
  match: string;
  tone: "mint" | "peach" | "lavender" | "sky";
  urgent?: boolean;
};

const waitlist: WaitlistPerson[] = [
  {
    id: 1,
    initials: "NS",
    name: "Nadia Sultana",
    detail: "Cardiology · New patient",
    preference: "Today, after 4:00 PM",
    match: "98% match",
    tone: "mint",
    urgent: true,
  },
  {
    id: 2,
    initials: "AK",
    name: "Arman Karimov",
    detail: "Dermatology · Follow-up",
    preference: "Tomorrow morning",
    match: "94% match",
    tone: "lavender",
  },
  {
    id: 3,
    initials: "LM",
    name: "Leila Mammadova",
    detail: "Endocrinology · Follow-up",
    preference: "This week",
    match: "89% match",
    tone: "peach",
  },
  {
    id: 4,
    initials: "IB",
    name: "Ivan Beketov",
    detail: "Orthopedics · New patient",
    preference: "Thu, 10:00 AM – 1:00 PM",
    match: "86% match",
    tone: "sky",
  },
];

const noShows = [
  { initials: "MA", name: "Mariam Al Hashimi", detail: "Neurology · missed 2 days ago", reason: "No response", tone: "peach", history: ["12 Sep · Attended", "28 Aug · Attended", "15 Jul · No-show"], draft: "Hi Mariam, we missed you at your neurology appointment. Would you like us to find a new time that works better for you?" },
  { initials: "RS", name: "Rustam Sadykov", detail: "Pediatrics · missed yesterday", reason: "Needs a nudge", tone: "sky", history: ["13 Oct · No-show", "02 Oct · Attended", "18 Sep · Attended"], draft: "Hello Rustam, we noticed you could not make yesterday’s appointment. We can help you reschedule at a time that suits you." },
  { initials: "YB", name: "Yulia Bekturova", detail: "Cardiology · missed 4 days ago", reason: "New slot found", tone: "mint", history: ["10 Oct · No-show", "21 Sep · Attended", "04 Aug · Attended"], draft: "Hi Yulia, a new cardiology slot is available this week. Reply with your preferred time and we’ll take care of the rest." },
];

const recoveriesToday = [
  { initials: "RS", name: "Rustam Sadykov", detail: "Pediatrics · 11:10 AM", channel: "WhatsApp", tone: "sky" },
  { initials: "YK", name: "Yasmin Karim", detail: "Dermatology · 12:40 PM", channel: "SMS", tone: "lavender" },
  { initials: "YB", name: "Yulia Bekturova", detail: "Cardiology · 1:20 PM", channel: "Email", tone: "mint" },
];

const recoveryViews: Record<RecoveryPeriod, { eyebrow: string; heading: string; saved: string; fillTime: string; confirmed: string; trend: number[]; total: string }> = {
  Today: { eyebrow: "AI RECOVERY BRIEF · TODAY", heading: "3 no-show appointments recovered", saved: "3", fillTime: "14m", confirmed: "100%", trend: [1, 0, 1, 2, 1, 2, 3], total: "3 recovered" },
  "This Week": { eyebrow: "AI RECOVERY BRIEF · THIS WEEK", heading: "18 no-show appointments recovered", saved: "18", fillTime: "21m", confirmed: "94%", trend: [1, 2, 3, 2, 4, 3, 3], total: "18 recovered" },
  "This Month": { eyebrow: "AI RECOVERY BRIEF · THIS MONTH", heading: "63 no-show appointments recovered", saved: "63", fillTime: "24m", confirmed: "91%", trend: [4, 7, 8, 9, 11, 10, 14], total: "63 recovered" },
};

const recoveryTrendDates = ["Oct 8, 2025", "Oct 9, 2025", "Oct 10, 2025", "Oct 11, 2025", "Oct 12, 2025", "Oct 13, 2025", "Oct 14, 2025"];
const recoveryQueueByDay: Record<number, number[]> = { 0: [1], 1: [2], 2: [3], 3: [1, 4], 4: [2, 3], 5: [1, 3], 6: [1, 2, 3] };

const localeCopy = {
  en: { locale: "English", greeting: "Good morning, Anara", intro: "Here’s what needs your attention today.", scan: "Run recovery scan", commandPlaceholder: "Try: Find patients for the 2 PM cancellation", noShows: "Bring them back", viewProfile: "View profile", draft: "AI reminder draft" },
  hi: { locale: "हिंदी", greeting: "सुप्रभात, अनारा", intro: "आज इन बातों पर आपका ध्यान चाहिए।", scan: "रिकवरी स्कैन चलाएँ", commandPlaceholder: "आज़माएँ: दोपहर 2 बजे के रद्द हुए अपॉइंटमेंट के लिए मरीज खोजें", noShows: "मरीजों को वापस बुलाएँ", viewProfile: "प्रोफ़ाइल देखें", draft: "AI रिमाइंडर का मसौदा" },
  ar: { locale: "العربية", greeting: "صباح الخير، أنارا", intro: "إليك ما يحتاج إلى انتباهك اليوم.", scan: "تشغيل فحص الاستعادة", commandPlaceholder: "جرّب: ابحث عن مرضى لإلغاء موعد الساعة 2", noShows: "أعيدوهم إلى المسار", viewProfile: "عرض الملف", draft: "مسودة تذكير بالذكاء الاصطناعي" },
  ru: { locale: "Русский", greeting: "Доброе утро, Анара", intro: "Вот что требует вашего внимания сегодня.", scan: "Запустить поиск", commandPlaceholder: "Например: Найти пациентов на отмену в 14:00", noShows: "Вернуть пациентов", viewProfile: "Открыть профиль", draft: "Черновик напоминания от ИИ" },
} as const;

const navItems: { label: NavKey; icon: typeof LayoutDashboard }[] = [
  { label: "Overview", icon: LayoutDashboard },
  { label: "Waitlist", icon: UsersRound },
  { label: "No-shows", icon: UserRound },
  { label: "Insights", icon: Activity },
];

function Avatar({ initials, tone = "mint", size = "md" }: { initials: string; tone?: string; size?: "sm" | "md" }) {
  return <div className={`avatar avatar-${tone} ${size === "sm" ? "avatar-sm" : ""}`}>{initials}</div>;
}

function StatCard({ label, value, change, trend, accent, icon: Icon }: { label: string; value: string; change: string; trend: "up" | "down"; accent: string; icon: typeof Target }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">{label}</p>
          <p className="stat-value">{value}</p>
        </div>
        <div className={`stat-icon ${accent}`}><Icon size={18} strokeWidth={1.8} /></div>
      </div>
      <div className="mt-5 flex items-center gap-2 text-[12px] font-semibold">
        <span className={trend === "up" ? "trend-up" : "trend-down"}>
          {trend === "up" ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {change}
        </span>
        <span className="muted">vs last month</span>
      </div>
    </div>
  );
}

function MatchRow({ person, onFill }: { person: WaitlistPerson; onFill: (name: string) => void }) {
  const [filled, setFilled] = useState(false);
  return (
    <div className={`match-row ${filled ? "row-complete" : ""}`}>
      <Avatar initials={person.initials} tone={person.tone} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-[13px] font-bold text-ink">{person.name}</p>
          {person.urgent && <span className="tiny-pill pill-coral">Priority</span>}
        </div>
        <p className="mt-1 truncate text-[11px] text-slate">{person.detail}</p>
      </div>
      <div className="hidden min-w-[145px] md:block">
        <p className="text-[11px] font-semibold text-ink">{person.preference}</p>
        <p className="mt-1 text-[10px] text-slate">Best time preference</p>
      </div>
      <div className="hidden min-w-[75px] text-right sm:block">
        <p className="text-[11px] font-extrabold text-coral">{person.match}</p>
        <p className="mt-1 text-[10px] text-slate">AI fit</p>
      </div>
      <button
        className={`row-action ${filled ? "row-action-done" : ""}`}
        onClick={() => {
          if (!filled) {
            setFilled(true);
            onFill(person.name);
          }
        }}
      >
        {filled ? <Check size={14} /> : <Plus size={14} />}
        <span className="hidden sm:inline">{filled ? "Filled" : "Fill slot"}</span>
      </button>
    </div>
  );
}

export default function Home() {
  const [activeNav, setActiveNav] = useState<NavKey>("Overview");
  const [search, setSearch] = useState("");
  const [commandQuery, setCommandQuery] = useState("");
  const [commandStatus, setCommandStatus] = useState("");
  const [language, setLanguage] = useState<keyof typeof localeCopy>("en");
  const [scanRunning, setScanRunning] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [showAllMatches, setShowAllMatches] = useState(false);
  const [sentNudges, setSentNudges] = useState<string[]>([]);
  const [selectedNoShow, setSelectedNoShow] = useState<(typeof noShows)[number] | null>(null);
  const [draftText, setDraftText] = useState("");
  const [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus>("idle");
  const [contactPreference, setContactPreference] = useState<ContactPreference>("SMS");
  const [deliveryTimes, setDeliveryTimes] = useState<Record<string, Partial<Record<DeliveryStep, string>>>>({});
  const [recoveryPeriod, setRecoveryPeriod] = useState<RecoveryPeriod>("Today");
  const [selectedRecoveryDay, setSelectedRecoveryDay] = useState<number | null>(null);

  const copy = localeCopy[language];
  const recoveryView = recoveryViews[recoveryPeriod];
  const recoveryPeak = Math.max(...recoveryView.trend);

  const filteredWaitlist = useMemo(() => {
    const query = search.toLowerCase().trim();
    if (!query) return waitlist;
    return waitlist.filter((person) => `${person.name} ${person.detail} ${person.preference}`.toLowerCase().includes(query));
  }, [search]);
  const queuePatients = selectedRecoveryDay === null ? filteredWaitlist : filteredWaitlist.filter((person) => recoveryQueueByDay[selectedRecoveryDay]?.includes(person.id));

  const runScan = () => {
    setScanRunning(true);
    window.setTimeout(() => {
      setScanRunning(false);
      toast.success("Recovery scan complete", { description: "Demo scan: 3 sample patients are ready for outreach." });
    }, 1100);
  };

  const fillSlot = (name: string) => {
    toast.success(`${name} is ready to confirm`, { description: "A confirmation message has been drafted." });
  };

  const sendNudge = (name: string) => {
    setSentNudges((current) => [...current, name]);
    setDeliveryTimes((current) => ({ ...current, [name]: { ...(current[name] ?? {}), sent: new Date().toISOString() } }));
    toast.success("Demo nudge queued", { description: `Simulated reminder for ${name}; no message is sent.` });
  };

  const sendReminderFromProfile = () => {
    if (!selectedNoShow) return;
    const name = selectedNoShow.name;
    setSentNudges((current) => current.includes(name) ? current : [...current, name]);
    setDeliveryTimes((current) => ({ ...current, [name]: { ...(current[name] ?? {}), sent: new Date().toISOString() } }));
    setDeliveryStatus("sent");
    toast.success(`Demo reminder via ${contactPreference}`, { description: `Simulated delivery for ${name}; no message is sent.` });
    window.setTimeout(() => {
      setDeliveryStatus("delivered");
      setDeliveryTimes((current) => ({ ...current, [name]: { ...(current[name] ?? {}), delivered: new Date().toISOString() } }));
    }, 900);
    window.setTimeout(() => {
      setDeliveryStatus("read");
      setDeliveryTimes((current) => ({ ...current, [name]: { ...(current[name] ?? {}), read: new Date().toISOString() } }));
    }, 1900);
  };

  const runCommand = () => {
    const trimmed = commandQuery.trim();
    if (!trimmed) return;
    setActiveNav("Waitlist");
    setSearch("");
    setCommandStatus(language === "hi" ? "3 उपयुक्त मरीज मिले" : language === "ar" ? "تم العثور على 3 مرضى مناسبين" : language === "ru" ? "Найдено 3 подходящих пациента" : "3 high-fit patients found");
    toast.success(language === "hi" ? "AI मिलान शुरू हुआ" : language === "ar" ? "تم تشغيل المطابقة الذكية" : language === "ru" ? "Умный поиск запущен" : "AI matching triggered", { description: trimmed });
  };

  const openProfile = (patient: (typeof noShows)[number]) => {
    setSelectedNoShow(patient);
    setDraftText(patient.draft);
    const history = deliveryTimes[patient.name] ?? {};
    setDeliveryStatus(history.read ? "read" : history.delivered ? "delivered" : history.sent || sentNudges.includes(patient.name) ? "sent" : "idle");
    setContactPreference("SMS");
  };

  const closeProfile = () => {
    setSelectedNoShow(null);
    setDraftText("");
    setDeliveryStatus("idle");
  };

  const sectionTitle = activeNav === "Overview" ? copy.greeting : activeNav === "No-shows" ? copy.noShows : activeNav;
  const sectionSubtitle = activeNav === "Overview" ? copy.intro : activeNav === "Waitlist" ? "Prioritize patients who can take the next available slot." : activeNav === "No-shows" ? "Bring patients back with the right message, at the right time." : "A clearer view of access, recovery, and clinic capacity.";
  const currentDeliveryTimes = selectedNoShow ? deliveryTimes[selectedNoShow.name] ?? {} : {};

  return (
    <div className="app-shell" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="demo-banner" role="status">Frontend demo · Sample data · Messages and AI actions are simulated</div>
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><HeartPulse size={19} strokeWidth={2.5} /></div>
          <div>
            <p className="brand-name">bookable</p>
            <p className="brand-subtitle">CLINIC OS</p>
          </div>
          <button className="sidebar-close" onClick={() => setMobileNav(false)} aria-label="Close navigation"><X size={17} /></button>
        </div>

        <button className="clinic-switcher" onClick={() => toast.info("Clinic switching is available in the full workspace.")} aria-label="Current clinic: Al Noor Hospital, Dubai main campus">
          <div className="clinic-avatar">AH</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-bold text-white">Al Noor Hospital</p>
            <p className="mt-0.5 truncate text-[10px] text-white/45">Dubai · Main campus</p>
          </div>
          <ChevronDown size={15} className="text-white/45" />
        </button>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <p className="nav-label">Workspace</p>
          {navItems.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? "nav-item-active" : ""}`} aria-current={activeNav === label ? "page" : undefined} onClick={() => { setActiveNav(label); setMobileNav(false); }}>
              <Icon size={17} strokeWidth={activeNav === label ? 2.3 : 1.8} />
              <span>{label}</span>
              {label === "No-shows" && <span className="nav-count" aria-label="12 patients">12</span>}
            </button>
          ))}
          <p className="nav-label nav-label-later">Manage</p>
          <button className="nav-item" onClick={() => toast.info("Calendar view is coming next.")}><CalendarCheck size={17} /><span>Appointments</span></button>
          <button className="nav-item" onClick={() => toast.info("Message templates are coming next.")}><Inbox size={17} /><span>Messages</span><span className="nav-dot" /></button>
        </nav>

        <div className="sidebar-footer">
          <div className="coverage-card">
            <div className="coverage-orbit"><Sparkles size={15} /></div>
            <p className="coverage-title">AI coverage is on</p>
            <p className="coverage-copy">Smart matching is reviewing new gaps every 15 minutes.</p>
            <div className="coverage-bar"><span /></div>
            <div className="mt-2 flex justify-between text-[10px] text-white/45"><span>Last check</span><span>2 min ago</span></div>
          </div>
          <button className="nav-item settings-item" onClick={() => toast.info("Settings are available in the full clinic workspace.")}><Settings2 size={17} /><span>Settings</span></button>
          <div className="account-row">
            <div className="account-avatar">AR</div>
            <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-white">Anara Rahman</p><p className="truncate text-[10px] text-white/40">Clinic manager</p></div>
            <MoreHorizontal size={16} className="text-white/40" />
          </div>
        </div>
      </aside>
      {mobileNav && <button className="mobile-overlay" onClick={() => setMobileNav(false)} aria-label="Close navigation menu" />}

      <main className="main-content">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Menu size={19} /></button>
          <div className="topbar-context"><span className="status-pulse" /><span>Tuesday, 14 October 2025</span><span className="topbar-separator">/</span><span className="topbar-muted">Live clinic view</span></div>
          <div className="topbar-actions">
            <div className="locale-toggle" role="group" aria-label="Language selector"><Globe2 size={14} />{(Object.keys(localeCopy) as Array<keyof typeof localeCopy>).map((key) => <button key={key} className={language === key ? "locale-active" : ""} aria-pressed={language === key} onClick={() => { setLanguage(key); setCommandStatus(""); }}>{key === "en" ? "EN" : key === "ar" ? "ع" : key === "hi" ? "हिं" : "RU"}</button>)}</div>
            <button className="icon-button" onClick={() => toast.info("You’re all caught up.")} aria-label="Notifications"><Bell size={18} /><span className="notification-dot" /></button>
            <div className="topbar-divider" />
            <div className="topbar-user"><div className="topbar-avatar">AR</div><span>Anara</span><ChevronDown size={14} className="text-slate" /></div>
          </div>
        </header>

        <div className="page-wrap">
          <section className="page-intro">
            <div>
              <p className="section-kicker">{activeNav === "Overview" ? "OPERATIONS / TODAY" : `WORKSPACE / ${activeNav.toUpperCase()}`}</p>
              <h1>{sectionTitle}</h1>
              <p className="intro-copy">{sectionSubtitle}</p>
            </div>
            <div className="intro-actions">
              <div className="command-group"><span className="command-label">ASK BOOKABLE</span><div className={`command-wrap ${commandQuery ? "command-wrap-active" : ""}`}><MessageSquareText size={15} /><input value={commandQuery} onChange={(event) => { setCommandQuery(event.target.value); setCommandStatus(""); }} onKeyDown={(event) => { if (event.key === "Enter") runCommand(); }} placeholder={copy.commandPlaceholder} aria-label="AI command search" aria-describedby="command-help" /><button className="command-submit" onClick={runCommand} aria-label="Run AI command"><ChevronRight size={15} /></button></div><span id="command-help" className="command-help">Press Enter to match patients to an opening</span></div>
              <button className="primary-button" onClick={runScan} disabled={scanRunning}><RefreshCw size={15} className={scanRunning ? "spin" : ""} />{scanRunning ? "Scanning…" : copy.scan}</button>
            </div>
          </section>
          {commandStatus && <div className="command-result" role="status" aria-live="polite"><Sparkles size={14} /><span>{commandStatus}</span><button onClick={() => setCommandStatus("")} aria-label="Dismiss result"><X size={13} /></button></div>}

          {activeNav === "Overview" && <>
            <section className="stats-grid" aria-label="Clinic performance">
              <StatCard label="Open slots today" value="08" change="18.2%" trend="up" accent="accent-coral" icon={CalendarCheck} />
              <StatCard label="Recovered this month" value="126" change="24.8%" trend="up" accent="accent-mint" icon={Target} />
              <StatCard label="No-show rate" value="4.8%" change="1.6%" trend="down" accent="accent-lavender" icon={Clock3} />
              <StatCard label="Avg. time to fill" value="18m" change="32.4%" trend="down" accent="accent-sky" icon={Network} />
            </section>

            <section className="hero-grid">
              <div className="feature-card">
                <div className="feature-topline"><span className="live-tag"><span className="live-dot" /> LIVE OPPORTUNITY</span><span className="feature-time">Updated 2 min ago</span></div>
                <div className="feature-content">
                  <div className="feature-copy">
                    <p className="feature-kicker">BEST NEXT MATCH</p>
                    <h2>A 2:30 PM cardiology slot just opened.</h2>
                    <p>Bookable found 3 patients who can make it today. The best match is already prepped.</p>
                    <button className="feature-button" onClick={() => fillSlot("Nadia Sultana")}>Review best match <ArrowUpRight size={16} /></button>
                  </div>
                  <div className="match-visual" aria-hidden="true"><div className="visual-ring ring-one" /><div className="visual-ring ring-two" /><div className="visual-ring ring-three" /><div className="visual-core"><Sparkles size={21} /></div><span className="visual-label visual-label-top">98%</span><span className="visual-label visual-label-right">Today</span><span className="visual-label visual-label-bottom">2:30</span></div>
                </div>
              </div>
              <div className="side-activity-card">
                <div className="flex items-center justify-between"><div><p className="eyebrow">RECOVERY PULSE</p><h3>Healthy momentum</h3></div><div className="pulse-icon"><Activity size={17} /></div></div>
                <div className="mini-chart"><div className="chart-gridline line-one" /><div className="chart-gridline line-two" /><div className="chart-bars"><span style={{ height: "34%" }} /><span style={{ height: "46%" }} /><span style={{ height: "38%" }} /><span style={{ height: "61%" }} /><span style={{ height: "52%" }} /><span style={{ height: "74%" }} /><span style={{ height: "66%" }} /><span className="bar-hot" style={{ height: "92%" }} /></div></div>
                <div className="chart-footer"><span>Last 8 weeks</span><strong>+24.8%</strong></div>
              </div>
            </section>

            <section className="ai-recovery-widget" aria-label="AI recovery brief for today">
              <div className="ai-recovery-heading">
                <div className="ai-recovery-title-wrap"><div className="ai-recovery-icon"><Sparkles size={18} /></div><div><p className="eyebrow">{recoveryView.eyebrow}</p><h3>{recoveryView.heading}</h3><p className="ai-recovery-copy">Bookable matched patients to open slots before they went cold.</p></div></div>
                <div className="ai-recovery-actions"><label className="recovery-filter-label" htmlFor="recovery-period">View</label><select id="recovery-period" className="recovery-filter" value={recoveryPeriod} onChange={(event) => { setRecoveryPeriod(event.target.value as RecoveryPeriod); setSelectedRecoveryDay(null); }}>{(["Today", "This Week", "This Month"] as RecoveryPeriod[]).map((period) => <option key={period} value={period}>{period}</option>)}</select><button className="text-button" onClick={() => toast.info(`${recoveryPeriod} recovery log is ready for review.`)}>Open recovery log <ArrowUpRight size={14} /></button></div>
              </div>
              <div className="ai-recovery-content"><div className="ai-recovery-metrics"><div className="ai-recovery-metric"><strong>{recoveryView.saved}</strong><span>appointments saved</span></div><div className="ai-recovery-metric"><strong>{recoveryView.fillTime}</strong><span>average fill time</span></div><div className="ai-recovery-metric"><strong>{recoveryView.confirmed}</strong><span>patient confirmed</span></div></div><div className="ai-recovery-trend"><div className="ai-trend-heading"><span>7-day recovery trend</span><strong>{recoveryView.total}</strong></div><div className="ai-trend-bars">{recoveryView.trend.map((value, index) => { const isSelected = selectedRecoveryDay === index; const dayLabel = ["M", "T", "W", "T", "F", "S", "S"][index]; const tooltip = `${recoveryTrendDates[index]} · ${value} ${value === 1 ? "appointment" : "appointments"} recovered`; return <button className={`ai-trend-bar ${isSelected ? "ai-trend-bar-selected" : ""}`} key={`${recoveryPeriod}-${index}`} onClick={() => setSelectedRecoveryDay(isSelected ? null : index)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelectedRecoveryDay(isSelected ? null : index); } }} aria-label={`${tooltip}. ${isSelected ? "Clear day filter" : "Filter queue to this day"}`}><span style={{ height: `${Math.max(value ? 16 : 7, (value / recoveryPeak) * 100)}%` }} /><small>{dayLabel}</small><span className="ai-trend-tooltip" role="tooltip">{tooltip}</span></button>; })}</div></div><div className="ai-recovery-list">{recoveriesToday.map((recovery) => <div className="ai-recovery-row" key={recovery.name}><Avatar initials={recovery.initials} tone={recovery.tone} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-[11px] font-bold text-ink">{recovery.name}</p><p className="mt-1 truncate text-[10px] text-slate">{recovery.detail}</p></div><span className="recovery-channel">{recovery.channel}</span><span className="recovery-confirmed"><CheckCircle2 size={14} /> Confirmed</span></div>)}</div></div>
            </section>

            <section className="content-grid">
              <div className="panel-card waitlist-panel">
                <div className="panel-heading"><div><p className="eyebrow">AI-READY PATIENTS</p><h3>Best matches for open slots</h3><p className="panel-helper">Prioritized by fit, availability, and intent.</p></div><button className="text-button" onClick={() => setActiveNav("Waitlist")}>View full waitlist <ArrowUpRight size={14} /></button></div>
                <div className="filter-row"><span className="result-count">{queuePatients.length} high-intent patients</span><button className="filter-button" onClick={() => toast.info("Showing patients who can attend within 24 hours.")}><Filter size={13} /> Priority first</button></div>
                {selectedRecoveryDay !== null && <div className="recovery-queue-filter" role="status" aria-live="polite"><span><Sparkles size={12} /> Recovered on {recoveryTrendDates[selectedRecoveryDay]}</span><button onClick={() => setSelectedRecoveryDay(null)}>Clear filter <X size={12} /></button></div>}
                <div className="match-list">{queuePatients.slice(0, showAllMatches ? queuePatients.length : 3).map((person) => <MatchRow key={person.id} person={person} onFill={fillSlot} />)}</div>
                {queuePatients.length > 3 && <button className="load-more" onClick={() => setShowAllMatches((current) => !current)}>{showAllMatches ? "Show less" : `Show ${queuePatients.length - 3} more patients`}<ChevronDown size={14} className={showAllMatches ? "rotate-180" : ""} /></button>}
                {queuePatients.length === 0 && <div className="empty-state"><Search size={17} /><p>{selectedRecoveryDay !== null ? "No recovered patients are in this day’s queue." : `No patients match “${search}”.`}</p></div>}
              </div>

              <div className="panel-card no-show-panel">
                <div className="panel-heading"><div><p className="eyebrow">RECENT NO-SHOWS</p><h3>Bring them back</h3><p className="panel-helper">A gentle next step for every missed visit.</p></div><button className="round-more" onClick={() => setActiveNav("No-shows")} aria-label="View no-shows"><ArrowUpRight size={15} /></button></div>
                <div className="no-show-list">{noShows.map((patient) => { const sent = sentNudges.includes(patient.name); return <div key={patient.name} className="no-show-row no-show-row-clickable" onClick={() => openProfile(patient)}><Avatar initials={patient.initials} tone={patient.tone} size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-[12px] font-bold text-ink">{patient.name}</p><p className="mt-1 truncate text-[10px] text-slate">{patient.detail}</p></div><button className={`nudge-button ${sent ? "nudge-sent" : ""}`} onClick={(event) => { event.stopPropagation(); if (!sent) sendNudge(patient.name); }}>{sent ? <><Check size={12} /> Sent</> : <><PhoneCall size={12} /> Nudge</>}</button><ChevronRight size={13} className="profile-chevron" /></div> })}</div>
                <div className="recovery-note"><Sparkles size={14} /><p><strong>AI suggestion:</strong> Try a softer reminder for patients who missed once.</p></div>
              </div>
            </section>
          </>}

          {activeNav === "Waitlist" && <section className="standalone-grid"><div className="panel-card full-panel"><div className="panel-heading"><div><p className="eyebrow">WAITLIST MANAGEMENT</p><h3>Patients ready to be booked</h3></div><button className="secondary-button" onClick={() => toast.success("New patient intake opened.")}><Plus size={15} /> Add patient</button></div><div className="filter-row"><span className="result-count">{filteredWaitlist.length} patients match your filters</span><button className="filter-button" onClick={() => toast.info("Priority sorting enabled.")}><Filter size={13} /> Sort by AI fit</button></div><div className="match-list">{filteredWaitlist.map((person) => <MatchRow key={person.id} person={person} onFill={fillSlot} />)}</div></div><div className="insight-callout"><div className="callout-icon"><Sparkles size={19} /></div><p className="eyebrow">BOOKABLE NOTE</p><h3>Shorter wait, calmer care.</h3><p>Keep preferences fresh and the matching engine can safely reach the right patient when a slot opens.</p><button className="text-button" onClick={() => toast.info("Preference settings are coming next.")}>Tune preferences <ArrowUpRight size={14} /></button></div></section>}

          {activeNav === "No-shows" && <section className="standalone-grid"><div className="panel-card full-panel"><div className="panel-heading"><div><p className="eyebrow">RE-ENGAGEMENT QUEUE</p><h3>Patients worth bringing back</h3></div><button className="secondary-button" onClick={() => toast.success("Reminder batch drafted.")}><Bell size={15} /> Draft reminders</button></div><div className="no-shows-feature"><div className="no-shows-number">12</div><div><p className="text-[13px] font-bold text-ink">patients need a thoughtful follow-up</p><p className="mt-1 text-[11px] text-slate">The queue is ordered by likelihood to return, not by pressure.</p></div></div><div className="no-show-table">{noShows.concat([{ initials: "OT", name: "Oleg Tursunov", detail: "ENT · missed 6 days ago", reason: "No response", tone: "lavender" as const, history: ["08 Oct · No-show", "11 Sep · Attended"], draft: "Hello Oleg, we would be happy to help you find a new ENT appointment." }]).map((patient) => { const sent = sentNudges.includes(patient.name); return <div className="table-row table-row-clickable" key={patient.name} onClick={() => openProfile(patient)}><Avatar initials={patient.initials} tone={patient.tone} size="sm" /><div className="min-w-0 flex-1"><p className="text-[12px] font-bold text-ink">{patient.name}</p><p className="mt-1 text-[10px] text-slate">{patient.detail}</p></div><span className="hidden text-[11px] text-slate sm:block">{patient.reason}</span><button className={`nudge-button ${sent ? "nudge-sent" : ""}`} onClick={(event) => { event.stopPropagation(); if (!sent) sendNudge(patient.name); }}>{sent ? <><Check size={12} /> Sent</> : <><PhoneCall size={12} /> Nudge</>}</button><ChevronRight size={14} className="profile-chevron" /></div> })}</div></div><div className="insight-callout peach-callout"><div className="callout-icon"><HeartPulse size={19} /></div><p className="eyebrow">RECOVERY RATE</p><h3>31% return after a nudge</h3><p>Personalized reminders perform best when they include a low-friction reschedule link.</p><button className="text-button" onClick={() => toast.info("Message analytics are coming next.")}>See message patterns <ArrowUpRight size={14} /></button></div></section>}

          {activeNav === "Insights" && <section className="insights-grid"><div className="panel-card insight-chart-card"><div className="panel-heading"><div><p className="eyebrow">ACCESS INSIGHTS</p><h3>More appointments kept</h3></div><button className="filter-button" onClick={() => toast.info("Date range picker is coming next.")}>Last 30 days <ChevronDown size={13} /></button></div><div className="big-chart"><div className="big-chart-axis"><span>160</span><span>120</span><span>80</span><span>40</span><span>0</span></div><div className="big-chart-area"><div className="chart-gridline line-one" /><div className="chart-gridline line-two" /><div className="chart-gridline line-three" /><svg viewBox="0 0 680 220" preserveAspectRatio="none" aria-label="Recovered appointments trend"><defs><linearGradient id="areaFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#e7785e" stopOpacity=".28" /><stop offset="100%" stopColor="#e7785e" stopOpacity="0" /></linearGradient></defs><path d="M0,181 C45,173 70,181 105,156 S164,159 208,143 S268,150 309,124 S366,137 406,96 S472,112 510,83 S570,99 604,52 S642,65 680,29 V220 H0 Z" fill="url(#areaFill)" /><path d="M0,181 C45,173 70,181 105,156 S164,159 208,143 S268,150 309,124 S366,137 406,96 S472,112 510,83 S570,99 604,52 S642,65 680,29" fill="none" stroke="#e7785e" strokeWidth="3" strokeLinecap="round" /></svg><div className="chart-labels"><span>Sep 15</span><span>Sep 22</span><span>Sep 29</span><span>Oct 06</span><span>Oct 14</span></div></div></div></div><div className="insight-side"><div className="mini-stat"><span className="stat-icon accent-mint"><Target size={17} /></span><div><p className="eyebrow">SLOTS RECOVERED</p><strong>126</strong><span className="trend-up">+24.8%</span></div></div><div className="mini-stat"><span className="stat-icon accent-coral"><UsersRound size={17} /></span><div><p className="eyebrow">PATIENTS RETURNED</p><strong>83</strong><span className="trend-up">+12.2%</span></div></div><div className="insight-tip"><Sparkles size={15} /><p>Every recovered slot is one less patient waiting without an answer.</p></div></div></section>}

          {selectedNoShow && <div className="modal-backdrop" role="presentation" onClick={closeProfile}><div className="patient-modal" role="dialog" aria-modal="true" aria-labelledby="patient-profile-title" onClick={(event) => event.stopPropagation()}><div className="modal-header"><div className="flex items-center gap-3"><Avatar initials={selectedNoShow.initials} tone={selectedNoShow.tone} /><div><p className="eyebrow">PATIENT PROFILE</p><h2 id="patient-profile-title">{selectedNoShow.name}</h2><p className="modal-subtitle">{selectedNoShow.detail}</p></div></div><button className="modal-close" onClick={closeProfile} aria-label="Close patient profile"><X size={17} /></button></div><div className="modal-body"><section className="profile-section"><div className="profile-section-heading"><History size={15} /><span>Attendance history</span><span className="attendance-score">2 of 3 kept</span></div><div className="attendance-list">{selectedNoShow.history.map((event) => <div className="attendance-row" key={event}><span className={`attendance-dot ${event.includes("No-show") ? "attendance-missed" : ""}`} /><span>{event}</span>{event.includes("No-show") ? <span className="attendance-status missed">Missed</span> : <span className="attendance-status">Kept</span>}</div>)}</div></section><section className="preference-section"><div className="profile-section-heading"><PhoneCall size={15} /><span>Preferred reminder channel</span><span className="preference-current">{contactPreference}</span></div><div className="preference-options">{(["SMS", "WhatsApp", "Email"] as ContactPreference[]).map((preference) => <button key={preference} className={`preference-option ${contactPreference === preference ? "preference-active" : ""}`} onClick={() => setContactPreference(preference)}><span className={`preference-icon preference-${preference.toLowerCase()}`}>{preference === "Email" ? <Inbox size={14} /> : <MessageSquareText size={14} />}</span><span>{preference}</span>{contactPreference === preference && <Check size={13} className="preference-check" />}</button>)}</div></section><section className="draft-section"><div className="profile-section-heading"><MessageSquareText size={15} /><span>{copy.draft}</span><span className="draft-badge"><Sparkles size={11} /> Suggested</span></div><textarea className="draft-textarea" value={draftText} onChange={(event) => setDraftText(event.target.value)} aria-label="AI reminder draft" /><div className="draft-footer"><span>Personalized from recent attendance</span><div className="draft-actions"><div className="delivery-history" aria-label="Message delivery timeline">{deliveryStatus === "idle" ? <div className="delivery-status delivery-idle"><span className="delivery-status-dot" />Not sent</div> : deliverySteps.map((step) => { const timestamp = currentDeliveryTimes[step]; const label = step[0].toUpperCase() + step.slice(1); return <div key={step} className={`delivery-status delivery-${step} ${timestamp ? "delivery-complete" : "delivery-pending"}`} tabIndex={0} aria-label={`${label}: ${timestamp ? formatTimestamp(timestamp) : "Waiting for an update"}`}><span className="delivery-status-dot" /><span>{label}</span><span className="delivery-tooltip" role="tooltip">{timestamp ? formatTimestamp(timestamp) : "Waiting for an update"}</span></div>; })}</div><button className="primary-button" onClick={sendReminderFromProfile}><PhoneCall size={14} /> {deliveryStatus === "idle" ? "Send reminder" : "Send again"}</button></div></div></section></div></div></div>}

          <footer className="page-footer"><span><span className="footer-heart">♥</span> Built for calmer clinic days.</span><span>Bookable Clinic · Prototype</span></footer>
        </div>
      </main>
    </div>
  );
}
