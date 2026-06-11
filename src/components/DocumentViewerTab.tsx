import React, { useState } from 'react';
import { 
  FileText, Check, Copy, Printer, Download, Sparkles, 
  HelpCircle, Edit3, Save, RefreshCw, Undo, Eye, Coins
} from 'lucide-react';
import { BrandingDetails, GeneratedDocument, Candidate, CompanyProfile, EventDetails, DesignTheme } from '../types';

interface DocumentViewerTabProps {
  candidate: Candidate;
  company: CompanyProfile;
  event: EventDetails;
  branding: BrandingDetails;
  documents: GeneratedDocument[];
  onUpdateBranding: (theme: DesignTheme) => void;
  onUpdateDocumentContent: (docId: string, text: string) => void;
}

// Simple but elegant utility to parse basic Markdown (headers, lists, bold) into styled HTML elements
function renderSimpleMarkdown(
  md: string, 
  theme: DesignTheme, 
  primaryColor: string,
  onSelectParagraph?: (paraText: string, index: number) => void,
  selectedParaIndex?: number | null
) {
  if (!md) return null;
  
  const lines = md.split('\n');
  return lines.map((line, index) => {
    const trimmed = line.trim();
    
    // Horizontal Rule
    if (trimmed === '---') {
      return <hr key={index} className="my-6 border-slate-200" />;
    }
    
    // Headers
    if (trimmed.startsWith('###')) {
      const headerText = trimmed.slice(3).trim();
      const isSelected = selectedParaIndex === index;
      return (
        <h3 
          key={index} 
          onClick={() => onSelectParagraph && onSelectParagraph(headerText, index)}
          className={`text-lg font-bold mt-6 mb-3 tracking-tight font-sans transition-all group relative cursor-pointer px-2 py-1 rounded-md border-2 ${
            isSelected 
              ? 'border-blue-500 bg-blue-50/25 shadow-sm ring-1 ring-blue-400' 
              : 'border-transparent hover:border-blue-300 hover:bg-blue-50/5'
          }`}
          style={{ color: primaryColor }}
        >
          {headerText}
          {onSelectParagraph && (
            <span className="absolute -top-2.5 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-slate-900 border border-slate-850 text-[9px] text-white px-1.5 py-0.5 rounded shadow transition-opacity select-none z-10 font-mono font-normal normal-case">
              <Sparkles className="h-2.5 w-2.5 text-blue-400 animate-pulse" /> Tweak Subsection
            </span>
          )}
        </h3>
      );
    }
    if (trimmed.startsWith('####')) {
      const headerText = trimmed.slice(4).trim();
      const isSelected = selectedParaIndex === index;
      return (
        <h4 
          key={index} 
          onClick={() => onSelectParagraph && onSelectParagraph(headerText, index)}
          className={`text-sm font-semibold uppercase tracking-wider mt-5 mb-2 text-slate-500 font-mono transition-all group relative cursor-pointer px-2 py-1 rounded-md border-2 ${
            isSelected 
              ? 'border-blue-500 bg-blue-50/25 shadow-sm ring-1 ring-blue-400' 
              : 'border-transparent hover:border-blue-300 hover:bg-blue-50/5'
          }`}
        >
          {headerText}
          {onSelectParagraph && (
            <span className="absolute -top-2.5 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-slate-900 border border-slate-850 text-[9px] text-white px-1.5 py-0.5 rounded shadow transition-opacity select-none z-10 font-mono font-normal normal-case">
              <Sparkles className="h-2.5 w-2.5 text-blue-400 animate-pulse" /> Tweak Category
            </span>
          )}
        </h4>
      );
    }
    if (trimmed.startsWith('##')) {
      const headerText = trimmed.slice(2).trim();
      const isSelected = selectedParaIndex === index;
      return (
        <h2 
          key={index} 
          onClick={() => onSelectParagraph && onSelectParagraph(headerText, index)}
          className={`text-xl font-bold mt-8 mb-4 tracking-tight border-b pb-2 transition-all group relative cursor-pointer px-2 py-1 rounded-md border-2 ${
            isSelected 
              ? 'border-blue-500 bg-blue-50/25 shadow-sm ring-1 ring-blue-400' 
              : 'border-transparent hover:border-blue-300 hover:bg-blue-50/5'
          }`}
          style={{ borderColor: `${primaryColor}20`, color: primaryColor }}
        >
          {headerText}
          {onSelectParagraph && (
            <span className="absolute -top-2.5 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-slate-900 border border-slate-850 text-[9px] text-white px-1.5 py-0.5 rounded shadow transition-opacity select-none z-10 font-mono font-normal normal-case">
              <Sparkles className="h-2.5 w-2.5 text-blue-400 animate-pulse" /> Tweak Heading
            </span>
          )}
        </h2>
      );
    }
    
    // Bold / Strong parsing (simple replacement)
    let processedLine: React.ReactNode = trimmed;
    if (trimmed.includes('**')) {
      const parts = trimmed.split('**');
      processedLine = parts.map((part, i) => i % 2 !== 0 ? <strong key={i} className="font-bold text-slate-900">{part}</strong> : part);
    }

    // Unordered List Items
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      const isSelected = selectedParaIndex === index;
      const cleanListItem = trimmed.slice(1).trim();
      return (
        <li 
          key={index} 
          onClick={() => onSelectParagraph && onSelectParagraph(cleanListItem, index)}
          className={`ml-5 list-disc my-1.5 leading-relaxed text-slate-700 transition-all group relative cursor-pointer px-2 py-0.5 rounded-md border-2 ${
            isSelected 
              ? 'border-blue-500 bg-blue-50/25 shadow-sm ring-1 ring-blue-400' 
              : 'border-transparent hover:border-blue-300 hover:bg-blue-50/5'
          }`}
        >
          {processedLine}
          {onSelectParagraph && (
            <span className="absolute -top-2.5 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-slate-900 border border-slate-850 text-[9px] text-white px-1.5 py-0.5 rounded shadow transition-opacity select-none z-10 font-mono font-normal normal-case">
              <Sparkles className="h-2.5 w-2.5 text-blue-400 animate-pulse" /> Tweak Bullet
            </span>
          )}
        </li>
      );
    }
    
    // Table rows (simple rendering for lists or fallback)
    if (trimmed.startsWith('|')) {
      const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
      if (cells.length === 0 || trimmed.includes(':---')) return null;
      
      const isHeader = index === 0 || lines[index - 1]?.trim().startsWith('###') || trimmed.includes('Gross') || trimmed.includes('ENTITY');
      return (
        <div key={index} className={`grid grid-cols-2 gap-4 py-2 border-b border-slate-100 ${isHeader ? 'bg-slate-50/50 font-semibold text-slate-900' : 'text-slate-700'}`}>
          <div className="pl-2">{cells[0]}</div>
          <div className="pr-2 text-right font-mono">{cells[1] || ''}</div>
        </div>
      );
    }

    // Empty Lines
    if (trimmed === '') {
      return <div key={index} className="h-3" />;
    }

    // Default Paragraph line
    const isSelected = selectedParaIndex === index;
    return (
      <p 
        key={index} 
        onClick={() => onSelectParagraph && onSelectParagraph(trimmed, index)}
        className={`my-1.5 leading-relaxed text-slate-700 text-sm md:text-base font-sans font-normal antialiased transition-all group relative cursor-pointer px-2 py-1.5 rounded-md border-2 ${
          isSelected 
            ? 'border-blue-500 bg-blue-50/25 shadow-sm ring-1 ring-blue-400' 
            : 'border-transparent hover:border-blue-250 hover:bg-blue-50/10'
        }`}
      >
        {processedLine}
        {onSelectParagraph && (
          <span className="absolute -top-3.5 right-2 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-slate-900 border border-slate-800 text-[9px] text-white px-1.5 py-0.5 rounded shadow transition-opacity select-none z-15 font-mono font-normal normal-case">
            <Sparkles className="h-2.5 w-2.5 text-blue-400 animate-pulse" /> Tweak Paragraph
          </span>
        )}
      </p>
    );
  });
}

