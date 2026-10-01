import React from "react";
import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// ─── Import TPC Header Image ──────────────────────────────────────────────────
// Vite handles this import and provides a URL/data URI at build/runtime
import tpcHeaderSrc from "../../assets/tpc header.jpg";

// ─── Paper Size Definitions (pt units: 1pt = 1/72 in) ────────────────────────
const PAPER_SIZES = {
  A4:     { width: 595.28, height: 841.89 },
  Letter: { width: 612,    height: 792   },
  Long:   { width: 612,    height: 936   }, // 8.5 × 13 in
  Legal:  { width: 612,    height: 1008  }, // 8.5 × 14 in
};

// ─── Color Palette ────────────────────────────────────────────────────────────
const C = {
  green:     "#02451C",
  dark:      "#0f172a",
  mid:       "#1e293b",
  sub:       "#334155",
  muted:     "#475569",
  faint:     "#64748b",
  border:    "#cbd5e1",
  borderMid: "#94a3b8",
  bgRow:     "#f8fafc",
  bgHeader:  "#f1f5f9",
  bgMeta:    "#f8fafc",
  white:     "#ffffff",
  red:       "#b91c1c",
};

// ─── Base margin (mm → pt: 1mm ≈ 2.835pt) ────────────────────────────────────
const MM = 2.835;
const PAGE_MARGIN_H = 11 * MM; // ~31pt
const PAGE_MARGIN_V = 10 * MM; // ~28pt

// ─── Stylesheet ───────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: C.dark,
    paddingHorizontal: PAGE_MARGIN_H,
    paddingVertical: PAGE_MARGIN_V,
    backgroundColor: C.white,
  },

  // ── TPC Header ────────────────────────────────────────────────────────────
  headerContainer: {
    borderBottomWidth: 2,
    borderBottomColor: C.green,
    borderBottomStyle: "solid",
    paddingBottom: 6,
    marginBottom: 8,
  },
  headerImage: {
    width: "100%",
    objectFit: "contain",
    marginBottom: 5,
  },
  reportTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: C.green,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    lineHeight: 1.2,
  },
  reportSubtitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: C.muted,
    textAlign: "center",
    marginTop: 2,
    lineHeight: 1.25,
  },

  // ── Metadata Bar ──────────────────────────────────────────────────────────
  metaBar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    backgroundColor: C.bgMeta,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderStyle: "solid",
    borderRadius: 3,
    padding: "4 8",
    marginBottom: 8,
    fontSize: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 8,
    marginBottom: 1,
  },
  metaLabel: {
    color: C.faint,
    fontFamily: "Helvetica-Bold",
    marginRight: 3,
  },
  metaValue: {
    color: C.dark,
    fontFamily: "Helvetica-Bold",
  },

  // ── Sections ──────────────────────────────────────────────────────────────
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: C.green,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottomWidth: 1.5,
    borderBottomColor: C.border,
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 1.5,
    borderBottomColor: C.border,
    borderBottomStyle: "solid",
    paddingBottom: 2,
    marginBottom: 4,
  },
  alignmentBadge: {
    fontSize: 8,
    color: C.green,
    fontFamily: "Helvetica-Bold",
  },

  // ── KPI Summary Row ───────────────────────────────────────────────────────
  kpiRow: {
    flexDirection: "row",
    marginBottom: 3,
    borderWidth: 1,
    borderColor: C.border,
    borderStyle: "solid",
    borderRadius: 2,
  },
  kpiCell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: "4 4",
    borderRightWidth: 1,
    borderRightColor: C.border,
    borderRightStyle: "solid",
  },
  kpiCellLast: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: "4 4",
  },
  kpiCellHeader: {
    backgroundColor: C.bgHeader,
    borderBottomWidth: 1,
    borderBottomColor: C.borderMid,
    borderBottomStyle: "solid",
  },
  kpiHeaderText: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.mid,
    textTransform: "uppercase",
    textAlign: "center",
    letterSpacing: 0.3,
  },
  kpiValueText: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    textAlign: "center",
  },
  kpiValueGreen: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.green,
    textAlign: "center",
  },
  kpiValueMuted: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.faint,
    textAlign: "center",
  },
  kpiValueRed: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: C.red,
    textAlign: "center",
  },
  noteText: {
    fontSize: 7,
    color: C.faint,
    fontStyle: "italic",
    marginTop: 2,
    lineHeight: 1.25,
  },

  // ── Tables ────────────────────────────────────────────────────────────────
  table: {
    width: "100%",
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    borderBottomStyle: "solid",
  },
  tableRowEven: {
    backgroundColor: "#fafcfe",
  },
  tableRowTotal: {
    backgroundColor: C.bgHeader,
    borderTopWidth: 1.5,
    borderTopColor: C.borderMid,
    borderTopStyle: "solid",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.bgHeader,
    borderTopWidth: 1,
    borderTopColor: C.border,
    borderTopStyle: "solid",
    borderBottomWidth: 1.5,
    borderBottomColor: C.borderMid,
    borderBottomStyle: "solid",
  },
  thCell: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: C.mid,
    textTransform: "uppercase",
    letterSpacing: 0.3,
    padding: "3 5",
  },
  tdCell: {
    fontSize: 8.5,
    color: C.mid,
    padding: "3 5",
  },
  tdBold: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
    padding: "3 5",
  },
  tdGreen: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.green,
    padding: "3 5",
    textAlign: "center",
  },
  tdRed: {
    fontSize: 8.5,
    color: C.red,
    padding: "3 5",
    textAlign: "center",
  },
  tdMuted: {
    fontSize: 8.5,
    color: C.faint,
    padding: "3 5",
    textAlign: "center",
  },

  // ── Signatory ─────────────────────────────────────────────────────────────
  signatorySection: {
    marginTop: 10,
    paddingTop: 4,
  },
  signatoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  signatoryBlock: {
    width: "45%",
  },
  signatoryLabel: {
    fontSize: 7.5,
    color: C.muted,
    marginBottom: 1,
  },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: C.dark,
    borderBottomStyle: "solid",
    marginBottom: 3,
    height: 24,
  },
  signatoryName: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: C.dark,
  },
  signatoryTitle: {
    fontSize: 8,
    color: C.sub,
    marginTop: 1,
  },
});

