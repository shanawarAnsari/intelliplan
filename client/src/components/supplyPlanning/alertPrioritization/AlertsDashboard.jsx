import React from "react";
import { Box, Typography, Chip, Grid, Paper } from "@mui/material";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

const ACCENT = "#F97316";

const mockAlerts = [
  { id: "AL-001", sku: "KC-7734", site: "Chicago DC", type: "Stockout Risk", severity: "Critical", days: 3 },
  { id: "AL-002", sku: "HT-2281", site: "Dallas DC", type: "Overstock", severity: "High", days: 12 },
  { id: "AL-003", sku: "SC-4490", site: "Atlanta DC", type: "Demand Spike", severity: "Medium", days: 7 },
  { id: "AL-004", sku: "KC-1102", site: "Seattle DC", type: "Stockout Risk", severity: "Critical", days: 1 },
  { id: "AL-005", sku: "HT-8823", site: "Miami DC", type: "Lead Time Breach", severity: "Low", days: 20 },
];

const severityColor = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Box sx={{ flex: "1 1 160px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))", p: 3, display: "flex", flexDirection: "column", gap: 1 }}>
    <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: `${color}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Icon sx={{ fontSize: 20, color }} />
    </Box>
    <Typography sx={{ fontWeight: 900, fontSize: "1.8rem", color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.75rem", opacity: 0.5 }}>{label}</Typography>
  </Box>
);

const AlertsDashboard = () => (
  <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: "#04111e", minHeight: "100%", color: "#fff" }}>
    <Box sx={{ mb: 4 }}>
      <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-0.5px", mb: 0.5 }}>Alerts Dashboard</Typography>
      <Typography sx={{ opacity: 0.45, fontSize: "0.85rem" }}>Real-time supply chain alert monitoring across all distribution centres</Typography>
    </Box>

    {/* Stat cards */}
    <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mb: 5 }}>
      <StatCard icon={NotificationsActiveRoundedIcon} label="Total Alerts" value="24" color={ACCENT} />
      <StatCard icon={WarningAmberRoundedIcon} label="Critical" value="6" color="#ef4444" />
      <StatCard icon={TrendingDownRoundedIcon} label="Stockout Risks" value="9" color="#f97316" />
      <StatCard icon={CheckCircleOutlineRoundedIcon} label="Resolved Today" value="11" color="#22c55e" />
    </Box>

    {/* Alert table */}
    <Box sx={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
      <Box sx={{ px: 3, py: 2, borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", gap: 1 }}>
        <NotificationsActiveRoundedIcon sx={{ color: ACCENT, fontSize: 18 }} />
        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>Active Alerts</Typography>
      </Box>
      {mockAlerts.map((alert, i) => (
        <Box
          key={alert.id}
          sx={{ px: 3, py: 2, display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", borderBottom: i < mockAlerts.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent", "&:hover": { background: "rgba(255,255,255,0.04)" }, transition: "background 0.15s ease" }}
        >
          <Typography sx={{ fontFamily: "monospace", fontSize: "0.78rem", opacity: 0.5, minWidth: 60 }}>{alert.id}</Typography>
          <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", minWidth: 80 }}>{alert.sku}</Typography>
          <Typography sx={{ fontSize: "0.8rem", opacity: 0.6, flex: 1, minWidth: 120 }}>{alert.site}</Typography>
          <Typography sx={{ fontSize: "0.79rem", opacity: 0.6, minWidth: 120 }}>{alert.type}</Typography>
          <Chip label={alert.severity} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, color: severityColor[alert.severity], bgcolor: `${severityColor[alert.severity]}18`, border: `1px solid ${severityColor[alert.severity]}40` }} />
          <Typography sx={{ fontSize: "0.75rem", opacity: 0.45, minWidth: 70, textAlign: "right" }}>in {alert.days}d</Typography>
        </Box>
      ))}
    </Box>
  </Box>
);

export default AlertsDashboard;
