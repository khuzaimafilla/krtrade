'use client';

import React, { useState, useRef } from 'react';
import { TradeLog, UserProfile, TradingGroup } from '@/types';
import { exportBackup, parseBackupFile, KRBackupData } from '@/lib/utils/backup';
import {
  X,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileJson,
  Loader,
  HardDrive,
} from 'lucide-react';

interface BackupRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  trades: TradeLog[];
  profile?: Partial<UserProfile>;
  groups?: TradingGroup[];
  onRestoreComplete: (backup: KRBackupData) => void;
}

type Tab = 'export' | 'import';

export default function BackupRestoreModal({
  isOpen,
  onClose,
  trades,
  profile,
  groups,
  onRestoreComplete,
}: BackupRestoreModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('export');
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parsedBackup, setParsedBackup] = useState<KRBackupData | null>(null);
  const [parseError, setParseError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [importDone, setImportDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportDone(false);
    try {
      exportBackup(trades, profile, groups);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFilePick = async (file: File) => {
    setParseError('');
    setParsedBackup(null);
    try {
      const backup = await parseBackupFile(file);
      setParsedBackup(backup);
    } catch (err: any) {
      setParseError(err.message);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFilePick(file);
  };

  const handleRestore = async () => {
    if (!parsedBackup) return;
    setIsImporting(true);
    try {
      onRestoreComplete(parsedBackup);
      setImportDone(true);
      setParsedBackup(null);
      setTimeout(() => {
        setImportDone(false);
        onClose();
      }, 2000);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm w-screen h-screen flex items-center justify-center overflow-y-auto p-4 sm:p-6 animate-fade-in font-poppins">
      <div className="relative w-full max-w-md bg-white border border-[#E4E9E6] rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#E4E9E6]">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-[#E6F7F0] text-[#05C46B]">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#1E2923] text-base font-montserrat">
                Backup &amp; Restore Data
              </h3>
              <p className="text-[11px] text-[#6B7C72] font-medium">
                Export/import histori jurnal trading Anda
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6B7C72] hover:text-[#1E2923] hover:bg-[#F8FAF9] rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 m-4 bg-[#F8FAF9] p-1.5 rounded-2xl border border-[#E4E9E6]">
          {(['export', 'import'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setParsedBackup(null); setParseError(''); setExportDone(false); setImportDone(false); }}
              className={`py-2.5 rounded-xl text-xs font-extrabold transition-all min-h-[40px] ${
                activeTab === tab
                  ? 'bg-white text-[#05C46B] shadow-sm border border-[#E4E9E6]'
                  : 'text-[#6B7C72] hover:text-[#1E2923]'
              }`}
            >
              {tab === 'export' ? '⬇️ Export Backup' : '⬆️ Import / Restore'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4">
          {/* ── EXPORT TAB ──────────────────────────────────────────── */}
          {activeTab === 'export' && (
            <>
              <div className="bg-[#F8FAF9] rounded-2xl border border-[#E4E9E6] p-4 space-y-2">
                <p className="text-xs font-extrabold text-[#1E2923]">📦 Yang akan di-export:</p>
                <ul className="text-xs text-[#6B7C72] space-y-1 font-medium">
                  <li>✅ <strong>{trades.length}</strong> transaksi jurnal trading</li>
                  <li>✅ Data profil akun Anda</li>
                  {groups && groups.length > 0 && (
                    <li>✅ <strong>{groups.length}</strong> grup komunitas</li>
                  )}
                  <li className="text-[10px] mt-2 text-[#6B7C72] italic">
                    File: <code className="bg-[#E4E9E6] px-1 rounded">krtrade-backup-YYYY-MM-DD.json</code>
                  </li>
                </ul>
              </div>

              {exportDone && (
                <div className="flex items-center space-x-2 p-3 bg-[#E6F7F0] rounded-2xl border border-[#05C46B]/30 text-[#05C46B] text-xs font-extrabold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>File backup berhasil diunduh!</span>
                </div>
              )}

              <button
                onClick={handleExport}
                disabled={isExporting || trades.length === 0}
                className="w-full py-3.5 bg-[#05C46B] hover:bg-[#04A75B] text-white font-extrabold text-sm rounded-2xl shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-all min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isExporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Menyiapkan file...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download Backup JSON</span>
                  </>
                )}
              </button>

              {trades.length === 0 && (
                <p className="text-center text-xs text-[#6B7C72] font-medium">
                  Tidak ada data jurnal untuk di-export.
                </p>
              )}
            </>
          )}

          {/* ── IMPORT TAB ──────────────────────────────────────────── */}
          {activeTab === 'import' && (
            <>
              {!parsedBackup ? (
                <>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragOver
                        ? 'border-[#05C46B] bg-[#E6F7F0]/60'
                        : 'border-[#D0D9D4] hover:border-[#05C46B]/60 hover:bg-[#F8FAF9]'
                    }`}
                  >
                    <FileJson className="w-10 h-10 text-[#6B7C72] mx-auto mb-3" />
                    <p className="text-sm font-extrabold text-[#1E2923] mb-1">
                      Drop file JSON di sini
                    </p>
                    <p className="text-xs text-[#6B7C72] font-medium">
                      atau klik untuk memilih file backup Anda
                    </p>
                    <p className="text-[10px] text-[#6B7C72] mt-2 italic">
                      Format: <code>krtrade-backup-*.json</code>
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFilePick(file);
                      }}
                    />
                  </div>

                  {parseError && (
                    <div className="flex items-start space-x-2 p-3 bg-[#FF4D4D]/10 rounded-2xl border border-[#FF4D4D]/30 text-[#FF4D4D] text-xs font-bold animate-fade-in">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <span>{parseError}</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-[#E6F7F0]/60 rounded-2xl border border-[#05C46B]/30 p-4 space-y-2 animate-fade-in">
                    <div className="flex items-center space-x-2 text-[#05C46B] mb-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <p className="text-xs font-extrabold">File backup valid terdeteksi!</p>
                    </div>
                    <div className="text-xs text-[#1E2923] space-y-1 font-medium">
                      <p><span className="text-[#6B7C72]">Versi backup:</span> <strong>{parsedBackup.version}</strong></p>
                      <p>
                        <span className="text-[#6B7C72]">Di-export pada:</span>{' '}
                        <strong>{new Date(parsedBackup.exportedAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
                      </p>
                      <p><span className="text-[#6B7C72]">Jumlah transaksi:</span> <strong>{parsedBackup.trades.length} trade</strong></p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <p className="text-xs font-bold text-amber-700">
                      ⚠️ Peringatan: Restore akan <strong>mengganti</strong> semua data jurnal lokal Anda saat ini dengan data dari file backup.
                    </p>
                  </div>

                  {importDone && (
                    <div className="flex items-center space-x-2 p-3 bg-[#E6F7F0] rounded-2xl border border-[#05C46B]/30 text-[#05C46B] text-xs font-extrabold animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Restore berhasil! Data jurnal telah dipulihkan.</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setParsedBackup(null); setParseError(''); }}
                      className="py-3 rounded-2xl border border-[#E4E9E6] text-xs font-extrabold text-[#6B7C72] hover:bg-[#F8FAF9] transition-colors min-h-[44px]"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleRestore}
                      disabled={isImporting}
                      className="py-3 rounded-2xl bg-[#05C46B] hover:bg-[#04A75B] text-white text-xs font-extrabold shadow-md shadow-[#05C46B]/20 flex items-center justify-center space-x-2 transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isImporting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          <span>Memulihkan...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Restore Data</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