// ─── Helper: Format number with commas ────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString("en-US");
const pct = (val, total) => {
  if (!total || total <= 0) return "0.0%";
  return `${((val / total) * 100).toFixed(1)}%`;
};

// ─── TPC Header (appears on every page via fixed layout) ──────────────────────
function TPCHeader({ title, subtitle }) {
  return (
    <View style={S.headerContainer} fixed>
      <Image src={tpcHeaderSrc} style={S.headerImage} />
      <Text style={S.reportTitle}>{title}</Text>
      {subtitle ? <Text style={S.reportSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

// ─── Metadata Bar ─────────────────────────────────────────────────────────────
function MetadataBar({ departmentLabel, batchLabel, reportTypeLabel, generatedAt }) {
  return (
    <View style={S.metaBar}>
      <View style={S.metaItem}>
        <Text style={S.metaLabel}>Department Scope:</Text>
        <Text style={S.metaValue}>{departmentLabel}</Text>
      </View>
      <View style={S.metaItem}>
        <Text style={S.metaLabel}>Graduation Cohort:</Text>
        <Text style={S.metaValue}>{batchLabel}</Text>
      </View>
      {reportTypeLabel ? (
        <View style={S.metaItem}>
          <Text style={S.metaLabel}>Report Type:</Text>
          <Text style={S.metaValue}>{reportTypeLabel}</Text>
        </View>
      ) : null}
      <View style={S.metaItem}>
        <Text style={S.metaLabel}>Classification:</Text>
        <Text style={S.metaValue}>Official Academic Report</Text>
      </View>
      <View style={S.metaItem}>
        <Text style={S.metaLabel}>Date Generated:</Text>
        <Text style={S.metaValue}>{generatedAt}</Text>
      </View>
    </View>
  );
}

// ─── Executive Summary Section ────────────────────────────────────────────────
function ExecutiveSummarySection({ overview }) {
  const {
    totalGraduates = 0,
    regAlumni = 0,
    unregGraduates = 0,
    regCoveragePct = "0.0",
    employed = 0,
    selfEmployed = 0,
    unemployed = 0,
    notSpecified = 0,
    employmentRatePct = "0.0",
    alignmentRatePct = "0.0",
  } = overview;

  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>1. Executive Summary</Text>

      {/* Registration KPIs */}
      <View style={S.kpiRow}>
        {[
          { label: "Total Graduates", val: fmt(totalGraduates), style: "value" },
          { label: "Registered Alumni", val: fmt(regAlumni), style: "green" },
          { label: "Unregistered Graduates", val: fmt(unregGraduates), style: "muted" },
          { label: "Registration Coverage", val: `${regCoveragePct}%`, style: "green", last: true },
        ].map((item, i) => (
          <View key={i} style={[item.last ? S.kpiCellLast : S.kpiCell]}>
            <View style={[S.kpiCellHeader, { width: "100%" }]}>
              <Text style={S.kpiHeaderText}>{item.label}</Text>
            </View>
            <Text
              style={
                item.style === "green"
                  ? S.kpiValueGreen
                  : item.style === "muted"
                  ? S.kpiValueMuted
                  : S.kpiValueText
              }
            >
              {item.val}
            </Text>
          </View>
        ))}
      </View>

      {/* Employment KPIs */}
      <View style={[S.kpiRow, { marginBottom: 2 }]}>
        {[
          { label: "Employed", val: fmt(employed), style: "value" },
          { label: "Self-Employed", val: fmt(selfEmployed), style: "value" },
          { label: "Unemployed", val: fmt(unemployed), style: "red" },
          { label: "Not Specified", val: fmt(notSpecified), style: "muted" },
          { label: "Employment Rate", val: `${employmentRatePct}%`, style: "green" },
          { label: "Alignment Rate", val: `${alignmentRatePct}%`, style: "green", last: true },
        ].map((item, i) => (
          <View key={i} style={[item.last ? S.kpiCellLast : S.kpiCell]}>
            <View style={[S.kpiCellHeader, { width: "100%" }]}>
              <Text style={S.kpiHeaderText}>{item.label}</Text>
            </View>
            <Text
              style={
                item.style === "green"
                  ? S.kpiValueGreen
                  : item.style === "red"
                  ? S.kpiValueRed
                  : item.style === "muted"
                  ? S.kpiValueMuted
                  : S.kpiValueText
              }
            >
              {item.val}
            </Text>
          </View>
        ))}
      </View>
      <Text style={S.noteText}>
        * Employment Rate = (Employed + Self-Employed) / (Employed + Self-Employed + Unemployed) × 100 | Alignment Rate = Aligned / (Aligned + Not Aligned) × 100
      </Text>
    </View>
  );
}

// ─── Employment Status Section ────────────────────────────────────────────────
function EmploymentStatusSection({ employed = 0, selfEmployed = 0, unemployed = 0, notSpecified = 0, registeredAlumni = 0 }) {
  const rows = [
    { label: "Employed (Full-time / Part-time)", count: employed },
    { label: "Self-Employed (Freelance / Business)", count: selfEmployed },
    { label: "Unemployed (Actively Seeking / In Transition)", count: unemployed },
    { label: "Not Specified (Unreported Employment Status)", count: notSpecified },
  ];

  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>2. Employment Status Distribution</Text>
      <View style={S.table}>
        <View style={S.tableHeader}>
          <Text style={[S.thCell, { flex: 5, textAlign: "left" }]}>Employment Status Classification</Text>
          <Text style={[S.thCell, { flex: 2, textAlign: "center" }]}>Headcount</Text>
          <Text style={[S.thCell, { flex: 2.5, textAlign: "center" }]}>% of Registered Alumni</Text>
        </View>
        {rows.map((row, i) => (
          <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowEven : {}]}>
            <Text style={[S.tdCell, { flex: 5 }]}>{row.label}</Text>
            <Text style={[S.tdCell, { flex: 2, textAlign: "center" }]}>{fmt(row.count)}</Text>
            <Text style={[S.tdCell, { flex: 2.5, textAlign: "center" }]}>{pct(row.count, registeredAlumni)}</Text>
          </View>
        ))}
        <View style={[S.tableRow, S.tableRowTotal]}>
          <Text style={[S.tdBold, { flex: 5 }]}>Total Registered Alumni</Text>
          <Text style={[S.tdBold, { flex: 2, textAlign: "center" }]}>{fmt(registeredAlumni)}</Text>
          <Text style={[S.tdBold, { flex: 2.5, textAlign: "center" }]}>100.0%</Text>
        </View>
      </View>
      <Text style={S.noteText}>
        * Percentages calculated relative to total registered alumni cohort ({fmt(registeredAlumni)} alumni).
      </Text>
    </View>
  );
}

