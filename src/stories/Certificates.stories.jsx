import { useState } from 'react';
import PropTypes from 'prop-types';

import storyLogo from './logo';
import { Page3 } from './page3';
import { CertificateDialog, CertificatesView2, kitLanguage } from '../index';
import { certificates, dashboard } from '../__fixtures__/portal';

// Plan 5 S-104 Certificates: earned cards (View dialog, Download, Verify), revoked, locked (course not finished).
const name = (locale) => (kitLanguage(locale) === 'th' ? 'นก ศรีสุข' : 'Nok Srisuk');
const page = (locale, props) => (
  <Page3 current="certificates" locale={locale}>
    <CertificatesView2
      items={certificates.data}
      courses={dashboard.data.courses}
      learnerName={name(locale)}
      logoUrl={storyLogo}
      verifyUrl="#verify"
      onDownload={() => {}}
      {...props}
    />
  </Page3>
);

export default { title: 'Plan 5/Certificates', parameters: { layout: 'fullscreen' } };

export const Cards = { render: (_, { globals }) => page(globals.locale, {}) };
export const Empty = { render: (_, { globals }) => page(globals.locale, { items: [], courses: [] }) };

const DialogDemo = ({ locale }) => {
  const [open, setOpen] = useState(true);
  return open ? (
    <CertificateDialog
      certificate={certificates.data[0]}
      learnerName={name(locale)}
      logoUrl={storyLogo}
      onClose={() => setOpen(false)}
      onDownload={() => {}}
    />
  ) : null;
};
DialogDemo.propTypes = { locale: PropTypes.string };
export const ViewDialog = { render: (_, { globals }) => <DialogDemo locale={globals.locale} /> };
