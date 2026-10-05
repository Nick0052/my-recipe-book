// Metric / imperial toggle for recipe pages. Adds the toggle above the ingredient
// list and rewrites the quantities in the recipe (ingredients, method, meta line).
(function () {
  // [singular, plural] per language
  var L = {
    en: { units: "Units", metric: "Metric", imperial: "Imperial", tsp: ["tsp", "tsp"], tbsp: ["tbsp", "tbsp"],
          cup: ["cup", "cups"], oz: ["oz", "oz"], lb: ["lb", "lb"], inch: ["in", "in"], f: "°F" },
    af: { units: "Eenhede", metric: "Metriek", imperial: "Imperiaal", tsp: ["teelepel", "teelepels"], tbsp: ["eetlepel", "eetlepels"],
          cup: ["koppie", "koppies"], oz: ["ons", "onse"], lb: ["pond", "pond"], inch: ["duim", "duim"], f: "°F" },
    pt: { units: "Unidades", metric: "Métrico", imperial: "Imperial", tsp: ["colher de chá", "colheres de chá"], tbsp: ["colher de sopa", "colheres de sopa"],
          cup: ["chávena", "chávenas"], oz: ["oz", "oz"], lb: ["lb", "lb"], inch: ["pol.", "pol."], f: "°F" },
    ar: { units: "الوحدات", metric: "متري", imperial: "إمبراطوري", tsp: ["ملعقة صغيرة", "ملعقة صغيرة"], tbsp: ["ملعقة كبيرة", "ملعقة كبيرة"],
          cup: ["كوب", "كوب"], oz: ["أونصة", "أونصة"], lb: ["رطل", "رطل"], inch: ["بوصة", "بوصة"], f: "درجة فهرنهايت" }
  };
  // Metric unit as written in the pages -> kind
  var UNIT = {
    ml: "ml", "مل": "ml", litre: "l", litres: "l", liter: "l", litro: "l", litros: "l", "لتر": "l",
    g: "g", "جم": "g", kg: "kg", "كجم": "kg", cm: "cm", "سم": "cm", mm: "mm", "ملم": "mm",
    "°C": "c", "درجة مئوية": "c"
  };
  var NUM = "\\d+(?:[.,]\\d+)?";
  // optional "90–" / "30 × " / "90 إلى " before the number, so ranges and sizes convert as a pair
  var RE = new RegExp("(?:(" + NUM + ")(\\s*[–×]\\s*|\\s+إلى\\s+))?(" + NUM + ")\\s*(" +
    Object.keys(UNIT).sort(function (a, b) { return b.length - a.length; }).join("|") + ")(?![\\p{L}])", "gu");
  var FRAC = { 3: "¼", 4: "⅓", 6: "½", 8: "⅔", 9: "¾" };
  // invisible helpers, built from codes so they can't get lost in an editor:
  // LRI/PDI keep "4½" left-to-right on Arabic pages; S/E mark converted amounts for flap.js
  var LRI = String.fromCharCode(0x2066), PDI = String.fromCharCode(0x2069);
  var S = String.fromCharCode(1), E = String.fromCharCode(2);
  // "2½ cups (2½ cups)" -> "2½ cups"
  var DUP = new RegExp("(" + LRI + "?([^\\s" + PDI + "]+)" + PDI + "? ([^\\s" + E + "]+)" + E + "?) \\(\\2 \\3\\)", "g");

  // Nearest quarter (or third, for cups) as "1½"; never rounds a real amount down to nothing.
  function mixed(x, thirds) {
    var v = Math.round(x * 4) / 4, t = Math.round(x * 3) / 3;
    if (thirds && Math.abs(t - x) < Math.abs(v - x)) v = t;
    var n = Math.max(3, Math.round(v * 12));
    var w = Math.floor(n / 12) || "", f = FRAC[n % 12] || "";
    // isolate "4½" left-to-right, or Arabic pages show it as "½4"
    return { s: w && f ? LRI + w + f + PDI : w + f, many: n > 12 };
  }

  // -> [quantity, unit]. Spoons and cups are the 5 / 15 / 250 ml ones from the site footer.
  function conv(v, kind, T) {
    function out(m, name) { return [m.s, T[name][m.many ? 1 : 0]]; }
    if (kind === "ml") return v < 15 ? out(mixed(v / 5), "tsp") : v < 60 ? out(mixed(v / 15), "tbsp") : out(mixed(v / 250, true), "cup");
    if (kind === "l") return out(mixed(v * 4, true), "cup");
    if (kind === "kg") return out(mixed(v * 2.2046), "lb");
    if (kind === "c") return [String(Math.round((v * 1.8 + 32) / 5) * 5), T.f];
    if (kind === "g") {
      var oz = v / 28.35, r = Math.round(oz), lb = Math.floor(r / 16);
      if (oz < 8) return out(mixed(oz), "oz");
      if (!lb) return [String(r), T.oz[1]];
      return r % 16 ? [lb + " " + T.lb[0] + " " + (r % 16), T.oz[1]] : [String(lb), T.lb[lb > 1 ? 1 : 0]];
    }
    var inches = v / (kind === "mm" ? 25.4 : 2.54);
    return inches >= 5 ? [String(Math.round(inches)), T.inch[1]] : out(mixed(inches), "inch");
  }

  // mark: wrap each converted amount in S...E so roll() knows what to flip
  function toImperial(text, T, mark) {
    function num(s) { return parseFloat(s.replace(",", ".")); }
    function m(s) { return mark ? S + s + E : s; }
    return text.replace(RE, function (all, a, sep, b, unit) {
      var kind = UNIT[unit], y = conv(num(b), kind, T);
      if (!a) return m(y.join(" "));
      if (sep.indexOf("×") >= 0 && kind !== "cm") return a + sep + m(y.join(" ")); // "2 × 400 g tins": 2 is a count
      var x = conv(num(a), kind, T);
      return m((x[1] === y[1] ? x[0] : x.join(" ")) + sep + y.join(" "));
    }).replace(DUP, "$1");
  }

  if (typeof module === "object") module.exports = function (text, lang) { return toImperial(text, L[lang]); };
  if (typeof document === "undefined") return;

  var list = document.querySelector(".ingredients");
  if (!list) return;
  var T = L[document.documentElement.lang.slice(0, 2)] || L.en;

  var box = document.createElement("fieldset");
  box.className = "units";
  box.setAttribute("aria-label", T.units);
  box.innerHTML = ["metric", "imperial"].map(function (v) {
    return '<label><input type="radio" name="units" value="' + v + '"> ' + T[v] + "</label>";
  }).join("");
  list.before(box);

  // every text node in the recipe, with its metric original
  // Arabic pages are written with Arabic-Indic digits and the "٫" decimal sign.
  // Read them as Western digits, do the work, and write them back the same way.
  var arabic = document.documentElement.lang.slice(0, 2) === "ar";
  function western(s) {
    return s.replace(/[٠-٩]/g, function (d) { return d.charCodeAt(0) - 0x0660; }).replace(/٫/g, ".");
  }
  function show(s) {
    if (!arabic) return s;
    return s.replace(/(\d)\.(\d)/g, "$1٫$2").replace(/\d/g, function (d) { return String.fromCharCode(0x0660 + +d); });
  }

  var nodes = [];
  function snapshot() {
    var walker = document.createTreeWalker(document.querySelector(".recipe"), NodeFilter.SHOW_TEXT);
    nodes = [];
    while (walker.nextNode()) nodes.push([walker.currentNode, arabic ? western(walker.currentNode.data) : walker.currentNode.data]);
  }
  snapshot();

  var flap = window.flap; // flap.js, the split-flap animation; without it the switch is instant

  function apply(v, animate) {
    var on = box.querySelector(":checked").parentNode, line = 0;
    box.style.setProperty("--x", on.offsetLeft + "px");
    box.style.setProperty("--w", on.offsetWidth + "px");
    nodes.forEach(function (n) {
      if (flap) flap.finish(n[0]); // toggled again mid-roll
      var imperial = v === "imperial", text = show(imperial ? toImperial(n[1], T) : n[1]);
      if (text === n[0].data) return;
      if (animate && flap && !flap.calm) flap.roll(n[0], show(imperial ? toImperial(n[1], T, true) : n[1].replace(RE, S + "$&" + E)), Math.min(line++, 6));
      else n[0].data = text;
    });
    try { localStorage.setItem("units", v); } catch (e) {}
  }
  box.addEventListener("change", function (e) { apply(e.target.value, true); });

  // For halaal.js, which rewrites some lines: put the metric text back before
  // it changes anything, then re-read the recipe and convert it again.
  window.recipeUnits = {
    suspend: function () { nodes.forEach(function (n) { if (flap) flap.finish(n[0]); n[0].data = show(n[1]); }); },
    resume: function () { snapshot(); apply(box.querySelector(":checked").value); }
  };

  var saved = "metric";
  try { if (localStorage.getItem("units") === "imperial") saved = "imperial"; } catch (e) {}
  box.querySelector('[value="' + saved + '"]').checked = true;
  apply(saved);
})();
