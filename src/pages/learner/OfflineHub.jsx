import { useState, useEffect } from 'react';
import { Download, HardDrive, WifiOff, FileText, Loader, Archive } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import { getOfflinePacks } from '../../api/cachedLearnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import apiClient from '../../api/client';
import { showError } from '../../utils/swal';
import './OfflineHub.css';

async function downloadBlob(url, filename) {
  const res = await apiClient.get(url, { responseType: 'blob' });
  const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
  const a = document.createElement('a');
  a.href = blobUrl;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(blobUrl);
}

export default function OfflineHub() {
  const [packs, setPacks] = useState(() => cachedData('offline:packs', 'offline') || []);
  const [loading, setLoading] = useState(() => showPageLoading('offline:packs', 'offline'));
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    getOfflinePacks()
      .then(res => setPacks(res.data || []))
      .catch(err => console.error('Failed to load offline packs', err))
      .finally(() => setLoading(false));
  }, []);

  const handleDownloadPdf = async (pack) => {
    const key = `pdf-${pack.module_id}`;
    setDownloading(key);
    try {
      await downloadBlob(
        `/modules/${pack.module_id}/reading-pdf`,
        `module_${pack.module_id}_reading.pdf`,
      );
    } catch (err) {
      showError('Download failed', err.response?.data?.detail || 'Could not download reading PDF.');
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadBundle = async (pack) => {
    const key = `zip-${pack.module_id}`;
    setDownloading(key);
    try {
      await downloadBlob(
        `/modules/${pack.module_id}/offline-bundle`,
        `module_${pack.module_id}_offline_pack.zip`,
      );
    } catch (err) {
      showError(
        'Download failed',
        err.response?.data?.detail || 'Could not download the full materials pack.',
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <LearnerLayout title="Offline Hub" subtitle="Download materials for low-bandwidth access">
      <div className="offline-hub-wrap">
        <div className="offline-header-card card">
          <div className="offline-header-left">
            <div className="wifi-icon-wrap"><WifiOff size={24} color="var(--k-600)" /></div>
            <div>
              <h3>Keep Learning Anywhere</h3>
              <p>
                Download reading PDFs for every module. When a module includes uploaded materials
                (PDFs, images, documents), you can download them together in one ZIP pack.
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}><Loader size={28} className="spin" /></div>
        ) : (
          <div className="download-list">
            <h4 style={{ marginBottom: '1rem' }}>Module Offline Packs</h4>
            {packs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', color: 'var(--grey-500)' }}>
                No published modules available yet.
              </div>
            ) : (
              packs.map(pack => (
                <div key={pack.module_id} className="download-card card">
                  <div className="download-card-info">
                    <div className="download-card-icon">
                      <span className="text-sm font-bold" style={{ color: 'var(--k-600)' }}>MOD {pack.num}</span>
                    </div>
                    <div className="download-card-text">
                      <h4>{pack.title}</h4>
                      <div className="download-meta">
                        <span className="text-sm text-muted"><FileText size={12} /> {pack.topic_count} topics</span>
                        {pack.has_materials && (
                          <span className="text-sm text-muted">
                            <HardDrive size={12} /> {pack.resource_count} materials
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="download-card-actions">
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      disabled={Boolean(downloading)}
                      onClick={() => handleDownloadPdf(pack)}
                    >
                      <Download size={15} />
                      {downloading === `pdf-${pack.module_id}` ? 'Downloading…' : 'Reading PDF'}
                    </button>
                    {pack.has_materials && (
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        disabled={Boolean(downloading)}
                        onClick={() => handleDownloadBundle(pack)}
                      >
                        <Archive size={15} />
                        {downloading === `zip-${pack.module_id}` ? 'Preparing…' : 'Full pack (ZIP)'}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </LearnerLayout>
  );
}
