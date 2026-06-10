import React, { useState } from 'react';
import { 
  Users, Palette, Globe, Briefcase, Plus, Trash2, 
  Sparkles, FileText, CheckCircle2, ShieldAlert, ShieldCheck,
  Building2, Calendar, FileType, BookOpen, ChevronRight, HelpCircle,
  Search, Loader2, Wand2
} from 'lucide-react';
import { Candidate, CompanyProfile, EventDetails, DesignTheme, CandidatePackage, AgentLog } from './types';
import { SAMPLE_COMPANY, SAMPLE_EVENT, SAMPLE_CANDIDATES } from './data/sampleData';
import AgentStatusBoard from './components/AgentStatusBoard';
import CompliancePanel from './components/CompliancePanel';
import DocumentViewerTab from './components/DocumentViewerTab';
import BulkIntakePanel from './components/BulkIntakePanel';

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
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [packages, setPackages] = useState<CandidatePackage[]>([]);
  const [selectedCandId, setSelectedCandId] = useState<string | null>(null);
  
  // Staggered status bar progress mock inside generation triggers
  const [progressPercent, setProgressPercent] = useState(0);
  const [activeCandidateName, setActiveCandidateName] = useState("");

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
      hireDate: "2024-01-01",
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
      // Step 1: Query full-stack Express agent pipeline
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidates,
          company,
          event,
          theme: themePreference
        })
      });

      const data = await response.json();
      clearInterval(progressInterval);

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
      alert("Failed connecting to the documentation server: " + err.message);
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

              <div>
                <label className="block text-slate-500 font-semibold mb-1">Conference Venue</label>
                <input 
                  type="text" 
                  value={event.venue}
                  onChange={(e) => setEvent({ ...event, venue: e.target.value })}
                  placeholder="e.g. Marina Bay Sands Exhibition Centre"
                  className="w-full border border-slate-200 rounded-md px-3 py-2 focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none text-slate-800 transition-all"
                />
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
            
            {/* Multiple Candidate Tab Navigation Selector */}
            {packages.length > 1 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-white overflow-x-auto">
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
                            : 'bg-slate-800/85 hover:bg-slate-805 text-slate-300 border border-slate-750'
                        }`}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {cInfo.fullName}
                      </button>
                    );
                  })}
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
