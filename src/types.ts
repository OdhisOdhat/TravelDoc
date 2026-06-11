export interface Candidate {
  id: string;
  fullName: string;
  passportNumber: string;
  jobTitle: string;
  department: string;
  monthlySalary: number;
  hireDate: string;
  roleInEvent: 'Speaker' | 'Attendee' | 'Exhibitor' | 'VIP Guest';
  travelStartDate: string;
  travelEndDate: string;
  email: string;
  phone?: string;
  customDetails?: string;
  organization?: string;
  kraPin?: string;
  companyAddress?: string;
  companyEmail?: string;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  address: string;
  website: string;
  signatoryName: string;
  signatoryTitle: string;
  sponsorshipType: 'Full Sponsoring' | 'Employee Covered' | 'Split Sponsoring';
  logoPrompt?: string;
}

export interface EventDetails {
  name: string;
  hostOrg: string;
  venue: string;
  cityCountry: string;
  startDate: string;
  endDate: string;
  purpose: string;
  inviteRefNumber?: string;
  designatedHotelName?: string;
  designatedHotelAddress?: string;
}

export type DesignTheme = 'Swiss Modern' | 'Tech Mono' | 'Editorial Serif' | 'Coastal Clean';

export interface BrandingDetails {
  theme: DesignTheme;
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
  letterheadStyle: 'Minimal Header' | 'Side Accent Bar' | 'Top Gradient Banner' | 'Classic Crest';
  logoSvg: string; // The generated SVG code or visual logo markup
}

export interface GeneratedDocument {
  id: string;
  candidateId: string;
  type: 'Employment Letter' | 'Visa Support Letter' | 'Monthly Payslip' | 'Cover Letter' | 'Event Participation' | 'Branding Spec' | 'Compliance Report' | 'Hotel Booking';
  title: string;
  content: string; // Markdown or rich HTML content
  meta?: any; // Extra structured calculations (e.g., payslip breakdown)
  lastUpdated: string;
  version: number;
}

export interface AgentLog {
  id: string;
  timestamp: string;
  agent: 'Candidate Processor' | 'Corporate Branding' | 'Employment Verification' | 'Visa Support' | 'Payroll Specialist' | 'Design Layout' | 'Compliance QA';
  level: 'info' | 'success' | 'warning' | 'error';
  message: string;
  details?: string;
}

export interface ComplianceCheck {
  id: string;
  category: 'Identity' | 'Employment' | 'Financial' | 'Chronology' | 'Consistency';
  description: string;
  status: 'passed' | 'warning' | 'failed';
  feedback: string;
}

export interface CandidatePackage {
  candidateId: string;
  branding: BrandingDetails;
  documents: GeneratedDocument[];
  complianceScore: number; // 0 to 100
  complianceChecks: ComplianceCheck[];
  logs: AgentLog[];
}