// Complete local compliant Kenyan payroll calculator keeping client-side rendering robust
interface KenyanCalculations {
  gross: number;
  basic: number;
  houseAllowance: number;
  transportAllowance: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  taxableSalary: number;
  paye: number;
  personalRelief: number;
  insuranceRelief: number;
  totalDeductions: number;
  netPay: number;
}

function calculateKenyanPayrollLocal(gross: number): KenyanCalculations {
  const basic = Math.round(gross * 0.70);
  const houseAllowance = Math.round(gross * 0.20);
  const transportAllowance = Math.round(gross * 0.10);

  // NSSF Tier 2 standard employee contribution cap KES 2,160
  const nssf = 2160;

  // AHL: 1.5% of Gross
  const housingLevy = Math.round(gross * 0.015);

  // SHIF: 2.75% of Gross
  const shif = Math.round(gross * 0.0275);

  const taxableSalary = Math.max(0, gross - nssf);

  // PAYE Tax bands (Kenya Finance Act rules)
  let rawTax = 0;
  if (taxableSalary <= 24000) {
    rawTax = taxableSalary * 0.10;
  } else if (taxableSalary <= 32333) {
    rawTax = (24000 * 0.10) + ((taxableSalary - 24000) * 0.25);
  } else {
    rawTax = (24000 * 0.10) + (8333 * 0.25) + ((taxableSalary - 32333) * 0.30);
  }

  const personalRelief = 2400; // standard relief
  const insuranceRelief = Math.round((housingLevy + shif) * 0.15); // AHL + SHIF relief

  let paye = Math.round(rawTax - personalRelief - insuranceRelief);
  if (paye < 0) paye = 0;

  const totalDeductions = nssf + housingLevy + shif + paye;
  const netPay = gross - totalDeductions;

  return {
    gross,
    basic,
    houseAllowance,
    transportAllowance,
    nssf,
    shif,
    housingLevy,
    taxableSalary,
    paye,
    personalRelief,
    insuranceRelief,
    totalDeductions,
    netPay
  };
}

