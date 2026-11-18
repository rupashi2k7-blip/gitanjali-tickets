/* ==================================================================
   Gitanjali Cinema Hall — ticket booking app (offline, no server)
   ================================================================== */
(function () {
  "use strict";

  var G = window.GJ;
  var LS = "gjt.v1.bookings";

  var state = {
    lang: "en",
    screen: "home",
    movieId: null,
    showId: null,
    date: null,
    seats: [],
    pay: "upi",
    stack: [],
    bookings: [],
    last: null
  };

  /* ---------------- i18n ---------------- */
  var T = {
    en: {
      nowShowing: "Now Showing", myTickets: "My Tickets",
      today: "Today", tomorrow: "Tomorrow",
      selectDate: "Select date", shows: "Shows",
      perTicket: "from", book: "Book seats",
      screen: "Screen", stalls: "Stalls", balcony: "Balcony",
      available: "Available", selected: "Selected", sold: "Booked",
      seats: "seats", seat: "seat",
      continue: "Continue", chooseSeats: "Choose your seats",
      summary: "Booking summary", movie: "Film", date: "Date", time: "Show",
      seatsLbl: "Seats", ticketPrice: "Ticket price",
      bookingFee: "Booking fee", free: "Free", total: "Total",
      yourDetails: "Your details", name: "Name", mobile: "Mobile number",
      namePh: "Full name", mobilePh: "10-digit mobile number",
      payVia: "Pay at", upi: "UPI", upiSub: "GPay · PhonePe · Paytm",
      counter: "Counter", counterSub: "Cash at the window",
      confirm: "Confirm booking", back: "← Back",
      confirmed: "Booking confirmed", idLbl: "Booking ID",
      showAtCounter: "Show this code at the gate",
      done: "Done", myBookings: "My bookings",
      noBookings: "No tickets yet. Pick a film and book your seats.",
      cancel: "Cancel booking", cancelled: "Cancelled",
      cancelledNote: "This booking was cancelled.", view: "View ticket",
      errSeat: "Pick at least one seat (up to 6).",
      errName: "Please enter your name.",
      errMobile: "Enter a valid 10-digit mobile number.",
      maxSeats: "You can book up to 6 seats at a time.",
      demo: "Demo schedule · edit www/data.js to change films, shows and prices.",
      slotMatinee: "Matinee", slotDay: "Afternoon", slotEvening: "Evening", slotNight: "Night",
      rupees: "₹", each: "each", payNote: "No booking fee. Pay the full amount.",
      strip: "Low-price tickets · Stalls from ₹40 · No booking fee"
    },
    bn: {
      nowShowing: "চলছে", myTickets: "আমার টিকিট",
      today: "আজ", tomorrow: "কাল",
      selectDate: "তারিখ বাছুন", shows: "শো",
      perTicket: "শুরু", book: "সিট বুক করুন",
      screen: "স্ক্রিন", stalls: "স্টল", balcony: "ব্যালকনি",
      available: "খালি", selected: "বাছা", sold: "বুকড",
      seats: "সিট", seat: "সিট",
      continue: "এগিয়ে চলুন", chooseSeats: "সিট বাছুন",
      summary: "বুকিং সারসংক্ষেপ", movie: "ছবি", date: "তারিখ", time: "শো",
      seatsLbl: "সিট", ticketPrice: "টিকিটের দাম",
      bookingFee: "বুকিং চার্জ", free: "শূন্য", total: "মোট",
      yourDetails: "আপনার তথ্য", name: "নাম", mobile: "মোবাইল নম্বর",
      namePh: "পুরো নাম", mobilePh: "১০ সংখ্যার মোবাইল নম্বর",
      payVia: "পেমেন্ট", upi: "UPI", upiSub: "GPay · PhonePe · Paytm",
      counter: "কাউন্টার", counterSub: "ক্যাশে টিকিট",
      confirm: "বুকিং নিশ্চিত করুন", back: "← পিছনে",
      confirmed: "বুকিং নিশ্চিত হয়েছে", idLbl: "বুকিং আইডি",
      showAtCounter: "গেটে এই কোড দেখান",
      done: "ঠিক আছে", myBookings: "আমার বুকিং",
      noBookings: "এখনও টিকিট নেই। ছবি বেছে সিট বুক করুন।",
      cancel: "বুকিং বাতিল", cancelled: "বাতিল",
      cancelledNote: "এই বুকিং বাতিল করা হয়েছে।", view: "টিকিট দেখুন",
      errSeat: "অন্তত একটি সিট বাছুন (সর্বোচ্চ ৬)।",
      errName: "নাম লিখুন।",
      errMobile: "সঠিক ১০ সংখ্যার মোবাইল নম্বর দিন।",
      maxSeats: "একবারে সর্বোচ্চ ৬টি সিট।",
      demo: "নমুনা সময়সূচি · ছবি, শো ও দাম বদলাতে www/data.js সম্পাদনা করুন।",
      slotMatinee: "ম্যাটিনি", slotDay: "দুপুর", slotEvening: "সন্ধ্যা", slotNight: "রাত",
      rupees: "₹", each: "প্রতিটি", payNote: "কোনো বুকিং চার্জ নেই। পুরো টাকা দিন।",
      strip: "কম দামে টিকিট · স্টল থেকে ₹৪০ · বুকিং চার্জ নেই"
    }
  };

  function t(k) { return (T[state.lang] && T[state.lang][k]) || T.en[k] || k; }
  function money(n) { return t("rupees") + n; }

  /* ---------------- helpers ---------------- */
  function $(id) { return document.getElementById(id); }
  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  }
  function fnv(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = (h * 16777619) >>> 0; }
    return h >>> 0;
  }
  function mulberry(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var x = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
      return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
    };
  }

  function movie(id) {
    for (var i = 0; i < G.movies.length; i++) if (G.movies[i].id === id) return G.movies[i];
    return null;
  }
  function show(id) {
    for (var i = 0; i < G.shows.length; i++) if (G.shows[i].id === id) return G.shows[i];
    return null;
  }
  function showIds(movieId) { return G.schedule[movieId] || []; }
  function minPrice(movieId) {
    var ids = showIds(movieId), best = Infinity;
    for (var i = 0; i < ids.length; i++) {
      var s = show(ids[i]);
      if (s && s.stalls < best) best = s.stalls;
    }
    return best === Infinity ? 0 : best;
  }
  function slotLabel(slot) {
    return ({ matinee: t("slotMatinee"), day: t("slotDay"), evening: t("slotEvening"), night: t("slotNight") })[slot] || slot;
  }

  /* dates: today + next 3 days */
  function dates() {
    var out = [], base = new Date();
    for (var i = 0; i < 4; i++) {
      var d = new Date(base.getFullYear(), base.getMonth(), base.getDate() + i);
      out.push({
        iso: d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()),
        day: d.getDate(),
        dow: d.toLocaleDateString(state.lang === "bn" ? "bn-IN" : "en-IN", { weekday: "short" }),
        mon: d.toLocaleDateString(state.lang === "bn" ? "bn-IN" : "en-IN", { month: "short" }),
        label: i === 0 ? t("today") : (i === 1 ? t("tomorrow") : "")
      });
    }
    return out;
  }
  function dateObj(isoStr) {
    var d = dates();
    for (var i = 0; i < d.length; i++) if (d[i].iso === isoStr) return d[i];
    return d[0];
  }
  function prettyDate(isoStr) {
    var d = dateObj(isoStr);
    return d.dow + ", " + d.day + " " + d.mon;
  }

  /* ---------------- storage ---------------- */
  function load() {
    try {
      var raw = localStorage.getItem(LS);
      state.bookings = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(state.bookings)) state.bookings = [];
    } catch (e) { state.bookings = []; }
  }
  function save() {
    try { localStorage.setItem(LS, JSON.stringify(state.bookings)); } catch (e) {}
  }

  /* ---------------- seat maths ---------------- */
  function rowKind(rowId) {
    for (var i = 0; i < G.rows.length; i++) if (G.rows[i].id === rowId) return G.rows[i].kind;
    return "stalls";
  }
  function seatPrice(seatId, sh) {
    return rowKind(seatId.charAt(0)) === "balcony" ? sh.balcony : sh.stalls;
  }
  function soldByHall(shId, isoStr, seatId) {
    // A stable pseudo-random share of seats already sold at the counter.
    return fnv(shId + "|" + isoStr + "|" + seatId) % 100 < 18;
  }
  function soldByMe(shId, isoStr) {
    var set = {};
    for (var i = 0; i < state.bookings.length; i++) {
      var b = state.bookings[i];
      if (b.status !== "active" || b.showId !== shId || b.date !== isoStr) continue;
      for (var j = 0; j < b.seats.length; j++) set[b.seats[j].id] = true;
    }
    return set;
  }
  function seatState(seatId, shId, isoStr, mine) {
    if (mine[seatId]) return "booked";
    if (soldByHall(shId, isoStr, seatId)) return "booked";
    return state.seats.indexOf(seatId) >= 0 ? "sel" : "free";
  }
  function total() {
    var sh = show(state.showId), sum = 0;
    if (!sh) return 0;
    for (var i = 0; i < state.seats.length; i++) sum += seatPrice(state.seats[i], sh);
    return sum;
  }

  /* ---------------- navigation ---------------- */
  function go(screen) {
    if (state.screen !== screen) state.stack.push(state.screen);
    state.screen = screen;
    render();
  }
  function back() {
    var prev = state.stack.pop();
    state.screen = prev || "home";
    render();
  }
  window.gjBack = function () {
    if (state.screen === "home" || state.screen === "bookings") return false;
    back();
    return true;
  };

  window.gjToggleLang = function () {
    state.lang = state.lang === "en" ? "bn" : "en";
    render();
  };
  window.gjTab = function (name) {
    state.stack = [];
    state.screen = name;
    render();
  };
  window.gjPickMovie = function (id) {
    state.movieId = id;
    state.showId = null;
    state.seats = [];
    if (!state.date) state.date = dates()[0].iso;
    go("shows");
  };
  window.gjPickDate = function (isoStr) {
    state.date = isoStr;
    state.seats = [];
    render();
  };
  window.gjPickShow = function (id) {
    state.showId = id;
    state.seats = [];
    go("seats");
  };
  window.gjToggleSeat = function (seatId) {
    var i = state.seats.indexOf(seatId);
    if (i >= 0) { state.seats.splice(i, 1); }
    else {
      if (state.seats.length >= G.maxSeats) { alert(t("maxSeats")); return; }
      state.seats.push(seatId);
    }
    render();
  };
  window.gjGoPay = function () {
    if (!state.seats.length) { alert(t("errSeat")); return; }
    go("pay");
  };
  window.gjSetPay = function (m) { state.pay = m; render(); };

  window.gjConfirm = function () {
    var name = ($("fName") || {}).value || "";
    var mob = ($("fMob") || {}).value || "";
    name = name.trim();
    mob = mob.replace(/[^0-9]/g, "");
    var err = $("payErr");
    if (name.length < 2) { err.textContent = t("errName"); err.className = "err on"; return; }
    if (!/^[6-9][0-9]{9}$/.test(mob)) { err.textContent = t("errMobile"); err.className = "err on"; return; }
    err.className = "err";

    var sh = show(state.showId), mv = movie(state.movieId);
    var seats = state.seats.slice().sort();
    var list = seats.map(function (s) { return { id: s, price: seatPrice(s, sh) }; });
    var sum = 0;
    list.forEach(function (x) { sum += x.price; });

    var stamp = Date.now().toString(36).toUpperCase();
    var code = "GJT-" + stamp.slice(-4) + "-" + pad(Math.floor(Math.random() * 100));

    var b = {
      id: code,
      movieId: mv.id,
      movieTitle: state.lang === "bn" ? (mv.titleBn || mv.title) : mv.title,
      movieTitleAlt: state.lang === "bn" ? mv.title : (mv.titleBn || mv.title),
      showId: sh.id,
      time: sh.time,
      slot: sh.slot,
      date: state.date,
      seats: list,
      total: sum,
      name: name,
      mobile: mob,
      pay: state.pay,
      status: "active",
      ts: Date.now()
    };
    state.bookings.unshift(b);
    save();
    state.last = b;
    state.stack = [];
    state.screen = "ticket";
    render();
  };

  window.gjDone = function () {
    state.movieId = null; state.showId = null; state.seats = [];
    state.stack = []; state.screen = "home";
    render();
  };
  window.gjViewBooking = function (id) {
    for (var i = 0; i < state.bookings.length; i++) {
      if (state.bookings[i].id === id) {
        state.last = state.bookings[i];
        state.stack = ["bookings"];
        state.screen = "ticket";
        render();
        return;
      }
    }
  };
  window.gjCancel = function (id) {
    for (var i = 0; i < state.bookings.length; i++) {
      if (state.bookings[i].id === id && state.bookings[i].status === "active") {
        state.bookings[i].status = "cancelled";
        save();
        render();
        return;
      }
    }
  };

  /* ---------------- renderers ---------------- */
  function renderDates() {
    var d = dates(), html = "";
    for (var i = 0; i < d.length; i++) {
      html += '<button class="date ' + (d[i].iso === state.date ? "on" : "") +
        '" onclick="gjPickDate(\'' + d[i].iso + '\')"><b>' + d[i].day + "</b><span>" +
        (d[i].label || d[i].dow) + "</span></button>";
    }
    return '<div class="dates">' + html + "</div>";
  }

  function renderHome() {
    if (!state.date) state.date = dates()[0].iso;
    var html = "";
    html += '<div class="row-between" style="margin-bottom:10px">' +
      '<div><div class="h2">' + esc(t("nowShowing")) + "</div>" +
      '<div class="muted">' + esc(G.hall.screens) + "</div></div></div>";
    html += '<div class="strip">' + esc(t("strip")) + "</div>";
    html += renderDates();
    html += '<div class="sectitle" style="margin-top:14px">' + esc(t("selectDate")) + " · " + esc(prettyDate(state.date)) + "</div>";

    for (var i = 0; i < G.movies.length; i++) {
      var m = G.movies[i];
      var title = state.lang === "bn" ? (m.titleBn || m.title) : m.title;
      var alt = state.lang === "bn" ? m.title : (m.titleBn || m.title);
      html +=
        '<div class="movie" onclick="gjPickMovie(\'' + m.id + '\')">' +
          '<div class="poster" style="background:linear-gradient(160deg,' + m.c1 + "," + m.c2 + ')">' +
            '<span class="initial">' + esc(title.charAt(0)) + "</span>" +
            '<span class="cert">' + esc(m.cert) + "</span>" +
          "</div>" +
          '<div class="info">' +
            '<p class="t">' + esc(title) + "</p>" +
            '<p class="tb">' + esc(alt) + "</p>" +
            '<p class="meta">' + esc(m.genre) + " · " + esc(m.dur) + " · " + esc(m.lang) + "</p>" +
            '<div class="foot">' +
              '<span class="price-from">' + esc(t("perTicket")) + " <b>" + money(minPrice(m.id)) + "</b></span>" +
              '<span class="pill gold">★ ' + m.rating.toFixed(1) + "</span>" +
            "</div>" +
          "</div>" +
        "</div>";
    }
    html += '<p class="note">' + esc(t("demo")) + "</p>";
    $("v-home").innerHTML = html;
  }

  function renderShows() {
    var m = movie(state.movieId);
    if (!m) { state.screen = "home"; renderHome(); return; }
    var title = state.lang === "bn" ? (m.titleBn || m.title) : m.title;
    var alt = state.lang === "bn" ? m.title : (m.titleBn || m.title);
    var html = '<button class="back" onclick="gjBack()">' + esc(t("back")) + "</button>";

    html += '<div class="hero" style="background:linear-gradient(160deg,' + m.c1 + "," + m.c2 + ')">' +
      "<h2>" + esc(title) + "</h2>" +
      '<p class="sub">' + esc(alt) + "</p>" +
      '<p class="sub" style="margin-top:8px">' + esc(m.blurb) + "</p>" +
      '<div class="chips"><span class="chip">' + esc(m.cert) + "</span>" +
      '<span class="chip">' + esc(m.dur) + "</span>" +
      '<span class="chip">' + esc(m.lang) + "</span>" +
      '<span class="chip">★ ' + m.rating.toFixed(1) + "</span></div></div>";

    html += '<div class="sectitle">' + esc(t("selectDate")) + "</div>";
    html += renderDates();

    html += '<div class="sectitle" style="margin-top:16px">' + esc(t("shows")) + " · " + esc(prettyDate(state.date)) + "</div>";
    var ids = showIds(m.id);
    html += '<div class="shows">';
    for (var i = 0; i < ids.length; i++) {
      var sh = show(ids[i]);
      if (!sh) continue;
      html += '<button class="show" onclick="gjPickShow(\'' + sh.id + '\')">' +
        "<b>" + esc(sh.time) + "</b>" +
        '<div class="slot">' + esc(slotLabel(sh.slot)) + "</div>" +
        '<div class="pr">' + esc(t("stalls")) + " " + money(sh.stalls) + " · " +
        esc(t("balcony")) + " " + money(sh.balcony) + "</div></button>";
    }
    html += "</div>";
    $("v-shows").innerHTML = html;
  }

  function renderSeats() {
    var sh = show(state.showId), m = movie(state.movieId);
    if (!sh || !m) { state.screen = "home"; renderHome(); return; }
    var mine = soldByMe(sh.id, state.date);
    var title = state.lang === "bn" ? (m.titleBn || m.title) : m.title;

    var html = '<button class="back" onclick="gjBack()">' + esc(t("back")) + "</button>";
    html += '<div class="row-between" style="margin-bottom:4px">' +
      '<div><div class="h2">' + esc(title) + "</div>" +
      '<div class="muted">' + esc(prettyDate(state.date)) + " · " + esc(sh.time) + " · " + esc(slotLabel(sh.slot)) + "</div></div></div>";

    html += '<div class="screenbar" style="margin-top:16px"><div class="arc"></div><span>' + esc(t("screen")) + "</span></div>";

    var zone = null;
    for (var r = 0; r < G.rows.length; r++) {
      var row = G.rows[r];
      if (row.kind !== zone) {
        zone = row.kind;
        var p = zone === "balcony" ? sh.balcony : sh.stalls;
        html += '<div class="zone">' + esc(t(zone)) + " · " + money(p) + " " + esc(t("each")) + "</div>";
      }
      html += '<div class="seatrow"><div class="rlab">' + esc(row.id) + '</div><div class="seats">';
      for (var s = 1; s <= row.seats; s++) {
        var sid = row.id + s;
        var st = seatState(sid, sh.id, state.date, mine);
        var cls = "seat" + (st === "booked" ? " booked" : st === "sel" ? " sel" : "") +
          (s === Math.ceil(row.seats / 2) ? " aisle" : "");
        html += '<button class="' + cls + '"' + (st === "booked" ? " disabled" : "") +
          ' onclick="gjToggleSeat(\'' + sid + '\')" aria-label="' + sid + '"></button>';
      }
      html += "</div></div>";
    }

    html += '<div class="legend">' +
      '<span><i style="background:#241e2c;border:1px solid #3a3143"></i>' + esc(t("available")) + "</span>" +
      '<span><i style="background:#35b57a"></i>' + esc(t("selected")) + "</span>" +
      '<span><i style="background:#171320"></i>' + esc(t("sold")) + "</span></div>";
    html += '<p class="note">' + esc(t("demo")) + "</p>";

    $("v-seats").innerHTML = html;

    // bottom bar
    var sel = state.seats.slice().sort();
    $("bottombar").innerHTML =
      '<div class="line1"><div class="seatsel">' +
        (sel.length ? "<b>" + esc(sel.join(", ")) + "</b><br>" + sel.length + " " + esc(sel.length > 1 ? t("seats") : t("seat"))
                    : esc(t("chooseSeats"))) +
      '</div><div class="amt">' + esc(t("total")) + "<b>" + money(total()) + "</b></div></div>" +
      '<button class="btn" ' + (sel.length ? "" : "disabled ") + ' onclick="gjGoPay()">' + esc(t("continue")) + "</button>";
  }

  function renderPay() {
    var sh = show(state.showId), m = movie(state.movieId);
    if (!sh || !m) { state.screen = "home"; renderHome(); return; }
    var title = state.lang === "bn" ? (m.titleBn || m.title) : m.title;
    var sel = state.seats.slice().sort();
    var sum = total();

    var html = '<button class="back" onclick="gjBack()">' + esc(t("back")) + "</button>";
    html += '<div class="h2" style="margin-bottom:10px">' + esc(t("summary")) + "</div>";

    html += '<div class="card">' +
      '<div class="kv"><span>' + esc(t("movie")) + "</span><span>" + esc(title) + "</span></div>" +
      '<div class="kv"><span>' + esc(t("date")) + "</span><span>" + esc(prettyDate(state.date)) + "</span></div>" +
      '<div class="kv"><span>' + esc(t("time")) + "</span><span>" + esc(sh.time) + " · " + esc(slotLabel(sh.slot)) + "</span></div>" +
      '<div class="kv"><span>' + esc(t("seatsLbl")) + "</span><span>" + esc(sel.join(", ")) + "</span></div>";
    for (var i = 0; i < sel.length; i++) {
      html += '<div class="kv"><span>&nbsp;&nbsp;' + esc(sel[i]) + " · " + esc(t(rowKind(sel[i].charAt(0)))) +
        "</span><span>" + money(seatPrice(sel[i], sh)) + "</span></div>";
    }
    html += '<div class="kv"><span>' + esc(t("bookingFee")) + '</span><span style="color:#6fd6a4">' + esc(t("free")) + "</span></div>" +
      '<div class="kv total"><span>' + esc(t("total")) + "</span><span>" + money(sum) + "</span></div>" +
      "</div>";

    html += '<div class="card"><div class="sectitle" style="margin:0 0 10px">' + esc(t("yourDetails")) + "</div>" +
      '<label class="field"><span>' + esc(t("name")) + "</span>" +
      '<input type="text" id="fName" placeholder="' + esc(t("namePh")) + '" autocomplete="off"></label>' +
      '<label class="field" style="margin-bottom:6px"><span>' + esc(t("mobile")) + "</span>" +
      '<input type="tel" id="fMob" inputmode="numeric" maxlength="10" placeholder="' + esc(t("mobilePh")) + '" autocomplete="off"></label>' +
      '<div class="err" id="payErr"></div></div>';

    html += '<div class="card"><div class="sectitle" style="margin:0 0 10px">' + esc(t("payVia")) + "</div>" +
      '<div class="pays">' +
      '<button class="pay ' + (state.pay === "upi" ? "on" : "") + '" onclick="gjSetPay(\'upi\')"><b>' + esc(t("upi")) + "</b><small>" + esc(t("upiSub")) + "</small></button>" +
      '<button class="pay ' + (state.pay === "counter" ? "on" : "") + '" onclick="gjSetPay(\'counter\')"><b>' + esc(t("counter")) + "</b><small>" + esc(t("counterSub")) + "</small></button>" +
      "</div><p class=\"note\" style=\"margin:10px 0 0\">" + esc(t("payNote")) + "</p></div>";

    html += '<button class="btn" onclick="gjConfirm()" style="margin-bottom:14px">' + esc(t("confirm")) + " · " + money(sum) + "</button>";

    $("v-pay").innerHTML = html;
  }

  function barcode(id) {
    var rnd = mulberry(fnv(id)), pos = 0, stops = [];
    while (pos < 100) {
      var w = 0.7 + rnd() * 2.0;
      stops.push("rgba(244,238,242,.92) " + pos.toFixed(2) + "%");
      pos += w;
      stops.push("rgba(244,238,242,.92) " + pos.toFixed(2) + "%");
      var gap = 0.7 + rnd() * 2.0;
      stops.push("rgba(255,255,255,0) " + pos.toFixed(2) + "%");
      pos += gap;
      stops.push("rgba(255,255,255,0) " + pos.toFixed(2) + "%");
    }
    return "linear-gradient(to right," + stops.join(",") + ")";
  }

  function renderTicket() {
    var b = state.last;
    if (!b) { state.screen = "home"; renderHome(); return; }
    var live = b.status === "active";
    var html = "";
    if (!live) html += '<button class="back" onclick="gjBack()">' + esc(t("back")) + "</button>";

    html += '<div class="ticket"><div class="top">' +
      '<div class="ok"><span class="dot" style="background:' + (live ? "#35b57a" : "#d0736a") + '"></span>' +
      esc(live ? t("confirmed") : t("cancelledNote")) + "</div>" +
      "<h2>" + esc(b.movieTitle) + "</h2>" +
      '<p class="sub">' + esc(b.movieTitleAlt) + "</p>" +
      '<div class="grid">' +
        "<div><small>" + esc(t("date")) + "</small><b>" + esc(prettyDate(b.date)) + "</b></div>" +
        "<div><small>" + esc(t("time")) + "</small><b>" + esc(b.time) + "</b></div>" +
        "<div><small>" + esc(t("seatsLbl")) + "</small><b>" + esc(b.seats.map(function (x) { return x.id; }).join(", ")) + "</b></div>" +
        "<div><small>" + esc(t("total")) + "</small><b>" + money(b.total) + "</b></div>" +
        "<div><small>" + esc(t("name")) + "</small><b>" + esc(b.name) + "</b></div>" +
        "<div><small>" + esc(t("payVia")) + "</small><b>" + esc(b.pay === "upi" ? t("upi") : t("counter")) + "</b></div>" +
      "</div></div>" +
      '<div class="tear"></div>' +
      '<div class="barcode" style="background:' + barcode(b.id) + '"></div>' +
      '<div class="code">' + esc(b.id) + "</div>" +
      "</div>";

    if (live) {
      html += '<button class="btn" onclick="gjDone()" style="margin-bottom:10px">' + esc(t("done")) + "</button>";
      html += '<button class="btn ghost" onclick="gjCancel(\'' + b.id + '\');gjTab(\'bookings\')">' + esc(t("cancel")) + "</button>";
    } else {
      html += '<button class="btn ghost" onclick="gjTab(\'bookings\')">' + esc(t("myBookings")) + "</button>";
    }
    $("v-ticket").innerHTML = html;
  }

  function renderBookings() {
    var html = '<div class="h2" style="margin-bottom:12px">' + esc(t("myBookings")) + "</div>";
    var list = state.bookings.slice().sort(function (a, b) { return b.ts - a.ts; });
    if (!list.length) {
      html += '<div class="card"><p class="muted" style="margin:0">' + esc(t("noBookings")) + "</p></div>";
      html += '<button class="btn" onclick="gjTab(\'home\')">' + esc(t("nowShowing")) + "</button>";
    } else {
      for (var i = 0; i < list.length; i++) {
        var b = list[i];
        var live = b.status === "active";
        html += '<div class="bk ' + (live ? "" : "cancelled") + '">' +
          '<div class="t"><h3>' + esc(b.movieTitle) + "</h3>" +
          (live ? '<span class="pill">' + esc(t("confirmed")) + "</span>"
                : '<span class="tagc">' + esc(t("cancelled")) + "</span>") + "</div>" +
          '<div class="id">' + esc(b.id) + "</div>" +
          '<div class="m">' + esc(prettyDate(b.date)) + " · " + esc(b.time) + " · " +
          esc(b.seats.map(function (x) { return x.id; }).join(", ")) + " · " + money(b.total) + "</div>" +
          '<div class="acts">' +
            '<button class="btn small ghost" onclick="gjViewBooking(\'' + b.id + '\')">' + esc(t("view")) + "</button>" +
            (live ? '<button class="btn small ghost" onclick="gjCancel(\'' + b.id + '\')">' + esc(t("cancel")) + "</button>" : "") +
          "</div></div>";
      }
    }
    $("v-bookings").innerHTML = html;
  }

  /* ---------------- master render ---------------- */
  function render() {
    document.documentElement.lang = state.lang;
    $("langBtn").textContent = state.lang === "en" ? "বাংলা" : "English";
    $("hallName").textContent = state.lang === "bn" ? G.hall.nameBn : G.hall.name;
    $("hallPlace").textContent = G.hall.place;
    $("tabHomeLabel").textContent = t("nowShowing");
    $("tabBookingsLabel").textContent = t("myTickets");

    var views = ["home", "shows", "seats", "pay", "ticket", "bookings"];
    for (var i = 0; i < views.length; i++) {
      var el = $("v-" + views[i]);
      el.className = "view" + (state.screen === views[i] ? " active" : "");
    }

    if (state.screen === "home") renderHome();
    else if (state.screen === "shows") renderShows();
    else if (state.screen === "seats") renderSeats();
    else if (state.screen === "pay") renderPay();
    else if (state.screen === "ticket") renderTicket();
    else if (state.screen === "bookings") renderBookings();

    // bottom bar only on the seat screen
    var bar = $("bottombar");
    if (state.screen === "seats") { bar.className = "bottombar on"; }
    else { bar.className = "bottombar"; bar.innerHTML = ""; }

    // tab bar hidden where a bottom action bar is shown
    var tabs = $("tabbar");
    tabs.className = "tabbar" + (state.screen === "seats" ? " hide" : "");
    $("tab-home").className = "tab" + (state.screen === "home" ? " on" : "");
    $("tab-bookings").className = "tab" + (state.screen === "bookings" ? " on" : "");

    window.scrollTo(0, 0);
  }

  /* ---------------- boot ---------------- */
  load();
  state.date = dates()[0].iso;
  render();
})();
