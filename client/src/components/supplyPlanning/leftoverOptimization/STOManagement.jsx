import React, { useState } from "react";
import { Box, Typography, Chip, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, Tooltip } from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SwapHorizRoundedIcon from "@mui/icons-material/SwapHorizRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";

const ACCENT = "#22d3a5";

const mockSTOs = [
  { id: "STO-00412", sku: "SC-9903", from: "Atlanta DC", to: "Seattle DC", qty: 3750, value: "$210K", dueDate: "Jul 14", status: "Pending Approval", method: "Truck" },
  { id: "STO-00413", sku: "KC-5511", from: "Chicago DC", to: "Dallas DC", qty: 1200, value: "$64K", dueDate: "Jul 17", status: "Scheduled", method: "Rail" },
  { id: "STO-00414", sku: "HT-2020", from: "Dallas DC", to: "Phoenix DC", qty: 560, value: "$29K", dueDate: "Jul 19", status: "In Transit", method: "Truck" },
  { id: "STO-00415", sku: "LM-1107", from: "Seattle DC", to: "Chicago DC", qty: 980, value: "$52K", dueDate: "Jul 21", status: "Pending Approval", method: "Air" },
  { id: "STO-00416", sku: "BR-7760", from: "Phoenix DC", to: "Atlanta DC", qty: 2300, value: "$121K", dueDate: "Jul 25", status: "Draft", method: "Truck" },
];

const statusMeta = {
  "Pending Approval": { color: "#eab308" },
  "Scheduled": { color: "#6AE3FF" },
  "In Transit": { color: "#22d3a5" },
  "Draft": { color: "rgba(255,255,255,0.4)" },
};

const STOManagement = () => {
  const [search, setSearch] = useState("");

  const filtered = mockSTOs.filter(s =>
    s.id.toLowerCase().includes(search.toLowerCase()) ||
    s.sku.toLowerCase().includes(search.toLowerCase()) ||
    s.from.toLowerCase().includes(search.toLowerCase()) ||
    s.to.toLowerCase().includes(search.toLowerCase())
  );

  const hdr = { fontSize: "0.72rem", fontWeight: 800, opacity: 0.45, textTransform: "uppercase", letterSpacing: "0.08em", py: 1.5, px: 2, borderBottom: "1px solid rgba(255,255,255,0.07)" };
  const cell = { fontSize: "0.82rem", py: 2, px: 2, borderBottom: "1px solid rgba(255,255,255,0.05)", color: "#fff" };

  return (
    <Box sx={{ p: { xs: 3, md: 4 }, bgcolor: "#04111e", minHeight: "100%", color: "#fff" }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontWeight: 900, fontSize: "1.6rem", letterSpacing: "-0.5px", mb: 0.5 }}>STO Management</Typography>
        <Typography sx={{ opacity: 0.45, fontSize: "0.85rem" }}>Manage stock transfer orders generated from leftover optimization recommendations</Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          size="small"
          placeholder="Search by STO ID, SKU, location..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRoundedIcon sx={{ fontSize: 18, opacity: 0.4 }} /></InputAdornment> }}
          sx={{ flex: 1, maxWidth: 380, "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "rgba(255,255,255,0.04)", "& fieldset": { borderColor: "rgba(255,255,255,0.1)" }, "&:hover fieldset": { borderColor: "rgba(255,255,255,0.2)" }, "&.Mui-focused fieldset": { borderColor: ACCENT } }, "& input": { color: "#fff", fontSize: "0.83rem", py: 1.15 } }}
        />
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {["All", "Pending Approval", "Scheduled", "In Transit"].map(f => (
            <Chip key={f} label={f} size="small" sx={{ height: 28, fontWeight: 600, fontSize: "0.71rem", cursor: "pointer", color: "rgba(255,255,255,0.6)", bgcolor: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", "&:hover": { bgcolor: `${ACCENT}20`, color: ACCENT, borderColor: `${ACCENT}50` } }} />
          ))}
        </Box>
      </Box>

      <TableContainer sx={{ borderRadius: "16px", border: "1px solid rgba(255,255,255,0.08)", bgcolor: "rgba(255,255,255,0.015)" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "rgba(255,255,255,0.03)" }}>
              {["STO ID", "SKU", "From", "To", "Qty", "Value", "Due Date", "Method", "Status", "Actions"].map(h => (
                <TableCell key={h} sx={hdr}>{h}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {filtered.map((sto, i) => (
              <TableRow key={sto.id} sx={{ bgcolor: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent", "&:hover": { bgcolor: "rgba(255,255,255,0.04)" }, transition: "background 0.15s" }}>
                <TableCell sx={{ ...cell, fontWeight: 700, color: ACCENT }}>{sto.id}</TableCell>
                <TableCell sx={cell}>{sto.sku}</TableCell>
                <TableCell sx={{ ...cell, opacity: 0.7 }}>{sto.from}</TableCell>
                <TableCell sx={{ ...cell, opacity: 0.7 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <SwapHorizRoundedIcon sx={{ fontSize: 14, color: ACCENT, opacity: 0.6 }} />
                    {sto.to}
                  </Box>
                </TableCell>
                <TableCell sx={cell}>{sto.qty.toLocaleString()}</TableCell>
                <TableCell sx={{ ...cell, color: "#f97316", fontWeight: 700 }}>{sto.value}</TableCell>
                <TableCell sx={{ ...cell, opacity: 0.7 }}>{sto.dueDate}</TableCell>
                <TableCell sx={cell}>
                  <Chip label={sto.method} size="small" sx={{ height: 18, fontSize: "0.62rem", fontWeight: 600, color: "rgba(255,255,255,0.55)", bgcolor: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)" }} />
                </TableCell>
                <TableCell sx={cell}>
                  <Chip label={sto.status} size="small" sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700, color: statusMeta[sto.status]?.color || "#fff", bgcolor: `${statusMeta[sto.status]?.color || "#fff"}18`, border: `1px solid ${statusMeta[sto.status]?.color || "#fff"}35` }} />
                </TableCell>
                <TableCell sx={cell}>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Approve STO">
                      <IconButton size="small" sx={{ color: ACCENT, p: 0.5, "&:hover": { bgcolor: `${ACCENT}15` } }}>
                        <CheckCircleOutlineRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="View Inventory">
                      <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)", p: 0.5, "&:hover": { bgcolor: "rgba(255,255,255,0.08)", color: "#fff" } }}>
                        <WarehouseRoundedIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default STOManagement;
