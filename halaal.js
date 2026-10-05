// Original / halaal toggle for the English and Arabic pages. Anything that reads
// differently in the halaal version carries that wording in data-halaal
// (an empty data-halaal means: leave this line out).
(function () {
  var T = document.documentElement.lang.slice(0, 2) === "ar"
    ? { group: "نسخة الوصفة", original: "الأصلية", halaal: "حلال", note: "استخدم لحوماً ومرقاً ومنتجات حاصلة على شهادة حلال.", byDefault: true }
    : { group: "Recipe version", original: "Original", halaal: "Halaal", note: "Use halaal-certified meat, stock and packaged products.", byDefault: false };

  // recipe pages: above the ingredients; recipe lists: above the category bar
  var list = document.querySelector(".ingredients"), anchor = list || document.querySelector(".cats");
  if (!anchor) return;

  var box = document.createElement("fieldset");
  box.className = "units";
  box.setAttribute("aria-label", T.group);
  box.innerHTML = ["original", "halaal"].map(function (v) {
    return '<label><input type="radio" name="version" value="' + v + '"> ' + T[v] + "</label>";
  }).join("");
  anchor.before(box);

  var note = null;
  if (list) {
    note = document.createElement("p");
    note.className = "halaal-note";
    note.textContent = T.note;
    list.after(note);
  }

  var items = document.querySelectorAll("[data-halaal]");
  items.forEach(function (el) { el.dataset.original = el.textContent; });

  function apply(on, animate) {
    var units = window.recipeUnits, flap = window.flap; // units.js and flap.js, when loaded
    if (flap) items.forEach(function (el) { if (el.firstChild) flap.finish(el.firstChild); });
    var before = Array.from(items, function (el) { return el.textContent; });
    if (units) units.suspend();
    items.forEach(function (el) {
      el.textContent = on ? el.dataset.halaal : el.dataset.original;
      el.hidden = on && !el.dataset.halaal;
    });
    if (note) note.hidden = !on;
    var pill = box.querySelector(":checked").parentNode;
    box.style.setProperty("--x", pill.offsetLeft + "px");
    box.style.setProperty("--w", pill.offsetWidth + "px");
    if (units) units.resume();
    // the words that changed roll in, like the metric / imperial switch
    if (animate && flap && !flap.calm) {
      var line = 0;
      items.forEach(function (el, i) {
        var marked = !el.hidden && el.firstChild && flap.diff(before[i], el.textContent);
        if (marked) flap.roll(el.firstChild, marked, Math.min(line++, 6));
      });
    }
    try { localStorage.setItem("halaal", on ? "1" : "0"); } catch (e) {}
  }
  box.addEventListener("change", function (e) { apply(e.target.value === "halaal", true); });

  var on = T.byDefault;
  try { var saved = localStorage.getItem("halaal"); if (saved) on = saved === "1"; } catch (e) {}
  box.querySelector('[value="' + (on ? "halaal" : "original") + '"]').checked = true;
  apply(on);
})();
