import { useCallback, useEffect, useMemo, useState } from "react";
import { listWeddings, createWedding, deleteWedding } from "../utils/weddingsService";
import { slugify } from "../utils/slug";

// LocalStorage keys used for backup/fallback
const LS_WEDDING_ITEMS = "weddingItems";
const arrangementKey = (name) => `weddingArrangement-${name}`;

function buildEmptyWeddingData(name, ownerMail) {
  return {
    weddingName: name,
    exportDate: new Date().toISOString(),
    totalGuests: 0,
    totalTables: 0,
    guestList: [],
    tables: [],
    tableAliases: {},
    tableSizes: {},
    tableNumbers: {},
    metadata: {
      viewMode: "list",
      isGrouped: true,
      version: "1.0",
      ...(ownerMail ? { "x-amz-meta-owner": ownerMail } : {}),
    },
  };
}

export function useWeddings({ ownerMail } = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingName, setDeletingName] = useState(null);
  const [loadError, setLoadError] = useState(null);


  const writeBackup = useCallback((list) => {
    try {
      localStorage.setItem(LS_WEDDING_ITEMS, JSON.stringify(list || []));
    } catch (_) {
      // ignore localStorage errors
    }
  }, []);

  const readBackup = useCallback(() => {
    try {
      return JSON.parse(localStorage.getItem(LS_WEDDING_ITEMS)) || [];
    } catch (_) {
      return [];
    }
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const names = await listWeddings(ownerMail);
      setItems(names || []);
      writeBackup(names || []);
    } catch (err) {
      const backup = readBackup();
      setItems(backup);
      setLoadError("Could not connect to server. Using local data.");
    } finally {
      setLoading(false);
    }
  }, [ownerMail, readBackup, writeBackup]);

  useEffect(() => {
    reload();
  }, [reload]);

  const toSlug = useCallback((displayName) => slugify(displayName), []);

  const validateName = useCallback((displayName) => {
    const trimmed = (displayName || "").trim();
    if (!trimmed) throw new Error("Please enter a wedding name");
    const slug = toSlug(trimmed);
    if (!slug) throw new Error("Please enter a valid wedding name");
    if (items.includes(slug)) throw new Error("Wedding name already exists!");
    return { trimmed, slug };
  }, [items, toSlug]);

  const addWedding = useCallback(
    async (displayName) => {
      const { trimmed, slug } = validateName(displayName);
      setSaving(true);
      try {
        const data = { ...buildEmptyWeddingData(slug, ownerMail), displayName: trimmed, slug };
        await createWedding(slug, data, ownerMail);
        const next = [...items, slug];
        setItems(next);
        writeBackup(next);
      } finally {
        setSaving(false);
      }
    },
    [items, ownerMail, validateName, writeBackup]
  );

  const removeWedding = useCallback(
    async (name) => {
      setDeletingName(name);
      try {
        await deleteWedding(name, ownerMail);
        const next = items.filter((n) => n !== name);
        setItems(next);
        writeBackup(next);
        // remove arrangement backup as the old component did
        try {
          localStorage.removeItem(arrangementKey(name));
        } catch (_) {}
      } finally {
        setDeletingName(null);
      }
    },
    [items, ownerMail, writeBackup]
  );

  const anyBusy = useMemo(() => loading || saving || !!deletingName, [loading, saving, deletingName]);

  return {
    items,
    loading,
    saving,
    deletingName,
    loadError,
    anyBusy,
    addWedding,
    deleteWedding: removeWedding,
    reload,
  };
}

export default useWeddings;
