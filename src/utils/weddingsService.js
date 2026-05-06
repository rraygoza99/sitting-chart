import { S3_API_BASE, WEDDINGS_API_BASE } from "../config/api";
import { slugify } from "./slug";

// List weddings from the server, optionally filtered by ownerMail if backend supports it.
// Returns an array of wedding names (strings) without the .json extension.
export async function listWeddings(ownerMail) {
  const listUrl = ownerMail
    ? `${S3_API_BASE}/list?ownerMail=${encodeURIComponent(ownerMail)}`
    : `${S3_API_BASE}/list`;

  const response = await fetch(listUrl);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  // Keep parity with existing behavior: filter .json files and owner metadata if present
  let filtered = (data || []).filter((fileObj) => fileObj.fileName && fileObj.fileName.endsWith(".json"));

  if (ownerMail && filtered.some((f) => f.owner || f["x-amz-meta-owner"])) {
    filtered = filtered.filter(
      (f) => f.owner === ownerMail || f["x-amz-meta-owner"] === ownerMail
    );
  }

  const weddingNames = filtered.map((fileObj) => fileObj.fileName.replace(".json", ""));
  return weddingNames;
}

// Create/Upload a wedding JSON to server
export async function createWedding(weddingName, weddingData, ownerMail) {
  const jsonBlob = new Blob([JSON.stringify(weddingData)], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", jsonBlob, `${weddingName}.json`);
  formData.append("fileName", `${weddingName}.json`);

  if (ownerMail) {
    formData.append("owner", ownerMail);
    formData.append("x-amz-meta-owner", ownerMail);
    formData.append("metadata", JSON.stringify({ "x-amz-meta-owner": ownerMail }));
  }

  const headers = {};
  if (ownerMail) headers["ownerMail"] = ownerMail;

  const response = await fetch(`${S3_API_BASE}/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// Delete a wedding on the server
export async function deleteWedding(weddingName, ownerMail) {
  const fileName = encodeURIComponent(`${weddingName}.json`);
  const response = await fetch(`${S3_API_BASE}/delete/${fileName}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// Fetch a single wedding JSON from the server
export async function getWedding(weddingName) {
  const response = await fetch(`${S3_API_BASE}/file/${encodeURIComponent(weddingName)}.json`);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data?.content || data; // handle nested or flat
}

// Save a wedding JSON (alias to create/upload)
export async function saveWedding(weddingName, weddingData, ownerMail) {
  return createWedding(weddingName, weddingData, ownerMail);
}

/**
 * Create a new wedding via the dedicated REST endpoint (POST /api/weddings).
 * @param {{ partner1Name: string, partner2Name: string, weddingDate: string, venue?: string }} details
 * @returns {Promise<string>} The slug/ID of the created wedding (safeName without .json)
 */
export async function createWeddingWithDetails({ partner1Name, partner2Name, weddingDate, venue }, ownerMail) {
  const dateStr = String(weddingDate).slice(0, 10);
  const slug = `${slugify(partner1Name)}-${slugify(partner2Name)}-${dateStr}`;

  // If the dedicated REST API is not configured, fall back to S3 upload
  if (!WEDDINGS_API_BASE) {
    const emptyData = {
      weddingName: slug,
      displayName: `${partner1Name} & ${partner2Name}`,
      exportDate: new Date().toISOString(),
      totalGuests: 0,
      totalTables: 0,
      guestList: [],
      tables: [],
      tableAliases: {},
      tableSizes: {},
      tableNumbers: {},
      metadata: { viewMode: "list", isGrouped: true, version: "1.0" },
    };
    await createWedding(slug, emptyData, ownerMail);
    return slug;
  }

  const response = await fetch(`${WEDDINGS_API_BASE}/api/weddings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      Partner1Name: partner1Name,
      Partner2Name: partner2Name,
      WeddingDate: weddingDate,
      Venue: venue || "",
    }),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `HTTP error! status: ${response.status}`);
  }
  const data = await response.json().catch(() => null);
  // Extract slug from response: prefer safeName, then strip .json from fileName
  if (data?.safeName) return data.safeName;
  if (data?.fileName) return data.fileName.replace(/\.json$/i, "");
  return slug;
}
