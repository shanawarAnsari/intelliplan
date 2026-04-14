import React, { useState } from "react";
import { Box, Typography, Chip, Button, TextField, InputAdornment } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

const ACCENT = "#F97316";

const initialAlerts = [
  { id: "AL-001", sku: "KC-7734", site: "Chicago DC", type: "Stockout Risk", severity: "Critical", status: "Open", owner: "J. Smith" },
  { id: "AL-002", sku: "HT-2281", site: "Dallas DC", type: "Overstock", severity: "High", status: "In Review", owner: "A. Patel" },
  { id: "AL-003", sku: "SC-4490", site: "Atlanta DC", type: "Demand Spike", severity: "Medium", status: "Open", owner: "M. Chen" },
  { id: "AL-004", sku: "KC-1102", site: "Seattle DC", type: "Stockout Risk", severity: "Critical", status: "Escalated", owner: "L. Torres" },
  { id: "AL-005", sku: "HT-8823", site: "Miami DC", type: "Lead Time Breach", severity: "Low", status: "Resolved", owner: "K. Nguyen" },
  { id: "AL-006", sku: "SC-3310", site: "Phoenix DC", type: "Overstock", severity: "Medium", status: "Open", owner: "R. Williams" },
];

const severityColor = { Critical: "#ef4444", High: "#f97316", Medium: "#eab308", Low: "#22c55e" };
const statusColor = { Open: "#6AE3FF", "In Review": "#eab308", Escalated: "#ef4444", Resolved: "#22c55e" };

const AlertsManagement = () => {
  const [search, setSearch] = useState("");
  const filtered = initialAlerts.filter(
    (a) => a.sku.toLowerCase().includes(search.toLowerCase()) || a.site.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: "#04111e", minHeight: "100%", color: "#fff" }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-0.5px", mb: 0.5 }}>Alerts Management</Typography>
        <Typography sx={{ opacity: 0.45, fontSize: "0.85rem" }}>Manage, assign, and resolve supply chain alerts</Typography>
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          placeholder="Search by SKU, site, or type..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.35)" }} /></InputAdornment>,
            sx: { bgcolor: "rgba(255,255,255,0.05)", borderRadius: "10px", color: "#fff", fontSize: "0.82rem", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "rgba(255,255,255,0.25)" } },
          }}
          sx={{ flex: "1 1 260px", maxWidth: 380 }}
        />
        <Button startIcon={<FilterListRoundedIcon />} size="small" sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.8rem", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", px: 2, "&:hover": { bgcolor: "rgba(255,255,255,0.05)" } }}>
          Filter
        </Button>
      </Box>

      {/* Table */}
      <Box sx={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        {/* Header */}
        <Box sx={{ px: 3, py: 1.5, display: "grid", gridTemplateColumns: "60px 80px 1fr 130px 90px 100px 80px 72px", gap: 2, borderBottom: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)" }}>
          {["ID", "SKU", "Site", "Type", "Severity", "Status", "Owner", ""].map((h) => (
            <Typography key={h} sx={{ fontSize: "0.68rem", fontWeight: 700, opacity: 0.4, letterSpacing: "0.06em", textTransform: "uppercase" }}>{h}</Typography>
          ))}
        </Box>

        {filtered.map((alert, i) => (
          <Box
            key={alert.id}
            sx={{ px: 3, py: 2, display: "grid", gridTemplateColumns: "60px 80px 1fr 130px 90px 100px 80px 72px", gap: 2, alignItems: "center", borderBottom: i < filtered.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none", background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent", "&:hover": { background: "rgba(255,255,255,0.04)" }, transition: "background 0.15s ease" }}
          >
            <Typography sx={{ fontFamily: "monospace", fontSize: "0.72rem", opacity: 0.4 }}>{alert.id}</Typography>
            <Typography sx={{ fontWeight: 700, fontSize: "0.8rem" }}>{alert.sku}</Typography>
            <Typography sx={{ fontSize: "0.79rem", opacity: 0.6 }}>{alert.site}</Typography>
            <Typography sx={{ fontSize: "0.78rem", opacity: 0.6 }}>{alert.type}</Typography>
            <Chip label={alert.severity} size="small" sx={{ height: 19, fontSize: "0.63rem", fontWeight: 700, color: severityColor[alert.severity], bgcolor: `${severityColor[alert.severity]}18`, border: `1px solid ${severityColor[alert.severity]}35` }} />
            <Chip label={alert.status} size="small" sx={{ height: 19, fontSize: "0.63rem", fontWeight: 700, color: statusColor[alert.status], bgcolor: `${statusColor[alert.status]}14`, border: `1px solid ${statusColor[alert.status]}35` }} />
            <Typography sx={{ fontSize: "0.76rem", opacity: 0.5 }}>{alert.owner}</Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <Box sx={{ width: 24, height: 24, borderRadius: "6px", bgcolor: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { bgcolor: "rgba(255,255,255,0.12)" } }}>
                <EditRoundedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
              </Box>
              <Box sx={{ width: 24, height: 24, borderRadius: "6px", bgcolor: "rgba(34,197,94,0.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", "&:hover": { bgcolor: "rgba(34,197,94,0.2)" } }}>
                <CheckRoundedIcon sx={{ fontSize: 14, color: "#22c55e" }} />
              </Box>
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default AlertsManagement;
