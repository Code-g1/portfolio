/* Grisan Acharya — portfolio interactions
   Menu, scroll reveal, event countdowns, photo lightbox, contact form. */

(function () {
    "use strict";

    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    /* ---------- Mobile menu ---------- */
    var toggle = $(".nav-toggle");
    var menu = $("#site-menu");

    function setMenu(open) {
        if (!toggle || !menu) return;
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        menu.classList.toggle("open", open);
        document.body.classList.toggle("menu-open", open);
    }

    if (toggle && menu) {
        toggle.addEventListener("click", function () {
            setMenu(toggle.getAttribute("aria-expanded") !== "true");
        });
        $$("a", menu).forEach(function (a) {
            a.addEventListener("click", function () { setMenu(false); });
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") setMenu(false);
        });
        window.addEventListener("resize", function () {
            if (window.innerWidth > 860) setMenu(false);
        });
    }

    /* ---------- Header line appears after scrolling ---------- */
    var header = $(".site-header");
    function onScroll() {
        if (header) header.classList.toggle("scrolled", window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    /* ---------- Scroll reveal ---------- */
    var reveals = $$(".reveal");
    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (en) {
                if (en.isIntersecting) {
                    en.target.classList.add("in");
                    io.unobserve(en.target);
                }
            });
        }, { threshold: 0.12 });
        reveals.forEach(function (el) { io.observe(el); });
    } else {
        reveals.forEach(function (el) { el.classList.add("in"); });
    }

    /* ---------- Event countdowns ---------- */
    $$(".event[data-date]").forEach(function (ev) {
        var pill = $(".pill", ev);
        if (!pill) return;
        var parts = ev.getAttribute("data-date").split("-");
        var target = new Date(+parts[0], +parts[1] - 1, +parts[2]);
        var now = new Date();
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var days = Math.round((target - today) / 86400000);

        if (days > 1) pill.textContent = "in " + days + " days";
        else if (days === 1) pill.textContent = "tomorrow";
        else if (days === 0) pill.textContent = "today!";
        else { pill.textContent = "done"; ev.classList.add("done"); }
    });

    /* ---------- Photo lightbox ---------- */
    var triggers = $$("[data-lightbox]");
    if (triggers.length) {
        var box = document.createElement("div");
        box.className = "lightbox";
        box.setAttribute("role", "dialog");
        box.setAttribute("aria-modal", "true");
        box.setAttribute("aria-label", "Photo viewer");
        box.innerHTML =
            '<button type="button" class="lb-btn lb-close" aria-label="Close photo">&times;</button>' +
            '<button type="button" class="lb-btn lb-prev" aria-label="Previous photo">&#8592;</button>' +
            '<img alt=""><p></p>' +
            '<button type="button" class="lb-btn lb-next" aria-label="Next photo">&#8594;</button>';
        document.body.appendChild(box);

        var big = $("img", box);
        var cap = $("p", box);
        var current = 0;
        var opener = null;

        var show = function (i) {
            current = (i + triggers.length) % triggers.length;
            var t = triggers[current];
            var small = $("img", t);
            big.src = t.getAttribute("data-full") || small.src;
            big.alt = small.alt;
            var fc = t.parentNode.querySelector("figcaption");
            cap.textContent = fc ? fc.textContent.trim() : "";
        };
        var open = function (i) {
            opener = document.activeElement;
            show(i);
            box.classList.add("open");
            document.body.classList.add("menu-open");
            $(".lb-close", box).focus();
        };
        var close = function () {
            box.classList.remove("open");
            document.body.classList.remove("menu-open");
            if (opener) opener.focus();
        };

        triggers.forEach(function (t, i) {
            t.addEventListener("click", function () { open(i); });
        });
        $(".lb-close", box).addEventListener("click", close);
        $(".lb-prev", box).addEventListener("click", function () { show(current - 1); });
        $(".lb-next", box).addEventListener("click", function () { show(current + 1); });
        box.addEventListener("click", function (e) { if (e.target === box) close(); });
        document.addEventListener("keydown", function (e) {
            if (!box.classList.contains("open")) return;
            if (e.key === "Escape") close();
            if (e.key === "ArrowLeft") show(current - 1);
            if (e.key === "ArrowRight") show(current + 1);
        });
    }

    /* ---------- Contact form (static demo: nothing is stored or sent) ---------- */
    var form = $("#contact-form");
    var thanks = $("#thanks");

    if (form && thanks) {
        form.addEventListener("submit", function (e) {
            e.preventDefault();
            if (!form.checkValidity()) { form.reportValidity(); return; }

            var d = new FormData(form);
            $("#thanks-name").textContent = d.get("first-name");

            var body =
                "Hi Grisan,\n\n" + d.get("message") + "\n\n" +
                "— " + d.get("first-name") + " " + d.get("last-name") + "\n" +
                "Phone: " + d.get("phone") + "\n" +
                "Email: " + d.get("email") + "\n" +
                "Address: " + d.get("address") + "\n" +
                "Best way to reply: " + d.get("reply");
            $("#mail-link").href =
                "mailto:grisanacharya27@gmail.com?subject=" +
                encodeURIComponent("[Portfolio] " + d.get("topic")) +
                "&body=" + encodeURIComponent(body);

            form.hidden = true;
            thanks.hidden = false;
            thanks.scrollIntoView({ behavior: "smooth", block: "center" });
        });

        $("#again").addEventListener("click", function () {
            form.reset();
            thanks.hidden = true;
            form.hidden = false;
            $("#first-name").focus();
        });
    }
})();
