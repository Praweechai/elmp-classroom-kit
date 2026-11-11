/* ELMP lesson blocks — shared bundle (V-3.04 fills this in: quiz, video, activity screens).
   Placeholder so the blocks load; shows the block title until then. */
function ElmpBlock(runtime, element, config) {
  'use strict';
  var root = element.querySelector('[data-elmp-block]') || element;
  root.textContent = config.error ? config.error : (config.title || '');
}
