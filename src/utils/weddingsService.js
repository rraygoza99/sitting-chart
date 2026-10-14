import { S3_API_BASE, WEDDINGS_API_BASE } from "../config/api";
import { slugify } from "./slug";

// List weddings from the server, optionally filtered by ownerEmail if backend supports it.
// Returns an array of wedding names (strings) without the .json extension.
export async function listWeddings(ownerEmail) {
  const listUrl = ownerEmail
    ? `${S3_API_BASE}/list?ownerEmail=${encodeURIComponent(ownerEmail)}`
    : `${S3_API_BASE}/list`;

  const headers = {};
  if (ownerEmail) {
    headers["X-OwnerEmail"] = ownerEmail;
  }

  const response = await fetch(listUrl, { headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();

  // Filter .json files and exclude backup files from main list
  let filtered = (data || []).filter(
    (fileObj) => fileObj.fileName && fileObj.fileName.endsWith(".json") && !fileObj.fileName.includes("_backup_")
  );

  if (ownerEmail) {
    const targetEmail = ownerEmail.toLowerCase().trim();
    filtered = filtered.filter((f) => {
      if (Array.isArray(f.ownerEmails) && f.ownerEmails.length > 0) {
        return f.ownerEmails.some((e) => (e || "").toLowerCase().trim() === targetEmail);
      }
      if (f.owner || f["x-amz-meta-owner"] || f["X-OwnerEmail"] || f["x-owneremail"]) {
        const ownerVal = (f.owner || f["x-amz-meta-owner"] || f["X-OwnerEmail"] || f["x-owneremail"] || "").toLowerCase();
        return ownerVal.includes(targetEmail);
      }
      return true;
    });
  }

  const weddingNames = filtered.map((fileObj) => fileObj.fileName.replace(".json", ""));
  return weddingNames;
}

// Create/Upload a wedding JSON to server
export async function createWedding(weddingName, weddingData, ownerEmail) {
  const jsonBlob = new Blob([JSON.stringify(weddingData)], { type: "application/json" });
  const formData = new FormData();
  formData.append("file", jsonBlob, `${weddingName}.json`);
  formData.append("fileName", `${weddingName}.json`);

  if (ownerEmail) {
    formData.append("ownerEmail", ownerEmail);
    formData.append("X-OwnerEmail", ownerEmail);
    formData.append("owner", ownerEmail);
    formData.append("x-amz-meta-owner", ownerEmail);
    formData.append("metadata", JSON.stringify({ "X-OwnerEmail": ownerEmail, "x-amz-meta-owner": ownerEmail }));
  }

  const headers = {};
  if (ownerEmail) {
    headers["X-OwnerEmail"] = ownerEmail;
    headers["ownerEmail"] = ownerEmail;
  }

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
export async function deleteWedding(weddingName, ownerEmail) {
  const fileName = encodeURIComponent(`${weddingName}.json`);
  const deleteUrl = ownerEmail
    ? `${S3_API_BASE}/delete/${fileName}?ownerEmail=${encodeURIComponent(ownerEmail)}`
    : `${S3_API_BASE}/delete/${fileName}`;

  const headers = {};
  if (ownerEmail) {
    headers["X-OwnerEmail"] = ownerEmail;
  }

  const response = await fetch(deleteUrl, {
    method: "DELETE",
    headers,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}

// Fetch a single wedding JSON from the server
export async function getWedding(weddingName, ownerEmail) {
  const fileName = encodeURIComponent(weddingName);
  const getUrl = ownerEmail
    ? `${S3_API_BASE}/file/${fileName}.json?ownerEmail=${encodeURIComponent(ownerEmail)}`
    : `${S3_API_BASE}/file/${fileName}.json`;

  const headers = {};
  if (ownerEmail) {
    headers["X-OwnerEmail"] = ownerEmail;
  }

  const response = await fetch(getUrl, { headers });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
  return data?.content || data; // handle nested or flat
}

// Save a wedding JSON (alias to create/upload)
export async function saveWedding(weddingName, weddingData, ownerEmail) {
  return createWedding(weddingName, weddingData, ownerEmail);
}

/**
 * Create a new wedding via the dedicated REST endpoint (POST /api/weddings).
 * @param {{ partner1Name: string, partner2Name: string, weddingDate: string, venue?: string }} details
 * @param {string} [ownerEmail]
 * @returns {Promise<string>} The slug/ID of the created wedding (safeName without .json)
 */
export async function createWeddingWithDetails({ partner1Name, partner2Name, weddingDate, venue }, ownerEmail) {
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
    await createWedding(slug, emptyData, ownerEmail);
    return slug;
  }

  const headers = { "Content-Type": "application/json" };
  if (ownerEmail) {
    headers["X-OwnerEmail"] = ownerEmail;
  }

  const response = await fetch(`${WEDDINGS_API_BASE}/api/weddings`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      Partner1Name: partner1Name,
      Partner2Name: partner2Name,
      WeddingDate: weddingDate,
      Venue: venue || "",
      OwnerEmail: ownerEmail || "",
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
