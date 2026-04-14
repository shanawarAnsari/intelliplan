import React from "react";
import { Box, Typography, Chip, LinearProgress } from "@mui/material";
import WarehouseRoundedIcon from "@mui/icons-material/WarehouseRounded";
import ArrowDownwardRoundedIcon from "@mui/icons-material/ArrowDownwardRounded";
import AttachMoneyRoundedIcon from "@mui/icons-material/AttachMoneyRounded";
import LocalShippingRoundedIcon from "@mui/icons-material/LocalShippingRounded";

const ACCENT = "#22d3a5";

const mockItems = [
  {
    sku: "KC-5511",
    site: "Chicago DC",
    stock: 4200,
    optimal: 1800,
    excess: 2400,
    value: "$128K",
    action: "Transfer to Dallas",
    priority: "High",
  },
  {
    sku: "HT-2020",
    site: "Dallas DC",
    stock: 3100,
    optimal: 2200,
    excess: 900,
    value: "$47K",
    action: "Markdown Promotion",
    priority: "Medium",
  },
  {
    sku: "SC-9903",
    site: "Atlanta DC",
    stock: 6750,
    optimal: 3000,
    excess: 3750,
    value: "$210K",
    action: "STO to Seattle",
    priority: "Critical",
  },
  {
    sku: "KC-4412",
    site: "Phoenix DC",
    stock: 2900,
    optimal: 2500,
    excess: 400,
    value: "$22K",
    action: "Hold & Monitor",
    priority: "Low",
  },
];

const priorityColor = {
  Critical: "#ef4444",
  High: "#f97316",
  Medium: "#eab308",
  Low: "#22c55e",
};

const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <Box
    sx={{
      flex: "1 1 160px",
      borderRadius: "16px",
      border: "1px solid rgba(255,255,255,0.08)",
      background:
        "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
      p: 3,
    }}
  >
    <Box
      sx={{
        width: 38,
        height: 38,
        borderRadius: "10px",
        bgcolor: `${color}1a`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 2,
      }}
    >
      <Icon sx={{ fontSize: 20, color }} />
    </Box>
    <Typography sx={{ fontWeight: 900, fontSize: "1.7rem", color, lineHeight: 1 }}>
      {value}
    </Typography>
    <Typography sx={{ fontSize: "0.73rem", opacity: 0.5, mt: 0.5 }}>
      {label}
    </Typography>
    {sub && (
      <Typography sx={{ fontSize: "0.68rem", color, opacity: 0.7, mt: 0.3 }}>
        {sub}
      </Typography>
    )}
  </Box>
);

const ExecuteOverview = () => (
  <Box
    sx={{
      p: { xs: 3, md: 4 },
      bgcolor: "#04111e",
      minHeight: "100%",
      color: "#fff",
    }}
  >
    <Box sx={{ mb: 4 }}>
      <Typography
        sx={{
          fontWeight: 900,
          fontSize: "1.6rem",
          letterSpacing: "-0.5px",
          mb: 0.5,
        }}
      >
        Executive Overview
      </Typography>
      <Typography sx={{ opacity: 0.45, fontSize: "0.85rem" }}>
        Leftover inventory optimization — identify excess stock and recommended
        actions
      </Typography>
    </Box>

    <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mb: 5 }}>
      <StatCard
        icon={WarehouseRoundedIcon}
        label="Excess SKUs"
        value="18"
        color={ACCENT}
      />
      <StatCard
        icon={AttachMoneyRoundedIcon}
        label="Capital Tied Up"
        value="$1.2M"
        sub="Recoverable"
        color="#f97316"
      />
      <StatCard
        icon={ArrowDownwardRoundedIcon}
        label="Avg. Days Excess"
        value="34d"
        color="#eab308"
      />
      <StatCard
        icon={LocalShippingRoundedIcon}
        label="Transfers Queued"
        value="7"
        color="#6AE3FF"
      />
    </Box>

    <Box
      sx={{
        borderRadius: "16px",
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.03)",
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <WarehouseRoundedIcon sx={{ color: ACCENT, fontSize: 18 }} />
        <Typography sx={{ fontWeight: 700, fontSize: "0.85rem" }}>
          Excess Inventory Items
        </Typography>
      </Box>

      {mockItems.map((item, i) => {
        const overPct = Math.min(100, Math.round((item.excess / item.stock) * 100));
        return (
          <Box
            key={item.sku}
            sx={{
              px: 3,
              py: 2.5,
              borderBottom:
                i < mockItems.length - 1
                  ? "1px solid rgba(255,255,255,0.05)"
                  : "none",
              background: i % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
              "&:hover": { background: "rgba(255,255,255,0.04)" },
              transition: "background 0.15s ease",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                flexWrap: "wrap",
                mb: 1.5,
              }}
            >
              <Typography
                sx={{ fontWeight: 700, fontSize: "0.85rem", minWidth: 75 }}
              >
                {item.sku}
              </Typography>
              <Typography sx={{ fontSize: "0.79rem", opacity: 0.55, flex: 1 }}>
                {item.site}
              </Typography>
              <Typography sx={{ fontSize: "0.78rem", opacity: 0.55 }}>
                Excess:{" "}
                <strong style={{ color: "#fff" }}>
                  {item.excess.toLocaleString()} units
                </strong>
              </Typography>
              <Typography
                sx={{ fontSize: "0.78rem", color: "#f97316", fontWeight: 700 }}
              >
                {item.value}
              </Typography>
              <Chip
                label={item.priority}
                size="small"
                sx={{
                  height: 19,
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  color: priorityColor[item.priority],
                  bgcolor: `${priorityColor[item.priority]}18`,
                  border: `1px solid ${priorityColor[item.priority]}35`,
                }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <LinearProgress
                  variant="determinate"
                  value={overPct}
                  sx={{
                    height: 5,
                    borderRadius: 4,
                    bgcolor: "rgba(255,255,255,0.08)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor:
                        overPct > 60
                          ? "#ef4444"
                          : overPct > 40
                            ? "#f97316"
                            : "#eab308",
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
              <Typography sx={{ fontSize: "0.7rem", opacity: 0.45, minWidth: 40 }}>
                {overPct}% over
              </Typography>
              <Chip
                label={item.action}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.65rem",
                  fontWeight: 600,
                  color: ACCENT,
                  bgcolor: `${ACCENT}14`,
                  border: `1px solid ${ACCENT}35`,
                }}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  </Box>
);

export default ExecuteOverview;
