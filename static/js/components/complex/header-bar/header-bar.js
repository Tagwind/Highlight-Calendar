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
          <button class="nav-left">◀</button>
          <div class="current-label"></div>
          <button class="nav-right">▶</button>
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

    this.calendarTypeDropDown.setValue("month");
    this.viewMode = this.calendarTypeDropDown.getValue(); // month | week | day
    this.calendarTypeDropDown.addEventListener("change", (e) => {
      this.viewMode = e.detail.value;
      this.updateLabel();
      this.dispatchEvent(
        new CustomEvent("calendarTypeChanged", {
          detail: e.detail,
          bubbles: true,
        }),
      );
    });

    this.updateLabel();
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
    const label = this.shadowRoot.querySelector(".current-label");

    if (this.viewMode === "month") {
      label.textContent = this.currentDate.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
    }

    if (this.viewMode === "week") {
      const start = new Date(this.currentDate);
      start.setDate(start.getDate() - start.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      label.textContent =
        start.toLocaleDateString() + " - " + end.toLocaleDateString();
    }

    if (this.viewMode === "day") {
      label.textContent = this.currentDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    }
  }
}

customElements.define("hl-header-bar", HeaderBar);
