import React, { useState } from "react";
import { Box, Typography, Chip, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip, Button } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import PublishedWithChangesRoundedIcon from "@mui/icons-material/PublishedWithChangesRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ACCENT = "#A78BFA";

const mockActions = [
  { id: "SA-5501", sto: "STO-00430", sku: "KC-5511", dc: "Chicago DC", type: "Cancel", qty: 2400, recommendedBy: "AI Engine", confidence: "94%", impact: "$128K freed", status: "Pending" },
  { id: "SA-5502", sto: "STO-00431", sku: "SC-9903", dc: "Atlanta DC", type: "Push", qty: 3750, recommendedBy: "Planner", confidence: "87%", impact: "+18 days lead", status: "Approved" },
  { id: "SA-5503", sto: "STO-00432", sku: "LM-1107", dc: "Seattle DC", type: "Cancel", qty: 980, recommendedBy: "AI Engine", confidence: "91%", impact: "$52K freed", status: "Pending" },
  { id: "SA-5504", sto: "STO-00433", sku: "HT-2020", dc: "Dallas DC", type: "Push", qty: 1100, recommendedBy: "AI Engine", confidence: "76%", impact: "+7 days lead", status: "Rejected" },
  { id: "SA-5505", sto: "STO-00434", sku: "BR-7760", dc: "Phoenix DC", type: "Cancel", qty: 2100, recommendedBy: "AI Engine", confidence: "89%", impact: "$121K freed", status: "Pending" },
  { id: "SA-5506", sto: "STO-00435", sku: "KC-4412", dc: "Chicago DC", type: "Push", qty: 400, recommendedBy: "Planner", confidence: "82%", impact: "+5 days lead", status: "Approved" },
];

const typeMeta = { Cancel: { color: "#ef4444", bg: "#ef444415", icon: CancelRoundedIcon }, Push: { color: "#A78BFA", bg: "#A78BFA15", icon: PublishedWithChangesRoundedIcon } };
const statusMeta = { Pending: { color: "#eab308" }, Approved: { color: "#22d3a5" }, Rejected: { color: "#ef4444" } };

const STOActions = () => {
  const [search, setSearch] = useState("");

  const filtered = mockActions.filter(a =>
    a.id.toLowerCase().includes(search.toLowerCase()) ||
    a.sku.toLowerCase().includes(search.toLowerCase()) ||
    a.dc.toLowerCase().includes(search.toLowerCase())
  );

  const hdr = { fontSize: "0.72rem", fontWeight: 800, opacity: 0.4, textTransform: "uppercase", letterSpacing: "0.08em", py: 1.5, px: 2, borderBottom: "1px solid rgba(255,255,255,0.07)", color: "#fff" };
  const cell = { fontSize: "0.82rem", py: 2, px: 2, borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#fff" };

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: "#04111e", minHeight: "100%", color: "#fff" }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-0.5px", mb: 0.5 }}>STO Actions</Typography>
        <Typography sx={{ opacity: 0.45, fontSize: "0.85rem" }}>Review and execute AI-recommended cancel and push actions on stock transfer orders</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search actions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 17, opacity: 0.4 }} /></InputAdornment> }}
          sx={{ flex: 1, maxWidth: 340, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "rgba(255,255,255,0.04)", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" }, "&.Mui-focused fieldset": { borderColor: ACCENT } }, "& input": { color: "#fff", fontSize: "0.82rem", py: 1.1 } }}
        />
        <Box sx={{ ml: "auto", display: "flex", gap: 1 }}>
          <Button size="small" startIcon={<CancelRoundedIcon />} sx={{ bgcolor: "#ef444415", color: "#ef4444", border: "1px solid #ef444430", borderRadius: "10px", textTransform: "none", fontSize: "0.78rem", fontWeight: 700, px: 2, "&:hover": { bgcolor: "#ef444425" } }}>
            Bulk Cancel
          </Button>
          <Button size="small" startIcon={<PublishedWithChangesRoundedIcon />} sx={{ bgcolor: `${ACCENT}15`, color: ACCENT, border: `1px solid ${ACCENT}30`, borderRadius: "10px", textTransform: "none", fontSize: "0.78rem", fontWeight: 700, px: 2, "&:hover": { bgcolor: `${ACCENT}25` } }}>
            Bulk Push
          </Button>
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(255,255,255,0.015)" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(255,255,255,0.03)" }}>
              {["Action ID", "STO Ref.", "SKU", "DC", "Type", "Qty", "Recommended By", "Confidence", "Impact", "Status", "Execute"].map(h => (
                <TableCell key={h} sx={hdr}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((a, i) => {
              const TypeIcon = typeMeta[a.type].icon;
              return (
                <TableRow key={a.id} sx={{ bgcolor: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", "&:hover": { bgcolor: "rgba(255,255,255,0.04)" }, transition: "background 0.15s" }}>
                  <TableCell sx={{ ...cell, fontWeight: 700, color: ACCENT }}>{a.id}</TableCell>
                  <TableCell sx={{ ...cell, opacity: 0.6 }}>{a.sto}</TableCell>
                  <TableCell sx={cell}>{a.sku}</TableCell>
                  <TableCell sx={{ ...cell, opacity: 0.7 }}>{a.dc}</TableCell>
                  <TableCell sx={cell}>
                    <Chip icon={<TypeIcon sx={{ fontSize: "13px !important", color: `${typeMeta[a.type].color} !important` }} />} label={a.type} size="small" sx={{ height: 21, fontSize: "0.65rem", fontWeight: 700, color: typeMeta[a.type].color, bgcolor: typeMeta[a.type].bg, border: `1px solid ${typeMeta[a.type].color}35` }} />
                  </TableCell>
                  <TableCell sx={cell}>{a.qty.toLocaleString()}</TableCell>
                  <TableCell sx={{ ...cell, opacity: 0.65 }}>{a.recommendedBy}</TableCell>
                  <TableCell sx={{ ...cell, color: a.confidence >= "90%" ? "#22d3a5" : a.confidence >= "80%" ? "#eab308" : "#f97316", fontWeight: 700 }}>{a.confidence}</TableCell>
                  <TableCell sx={{ ...cell, fontSize: "0.76rem", opacity: 0.8 }}>{a.impact}</TableCell>
                  <TableCell sx={cell}>
                    <Chip label={a.status} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, color: statusMeta[a.status]?.color || "#fff", bgcolor: `${statusMeta[a.status]?.color || "#fff"}18`, border: `1px solid ${statusMeta[a.status]?.color || "#fff"}35` }} />
                  </TableCell>
                  <TableCell sx={cell}>
                    <Box sx={{ display: "flex", gap: 0.5 }}>
                      {a.type === "Cancel" ? (
                        <Tooltip title="Execute Cancel">
                          <IconButton size="small" disabled={a.status === "Rejected"} sx={{ color: "#ef4444", p: 0.5, "&:hover": { bgcolor: "#ef444415" }, "&.Mui-disabled": { opacity: 0.3 } }}>
                            <CancelRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Tooltip title="Execute Push">
                          <IconButton size="small" disabled={a.status === "Rejected"} sx={{ color: ACCENT, p: 0.5, "&:hover": { bgcolor: `${ACCENT}15` }, "&.Mui-disabled": { opacity: 0.3 } }}>
                            <PublishedWithChangesRoundedIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="View Details">
                        <IconButton size="small" sx={{ color: "rgba(255,255,255,0.35)", p: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" } }}>
                          <InfoOutlinedIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default STOActions;
