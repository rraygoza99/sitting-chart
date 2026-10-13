/**
 * Backup service for weddings:
 * - Weekly backups: Triggered automatically upon saving if at least 7 days have passed since the last backup.
 * - Rolling window: Retains up to 2 backups per wedding (pruning the oldest).
 * - Stored in S3 using suffix naming convention: `${weddingName}_backup_${timestamp}`.
 */

import { S3_API_BASE } from '../config/api';
import { createWedding, deleteWedding } from './weddingsService';

const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_BACKUPS = 2;

/**
 * List all available backups for a given wedding.
 * @param {string} weddingName
 * @param {string} [ownerMail]
 * @returns {Promise<Array<{ backupKey: string, timestamp: number, dateStr: string }>>}
 */
export async function listWeddingBackups(weddingName, ownerMail) {
  try {
    const listUrl = ownerMail
      ? `${S3_API_BASE}/list?ownerMail=${encodeURIComponent(ownerMail)}`
      : `${S3_API_BASE}/list`;

    const response = await fetch(listUrl);
    if (!response.ok) {
      return [];
    }
    const data = await response.json();
    const prefix = `${weddingName}_backup_`;

    const backups = (data || [])
      .filter((fileObj) => fileObj.fileName && fileObj.fileName.startsWith(prefix) && fileObj.fileName.endsWith('.json'))
      .map((fileObj) => {
        const key = fileObj.fileName.replace('.json', '');
        const timePart = key.slice(prefix.length);
        const timestamp = parseInt(timePart, 10);
        return {
          backupKey: key,
          timestamp: isNaN(timestamp) ? 0 : timestamp,
          dateStr: isNaN(timestamp) ? 'Unknown Date' : new Date(timestamp).toLocaleDateString(),
          isoDate: isNaN(timestamp) ? null : new Date(timestamp).toISOString(),
        };
      })
      .sort((a, b) => b.timestamp - a.timestamp); // Newest first

    return backups;
  } catch (err) {
    console.warn('Error fetching wedding backups list:', err);
    return [];
  }
}

/**
 * Check if a weekly backup is needed, and if so, perform the backup and prune old ones.
 * @param {string} weddingName
 * @param {object} weddingData
 * @param {string} [ownerMail]
 * @returns {Promise<{ created: boolean, backupKey?: string }>}
 */
export async function handleWeeklyBackup(weddingName, weddingData, ownerMail) {
  try {
    const existingBackups = await listWeddingBackups(weddingName, ownerMail);
    const now = Date.now();

    // Check if the newest backup is less than a week old
    if (existingBackups.length > 0) {
      const latestBackup = existingBackups[0];
      const timeSinceLastBackup = now - latestBackup.timestamp;
      if (timeSinceLastBackup < ONE_WEEK_MS) {
        // Less than a week since last backup; no backup needed yet
        return { created: false };
      }
    }

    // Create new backup
    const newBackupKey = `${weddingName}_backup_${now}`;
    const backupPayload = {
      ...weddingData,
      isBackup: true,
      backupSource: weddingName,
      backupTimestamp: now,
      backupDate: new Date(now).toISOString(),
    };

    await createWedding(newBackupKey, backupPayload, ownerMail);

    // Prune old backups if count exceeds MAX_BACKUPS (keep up to 2)
    const updatedBackups = [
      { backupKey: newBackupKey, timestamp: now },
      ...existingBackups,
    ];

    if (updatedBackups.length > MAX_BACKUPS) {
      const toDelete = updatedBackups.slice(MAX_BACKUPS);
      for (const item of toDelete) {
        try {
          await deleteWedding(item.backupKey, ownerMail);
        } catch (delErr) {
          console.warn(`Failed to prune old backup ${item.backupKey}:`, delErr);
        }
      }
    }

    return { created: true, backupKey: newBackupKey };
  } catch (err) {
    console.error('Error during automatic weekly backup handling:', err);
    return { created: false, error: err };
  }
}
