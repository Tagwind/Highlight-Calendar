class HlSettings extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    // Attach stylesheet
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/css/baseStyleSheet.css";
    this.shadowRoot.appendChild(link);
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/js/components/views/settings/settings.css";
    this.shadowRoot.appendChild(link);

    // Append HTML without clobbering the link tags
    const wrapper = document.createElement("div");
    wrapper.className = "settings-view";

    wrapper.innerHTML = `
      <!-- Left Nav -->
      <nav class="nav">
        <div class="nav__title">Settings</div>
        <button class="nav__item active" data-section="general">
          <span class="nav__icon">⚙️</span> General
        </button>
        <button class="nav__item" data-section="account">
          <span class="nav__icon">👤</span> Account
        </button>
        <button class="nav__item" data-section="notifications">
          <span class="nav__icon">🔔</span> Notifications
        </button>
        <button class="nav__item" data-section="privacy">
          <span class="nav__icon">🔒</span> Privacy
        </button>
      </nav>

      <!-- Right Content -->
      <div class="content">

        <!-- General -->
        <div class="section active" id="section-general">
          <div class="section__title">General</div>
          <div class="section__subtitle">Manage your app preferences and appearance.</div>

          <div class="setting-row">
            <div>
              <div class="setting-row__label">Theme</div>
              <div class="setting-row__desc">Choose a color theme for the entire application.</div>
            </div>
            <div class="theme-options">
              <label class="theme-option" data-theme="">
                <div class="theme-option__swatch swatch--light">
                  <div class="theme-option__swatch-nav"></div>
                  <div class="theme-option__swatch-main"></div>
                </div>
                <span class="theme-option__name">Light</span>
              </label>
              <label class="theme-option" data-theme="dark">
                <div class="theme-option__swatch swatch--dark">
                  <div class="theme-option__swatch-nav"></div>
                  <div class="theme-option__swatch-main"></div>
                </div>
                <span class="theme-option__name">Dark</span>
              </label>
              <label class="theme-option" data-theme="indigo">
                <div class="theme-option__swatch swatch--indigo">
                  <div class="theme-option__swatch-nav"></div>
                  <div class="theme-option__swatch-main"></div>
                </div>
                <span class="theme-option__name">Indigo</span>
              </label>
            </div>
          </div>
        </div>

        <!-- Account (stub) -->
        <div class="section" id="section-account">
          <div class="section__title">Account</div>
          <div class="section__subtitle">Manage your account details and preferences.</div>
        </div>

        <!-- Notifications (stub) -->
        <div class="section" id="section-notifications">
          <div class="section__title">Notifications</div>
          <div class="section__subtitle">Control how and when you receive notifications.</div>
        </div>

        <!-- Privacy (stub) -->
        <div class="section" id="section-privacy">
          <div class="section__title">Privacy</div>
          <div class="section__subtitle">Manage your privacy and data settings.</div>
        </div>

      </div>
    `;
    this.shadowRoot.appendChild(wrapper);

    // Nav switching
    this.shadowRoot.querySelectorAll(".nav__item").forEach((btn) => {
      btn.addEventListener("click", () => {
        this.shadowRoot
          .querySelectorAll(".nav__item")
          .forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.shadowRoot
          .querySelectorAll(".section")
          .forEach((s) => s.classList.remove("active"));
        this.shadowRoot
          .getElementById(`section-${btn.dataset.section}`)
          .classList.add("active");
      });
    });

    // Theme switching
    this.shadowRoot.querySelectorAll(".theme-option").forEach((opt) => {
      opt.addEventListener("click", () => {
        const theme = opt.dataset.theme;
        if (theme) {
          document.documentElement.dataset.theme = theme;
        } else {
          delete document.documentElement.dataset.theme;
        }

        this.shadowRoot
          .querySelectorAll(".theme-option")
          .forEach((o) => o.classList.remove("selected"));
        opt.classList.add("selected");

        localStorage.setItem("hl-theme", theme);
        document.dispatchEvent(
          new CustomEvent("theme-change", { detail: { theme } }),
        );
      });
    });

    // Reflect saved theme on load
    const saved = localStorage.getItem("hl-theme") || "";
    const match = this.shadowRoot.querySelector(
      `.theme-option[data-theme="${saved}"]`,
    );
    if (match) {
      this.shadowRoot
        .querySelectorAll(".theme-option")
        .forEach((o) => o.classList.remove("selected"));
      match.classList.add("selected");
    } else {
      this.shadowRoot
        .querySelector('.theme-option[data-theme=""]')
        .classList.add("selected");
    }
  }
}

customElements.define("hl-settings", HlSettings);
