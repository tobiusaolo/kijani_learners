import { Award } from 'lucide-react';

const PROGRAM_DESC =
  'has successfully completed all programme learning modules and submitted a digital storytelling capstone for the Kijani Terrascape programme.';

/**
 * HTML certificate preview — mirrors the PDF layout from the backend.
 */
export default function CertificatePreview({ certData, previewOnly = false }) {
  const fullName = certData?.user?.full_name || certData?.user?.email || 'Learner';
  const canDownload = certData?.can_download ?? certData?.unlocked;
  const showSample = previewOnly || !canDownload;
  const issueDate = certData?.issue_date
    ? new Date(certData.issue_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Pending completion';

  return (
    <div
      className={`certificate-pro ${showSample ? 'certificate-pro-sample' : ''}`}
      role="img"
      aria-label={`Certificate preview for ${fullName}`}
    >
      {showSample && (
        <div className="certificate-pro-watermark" aria-hidden>
          <span>PREVIEW</span>
          <small>Download unlocks when requirements are met</small>
        </div>
      )}
      <div className="certificate-pro-frame">
        <header className="certificate-pro-header">
          <span className="certificate-pro-org">{certData?.organization || 'Kijani Terrascape'}</span>
          <span className="certificate-pro-subtitle">
            {certData?.program_subtitle || 'Integrated Conservation & Systems Thinking'}
          </span>
          <span className="certificate-pro-label">Certificate of Completion</span>
        </header>

        <div className="certificate-pro-body">
          <p className="certificate-pro-intro">This is to certify that</p>
          <h2 className="certificate-pro-name">{fullName}</h2>
          <p className="certificate-pro-desc">{PROGRAM_DESC}</p>
          <p className="certificate-pro-program">
            {certData?.program_title || 'Kijani Terrascape Digital Learning Journey'}
          </p>
        </div>

        <footer className="certificate-pro-footer">
          <div className="certificate-pro-meta">
            <span className="meta-label">Credential ID</span>
            <strong>{certData?.credential_id || '—'}</strong>
          </div>
          <div className="certificate-pro-signature">
            <div className="signature-line" />
            <span className="meta-label">Programme Director</span>
            <strong>{certData?.organization || 'Kijani Terrascape'}</strong>
          </div>
          <div className="certificate-pro-meta certificate-pro-meta-right">
            <span className="meta-label">Date of issue</span>
            <strong>{issueDate}</strong>
          </div>
          <div className="certificate-pro-seal" aria-hidden>
            <Award size={28} strokeWidth={1.5} />
            <span>{showSample ? 'PREVIEW' : 'VERIFIED'}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
