import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Award, Download, Loader, Eye, FileText, Lock } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import CertificatePreview from '../../components/CertificatePreview';
import { getCertificate } from '../../api/cachedLearnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import apiClient from '../../api/client';
import { showError, showWarning, apiErrorMessage } from '../../utils/swal';
import './Certificate.css';

export default function Certificate() {
  const [certData, setCertData] = useState(() => cachedData('certificate:me', 'certificate'));
  const [loading, setLoading] = useState(() => showPageLoading('certificate:me', 'certificate'));
  const [downloading, setDownloading] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState('design');

  const canDownload = certData?.can_download ?? certData?.unlocked;
  const progress = certData?.progress || {};
  const modulesComplete =
    progress.modules_done ||
    (progress.modules_total > 0 && progress.modules_completed >= progress.modules_total);

  useEffect(() => {
    getCertificate()
      .then(res => setCertData(res.data))
      .catch(err => console.error('Failed to fetch certificate details', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!certData) return undefined;
    let objectUrl;
    (async () => {
      setPdfLoading(true);
      try {
        const res = await apiClient.get('/certificates/me/pdf', {
          params: { preview: true },
          responseType: 'blob',
        });
        objectUrl = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
        setPdfPreviewUrl(objectUrl);
      } catch (err) {
        console.error('Certificate PDF preview failed', err);
      } finally {
        setPdfLoading(false);
      }
    })();
    return () => {
      if (objectUrl) window.URL.revokeObjectURL(objectUrl);
    };
  }, [certData]);

  const handleDownload = async () => {
    if (!canDownload) {
      showWarning(
        'Download locked',
        'Finish all modules and submit your digital story to download your official certificate.',
      );
      return;
    }
    setDownloading(true);
    try {
      const res = await apiClient.get('/certificates/me/pdf', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = `kijani_certificate_${certData?.credential_id || 'completion'}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      showError('Download failed', apiErrorMessage(err, 'Could not download certificate.'));
    } finally {
      setDownloading(false);
    }
  };

  const handleShowPdf = () => {
    setPreviewMode('pdf');
  };

  return (
    <LearnerLayout title="My Certificate" subtitle="Preview your credential and download when eligible">
      <div className="cert-page-container">
        {loading ? (
          <div className="cert-loading">
            <Loader size={32} className="spin" />
            <p>Loading certificate…</p>
          </div>
        ) : (
          <>
            {!canDownload && (
              <div className="cert-requirements-banner card">
                <div className="cert-requirements-header">
                  <Lock size={20} color="var(--k-600)" />
                  <div>
                    <h3>Download requirements</h3>
                    <p className="text-muted text-sm">
                      You can preview your certificate anytime. Download unlocks after both items below are complete.
                    </p>
                  </div>
                </div>
                <ul className="cpb-list">
                  <li className={modulesComplete ? 'completed' : 'in-progress'}>
                    <div className="cpb-status">
                      {modulesComplete ? '✓' : `${progress.modules_completed || 0}/${progress.modules_total || 0}`}
                    </div>
                    <span>
                      Complete all modules
                      {!modulesComplete && (
                        <> — <Link to="/learn/modules">Continue learning</Link></>
                      )}
                    </span>
                  </li>
                  <li className={progress.story_submitted ? 'completed' : ''}>
                    <div className="cpb-status">{progress.story_submitted ? '✓' : ''}</div>
                    <span>
                      Submit digital storytelling output
                      {!progress.story_submitted && (
                        <> — <Link to="/learn/storytelling">Go to Storytelling</Link></>
                      )}
                    </span>
                  </li>
                </ul>
              </div>
            )}

            <div className="cert-unlocked-state">
              <div className="cert-actions-bar">
                <div className="cert-actions-left">
                  {canDownload ? (
                    <span className="badge badge-green">✓ Ready to download</span>
                  ) : (
                    <span className="badge badge-grey">Preview only</span>
                  )}
                  {certData.credential_id && (
                    <span className="cert-credential-pill text-sm text-muted">ID: {certData.credential_id}</span>
                  )}
                </div>
                <div className="cert-action-btns">
                  <button
                    type="button"
                    className={`btn btn-ghost btn-sm ${previewMode === 'design' ? 'active' : ''}`}
                    onClick={() => setPreviewMode('design')}
                  >
                    <Eye size={15} /> Design preview
                  </button>
                  <button
                    type="button"
                    className={`btn btn-ghost btn-sm ${previewMode === 'pdf' ? 'active' : ''}`}
                    onClick={handleShowPdf}
                    disabled={pdfLoading}
                  >
                    <FileText size={15} /> PDF preview
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleDownload}
                    disabled={downloading || !canDownload}
                    title={
                      canDownload
                        ? 'Download official certificate PDF'
                        : 'Complete modules and storytelling to enable download'
                    }
                  >
                    <Download size={15} />
                    {downloading ? 'Generating…' : 'Download PDF'}
                  </button>
                </div>
              </div>

              <div className="cert-preview-wrap">
                {previewMode === 'pdf' ? (
                  <div className="cert-pdf-viewer">
                    {pdfLoading && !pdfPreviewUrl ? (
                      <div className="cert-pdf-loading">
                        <Loader size={28} className="spin" />
                        <p>Preparing certificate preview…</p>
                      </div>
                    ) : pdfPreviewUrl ? (
                      <iframe
                        title="Certificate PDF preview"
                        src={pdfPreviewUrl}
                        className="cert-pdf-iframe"
                      />
                    ) : null}
                  </div>
                ) : (
                  <CertificatePreview certData={certData} previewOnly={!canDownload} />
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </LearnerLayout>
  );
}
