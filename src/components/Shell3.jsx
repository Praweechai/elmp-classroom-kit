import {
  useEffect, useId, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  Apps, BarChart, Campaign, ChevronLeft, ChevronRight, Close, DonutLarge, HelpOutline, Home, KeyboardArrowDown,
  Language, Logout, MenuBook, Schedule, Search, WorkspacePremium,
} from '@openedx/paragon/icons';

import { kitLanguage, messages, useClassroomIntl } from '../i18n';
import { Avatar, MessagesButton } from './Header';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

// Plan 5 Shell 3 (S-100…S-105, D-73…D-77): NetAcad page arrangement, page links in the left sidebar,
// thin top bar (title, Explore, search with suggestions, EN/TH, help, profile), green HR banner (CA-14),
// footer, phone bottom tabs. The Plan 4 ClassroomShell stays exported until the forks move (P5-4).

const PAGES = [
  ['home', Home, messages.shell3MyLearning, messages.shell3MyLearning],
  ['courses', MenuBook, messages.shell3Courses, messages.shell3Courses],
  ['grades', BarChart, messages.shell3Grades, messages.shell3Grades],
  ['progress', DonutLarge, messages.shell3Progress, messages.shell3Progress],
  ['certificates', WorkspacePremium, messages.shell3Certificates, messages.shell3CertsShort],
  ['hours', Schedule, messages.navHours, messages.navHoursShort], // only while CE hours are on (F-112)
];

const linkShape = PropTypes.shape({
  home: PropTypes.string.isRequired,
  courses: PropTypes.string,
  grades: PropTypes.string,
  progress: PropTypes.string,
  certificates: PropTypes.string,
  hours: PropTypes.string,
  account: PropTypes.string,
  signOut: PropTypes.string,
  privacy: PropTypes.string,
  accessibility: PropTypes.string,
});
const itemShape = PropTypes.shape({ label: PropTypes.string.isRequired, href: PropTypes.string.isRequired });
const userShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  email: PropTypes.string,
  position: PropTypes.string,
  department: PropTypes.string,
  photoUrl: PropTypes.string,
});
const textShape = PropTypes.shape({ en: PropTypes.string, th: PropTypes.string });

// Shell 3 sidebar: open unless the learner collapsed it (remembered per browser, same key as Plan 4).
const SIDEBAR_KEY = 'elmp.sidebar';
export function useSidebar3() {
  const [state, setState] = useState(() => {
    try { return window.localStorage.getItem(SIDEBAR_KEY) === 'collapsed' ? 'collapsed' : 'expanded'; } catch (e) { return 'expanded'; }
  });
  const toggle = () => setState((s) => {
    const next = s === 'collapsed' ? 'expanded' : 'collapsed';
    try { window.localStorage.setItem(SIDEBAR_KEY, next); } catch (e) { /* private mode: not remembered */ }
    return next;
  });
  return [state, toggle];
}

// One open dropdown at a time; Esc and outside click close it and focus goes back to its button.
export function useDropdown() {
  const [open, setOpen] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) { return undefined; }
    const close = (focus) => {
      setOpen(null);
      if (focus) { ref.current?.querySelector(`[data-dd="${open}"]`)?.focus(); }
    };
    const onDown = (e) => { if (!ref.current?.contains(e.target)) { close(false); } };
    const onKey = (e) => { if (e.key === 'Escape') { close(true); } };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const toggle = (name) => setOpen((o) => (o === name ? null : name));
  return {
    open, setOpen, toggle, ref,
  };
}

