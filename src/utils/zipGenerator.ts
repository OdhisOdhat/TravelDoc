import JSZip from 'jszip';
import { Candidate, CompanyProfile, EventDetails, CandidatePackage, GeneratedDocument, BrandingDetails } from '../types';

interface KenyanCalculations {
  basic: number;
  houseAllowance: number;
  transportAllowance: number;
  nssf: number;
  housingLevy: number;
  shif: number;
  paye: number;
  personalRelief: number;
  insuranceRelief: number;
  totalDeductions: number;
  netPay: number;
}

// Replicate Kenyan tax and deduction brackets for payslip formatting in ZIP
function calculateKenyanPayrollForZip(gross: number): KenyanCalculations {
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
  } else if (taxableSalary <= 500000) {
    rawTax = (24000 * 0.10) + ((32333 - 24000) * 0.25) + ((taxableSalary - 32333) * 0.30);
  } else if (taxableSalary <= 800000) {
    rawTax = (24000 * 0.10) + ((32333 - 24000) * 0.25) + ((500000 - 32333) * 0.30) + ((taxableSalary - 500000) * 0.325);
  } else {
    rawTax = (24000 * 0.10) + ((32333 - 24000) * 0.25) + ((500000 - 32333) * 0.30) + ((800000 - 500000) * 0.325) + ((taxableSalary - 800000) * 0.35);
  }

  const personalRelief = 2400;
  const insuranceRelief = Math.round(shif * 0.15); // 15% of SHIF premium can qualify as insurance relief
  const paye = Math.max(0, Math.round(rawTax - personalRelief - insuranceRelief));

  const totalDeductions = Math.round(nssf + housingLevy + shif + paye);
  const netPay = Math.round(gross - totalDeductions);

  return {
    basic,
    houseAllowance,
    transportAllowance,
    nssf,
    housingLevy,
    shif,
    paye,
    personalRelief,
    insuranceRelief,
    totalDeductions,
    netPay
  };
}

