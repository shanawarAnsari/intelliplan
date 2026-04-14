// src/utils/csvExport.js
import { unparse } from "papaparse";

/** ---------- Shape Detection ---------- */

/**
 * Detects { tableData: { COL: { "0": v, "1": v2 }, ... } } shape.
 */
export const isColumnarTableData = (obj) => {
    if (!obj || typeof obj !== "object") return false;
    const td = obj.tableData;
    if (!td || typeof td !== "object") return false;
    const cols = Object.keys(td);
    if (cols.length === 0) return false;
    return cols.every((ck) => td[ck] && typeof td[ck] === "object");
};

/**
 * Detects a *bare* columnar object (no wrapper):
 * { COL_A: { "0": val0, "1": val1 }, COL_B: { "0": val0, ... }, ... }
 */
export const isBareColumnar = (obj) => {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return false;
    const keys = Object.keys(obj);
    if (keys.length === 0) return false;

    // Heuristic: at least one key whose value is an object with numeric-like keys
    let columnsDetected = 0;
    for (const k of keys) {
        const v = obj[k];
        if (v && typeof v === "object" && !Array.isArray(v)) {
            // Has at least one numeric-ish key?
            const vk = Object.keys(v);
            if (vk.length > 0 && vk.every((i) => /^\d+$/.test(i))) {
                columnsDetected++;
            }
        }
    }
    return columnsDetected > 0 && columnsDetected === keys.length;
};

/**
 * Returns true if dataTable is a non-empty array of plain objects.
 */
export const isArrayOfRowObjects = (dataTable) => {
    return (
        Array.isArray(dataTable) &&
        dataTable.length > 0 &&
        typeof dataTable[0] === "object" &&
        !Array.isArray(dataTable[0])
    );
};

/**
 * Returns true if the provided dataTable looks exportable.
 */
export const isExportableData = (dataTable) => {
    if (!dataTable) return false;
    if (isArrayOfRowObjects(dataTable)) return true;
    if (isColumnarTableData(dataTable)) return true;
    if (isBareColumnar(dataTable)) return true; // NEW
    if (Array.isArray(dataTable) && dataTable.some(isColumnarTableData)) return true;
    if (Array.isArray(dataTable) && dataTable.some(isBareColumnar)) return true; // NEW
    if (dataTable && Array.isArray(dataTable.rows) && dataTable.rows.length > 0) return true;
    return false;
};

/** ---------- Normalization ---------- */

/**
 * Converts columnar tableData into array of row objects
 * e.g. { A: {"0":"a1","1":"a2"}, B: {"0":1,"1":2} } -> [{A:"a1",B:1},{A:"a2",B:2}]
 */
export const columnarToRows = (tableDataObj) => {
    const columns = Object.keys(tableDataObj || {});
    if (columns.length === 0) return [];

    const rowIdxSet = new Set();
    columns.forEach((c) => {
        Object.keys(tableDataObj[c] || {}).forEach((i) => rowIdxSet.add(Number(i)));
    });
    const idxs = Array.from(rowIdxSet).sort((a, b) => a - b);

    return idxs.map((ri) => {
        const row = {};
        columns.forEach((c) => {
            const col = tableDataObj[c] || {};
            row[c] = Object.prototype.hasOwnProperty.call(col, String(ri)) ? col[String(ri)] : null;
        });
        return row;
    });
};

/**
 * Converts a bare columnar object (no wrapper) into rows.
 */
export const bareColumnarToRows = (obj) => columnarToRows(obj);

/**
 * Normalizes various shapes into an array of row objects.
 */