// ─── Job–Course Alignment Section ─────────────────────────────────────────────
function JobAlignmentSection({ aligned = 0, notAligned = 0, pending = 0, totalEmployed = 0, alignmentRatePct = "0.0" }) {
  const rows = [
    { label: "Aligned (Work directly aligns with college degree / field)", count: aligned },
    { label: "Not Aligned (Work does not directly align with degree)", count: notAligned },
    { label: "Pending Alignment Response (Employed; pending confirmation)", count: pending },
  ];
  const declaredCount = aligned + notAligned;

  return (
    <View style={S.section}>
      <View style={S.sectionTitleRow}>
        <Text style={[S.sectionTitle, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>3. Job–Course Alignment Analysis</Text>
        <Text style={S.alignmentBadge}>Alignment Rate: {alignmentRatePct}%</Text>
      </View>
      <View style={S.table}>
        <View style={S.tableHeader}>
          <Text style={[S.thCell, { flex: 5, textAlign: "left" }]}>Alignment Classification</Text>
          <Text style={[S.thCell, { flex: 2, textAlign: "center" }]}>Headcount</Text>
          <Text style={[S.thCell, { flex: 2.5, textAlign: "center" }]}>% of Total Employed</Text>
        </View>
        {rows.map((row, i) => (
          <View key={i} style={[S.tableRow, i % 2 === 1 ? S.tableRowEven : {}]}>
            <Text style={[S.tdCell, { flex: 5 }]}>{row.label}</Text>
            <Text style={[S.tdCell, { flex: 2, textAlign: "center" }]}>{fmt(row.count)}</Text>
            <Text style={[S.tdCell, { flex: 2.5, textAlign: "center" }]}>{pct(row.count, totalEmployed)}</Text>
          </View>
        ))}
        <View style={[S.tableRow, S.tableRowTotal]}>
          <Text style={[S.tdBold, { flex: 5 }]}>Total Employed / Working Alumni Cohort</Text>
          <Text style={[S.tdBold, { flex: 2, textAlign: "center" }]}>{fmt(totalEmployed)}</Text>
          <Text style={[S.tdBold, { flex: 2.5, textAlign: "center" }]}>100.0%</Text>
        </View>
      </View>
      <Text style={S.noteText}>
        * Alignment Rate ({alignmentRatePct}%) evaluated among {fmt(declaredCount)} declared alumni: Aligned / (Aligned + Not Aligned) × 100.
      </Text>
    </View>
  );
}

// ─── Graduation Cohort Distribution Section ────────────────────────────────────
function CohortSection({ graduatesByYear = {}, totalGraduates = 0, sectionNumber = 4 }) {
  const entries = Object.entries(graduatesByYear || {}).sort((a, b) => Number(b[0]) - Number(a[0]));
  if (entries.length === 0) return null;

  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>{sectionNumber}. Graduation Cohort Distribution</Text>
      <View style={S.table}>
        <View style={S.tableHeader}>
          <Text style={[S.thCell, { flex: 4, textAlign: "left" }]}>Graduation Batch Year</Text>
          <Text style={[S.thCell, { flex: 3, textAlign: "center" }]}>Recorded Graduates</Text>
          <Text style={[S.thCell, { flex: 3, textAlign: "center" }]}>Percentage</Text>
        </View>
        {entries.map(([year, count], i) => {
          const n = Number(count || 0);
          return (
            <View key={year} style={[S.tableRow, i % 2 === 1 ? S.tableRowEven : {}]}>
              <Text style={[S.tdCell, { flex: 4 }]}>Batch {year}</Text>
              <Text style={[S.tdCell, { flex: 3, textAlign: "center" }]}>{fmt(n)}</Text>
              <Text style={[S.tdCell, { flex: 3, textAlign: "center" }]}>{pct(n, totalGraduates)}</Text>
            </View>
          );
        })}
        <View style={[S.tableRow, S.tableRowTotal]}>
          <Text style={[S.tdBold, { flex: 4 }]}>Total Across All Cohorts</Text>
          <Text style={[S.tdBold, { flex: 3, textAlign: "center" }]}>{fmt(totalGraduates)}</Text>
          <Text style={[S.tdBold, { flex: 3, textAlign: "center" }]}>100.0%</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Departmental Comparison Section (President All-Depts) ────────────────────
function DeptComparisonSection({ rows = [], isLandscape = false }) {
  if (!rows || rows.length === 0) return null;

  const totals = rows.reduce(
    (acc, r) => {
      acc.total_graduates += Number(r.total_graduates || 0);
      acc.registered += Number(r.registered || 0);
      acc.not_registered += Number(r.not_registered || 0);
      acc.employed += Number(r.employed || 0);
      acc.self_employed += Number(r.self_employed || 0);
      acc.unemployed += Number(r.unemployed || 0);
      acc.not_specified += Number(r.not_specified || 0);
      acc.aligned += Number(r.aligned || 0);
      acc.not_aligned += Number(r.not_aligned || 0);
      acc.pending += Number(r.no_response || 0);
      return acc;
    },
    { total_graduates: 0, registered: 0, not_registered: 0, employed: 0, self_employed: 0, unemployed: 0, not_specified: 0, aligned: 0, not_aligned: 0, pending: 0 }
  );

  const totalDeclared = totals.employed + totals.self_employed + totals.unemployed;
  const totalWorking = totals.employed + totals.self_employed;
  const overallEmpRate = totalDeclared > 0 ? `${((totalWorking / totalDeclared) * 100).toFixed(1)}%` : "0.0%";
  const totalAlignDecl = totals.aligned + totals.not_aligned;
  const overallAlignRate = totalAlignDecl > 0 ? `${((totals.aligned / totalAlignDecl) * 100).toFixed(1)}%` : "0.0%";
  const overallCoverage = totals.total_graduates > 0 ? `${((totals.registered / totals.total_graduates) * 100).toFixed(1)}%` : "0.0%";

  // Column width ratios - portrait vs landscape
  const deptW = isLandscape ? 0.20 : 0.25;
  const numW  = isLandscape ? 0.068 : 0.083;
  const rateW = isLandscape ? 0.075 : 0.083;

  return (
    <View style={S.section}>
      <View style={S.sectionTitleRow}>
        <Text style={[S.sectionTitle, { borderBottomWidth: 0, marginBottom: 0, paddingBottom: 0 }]}>
          4. Departmental Comparative Performance
        </Text>
        <Text style={[S.noteText, { fontStyle: "normal" }]}>{rows.length} Academic Program{rows.length !== 1 ? "s" : ""} Monitored</Text>
      </View>
      <View style={S.table}>
        <View style={S.tableHeader} wrap={false}>
          <Text style={[S.thCell, { flex: 0, width: `${deptW * 100}%`, textAlign: "left" }]}>Department / Program</Text>
          <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Grads</Text>
          <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Reg.</Text>
          <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Unreg.</Text>
          <Text style={[S.thCell, { flex: 0, width: `${rateW * 100}%`, textAlign: "center" }]}>Coverage</Text>
          <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Emp.</Text>
          {isLandscape && <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Self-Emp</Text>}
          <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Unemp.</Text>
          {isLandscape && <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Not Spec</Text>}
          <Text style={[S.thCell, { flex: 0, width: `${rateW * 100}%`, textAlign: "center" }]}>Emp. Rate</Text>
          <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Aligned</Text>
          <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Not Al.</Text>
          {isLandscape && <Text style={[S.thCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>Pending</Text>}
          <Text style={[S.thCell, { flex: 0, width: `${rateW * 100}%`, textAlign: "center" }]}>Align. Rate</Text>
        </View>

        {rows.map((row, i) => {
          const deptName = row.department?.name || `Dept ${row.department_id}`;
          const tg = Number(row.total_graduates || 0);
          const reg = Number(row.registered || 0);
          const unreg = Number(row.not_registered || 0);
          const emp = Number(row.employed || 0);
          const self = Number(row.self_employed || 0);
          const unemp = Number(row.unemployed || 0);
          const notSpec = Number(row.not_specified || 0);
          const aligned = Number(row.aligned || 0);
          const notAligned = Number(row.not_aligned || 0);
          const pending = Number(row.no_response || 0);
          const cov = row.registration_coverage !== undefined ? `${Number(row.registration_coverage).toFixed(1)}%` : tg > 0 ? `${((reg / tg) * 100).toFixed(1)}%` : "0.0%";
          const empRate = row.employment_rate !== undefined ? `${Number(row.employment_rate).toFixed(1)}%` : "0.0%";
          const alignRate = row.alignment_rate !== undefined ? `${Number(row.alignment_rate).toFixed(1)}%` : "0.0%";

          return (
            <View key={row.department_id || i} style={[S.tableRow, i % 2 === 1 ? S.tableRowEven : {}]} wrap={false}>
              <Text style={[S.tdCell, { flex: 0, width: `${deptW * 100}%` }]}>{deptName}</Text>
              <Text style={[S.tdCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(tg)}</Text>
              <Text style={[S.tdCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(reg)}</Text>
              <Text style={[S.tdMuted, { flex: 0, width: `${numW * 100}%` }]}>{fmt(unreg)}</Text>
              <Text style={[S.tdCell, { flex: 0, width: `${rateW * 100}%`, textAlign: "center" }]}>{cov}</Text>
              <Text style={[S.tdCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(emp)}</Text>
              {isLandscape && <Text style={[S.tdCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(self)}</Text>}
              <Text style={[S.tdCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(unemp)}</Text>
              {isLandscape && <Text style={[S.tdMuted, { flex: 0, width: `${numW * 100}%` }]}>{fmt(notSpec)}</Text>}
              <Text style={[S.tdGreen, { flex: 0, width: `${rateW * 100}%` }]}>{empRate}</Text>
              <Text style={[S.tdCell, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(aligned)}</Text>
              <Text style={[S.tdRed, { flex: 0, width: `${numW * 100}%` }]}>{fmt(notAligned)}</Text>
              {isLandscape && <Text style={[S.tdMuted, { flex: 0, width: `${numW * 100}%` }]}>{fmt(pending)}</Text>}
              <Text style={[S.tdGreen, { flex: 0, width: `${rateW * 100}%` }]}>{alignRate}</Text>
            </View>
          );
        })}

        <View style={[S.tableRow, S.tableRowTotal]} wrap={false}>
          <Text style={[S.tdBold, { flex: 0, width: `${deptW * 100}%` }]}>Institutional Total / Overall Avg</Text>
          <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.total_graduates)}</Text>
          <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.registered)}</Text>
          <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.not_registered)}</Text>
          <Text style={[S.tdGreen, { flex: 0, width: `${rateW * 100}%`, fontFamily: "Helvetica-Bold" }]}>{overallCoverage}</Text>
          <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.employed)}</Text>
          {isLandscape && <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.self_employed)}</Text>}
          <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.unemployed)}</Text>
          {isLandscape && <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.not_specified)}</Text>}
          <Text style={[S.tdGreen, { flex: 0, width: `${rateW * 100}%`, fontFamily: "Helvetica-Bold" }]}>{overallEmpRate}</Text>
          <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.aligned)}</Text>
          <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.not_aligned)}</Text>
          {isLandscape && <Text style={[S.tdBold, { flex: 0, width: `${numW * 100}%`, textAlign: "center" }]}>{fmt(totals.pending)}</Text>}
          <Text style={[S.tdGreen, { flex: 0, width: `${rateW * 100}%`, fontFamily: "Helvetica-Bold" }]}>{overallAlignRate}</Text>
        </View>
      </View>
      <Text style={S.noteText}>
        * Multi-department comparative metrics reflect institutional database snapshots within the selected graduation scope.
      </Text>
    </View>
  );
}