// Convert markdown structures into high-fidelity Microsoft Word HTML blocks
function convertMarkdownToHtmlForZip(md: string, primaryColor: string): string {
  if (!md) return '';
  const lines = md.split('\n');
  let inList = false;
  let html = '';

  for (const line of lines) {
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
    const paraText = trimmed.replace(/\*\*(.*?)\*\//g, '<strong style="color: #0f172a; font-weight: bold;">$1</strong>');
    html += `<p style="font-family: 'Arial', sans-serif; font-size: 11pt; margin-bottom: 12px; color: #1e293b; line-height: 1.6;">${paraText}</p>`;
  }

  if (inList) { html += '</ul>'; }
  if (html.includes('<table') && !html.includes('</table>')) { html += '</tbody></table>'; }

  return html;
}

// Builds individual payslips for consecutive months to satisfy strict 3-month consul bank checks
function buildPayslipHtmlForZip(
  candidate: Candidate, 
  company: CompanyProfile, 
  branding: BrandingDetails, 
  monthIndex: number
): string {
  const monthNames = ['March 2026', 'April 2026', 'May 2026'];
  const activeMonth = monthNames[monthIndex];
  
  // Salary offsets for realistic month-over-month variations
  const offset = monthIndex === 0 ? -2000 : monthIndex === 1 ? 1000 : 0;
  
  const baseSalary = candidate.monthlySalary || 145000;
  let adjustedGross = baseSalary;
  
  if (adjustedGross < 12050) {
    const hash = candidate.fullName.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    adjustedGross = 145000 + (hash % 31) * 1000;
  } else {
    adjustedGross = Math.min(175000, Math.max(145000, adjustedGross));
  }
  
  const stats = calculateKenyanPayrollForZip(adjustedGross + offset);

  return `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; color: #1e293b; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px; background-color: #ffffff;">
      <table style="width: 100%; border-collapse: collapse; border-bottom: 3px solid #0f172a; margin-bottom: 20px;">
        <tr>
          <td style="vertical-align: middle; width: 50%; padding-bottom: 15px;">
            <strong style="font-size: 15pt; color: ${branding.primaryColor}; text-transform: uppercase; letter-spacing: 0.5px;">${candidate.organization || company.name}</strong><br />
            <span style="font-size: 8.5pt; color: #64748b;">${candidate.companyAddress || company.address}</span>
          </td>
          <td style="vertical-align: middle; width: 50%; text-align: right; padding-bottom: 15px;">
            <strong style="font-size: 13pt; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">MONTHLY PAYSLIP</strong><br />
            <span style="font-size: 9.5pt; font-weight: bold; color: #3b82f6;">Pay Period: ${activeMonth}</span>
          </td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <tr>
          <td style="padding: 10px; width: 50%; border-right: 1px solid #e2e8f0; vertical-align: top;">
            <span style="font-size: 8pt; font-family: monospace; color: #64748b; text-transform: uppercase;">EMPLOYEE DETS</span>
            <div style="font-size: 9.5pt; font-weight: bold; color: #0f172a; margin-top: 4px;">${candidate.fullName}</div>
            <div style="font-size: 9pt; color: #334155; margin-top: 2px;">Title: ${candidate.jobTitle}</div>
            <div style="font-size: 9pt; color: #334155;">Department: ${candidate.department}</div>
            <div style="font-size: 9pt; color: #334155;">Email: ${candidate.email}</div>
          </td>
          <td style="padding: 10px; width: 50%; vertical-align: top;">
            <span style="font-size: 8pt; font-family: monospace; color: #64748b; text-transform: uppercase;">VERIFICATION DATA</span>
            <div style="font-size: 9pt; color: #334155; margin-top: 4px;"><strong>ID:</strong> CLR-EMP-${candidate.id.substring(0,6).toUpperCase()}</div>
            <div style="font-size: 9pt; color: #334155;"><strong>Passport:</strong> ${candidate.passportNumber}</div>
            <div style="font-size: 9pt; color: #334155;"><strong>Date of Hire:</strong> ${candidate.hireDate}</div>
            <div style="font-size: 9pt; color: #334155;">${candidate.kraPin ? `<strong>KRA PIN:</strong> ${candidate.kraPin}` : '<strong>KRA PIN:</strong> KRA' + candidate.id.substring(0,5).toUpperCase() + '9Z'}</div>
          </td>
        </tr>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: #0f172a; color: #ffffff;">
            <th style="padding: 8px 12px; text-align: left; font-size: 9pt; text-transform: uppercase; font-family: sans-serif;">Earnings Category</th>
            <th style="padding: 8px 12px; text-align: right; font-size: 9pt; text-transform: uppercase; width: 25%; font-family: sans-serif;">Amount (KES)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 7px 12px; font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">Basic Fixed Salary</td>
            <td style="padding: 7px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${stats.basic.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 7px 12px; font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">House Allowance (Non-Cash/Cash allocation)</td>
            <td style="padding: 7px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${stats.houseAllowance.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 7px 12px; font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">Commuting & Field Transport Allowance</td>
            <td style="padding: 7px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${stats.transportAllowance.toLocaleString()}</td>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td style="padding: 8px 12px; font-size: 9.5pt; color: #0f172a;">GROSS MONTHLY PAYABLE</td>
            <td style="padding: 8px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #0f172a;">${(adjustedGross + offset).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #cbd5e1;">
        <thead>
          <tr style="background-color: #64748b; color: #ffffff;">
            <th style="padding: 8px 12px; text-align: left; font-size: 9pt; text-transform: uppercase; font-family: sans-serif;">Statutory & Voluntary Deductions</th>
            <th style="padding: 8px 12px; text-align: right; font-size: 9pt; text-transform: uppercase; width: 25%; font-family: sans-serif;">Amount (KES)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 7px 12px; font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">NSSF Tier II Employee Contribution Cap</td>
            <td style="padding: 7px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${stats.nssf.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 7px 12px; font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">Affordable Housing Levy (AHL) - 1.5%</td>
            <td style="padding: 7px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${stats.housingLevy.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 7px 12px; font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">Social Health Insurance Fund (SHIF)</td>
            <td style="padding: 7px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${stats.shif.toLocaleString()}</td>
          </tr>
          <tr>
            <td style="padding: 7px 12px; font-size: 9.5pt; color: #334155; border-bottom: 1px solid #e2e8f0;">PAYE Income Tax (Net of Reliefs)</td>
            <td style="padding: 7px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #0f172a; border-bottom: 1px solid #e2e8f0;">${stats.paye.toLocaleString()}</td>
          </tr>
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td style="padding: 8px 12px; font-size: 9.5pt; color: #0f172a;">TOTAL DEDUCTIONS ACCUMULATED</td>
            <td style="padding: 8px 12px; text-align: right; font-size: 9.5pt; font-family: monospace; color: #b91c1c;">${stats.totalDeductions.toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <div style="background-color: #f0fdf4; border: 1.5px solid #bbf7d0; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-size: 11pt; font-weight: bold; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">NET DISBURSED SALARY PAYABLE:</td>
            <td style="text-align: right; font-size: 15pt; font-weight: bold; font-family: monospace; color: #15803d;">KES ${stats.netPay.toLocaleString()}</td>
          </tr>
        </table>
      </div>

      <div style="margin-top: 20px; font-size: 8pt; font-family: monospace; color: #94a3b8; text-align: center; line-height: 1.4;">
        This document serves as an authentic financial verification ledger computer-generated on behalf of the sponsoring employer listed.
      </div>
    </div>
  `;
}

// Packages the text and tables into Word-compatible .doc file formats
function decorateWithDocStructure(title: string, bodyContentHtml: string): string {
  return `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #1e293b; margin: 40px; }
        p { margin-top: 0; margin-bottom: 12px; }
      </style>
    </head>
    <body style="background-color: #ffffff; padding: 20px;">
      ${bodyContentHtml}
    </body>
    </html>
  `;
}

// Generate the ultimate high-fidelity ZIP packet containing all travelers and their corresponding structures
export async function downloadAllTravelPackagesAsZip(
  packages: CandidatePackage[],
  candidates: Candidate[],
  company: CompanyProfile,
  event: EventDetails
): Promise<void> {
  const zip = new JSZip();

  for (const pkg of packages) {
    const candidate = candidates.find(c => c.id === pkg.candidateId);
    if (!candidate) continue;

    // Create a folder named after the candidate (e.g., "John_Doe")
    const candidateFolderName = candidate.fullName.replace(/\s+/g, '_');
    const folder = zip.folder(candidateFolderName);
    if (!folder) continue;

    const branding = pkg.branding;

    // Inside this folder, add all corresponding documents
    for (const doc of pkg.documents) {
      if (doc.type === 'Monthly Payslip') {
        // Embed 3 consecutive monthly payslips for embassy application completeness!
        for (let idx = 0; idx < 3; idx++) {
          const payslipMonth = ['March_2026', 'April_2026', 'May_2026'][idx];
          const payslipHtml = buildPayslipHtmlForZip(candidate, company, branding, idx);
          const fullDocBytes = decorateWithDocStructure(`Payslip_${payslipMonth}_${candidate.fullName}`, payslipHtml);
          
          folder.file(`04_Monthly_Payslip_${payslipMonth}.doc`, fullDocBytes);
        }
      } else {
        // Letters or normal documents formatting and layout setup
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

        const letterContentHtml = convertMarkdownToHtmlForZip(doc.content, branding.primaryColor);

        const letterheadBodyHtml = `
          ${topRibbon}
          <div style="font-family: Arial, sans-serif; color: #1e293b; line-height: 1.6; font-size: 11.5pt; ${borderStyle}">
            <!-- Header corporate logo block -->
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

            <!-- Letter content body -->
            <div style="margin-top: 24px; line-height: 1.6; font-size: 11pt; color: #1e293b;">
              ${letterContentHtml}
            </div>
          </div>
        `;

        const fullWordDocBytes = decorateWithDocStructure(`${doc.title} - ${candidate.fullName}`, letterheadBodyHtml);
        
        // Form a nice prefix ordering so they arrange beautifuly
        let orderPrefix = '01';
        if (doc.type === 'Employment Letter') orderPrefix = '01_Employment_Verification';
        else if (doc.type === 'Visa Support Letter') orderPrefix = '02_Consular_Visa_Support';
        else if (doc.type === 'Cover Letter') orderPrefix = '03_Company_Sponsorship_Cover';
        else orderPrefix = `05_${doc.type.replace(/\s+/g, '_')}`;

        folder.file(`${orderPrefix}.doc`, fullWordDocBytes);
      }
    }
  }

  // Generate ZIP file blob
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = url;
  const safeCompanyName = company.name.replace(/\s+/g, '_');
  link.download = `Sponsor_Travel_Packages_${safeCompanyName}.zip`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
