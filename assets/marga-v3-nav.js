/* Marga v3 navigation behaviour.
   ==========================================================================================
   Phase 1 of the migration. Nothing loads this yet; the homepage is the first page to, in
   Phase 2.

   The handoff describes the dropdown as opening on mouseenter and closing on mouseleave,
   and says plainly that "the prototype's hover behavior is not sufficient on its own; add
   focus management and Escape-to-close". This is that.

   A hover-only menu is unreachable by keyboard, unreachable by touch without a stray tap,
   and invisible to a screen reader, which has no concept of hover at all. So the trigger is
   a real button that carries its own state in aria-expanded, and hover is an enhancement
   layered on top of a control that already works without it.
   ========================================================================================== */
(function () {
  'use strict';

  var cap = document.querySelector('.nav-cap');
  if (!cap) return;

  // Declared before the drawer handler, which closes the disclosure when the drawer shuts.
  var closeDrop = function () {};

  // ---- the mobile drawer -----------------------------------------------------------------
  var toggle = cap.querySelector('.nav-toggle');
  if (toggle) {
    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var open = cap.getAttribute('data-menu') !== 'true';
      cap.setAttribute('data-menu', String(open));
      toggle.setAttribute('aria-expanded', String(open));
      // Closing the drawer has to close the disclosure inside it. Left alone the dropdown
      // kept reporting aria-expanded="true" for a panel that was no longer on screen, so a
      // screen reader announced an open menu that had gone.
      if (!open) closeDrop();
    });
  }

  // ---- the "Who we serve" dropdown --------------------------------------------------------
  var drop = cap.querySelector('.nav-drop');
  if (drop) {
    var btn = drop.querySelector('button');
    var panel = drop.querySelector('.nav-panel');
    var items = panel ? Array.prototype.slice.call(panel.querySelectorAll('a')) : [];
    var hoverable = window.matchMedia('(hover:hover) and (min-width:981px)');

    var setOpen = function (open, focusFirst) {
      drop.setAttribute('data-open', String(open));
      btn.setAttribute('aria-expanded', String(open));
      // A hidden element cannot take focus, which is why the stylesheet flips the panel's
      // visibility instantly on the way open rather than transitioning it. With that in
      // place a same-tick focus lands, and this needs no rAF. It used to have one, and rAF
      // is the single thing in this file that does not fire in a backgrounded tab.
      if (open && focusFirst && items.length) items[0].focus();
    };

    closeDrop = function () { setOpen(false, false); };

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      setOpen(drop.getAttribute('data-open') !== 'true', false);
    });

    // Hover is an enhancement and only where hover is a real input. A touch device reports
    // no hover, and opening a menu on a pointer that does not exist is how a panel ends up
    // stuck open with no way to dismiss it.
    if (hoverable.matches) {
      drop.addEventListener('mouseenter', function () { setOpen(true, false); });
      drop.addEventListener('mouseleave', function () { setOpen(false, false); });
    }

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'Down') { e.preventDefault(); setOpen(true, true); }
    });

    // Escape closes and hands focus back to the trigger. Without the second half, focus is
    // left on an element that has just been hidden, and the next Tab starts from nowhere.
    drop.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.stopPropagation();
        setOpen(false, false);
        btn.focus();
        return;
      }
      var i = items.indexOf(document.activeElement);
      if (i < 0) return;
      if (e.key === 'ArrowDown' || e.key === 'Down') {
        e.preventDefault(); items[Math.min(i + 1, items.length - 1)].focus();
      } else if (e.key === 'ArrowUp' || e.key === 'Up') {
        e.preventDefault();
        if (i === 0) btn.focus(); else items[i - 1].focus();
      } else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
    });

    // Tabbing out of the group closes it. focusout fires before the new element is focused,
    // so the check is deferred a tick.
    drop.addEventListener('focusout', function () {
      window.setTimeout(function () {
        if (!drop.contains(document.activeElement)) setOpen(false, false);
      }, 0);
    });
  }

  // ---- one dismissal path for both ---------------------------------------------------------
  document.addEventListener('click', function (e) {
    if (!cap.contains(e.target)) {
      cap.setAttribute('data-menu', 'false');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      if (drop) {
        drop.setAttribute('data-open', 'false');
        drop.querySelector('button').setAttribute('aria-expanded', 'false');
      }
    }
  });

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape' && e.key !== 'Esc') return;
    if (cap.getAttribute('data-menu') === 'true') {
      cap.setAttribute('data-menu', 'false');
      if (toggle) { toggle.setAttribute('aria-expanded', 'false'); toggle.focus(); }
    }
  });
}());
