import {
  useEffect, useId, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import {
  CheckCircle, Close, ExpandMore, Lock, MenuIcon, RadioButtonUnchecked,
} from '@openedx/paragon/icons';

import { messages, useClassroomIntl } from '../i18n';
import KitIcon from './KitIcon';
import { useLinkComponent } from './LinkContext';

const hasCurrent = (section) => section.items.some((item) => item.current);
const stateOf = (item) => {
  if (item.locked) { return 'locked'; }
  return item.complete ? 'complete' : 'open';
};

// Module state icon (F-116): check when all done, a part-filled ring while in progress, lock when gated.
const SectionMark = ({ done, total, locked }) => {
  if (locked) { return <KitIcon src={Lock} size={18} className="cls-outline__mark cls-outline__mark--locked" />; }
  if (total > 0 && done >= total) { return <KitIcon src={CheckCircle} size={18} className="cls-outline__mark cls-outline__mark--complete" />; }
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <svg className="cls-outline__mark cls-outline__mark--ring" width="18" height="18" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <circle cx="10" cy="10" r="8" pathLength="100" className="cls-outline__ring-track" />
      {pct > 0 && <circle cx="10" cy="10" r="8" pathLength="100" className="cls-outline__ring-fill" strokeDasharray={`${pct} 100`} />}
    </svg>
  );
};

SectionMark.propTypes = {
  done: PropTypes.number.isRequired, total: PropTypes.number.isRequired, locked: PropTypes.bool,
};

// One accordion section: header button (number + title + "3 / 5 done" + chevron) and its rows.
const OutlineSection = ({
  section, open, onToggle, HeadingTag, onNavigate, number,
}) => {
  const intl = useClassroomIntl();
  const Link = useLinkComponent();
  const panelId = useId();
  const seenDone = useRef(new Set(section.items.filter((item) => item.complete).map((item) => item.id)));
  useEffect(() => {
    section.items.forEach((item) => { if (item.complete) { seenDone.current.add(item.id); } });
  });
  const done = section.items.filter((item) => item.complete).length;
  const allLocked = section.items.length > 0 && section.items.every((item) => item.locked);
  const total = section.items.length;
  return (
    <li className={`cls-outline__section${open ? ' is-open' : ''}`}>
      <HeadingTag className="cls-outline__heading">
        <button type="button" className="cls-outline__toggle" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          {number != null && <SectionMark done={done} total={total} locked={allLocked} />}
          {number != null && <span className="cls-outline__num cls-num" aria-hidden="true">{number}</span>}
          <span className="cls-outline__title">{section.title}</span>
          <span className="cls-outline__count cls-num">{intl.formatMessage(messages.outlineDone, { done, total })}</span>
          <KitIcon src={ExpandMore} className="cls-outline__chevron" />
        </button>
      </HeadingTag>
      <ol id={panelId} className="cls-outline__items" hidden={!open}>
        {section.items.map((item, index) => {
          const state = stateOf(item);
          const icon = { locked: Lock, complete: CheckCircle, open: RadioButtonUnchecked }[state];
          const statusText = intl.formatMessage({
            locked: messages.outlineLocked, complete: messages.outlineComplete, open: messages.outlineNotDone,
          }[state]);
          const body = (
            <>
              <KitIcon
                src={icon}
                size={20}
                className={`cls-outline__state cls-outline__state--${state}${
                  state === 'complete' && !seenDone.current.has(item.id) ? ' is-just-done' : ''}`}
              />
              {number != null && <span className="cls-outline__num cls-num" aria-hidden="true">{`${number}.${index + 1}`}</span>}
              <span className="cls-outline__label">
                {item.title}
                <span className="cls-sr">
                  {`, ${statusText}`}
                  {item.current ? `, ${intl.formatMessage(messages.outlineHere)}` : ''}
                </span>
              </span>
              {item.minutes > 0 && (
                <span className="cls-outline__time cls-num">{intl.formatMessage(messages.minutes, { n: item.minutes })}</span>
              )}
            </>
          );
          const cls = `cls-outline__row${item.current ? ' is-current' : ''}${item.locked ? ' is-locked' : ''}`;
          return (
            <li key={item.id}>
              {item.href && !item.locked ? (
                <Link
                  className={cls}
                  href={item.href}
                  aria-current={item.current ? 'location' : undefined}
                  onClick={onNavigate ? (event) => onNavigate(item, event) : undefined}
                >
                  {body}
                </Link>
              ) : <div className={cls}>{body}</div>}
            </li>
          );
        })}
      </ol>
    </li>
  );
};

OutlineSection.propTypes = {
  section: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  }).isRequired,
  open: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  HeadingTag: PropTypes.elementType.isRequired,
  onNavigate: PropTypes.func,
  number: PropTypes.number,
};

