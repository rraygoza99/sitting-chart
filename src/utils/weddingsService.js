import { S3_API_BASE } from "../config/api";

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
  const payload = { fileName: `${weddingName}.json` };
  if (ownerMail) {
    payload.owner = ownerMail;
    payload["x-amz-meta-owner"] = ownerMail;
  }

  const response = await fetch(`${S3_API_BASE}/delete`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
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
