/**
 * Dynamic Report Print Stylesheet Generator
 * Generates calibrated print CSS supporting A4, Short/Letter, Long Bond, and US Legal
 * in both portrait and landscape orientation with robust table pagination.
 */
export function getReportPrintStyles(paperSize = "A4", orientation = "portrait") {
  // Map paper sizes to standard physical dimensions
  let sizeDefinition = "210mm 297mm"; // A4 default
  if (paperSize === "Letter") {
    sizeDefinition = "8.5in 11in";
  } else if (paperSize === "Long") {
    sizeDefinition = "8.5in 13in";
  } else if (paperSize === "Legal") {
    sizeDefinition = "8.5in 14in";
  }

  return `
    /* ── Screen Preview Styles ── */
    .report-preview-container {
      background: #f8fafc;
      min-height: 100vh;
      padding-bottom: 3rem;
      font-family: Arial, Helvetica, sans-serif;
    }

    .report-sheet {
      background: #ffffff;
      color: #0f172a;
      max-width: ${orientation === "landscape" ? "11.5in" : "8.5in"};
      margin: 1.5rem auto;
      padding: 0.5in 0.6in;
      box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.08), 0 2px 6px -1px rgba(15, 23, 42, 0.04);
      border-radius: 4px;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      line-height: 1.4;
    }

    /* ── Header & Banner ── */
    .report-header {
      text-align: center;
      border-bottom: 2.5px solid #02451C;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }

    .report-header-banner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 8px;
      width: 100%;
    }

    .report-header-banner {
      width: 100%;
      max-width: 100%;
      height: auto;
      max-height: 80px;
      object-fit: contain;
    }

    .report-header-text {
      margin-top: 6px;
    }

    .report-title {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 15pt;
      font-weight: 700;
      color: #02451C;
      margin: 0;
      letter-spacing: -0.01em;
      line-height: 1.25;
      text-transform: uppercase;
    }

    .report-subtitle {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 10.5pt;
      font-weight: 600;
      color: #475569;
      margin: 3px 0 0;
      line-height: 1.3;
    }

    /* ── Scope Metadata Bar ── */
    .report-metadata-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 6px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 4px;
      padding: 6px 12px;
      margin-bottom: 14px;
      font-size: 9pt;
    }

    .report-meta-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .report-meta-label {
      color: #64748b;
      font-weight: 500;
    }

    .report-meta-value {
      color: #0f172a;
      font-weight: 700;
    }

    /* ── Section Headings ── */
    .report-section {
      margin-bottom: 14px;
    }

    .report-section-title {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 11pt;
      font-weight: 700;
      color: #02451C;
      border-bottom: 1.5px solid #cbd5e1;
      padding-bottom: 3px;
      margin: 0 0 6px;
      letter-spacing: 0.02em;
      text-transform: uppercase;
    }

    .report-badge-rate {
      font-size: 9.5pt;
      color: #02451C;
      font-weight: 600;
    }

    /* ── Tables ── */
    .report-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 9pt;
      line-height: 1.35;
      margin-bottom: 4px;
    }

    .report-table th {
      background: #f1f5f9;
      color: #1e293b;
      font-weight: 700;
      font-size: 8.5pt;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      border-top: 1px solid #cbd5e1;
      border-bottom: 1.5px solid #94a3b8;
      border-left: 1px solid #e2e8f0;
      border-right: 1px solid #e2e8f0;
      padding: 5px 6px;
      vertical-align: middle;
    }

    .report-table td {
      border: 1px solid #e2e8f0;
      padding: 4.5px 6px;
      color: #1e293b;
      vertical-align: middle;
      font-size: 8.5pt;
    }

    .report-table tbody tr:nth-child(even) {
      background-color: #fbfcfe;
    }

    .report-total-row td {
      background-color: #f1f5f9 !important;
      font-weight: 700 !important;
      border-top: 1.5px solid #94a3b8 !important;
      border-bottom: 1.5px solid #94a3b8 !important;
      color: #0f172a !important;
    }

    .report-note-text {
      font-size: 7.5pt;
      color: #64748b;
      margin-top: 3px;
      line-height: 1.3;
      font-style: italic;
    }

    .report-empty-message {
      padding: 12px;
      text-align: center;
      color: #94a3b8;
      font-size: 8.5pt;
      font-style: italic;
    }

    /* ── Signatory & Official Footer ── */
    .report-footer-section {
      margin-top: 18px;
      padding-top: 10px;
    }

    .report-signatory-grid {
      display: flex;
      justify-content: space-between;
      gap: 30px;
      margin-bottom: 14px;
    }

    .report-signatory-block {
      flex: 1;
      max-width: 280px;
    }

    .report-signatory-label {
      font-size: 8.5pt;
      color: #475569;
      margin: 0 0 4px;
    }

    .report-signature-space {
      height: 38px;
      border-bottom: 1px solid #0f172a;
      margin-bottom: 4px;
    }

    .report-signatory-name {
      font-size: 9.5pt;
      font-weight: 700;
      color: #0f172a;
      margin: 0;
      line-height: 1.2;
    }

    .report-signatory-title {
      font-size: 8.5pt;
      color: #334155;
      margin: 1px 0 0;
      line-height: 1.2;
    }

    .report-signatory-office {
      font-size: 8pt;
      color: #64748b;
      margin: 1px 0 0;
      line-height: 1.2;
    }

    .report-document-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #e2e8f0;
      padding-top: 6px;
      font-size: 7.5pt;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* ── Page Break Controls ── */
    .report-keep-together {
      break-inside: avoid !important;
      page-break-inside: avoid !important;
    }

    /* ════════════════════════════════════════════════════════════════
       PRINT MEDIA RULES
       ════════════════════════════════════════════════════════════════ */
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        color-adjust: exact !important;
      }

      @page {
        size: ${sizeDefinition} ${orientation};
        margin: 12mm 15mm;
      }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
        width: 100% !important;
        font-family: Arial, Helvetica, sans-serif !important;
      }

      body * {
        visibility: hidden !important;
      }

      .report-preview-container,
      .report-preview-container * {
        visibility: visible !important;
      }

      .report-preview-container {
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #ffffff !important;
      }

      .report-sheet {
        box-shadow: none !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        max-width: none !important;
        border: none !important;
        border-radius: 0 !important;
      }

      /* Hide screen-only controls */
      aside,
      nav,
      header:not(.report-header),
      .analytics-screen-ui,
      .no-print,
      .no-print * {
        visibility: hidden !important;
        display: none !important;
        height: 0 !important;
        width: 0 !important;
        overflow: hidden !important;
      }

      /* Repeating Table Headers & Row Avoid Break */
      thead {
        display: table-header-group !important;
      }

      tfoot {
        display: table-footer-group !important;
      }

      tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      .report-table {
        page-break-inside: auto !important;
      }

      .report-keep-together {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
    }
  `;
}
