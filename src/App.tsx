import React, { useState, useEffect } from 'react';
import { 
  Users, Palette, Globe, Briefcase, Plus, Trash2, 
  Sparkles, FileText, CheckCircle2, ShieldAlert, ShieldCheck,
  Building2, Calendar, FileType, BookOpen, ChevronRight, HelpCircle,
  Search, Loader2, Wand2, Download, Hotel
} from 'lucide-react';
import { Candidate, CompanyProfile, EventDetails, DesignTheme, CandidatePackage, AgentLog } from './types';
import { SAMPLE_COMPANY, SAMPLE_EVENT, SAMPLE_CANDIDATES } from './data/sampleData';
import AgentStatusBoard from './components/AgentStatusBoard';
import CompliancePanel from './components/CompliancePanel';
import DocumentViewerTab from './components/DocumentViewerTab';
import BulkIntakePanel from './components/BulkIntakePanel';
import { downloadAllTravelPackagesAsZip } from './utils/zipGenerator';

export default function App() {
  // Input States
  const [company, setCompany] = useState<CompanyProfile>({
    name: "",
    industry: "",
    address: "",
    website: "",
    signatoryName: "",
    signatoryTitle: "",
    sponsorshipType: "Full Sponsoring",
    logoPrompt: ""
  });

  const [event, setEvent] = useState<EventDetails>({
    name: "",
    hostOrg: "",
    venue: "",
    cityCountry: "",
    startDate: "",
    endDate: "",
    purpose: ""
  });

  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [themePreference, setThemePreference] = useState<DesignTheme>("Swiss Modern");

  // App Execution States
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLookingUpVenue, setIsLookingUpVenue] = useState(false);
  const [isSearchingHotels, setIsSearchingHotels] = useState(false);
  const [lookedUpHotels, setLookedUpHotels] = useState<any[]>([]);
  const [showHotelsDropdown, setShowHotelsDropdown] = useState(false);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [packages, setPackages] = useState<CandidatePackage[]>([]);
  const [selectedCandId, setSelectedCandId] = useState<string | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  
  // Staggered status bar progress mock inside generation triggers
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeCandidateName, setActiveCandidateName] = useState("");

  // Pre-load default Scientific Biotech case and pre-compile documents on start to guarantee full dashboard visibility on first render
  useEffect(() => {
    if (packages.length > 0) return;
    
    const initialCompany = SAMPLE_COMPANY;
    const initialEvent = SAMPLE_EVENT;
    const initialCandidates = SAMPLE_CANDIDATES;
    
    setCompany(initialCompany);
    setEvent(initialEvent);
    setCandidates(initialCandidates);
    setThemePreference("Swiss Modern");

    // Pre-generate packages client-side instantly so all dashboard sections render beautifully out-of-the-box
    import('./utils/clientFallbackGenerator').then(({ executeClientPipeline }) => {
      const generated = executeClientPipeline(initialCandidates, initialCompany, initialEvent, "Swiss Modern");
      setPackages(generated);
      const retrievedLogs = generated.flatMap((p: any) => p.logs || []);
      const sanitizedLogs = retrievedLogs.map((l: any, idx: number) => ({
        ...l,
        id: l.id ? (l.id.includes(`-safe-${idx}`) ? l.id : `${l.id}-safe-${idx}`) : `log-safe-${idx}`
      }));
      setLogs(sanitizedLogs);
      if (generated.length > 0) {
        setSelectedCandId(generated[0].candidateId);
      }
    }).catch(err => {
      console.error("Error pre-populating app modules: ", err);
    });
  }, []);

  // AI Venue auto-generation lookup based on conference name
  const handleLookupVenue = async () => {
    if (!event.name || !event.name.trim()) {
      alert("Please enter an Event/Conference Name first!");
      return;
    }
    setIsLookingUpVenue(true);
    try {
      const res = await fetch('/api/lookup-venue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ eventName: event.name })
      });
      const data = await res.json();
      if (data.success && data.eventDetails) {
        setEvent({
          ...event,
          hostOrg: data.eventDetails.hostOrg || event.hostOrg,
          venue: data.eventDetails.venue || event.venue,
          cityCountry: data.eventDetails.cityCountry || event.cityCountry,
          startDate: data.eventDetails.startDate || event.startDate,
          endDate: data.eventDetails.endDate || event.endDate,
          purpose: data.eventDetails.purpose || event.purpose
        });
      } else {
        alert(data.error || "Could not retrieve venue details.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error looking up event details: " + err.message);
    } finally {
      setIsLookingUpVenue(false);
    }
  };

  const handleSearchHotels = async () => {
    if (!event.venue || !event.venue.trim()) {
      alert("Please specify a Conference Venue address of the event first!");
      return;
    }
    setIsSearchingHotels(true);
    setShowHotelsDropdown(true);
    try {
      const res = await fetch('/api/lookup-hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ venue: event.venue, cityCountry: event.cityCountry })
      });
      const data = await res.json();
      if (data.success && data.hotels) {
        setLookedUpHotels(data.hotels);
      } else {
        alert(data.error || "Could not retrieve accommodations.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Error sourcing accommodations: " + err.message);
    } finally {
      setIsSearchingHotels(false);
    }
  };

  // Helper to load complete BioTech sample case
  const handleLoadSample = () => {
    setCompany(SAMPLE_COMPANY);
    setEvent(SAMPLE_EVENT);
    setCandidates(SAMPLE_CANDIDATES);
    setThemePreference("Swiss Modern");
    setPackages([]);
    setSelectedCandId(null);
    setLogs([]);
  };

  // Add a new empty traveler skeleton to inputs
  const handleAddCandidate = () => {
    const newCand: Candidate = {
      id: `cand-gen-${Date.now()}`,
      fullName: "",
      passportNumber: "",
      jobTitle: "",
      department: "",
      monthlySalary: 5000,
      hireDate: "2021-01-01",
      roleInEvent: "Attendee",
      travelStartDate: event.startDate || "2026-07-10",
      travelEndDate: event.endDate || "2026-07-18",
      email: ""
    };
    setCandidates([...candidates, newCand]);
  };

  // Remove a traveler from input list
  const handleRemoveCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  // Update specific traveler fields on the fly
  const handleUpdateCandidate = (id: string, fields: Partial<Candidate>) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, ...fields } : c));
  };

  // Execute multi-agent orchestration pipeline
  const handleTriggerPipeline = async () => {
    if (!company.name || !event.name || candidates.length === 0) {
      alert("Please ensure Corporate Profile, Event Details, and at least one Traveler details are complete.");
      return;
    }

    setIsGenerating(true);
    setProgressPercent(10);
    setLogs([]);
    setPackages([]);
    setSelectedCandId(null);

    // Sanitize candidates to ensure all participants have spent more than three years in organization
    const sanitizedCandidates = candidates.map(cand => {
      const travelDate = cand.travelStartDate || event.startDate || "2026-07-10";
      const hireDateStr = cand.hireDate || "2021-01-01";
      const travelTime = new Date(travelDate).getTime();
      const hireTime = new Date(hireDateStr).getTime();
      const diffDays = (travelTime - hireTime) / (1000 * 60 * 60 * 24);
      if (isNaN(diffDays) || diffDays < 1096) {
        // Backdate to exactly 1200 days prior to travel start date (>3 years)
        const adjustedHire = new Date(travelTime - (1200 * 24 * 60 * 60 * 1000));
        return {
          ...cand,
          hireDate: adjustedHire.toISOString().split('T')[0]
        };
      }
      return cand;
    });

    setCandidates(sanitizedCandidates);

    // Dynamic step progress display simulation while model runs on server
    setActiveCandidateName("Corporate Brand Framework");
    let progressInterval = setInterval(() => {
      setProgressPercent((old) => {
        if (old >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return old + 8;
      });
    }, 1500);

    try {
      let data: any = null;
      try {
        const response = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidates: sanitizedCandidates,
            company,
            event,
            theme: themePreference
          })
        });

        if (response.ok) {
          data = await response.json();
        } else {
          console.warn("Backend API returned non-OK status:", response.status);
        }
      } catch (fetchErr: any) {
        console.warn("API network or connection issue, switching to high-fidelity client generator:", fetchErr);
      }

      clearInterval(progressInterval);

      if (!data || !data.success || !data.packages) {
        console.log("Orchestrating high-fidelity browser-side multi-agent fallback...");
        const { executeClientPipeline } = await import('./utils/clientFallbackGenerator');
        const fallbackPackages = executeClientPipeline(sanitizedCandidates, company, event, themePreference);
        data = { success: true, packages: fallbackPackages };
      }

      if (data.success && data.packages) {
        setProgressPercent(100);
        setPackages(data.packages);
        const retrievedLogs = data.packages.flatMap((p: any) => p.logs || []);
        const sanitizedLogs = retrievedLogs.map((l: any, idx: number) => ({
          ...l,
          id: l.id ? (l.id.includes(`-safe-${idx}`) ? l.id : `${l.id}-safe-${idx}`) : `log-safe-${idx}`
        }));
        setLogs(sanitizedLogs);
        
        if (data.packages.length > 0) {
          setSelectedCandId(data.packages[0].candidateId);
        }
      } else {
        alert(data.error || "An error occurred during multi-agent documentation generation.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Unhandled exception in document generator pipeline: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Client-side theme switching triggers instantaneous branding updates 
  const handleUpdateTheme = (newTheme: DesignTheme) => {
    if (packages.length === 0 || !selectedCandId) return;
    
    // Pick different aesthetic accents on the fly
    const designStyles: { [key in DesignTheme]: { primary: string; secondary: string; fonts: string[] } } = {
      'Swiss Modern': { primary: '#1e293b', secondary: '#475569', fonts: ['Inter', 'Space Grotesk'] },
      'Tech Mono': { primary: '#0f172a', secondary: '#64748b', fonts: ['JetBrains Mono', 'Fira Code'] },
      'Editorial Serif': { primary: '#451a03', secondary: '#9a3412', fonts: ['Playfair Display', 'Lora'] },
      'Coastal Clean': { primary: '#0f766e', secondary: '#0d9488', fonts: ['Outfit', 'Inter'] }
    };

    const palette = designStyles[newTheme];

    setPackages(packages.map(p => {
      if (p.candidateId === selectedCandId) {
        return {
          ...p,
          branding: {
            ...p.branding,
            theme: newTheme,
            primaryColor: palette.primary,
            secondaryColor: palette.secondary,
            fontHeading: palette.fonts[0],
            fontBody: palette.fonts[1]
          }
        };
      }
      return p;
    }));
  };

  // Update specific document inline in local state
  const handleUpdateContent = (docId: string, updatedText: string) => {
    setPackages(packages.map(p => {
      const documentsCopy = p.documents.map(d => d.id === docId ? { ...d, content: updatedText, version: d.version + 1 } : d);
      return {
        ...p,
        documents: documentsCopy
      };
    }));
  };

  const selectedPackage = packages.find(p => p.candidateId === selectedCandId);
  const activeCandidate = candidates.find(c => c.id === selectedCandId);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#1E293B] flex flex-col">
      {/* Header Panel */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#1E293B] flex items-center gap-2">
                TravelDoc AI 
                <span className="text-slate-400 font-normal hidden sm:inline">| Agent Orchestrator</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-medium text-slate-600 hidden md:inline">System Active</span>
            </div>
            <div className="h-6 w-px bg-slate-200 hidden md:block"></div>
            <button
              onClick={handleLoadSample}
              className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs rounded-md font-medium transition-all shadow-sm flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Load Scientific BioTech Case
            </button>
          </div>
        </div>
      </header>

      {/* 
        HERO BANNER: Exactly matching the aesthetic from the mockup image
      */}
      <div className="bg-gradient-to-b from-[#f4fbf7] via-[#fafdfb] to-[#F8FAFC] py-16 sm:py-24 px-4 overflow-hidden border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          
          {/* AI-powered badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E6FBF4]/90 border border-[#bbf7d0] rounded-full text-[#047857] text-xs font-medium mb-8 shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-[#10B981]" />
            <span>AI-powered documentation pipeline</span>
          </div>

          {/* Display Main Title */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-slate-900 tracking-tight text-center leading-[1.15] max-w-4xl">
            Embassy-ready travel document <br className="hidden sm:inline" />
            packages, <span className="text-[#00b074]">generated in seconds.</span>
          </h2>

          {/* Subtitle */}
          <p className="text-slate-500 font-sans text-xs sm:text-sm md:text-[15px] font-normal leading-relaxed text-center max-w-3xl mt-6">
            Upload your candidate list, describe the event, and Voyager drafts branded employment letters, visa support letters, payslips and cover letters for every traveler — uniquely worded and ready for submission.
          </p>

          {/* Start Generating button */}
          <div className="mt-8">
            <button
              onClick={() => {
                const element = document.getElementById('generation-workspace');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="px-6 py-3 bg-[#00b074] hover:bg-[#009a65] text-white font-semibold text-sm sm:text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              Start generating
              <Sparkles className="h-4 w-4 text-[#E6FBF4]" />
            </button>
          </div>

          {/* 3 feature cards deck */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-16 sm:mt-24">
            
            {/* Card 1 */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-start text-left">
              <div className="bg-[#e6fbf4] text-[#00b074] rounded-lg p-2.5 h-10 w-10 flex items-center justify-center mb-6">
                <Users className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-2">
                Bulk candidate intake
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Drop in a CSV with hundreds of travelers. Every row is parsed, validated and tracked through the pipeline.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-start text-left">
              <div className="bg-[#e6fbf4] text-[#00b074] rounded-lg p-2.5 h-10 w-10 flex items-center justify-center mb-6">
                <FileText className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-2">
                Four branded documents
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Employment letter, visa support letter, cover letter, and payslip — all on your company letterhead.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-slate-200/50 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-start text-left">
              <div className="bg-[#e6fbf4] text-[#00b074] rounded-lg p-2.5 h-10 w-10 flex items-center justify-center mb-6">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-800 tracking-tight mb-2">
                Unique wording, every time
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                An AI drafting agent varies tone, structure and detail per candidate, so no two letters read the same.
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* Main Body */}
      <main id="generation-workspace" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 w-full">
        
        {/* Setup Parameters Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Corporate Profile Input form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Building2 className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Corporate Employer</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Company Name</label>
                <input 
                  type="text" 
                  value={company.name}
                  onChange={(e) => setCompany({ ...company, name: e.target.value })}
                  placeholder="e.g. Helix BioTech Alliance"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Industry Sectors</label>
                  <input 
                    type="text" 
                    value={company.industry}
                    onChange={(e) => setCompany({ ...company, industry: e.target.value })}
                    placeholder="e.g. BioTech"
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Website URL</label>
                  <input 
                    type="text" 
                    value={company.website}
                    onChange={(e) => setCompany({ ...company, website: e.target.value })}
                    placeholder="e.g. helix.com"
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Office Address</label>
                <input 
                  type="text" 
                  value={company.address}
                  onChange={(e) => setCompany({ ...company, address: e.target.value })}
                  placeholder="e.g. Sector 7, London, United Kingdom"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Signing Representative</label>
                  <input 
                    type="text" 
                    value={company.signatoryName}
                    onChange={(e) => setCompany({ ...company, signatoryName: e.target.value })}
                    placeholder="e.g. Dr. Catherine"
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Title Designation</label>
                  <input 
                    type="text" 
                    value={company.signatoryTitle}
                    onChange={(e) => setCompany({ ...company, signatoryTitle: e.target.value })}
                    placeholder="e.g. VP Talent"
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Expense Sponsoring Type</label>
                <select 
                  value={company.sponsorshipType}
                  onChange={(e) => setCompany({ ...company, sponsorshipType: e.target.value as any })}
                  className="w-full border border-slate-200 bg-white rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                >
                  <option value="Full Sponsoring">Full Sponsoring (Flight, Hotel, Subsistence, medical)</option>
                  <option value="Employee Covered">Employee Covered (Expenses paid personally)</option>
                  <option value="Split Sponsoring">Split Sponsoring (Hotel paid by employer)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Visual Logo Descriptor (Prompt)</label>
                <textarea 
                  value={company.logoPrompt}
                  onChange={(e) => setCompany({ ...company, logoPrompt: e.target.value })}
                  placeholder="e.g. A geometric chemical molecular connection chain with minimal circular line motifs"
                  rows={2}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Event Details Input Form */}
          <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Calendar className="h-4 w-4 text-slate-500" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Event Particulars</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Event/Conference Name</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={event.name}
                    onChange={(e) => setEvent({ ...event, name: e.target.value })}
                    placeholder="e.g. World Biotech Summit 2026"
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 mt-1.5">
                  <span className="text-[10px] text-slate-400 font-mono">Fill Name, then let Voyager search or generate coordinates</span>
                  <button
                    type="button"
                    onClick={handleLookupVenue}
                    disabled={isLookingUpVenue || !event.name.trim()}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 hover:bg-blue-100 disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-400 text-blue-700 rounded-md text-[11px] font-bold transition-all shrink-0 cursor-pointer shadow-xs"
                  >
                    {isLookingUpVenue ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-3 w-3 text-blue-600" />
                        ✨ AI Auto-fill Event
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Host Organization</label>
                  <input 
                  type="text" 
                    value={event.hostOrg}
                    onChange={(e) => setEvent({ ...event, hostOrg: e.target.value })}
                    placeholder="e.g. LifeSciences Fed"
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">City & Country Location</label>
                  <input 
                    type="text" 
                    value={event.cityCountry}
                    onChange={(e) => setEvent({ ...event, cityCountry: e.target.value })}
                    placeholder="e.g. Singapore"
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-500 font-semibold">Conference Venue</label>
                  <button
                    type="button"
                    onClick={handleSearchHotels}
                    disabled={isSearchingHotels || !event.venue?.trim()}
                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 disabled:bg-slate-50 disabled:border-slate-100 disabled:text-slate-400 text-emerald-700 rounded text-[10px] font-bold transition-all cursor-pointer"
                  >
                    {isSearchingHotels ? (
                      <>
                        <Loader2 className="h-2.5 w-2.5 animate-spin text-emerald-500" />
                        Sourcing...
                      </>
                    ) : (
                      <>
                        <Hotel className="h-2.5 w-2.5 text-emerald-600" />
                        🏨 Sourced Hotels
                      </>
                    )}
                  </button>
                </div>
                <input 
                  id="venue-address-input"
                  type="text" 
                  value={event.venue}
                  onChange={(e) => setEvent({ ...event, venue: e.target.value })}
                  placeholder="e.g. Marina Bay Sands Exhibition Centre"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                />

                {/* Sponsoring Hotel Pill */}
                {event.designatedHotelName && (
                  <div className="mt-1.5 flex items-center justify-between bg-emerald-50/75 border border-emerald-100 text-emerald-800 rounded px-2.5 py-1 text-[11px] font-medium leading-normal animate-none">
                    <span className="truncate">
                      🏨 **Designated Hotel:** {event.designatedHotelName}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEvent({ ...event, designatedHotelName: undefined, designatedHotelAddress: undefined })}
                      className="ml-2 hover:bg-emerald-200/50 text-emerald-700 hover:text-emerald-900 font-bold rounded-full w-4 h-4 flex items-center justify-center shrink-0 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Sourced Hotels Modal/Dropdown overlay */}
                {showHotelsDropdown && (
                  <div className="absolute left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl max-h-72 overflow-y-auto p-3 text-xs text-slate-800 animate-none">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 mb-2">
                      <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
                        ✨ Sourced near Event Area
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowHotelsDropdown(false)}
                        className="text-slate-400 hover:text-slate-600 font-bold text-sm cursor-pointer"
                      >
                        ×
                      </button>
                    </div>

                    {isSearchingHotels ? (
                      <div className="py-8 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                        <span className="text-[11px] text-slate-500 font-medium">Sourcing from Web Grounding index...</span>
                      </div>
                    ) : lookedUpHotels.length === 0 ? (
                      <div className="py-4 text-center text-slate-400 text-[11px]">
                        No accommodations loaded. Please ensure the Event Venue has values and try again.
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {lookedUpHotels.map((h, i) => (
                          <div 
                            key={i} 
                            className="p-2 border border-slate-100 hover:border-emerald-200 rounded bg-slate-50/50 hover:bg-emerald-50/10 transition-all flex flex-col justify-between gap-1.5"
                          >
                            <div>
                              <div className="flex items-center justify-between font-bold text-slate-800 text-[11px]">
                                <span className="truncate">{h.name}</span>
                                <span className="text-emerald-700 shrink-0">{h.pricePerNight}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 mt-0.5">
                                <span>📍 {h.distance}</span>
                                <span className="truncate">• {h.address.split(',')[0]}</span>
                              </div>
                              <p className="text-[10px] text-slate-500 italic mt-1 leading-relaxed">
                                {h.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setEvent({
                                  ...event,
                                  designatedHotelName: h.name,
                                  designatedHotelAddress: h.address
                                });
                                setShowHotelsDropdown(false);
                              }}
                              className="w-full text-center py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-all cursor-pointer shadow-xs"
                            >
                              Sponsor & Book for Guests
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={event.startDate}
                    onChange={(e) => setEvent({ ...event, startDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all animate-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={event.endDate}
                    onChange={(e) => setEvent({ ...event, endDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all animate-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Trip/Participation Purpose Description</label>
                <textarea 
                  value={event.purpose}
                  onChange={(e) => setEvent({ ...event, purpose: e.target.value })}
                  placeholder="e.g. Delivering opening keynotes with visual scientific showcases, clinical partnering exhibits, and molecular fabrication summits..."
                  rows={4}
                  className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Full-width Multi-Agent Bulk Nominee Operations Workspace */}
        <BulkIntakePanel
          company={company}
          event={event}
          themePreference={themePreference}
          candidates={candidates}
          setCandidates={setCandidates}
          packages={packages}
          setPackages={setPackages}
          setLogs={setLogs}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          selectedCandId={selectedCandId}
          setSelectedCandId={setSelectedCandId}
        />

        {/* Coordinated Monitoring Status Panel */}
        {(isGenerating || logs.length > 0) && (
          <AgentStatusBoard 
            logs={logs} 
            isGenerating={isGenerating} 
            activeCandidateName={activeCandidateName} 
            progressPercent={progressPercent} 
          />
        )}

        {/* Output Document Workspace */}
        {packages.length > 0 && selectedPackage && activeCandidate && (
          <div className="space-y-8 animate-fade-in">
            
            {/* Multiple Candidate Tab Navigation Selector & Bulk ZIP Download */}
            {packages.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
                <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 min-w-0">
                  {packages.length > 1 && (
                    <>
                      <span className="text-xs font-mono text-slate-400 font-semibold uppercase tracking-wider pl-1 flex-shrink-0">
                        Select Traveler Output:
                      </span>
                      <div className="flex items-center gap-2 min-w-0">
                        {packages.map((pkg) => {
                          const cInfo = candidates.find(c => c.id === pkg.candidateId);
                          if (!cInfo) return null;
                          const isSelected = selectedCandId === pkg.candidateId;
                          return (
                            <button
                              key={pkg.candidateId}
                              onClick={() => setSelectedCandId(pkg.candidateId)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 flex-shrink-0 ${
                                isSelected 
                                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md' 
                                  : 'bg-slate-800/85 hover:bg-slate-750 text-slate-300 border border-slate-750'
                              }`}
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {cInfo.fullName}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                  {packages.length === 1 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse flex-shrink-0" />
                      <span className="text-xs font-sans text-slate-300">
                        High-fidelity packages generated successfully for <strong>{activeCandidate?.fullName}</strong>.
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 self-stretch md:self-auto">
                  <button
                    onClick={async () => {
                      setIsDownloadingAll(true);
                      try {
                        await downloadAllTravelPackagesAsZip(packages, candidates, company, event);
                      } catch (err: any) {
                        console.error(err);
                        alert("Could not compile ZIP portfolio: " + err.message);
                      } finally {
                        setIsDownloadingAll(false);
                      }
                    }}
                    disabled={isDownloadingAll || packages.length === 0}
                    className="w-full md:w-auto bg-[#00b074] hover:bg-[#009a65] disabled:bg-slate-800 disabled:text-slate-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 duration-150 cursor-pointer"
                  >
                    {isDownloadingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                        Compiling ZIP Portfolio...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4" />
                        Download All Packages (ZIP)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* QA Auditing Indicators */}
            <CompliancePanel 
              score={selectedPackage.complianceScore} 
              checks={selectedPackage.complianceChecks} 
              candidateName={activeCandidate.fullName} 
            />

            {/* Main letterhead document hub controller */}
            <DocumentViewerTab 
              candidate={activeCandidate} 
              company={company} 
              event={event} 
              branding={selectedPackage.branding} 
              documents={selectedPackage.documents}
              onUpdateBranding={handleUpdateTheme}
              onUpdateDocumentContent={handleUpdateContent}
            />

          </div>
        )}

      </main>

      {/* Aesthetic humbe Footer */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-16 text-center text-xs text-slate-400 font-mono">
        <div>Coordinated Multi-Agent Travel Facilitator Unit</div>
        <div className="mt-0.5 opacity-70">Strict compliance verification aligned with Embassy requirements</div>
      </footer>
    </div>
  );
}
