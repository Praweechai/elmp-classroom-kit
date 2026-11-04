import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Home, Logout, Notifications, Schedule, Settings, WorkspacePremium,
} from '@openedx/paragon/icons';

import { kitLanguage, messages, useClassroomIntl } from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

const linkShape = PropTypes.shape({
  home: PropTypes.string.isRequired,
  certificates: PropTypes.string.isRequired,
  hours: PropTypes.string.isRequired,
  account: PropTypes.string,
  signOut: PropTypes.string,
  portal: PropTypes.string,
});

const userShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  position: PropTypes.string,
  department: PropTypes.string,
  photoUrl: PropTypes.string,
});

const initials = (name = '') => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0])
  .join('')
  .toUpperCase();

export const Avatar = ({ user, large = false }) => (user.photoUrl
  ? <img className={`cls-avatar${large ? ' cls-avatar--lg' : ''}`} src={user.photoUrl} alt="" />
  : <span className={`cls-avatar${large ? ' cls-avatar--lg' : ''}`} aria-hidden="true">{initials(user.name)}</span>);

Avatar.propTypes = { user: userShape.isRequired, large: PropTypes.bool };

export const LanguageToggle = ({ value, onChange }) => {
  const intl = useClassroomIntl();
  const lang = kitLanguage(value);
  return (
    <span className="cls-seg" role="group" aria-label={intl.formatMessage(messages.languageGroup)}>
      {[['th', 'TH', 'ไทย'], ['en', 'EN', 'English']].map(([code, short, full]) => (
        <button
          key={code}
          type="button"
          lang={code}
          aria-pressed={lang === code}
          aria-label={full}
          onClick={() => lang !== code && onChange?.(code)}
        >
          {short}
        </button>
      ))}
    </span>
  );
};

LanguageToggle.propTypes = { value: PropTypes.string, onChange: PropTypes.func };

