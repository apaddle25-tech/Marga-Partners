/* Carry what someone already typed from one form on this site to the next.
   ==========================================================================================
   WHY THIS EXISTS. A practice owner who fills in the Exchange benchmark survey and then asks
   for a consultation should not type their name and email again. The site has three forms
   that ask for overlapping identity, and until now each one started empty.

   WHAT IT CARRIES, AND WHY THE LIST IS SHORT. Four identity fields, by exact name match:

       name, email, company, title

   Nothing else. Not an answer, not a revenue band, not a free-text response. Two reasons.
   Prefilling an answer is a different act from prefilling a name: it puts words in someone's
   mouth on a question they have not read yet, and a benchmark built on carried-over answers
   is a benchmark measuring its own defaults. And these four are the only names that mean the
   same thing on every form. The benchmark wizard has `role` and the consultation has `title`;
   they look like a pair and are not, so they are left alone rather than mapped on a guess.

   SESSION, NOT DEVICE. sessionStorage, so it is gone when the tab closes. A practice front
   desk is a shared computer, and localStorage would leave one person's name and email sitting
   in the next person's form tomorrow morning. The trade is that a returning visitor types
   their details once per visit, which is the correct side to err on.

   IT NEVER OVERWRITES. A field that already has a value is left exactly as it is, whichever
   filled it: the browser's own autofill, a back button, or the person. This only ever fills a
   blank.

   IT SAYS SO. Silently moving someone's email between pages is surprising even when it is
   convenient, so when this fills anything it puts a line above the form saying it did, with a
   control that clears both the storage and the fields it filled.

   NO JAVASCRIPT, NO PROBLEM. Every form works without this. It fills blanks and nothing else,
   so a blocked script costs some typing and no function. */
(function () {
  'use strict';

  var KEYS = ['name', 'email', 'company', 'title'];
  var STORE = 'marga.identity';

  // Private mode and hardened settings can make sessionStorage throw on access rather than
  // return null, so every touch is guarded. A browser that refuses storage gets a site that
  // simply does not prefill.
  function read() {
    try {
      return JSON.parse(window.sessionStorage.getItem(STORE) || '{}') || {};
    } catch (e) { return {}; }
  }
  function write(obj) {
    try { window.sessionStorage.setItem(STORE, JSON.stringify(obj)); } catch (e) { /* ignore */ }
  }
  function drop() {
    try { window.sessionStorage.removeItem(STORE); } catch (e) { /* ignore */ }
  }

  // Not scoped to `form`. The benchmark wizard's email input sits outside its <form> element,
  // so a `form [name=email]` selector matched everything except the one field on the site that
  // most wants carrying. The safety here is the four-name allowlist, not the ancestor.
  function controls(key) {
    var sel = '[name="' + key + '"]';
    return [].slice.call(
      document.querySelectorAll('input' + sel + ',select' + sel + ',textarea' + sel));
  }

  function remember() {
    var data = read();
    KEYS.forEach(function (k) {
      controls(k).forEach(function (el) {
        var v = String(el.value || '').trim();
        if (v) { data[k] = v; } else { delete data[k]; }
      });
    });
    if (Object.keys(data).length) { write(data); } else { drop(); }
  }

  function notice(filled, anchor) {
    var p = document.createElement('p');
    p.className = 'prefill-note';
    p.setAttribute('role', 'status');
    var what = filled.length === 1 ? 'your ' + filled[0] : 'some details';
    p.appendChild(document.createTextNode(
      'We filled in ' + what + ' from a form you started earlier in this visit. '));
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'prefill-clear';
    btn.appendChild(document.createTextNode('Clear'));
    btn.addEventListener('click', function () {
      filled.forEach(function (k) {
        controls(k).forEach(function (el) { el.value = ''; });
      });
      drop();
      p.parentNode.removeChild(p);
      var first = controls(filled[0])[0];
      if (first) { first.focus(); }
    });
    p.appendChild(btn);
    // Top of the form when the field is in one, immediately above the field when it is not.
    // The benchmark wizard is the second case.
    var form = anchor.closest ? anchor.closest('form') : null;
    if (form) { form.insertBefore(p, form.firstChild); }
    else { anchor.parentNode.insertBefore(p, anchor); }
  }

  function fill() {
    var data = read();
    var filled = [];
    var firstEl = null;
    KEYS.forEach(function (k) {
      if (!data[k]) { return; }
      controls(k).forEach(function (el) {
        // Only ever a blank. Anything already there was put there by someone with a better
        // claim to the field than this script has.
        if (String(el.value || '').trim() === '') {
          el.value = data[k];
          if (!firstEl) { firstEl = el; }
          if (filled.indexOf(k) === -1) { filled.push(k); }
        }
      });
    });
    if (filled.length && firstEl) { notice(filled, firstEl); }
  }

  function start() {
    fill();
    // Captured as it is typed rather than on submit, so a form abandoned halfway still carries
    // the name to the next one. That is the common path: someone starts the survey, decides to
    // ask a question first, and lands on the consultation form.
    document.addEventListener('input', function (e) {
      if (e.target && KEYS.indexOf(e.target.name) !== -1) { remember(); }
    }, true);
    document.addEventListener('change', function (e) {
      if (e.target && KEYS.indexOf(e.target.name) !== -1) { remember(); }
    }, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
