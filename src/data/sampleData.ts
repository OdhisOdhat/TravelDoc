import { Candidate, CompanyProfile, EventDetails } from "../types";

export const SAMPLE_COMPANY: CompanyProfile = {
  name: "Helix BioTech Alliance",
  industry: "Biomedical Engineering & AI Therapeutics",
  address: "Innovation House, Sector 7, London, EC2A 4NE, United Kingdom",
  website: "https://helix-biotech.io",
  signatoryName: "Dr. Catherine Vance",
  signatoryTitle: "VP of Global Talent Operations",
  sponsorshipType: "Full Sponsoring",
  logoPrompt: "A sleek interlocking helix with modern geometric circular motifs"
};

export const SAMPLE_EVENT: EventDetails = {
  name: "Annual World Biotech Summit 2026",
  hostOrg: "Global LifeSciences Federation",
  venue: "Marina Bay Sands Convention Centre",
  cityCountry: "Singapore",
  startDate: "2026-07-12",
  endDate: "2026-07-16",
  purpose: "Presenting state-of-the-art AI drug screening architectures, establishing clinical partners, and delivering keynote speeches on automated molecular fabrication.",
  inviteRefNumber: "INV-2026-BTS-893"
};

export const SAMPLE_CANDIDATES: Candidate[] = [
  {
    id: "cand-1",
    fullName: "Dr. Alistair Sterling",
    passportNumber: "GBP9023412",
    jobTitle: "Lead AI Drug Discovery Scientist",
    department: "Computational Biology & AI Research",
    monthlySalary: 162500,
    hireDate: "2022-03-15",
    roleInEvent: "Speaker",
    travelStartDate: "2026-07-10",
    travelEndDate: "2026-07-18",
    email: "a.sterling@helix-biotech.io",
    phone: "+44 7700 900077",
    customDetails: "Will deliver the opening scientific keynote: 'Synthesizing Antibiotics on Neural Supercomputers'."
  },
  {
    id: "cand-2",
    fullName: "Elena Rostova",
    passportNumber: "EUP7823901",
    jobTitle: "Senior Clinical Trials Coordinator",
    department: "Clinical Operations & Biotech Compliance",
    monthlySalary: 154700,
    hireDate: "2024-05-10",
    roleInEvent: "Exhibitor",
    travelStartDate: "2026-07-09",
    travelEndDate: "2026-07-19",
    email: "e.rostova@helix-biotech.io",
    phone: "+44 7700 911044",
    customDetails: "Managing Helix's high-throughput pharmaceutical exhibition bay (Booth B-14)."
  }
];
