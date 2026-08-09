import { TradeLog, UserProfile, TradingGroup } from '@/types';

export interface KRBackupData {
  version: string;
  exportedAt: string;
  platform: 'KRTrade';
  profile?: Partial<UserProfile>;
  trades: TradeLog[];
  groups?: TradingGroup[];
}

const BACKUP_VERSION = '1.0.0';

/**
 * Export all journal data as a downloadable .json file
 */
export function exportBackup(
  trades: TradeLog[],
  profile?: Partial<UserProfile>,
  groups?: TradingGroup[]
): void {
  const backup: KRBackupData = {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    platform: 'KRTrade',
    profile,
    trades,
    groups,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });

  const dateStr = new Date()
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '-');

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `krtrade-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parse and validate a backup JSON file, returning the backup data
 * Throws an error if the file is invalid or not a KRTrade backup
 */
export function parseBackupFile(file: File): Promise<KRBackupData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const parsed: KRBackupData = JSON.parse(raw);

        // Basic validation
        if (parsed.platform !== 'KRTrade') {
          reject(new Error('File ini bukan file backup KRTrade yang valid.'));
          return;
        }
        if (!Array.isArray(parsed.trades)) {
          reject(new Error('Format backup tidak valid: field "trades" tidak ditemukan.'));
          return;
        }

        resolve(parsed);
      } catch {
        reject(new Error('File JSON tidak dapat dibaca. Pastikan file backup tidak rusak.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Gagal membaca file. Coba lagi.'));
    };

    reader.readAsText(file);
  });
}
