import { IntlProvider } from 'react-intl';

// Fonts bundled with Storybook (not Google Fonts) so screenshots are identical on every CI run.
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/inter/800.css';
import '@fontsource/ibm-plex-sans-thai/400.css';
import '@fontsource/ibm-plex-sans-thai/500.css';
import '@fontsource/ibm-plex-sans-thai/600.css';
import '@fontsource/ibm-plex-sans-thai/700.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';

import '../src/tokens/tokens.css';
import '../src/styles/classroom.css';
import '../src/styles/shell3.css';
import '../src/styles/player3.css';
import '../src/styles/learner21.css';

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