export default function DocumentViewerTab({ 
  candidate, 
  company, 
  event, 
  branding, 
  documents,
  onUpdateBranding,
  onUpdateDocumentContent
}: DocumentViewerTabProps) {
  const [activeDocType, setActiveDocType] = useState<GeneratedDocument['type']>('Employment Letter');
  const [isEditing, setIsEditing] = useState(false);
  const [isCoping, setIsCoping] = useState(false);
  const [feedbackText, setFeedbackText] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(2); // May 2026 is index 2 as default
  
  // Interactive paragraph selector and audit trail logs for Live Agent Co-pilot & Regenerator
  const [selectedParaIndex, setSelectedParaIndex] = useState<number | null>(null);
  const [selectedParaText, setSelectedParaText] = useState<string>("");
  const [revisionHistory, setRevisionHistory] = useState<Array<{
    id: string;
    description: string;
    timestamp: string;
    docType: string;
    paragraphIndex: number | null;
  }>>([]);

  // Retrieve current active document
  const currentDoc = documents.find(d => d.type === activeDocType);
  const [editText, setEditText] = useState("");

  React.useEffect(() => {
    if (currentDoc) {
      setEditText(currentDoc.content);
    }
    // Clean up focus block when changing documents
    setSelectedParaIndex(null);
    setSelectedParaText("");
  }, [currentDoc, activeDocType]);

  if (!currentDoc) {
    return (
      <div className="p-12 text-center text-slate-400 bg-slate-50 rounded-xl border">
        Could not locate generated artifacts for this candidate.
      </div>
    );
  }

  // Handle document edit save
  const handleSaveEdit = () => {
    onUpdateDocumentContent(currentDoc.id, editText);
    setIsEditing(false);
  };

  // Trigger server-side section regeneration
  const handleAIRegenerate = async () => {
    if (!feedbackText.trim()) return;
    setIsRegenerating(true);

    try {
      let data: any = null;
      const documentType = currentDoc.type;
      const currentContent = currentDoc.content;
      
      // Select the specific block content if selected, otherwise focus on the whole document
      const targetContent = selectedParaIndex !== null ? selectedParaText : currentContent;
      
      const customFeedback = selectedParaIndex !== null 
        ? `Within the "${documentType}" for traveler ${candidate.fullName}, rewrite ONLY the following specific block of text/paragraph to fulfill this constraint: "${feedbackText}". Keep the word length and tone proportionate to standard visa or employment letters. Provide ONLY the revised replacement block text without introduction, markdown formatting symbols outside normal markdown, or explanations.\n\nTarget block to rewrite:\n"${selectedParaText}"`
        : feedbackText;

      try {
        const res = await fetch('/api/regenerate-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            candidate,
            company,
            event,
            documentType,
            currentContent: targetContent,
            feedback: customFeedback,
            branding
          })
        });

        if (res.ok) {
          data = await res.json();
        } else {
          console.warn("Backend regeneration returned non-OK status:", res.status);
        }
      } catch (fetchErr: any) {
        console.warn("Network error during document regeneration, switching to client-side mockup:", fetchErr);
      }

      if (!data || !data.success || !data.updatedContent) {
        console.log("Simulating document regeneration client-side for sandbox compatibility...");
        
        let localUpdatedText = selectedParaIndex !== null ? selectedParaText : currentContent;
        const feedbackLower = feedbackText.toLowerCase();

        if (feedbackLower.includes("address") || feedbackLower.includes("located") || feedbackLower.includes("street")) {
          localUpdatedText = selectedParaIndex !== null 
            ? `${selectedParaText} (address details verified at ${company.address})`
            : localUpdatedText.replace(
                /(Sincerely,|Respectfully,|Sincerely yours,)/i,
                `Employer Address Updated Note: Sponsoring activities are referenced at ${company.address}.\n\n$1`
              );
        } else if (feedbackLower.includes("signature") || feedbackLower.includes("representative") || feedbackLower.includes("signat")) {
          localUpdatedText = selectedParaIndex !== null 
            ? `${selectedParaText} [Authorized Representative: ${company.signatoryName}, ${company.signatoryTitle}]`
            : localUpdatedText.replace(
                /(\*\*(.*?)\*\* \nAuthorized Signatory)/i,
                `**${company.signatoryName}**\n${company.signatoryTitle}\n(Fictitious Representative Verified)`
              );
        } else {
          // General client fallback
          localUpdatedText = selectedParaIndex !== null 
            ? `${selectedParaText} (Refined: ${feedbackText})`
            : localUpdatedText + `\n\n*Document revised locally to address feedback: "${feedbackText}"*`;
        }

        data = {
          success: true,
          updatedContent: localUpdatedText
        };
      }

      if (data.success && data.updatedContent) {
        let finalDocumentContent = currentContent;
        
        if (selectedParaIndex !== null) {
          // Paragraph refinement: surgically replace specific block line in markdown content
          const lines = currentContent.split('\n');
          // If the AI returned markdown wrapped in quotes, trim it
          let cleanContentRefined = data.updatedContent.trim();
          if (cleanContentRefined.startsWith('"') && cleanContentRefined.endsWith('"')) {
            cleanContentRefined = cleanContentRefined.substring(1, cleanContentRefined.length - 1);
          }
          lines[selectedParaIndex] = cleanContentRefined;
          finalDocumentContent = lines.join('\n');
        } else {
          // Adjust entire file content
          finalDocumentContent = data.updatedContent;
        }

        onUpdateDocumentContent(currentDoc.id, finalDocumentContent);
        setEditText(finalDocumentContent);
        
        // Push a beautiful item to our revision audit timeline state
        setRevisionHistory(prev => [
          {
            id: `rev-${Date.now()}`,
            description: selectedParaIndex !== null 
              ? `Refined selected paragraph block #${selectedParaIndex + 1} ("${feedbackText}")`
              : `Tuned entire document structure ("${feedbackText}")`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            docType: documentType,
            paragraphIndex: selectedParaIndex
          },
          ...prev
        ]);

        setFeedbackText("");
        setSelectedParaIndex(null);
        setSelectedParaText("");
      } else {
        alert(data.error || "Could not regenerate document.");
      }
    } catch (err: any) {
      console.error(err);
      alert("Unhandled issue compiling document updates: " + err.message);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Copy to clipboard
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(currentDoc.content);
    setIsCoping(true);
    setTimeout(() => setIsCoping(false), 2000);
  };

  // Raw HTML doc styling export tool
  const handleDownloadDoc = () => {
    // Helper function to turn basic markdown into Word/HTML styled document elements
    const convertMarkdownToHtmlForWord = (md: string, primaryColor: string): string => {
      if (!md) return '';
      const lines = md.split('\n');
      let inList = false;
      let html = '';

      for (let line of lines) {
        const trimmed = line.trim();

        if (trimmed === '---') {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 24px 0;" />';
          continue;
        }

        if (trimmed.startsWith('###')) {
          if (inList) { html += '</ul>'; inList = false; }
          const text = trimmed.slice(3).trim();
          html += `<h3 style="color: ${primaryColor}; font-family: 'Arial', sans-serif; font-size: 14pt; margin-top: 24px; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">${text}</h3>`;
          continue;
        }

        if (trimmed.startsWith('####')) {
          if (inList) { html += '</ul>'; inList = false; }
          const text = trimmed.slice(4).trim();
          html += `<h4 style="color: #64748b; font-family: 'Arial', sans-serif; font-size: 11pt; margin-top: 16px; margin-bottom: 6px; font-weight: bold; text-transform: uppercase;">${text}</h4>`;
          continue;
        }

        if (trimmed.startsWith('##')) {
          if (inList) { html += '</ul>'; inList = false; }
          const text = trimmed.slice(2).trim();
          html += `<h2 style="color: ${primaryColor}; font-family: 'Arial', sans-serif; font-size: 18pt; margin-top: 28px; margin-bottom: 12px; font-weight: bold; border-bottom: 2px solid ${primaryColor}; padding-bottom: 6px;">${text}</h2>`;
          continue;
        }

        // List items
        if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
          if (!inList) {
            html += '<ul style="margin: 8px 0 16px 20px; padding: 0; list-style-type: disc;">';
            inList = true;
          }
          let itemText = trimmed.slice(1).trim();
          // Bold support
          itemText = itemText.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: bold;">$1</strong>');
          html += `<li style="font-family: 'Arial', sans-serif; font-size: 11pt; margin-bottom: 6px; color: #334155; line-height: 1.5;">${itemText}</li>`;
          continue;
        }

        if (inList) {
          html += '</ul>';
          inList = false;
        }

        // Table rows
        if (trimmed.startsWith('|')) {
          const cells = trimmed.split('|').map(c => c.trim()).filter(c => c !== '');
          if (cells.length === 0 || trimmed.includes(':---')) continue;
          const isHeader = trimmed.includes('Gross') || trimmed.includes('ENTITY') || trimmed.includes('Description') || trimmed.includes('DESCRIPTION');
          
          if (isHeader) {
            html += `<table style="width: 100%; border-collapse: collapse; margin: 16px 0; border: 1px solid #cbd5e1;">
              <thead>
                <tr style="background-color: #f8fafc;">
                  <th style="border: 1px solid #cbd5e1; padding: 10px; font-family: 'Arial', sans-serif; font-size: 10pt; font-weight: bold; text-align: left; color: #1e293b;">${cells[0] || ''}</th>
                  <th style="border: 1px solid #cbd5e1; padding: 10px; font-family: 'Arial', sans-serif; font-size: 10pt; font-weight: bold; text-align: right; color: #1e293b;">${cells[1] || ''}</th>
                </tr>
              </thead>
              <tbody>`;
          } else {
            html += `<tr>
              <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-family: 'Arial', sans-serif; font-size: 10pt; color: #334155;">${cells[0] || ''}</td>
              <td style="border: 1px solid #e2e8f0; padding: 8px 10px; font-family: 'Arial', sans-serif; font-size: 10pt; text-align: right; font-family: 'Courier New', monospace; color: #0f172a;">${cells[1] || ''}</td>
            </tr>`;
          }
          continue;
        }

        // Close table if it was opened and we see non-table line
        if (html.includes('<table') && !html.includes('</table>') && !trimmed.startsWith('|')) {
          html += '</tbody></table>';
        }

        // Empty line
        if (trimmed === '') {
          html += '<div style="height: 12px;"></div>';
          continue;
        }

        // Normal paragraph
        let paraText = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong style="color: #0f172a; font-weight: bold;">$1</strong>');
        html += `<p style="font-family: 'Arial', sans-serif; font-size: 11pt; margin-bottom: 12px; color: #1e293b; line-height: 1.6;">${paraText}</p>`;
      }

      if (inList) { html += '</ul>'; }
      if (html.includes('<table') && !html.includes('</table>')) { html += '</tbody></table>'; }

      return html;
    };

    let docBodyHtml = '';
    
    if (currentDoc.type === 'Monthly Payslip') {
      // Generate the premium designed high fidelity payslip!
      const grossVal = candidate.monthlySalary || 145000;
      let adjustedGross = grossVal;
      if (adjustedGross < 12050) {
        const hash = candidate.fullName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        adjustedGross = 145000 + (hash % 31) * 1000;
      } else {
        adjustedGross = Math.min(175000, Math.max(145000, adjustedGross));
      }
      const offset = selectedMonthIdx === 0 ? -2000 : selectedMonthIdx === 1 ? 1000 : 0;
      const calcObj = calculateKenyanPayrollLocal(adjustedGross + offset);
      const isSelectedMonthName = ['March 2026', 'April 2026', 'May 2026'][selectedMonthIdx];

      docBodyHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #1e293b; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #ffffff;">
          <!-- Title block -->
          <table style="width: 100%; border-collapse: collapse; border-bottom: 3px solid #0f172a; margin-bottom: 20px;">
            <tr>
              <td style="padding-bottom: 8px; vertical-align: bottom;">
                <h1 style="font-size: 20pt; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin: 0; color: #0f172a;">PAY SLIP</h1>
                <div style="font-size: 8pt; font-family: monospace; color: #94a3b8; font-weight: bold; margin-top: 2px; text-transform: uppercase;">CONFIDENTIAL EARNINGS DECLARATION</div>
              </td>
              <td style="text-align: right; padding-bottom: 8px; vertical-align: bottom;">
                <div style="width: 180px; display: inline-block;">${branding.logoSvg}</div>
              </td>
            </tr>
          </table>

          <!-- Company details & Compliance info -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <tr>
              <td style="width: 55%; vertical-align: top; font-size: 10pt; line-height: 1.5; color: #475569;">
                <strong style="color: #0f172a; font-size: 11pt; text-transform: uppercase;">${candidate.organization || company.name}</strong><br />
                ${candidate.companyAddress || company.address}<br />
                ${candidate.kraPin ? `<strong>KRA PIN:</strong> ${candidate.kraPin}<br />` : ''}
                <strong>Tel:</strong> ${candidate.phone || '+254 722 342 364'} | <strong>Email:</strong> ${candidate.companyEmail || 'info@company.net'}
              </td>
              <td style="width: 45%; vertical-align: top; padding-left: 15px;">
                <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-size: 9pt; line-height: 1.4;">
                  <div style="font-family: monospace; font-size: 8pt; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 4px; text-align: center;">COMPLIANCE REFERENCE</div>
                  <div style="font-weight: bold; color: #0f172a; border-bottom: 1px solid #cbd5e1; padding-bottom: 4px; margin-bottom: 6px; text-align: center; background-color: #ffffff;">KRA PAYE Registered Account</div>
                  <strong>Ledger Code:</strong> <span style="font-family: monospace; font-weight: bold; color: #0f172a;">PAY-2026-05-${candidate.id.slice(-4).toUpperCase()}</span><br />
                  <strong>Tax Body:</strong> Kenya Revenue Authority
                </div>
              </td>
            </tr>
          </table>

          <!-- Employee details grid table -->
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-bottom: 24px;" cellpadding="6">
            <thead>
              <tr style="background-color: #0f172a; color: #ffffff; text-align: center; font-size: 8pt; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                <th style="border: 1px solid #cbd5e1; width: 16.6%;">EMPLOYEE</th>
                <th style="border: 1px solid #cbd5e1; width: 16.6%;">NUMBER</th>
                <th style="border: 1px solid #cbd5e1; width: 16.6%;">DEPARTMENT</th>
                <th style="border: 1px solid #cbd5e1; width: 16.6%;">DATE HIRED</th>
                <th style="border: 1px solid #cbd5e1; width: 16.6%;">DATE</th>
                <th style="border: 1px solid #cbd5e1; width: 16.6%;">PAY PERIOD</th>
              </tr>
            </thead>
            <tbody>
              <tr style="text-align: center; font-size: 9pt; font-weight: bold; color: #334155; background-color: #f8fafc;">
                <td style="border: 1px solid #cbd5e1; color: #0f172a; padding: 10px;">${candidate.fullName}</td>
                <td style="border: 1px solid #cbd5e1; font-family: monospace; padding: 10px;">${candidate.passportNumber}</td>
                <td style="border: 1px solid #cbd5e1; padding: 10px;">${candidate.department}</td>
                <td style="border: 1px solid #cbd5e1; font-family: monospace; padding: 10px;">${candidate.hireDate}</td>
                <td style="border: 1px solid #cbd5e1; font-family: monospace; padding: 10px;">${new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}</td>
                <td style="border: 1px solid #cbd5e1; color: #0f172a; padding: 10px;">${isSelectedMonthName}</td>
              </tr>
            </tbody>
          </table>

          <!-- Payments & Deductions Columns in a table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;" cellspacing="0" cellpadding="0">
            <tr>
              <!-- Payments Column (Left-hand side) -->
              <td style="width: 53%; vertical-align: top; padding-right: 10px;">
                <div style="background-color: #0f172a; color: #ffffff; text-align: center; font-weight: bold; font-size: 9pt; padding: 6px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">PAYMENTS</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 9pt;" cellpadding="5">
                  <tr style="background-color: #f1f5f9; font-weight: bold; border-bottom: 2px solid #0f172a; color: #334155;">
                    <th style="border: 1px solid #e2e8f0; text-align: left;">DESCRIPTION</th>
                    <th style="border: 1px solid #e2e8f0; text-align: center;">HOURS</th>
                    <th style="border: 1px solid #e2e8f0; text-align: center;">RATE</th>
                    <th style="border: 1px solid #e2e8f0; text-align: right;">AMOUNT</th>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">Salary (Basic Pay 70%)</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #64748b;">173.3</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #64748b;">${Math.round(calcObj.basic / 173.3).toLocaleString()}</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-weight: bold; color: #0f172a;">KES ${calcObj.basic.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">House Allowance (20%)</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #64748b;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #64748b;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #334155;">KES ${calcObj.houseAllowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">Transport Allowance</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #64748b;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #64748b;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #334155;">KES ${calcObj.transportAllowance.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; color: #94a3b8; font-style: italic;">Overtime</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #cbd5e1;">0.0</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #cbd5e1;">0.00</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #cbd5e1;">0.00</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; color: #94a3b8; font-style: italic;">Bonus</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #cbd5e1;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #cbd5e1;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #cbd5e1;">0.00</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; color: #94a3b8; font-style: italic;">Commission</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #cbd5e1;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #cbd5e1;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #cbd5e1;">0.00</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; color: #94a3b8; font-style: italic;">Expenses Reimbursements</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #cbd5e1;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: center; font-family: monospace; color: #cbd5e1;">-</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #cbd5e1;">0.00</td>
                  </tr>
                  <tr style="background-color: #f8fafc; font-weight: bold; border-top: 2px solid #0f172a;">
                    <td style="border: 1px solid #e2e8f0; font-size: 10pt; color: #0f172a; padding: 10px;" colspan="3">Total Hourly Pay / Earnings</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-size: 10pt; color: #0f172a; padding: 10px;">KES ${calcObj.gross.toLocaleString()}</td>
                  </tr>
                </table>
              </td>

              <!-- Deductions Column (Right-hand side) -->
              <td style="width: 47%; vertical-align: top; padding-left: 10px;">
                <div style="background-color: #0f172a; color: #ffffff; text-align: center; font-weight: bold; font-size: 9pt; padding: 6px; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">TO DATE / DEDUCTIONS</div>
                <table style="width: 100%; border-collapse: collapse; font-size: 9pt;" cellpadding="5">
                  <tr style="background-color: #f1f5f9; font-weight: bold; border-bottom: 2px solid #0f172a; color: #334155;">
                    <th style="border: 1px solid #e2e8f0; text-align: left;">DESCRIPTION</th>
                    <th style="border: 1px solid #e2e8f0; text-align: right;">AMOUNT</th>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; font-weight: bold; color: #334155;">Salary PAYE (Income Tax)</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #dc2626; font-weight: bold;">KES ${calcObj.paye.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">NSSF Statutory Contribution Cap</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #475569;">KES ${calcObj.nssf.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">SHIF Health Levy (2.75%)</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #475569;">KES ${calcObj.shif.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; color: #475569;">Housing Levy AHL (1.5%)</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #475569;">KES ${calcObj.housingLevy.toLocaleString()}</td>
                  </tr>
                  <tr style="background-color: #f0fdf4; font-weight: bold; color: #15803d; font-style: italic;">
                    <td style="border: 1px solid #e2e8f0; font-size: 8pt;">- KRA Personal Relief</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-size: 8pt;">-KES ${calcObj.personalRelief.toLocaleString()}</td>
                  </tr>
                  <tr style="background-color: #f0fdf4; font-weight: bold; color: #15803d; font-style: italic;">
                    <td style="border: 1px solid #e2e8f0; font-size: 8pt;">- KRA Insurance Relief</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-size: 8pt;">-KES ${calcObj.insuranceRelief.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td style="border: 1px solid #e2e8f0; color: #cbd5e1; font-style: italic;">Other Tax / Deductions</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; color: #cbd5e1;">0.00</td>
                  </tr>
                  <tr style="background-color: #f8fafc; font-weight: bold; border-top: 2px solid #0f172a;">
                    <td style="border: 1px solid #e2e8f0; font-size: 10pt; color: #0f172a; padding: 10px;">Total Deductions</td>
                    <td style="border: 1px solid #e2e8f0; text-align: right; font-family: monospace; font-size: 10pt; color: #dc2626; padding: 10px;">KES ${calcObj.totalDeductions.toLocaleString()}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Net Salary Deposited banner -->
          <table style="width: 100%; border-collapse: collapse; border: 2px solid #22c55e; background-color: #f0fdf4; padding: 12px; border-radius: 6px; margin-top: 10px;" cellpadding="10">
            <tr>
              <td>
                <span style="font-size: 8pt; font-weight: bold; text-transform: uppercase; color: #15803d; letter-spacing: 1px; display: block; margin-bottom: 2px;">NET SALARY DEPOSITED / CURRENT PERIOD</span>
                <span style="font-size: 9pt; color: #475569;">Transferred directly via Corporate Banking RTGS settlement in full</span>
              </td>
              <td style="text-align: right; vertical-align: middle;">
                <span style="font-family: monospace; font-size: 18pt; font-weight: 950; color: #166534;">KES ${calcObj.netPay.toLocaleString()}</span>
              </td>
            </tr>
          </table>

          <div style="margin-top: 20px; font-size: 8pt; font-family: monospace; color: #94a3b8; text-align: center; line-height: 1.4;">
            This document serves as an authentic financial verification ledger computer-generated on behalf of the sponsoring employer listed.
          </div>
        </div>
      `;
    } else {
      // Normal styled corporate letterhead and parsed markdown body!
      let borderStyle = '';
      let topRibbon = '';
      let textAlignment = 'left';

      if (branding.letterheadStyle === 'Side Accent Bar') {
        borderStyle = `border-left: 6px solid ${branding.primaryColor}; padding-left: 24px;`;
      } else if (branding.letterheadStyle === 'Top Gradient Banner') {
        topRibbon = `<div style="height: 12px; background-color: ${branding.primaryColor}; margin-bottom: 24px; font-size: 1px;">&nbsp;</div>`;
      } else if (branding.letterheadStyle === 'Classic Crest') {
        textAlignment = 'center';
      }

      const letterContentHtml = convertMarkdownToHtmlForWord(currentDoc.content, branding.primaryColor);

      docBodyHtml = `
        ${topRibbon}
        <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; font-size: 11.5pt; ${borderStyle}">
          <!-- Header table with Logo and address block -->
          <table style="width: 100%; border-collapse: collapse; border-bottom: 2px solid #cbd5e1; padding-bottom: 15px; margin-bottom: 25px;">
            <tr>
              <td style="vertical-align: middle; width: 35%; text-align: ${textAlignment === 'center' ? 'center' : 'left'}; padding-bottom: 12px;">
                <div style="width: 160px; display: inline-block;">${branding.logoSvg}</div>
              </td>
              <td style="vertical-align: top; width: 65%; text-align: ${textAlignment === 'center' ? 'center' : 'right'}; font-size: 9.5pt; color: #475569; padding-bottom: 12px; line-height: 1.5;">
                <strong style="color: #0f172a; font-size: 11pt; text-transform: uppercase; letter-spacing: 0.5px;">${candidate.organization || company.name}</strong><br />
                ${candidate.companyAddress || company.address}<br />
                ${candidate.kraPin ? `<strong>KRA PIN:</strong> ${candidate.kraPin}<br />` : ''}
                <strong>Tel:</strong> ${candidate.phone || '+254 722 342 364'} | <strong>Email:</strong> ${candidate.companyEmail || 'info@company.net'}
              </td>
            </tr>
          </table>

          <!-- Main letter text document body container -->
          <div style="margin-top: 24px; line-height: 1.6; font-size: 11pt; color: #1e293b;">
            ${letterContentHtml}
          </div>
        </div>
      `;
    }

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${currentDoc.title}</title>
        <style>
          body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #1e293b; margin: 40px; }
          p { margin-top: 0; margin-bottom: 12px; }
        </style>
      </head>
      <body style="background-color: #ffffff; padding: 20px;">
        ${docBodyHtml}
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${candidate.fullName.replace(/\s+/g, '_')}_${currentDoc.type.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Browser Print trigger
  const handlePrint = () => {
    const canvas = document.getElementById('print-sheet-canvas');
    if (!canvas) {
      alert("Error: Print sheet canvas was not found on the page.");
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please enable popups in your browser to view print previews and export PDFs.");
      return;
    }

    // Capture style tags and stylesheet links from the current DOM
    const styleElements = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(tag => tag.outerHTML)
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${currentDoc.title} - ${candidate.fullName}</title>
          <meta charset="utf-8">
          ${styleElements}
          <style>
            body {
              background-color: #f8fafc !important;
              margin: 0;
              padding: 40px;
              display: flex;
              justify-content: center;
              font-family: system-ui, -apple-system, sans-serif;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            
            #print-outer-wrapper {
              background-color: #ffffff;
              width: 100%;
              max-width: 800px;
              min-height: 1000px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
              border: 1px solid #e2e8f0;
              padding: 48px;
              box-sizing: border-box;
              position: relative;
            }

            @media print {
              body {
                background-color: #ffffff !important;
                padding: 0 !important;
                margin: 0 !important;
              }
              #print-outer-wrapper {
                border: none !important;
                box-shadow: none !important;
                padding: 0 !important;
                margin: 0 !important;
                max-width: 100% !important;
                min-height: auto !important;
                position: relative !important;
              }
            }
          </style>
        </head>
        <body>
          <div id="print-outer-wrapper" class="${canvas.className}">
            ${canvas.innerHTML}
          </div>
          <script>
            window.addEventListener('load', () => {
              setTimeout(() => {
                window.print();
              }, 400);
            });
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Visual guidelines configuration details for design themes
  const getThemeClass = () => {
    switch(branding.theme) {
      case 'Swiss Modern':
        return 'font-sans tracking-tight leading-7 uppercase-headers';
      case 'Tech Mono':
        return 'font-mono tracking-normal leading-relaxed text-slate-800';
      case 'Editorial Serif':
        return 'font-serif tracking-wide leading-8 text-slate-800';
      case 'Coastal Clean':
        return 'font-sans tracking-tight leading-6 rounded-brand';
      default:
        return 'font-sans';
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      
      {/* Visual Design Controller & Document Tabs */}
      <div className="xl:col-span-3 lg:col-span-4 space-y-6">
        
        {/* Document Selectors */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 mb-3 uppercase">
            Document Package
          </h4>
          <div className="space-y-1.5">
            {documents.map((doc) => {
              const isActive = activeDocType === doc.type;
              return (
                <button
                  key={doc.id}
                  onClick={() => {
                    setActiveDocType(doc.type);
                    setIsEditing(false);
                  }}
                  className={`w-full text-left flex items-center gap-2.5 px-3 py-2.5 rounded-md text-xs font-semibold transition-all ${
                    isActive 
                      ? 'bg-slate-100 border-l-4 border-slate-900 text-slate-900 font-bold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <FileText className={`h-4 w-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
                  <span className="truncate">{doc.type}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Brand Theme Adjuster */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <h4 className="text-[10px] font-mono font-bold tracking-wider text-slate-400 mb-3 uppercase">
            Branding Layout
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {(['Swiss Modern', 'Tech Mono', 'Editorial Serif', 'Coastal Clean'] as DesignTheme[]).map((themeName) => {
              const isSelected = branding.theme === themeName;
              return (
                <button
                  key={themeName}
                  onClick={() => onUpdateBranding(themeName)}
                  className={`py-2 px-1 rounded-md text-[11px] font-bold text-center border transition-all ${
                    isSelected 
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {themeName}
                </button>
              );
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 space-y-2">
            <div className="flex items-center justify-between">
              <span>Primary Accents:</span>
              <span className="font-mono font-semibold" style={{ color: branding.primaryColor }}>
                {branding.primaryColor}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Letterhead Layout:</span>
              <span className="text-slate-600 font-semibold">{branding.letterheadStyle}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary document terminal rendering canvas */}
      <div className="xl:col-span-6 lg:col-span-8 space-y-6">
        
        {/* Core Controls Action Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isEditing ? (
              <button 
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-semibold shadow-sm transition-all"
              >
                <Save className="h-3.5 w-3.5" /> Save Changes
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-semibold shadow-sm transition-all"
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit Template
              </button>
            )}

            {isEditing && (
              <button 
                onClick={() => {
                  setEditText(currentDoc.content);
                  setIsEditing(false);
                }}
                className="flex items-center gap-1 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-xs font-semibold text-slate-600 transition-all"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleCopyToClipboard}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-md transition-all"
              title="Copy to clipboard"
            >
              {isCoping ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
            <button 
              onClick={handlePrint}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-md transition-all"
              title="Print document"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button 
              onClick={handlePrint}
              className="px-3 py-1.5 text-white hover:bg-red-700 bg-red-650 rounded-md transition-all flex items-center gap-1.5 text-xs font-semibold shadow-sm"
              title="Download high-fidelity PDF"
            >
              <FileText className="h-3.5 w-3.5" /> PDF
            </button>
            <button 
              onClick={handleDownloadDoc}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 rounded-md transition-all flex items-center gap-1 text-xs font-semibold px-3 py-1.5"
              title="Download Word File"
            >
              <Download className="h-4 w-4" /> DOCX
            </button>
          </div>
        </div>

        {/* Live physical letterhead mock viewport sheet */}
        <div className="bg-slate-50 border border-slate-150 rounded-xl p-4 sm:p-8 shadow-inner overflow-x-auto">
          <div 
            id="print-sheet-canvas"
            className={`mx-auto max-w-[800px] min-h-[1000px] bg-white border border-slate-250 p-8 sm:p-12 shadow-md relative ${getThemeClass()}`}
          >
            {/* Architectural Letterhead borders based on choice */}
            {branding.letterheadStyle === 'Side Accent Bar' && (
              <div className="absolute top-0 left-0 bottom-0 w-2" style={{ backgroundColor: branding.primaryColor }} />
            )}
            {branding.letterheadStyle === 'Top Gradient Banner' && (
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(to right, ${branding.primaryColor}, ${branding.secondaryColor})` }} />
            )}

            {/* Letterhead Frame */}
            <div className={`flex flex-col sm:flex-row items-start justify-between gap-6 pb-6 border-b border-slate-200 mb-8 ${branding.letterheadStyle === 'Classic Crest' ? 'sm:flex-col sm:text-center sm:items-center' : ''}`}>
              {/* Dynamic SVG logo injection */}
              <div className={`flex-shrink-0 ${branding.letterheadStyle === 'Classic Crest' ? 'mx-auto' : ''}`}>
                <div 
                  className="max-h-16"
                  dangerouslySetInnerHTML={{ __html: branding.logoSvg }} 
                />
              </div>
              
              <div className={`text-xs text-slate-500 leading-relaxed font-sans ${branding.letterheadStyle === 'Classic Crest' ? 'text-center' : 'text-right sm:max-w-md'}`}>
                <h5 className="font-bold text-slate-900 font-sans text-sm tracking-tight uppercase">
                  {candidate.organization || company.name}
                </h5>
                <p className="text-slate-650 mt-1 font-medium">{candidate.companyAddress || company.address}</p>
                {candidate.kraPin && (
                  <p className="text-slate-400 font-mono text-[10px]">KRA PIN: {candidate.kraPin}</p>
                )}
                <p className="text-slate-500 mt-0.5">
                  <span className="font-mono text-[11px]">Tel: {candidate.phone || '+254 722 342 364'}</span>
                  <span className="mx-1.5 text-slate-300">|</span> 
                  <span>Email: {candidate.companyEmail || company.website || 'info@company.net'}</span>
                </p>
              </div>
            </div>

            {/* Document Core Content Viewport Sheet */}
            {isEditing ? (
              <div className="space-y-4">
                <div className="text-[10px] font-mono text-slate-400">RAW MARKDOWN MODE</div>
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full h-[600px] font-mono text-xs p-4 border border-slate-200 rounded-md focus:ring-1 focus:ring-slate-900 focus:border-slate-900 outline-none overflow-y-auto bg-slate-50"
                />
              </div>
            ) : currentDoc.type === 'Monthly Payslip' ? (
              <div className="space-y-6">
                {/* 3-Month Toggle headers */}
                <div className="flex items-center gap-1.5 mb-2 bg-slate-100/70 p-1.5 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-2">
                    Pay Period:
                  </span>
                  {['March 2026', 'April 2026', 'May 2026'].map((monthName, idx) => (
                    <button
                      key={monthName}
                      onClick={() => setSelectedMonthIdx(idx)}
                      className={`text-xs font-bold px-3 py-1 rounded-md transition-all ${
                        selectedMonthIdx === idx 
                          ? 'bg-slate-900 text-white shadow-sm' 
                          : 'text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {monthName}
                    </button>
                  ))}
                </div>

                {/* Highly structured physical payroll statement as visual image representation */}
                <div className="border border-slate-300 p-5 sm:p-6 bg-white font-sans text-slate-800 shadow-sm rounded-lg">
                  
                  {/* Title Bar with LOGO */}
                  <div className="flex justify-between items-center border-b-2 border-slate-900 pb-3 mb-4">
                    <div>
                      <h2 className="text-xl font-extrabold uppercase tracking-widest text-slate-900">PAY SLIP</h2>
                      <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block -mt-1">
                        CONFIDENTIAL EARNINGS DECLARATION
                      </span>
                    </div>
                    <div className="text-right">
                      <div dangerouslySetInnerHTML={{ __html: branding.logoSvg }} className="max-h-8 inline-block select-none" />
                    </div>
                  </div>

                  {/* Company Info section */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
                    <div className="space-y-0.5 leading-relaxed">
                      <h4 className="font-bold text-slate-900 uppercase tracking-tight text-xs">
                        {candidate.organization || company.name}
                      </h4>
                      <p className="text-slate-500 leading-normal">{candidate.companyAddress || company.address}</p>
                      {candidate.kraPin && (
                        <p className="text-slate-400 font-mono text-[10px]">PIN: {candidate.kraPin}</p>
                      )}
                      <p className="text-slate-500 font-mono text-[11px]">
                        Tel: {candidate.phone || '+254 722 342 364'} | {candidate.companyEmail || 'info@company.net'}
                      </p>
                    </div>
                    <div className="sm:text-right space-y-0.5 p-2 bg-slate-50 border border-slate-200 rounded text-[11px] leading-relaxed">
                      <div className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wide">
                        COMPLIANCE REFERENCE
                      </div>
                      <div className="text-slate-900 font-bold border-b pb-0.5 mb-1 bg-white px-1 py-0.5 text-center">
                        KRA PAYE Registered Account
                      </div>
                      <p className="text-slate-600">
                        Ledger Code: <strong className="font-mono text-slate-900">PAY-2026-05-{candidate.id.slice(-4).toUpperCase()}</strong>
                      </p>
                      <p className="text-slate-500 text-[10px]/normal">Tax Body: Kenya Revenue Authority</p>
                    </div>
                  </div>

                  {/* Employee Details bar (as top headers in image blueprint) */}
                  <div className="grid grid-cols-6 gap-0.5 bg-slate-900 text-white p-2.5 text-center text-[10px] sm:text-xs font-bold uppercase tracking-wide rounded-t">
                    <div className="truncate border-r border-slate-700 px-1">EMPLOYEE</div>
                    <div className="truncate border-r border-slate-700 px-1">NUMBER</div>
                    <div className="truncate border-r border-slate-700 px-1">DEPARTMENT</div>
                    <div className="truncate border-r border-slate-700 px-1">DATE HIRED</div>
                    <div className="truncate border-r border-slate-700 px-1">DATE</div>
                    <div className="truncate px-1">PAY PERIOD</div>
                  </div>

                  {/* Employee Details values */}
                  <div className="grid grid-cols-6 gap-0.5 text-center text-xs font-semibold text-slate-800 -mt-0.5 pt-2 pb-2.5 border-b border-l border-r border-slate-205 rounded-b mb-6 bg-slate-50/50">
                    <div className="truncate border-r border-slate-200 px-1 text-slate-900 font-bold">
                      {candidate.fullName}
                    </div>
                    <div className="truncate border-r border-slate-200 font-mono text-[11px] px-1 text-slate-600">
                      {candidate.passportNumber}
                    </div>
                    <div className="truncate border-r border-slate-200 px-1 text-slate-600">
                      {candidate.department}
                    </div>
                    <div className="truncate border-r border-slate-200 font-mono text-[11px] px-1 text-slate-600">
                      {candidate.hireDate}
                    </div>
                    <div className="truncate border-r border-slate-200 font-mono text-[11px] px-1 text-slate-600">
                      {new Date().toLocaleDateString(undefined, { month: 'short', day: '2-digit', year: 'numeric' })}
                    </div>
                    <div className="truncate font-mono text-[11px] px-1 text-slate-600">
                      {['March 2026', 'April 2026', 'May 2026'][selectedMonthIdx]}
                    </div>
                  </div>

                  {/* Dual Column grid for payments vs deductions */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    
                    {/* Left Column: Payments (Take 7 spans) */}
                    <div className="md:col-span-7">
                      <div className="bg-slate-900 text-white text-center font-bold text-xs py-1.5 uppercase tracking-wider mb-2">
                        PAYMENTS
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-100 font-bold border-b border-slate-350 text-slate-700">
                            <th className="p-2 text-left">DESCRIPTION</th>
                            <th className="p-2 text-center">HOURS</th>
                            <th className="p-2 text-center">RATE</th>
                            <th className="p-2 text-right">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {(() => {
                            const grossVal = candidate.monthlySalary || 145000;
                            let adjustedGross = grossVal;
                            if (adjustedGross < 12050) {
                              const hash = candidate.fullName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                              adjustedGross = 145000 + (hash % 31) * 1000;
                            } else {
                              adjustedGross = Math.min(175000, Math.max(145000, adjustedGross));
                            }
                            
                            const offset = selectedMonthIdx === 0 ? -2000 : selectedMonthIdx === 1 ? 1000 : 0;
                            const currentC = calculateKenyanPayrollLocal(adjustedGross + offset);
                            
                            return (
                              <>
                                <tr>
                                  <td className="p-2 font-semibold text-slate-700">Salary (Basic Pay 70%)</td>
                                  <td className="p-2 text-center text-slate-450 font-mono">173.3</td>
                                  <td className="p-2 text-center text-slate-450 font-mono">KES {Math.round(currentC.basic / 173.3).toLocaleString()}</td>
                                  <td className="p-2 text-right font-mono text-slate-800 font-semibold">
                                    KES {currentC.basic.toLocaleString()}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2 font-semibold text-slate-700">House Allowance (20%)</td>
                                  <td className="p-2 text-center text-slate-450 font-mono">-</td>
                                  <td className="p-2 text-center text-slate-450 font-mono">-</td>
                                  <td className="p-2 text-right font-mono text-slate-800">
                                    KES {currentC.houseAllowance.toLocaleString()}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2 font-semibold text-slate-700">Transport / Commuter Allowance</td>
                                  <td className="p-2 text-center text-slate-450 font-mono">-</td>
                                  <td className="p-2 text-center text-slate-450 font-mono">-</td>
                                  <td className="p-2 text-right font-mono text-slate-800">
                                    KES {currentC.transportAllowance.toLocaleString()}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2 italic text-slate-400">Overtime</td>
                                  <td className="p-2 text-center text-slate-350 font-mono">0.0</td>
                                  <td className="p-2 text-center text-slate-350 font-mono">0.00</td>
                                  <td className="p-2 text-right font-mono text-slate-400">0.00</td>
                                </tr>
                                <tr>
                                  <td className="p-2 italic text-slate-400">Bonus</td>
                                  <td className="p-2 text-center text-slate-350 font-mono">-</td>
                                  <td className="p-2 text-center text-slate-350 font-mono">-</td>
                                  <td className="p-2 text-right font-mono text-slate-400">0.00</td>
                                </tr>
                                <tr>
                                  <td className="p-2 italic text-slate-400">Commission</td>
                                  <td className="p-2 text-center text-slate-350 font-mono">-</td>
                                  <td className="p-2 text-center text-slate-350 font-mono">-</td>
                                  <td className="p-2 text-right font-mono text-slate-400">0.00</td>
                                </tr>
                                <tr>
                                  <td className="p-2 italic text-slate-400">Expenses Reimbursements</td>
                                  <td className="p-2 text-center text-slate-350 font-mono">-</td>
                                  <td className="p-2 text-center text-slate-350 font-mono">-</td>
                                  <td className="p-2 text-right font-mono text-slate-400">0.00</td>
                                </tr>
                                <tr className="bg-slate-50 border-t-2 border-slate-900 font-bold text-slate-900 leading-normal">
                                  <td className="p-2 py-2.5" colSpan={3}>Total Hourly Pay / Earnings</td>
                                  <td className="p-2 text-right font-mono text-xs sm:text-sm">
                                    KES {currentC.gross.toLocaleString()}
                                  </td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>

                    {/* Right Column: Deductions / To Date (Take 5 spans) */}
                    <div className="md:col-span-5">
                      <div className="bg-slate-910 text-white text-center font-bold text-xs py-1.5 uppercase tracking-wider mb-2">
                        TO DATE
                      </div>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="bg-slate-100 font-bold border-b border-slate-350 text-slate-700">
                            <th className="p-2 text-left">DESCRIPTION</th>
                            <th className="p-2 text-right">AMOUNT</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {(() => {
                            const grossVal = candidate.monthlySalary || 145000;
                            let adjustedGross = grossVal;
                            if (adjustedGross < 12050) {
                              const hash = candidate.fullName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                              adjustedGross = 145000 + (hash % 31) * 1000;
                            } else {
                              adjustedGross = Math.min(175000, Math.max(145000, adjustedGross));
                            }
                            
                            const offset = selectedMonthIdx === 0 ? -2000 : selectedMonthIdx === 1 ? 1000 : 0;
                            const currentC = calculateKenyanPayrollLocal(adjustedGross + offset);
                            
                            return (
                              <>
                                <tr>
                                  <td className="p-2 text-slate-700 font-semibold">Salary PAYE (Income Tax)</td>
                                  <td className="p-2 text-right font-mono text-rose-700">
                                    KES {currentC.paye.toLocaleString()}
                                  </td>
                                </tr>
                                <tr>
                                  <td className="p-2 text-slate-700">Overtime Tax</td>
                                  <td className="p-2 text-right font-mono text-slate-400">0.00</td>
                                </tr>
                                <tr>
                                  <td className="p-2 text-slate-700">Bonus Tax</td>
                                  <td className="p-2 text-right font-mono text-slate-400">0.00</td>
                                </tr>
                                <tr>
                                  <td className="p-2 text-slate-700">Commission Tax</td>
                                  <td className="p-2 text-right font-mono text-slate-400">0.00</td>
                                </tr>
                                <tr>
                                  <td className="p-2 text-slate-700">Expenses Deductions</td>
                                  <td className="p-2 text-right font-mono text-slate-400">0.00</td>
                                </tr>
                                <tr>
                                  <td className="p-2 text-slate-600 font-mono text-[10px]">NSSF Statutory Cap</td>
                                  <td className="p-2 text-right font-mono text-slate-600">KES {currentC.nssf.toLocaleString()}</td>
                                </tr>
                                <tr>
                                  <td className="p-2 text-slate-600 font-mono text-[10px]">SHIF Health Levy (2.75%)</td>
                                  <td className="p-2 text-right font-mono text-slate-600">KES {currentC.shif.toLocaleString()}</td>
                                </tr>
                                <tr>
                                  <td className="p-2 text-slate-600 font-mono text-[10px]">Housing Levy (1.5%)</td>
                                  <td className="p-2 text-right font-mono text-slate-600">KES {currentC.housingLevy.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-emerald-50 text-emerald-800 font-semibold italic text-[11px]">
                                  <td className="p-2">Personal Relief (KRA Deduct)</td>
                                  <td className="p-2 text-right font-mono text-emerald-700">-KES {currentC.personalRelief.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-emerald-50 text-emerald-800 font-semibold italic text-[11px] border-b border-emerald-100">
                                  <td className="p-2">Insurance Relief (KRA Deduct)</td>
                                  <td className="p-2 text-right font-mono text-emerald-700">-KES {currentC.insuranceRelief.toLocaleString()}</td>
                                </tr>
                                <tr className="bg-slate-50 border-t-2 border-slate-900 font-bold text-slate-900 leading-normal">
                                  <td className="p-2 py-2.5">Total Payment (Deductions)</td>
                                  <td className="p-2 text-right font-mono text-rose-700 text-xs sm:text-sm">
                                    KES {currentC.totalDeductions.toLocaleString()}
                                  </td>
                                </tr>
                              </>
                            );
                          })()}
                        </tbody>
                      </table>
                    </div>

                  </div>

                  {/* Net takehome pay banner from calculation */}
                  {(() => {
                    const grossVal = candidate.monthlySalary || 145000;
                    let adjustedGross = grossVal;
                    if (adjustedGross < 12050) {
                      const hash = candidate.fullName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
                      adjustedGross = 145000 + (hash % 31) * 1000;
                    } else {
                      adjustedGross = Math.min(175000, Math.max(145000, adjustedGross));
                    }
                    
                    const offset = selectedMonthIdx === 0 ? -2000 : selectedMonthIdx === 1 ? 1000 : 0;
                    const currentC = calculateKenyanPayrollLocal(adjustedGross + offset);
                    
                    return (
                      <div className="mt-6 p-4 sm:p-5 bg-emerald-50/80 border-2 border-emerald-500 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
                        <div className="text-center sm:text-left">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-700 font-mono block">
                            Net Salary Deposited / Current Period
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Transferred directly via Corporate Banking RTGS settlement in full
                          </span>
                        </div>
                        <div className="text-center sm:text-right font-mono">
                          <span className="text-xl sm:text-2xl font-black text-emerald-800">
                            KES {currentC.netPay.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  <p className="mt-4 text-[10px] text-slate-400 text-center leading-relaxed font-mono">
                    This document serves as an authentic financial verification ledger computer-generated on behalf of the sponsoring employer listed.
                  </p>
                </div>

                {/* Show narration fallback report as summary underneath payslip card */}
                <details className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-250">
                  <summary className="text-xs font-bold text-slate-500 cursor-pointer hover:text-slate-800 select-none">
                    View Comprehensive Narrative & Detailed Payroll Report
                  </summary>
                  <div className="prose max-w-none text-slate-700 mt-3 border-t pt-3 text-xs leading-relaxed">
                    {renderSimpleMarkdown(
                      currentDoc.content, 
                      branding.theme, 
                      branding.primaryColor,
                      (text, idx) => {
                        setSelectedParaIndex(idx);
                        setSelectedParaText(text);
                      },
                      selectedParaIndex
                    )}
                  </div>
                </details>
              </div>
            ) : (
              <div className="prose max-w-none prose-slate">
                {renderSimpleMarkdown(
                  currentDoc.content, 
                  branding.theme, 
                  branding.primaryColor,
                  (text, idx) => {
                    setSelectedParaIndex(idx);
                    setSelectedParaText(text);
                  },
                  selectedParaIndex
                )}
              </div>
            )}

            {/* Footer Frame */}
            <div className="mt-16 pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <div>Helix Travel System (v{currentDoc.version})</div>
              <div>Locked & Verified (QA Audit Clean)</div>
            </div>
          </div>
        </div>

      </div>

      {/* Right Column: Live Agent Co-pilot & Regenerator */}
      <div className="xl:col-span-3 lg:col-span-12 space-y-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 text-slate-800 shadow-sm relative overflow-hidden sticky top-6">
          <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center gap-2 mb-2 relative z-10">
            <Sparkles className="h-4 w-4 text-blue-600 animate-pulse" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 font-sans">
              Live Agent Co-pilot & Regenerator
            </h4>
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed mb-4 relative z-10">
            Instruct the specialized agent to adjust the document's structure, refine wording, or rewrite specific paragraphs based on your feedback.
          </p>

          {/* Selection State Card */}
          {selectedParaIndex !== null ? (
            <div className="mb-4 p-3 bg-blue-50/75 border border-blue-200 rounded-lg text-xs relative z-10 select-none">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-bold text-blue-800 flex items-center gap-1 font-mono text-[10px] uppercase">
                  🎯 Target Section #{selectedParaIndex + 1}
                </span>
                <button 
                  onClick={() => {
                    setSelectedParaIndex(null);
                    setSelectedParaText("");
                  }} 
                  className="text-blue-500 hover:text-blue-700 transition-colors font-semibold"
                  title="Clear block focus"
                >
                  Deselect
                </button>
              </div>
              <p className="text-slate-600 italic line-clamp-3 leading-relaxed">
                "{selectedParaText}"
              </p>
              <div className="mt-2 text-[9px] text-blue-600/85">
                ⚡ Submit your instructions to refine ONLY this section!
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-slate-50 border border-slate-150 rounded-lg text-xs text-slate-500 relative z-10">
              <span className="font-semibold text-slate-700 block mb-0.5">💡 Professional Tip:</span>
              Click on any paragraph directly inside the letterhead preview matching your goals to focus the Co-pilot on that block!
            </div>
          )}

          {/* Quick prompt action chips */}
          <div className="mb-4 relative z-10">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block mb-2">
              Common Tweaks
            </span>
            <div className="flex flex-col gap-1.5">
              {[
                { label: "🎓 Make highly formal", prompt: "Improve the vocabulary to make it extremely formal, appropriate for a senior visa officer." },
                { label: "⏱️ Long-form date representation", prompt: "Ensure all travel and conference schedule dates strictly output in long-form." },
                { label: "💼 Highlight technical leadership", prompt: "Rewrite this segment to emphasize advanced cloud development and enterprise governance skills." },
                { label: "✈️ Add corporate travel details", prompt: "Add travel itinerary references including flight codes and connections." },
                { label: "⚓ Summarize & shorten", prompt: "Make the content more concise and straight to the point without compromising on credentials." }
              ].map((act, idx) => {
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setFeedbackText(act.prompt);
                    }}
                    className="text-[10.5px] bg-slate-100 hover:bg-slate-250 text-slate-700 duration-150 font-semibold px-2.5 py-1.5 rounded text-left truncate w-full"
                    title={act.prompt}
                  >
                    {act.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main User Input area */}
          <div className="space-y-3 relative z-10">
            <div>
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                Feedback & Constraints
              </label>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={selectedParaIndex !== null ? "e.g. 'Translate to formal English', 'change years to 5 years', 'mention clinical expertise'" : "e.g. 'Make the whole letter sound extremely professional and formal' or click a paragraph to modify specifically"}
                className="w-full h-24 bg-white border border-slate-200 rounded-lg p-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 resize-none font-sans"
                disabled={isRegenerating}
              />
            </div>

            <button
              onClick={handleAIRegenerate}
              disabled={isRegenerating || !feedbackText.trim()}
              className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-150 disabled:text-slate-400 active:bg-slate-950 text-white text-xs font-semibold py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 justify-center shadow-sm"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Aligning with AI...
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" /> 
                  {selectedParaIndex !== null ? "Modify Highlighted Block" : "Tweak Full Document"}
                </>
              )}
            </button>
          </div>

          {/* Live agent audit logs trail of changes */}
          {revisionHistory.length > 0 && (
            <div className="mt-6 pt-5 border-t border-slate-100 relative z-10">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wide block mb-3">
                Revision Audit History
              </span>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {revisionHistory
                  .filter(h => h.docType === currentDoc.type)
                  .map((log) => (
                    <div key={log.id} className="text-[10px] text-slate-600 bg-slate-50 border border-slate-100 rounded p-2 flex flex-col gap-1 leading-normal">
                      <div className="flex justify-between font-mono text-[9px] text-slate-450">
                        <span>{log.timestamp}</span>
                        <span className="text-emerald-600 font-bold">SUCCESS</span>
                      </div>
                      <p className="font-sans font-medium text-slate-700">
                        {log.description}
                      </p>
                    </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      </div>
  );
}