export const normalizeToRows = (raw) => {
    // 1) Already array of row objects
    if (isArrayOfRowObjects(raw)) return raw;

    // 2) Columnar block with wrapper
    if (isColumnarTableData(raw)) {
        return columnarToRows(raw.tableData);
    }

    // 3) Bare columnar block (no wrapper)
    if (isBareColumnar(raw)) {
        return bareColumnarToRows(raw);
    }

    // 4) Array of columnar blocks (with or without wrapper)
    if (Array.isArray(raw) && raw.length > 0) {
        const all = [];
        // merge wrapped columnar blocks
        raw.filter(isColumnarTableData).forEach((o) => {
            all.push(...columnarToRows(o.tableData));
        });
        // merge bare columnar blocks
        raw.filter(isBareColumnar).forEach((o) => {
            all.push(...bareColumnarToRows(o));
        });
        // also permit pre-normalized row objects alongside
        raw
            .filter((x) => x && typeof x === "object" && !Array.isArray(x) && !x.tableData && !isBareColumnar(x))
            .forEach((r) => all.push(r));
        if (all.length > 0) return all;
    }

    // 5) { columns, rows }
    if (raw && Array.isArray(raw.columns) && Array.isArray(raw.rows)) {
        const colKeys = raw.columns.map((c) =>
            typeof c === "string" ? c : c.field || c.key || c.id || c.header || "col"
        );
        if (raw.rows.length > 0 && Array.isArray(raw.rows[0])) {
            return raw.rows.map((arr) => {
                const obj = {};
                colKeys.forEach((k, i) => (obj[k] = arr[i]));
                return obj;
            });
        }
        return raw.rows;
    }

    // Unrecognized
    return [];
};

/** ---------- Pre-processing (flatten + decode) ---------- */

let _decodeEl = null;
const decodeHtmlEntities = (val) => {
    if (typeof val !== "string") return val;
    if (typeof document === "undefined") return val;
    if (!_decodeEl) _decodeEl = document.createElement("textarea");
    _decodeEl.innerHTML = val;
    return _decodeEl.value;
};

export const flattenRow = (row, parentKey = "", out = {}) => {
    for (const [k, v] of Object.entries(row ?? {})) {
        const key = parentKey ? `${parentKey}.${k}` : k;
        if (v && typeof v === "object" && !Array.isArray(v)) {
            flattenRow(v, key, out);
        } else {
            out[key] = Array.isArray(v) ? JSON.stringify(v) : v;
        }
    }
    return out;
};

export const preprocessRows = (rows, { decodeHtml = true, flatten = true, nullToEmpty = true } = {}) => {
    return rows.map((r) => {
        const base = flatten ? flattenRow(r) : { ...r };
        const out = {};
        for (const [k, v] of Object.entries(base)) {
            let val = v;
            if (decodeHtml) val = decodeHtmlEntities(val);
            if (nullToEmpty && (val === null || val === undefined)) val = "";
            out[k] = val;
        }
        return out;
    });
};

/** ---------- CSV + Download ---------- */

export const computeUnionColumns = (rows) => {
    const cols = [];
    const seen = new Set();
    rows.forEach((r) => {
        Object.keys(r).forEach((k) => {
            if (!seen.has(k)) {
                seen.add(k);
                cols.push(k);
            }
        });
    });
    return cols;
};

export const downloadCsvString = (csvText, filename) => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvText], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.setAttribute("download", filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 0);
};

export const buildDefaultCsvFilename = (prefix = "intelliplan_export") => {
    const ts = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${prefix}_${ts.getFullYear()}-${pad(ts.getMonth() + 1)}-${pad(ts.getDate())}_${pad(
        ts.getHours()
    )}-${pad(ts.getMinutes())}-${pad(ts.getSeconds())}.csv`;
};

export const downloadCsvFromData = (dataTable, options = {}) => {
    const rowsRaw = normalizeToRows(dataTable);
    if (!rowsRaw || rowsRaw.length === 0) {
        throw new Error("No data available to export.");
    }

    const {
        filename,
        columns,
        newline = "\r\n",
        quotes,
        delimiter,
        flatten = true,
        decodeHtml = true,
        nullToEmpty = true,
    } = options;

    const rows = preprocessRows(rowsRaw, { decodeHtml, flatten, nullToEmpty });
    const finalColumns = Array.isArray(columns) && columns.length > 0 ? columns : computeUnionColumns(rows);

    const csv = unparse(rows, {
        columns: finalColumns,
        newline,
        quotes,
        delimiter,
    });

    const finalName = filename || buildDefaultCsvFilename();
    downloadCsvString(csv, finalName);
};