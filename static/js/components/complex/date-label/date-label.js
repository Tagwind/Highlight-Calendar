/**
 * hl-date-label — Clickable date/week/month label with adaptive picker dropdown
 *
 * Usage:
 *   <hl-date-label mode="day"></hl-date-label>
 *   <hl-date-label mode="week"></hl-date-label>
 *   <hl-date-label mode="month"></hl-date-label>
 *
 * Attributes:
 *   value  — ISO date string (e.g. "2026-03-04"), defaults to today
 *   mode   — "day" | "week" | "month" (default: "day")
 *
 * Events:
 *   change — fires on selection, detail: { value, date, label, mode }
 *            week mode also includes: { weekStart, weekEnd }
 *
 * Methods:
 *   getValue()     — returns ISO date string of selected date
 *   setValue(str)  — sets date programmatically
 *   getDate()      — returns a Date object
 *   setMode(mode)  — programmatically set mode: "day" | "week" | "month"
 */

class HlDateLabel extends HTMLElement {
  static get observedAttributes() {
    return ["value", "mode"];
  }

  connectedCallback() {
    this.attachShadow({ mode: "open" });

    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/css/baseStyleSheet.css";
    this.shadowRoot.appendChild(link);

    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/js/components/complex/date-label/date-label.css";
    this.shadowRoot.appendChild(link);

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
        <div class="hdl" part="date-label">
            <div class="hdl__trigger" tabindex="0" role="button" aria-haspopup="true" aria-expanded="false">
                <span class="hdl__icon">📅</span>
                <span class="hdl__label"></span>
                <span class="hdl__arrow">▾</span>
            </div>
            <div class="hdl__dropdown">
                <div class="hdl__header">
                <button class="hdl__nav hdl__nav--prev" aria-label="Previous">‹</button>
                <span class="hdl__nav-label"></span>
                <button class="hdl__nav hdl__nav--next" aria-label="Next">›</button>
                </div>
                <div class="hdl__grid"></div>
                <div class="hdl__footer">
                <button class="hdl__today-btn">Today</button>
                </div>
            </div>
        </div>
        `;
    this.shadowRoot.appendChild(wrapper);

    this._root = this.shadowRoot.querySelector(".hdl");
    this._trigger = this.shadowRoot.querySelector(".hdl__trigger");
    this._label = this.shadowRoot.querySelector(".hdl__label");
    this._dropdown = this.shadowRoot.querySelector(".hdl__dropdown");
    this._navLabel = this.shadowRoot.querySelector(".hdl__nav-label");
    this._grid = this.shadowRoot.querySelector(".hdl__grid");
    this._prevBtn = this.shadowRoot.querySelector(".hdl__nav--prev");
    this._nextBtn = this.shadowRoot.querySelector(".hdl__nav--next");
    this._todayBtn = this.shadowRoot.querySelector(".hdl__today-btn");

    this._isOpen = false;
    this._today = this._stripTime(new Date());
    this._selected = this._parseAttr(this.getAttribute("value")) ?? this._today;
    this._mode = this.getAttribute("mode") ?? "day";
    this._cursor = new Date(
      this._selected.getFullYear(),
      this._selected.getMonth(),
      1,
    );

    this._render();
    this._bindEvents();
  }

  disconnectedCallback() {
    document.removeEventListener("click", this._onDocClick);
  }

  attributeChangedCallback(name, _, newVal) {
    if (!this._root) return;
    if (name === "value") {
      const d = this._parseAttr(newVal);
      if (d) {
        this._selected = d;
        this._cursor = new Date(d.getFullYear(), d.getMonth(), 1);
        this._render();
      }
    }
    if (name === "mode") {
      this._mode = newVal ?? "day";
      this._cursor = new Date(
        this._selected.getFullYear(),
        this._selected.getMonth(),
        1,
      );
      this._render();
    }
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  getValue() {
    return this._toISO(this._selected);
  }
  getDate() {
    return new Date(this._selected);
  }

  setValue(str) {
    const d = this._parseAttr(str);
    if (!d) return;
    this._selected = d;
    this._cursor = new Date(d.getFullYear(), d.getMonth(), 1);
    this._render();
  }

  setMode(mode) {
    this._mode = mode;
    this.setAttribute("mode", mode);
    this._cursor = new Date(
      this._selected.getFullYear(),
      this._selected.getMonth(),
      1,
    );
    this._render();
  }

  // ─── Rendering ─────────────────────────────────────────────────────────────

  _render() {
    this._renderLabel();
    this._mode === "month" ? this._renderMonthGrid() : this._renderDayGrid();
  }

  _renderLabel() {
    if (this._mode === "month") {
      this._label.textContent = this._selected.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    } else if (this._mode === "week") {
      const { start, end } = this._weekRange(this._selected);
      const sameMonth = start.getMonth() === end.getMonth();
      if (sameMonth) {
        const month = start.toLocaleDateString(undefined, { month: "short" });
        this._label.textContent = `${month} ${start.getDate()}–${end.getDate()}, ${start.getFullYear()}`;
      } else {
        const s = start.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        });
        const e = end.toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
        this._label.textContent = `${s} – ${e}`;
      }
    } else {
      this._label.textContent = this._selected.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  }

  _renderDayGrid() {
    const year = this._cursor.getFullYear();
    const month = this._cursor.getMonth();

    this._navLabel.textContent = new Date(year, month, 1).toLocaleDateString(
      undefined,
      { month: "long", year: "numeric" },
    );

    const firstDow = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrev = new Date(year, month, 0).getDate();

    this._grid.className = "hdl__grid hdl__grid--days";
    this._grid.innerHTML = "";

    ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].forEach((d) => {
      const el = document.createElement("span");
      el.className = "hdl__dow";
      el.textContent = d;
      this._grid.appendChild(el);
    });

    const weekRange =
      this._mode === "week" ? this._weekRange(this._selected) : null;

    for (let i = firstDow - 1; i >= 0; i--) {
      const el = document.createElement("button");
      el.className = "hdl__day hdl__day--ghost";
      el.textContent = daysInPrev - i;
      el.tabIndex = -1;
      el.disabled = true;
      this._grid.appendChild(el);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const el = document.createElement("button");
      el.className = "hdl__day";
      el.textContent = d;
      el.dataset.iso = this._toISO(date);

      if (this._sameDay(date, this._today)) el.classList.add("hdl__day--today");

      if (this._mode === "week" && weekRange) {
        if (date >= weekRange.start && date <= weekRange.end) {
          el.classList.add("hdl__day--in-week");
          if (this._sameDay(date, weekRange.start))
            el.classList.add("hdl__day--week-start");
          if (this._sameDay(date, weekRange.end))
            el.classList.add("hdl__day--week-end");
        }
      } else {
        if (this._sameDay(date, this._selected))
          el.classList.add("hdl__day--selected");
      }

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        this._selectDate(date);
      });
      this._grid.appendChild(el);
    }

    const totalCells = firstDow + daysInMonth;
    const remainder = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let d = 1; d <= remainder; d++) {
      const el = document.createElement("button");
      el.className = "hdl__day hdl__day--ghost";
      el.textContent = d;
      el.tabIndex = -1;
      el.disabled = true;
      this._grid.appendChild(el);
    }
  }

  _renderMonthGrid() {
    const year = this._cursor.getFullYear();
    this._navLabel.textContent = String(year);
    this._grid.className = "hdl__grid hdl__grid--months";
    this._grid.innerHTML = "";

    [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].forEach((name, idx) => {
      const el = document.createElement("button");
      el.className = "hdl__month-cell";
      el.textContent = name;

      const isSelected =
        this._selected.getFullYear() === year &&
        this._selected.getMonth() === idx;
      const isToday =
        this._today.getFullYear() === year && this._today.getMonth() === idx;

      if (isToday) el.classList.add("hdl__month-cell--today");
      if (isSelected) el.classList.add("hdl__month-cell--selected");

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        const day = Math.min(
          this._selected.getDate(),
          new Date(year, idx + 1, 0).getDate(),
        );
        this._selectDate(new Date(year, idx, day));
      });

      this._grid.appendChild(el);
    });
  }

  // ─── Selection ─────────────────────────────────────────────────────────────

  _selectDate(date) {
    this._selected = date;
    this._render();
    this._close();

    const detail = {
      value: this._toISO(date),
      date: new Date(date),
      label: this._label.textContent,
      mode: this._mode,
    };

    if (this._mode === "week") {
      const { start, end } = this._weekRange(date);
      detail.weekStart = this._toISO(start);
      detail.weekEnd = this._toISO(end);
    }

    this.dispatchEvent(new CustomEvent("change", { detail, bubbles: true }));
  }

  // ─── Open / Close ──────────────────────────────────────────────────────────

  _open() {
    if (this._isOpen) return;
    this._isOpen = true;
    this._root.classList.add("hdl--open");
    this._trigger.setAttribute("aria-expanded", "true");
    requestAnimationFrame(() => {
      const triggerRect = this._trigger.getBoundingClientRect();
      const spaceBelow = window.innerHeight - triggerRect.bottom;
      if (
        spaceBelow < this._dropdown.offsetHeight + 8 &&
        triggerRect.top > this._dropdown.offsetHeight + 8
      ) {
        this._root.classList.add("hdl--dropup");
      } else {
        this._root.classList.remove("hdl--dropup");
      }
    });
  }

  _close() {
    if (!this._isOpen) return;
    this._isOpen = false;
    this._root.classList.remove("hdl--open");
    this._trigger.setAttribute("aria-expanded", "false");
  }

  _toggle() {
    this._isOpen ? this._close() : this._open();
  }

  // ─── Events ────────────────────────────────────────────────────────────────

  _bindEvents() {
    this._trigger.addEventListener("click", (e) => {
      e.stopPropagation();
      this._toggle();
    });

    this._prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._mode === "month")
        this._cursor.setFullYear(this._cursor.getFullYear() - 1);
      else this._cursor.setMonth(this._cursor.getMonth() - 1);
      this._render();
    });

    this._nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (this._mode === "month")
        this._cursor.setFullYear(this._cursor.getFullYear() + 1);
      else this._cursor.setMonth(this._cursor.getMonth() + 1);
      this._render();
    });

    this._todayBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this._cursor = new Date(
        this._today.getFullYear(),
        this._today.getMonth(),
        1,
      );
      this._selectDate(new Date(this._today));
    });

    this._onDocClick = () => this._close();
    document.addEventListener("click", this._onDocClick);

    this._trigger.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._toggle();
      }
      if (e.key === "Escape") this._close();
    });

    this._dropdown.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this._close();
        this._trigger.focus();
      }
    });
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  _stripTime(d) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  _sameDay(a, b) {
    return (
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate()
    );
  }
  _toISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  _parseAttr(str) {
    if (!str) return null;
    const d = new Date(str + "T00:00:00");
    return isNaN(d) ? null : d;
  }

  _weekRange(date) {
    const start = this._stripTime(new Date(date));
    start.setDate(date.getDate() - date.getDay()); // back to Sunday
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start, end: this._stripTime(end) };
  }
}

customElements.define("hl-date-label", HlDateLabel);
