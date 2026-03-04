class CalendarView extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });

    // Attach stylesheet
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/css/baseStyleSheet.css";
    this.shadowRoot.appendChild(link);
    link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "/static/js/components/views/calendar/calendar.css";
    this.shadowRoot.appendChild(link);

    // Create static layout
    this.shadowRoot.innerHTML += `
      <div class="calendar-view">
        <div class="calendar-grid"></div>
      </div>
    `;

    // Cache reference
    this.grid = this.shadowRoot.querySelector(".calendar-grid");

    this.currentView = "month";
    this.currentDate = new Date();

    document.addEventListener("date-change", (e) => {
      this.currentDate = e.detail.date;
      this.viewMode = e.detail.view;
      this.Render();
    });

    document.addEventListener("calendarTypeChanged", (e) => {
      this.currentView = e.detail.value;
      this.Render();
    });

    this.Render();
  }

  Render() {
    this.grid.className = "calendar-grid";

    // Clear inline grid rows. Month view adds an inline style that might need cleared
    this.grid.style.removeProperty("grid-template-rows");

    switch (this.currentView) {
      case "month":
        this.grid.classList.add("month-view");
        this.grid.replaceChildren(this.RenderMonthView());
        break;

      case "week":
        this.grid.classList.add("week-view");
        this.grid.replaceChildren(this.RenderWeekView());
        break;

      case "day":
        this.grid.classList.add("day-view");
        this.grid.replaceChildren(this.RenderDayView());
        break;
    }
  }

  RenderMonthView() {
    const date = this.currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const totalCells = startOffset + totalDays;
    // Always round up to full weeks, with a minimum trailing row if last week is full
    const weeks = Math.ceil(totalCells / 7) + (totalCells % 7 === 0 ? 1 : 0);
    const gridCells = weeks * 7;

    this.grid.style.gridTemplateRows = `repeat(${weeks}, 1fr)`;

    const fragment = document.createDocumentFragment();

    // Previous month overflow
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startOffset - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i);
      fragment.appendChild(this.RenderDayCard(d, true));
    }

    // Current month
    for (let day = 1; day <= totalDays; day++) {
      fragment.appendChild(
        this.RenderDayCard(new Date(year, month, day), false),
      );
    }

    // Next month overflow
    const trailingDays = gridCells - startOffset - totalDays;
    for (let day = 1; day <= trailingDays; day++) {
      const d = new Date(year, month + 1, day);
      fragment.appendChild(this.RenderDayCard(d, true));
    }

    return fragment;
  }

  RenderWeekView() {
    const date = this.currentDate;
    const start = new Date(date);
    start.setDate(today.getDate() - today.getDay());

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      fragment.appendChild(this.RenderDayCard(date, false));
    }

    return fragment;
  }

  RenderDayView() {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(this.RenderDayCard(this.currentDate, false));
    return fragment;
  }

  RenderDayCard(date, dim) {
    const card = document.createElement("hl-day-card");

    if (!date) {
      card.setAttribute("empty", "");
      card.setAttribute("dim", "");
      return card;
    }

    card.setAttribute("date", date.getDate());
    card.setAttribute("month", date.getMonth());
    card.setAttribute("year", date.getFullYear());

    if (dim) {
      card.setAttribute("dim", "");
    }

    return card;
  }
}

customElements.define("hl-calendar", CalendarView);
