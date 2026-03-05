import { getIcon, onIconsReady } from "/static/js/icons.js";

class HeaderBar extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    // Attach stylesheet
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/css/baseStyleSheet.css";
    this.shadowRoot.appendChild(link);
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/js/components/complex/header-bar/header-bar.css";
    this.shadowRoot.appendChild(link);

    // Create static layout
    this.shadowRoot.innerHTML += `
    <div class="header-container">
        <div class="left-group">
            <div class="calendar-name">Smith Family</div>
            <div class="calendar-time">Time 12:12</div>
            <div class="calendar-weather">90*sunny</div>
        </div>

        <div class="right-group">
          <hl-drop-down class="calendarTypeDropDown">
            <hl-option value="month">Month</hl-option>
            <hl-option value="week">Week</hl-option>
            <hl-option value="day">Day</hl-option>
          </hl-drop-down>
          <button class="nav-left"></button>
          <hl-date-label id="dateLabel" mode="month"></hl-date-label>
          <button class="nav-right"></button>
          <div class="calendar-avatar"></div>
        </div>
    </div>
    `;

    this.currentDate = new Date();

    this.shadowRoot.querySelector(".nav-left").addEventListener("click", () => {
      this.navigate(-1);
      this.updateLabel();
    });

    this.shadowRoot
      .querySelector(".nav-right")
      .addEventListener("click", () => {
        this.navigate(1);
        this.updateLabel();
      });

    // Cache reference
    this.header = this.shadowRoot.querySelector(".header-container");
    this.calendarTypeDropDown = this.shadowRoot.querySelector(
      ".calendarTypeDropDown",
    );
    this.dateLabel = this.shadowRoot.querySelector("hl-date-label");

    this.calendarTypeDropDown.setValue("month");
    this.viewMode = this.calendarTypeDropDown.getValue(); // month | week | day
    this.calendarTypeDropDown.addEventListener("change", (e) => {
      this.viewMode = e.detail.value;
      this.dateLabel.setMode(this.viewMode);
      this.updateLabel();
      this.dispatchEvent(
        new CustomEvent("calendarTypeChanged", {
          detail: e.detail,
          bubbles: true,
        }),
      );
    });

    this.dateLabel.addEventListener("change", (e) => {
      const { mode, date, weekStart, weekEnd } = e.detail;

      this.dispatchEvent(
        new CustomEvent("dateLabelChanged", {
          detail: e.detail,
          bubbles: true,
        }),
      );
    });

    onIconsReady(() => this.loadIcons());

    customElements.whenDefined("hl-date-label").then(() => {
      this.updateLabel();
    });
  }

  loadIcons() {
    this.shadowRoot
      .querySelector(".nav-left")
      .appendChild(getIcon("chevron-left"));
    this.shadowRoot
      .querySelector(".nav-right")
      .appendChild(getIcon("chevron-right"));
  }

  navigate(direction) {
    const newDate = new Date(this.currentDate);
    this.viewMode = this.calendarTypeDropDown.getValue();

    if (this.viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    }

    if (this.viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7 * direction);
    }

    if (this.viewMode === "day") {
      newDate.setDate(newDate.getDate() + direction);
    }

    this.currentDate = newDate;

    this.dispatchEvent(
      new CustomEvent("date-change", {
        detail: {
          date: this.currentDate,
          view: this.viewMode,
        },
        bubbles: true,
      }),
    );
  }

  updateLabel() {
    this.dateLabel.setMode(this.viewMode);
    this.dateLabel.setValue(this._toISO(this.currentDate));
  }
  _toISO(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
}

customElements.define("hl-header-bar", HeaderBar);
