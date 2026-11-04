import * as fx from '../__fixtures__/portal';
import { CertificateCard, HoursCard } from '../index';

export default { title: 'Records' };

export const Certificates = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      <CertificateCard certificate={fx.roadmapCertificate} onDownload={() => new Promise((r) => { setTimeout(r, 800); })} />
      <CertificateCard certificate={fx.courseCertificate} />
      <CertificateCard certificate={fx.revokedCertificate} />
    </div>
  ),
};

export const Hours = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      <HoursCard year={2026} earned={24} target={40} yearEnds="2026-12-31" href="#hours" />
      <HoursCard year={2026} earned={40} target={40} yearEnds="2026-12-31" />
    </div>
  ),
};
