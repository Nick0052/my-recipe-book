// Split-flap ("rolling letter board") text change, shared by units.js and halaal.js.
(function () {
  var S = String.fromCharCode(1), E = String.fromCharCode(2); // mark the part of a text that flips
  var MARKS = new RegExp("[" + S + E + "]");
  var ISOLATES = new RegExp("[" + String.fromCharCode(0x2066, 0x2069) + "]", "g"); // direction marks around "4½"
  var rtl = document.documentElement.dir === "rtl";
  var arabic = document.documentElement.lang.slice(0, 2) === "ar";
  var ABC = "abcdefghijklmnopqrstuvwxyz";
  var FLIP = [{ transform: "translateY(-45%) rotateX(90deg)", opacity: 0.2 }, { transform: "none", opacity: 1 }];
  var active = new WeakMap(); // text node -> function that ends its roll now

  // same shape, random digits and letters
  function scramble(s) {
    // digits stay digits: Arabic-Indic ones on Arabic pages
    return s.replace(/[0-9٠-٩¼⅓½⅔¾]/g, function () { return String.fromCharCode((arabic ? 0x0660 : 48) + Math.floor(Math.random() * 10)); })
      .replace(/[a-z]/gi, function (c) {
        var r = ABC[Math.floor(Math.random() * 26)];
        return c < "a" ? r.toUpperCase() : r;
      });
  }

  // End a roll early and show the final text. Call before changing a node any other way.
  function finish(node) {
    var end = active.get(node);
    if (end) end();
  }

  // Show `marked` in the text node: the parts between S...E flip through random
  // characters and settle left to right; everything else stays put.
  function roll(node, marked, line) {
    finish(node);
    var wrap = document.createElement("span"), flaps = []; // flaps: [tile, final text, flips left]
    marked.split(MARKS).forEach(function (part, k) {
      if (k % 2 === 0) return wrap.append(part);
      var rolling = document.createElement("span");
      rolling.setAttribute("aria-hidden", "true");
      part.split(/(\s+)/).forEach(function (word) {
        if (!word.trim()) return rolling.append(word);
        var holder = document.createElement("span");
        holder.style.whiteSpace = "nowrap";
        // Arabic letters must stay joined, so whole words flip there
        (rtl ? [word] : Array.from(word.replace(ISOLATES, ""))).forEach(function (ch) {
          var f = document.createElement("span");
          f.className = "flap";
          f.textContent = ch;
          flaps.push([f, ch, 3 + line + Math.min(flaps.length, 10)]); // later tiles and lines roll longer
          holder.append(f);
        });
        rolling.append(holder);
      });
      wrap.append(rolling);
    });
    node.data = "";
    node.after(wrap);
    // lock each tile to its final width, so nothing reflows while it rolls or when it settles
    flaps.map(function (f) { return f[0].getBoundingClientRect().width; }).forEach(function (w, k) {
      flaps[k][0].style.width = w + "px";
      flaps[k][0].textContent = scramble(flaps[k][1]);
    });
    // the timer, not the animation, decides when the real text is back
    var timer = setInterval(function () {
      if (!flaps.some(function (f) { return f[2]; })) return finish(node);
      flaps.forEach(function (f) {
        if (!f[2]) return;
        f[0].textContent = --f[2] ? scramble(f[1]) : f[1];
        f[0].animate(FLIP, 80);
      });
    }, 80);
    active.set(node, function () {
      clearInterval(timer);
      wrap.remove();
      node.data = marked.split(MARKS).join("");
      active.delete(node);
    });
  }

  // `after` with S...E around the whole words that differ from `before`,
  // or null when there is nothing new to show.
  function diff(before, after) {
    var i = 0, j = 0;
    while (i < before.length && before[i] === after[i]) i++;
    while (i && /\S/.test(after[i - 1])) i--;
    while (j < Math.min(before.length, after.length) - i && before[before.length - 1 - j] === after[after.length - 1 - j]) j++;
    while (j && /\S/.test(after[after.length - j])) j--;
    var mid = after.slice(i, after.length - j);
    return mid.trim() ? after.slice(0, i) + S + mid + E + after.slice(after.length - j) : null;
  }

  window.flap = {
    calm: matchMedia("(prefers-reduced-motion: reduce)").matches, // visitor asked for less motion
    roll: roll, finish: finish, diff: diff
  };
})();
