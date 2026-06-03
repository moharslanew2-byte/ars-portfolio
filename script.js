// === THEME (must run first) ===
(function initTheme() {
  const storageKey = "aanya-theme";
  const root = document.documentElement;
  const stored = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored === "light" || stored === "dark" ? stored : prefersDark ? "dark" : "light";
  root.setAttribute("data-theme", theme);
})();

function onDomReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

onDomReady(() => {
  // Theme toggle UI
  (function setupThemeToggle() {
    const storageKey = "aanya-theme";
    const root = document.documentElement;
    const toggle = document.querySelector(".nav__theme-toggle");

    function updateToggleButton(btn) {
      if (!btn) return;
      const isDark = root.getAttribute("data-theme") === "dark";
      btn.textContent = isDark ? "☀️" : "🌙";
      btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    }

    updateToggleButton(toggle);
    if (toggle) {
      toggle.addEventListener("click", () => {
        const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        localStorage.setItem(storageKey, next);
        updateToggleButton(toggle);
      });
    }
  })();

  // === SCROLL PROGRESS BAR ===
  (function initScrollProgress() {
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", "100");
    bar.setAttribute("aria-valuenow", "0");
    bar.setAttribute("aria-label", "Page scroll progress");
    document.body.appendChild(bar);

    let ticking = false;

    function updateProgress() {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? Math.min(100, (scrollTop / max) * 100) : 0;
      bar.style.width = pct + "%";
      bar.setAttribute("aria-valuenow", String(Math.round(pct)));
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(updateProgress);
        }
      },
      { passive: true }
    );
    updateProgress();
  })();

  // === REVEAL ON SCROLL ===
  (function initReveal() {
    const reveals = document.querySelectorAll(".reveal");
    if (!reveals.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach((el) => observer.observe(el));
  })();

  // === NAV SHRINK ON SCROLL ===
  (function initNavScroll() {
    const nav = document.querySelector(".nav");
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  })();

  // === ABOUT STATS COUNTERS ===
  (function initStatsCounters() {
    const strip = document.querySelector(".about__stats");
    if (!strip) return;

    const numbers = strip.querySelectorAll(".about__stat-number[data-target]");

    function animateCounter(el) {
      const target = parseInt(el.getAttribute("data-target"), 10);
      if (Number.isNaN(target)) return;
      const duration = 1400;
      const start = performance.now();

      function frame(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) requestAnimationFrame(frame);
        else el.textContent = String(target);
      }

      requestAnimationFrame(frame);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            numbers.forEach(animateCounter);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );

    observer.observe(strip);
  })();

  // === PAGE-LOAD SPLASH ===
  (function initSplash() {
    const brandEl = document.querySelector(".nav__brand");
    const brandText = brandEl ? brandEl.textContent.trim() : "Portfolio";

    const overlay = document.createElement("div");
    overlay.className = "page-splash";
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = '<p class="page-splash__brand">' + brandText + "</p>";
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      overlay.classList.add("page-splash--show");
    });

    window.setTimeout(() => {
      overlay.classList.add("page-splash--hide");
      window.setTimeout(() => overlay.remove(), 320);
    }, 900);
  })();

  console.log("Portfolio loaded ✅");

  const contactForm = document.getElementById("contact-form");

  if (contactForm) {
    const contactSuccess = document.getElementById("contact-success");
    const contactError = document.getElementById("contact-error");

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      // Read the four form fields and map them to the column names in our Supabase table.
      const formData = new FormData(contactForm);
      const full_name = formData.get("fullName");
      const email = formData.get("email");
      const subject = formData.get("subject");
      const message = formData.get("message");

      // Hide any previous error message while we try sending again.
      contactError.hidden = true;

      // Send the submission to the "form" table in Supabase.
      const response = await supabaseClient
        .from("form")
        .insert([{ full_name, email, subject, message }]);

      // Log the full response so we can inspect data or errors in DevTools.
      console.log(response);

      // If Supabase returned an error, keep the form visible and show the red message.
      if (response.error) {
        contactSuccess.hidden = true;
        contactError.hidden = false;
        return;
      }

      // Success: clear the form, hide it, and show the green confirmation message.
      contactForm.reset();
      contactForm.hidden = true;
      contactError.hidden = true;
      contactSuccess.hidden = false;
    });
  }

  const navToggle = document.querySelector(".nav__toggle");
  const navMenu = document.getElementById("nav-menu");
  const navToggleIcon = document.querySelector(".nav__toggle-icon");

  if (navToggle && navMenu && navToggleIcon) {
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("nav__links--open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
      navToggleIcon.textContent = isOpen ? "✕" : "☰";
    });

    navMenu.querySelectorAll(".nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        if (!window.matchMedia("(max-width: 768px)").matches) {
          return;
        }

        navMenu.classList.remove("nav__links--open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open menu");
        navToggleIcon.textContent = "☰";
      });
    });
  }

  // === ADMIN INBOX (only runs on admin.html) ===
  (function initAdminInbox() {
    const inboxGrid = document.getElementById("admin-inbox-grid");
    if (!inboxGrid) return;

    const messageCountEl = document.getElementById("admin-message-count");
    const unreadOnlyToggle = document.getElementById("admin-unread-only");

    // Turn a database timestamp into a friendly relative time string.
    function timeAgo(dateInput) {
      const then = new Date(dateInput);
      const now = new Date();
      const seconds = Math.floor((now - then) / 1000);

      if (seconds < 60) return "just now";

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) {
        return minutes === 1 ? "1 minute ago" : minutes + " minutes ago";
      }

      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return hours === 1 ? "1 hour ago" : hours + " hours ago";
      }

      const days = Math.floor(hours / 24);
      if (days < 7) {
        return days === 1 ? "1 day ago" : days + " days ago";
      }

      return then.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    // Build one message card from a single row returned by Supabase.
    function createMessageCard(row) {
      const card = document.createElement("article");
      card.className = "admin__card" + (row.is_read ? " is-read" : "");
      card.dataset.id = String(row.id);

      const top = document.createElement("div");
      top.className = "admin__card-top";

      const subject = document.createElement("h3");
      subject.className = "admin__card-subject";
      subject.textContent = row.subject || "(No subject)";

      const time = document.createElement("time");
      time.className = "admin__card-time";
      time.dateTime = row.created_at;
      time.textContent = timeAgo(row.created_at);

      top.append(subject, time);

      const sender = document.createElement("p");
      sender.className = "admin__card-sender";
      sender.textContent = row.full_name + " · " + row.email;

      const body = document.createElement("p");
      body.className = "admin__card-body";
      body.textContent = row.message;

      const footer = document.createElement("div");
      footer.className = "admin__card-footer";

      const markBtn = document.createElement("button");
      markBtn.type = "button";
      markBtn.className = "admin__mark-read";
      markBtn.textContent = "Mark as Read";
      markBtn.disabled = Boolean(row.is_read);

      footer.appendChild(markBtn);
      card.append(top, sender, body, footer);

      return card;
    }

    // Update the toolbar counter text with how many messages we loaded.
    function updateMessageCount(total) {
      if (!messageCountEl) return;
      const label = total === 1 ? "message" : "messages";
      messageCountEl.textContent = "📬 " + total + " " + label;
    }

    // Fetch every submission from Supabase, newest first, and paint the grid.
    async function loadInbox() {
      const response = await supabaseClient
        .from("form")
        .select("*")
        .order("created_at", { ascending: false });

      console.log(response);

      if (response.error) {
        inboxGrid.innerHTML =
          '<p class="admin__empty">Could not load messages. Check the console.</p>';
        return;
      }

      const rows = response.data || [];
      inboxGrid.innerHTML = "";

      if (rows.length === 0) {
        inboxGrid.innerHTML = '<p class="admin__empty">No messages yet.</p>';
        updateMessageCount(0);
        return;
      }

      rows.forEach((row) => {
        inboxGrid.appendChild(createMessageCard(row));
      });

      updateMessageCount(rows.length);
    }

    // When "Mark as Read" succeeds, restyle only that card (no full reload).
    function setCardReadState(card) {
      card.classList.add("is-read");
      const btn = card.querySelector(".admin__mark-read");
      if (btn) btn.disabled = true;
    }

    // Listen for clicks on "Mark as Read" buttons inside the grid.
    inboxGrid.addEventListener("click", async (event) => {
      const button = event.target.closest(".admin__mark-read");
      if (!button || button.disabled) return;

      const card = button.closest(".admin__card");
      if (!card) return;

      const rowId = card.dataset.id;

      const response = await supabaseClient
        .from("form")
        .update({ is_read: true })
        .eq("id", rowId);

      console.log(response);

      if (!response.error) {
        setCardReadState(card);
      }
    });

    // "Unread only" hides read cards with CSS — we do not fetch again.
    if (unreadOnlyToggle) {
      unreadOnlyToggle.addEventListener("change", () => {
        inboxGrid.classList.toggle(
          "admin__grid--unread-only",
          unreadOnlyToggle.checked
        );
      });
    }

    loadInbox();
  })();
});