// Account menu popover (doc 04 §6.8, S-78): Esc and outside click close, focus returns to the trigger.
export const AccountMenu = ({
  user, links, locale, onLocaleChange,
}) => {
  const intl = useClassroomIntl();
  const [open, setOpen] = useState(false);
  const anchor = useRef(null);
  const trigger = useRef(null);
  const menuId = 'cls-account-menu';

  useEffect(() => {
    if (!open) { return undefined; }
    anchor.current?.querySelector('[role="menu"] a, [role="menu"] button')?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); }
    };
    const onClick = (e) => { if (!anchor.current?.contains(e.target)) { setOpen(false); } };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  const meta = [user.position, user.department].filter(Boolean).join(' · ');
  return (
    <div className="cls-menu-anchor" ref={anchor}>
      <button
        ref={trigger}
        type="button"
        className="cls-avatar-btn"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={intl.formatMessage(messages.accountButton, { name: user.name })}
        onClick={() => setOpen(!open)}
      >
        <Avatar user={user} />
      </button>
      {open && (
        <div className="cls-menu" id={menuId}>
          <div className="cls-menu__who">
            <Avatar user={user} large />
            <span><b>{user.name}</b>{meta && <span>{meta}</span>}</span>
          </div>
          <hr />
          <div role="menu" aria-label={user.name}>
            {links.account && (
              <a role="menuitem" className="cls-menu__item" href={links.account}>
                <KitIcon src={Settings} size={20} />{intl.formatMessage(messages.accountSettings)}
              </a>
            )}
            <div className="cls-menu__item" role="none">
              {intl.formatMessage(messages.language)}
              <LanguageToggle value={locale} onChange={onLocaleChange} />
            </div>
            <hr />
            {links.signOut && (
              <a role="menuitem" className="cls-menu__item cls-menu__item--danger" href={links.signOut}>
                <KitIcon src={Logout} size={20} />{intl.formatMessage(messages.signOut)}
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

AccountMenu.propTypes = {
  user: userShape.isRequired, links: linkShape.isRequired, locale: PropTypes.string, onLocaleChange: PropTypes.func,
};

const MessagesButton = ({ unread, onClick, className = '' }) => {
  const intl = useClassroomIntl();
  return (
    <button
      type="button"
      className={`cls-icon-btn ${className}`.trim()}
      onClick={onClick}
      aria-label={intl.formatMessage(messages.messagesButton, { count: unread })}
    >
      <KitIcon src={Notifications} size={22} />
      {unread > 0 && <span className="cls-badge" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}
    </button>
  );
};

MessagesButton.propTypes = { unread: PropTypes.number, onClick: PropTypes.func, className: PropTypes.string };

// Classroom header (doc 04 §5.1, F-98). Never shows the platform name (A3-6).
export const ClassroomHeader = ({
  current, links, user, unread = 0, locale, onLocaleChange, onOpenMessages, logoUrl,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = [
    ['home', links.home, messages.navHome],
    ['certificates', links.certificates, messages.navCertificates],
    ['hours', links.hours, messages.navHours],
  ];
  return (
    <header className={`cls-header cls-root${scrolled ? ' is-scrolled' : ''}`}>
      <div className="cls-header__in">
        <Link className="cls-logo" href={links.home} aria-label={intl.formatMessage(messages.brandHome)}>
          {logoUrl && <img src={logoUrl} alt="" />}
          <span>Mission Hospital <b>Learning</b></span>
        </Link>
        <nav className="cls-header__nav" aria-label={intl.formatMessage(messages.navLabel)}>
          {nav.map(([key, href, label]) => (
            <Link key={key} href={href} aria-current={current === key ? 'page' : undefined}>{intl.formatMessage(label)}</Link>
          ))}
        </nav>
        <div className="cls-header__right">
          {links.portal && <a className="cls-btn cls-btn--ghost cls-btn--sm cls-header__portal" href={links.portal}>{intl.formatMessage(messages.portalLink)}</a>}
          <LanguageToggle value={locale} onChange={onLocaleChange} />
          <MessagesButton unread={unread} onClick={onOpenMessages} />
          {user && <AccountMenu user={user} links={links} locale={locale} onLocaleChange={onLocaleChange} />}
        </div>
      </div>
    </header>
  );
};

ClassroomHeader.propTypes = {
  current: PropTypes.oneOf(['home', 'certificates', 'hours']),
  links: linkShape.isRequired,
  user: userShape,
  unread: PropTypes.number,
  locale: PropTypes.string,
  onLocaleChange: PropTypes.func,
  onOpenMessages: PropTypes.func,
  logoUrl: PropTypes.string,
};

// Phone tab bar < 768 px (doc 04 §5.2); hidden in the player.
export const BottomTabs = ({
  current, links, unread = 0, onOpenMessages,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const tabs = [
    ['home', links.home, Home, messages.navHomeShort],
    ['certificates', links.certificates, WorkspacePremium, messages.navCertificates],
    ['hours', links.hours, Schedule, messages.navHoursShort],
  ];
  return (
    <nav className="cls-tabs cls-root" aria-label={intl.formatMessage(messages.tabsLabel)}>
      {tabs.map(([key, href, icon, label]) => (
        <Link key={key} href={href} aria-current={current === key ? 'page' : undefined}>
          <KitIcon src={icon} size={24} />
          {intl.formatMessage(label)}
        </Link>
      ))}
      <button type="button" onClick={onOpenMessages} aria-label={intl.formatMessage(messages.messagesButton, { count: unread })}>
        <KitIcon src={Notifications} size={24} />
        <span aria-hidden="true">{intl.formatMessage(messages.navMessages)}</span>
        {unread > 0 && <span className="cls-badge" aria-hidden="true">{unread > 9 ? '9+' : unread}</span>}
      </button>
    </nav>
  );
};

BottomTabs.propTypes = {
  current: PropTypes.oneOf(['home', 'certificates', 'hours']),
  links: linkShape.isRequired,
  unread: PropTypes.number,
  onOpenMessages: PropTypes.func,
};
