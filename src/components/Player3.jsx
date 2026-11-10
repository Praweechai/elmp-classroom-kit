import {
  useEffect, useId, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  AccessibilityNew, ArrowBackIos, ChevronLeft, ChevronRight, Close, DarkMode, Description, ExpandMore, Fullscreen,
  FullscreenExit, LightMode, Lock, MenuOpen, Search,
} from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import useDisplaySettings, { TEXT_SCALE, displayAttributes } from '../player/useDisplaySettings';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';
import { LanguageMenu, useDropdown } from './Shell3';

// S-105 Course player 3 (F-136, D-81, NetAcad arrangement): own top bar (outline toggle, "‹ My Learning",
// logo, course title, the five tools), left panel with Course outline / Resources tabs, main area with
// breadcrumb + unit title + the lesson (children = the iframe), big side arrows and a footer pager.
// Outline data = the Plan 4 shape: sections → items {id, title, href, complete, current, locked}.

const clamp = (v) => Math.max(0, Math.min(100, Math.round(Number(v) || 0)));
const EDITABLE = /^(INPUT|TEXTAREA|SELECT)$/;
const SWITCHES = [['contrast', messages.pl3Contrast], ['spacing', messages.pl3Spacing], ['reduceMotion', messages.pl3Motion]];

// sections → one flat list of units with their place (1.1, 1.2 …) and section title.
export const flattenOutline = (sections = []) => sections.flatMap((s, si) => s.items.map((item, ii) => ({
  ...item, number: `${si + 1}.${ii + 1}`, sectionId: s.id, sectionTitle: s.title,
})));

const sectionPct = (s) => (
  s.items.length ? clamp((s.items.filter((i) => i.complete).length / s.items.length) * 100) : 0
);

