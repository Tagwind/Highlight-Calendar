/**
 * hl-drop-down — Custom multi-select dropdown component
 *
 * Usage:
 *   <hl-drop-down placeholder="Choose items..." multiple>
 *     <hl-option value="1" icon="🍎">Apple</hl-option>
 *     <hl-option value="2" icon="🍌">Banana</hl-option>
 *     <hl-option value="3" icon="🍇" disabled>Grapes</hl-option>
 *   </hl-drop-down>
 *
 * Attributes:
 *   placeholder  — text shown when nothing selected
 *   multiple     — enables multi-select mode (boolean)
 *   disabled     — disables the whole component (boolean)
 *
 * Events:
 *   change       — fires on selection change, detail: { value, values, labels }
 *
 * Methods:
 *   getValue()   — returns selected value (single) or array (multiple)
 *   setValue(v)  — sets selected value(s) programmatically
 *   clear()      — clears all selections
 */

class HlSelect extends HTMLElement {
  static get observedAttributes() {
    return ["placeholder", "multiple", "disabled", "hover"];
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    // Load stylesheets
    const baseLink = document.createElement("link");
    baseLink.rel = "stylesheet";
    baseLink.href = "/static/css/baseStyleSheet.css";
    this.shadowRoot.appendChild(baseLink);

    const compLink = document.createElement("link");
    compLink.rel = "stylesheet";
    compLink.href = "/static/js/components/basic/drop-down/drop-down.css";
    this.shadowRoot.appendChild(compLink);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <div class="hl-drop-down" part="select">
        <div class="hl-drop-down__trigger" tabindex="0" role="combobox"
             aria-haspopup="listbox" aria-expanded="false">
          <span class="hl-drop-down__label"></span>
          <span class="hl-drop-down__arrow">▾</span>
        </div>

        <div class="hl-drop-down__dropdown" role="listbox" aria-multiselectable="false">
          <ul class="hl-drop-down__list"></ul>
        </div>
      </div>
    `;
    this.shadowRoot.appendChild(wrapper);

    // Cache DOM refs
    this._root = this.shadowRoot.querySelector(".hl-drop-down");
    this._trigger = this.shadowRoot.querySelector(".hl-drop-down__trigger");
    this._label = this.shadowRoot.querySelector(".hl-drop-down__label");
    this._dropdown = this.shadowRoot.querySelector(".hl-drop-down__dropdown");
    this._list = this.shadowRoot.querySelector(".hl-drop-down__list");

    // Internal state
    this._isOpen = false;
    this._selected = new Set(); // Set of values (strings)
    this._options = []; // [{ value, label, icon, disabled }]
    this._hoverTimer = null;

    this._buildOptions();
    this._bindEvents();
    this._updateLabel();

    // Watch for dynamic <hl-option> changes
    this._observer = new MutationObserver(() => {
      this._buildOptions();
      this._updateLabel();
    });
    this._observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
    });
  }

  disconnectedCallback() {
    this._observer?.disconnect();
    document.removeEventListener("click", this._onDocClick);
  }

  attributeChangedCallback() {
    if (!this._root) return;
    this._buildOptions();
    this._updateLabel();
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  getValue() {
    return this.multiple
      ? [...this._selected]
      : ([...this._selected][0] ?? null);
  }

  setValue(v) {
    this._selected.clear();
    const values = Array.isArray(v) ? v : [v];
    values.forEach((val) => {
      if (this._options.find((o) => o.value === String(val))) {
        this._selected.add(String(val));
      }
    });
    this._updateList();
    this._updateLabel();
  }

  clear() {
    this._selected.clear();
    this._updateList();
    this._updateLabel();
  }

  // ─── Getters ───────────────────────────────────────────────────────────────

  get multiple() {
    return this.hasAttribute("multiple");
  }
  get disabled() {
    return this.hasAttribute("disabled");
  }
  get placeholder() {
    return this.getAttribute("placeholder") || "Select…";
  }

  // ─── Build option list from <hl-option> children ───────────────────────────

  _buildOptions() {
    this._options = [...this.querySelectorAll("hl-option")].map((el) => ({
      value: el.getAttribute("value") ?? el.textContent.trim(),
      label: el.textContent.trim(),
      icon: el.getAttribute("icon") || "",
      disabled: el.hasAttribute("disabled"),
    }));

    // Keep only selected values that still exist
    const valid = new Set(this._options.map((o) => o.value));
    for (const v of this._selected) {
      if (!valid.has(v)) this._selected.delete(v);
    }

    this._updateList();
  }

  _updateList() {
    if (!this._list) return;
    this._list.innerHTML = "";

    this._options.forEach((opt) => {
      const li = document.createElement("li");
      li.className = "hl-drop-down__option";
      li.setAttribute("role", "option");
      li.dataset.value = opt.value;

      if (opt.disabled) li.classList.add("hl-drop-down__option--disabled");
      if (this._selected.has(opt.value))
        li.classList.add("hl-drop-down__option--selected");

      li.innerHTML = `
        ${opt.icon ? `<span class="hl-drop-down__icon">${opt.icon}</span>` : ""}
        <span class="hl-drop-down__option-label">${opt.label}</span>
        ${this.multiple ? `<span class="hl-drop-down__check">${this._selected.has(opt.value) ? "✓" : ""}</span>` : ""}
      `;

      li.addEventListener("click", (e) => {
        e.stopPropagation();
        if (!opt.disabled) this._selectOption(opt.value);
      });

      this._list.appendChild(li);
    });

    // Update ARIA
    if (this._dropdown) {
      this._dropdown.setAttribute(
        "aria-multiselectable",
        this.multiple ? "true" : "false",
      );
    }
  }

  // ─── Selection logic ───────────────────────────────────────────────────────

  _selectOption(value) {
    if (this.multiple) {
      if (this._selected.has(value)) {
        this._selected.delete(value);
      } else {
        this._selected.add(value);
      }
    } else {
      this._selected.clear();
      this._selected.add(value);
      this._close();
    }

    this._updateList();
    this._updateLabel();
    this._emitChange();
  }

  _emitChange() {
    const values = [...this._selected];
    const labels = values.map(
      (v) => this._options.find((o) => o.value === v)?.label ?? v,
    );

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: {
          value: this.multiple ? values : (values[0] ?? null),
          values,
          labels,
        },
        bubbles: true,
      }),
    );
  }

  // ─── Label display ─────────────────────────────────────────────────────────

  _updateLabel() {
    if (!this._label) return;

    if (this._selected.size === 0) {
      this._label.textContent = this.placeholder;
      this._label.classList.add("hl-drop-down__label--placeholder");
      return;
    }

    this._label.classList.remove("hl-drop-down__label--placeholder");

    if (this.multiple) {
      const names = [...this._selected].map(
        (v) => this._options.find((o) => o.value === v)?.label ?? v,
      );

      if (names.length <= 2) {
        this._label.textContent = names.join(", ");
      } else {
        this._label.textContent = `${names[0]}, ${names[1]} +${names.length - 2} more`;
      }
    } else {
      const opt = this._options.find((o) => o.value === [...this._selected][0]);
      this._label.innerHTML = opt?.icon
        ? `<span class="hl-drop-down__trigger-icon">${opt.icon}</span> ${opt.label}`
        : (opt?.label ?? this.placeholder);
    }
  }

  // ─── Open / Close ──────────────────────────────────────────────────────────

  _open() {
    if (this._isOpen || this.disabled) return;
    this._isOpen = true;
    this._root.classList.add("hl-drop-down--open");
    this._trigger.setAttribute("aria-expanded", "true");

    console.log("_open called");
    console.log("_root:", this._root);
    console.log("_dropdown:", this._dropdown);

    console.log("classes on root:", this._root.className);

    requestAnimationFrame(() => {
      console.log("rAF fired, _dropdown:", this._dropdown);
      if (!this._dropdown) return;

      const triggerRect = this._trigger.getBoundingClientRect();
      const dropHeight = this._dropdown.offsetHeight;
      const spaceBelow = window.innerHeight - triggerRect.bottom;

      if (spaceBelow < dropHeight + 8 && triggerRect.top > dropHeight + 8) {
        this._root.classList.add("hl-drop-down--dropup");
      } else {
        this._root.classList.remove("hl-drop-down--dropup");
      }
      console.log("classes on root:", this._root.className);
    });
  }

  _close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._root.classList.remove("hl-drop-down--open");
    this._trigger.setAttribute("aria-expanded", "false");
  }

  _toggle() {
    console.log("_toggle called, isOpen:", this._isOpen);
    this._isOpen ? this._close() : this._open();
  }

  // ─── Event binding ─────────────────────────────────────────────────────────

  _bindEvents() {
    // Click trigger
    this._trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggle();
    });

    // Hover open/close (skipped on touch-primary devices)
    const isTouchDevice = window.matchMedia(
      "(hover: none) and (pointer: coarse)",
    ).matches;

    if (!isTouchDevice && this.hasAttribute("hover")) {
      this._root.addEventListener("mouseenter", () => {
        clearTimeout(this._hoverTimer);
        this._open();
      });

      this._root.addEventListener("mouseleave", () => {
        this._hoverTimer = setTimeout(() => this._close(), 200);
      });
    }

    // Close on outside click
    this._onDocClick = () => this._close();
    document.addEventListener("click", this._onDocClick);

    // Keyboard navigation
    this._trigger.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          this._toggle();
          break;
        case "Escape":
          this._close();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (!this._isOpen) this._open();
          this._focusOption(0);
          break;
      }
    });

    // Keyboard nav within list
    this._list.addEventListener("keydown", (e) => {
      const items = [
        ...this._list.querySelectorAll(
          ".hl-drop-down__option:not(.hl-drop-down__option--disabled)",
        ),
      ];
      const focused = this.shadowRoot.activeElement;
      const idx = items.indexOf(focused);

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          items[Math.min(idx + 1, items.length - 1)]?.focus();
          break;
        case "ArrowUp":
          e.preventDefault();
          if (idx <= 0) this._trigger.focus();
          else items[Math.max(idx - 1, 0)]?.focus();
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          focused?.click();
          break;
        case "Escape":
          this._close();
          this._trigger.focus();
          break;
      }
    });
  }

  _focusOption(index) {
    const items = [
      ...this._list.querySelectorAll(
        ".hl-drop-down__option:not(.hl-drop-down__option--disabled)",
      ),
    ];
    items[index]?.setAttribute("tabindex", "0");
    items[index]?.focus();
  }
}

class HlOption extends HTMLElement {
  // Lightweight host element — data is read by HlSelect
}

customElements.define("hl-drop-down", HlSelect);
customElements.define("hl-option", HlOption);
