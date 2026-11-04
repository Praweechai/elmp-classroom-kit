import { IntlProvider } from 'react-intl';

import '../src/tokens/tokens.css';
import '../src/styles/classroom.css';

const preview = {
  globalTypes: {
    locale: {
      description: 'Language',
      toolbar: {
        title: 'Language', icon: 'globe', items: [{ value: 'en', title: 'English' }, { value: 'th', title: 'ไทย' }], dynamicTitle: true,
      },
    },
  },
  initialGlobals: { locale: 'en' },
  parameters: { layout: 'padded', backgrounds: { disable: true } },
  decorators: [
    (Story, { globals, parameters }) => (
      <IntlProvider locale={globals.locale || 'en'} messages={{}}>
        <div className="cls-root" lang={globals.locale || 'en'} style={{ padding: parameters.layout === 'fullscreen' ? 0 : 16 }}>
          <Story />
        </div>
      </IntlProvider>
    ),
  ],
};

export default preview;
