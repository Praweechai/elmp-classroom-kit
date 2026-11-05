import { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import {
  ChevronLeft, ChevronRight, HelpOutline, Home, MenuBook, Notifications, Schedule, Settings, WorkspacePremium,
} from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import {
  AccountMenu, BottomTabs, LanguageToggle, MessagesButton,
} from './Header';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

// Plan 4 shell (F-115, D-61): left sidebar ≥ 768 px, top bar, bottom tabs on phones.
// Sidebar width: 248 px ≥ 1280, 72 px (icons) 768–1279 unless the learner chose otherwise (remembered per browser).

const SIDEBAR_KEY = 'elmp.sidebar';
const WIDE = '(min-width: 1280px)';

const readSidebar = () => {
  try {
    const v = window.localStorage.getItem(SIDEBAR_KEY);
    return v === 'collapsed' || v === 'expanded' ? v : 'auto';
  } catch (e) { return 'auto'; }
};

// 'auto' follows the screen width (CSS); a click stores the learner's choice.
export function useSidebarState() {
  const [state, setState] = useState(readSidebar);
  const toggle = useCallback(() => {
    setState((s) => {
      let collapsed = s === 'collapsed';
      if (s === 'auto') { collapsed = !(typeof window.matchMedia === 'function' && window.matchMedia(WIDE).matches); }
      const next = collapsed ? 'expanded' : 'collapsed';
      try { window.localStorage.setItem(SIDEBAR_KEY, next); } catch (e) { /* not remembered in private mode */ }
      return next;
    });
  }, []);
  return [state, toggle];
}

const linkShape = PropTypes.shape({
  home: PropTypes.string.isRequired,
  courses: PropTypes.string,
  certificates: PropTypes.string.isRequired,
  hours: PropTypes.string,
  account: PropTypes.string,
  help: PropTypes.string,
  signOut: PropTypes.string,
  portal: PropTypes.string,
});

const userShape = PropTypes.shape({ name: PropTypes.string.isRequired, photoUrl: PropTypes.string });

export const SidebarNav = ({
  current, links, unread = 0, onOpenMessages, state = 'auto', onToggle, logoUrl,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const label = (m) => intl.formatMessage(m);
  const main = [
    ['home', links.home, Home, messages.navHomeShort],
    ['courses', links.courses, MenuBook, messages.navCourses],
    ['certificates', links.certificates, WorkspacePremium, messages.navCertificates],
    ['hours', links.hours, Schedule, messages.navHours], // only while CE hours are switched on (F-112)
  ].filter(([, href]) => Boolean(href));
  const other = [
    ['settings', links.account, Settings, messages.navSettings],
    ['help', links.help, HelpOutline, messages.navHelp],
  ].filter(([, href]) => Boolean(href));
  const item = ([key, href, icon, text]) => (
    <li key={key}>
      <Link
        className="cls-side__item"
        href={href}
        aria-current={current === key ? 'page' : undefined}
        title={label(text)}
      >
        <KitIcon src={icon} size={22} />
        <span className="cls-side__label">{label(text)}</span>
      </Link>
    </li>
  );
  return (
    <nav className="cls-side" data-state={state} aria-label={label(messages.sidebarLabel)}>
      <Link className="cls-side__brand" href={links.home} aria-label={label(messages.brandHome)}>
        {logoUrl ? <img src={logoUrl} alt="" /> : <span className="cls-side__mark" aria-hidden="true">M</span>}
        <span className="cls-side__label">Mission Hospital <b>Learning</b></span>
      </Link>
      <p className="cls-side__group" aria-hidden="true"><span className="cls-side__label">{label(messages.navMain)}</span></p>
      <ul>
        {main.map(item)}
        <li>
          <button
            type="button"
            className="cls-side__item"
            onClick={onOpenMessages}
            title={label(messages.navMessages)}
            aria-label={intl.formatMessage(messages.messagesButton, { count: unread })}
          >
            <KitIcon src={Notifications} size={22} />
            <span className="cls-side__label" aria-hidden="true">{label(messages.navMessages)}</span>
            {unread > 0 && <span className="cls-side__badge cls-num" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}
          </button>
        </li>
      </ul>
      {other.length > 0 && (
        <>
          <p className="cls-side__group" aria-hidden="true"><span className="cls-side__label">{label(messages.navOther)}</span></p>
          <ul>{other.map(item)}</ul>
        </>
      )}
      {onToggle && (
        <button type="button" className="cls-side__item cls-side__toggle" onClick={onToggle} aria-expanded={state !== 'collapsed'}>
          <KitIcon src={ChevronLeft} size={22} className="cls-side__toggle-in" />
          <KitIcon src={ChevronRight} size={22} className="cls-side__toggle-out" />
          <span className="cls-side__label">{label(messages.navCollapse)}</span>
        </button>
      )}
    </nav>
  );
};

SidebarNav.propTypes = {
  current: PropTypes.oneOf(['home', 'courses', 'certificates', 'hours', 'settings', 'help']),
  links: linkShape.isRequired,
  unread: PropTypes.number,
  onOpenMessages: PropTypes.func,
  state: PropTypes.oneOf(['auto', 'collapsed', 'expanded']),
  onToggle: PropTypes.func,
  logoUrl: PropTypes.string,
};

const PortalLabel = () => {
  const intl = useClassroomIntl();
  return intl.formatMessage(messages.portalLink);
};

// 64 px top bar: page title, language, bell, avatar + name menu (doc 04-design §4).
export const TopBar = ({
  title, user, links, unread = 0, locale, onLocaleChange, onOpenMessages,
}) => (
  <header className="cls-topbar">
    <span className="cls-topbar__mark" aria-hidden="true">M</span>
    <h1 className="cls-topbar__title">{title}</h1>
    <div className="cls-topbar__right">
      {links.portal && <a className="cls-btn cls-btn--ghost cls-btn--sm cls-topbar__portal" href={links.portal}><PortalLabel /></a>}
      <span className="cls-topbar__lang"><LanguageToggle value={locale} onChange={onLocaleChange} /></span>
      <MessagesButton unread={unread} onClick={onOpenMessages} />
      {user && <AccountMenu user={user} links={links} locale={locale} onLocaleChange={onLocaleChange} showName />}
    </div>
  </header>
);

TopBar.propTypes = {
  title: PropTypes.string.isRequired,
  user: userShape,
  links: linkShape.isRequired,
  unread: PropTypes.number,
  locale: PropTypes.string,
  onLocaleChange: PropTypes.func,
  onOpenMessages: PropTypes.func,
};

// The whole frame: sidebar + top bar + page + phone tabs. Apps put a view inside.
export const ClassroomShell = ({
  current, title, links, user, unread = 0, locale, onLocaleChange, onOpenMessages, logoUrl, children,
}) => {
  const [state, toggle] = useSidebarState();
  return (
    <div className="cls-shell cls-root" data-sidebar={state} lang={locale}>
      <SidebarNav
        current={current}
        links={links}
        unread={unread}
        onOpenMessages={onOpenMessages}
        state={state}
        onToggle={toggle}
        logoUrl={logoUrl}
      />
      <div className="cls-shell__main">
        <TopBar
          title={title}
          user={user}
          links={links}
          unread={unread}
          locale={locale}
          onLocaleChange={onLocaleChange}
          onOpenMessages={onOpenMessages}
        />
        <main className="cls-shell__page" id="main">{children}</main>
      </div>
      <BottomTabs current={['home', 'courses', 'certificates', 'hours'].includes(current) ? current : undefined} links={links} unread={unread} onOpenMessages={onOpenMessages} />
    </div>
  );
};

ClassroomShell.propTypes = {
  current: PropTypes.oneOf(['home', 'courses', 'certificates', 'hours', 'settings', 'help']),
  title: PropTypes.string.isRequired,
  links: linkShape.isRequired,
  user: userShape,
  unread: PropTypes.number,
  locale: PropTypes.string,
  onLocaleChange: PropTypes.func,
  onOpenMessages: PropTypes.func,
  logoUrl: PropTypes.string,
  children: PropTypes.node,
};
