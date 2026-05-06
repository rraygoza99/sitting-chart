import { useCallback, useEffect, useMemo, useState } from "react";
import { listWeddings, createWeddingWithDetails, deleteWedding } from "../utils/weddingsService";
import { slugify } from "../utils/slug";

// LocalStorage keys used for backup/fallback
const LS_WEDDING_ITEMS = "weddingItems";
const arrangementKey = (name) => `weddingArrangement-${name}`;

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

  const addWedding = useCallback(
    async ({ partner1Name, partner2Name, weddingDate, venue }) => {
      // Client-side duplicate guard: predict the slug the server will produce
      const dateStr = String(weddingDate).slice(0, 10);
      const expectedSlug = `${toSlug(partner1Name)}-${toSlug(partner2Name)}-${dateStr}`;
      if (items.includes(expectedSlug)) {
        throw new Error("Wedding name already exists!");
      }
      setSaving(true);
      try {
        const slug = await createWeddingWithDetails({ partner1Name, partner2Name, weddingDate, venue }, ownerMail);
        const next = [...items, slug];
        setItems(next);
        writeBackup(next);
        return slug;
      } finally {
        setSaving(false);
      }
    },
    [items, ownerMail, toSlug, writeBackup]
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
