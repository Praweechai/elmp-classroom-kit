import * as fx from '../__fixtures__/portal';
import {
  CertificatesView, HoursView, NotificationPanel,
} from '../index';

export default { title: 'Pages', parameters: { layout: 'fullscreen' } };

const NOW = Date.parse('2026-11-04T09:00:00+07:00');
const ago = (min) => new Date(NOW - min * 60000).toISOString();
const messagesFixture = [
  {
    id: 'n1', type: 'deadline_passed', title: { en: 'Deadline passed', th: 'เลยกำหนดแล้ว' }, body: { en: 'Annual Infection Control 2026 was due on 31 Oct. 1 course left.', th: 'ควบคุมการติดเชื้อประจำปี 2569 ครบกำหนด 31 ต.ค. เหลือ 1 หลักสูตร' }, read_at: null, created_at: ago(5),
  },
  {
    id: 'n2', type: 'roadmap_assigned', title: { en: 'New training assigned', th: 'ได้รับมอบหมายการอบรมใหม่' }, body: { en: 'Patient Safety 2026 · due 12 Nov', th: 'ความปลอดภัยของผู้ป่วย 2569 · ครบกำหนด 12 พ.ย.' }, read_at: null, created_at: ago(180),
  },
  {
    id: 'n3', type: 'certificate_ready', title: { en: 'Certificate ready', th: 'ใบประกาศพร้อมแล้ว' }, body: { en: 'Records & PDPA 2026', th: 'เวชระเบียนและ PDPA 2569' }, read_at: '2026-11-02T15:00:00+07:00', created_at: '2026-11-02T14:00:00+07:00',
  },
];

export const S72Certificates = { render: () => <CertificatesView items={fx.certificates.data} status="ready" /> };
export const S73Hours = { render: () => <HoursView data={fx.hours.data} status="ready" /> };
export const S74Messages = {
  render: () => <div style={{ height: 760 }}><NotificationPanel open items={messagesFixture} onMarkAllRead={() => {}} now={NOW} /></div>,
};
export const S74MessagesEmpty = { render: () => <div style={{ height: 500 }}><NotificationPanel open items={[]} /></div> };
