import React from "react";
import { Box, Typography, Chip } from "@mui/material";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PublishedWithChangesRoundedIcon from "@mui/icons-material/PublishedWithChangesRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const ACCENT = "#A78BFA";

const mockActions = [
  { id: "A-3301", sto: "STO-00420", sku: "KC-5511", type: "Cancel", reason: "Overstock resolved", qty: 2400, site: "Chicago DC", dueDate: "Jul 15", status: "Awaiting" },
  { id: "A-3302", sto: "STO-00421", sku: "SC-9903", type: "Push", reason: "Delay in transit", qty: 3750, site: "Atlanta DC", dueDate: "Jul 18", status: "Approved" },
  { id: "A-3303", sto: "STO-00422", sku: "HT-2020", type: "Cancel", reason: "Supplier change", qty: 1100, site: "Dallas DC", dueDate: "Jul 20", status: "Awaiting" },
  { id: "A-3304", sto: "STO-00423", sku: "LM-1107", type: "Push", reason: "Capacity constraints", qty: 800, site: "Seattle DC", dueDate: "Jul 22", status: "Completed" },
  { id: "A-3305", sto: "STO-00424", sku: "BR-7760", type: "Cancel", reason: "Demand forecast drop", qty: 2100, site: "Phoenix DC", dueDate: "Jul 28", status: "Awaiting" },
];

const typeMeta = { Cancel: { color: "#ef4444", bg: "#ef444415" }, Push: { color: "#A78BFA", bg: "#A78BFA15" } };
const statusMeta = { Awaiting: { color: "#eab308" }, Approved: { color: "#6AE3FF" }, Completed: { color: "#22d3a5" } };

const StatCard = ({ icon: Icon, label, value, color }) => (
  <Box sx={{ flex: "1 1 140px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", background: "linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))", p: 3 }}>
    <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: `${color}1a`, display: "flex", alignItems: "center", justifyContent: "center", mb: 2 }}>
      <Icon sx={{ fontSize: 18, color }} />
    </Box>
    <Typography sx={{ fontWeight: 900, fontSize: "1.65rem", color, lineHeight: 1 }}>{value}</Typography>
    <Typography sx={{ fontSize: "0.72rem", opacity: 0.5, mt: 0.5 }}>{label}</Typography>
  </Box>
);

const STOActionsDashboard = () => {
  const hdr = { fontSize: "0.71rem", fontWeight: 800, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.08em", py: 1.5, px: 2.5, borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#fff" };
  const cell = { fontSize: "0.82rem", py: 2, px: 2.5, borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#fff" };

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: "#04111e", minHeight: "100%", color: "#fff" }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-0.5px", mb: 0.5 }}>STO Actions Dashboard</Typography>
        <Typography sx={{ opacity: 0.45, fontSize: "0.85rem" }}>Overview of pending cancellations and push requests across all distribution centers</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mb: 5 }}>
        <StatCard icon={CancelRoundedIcon} label="Pending Cancels" value="12" color="#ef4444" />
        <StatCard icon={PublishedWithChangesRoundedIcon} label="Push Requests" value="8" color={ACCENT} />
        <StatCard icon={HourglassEmptyRoundedIcon} label="Awaiting Approval" value="9" color="#eab308" />
        <StatCard icon={CheckCircleRoundedIcon} label="Completed Today" value="5" color="#22d3a5" />
      </Box>

      <Box sx={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden" }}>
        <Box sx={{ px: 3, py: 2, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <CancelRoundedIcon sx={{ color: ACCENT, fontSize: 18 }} />
            <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>Recent STO Actions</Typography>
          </Box>
          <Typography sx={{ fontSize: "0.72rem", opacity: 0.4 }}>Last updated: 2 min ago</Typography>
        </Box>

        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse" }}>
          <Box component="thead">
            <Box component="tr" sx={{ bgcolor: "rgba(255,255,255,0.03)" }}>
              {["Action ID", "STO Ref.", "SKU", "Type", "Reason", "Qty", "Site", "Due Date", "Status"].map(h => (
                <Box component="th" key={h} sx={hdr}>{h}</Box>
              ))}
            </Box>
          </Box>
          <Box component="tbody">
            {mockActions.map((a, i) => (
              <Box component="tr" key={a.id} sx={{ bgcolor: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", "&:hover": { bgcolor: "rgba(255,255,255,0.04)" }, transition: "background 0.15s" }}>
                <Box component="td" sx={{ ...cell, fontWeight: 700, color: ACCENT }}>{a.id}</Box>
                <Box component="td" sx={{ ...cell, opacity: 0.6 }}>{a.sto}</Box>
                <Box component="td" sx={cell}>{a.sku}</Box>
                <Box component="td" sx={cell}>
                  <Chip label={a.type} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, color: typeMeta[a.type].color, bgcolor: typeMeta[a.type].bg, border: `1px solid ${typeMeta[a.type].color}35` }} />
                </Box>
                <Box component="td" sx={{ ...cell, opacity: 0.6 }}>{a.reason}</Box>
                <Box component="td" sx={cell}>{a.qty.toLocaleString()}</Box>
                <Box component="td" sx={{ ...cell, opacity: 0.7 }}>{a.site}</Box>
                <Box component="td" sx={{ ...cell, opacity: 0.7 }}>{a.dueDate}</Box>
                <Box component="td" sx={cell}>
                  <Chip label={a.status} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, color: statusMeta[a.status]?.color || "#fff", bgcolor: `${statusMeta[a.status]?.color || "#fff"}18`, border: `1px solid ${statusMeta[a.status]?.color || "#fff"}35` }} />
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default STOActionsDashboard;
