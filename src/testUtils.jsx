import { render } from '@testing-library/react';
import { IntlProvider } from 'react-intl';

// Renders like inside an app: the app's IntlProvider decides the language (en / th).
export const renderKit = (ui, { locale = 'en' } = {}) => render(
  <IntlProvider locale={locale} messages={{}}>
    <div className="cls-root" lang={locale}>{ui}</div>
  </IntlProvider>,
);

export const BANNED_WORDS = /open\s?edx|\blms\b|\bsso\b|\bmfe\b/i;

// Every text, title, alt and aria-label in the container (A3-6 DOM scan).
export const visibleWords = (container) => [
  container.textContent,
  ...[...container.querySelectorAll('[title],[alt],[aria-label]')].flatMap((el) => [el.getAttribute('title'), el.getAttribute('alt'), el.getAttribute('aria-label')]),
].filter(Boolean).join(' | ');