// ─── Detailed Alumni Roster Section ───────────────────────────────────────────
function DetailedAlumniSection({ alumniList = [] }) {
  if (!alumniList || alumniList.length === 0) {
    return (
      <View style={S.section}>
        <Text style={S.sectionTitle}>Alumni Roster</Text>
        <Text style={[S.noteText, { textAlign: "center", padding: 12 }]}>No alumni records found for selected scope.</Text>
      </View>
    );
  }

  return (
    <View style={S.section}>
      <Text style={S.sectionTitle}>Detailed Alumni Roster ({alumniList.length} Records)</Text>
      <View style={S.table}>
        <View style={S.tableHeader} fixed>
          <Text style={[S.thCell, { flex: 0, width: "4%", textAlign: "center" }]}>#</Text>
          <Text style={[S.thCell, { flex: 0, width: "22%", textAlign: "left" }]}>Full Name</Text>
          <Text style={[S.thCell, { flex: 0, width: "10%", textAlign: "center" }]}>Batch</Text>
          <Text style={[S.thCell, { flex: 0, width: "18%", textAlign: "left" }]}>Program</Text>
          <Text style={[S.thCell, { flex: 0, width: "13%", textAlign: "center" }]}>Employment</Text>
          <Text style={[S.thCell, { flex: 0, width: "13%", textAlign: "center" }]}>Alignment</Text>
          <Text style={[S.thCell, { flex: 0, width: "20%", textAlign: "left" }]}>Current Employer / Position</Text>
        </View>
        {alumniList.map((alum, i) => {
          const fullName = `${alum.last_name || ""}, ${alum.first_name || ""} ${alum.middle_name || ""}`.trim();
          const program = alum.course || alum.program || alum.department?.name || "";
          const empStatus = alum.employment_status || "Not Specified";
          const alignment = alum.job_alignment || alum.alignment || "Pending";
          const employer = alum.employer || alum.company || "";
          const position = alum.job_title || alum.position || "";
          const employerText = [employer, position].filter(Boolean).join(" / ") || "—";

          return (
            <View key={alum.id || i} style={[S.tableRow, i % 2 === 1 ? S.tableRowEven : {}]} wrap={false}>
              <Text style={[S.tdCell, { flex: 0, width: "4%", textAlign: "center" }]}>{i + 1}</Text>
              <Text style={[S.tdCell, { flex: 0, width: "22%" }]}>{fullName || "—"}</Text>
              <Text style={[S.tdCell, { flex: 0, width: "10%", textAlign: "center" }]}>{alum.batch_year || alum.graduation_year || "—"}</Text>
              <Text style={[S.tdCell, { flex: 0, width: "18%" }]}>{program || "—"}</Text>
              <Text style={[S.tdCell, { flex: 0, width: "13%", textAlign: "center" }]}>{empStatus}</Text>
              <Text style={[S.tdCell, { flex: 0, width: "13%", textAlign: "center" }]}>{alignment}</Text>
              <Text style={[S.tdCell, { flex: 0, width: "20%" }]}>{employerText}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── President Signatory (single column: Alumni President) ────────────────────
function PresidentSignatory({ presidentName }) {
  const name = presidentName || "Alumni President";
  return (
    <View style={S.signatorySection}>
      <View style={S.signatoryRow}>
        <View style={S.signatoryBlock}>
          <Text style={S.signatoryLabel}>Prepared and Certified by:</Text>
          <View style={S.signatureLine} />
          <Text style={S.signatoryName}>{name}</Text>
          <Text style={S.signatoryTitle}>Alumni President</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Department Head Signatory (two columns) ───────────────────────────────────
function DeptHeadSignatory({ deptHeadName, presidentName }) {
  const headName = deptHeadName || "Department Head";
  const presName = presidentName || "Alumni President";
  return (
    <View style={S.signatorySection}>
      <View style={S.signatoryRow}>
        {/* Left: Department Head */}
        <View style={S.signatoryBlock}>
          <Text style={S.signatoryLabel}>Prepared by:</Text>
          <View style={S.signatureLine} />
          <Text style={S.signatoryName}>{headName}</Text>
          <Text style={S.signatoryTitle}>Department Head</Text>
        </View>

        {/* Right: Alumni President */}
        <View style={S.signatoryBlock}>
          <Text style={S.signatoryLabel}>Certified by:</Text>
          <View style={S.signatureLine} />
          <Text style={S.signatoryName}>{presName}</Text>
          <Text style={S.signatoryTitle}>Alumni President</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main PDF Document Export ─────────────────────────────────────────────────
/**
 * ReportPDFDocument
 *
 * Authoritative @react-pdf/renderer document for both President and Department Head reports.
 * - No HTML/window.print() involved
 * - TPC header repeats on every page via `fixed` prop
 * - Clean PDF output with no browser markings
 * - Supports A4, Letter, Long Bond, US Legal × Portrait, Landscape
 *
 * Props:
 *   role          "president" | "deptHead"
 *   overview      Reconciled KPI object from PrintableReport
 *   departmentLabel  String
 *   batchLabel       String
 *   generatedAt      String (human-readable date)
 *   alignmentRows    Array (for Dept Comparison)
 *   reportType       "summary" | "detailed"
 *   alumniList       Array (for detailed roster)
 *   preparedByName   String (authenticated user name)
 *   alumniPresidentName  String (Alumni President's actual name)
 *   paperSize        "A4" | "Letter" | "Long" | "Legal"
 *   orientation      "portrait" | "landscape"
 *   graduatesByYear  Object
 *   filters          { department, batch }
 */
export default function ReportPDFDocument({
  role = "president",
  overview = {},
  departmentLabel = "All Departments",
  batchLabel = "All Batches",
  generatedAt = "",
  alignmentRows = [],
  reportType = "summary",
  alumniList = [],
  preparedByName = "",
  alumniPresidentName = "",
  paperSize = "A4",
  orientation = "portrait",
  graduatesByYear = {},
  filters = {},
}) {
  const isDeptHead = role === "deptHead";
  const isAllDepts = !filters?.department || filters.department === "";
  const isAllBatches = !filters?.batch || filters.batch === "" || filters.batch === "all" || batchLabel === "All Batches";

  const paperDims = PAPER_SIZES[paperSize] || PAPER_SIZES.A4;
  const pageSize = orientation === "landscape"
    ? { width: paperDims.height, height: paperDims.width }
    : { width: paperDims.width, height: paperDims.height };

  const title = isDeptHead
    ? "TPC DEPARTMENT ALUMNI TRACKING AND EMPLOYMENT REPORT"
    : "TPC ALUMNI TRACKING AND EMPLOYMENT REPORT";

  const subtitle = isDeptHead
    ? `Department Alumni Monitoring Summary — ${departmentLabel}`
    : isAllDepts
    ? "Institutional Alumni Monitoring Summary"
    : `Department Alumni Monitoring Summary — ${departmentLabel}`;

  const reportTypeLabel = reportType === "detailed" ? "Detailed Alumni Roster" : isDeptHead ? "Department Summary" : "Institutional Summary";

  // Resolve signatories
  // presidentName = alumniPresidentName prop (actual Alumni President)
  // preparedByName = authenticated user (Dept Head name or Alumni President name for president role)
  const resolvedPresidentName = alumniPresidentName || preparedByName || "Alumni President";
  const resolvedDeptHeadName = isDeptHead ? (preparedByName || "Department Head") : "";

  return (
    <Document
      title={title}
      author="Talibon Polytechnic College"
      creator="TPC Alumni Management System"
      producer="TPC AMS"
    >
      <Page size={pageSize} style={S.page} wrap>
        {/* TPC Header — fixed at top of every page */}
        <TPCHeader title={title} subtitle={subtitle} />

        {/* Metadata */}
        <MetadataBar
          departmentLabel={departmentLabel}
          batchLabel={batchLabel}
          reportTypeLabel={reportTypeLabel}
          generatedAt={generatedAt}
        />

        {reportType === "summary" ? (
          <>
            {/* 1. Executive Summary */}
            <ExecutiveSummarySection overview={overview} />

            {/* 2. Employment Status Distribution */}
            <EmploymentStatusSection
              employed={overview.employed}
              selfEmployed={overview.selfEmployed}
              unemployed={overview.unemployed}
              notSpecified={overview.notSpecified}
              registeredAlumni={overview.regAlumni}
            />

            {/* 3. Job–Course Alignment */}
            <JobAlignmentSection
              aligned={overview.aligned}
              notAligned={overview.notAligned}
              pending={overview.pending}
              totalEmployed={overview.workingTotal}
              alignmentRatePct={overview.alignmentRatePct}
            />

            {/* 4. Conditional sections */}
            {isDeptHead ? (
              // Dept Head: show cohort only when All Batches
              isAllBatches ? (
                <CohortSection
                  graduatesByYear={graduatesByYear}
                  totalGraduates={overview.totalGraduates}
                  sectionNumber={4}
                />
              ) : null
            ) : isAllDepts ? (
              // President All-Depts: Departmental Comparison
              <DeptComparisonSection
                rows={alignmentRows}
                isLandscape={orientation === "landscape"}
              />
            ) : isAllBatches ? (
              // President Single-Dept + All Batches: Cohort Distribution
              <CohortSection
                graduatesByYear={graduatesByYear}
                totalGraduates={overview.totalGraduates}
                sectionNumber={4}
              />
            ) : null /* President Single-Dept + Single Batch: no section 4 */}

            {/* Signatory */}
            {isDeptHead ? (
              <DeptHeadSignatory
                deptHeadName={resolvedDeptHeadName}
                presidentName={resolvedPresidentName}
              />
            ) : (
              <PresidentSignatory presidentName={resolvedPresidentName} />
            )}
          </>
        ) : (
          /* Detailed Alumni Roster */
          <>
            <DetailedAlumniSection alumniList={alumniList} />
            {isDeptHead ? (
              <DeptHeadSignatory
                deptHeadName={resolvedDeptHeadName}
                presidentName={resolvedPresidentName}
              />
            ) : (
              <PresidentSignatory presidentName={resolvedPresidentName} />
            )}
          </>
        )}
      </Page>
    </Document>
  );
}