// Course outline for S-75 (course home) and the S-76 drawer (doc 04 §5.11).
// Sections open by default when they hold the current item (or `open: true`); "Expand all" toggles every one.
// `numbered` (player tree, F-116): modules 1, 2, 3 and topics 1.1, 1.2…
const CourseOutline = ({
  sections, title, headingLevel = 2, showExpandAll = true, onNavigate, variant = 'page', numbered = false,
}) => {
  const intl = useClassroomIntl();
  const initial = () => Object.fromEntries(sections.map((s) => [s.id, Boolean(s.open || hasCurrent(s))]));
  const [openIds, setOpenIds] = useState(initial);
  const sectionKey = sections.map((s) => s.id).join('|');
  // New course data (e.g. after a refresh) → keep what the learner opened, open new current sections.
  useEffect(() => {
    setOpenIds((prev) => ({ ...initial(), ...prev }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionKey]);

  const allOpen = sections.length > 0 && sections.every((s) => openIds[s.id]);
  const HeadingTag = `h${Math.min(6, headingLevel + 1)}`;
  const TitleTag = `h${headingLevel}`;
  return (
    <section className={`cls-outline cls-outline--${variant}`} aria-label={title ? undefined : intl.formatMessage(messages.outlineTitle)}>
      {(title || showExpandAll) && (
        <div className="cls-outline__top">
          {title && <TitleTag className="cls-outline__name">{title}</TitleTag>}
          {showExpandAll && sections.length > 1 && (
            <button
              type="button"
              className="cls-btn cls-btn--ghost cls-btn--sm"
              onClick={() => setOpenIds(Object.fromEntries(sections.map((s) => [s.id, !allOpen])))}
            >
              {intl.formatMessage(allOpen ? messages.outlineCollapseAll : messages.outlineExpandAll)}
            </button>
          )}
        </div>
      )}
      <ol className="cls-outline__list">
        {sections.map((section, index) => (
          <OutlineSection
            key={section.id}
            number={numbered ? index + 1 : undefined}
            section={section}
            open={Boolean(openIds[section.id])}
            onToggle={() => setOpenIds((prev) => ({ ...prev, [section.id]: !prev[section.id] }))}
            HeadingTag={HeadingTag}
            onNavigate={onNavigate}
          />
        ))}
      </ol>
    </section>
  );
};

CourseOutline.propTypes = {
  sections: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    open: PropTypes.bool,
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      href: PropTypes.string,
      complete: PropTypes.bool,
      current: PropTypes.bool,
      locked: PropTypes.bool,
      minutes: PropTypes.number,
    })).isRequired,
  })).isRequired,
  title: PropTypes.string,
  headingLevel: PropTypes.number,
  showExpandAll: PropTypes.bool,
  onNavigate: PropTypes.func,
  variant: PropTypes.oneOf(['page', 'drawer']),
  numbered: PropTypes.bool,
};

// S-76 drawer (doc 04 §6.6): a 320 px column next to the unit on wide screens; a full-screen sheet on
// small ones (`overlay`). Esc closes the sheet.
export const OutlineDrawer = ({
  sections, onClose, onNavigate, overlay = false, numbered = true,
}) => {
  const intl = useClassroomIntl();
  const titleId = useId();
  const ref = useRef(null);
  useEffect(() => {
    if (!overlay) { return undefined; }
    const back = document.activeElement;
    const focusables = () => [...ref.current.querySelectorAll('a[href], button:not([disabled])')]
      .filter((el) => !el.closest('[hidden]'));
    focusables()[0]?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape' && onClose) { onClose(); return; }
      if (event.key !== 'Tab') { return; }
      const list = focusables();
      if (!list.length) { return; }
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      if (back && document.contains(back)) { back.focus(); }
    };
  }, [overlay, onClose]);
  return (
    <nav ref={ref} className={`cls-drawer${overlay ? ' cls-drawer--overlay' : ''}`} aria-labelledby={titleId}>
      <div className="cls-drawer__top">
        <h2 id={titleId} className="cls-drawer__title">{intl.formatMessage(messages.outlineTitle)}</h2>
        {onClose && (
          <button type="button" className="cls-icon-btn" aria-label={intl.formatMessage(messages.outlineClose)} onClick={onClose}>
            <KitIcon src={Close} />
          </button>
        )}
      </div>
      <CourseOutline sections={sections} variant="drawer" showExpandAll={false} headingLevel={2} onNavigate={onNavigate} numbered={numbered} />
    </nav>
  );
};

OutlineDrawer.propTypes = {
  sections: CourseOutline.propTypes.sections,
  onClose: PropTypes.func,
  onNavigate: PropTypes.func,
  overlay: PropTypes.bool,
  numbered: PropTypes.bool,
};

// F-116: when the tree is hidden a slim 40 px rail with a ☰ handle stays, so it is always easy to bring back.
export const OutlineRail = ({ onOpen }) => {
  const intl = useClassroomIntl();
  return (
    <div className="cls-rail">
      <button type="button" className="cls-icon-btn cls-rail__btn" aria-label={intl.formatMessage(messages.outlineShow)} aria-expanded="false" onClick={onOpen}>
        <KitIcon src={MenuIcon} />
      </button>
    </div>
  );
};

OutlineRail.propTypes = { onOpen: PropTypes.func.isRequired };

export default CourseOutline;