// ← / → move between units, unless the learner is typing or a modifier is held.
export function useArrowKeys(onPrev, onNext, enabled = true) {
  useEffect(() => {
    if (!enabled) { return undefined; }
    const onKey = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || e.defaultPrevented) { return; }
      const el = e.target;
      if (el && (EDITABLE.test(el.tagName) || el.isContentEditable)) { return; }
      if (e.key === 'ArrowLeft' && onPrev) { e.preventDefault(); onPrev(); }
      if (e.key === 'ArrowRight' && onNext) { e.preventDefault(); onNext(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onPrev, onNext, enabled]);
}

// ---- Toolbar: dark mode, search in course, language, accessibility panel, full screen ----
export const PlayerToolbar = ({
  settings, onChange, onReset, units = [], onSelectUnit, locale, onLocaleChange, fullscreen, onToggleFullscreen,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  const dd = useDropdown();
  const [q, setQ] = useState('');
  const searchId = useId();
  const a11yId = useId();
  const needle = q.trim().toLowerCase();
  const results = needle
    ? units.filter((u) => !u.locked && `${u.title} ${u.sectionTitle}`.toLowerCase().includes(needle)).slice(0, 8)
    : [];
  const dark = settings.theme === 'dark';

  return (
    <div className="cls3-ptools" ref={dd.ref} role="toolbar" aria-label={t(messages.pl3Tools)}>
      <button
        type="button"
        className="cls3-ptool"
        aria-pressed={dark}
        aria-label={t(messages.pl3Dark)}
        title={t(messages.pl3Dark)}
        onClick={() => onChange({ theme: dark ? 'light' : 'dark' })}
      >
        <KitIcon src={dark ? LightMode : DarkMode} size={20} />
      </button>

      <div className="cls3-dd">
        <button
          type="button"
          className="cls3-ptool"
          data-dd="psearch"
          aria-expanded={dd.open === 'psearch'}
          aria-controls={dd.open === 'psearch' ? searchId : undefined}
          aria-label={t(messages.pl3Search)}
          title={t(messages.pl3Search)}
          onClick={() => dd.toggle('psearch')}
        >
          <KitIcon src={Search} size={20} />
        </button>
        {dd.open === 'psearch' && (
          <div className="cls3-pop cls3-pop--wide" id={searchId} role="search">
            <label className="cls3-filter" htmlFor={`${searchId}-q`}>
              <KitIcon src={Search} size={18} />
              <span className="cls-sr">{t(messages.pl3Search)}</span>
              {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
              <input id={`${searchId}-q`} type="search" autoFocus value={q} placeholder={t(messages.pl3SearchPlaceholder)} onChange={(e) => setQ(e.target.value)} />
            </label>
            {needle && results.length === 0 && <p className="cls3-menu__none">{t(messages.pl3NoMatches)}</p>}
            {results.length > 0 && (
              <ul className="cls3-pop__list">
                {results.map((u) => (
                  <li key={u.id}>
                    <Link
                      className="cls3-menu__item cls3-pop__hit"
                      href={u.href}
                      onClick={() => { dd.setOpen(null); setQ(''); onSelectUnit?.(u); }}
                    >
                      <b>{u.title}</b>
                      <small>{u.sectionTitle}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {onLocaleChange && <LanguageMenu dd={dd} locale={locale} onLocaleChange={onLocaleChange} />}

      <div className="cls3-dd">
        <button
          type="button"
          className="cls3-ptool"
          data-dd="a11y"
          aria-expanded={dd.open === 'a11y'}
          aria-controls={dd.open === 'a11y' ? a11yId : undefined}
          aria-label={t(messages.pl3A11y)}
          title={t(messages.pl3A11y)}
          onClick={() => dd.toggle('a11y')}
        >
          <KitIcon src={AccessibilityNew} size={20} />
        </button>
        {dd.open === 'a11y' && (
          <div className="cls3-pop cls3-pop--a11y" id={a11yId} role="group" aria-label={t(messages.pl3A11y)}>
            <div className="cls3-pop__row">
              <span id={`${a11yId}-size`}>{t(messages.pl3TextSize)}</span>
              <div className="cls3-stepper" role="group" aria-labelledby={`${a11yId}-size`}>
                <button
                  type="button"
                  aria-label={t(messages.pl3Smaller)}
                  disabled={settings.textScale <= TEXT_SCALE.min}
                  onClick={() => onChange({ textScale: settings.textScale - TEXT_SCALE.step })}
                >
                  A−
                </button>
                <b className="cls-num" aria-live="polite">{`${settings.textScale}%`}</b>
                <button
                  type="button"
                  aria-label={t(messages.pl3Larger)}
                  disabled={settings.textScale >= TEXT_SCALE.max}
                  onClick={() => onChange({ textScale: settings.textScale + TEXT_SCALE.step })}
                >
                  A+
                </button>
              </div>
            </div>
            {SWITCHES.map(([k, m]) => (
              <label key={k} className="cls3-pop__row cls3-switch" htmlFor={`${a11yId}-${k}`}>
                <span>{t(m)}</span>
                <input
                  id={`${a11yId}-${k}`}
                  type="checkbox"
                  role="switch"
                  checked={settings[k]}
                  onChange={(e) => onChange({ [k]: e.target.checked })}
                />
                <i aria-hidden="true" />
              </label>
            ))}
            <button type="button" className="cls-btn cls-btn--secondary cls-btn--sm" onClick={onReset}>{t(messages.pl3Reset)}</button>
          </div>
        )}
      </div>

      {onToggleFullscreen && (
        <button
          type="button"
          className="cls3-ptool"
          aria-pressed={Boolean(fullscreen)}
          aria-label={t(messages.pl3Fullscreen)}
          title={t(fullscreen ? messages.pl3ExitFullscreen : messages.pl3Fullscreen)}
          onClick={onToggleFullscreen}
        >
          <KitIcon src={fullscreen ? FullscreenExit : Fullscreen} size={20} />
        </button>
      )}
    </div>
  );
};

PlayerToolbar.propTypes = {
  settings: PropTypes.shape({
    theme: PropTypes.string,
    textScale: PropTypes.number,
    contrast: PropTypes.bool,
    spacing: PropTypes.bool,
    reduceMotion: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  units: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, title: PropTypes.string })),
  onSelectUnit: PropTypes.func,
  locale: PropTypes.string,
  onLocaleChange: PropTypes.func,
  fullscreen: PropTypes.bool,
  onToggleFullscreen: PropTypes.func,
};

// ---- Left panel: tabs Course outline / Resources ----
const itemShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  href: PropTypes.string,
  complete: PropTypes.bool,
  current: PropTypes.bool,
  locked: PropTypes.bool,
});
const sectionShape = PropTypes.shape({
  id: PropTypes.string.isRequired, title: PropTypes.string.isRequired, items: PropTypes.arrayOf(itemShape).isRequired,
});
const resourceShape = PropTypes.shape({
  title: PropTypes.string.isRequired, href: PropTypes.string.isRequired, type: PropTypes.string,
});

const UnitRow = ({ item, number, onNavigate }) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m) => intl.formatMessage(m);
  const state = (item.locked && 'locked') || (item.complete && 'done') || 'open';
  const stateText = [
    item.current && t(messages.outlineHere),
    (item.locked && t(messages.outlineLocked))
      || (item.complete ? t(messages.outlineComplete) : t(messages.outlineNotDone)),
  ].filter(Boolean).join(', ');
  const body = (
    <>
      <span className="cls3-unit__dot" aria-hidden="true">{item.locked && <KitIcon src={Lock} size={12} />}</span>
      <span className="cls3-unit__num cls-num" aria-hidden="true">{number}</span>
      <span className="cls3-unit__title">{item.title}</span>
      <span className="cls-sr">{` (${stateText})`}</span>
    </>
  );
  return (
    <li className={`cls3-unit cls3-unit--${state}${item.current ? ' is-current' : ''}`}>
      {item.locked || !item.href ? <span className="cls3-unit__link">{body}</span> : (
        <Link
          className="cls3-unit__link"
          href={item.href}
          aria-current={item.current ? 'page' : undefined}
          onClick={() => onNavigate?.(item)}
        >
          {body}
        </Link>
      )}
    </li>
  );
};
UnitRow.propTypes = { item: itemShape.isRequired, number: PropTypes.string.isRequired, onNavigate: PropTypes.func };

export const OutlinePanel = ({
  sections = [], resources = [], progress, onNavigate, id, onClose,
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const [tab, setTab] = useState('outline');
  const [q, setQ] = useState('');
  // Open the module with the current unit (or the first one when nothing is current).
  const [open, setOpen] = useState(() => {
    const hasCurrent = (x) => x.items.some((it) => it.current);
    const any = sections.some(hasCurrent);
    return Object.fromEntries(sections.map((s, i) => [s.id, hasCurrent(s) || (i === 0 && !any)]));
  });
  const tabIds = { outline: useId(), resources: useId() };
  const needle = q.trim().toLowerCase();
  const pct = progress == null ? null : clamp(progress);
  const tabs = resources.length > 0 ? ['outline', 'resources'] : ['outline'];
  const onTabKey = (e) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(e.key) || tabs.length < 2) { return; }
    const next = tabs[(tabs.indexOf(tab) + 1) % tabs.length];
    setTab(next);
    document.getElementById(`${tabIds[next]}-tab`)?.focus();
  };

  return (
    <aside className="cls3-outline" id={id} aria-label={t(messages.pl3Nav)}>
      <div className="cls3-outline__top">
        <div className="cls3-tabs" role="tablist" aria-label={t(messages.pl3Nav)}>
          {tabs.map((k) => (
            <button
              key={k}
              type="button"
              role="tab"
              id={`${tabIds[k]}-tab`}
              aria-selected={tab === k}
              aria-controls={tabIds[k]}
              tabIndex={tab === k ? 0 : -1}
              onKeyDown={onTabKey}
              onClick={() => setTab(k)}
            >
              {t(k === 'outline' ? messages.outlineTitle : messages.pl3Resources)}
            </button>
          ))}
        </div>
        {onClose && (
          <button type="button" className="cls-icon-btn cls3-outline__close" onClick={onClose} aria-label={t(messages.outlineClose)}>
            <KitIcon src={Close} size={20} />
          </button>
        )}
      </div>

      {tab === 'outline' && (
        <div className="cls3-outline__panel" role="tabpanel" id={tabIds.outline} aria-labelledby={`${tabIds.outline}-tab`}>
          <label className="cls3-filter cls3-outline__search" htmlFor={`${tabIds.outline}-q`}>
            <KitIcon src={Search} size={18} />
            <span className="cls-sr">{t(messages.pl3OutlineSearch)}</span>
            <input id={`${tabIds.outline}-q`} type="search" value={q} placeholder={t(messages.pl3OutlineSearch)} onChange={(e) => setQ(e.target.value)} />
          </label>
          {pct != null && (
            <div className="cls3-outline__overall">
              <span>{t(messages.playerProgress)}</span>
              <b className="cls-num">{`${pct}%`}</b>
              <div
                className="cls3-thinbar"
                role="progressbar"
                aria-label={t(messages.playerProgress)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={pct}
              >
                <i style={{ width: `${pct}%` }} />
              </div>
            </div>
          )}
          <ul className="cls3-mods">
            {sections.map((s, si) => {
              const items = s.items.map((it, ii) => [it, `${si + 1}.${ii + 1}`])
                .filter(([it]) => !needle || `${it.title} ${s.title}`.toLowerCase().includes(needle));
              if (needle && items.length === 0) { return null; }
              const expanded = needle ? true : Boolean(open[s.id]);
              const p = sectionPct(s);
              const panelId = `${tabIds.outline}-${s.id}`;
              return (
                <li key={s.id} className="cls3-mod">
                  <button
                    type="button"
                    className="cls3-mod__head"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    onClick={() => setOpen((o) => ({ ...o, [s.id]: !o[s.id] }))}
                  >
                    <span className="cls3-mod__title">{s.title}</span>
                    <span className="cls3-mod__pct cls-num">{`${p}%`}</span>
                    <KitIcon src={ExpandMore} size={20} className="cls3-mod__caret" />
                  </button>
                  <div className="cls3-thinbar cls3-thinbar--sm" aria-hidden="true"><i style={{ width: `${p}%` }} /></div>
                  {expanded && (
                    <ul className="cls3-units" id={panelId}>
                      {items.map(([it, n]) => <UnitRow key={it.id} item={it} number={n} onNavigate={onNavigate} />)}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
          {needle && sections.every((s) => !s.items.some((it) => it.title.toLowerCase().includes(needle))
            && !s.title.toLowerCase().includes(needle)) && <p className="cls3-menu__none">{t(messages.pl3NoMatches)}</p>}
        </div>
      )}

      {tab === 'resources' && (
        <div className="cls3-outline__panel" role="tabpanel" id={tabIds.resources} aria-labelledby={`${tabIds.resources}-tab`}>
          <ul className="cls3-res">
            {resources.map((r) => (
              <li key={r.href}>
                <a href={r.href} target="_blank" rel="noopener noreferrer">
                  <KitIcon src={Description} size={20} />
                  <span><b>{r.title}</b>{r.type && <small>{r.type}</small>}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
};

OutlinePanel.propTypes = {
  sections: PropTypes.arrayOf(sectionShape),
  resources: PropTypes.arrayOf(resourceShape),
  progress: PropTypes.number,
  onNavigate: PropTypes.func,
  id: PropTypes.string,
  onClose: PropTypes.func,
};

// ---- Pager: big side arrows + footer "‹ Previous · n / N · Next ›" ----
const PagerLink = ({
  unit, className, label, children, onNavigate,
}) => {
  const Link = useLinkComponent();
  if (!unit || unit.locked || !unit.href) {
    return <button type="button" className={className} disabled aria-label={label}>{children}</button>;
  }
  return (
    <Link className={className} href={unit.href} aria-label={label} onClick={() => onNavigate?.(unit)}>{children}</Link>
  );
};
PagerLink.propTypes = {
  unit: itemShape,
  className: PropTypes.string,
  label: PropTypes.string,
  children: PropTypes.node,
  onNavigate: PropTypes.func,
};

export const UnitPager = ({
  prev, next, index, total, onNavigate, variant = 'footer',
}) => {
  const intl = useClassroomIntl();
  const t = (m, v) => intl.formatMessage(m, v);
  const prevLabel = prev ? t(messages.pl3PrevUnit, { title: prev.title }) : t(messages.pl3Prev);
  const nextLabel = next ? t(messages.pl3NextUnit, { title: next.title }) : t(messages.pl3Next);
  if (variant === 'arrows') {
    return (
      <>
        <PagerLink unit={prev} className="cls3-arrow cls3-arrow--prev" label={prevLabel} onNavigate={onNavigate}>
          <KitIcon src={ChevronLeft} size={32} />
        </PagerLink>
        <PagerLink unit={next} className="cls3-arrow cls3-arrow--next" label={nextLabel} onNavigate={onNavigate}>
          <KitIcon src={ChevronRight} size={32} />
        </PagerLink>
      </>
    );
  }
  return (
    <nav className="cls3-pager" aria-label={t(messages.pl3Pager)}>
      <PagerLink unit={prev} className="cls-btn cls-btn--secondary cls-btn--sm" label={prevLabel} onNavigate={onNavigate}>
        <KitIcon src={ChevronLeft} size={18} />
        {t(messages.pl3Prev)}
      </PagerLink>
      {total > 0 && index > 0 && (
        <p className="cls3-pager__count cls-num">
          <span aria-hidden="true">{`${index} / ${total}`}</span>
          <span className="cls-sr">{t(messages.unitOf, { i: index, n: total })}</span>
        </p>
      )}
      <PagerLink unit={next} className="cls-btn cls-btn--primary cls-btn--sm" label={nextLabel} onNavigate={onNavigate}>
        {t(messages.pl3Next)}
        <KitIcon src={ChevronRight} size={18} />
      </PagerLink>
    </nav>
  );
};
UnitPager.propTypes = {
  prev: itemShape,
  next: itemShape,
  index: PropTypes.number,
  total: PropTypes.number,
  onNavigate: PropTypes.func,
  variant: PropTypes.oneOf(['footer', 'arrows']),
};

const wide = () => {
  try { return window.matchMedia('(min-width: 1024px)').matches; } catch (e) { return true; }
};

// ---- The whole player ----
const PlayerLayout3 = ({
  courseTitle, backHref, logoUrl, sections = [], resources = [], progress, locale, onLocaleChange, onNavigate,
  onDisplayChange, initialDisplay, unitTitle, children,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const t = (m, v) => intl.formatMessage(m, v);
  const root = useRef(null);
  const outlineId = useId();
  const { settings, update, reset } = useDisplaySettings(initialDisplay);
  const [outlineOpen, setOutlineOpen] = useState(wide);
  const [fullscreen, setFullscreen] = useState(false);

  const units = useMemo(() => flattenOutline(sections), [sections]);
  const at = units.findIndex((u) => u.current);
  const current = at >= 0 ? units[at] : null;
  const prev = at > 0 ? units[at - 1] : null;
  const next = at >= 0 && at < units.length - 1 ? units[at + 1] : null;

  useEffect(() => { onDisplayChange?.(settings); }, [settings, onDisplayChange]);
  useEffect(() => {
    const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  // ← / → press the side arrow links, so keys and clicks take the same (router-aware) path.
  const press = (dir) => root.current?.querySelector(`a.cls3-arrow--${dir}`)?.click();
  useArrowKeys(prev ? () => press('prev') : null, next ? () => press('next') : null);

  const navigated = (unit) => {
    if (!wide()) { setOutlineOpen(false); }
    onNavigate?.(unit);
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) { document.exitFullscreen?.(); return; }
    root.current?.requestFullscreen?.()?.catch?.(() => {});
  };
  const attrs = displayAttributes(settings);

  return (
    <div
      className={`cls-root cls3-player${outlineOpen ? ' is-outline-open' : ''}`}
      ref={root}
      lang={locale}
      {...attrs}
    >
      <header className="cls3-ptop" aria-label={t(messages.playerLabel)}>
        <button
          type="button"
          className="cls3-ptool cls3-ptop__toggle"
          aria-expanded={outlineOpen}
          aria-controls={outlineId}
          aria-label={t(messages.playerOutline)}
          onClick={() => setOutlineOpen((o) => !o)}
        >
          <KitIcon src={MenuOpen} size={22} />
        </button>
        <Link className="cls3-ptop__back" href={backHref} aria-label={t(messages.pl3BackLabel)}>
          <KitIcon src={ArrowBackIos} size={16} />
          <span>{t(messages.shell3MyLearning)}</span>
        </Link>
        {logoUrl && <img className="cls3-ptop__logo" src={logoUrl} alt={t(messages.brand)} />}
        <p className="cls3-ptop__title" title={courseTitle}>{courseTitle}</p>
        <PlayerToolbar
          settings={settings}
          onChange={update}
          onReset={reset}
          units={units}
          onSelectUnit={navigated}
          locale={locale}
          onLocaleChange={onLocaleChange}
          fullscreen={fullscreen}
          onToggleFullscreen={typeof document !== 'undefined' && document.fullscreenEnabled ? toggleFullscreen : undefined}
        />
      </header>

      <div className="cls3-pbody">
        {outlineOpen && (
          <button
            type="button"
            className="cls-scrim cls3-pbody__scrim"
            aria-label={t(messages.outlineClose)}
            tabIndex={-1}
            onClick={() => setOutlineOpen(false)}
          />
        )}
        {outlineOpen && (
          <OutlinePanel
            id={outlineId}
            sections={sections}
            resources={resources}
            progress={progress}
            onNavigate={navigated}
            onClose={() => setOutlineOpen(false)}
          />
        )}
        <main className="cls3-pmain">
          <UnitPager variant="arrows" prev={prev} next={next} onNavigate={onNavigate} />
          <div className="cls3-pmain__scroll">
            <article className="cls3-lesson">
              {current?.sectionTitle && <p className="cls3-lesson__crumb">{current.sectionTitle}</p>}
              <h1 className="cls3-lesson__title">{unitTitle || current?.title}</h1>
              <div className="cls3-lesson__frame">{children}</div>
              <UnitPager prev={prev} next={next} index={at + 1} total={units.length} onNavigate={onNavigate} />
            </article>
          </div>
        </main>
      </div>
    </div>
  );
};

PlayerLayout3.propTypes = {
  courseTitle: PropTypes.string.isRequired,
  backHref: PropTypes.string.isRequired,
  logoUrl: PropTypes.string,
  sections: PropTypes.arrayOf(sectionShape),
  resources: PropTypes.arrayOf(resourceShape),
  progress: PropTypes.number,
  locale: PropTypes.string,
  onLocaleChange: PropTypes.func,
  onNavigate: PropTypes.func, // (unit) after a unit link is used; the links themselves navigate (LinkContext)
  onDisplayChange: PropTypes.func, // (settings) → the fork posts them to the lesson iframe (postDisplay)
  initialDisplay: PropTypes.shape({}),
  unitTitle: PropTypes.string,
  children: PropTypes.node,
};

export default PlayerLayout3;