export const SidebarNav3 = ({
  current, links, user, state = 'auto', onToggle, logoUrl,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m) => intl.formatMessage(m);
  const collapsed = state === 'collapsed';
  return (
    <nav className="cls3-side" data-state={state} aria-label={t(messages.sidebarLabel)}>
      <div className="cls3-side__brand">
        <Link className="cls3-side__logo" href={links.home} aria-label={t(messages.brandHome)}>
          {logoUrl ? <img src={logoUrl} alt="" /> : <span className="cls3-side__mark" aria-hidden="true">M</span>}
          <span className="cls3-side__label">Mission Hospital <b>Learning</b></span>
        </Link>
      </div>
      <p className="cls3-side__group" aria-hidden="true"><span className="cls3-side__label">{t(messages.shell3Group)}</span></p>
      <ul className="cls3-side__list">
        {PAGES.filter(([key]) => links[key]).map(([key, icon, label]) => (
          <li key={key}>
            <Link className="cls3-side__item" href={links[key]} aria-current={current === key ? 'page' : undefined} title={t(label)}>
              <KitIcon src={icon} size={22} />
              <span className="cls3-side__label">{t(label)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="cls3-side__foot">
        {user && (
          <div className="cls3-side__who">
            <Avatar user={user} />
            <span className="cls3-side__label">
              <b>{user.name}</b>
              {(user.position || user.department) && <small>{[user.position, user.department].filter(Boolean).join(' · ')}</small>}
            </span>
          </div>
        )}
        {links.signOut && (
          <a className="cls3-side__item cls3-side__out" href={links.signOut} title={t(messages.signOut)}>
            <KitIcon src={Logout} size={22} />
            <span className="cls3-side__label">{t(messages.signOut)}</span>
          </a>
        )}
        {onToggle && (
          <button type="button" className="cls3-side__item cls3-side__toggle" onClick={onToggle} aria-expanded={!collapsed}>
            <KitIcon src={collapsed ? ChevronRight : ChevronLeft} size={22} />
            <span className="cls3-side__label">{t(collapsed ? messages.shell3Expand : messages.shell3Collapse)}</span>
          </button>
        )}
      </div>
    </nav>
  );
};

SidebarNav3.propTypes = {
  current: PropTypes.oneOf(['home', 'courses', 'grades', 'progress', 'certificates', 'hours']),
  links: linkShape.isRequired,
  user: userShape,
  state: PropTypes.oneOf(['auto', 'collapsed', 'expanded']),
  onToggle: PropTypes.func,
  logoUrl: PropTypes.string,
};

// Search box with a suggestion list (D-76). Part 1: suggestions = course titles the app already has
// (CA-11) + help items; Part 2: the app passes CA-15 results. Enter without a pick → onSearch(q).
export const SearchBox = ({
  items, onSearch, dd, maxShown = 6,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const [q, setQ] = useState('');
  const listId = useId();
  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((i) => !needle || i.label.toLowerCase().includes(needle)).slice(0, maxShown);
  }, [items, q, maxShown]);
  const open = dd.open === 'search';
  return (
    <form
      className="cls3-search"
      role="search"
      onSubmit={(e) => { e.preventDefault(); dd.setOpen(null); onSearch?.(q.trim()); }}
    >
      <KitIcon src={Search} size={18} />
      <input
        type="search"
        value={q}
        data-dd="search"
        onChange={(e) => { setQ(e.target.value); dd.setOpen('search'); }}
        onFocus={() => dd.setOpen('search')}
        placeholder={intl.formatMessage(messages.shell3Search)}
        aria-label={intl.formatMessage(messages.shell3Search)}
        role="combobox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-autocomplete="list"
      />
      {open && (
        <ul className="cls3-menu cls3-menu--suggest" id={listId} aria-label={intl.formatMessage(messages.shell3Suggestions)}>
          {shown.length === 0
            ? <li className="cls3-menu__none">{intl.formatMessage(messages.shell3NoSuggestions)}</li>
            : shown.map((i) => (
              <li key={`${i.href}|${i.label}`}>
                <Link className="cls3-menu__item" href={i.href} onClick={() => dd.setOpen(null)}>{i.label}</Link>
              </li>
            ))}
        </ul>
      )}
    </form>
  );
};

SearchBox.propTypes = {
  items: PropTypes.arrayOf(itemShape).isRequired,
  onSearch: PropTypes.func,
  dd: PropTypes.shape({ open: PropTypes.string, setOpen: PropTypes.func }).isRequired,
  maxShown: PropTypes.number,
};

// A labelled button + menu of links (Explore, Help).
const LinkMenu = ({
  name, dd, label, icon, items, showLabel = false, right = false, footer,
}) => {
  const Link = useLinkComponent();
  const open = dd.open === name;
  const menuId = useId();
  return (
    <div className="cls3-dd">
      <button
        type="button"
        className={`cls3-tb-btn${showLabel ? ' cls3-tb-btn--label' : ''}`}
        data-dd={name}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={showLabel ? undefined : label}
        onClick={() => dd.toggle(name)}
      >
        <KitIcon src={icon} size={20} />
        {showLabel && <b>{label}</b>}
        {showLabel && <KitIcon src={KeyboardArrowDown} size={18} />}
      </button>
      {open && (
        <ul className={`cls3-menu${right ? ' cls3-menu--right' : ''}`} id={menuId}>
          {items.map((i) => (
            <li key={`${i.href}|${i.label}`}>
              <Link className="cls3-menu__item" href={i.href} onClick={() => dd.setOpen(null)}>{i.label}</Link>
            </li>
          ))}
          {footer}
        </ul>
      )}
    </div>
  );
};

LinkMenu.propTypes = {
  name: PropTypes.string.isRequired,
  dd: PropTypes.shape({ open: PropTypes.string, setOpen: PropTypes.func, toggle: PropTypes.func }).isRequired,
  label: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  items: PropTypes.arrayOf(itemShape).isRequired,
  showLabel: PropTypes.bool,
  right: PropTypes.bool,
  footer: PropTypes.node,
};

const LanguageMenu = ({ dd, locale, onLocaleChange }) => {
  const intl = useClassroomIntl();
  const lang = kitLanguage(locale);
  const open = dd.open === 'lang';
  const listId = useId();
  return (
    <div className="cls3-dd">
      <button
        type="button"
        className="cls3-tb-btn cls3-tb-btn--label"
        data-dd="lang"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={intl.formatMessage(messages.languageGroup)}
        onClick={() => dd.toggle('lang')}
      >
        <KitIcon src={Language} size={20} />
        <b>{lang.toUpperCase()}</b>
      </button>
      {open && (
        <ul className="cls3-menu cls3-menu--right" role="listbox" id={listId} aria-label={intl.formatMessage(messages.languageGroup)}>
          {[['en', 'English'], ['th', 'ไทย (Thai)']].map(([code, full]) => (
            <li key={code} role="presentation">
              <button
                type="button"
                role="option"
                lang={code}
                aria-selected={lang === code}
                className="cls3-menu__item"
                onClick={() => { dd.setOpen(null); if (lang !== code) { onLocaleChange?.(code); } }}
              >
                <span>{full}</span>
                {lang === code && <span className="cls3-menu__tick" aria-hidden="true">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

LanguageMenu.propTypes = {
  dd: PropTypes.shape({ open: PropTypes.string, setOpen: PropTypes.func, toggle: PropTypes.func }).isRequired,
  locale: PropTypes.string,
  onLocaleChange: PropTypes.func,
};

const ProfileMenu = ({ dd, user, links }) => {
  const intl = useClassroomIntl();
  const open = dd.open === 'profile';
  const menuId = useId();
  const first = user.name.split(/\s+/)[0];
  return (
    <div className="cls3-dd">
      <button
        type="button"
        className="cls3-profile"
        data-dd="profile"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={intl.formatMessage(messages.accountButton, { name: user.name })}
        onClick={() => dd.toggle('profile')}
      >
        <Avatar user={user} />
        <span className="cls3-profile__name" aria-hidden="true">{first}</span>
        <KitIcon src={KeyboardArrowDown} size={18} />
      </button>
      {open && (
        <div className="cls3-menu cls3-menu--right cls3-menu--profile" id={menuId}>
          <div className="cls3-menu__head">
            <b>{user.name}</b>
            {user.email && <small>{user.email}</small>}
          </div>
          <div role="menu" aria-label={user.name}>
            {links.account && <a role="menuitem" className="cls3-menu__item" href={links.account}>{intl.formatMessage(messages.shell3Profile)}</a>}
            {links.signOut && <a role="menuitem" className="cls3-menu__item cls3-menu__item--danger" href={links.signOut}>{intl.formatMessage(messages.signOut)}</a>}
          </div>
        </div>
      )}
    </div>
  );
};

ProfileMenu.propTypes = {
  dd: PropTypes.shape({ open: PropTypes.string, toggle: PropTypes.func }).isRequired,
  user: userShape.isRequired,
  links: linkShape.isRequired,
};

export const TopBar3 = ({
  title, user, links, locale, onLocaleChange, categories = [], allCoursesHref, searchItems, onSearch, helpItems = [],
  unread = 0, onOpenMessages,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const dd = useDropdown();
  const t = (m) => intl.formatMessage(m);
  const exploreFooter = allCoursesHref ? (
    <li className="cls3-menu__sep"><Link className="cls3-menu__item" href={allCoursesHref} onClick={() => dd.setOpen(null)}>{t(messages.shell3ExploreAll)}</Link></li>
  ) : null;
  return (
    <header className="cls3-topbar">
      <div className="cls3-topbar__inner" ref={dd.ref}>
        <span className="cls3-topbar__mark" aria-hidden="true">M</span>
        <h1 className="cls3-topbar__title">{title}</h1>
        {categories.length > 0 && (
          <LinkMenu name="explore" dd={dd} label={t(messages.shell3Explore)} icon={Apps} items={categories} showLabel footer={exploreFooter} />
        )}
        {searchItems && <SearchBox items={searchItems} onSearch={onSearch} dd={dd} />}
        <div className="cls3-topbar__right">
          <LanguageMenu dd={dd} locale={locale} onLocaleChange={onLocaleChange} />
          {helpItems.length > 0 && <LinkMenu name="help" dd={dd} label={t(messages.shell3Help)} icon={HelpOutline} items={helpItems} right />}
          {onOpenMessages && <MessagesButton unread={unread} onClick={onOpenMessages} />}
          {user && <ProfileMenu dd={dd} user={user} links={links} />}
        </div>
      </div>
    </header>
  );
};

TopBar3.propTypes = {
  title: PropTypes.string.isRequired,
  user: userShape,
  links: linkShape.isRequired,
  locale: PropTypes.string,
  onLocaleChange: PropTypes.func,
  categories: PropTypes.arrayOf(itemShape),
  allCoursesHref: PropTypes.string,
  searchItems: PropTypes.arrayOf(itemShape), // undefined = no search box (features.search off)
  onSearch: PropTypes.func,
  helpItems: PropTypes.arrayOf(itemShape),
  unread: PropTypes.number,
  onOpenMessages: PropTypes.func,
};

const DISMISS_KEY = 'elmp.banner.dismissed';
const readDismissed = () => {
  try { return window.sessionStorage.getItem(DISMISS_KEY); } catch (e) { return null; }
};

// Green banner (D-77). `announcement` = CA-14 `data` (or null → nothing). Dismissed per browser tab, by id.
export const AnnouncementBanner = ({ announcement, locale }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const [dismissed, setDismissed] = useState(readDismissed);
  if (!announcement || String(announcement.id) === dismissed) { return null; }
  const lang = kitLanguage(locale);
  const pick = (v) => (v ? v[lang] || v.en : '');
  const dismiss = () => {
    setDismissed(String(announcement.id));
    try { window.sessionStorage.setItem(DISMISS_KEY, String(announcement.id)); } catch (e) { /* private mode */ }
  };
  return (
    <section className={`cls3-banner cls3-banner--${announcement.tone === 'urgent' ? 'urgent' : 'info'}`} aria-label={intl.formatMessage(messages.shell3Announcement)}>
      <KitIcon src={Campaign} size={22} />
      <p>
        {pick(announcement.text)}
        {announcement.link && <>{' '}<Link href={announcement.link.href}>{pick(announcement.link.label)}</Link></>}
      </p>
      <button type="button" className="cls3-banner__close" onClick={dismiss} aria-label={intl.formatMessage(messages.shell3Dismiss)}>
        <KitIcon src={Close} size={20} />
      </button>
    </section>
  );
};

AnnouncementBanner.propTypes = {
  announcement: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    tone: PropTypes.oneOf(['info', 'urgent']),
    text: textShape.isRequired,
    link: PropTypes.shape({ href: PropTypes.string.isRequired, label: textShape.isRequired }),
  }),
  locale: PropTypes.string,
};

export const BottomTabs3 = ({ current, links }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  return (
    <nav className="cls3-tabs cls-root" aria-label={intl.formatMessage(messages.tabsLabel)}>
      {PAGES.filter(([key]) => key !== 'hours' && links[key]).map(([key, icon,, short]) => (
        <Link key={key} href={links[key]} aria-current={current === key ? 'page' : undefined}>
          <KitIcon src={icon} size={24} />
          <span>{intl.formatMessage(short)}</span>
        </Link>
      ))}
    </nav>
  );
};

BottomTabs3.propTypes = {
  current: PropTypes.oneOf(['home', 'courses', 'grades', 'progress', 'certificates', 'hours']),
  links: linkShape.isRequired,
};

export const ClassroomShell3 = ({
  current, title, links, user, locale, onLocaleChange, logoUrl, announcement, categories, allCoursesHref,
  searchItems, onSearch, helpItems, unread, onOpenMessages, pageAs = 'main', children,
}) => {
  const intl = useClassroomIntl();
  const [state, toggle] = useSidebar3();
  const Page = pageAs === 'div' ? 'div' : 'main';
  return (
    <div className="cls3-shell cls-root" data-sidebar={state} lang={kitLanguage(locale)}>
      <AnnouncementBanner announcement={announcement} locale={locale} />
      <div className="cls3-shell__frame">
        <SidebarNav3 current={current} links={links} user={user} state={state} onToggle={toggle} logoUrl={logoUrl} />
        <div className="cls3-shell__main">
          <TopBar3
            title={title}
            user={user}
            links={links}
            locale={locale}
            onLocaleChange={onLocaleChange}
            categories={categories}
            allCoursesHref={allCoursesHref || links.courses}
            searchItems={searchItems}
            onSearch={onSearch}
            helpItems={helpItems}
            unread={unread}
            onOpenMessages={onOpenMessages}
          />
          <Page className="cls3-shell__page" id={Page === 'main' ? 'main' : undefined}>{children}</Page>
          <footer className="cls3-footer">
            <p>{intl.formatMessage(messages.shell3Footer, { year: new Date().getFullYear() })}</p>
            <div className="cls3-footer__links">
              {links.privacy && <a href={links.privacy}>{intl.formatMessage(messages.shell3Privacy)}</a>}
              {links.accessibility && (
                <a href={links.accessibility}>{intl.formatMessage(messages.shell3Accessibility)}</a>
              )}
            </div>
          </footer>
        </div>
      </div>
      <BottomTabs3 current={current} links={links} />
    </div>
  );
};

ClassroomShell3.propTypes = {
  current: PropTypes.oneOf(['home', 'courses', 'grades', 'progress', 'certificates', 'hours']),
  title: PropTypes.string.isRequired,
  links: linkShape.isRequired,
  user: userShape,
  locale: PropTypes.string,
  onLocaleChange: PropTypes.func,
  logoUrl: PropTypes.string,
  announcement: AnnouncementBanner.propTypes.announcement,
  categories: PropTypes.arrayOf(itemShape),
  allCoursesHref: PropTypes.string,
  searchItems: PropTypes.arrayOf(itemShape),
  onSearch: PropTypes.func,
  helpItems: PropTypes.arrayOf(itemShape),
  unread: PropTypes.number,
  onOpenMessages: PropTypes.func,
  pageAs: PropTypes.oneOf(['main', 'div']),
  children: PropTypes.node,
};
