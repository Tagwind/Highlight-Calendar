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
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startOffset = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const totalCells = startOffset + totalDays;
    const weeks = Math.ceil(totalCells / 7);

    // Dynamically set grid rows
    this.grid.style.gridTemplateRows = `repeat(${weeks}, 1fr)`;

    const fragment = document.createDocumentFragment();

    // Leading blanks
    for (let i = 0; i < startOffset; i++) {
      fragment.appendChild(this.RenderDayCard(null, true));
    }

    // Actual days
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day);
      fragment.appendChild(this.RenderDayCard(date, false));
    }

    return fragment;
  }

  RenderWeekView() {
    const today = new Date();
    const start = new Date(today);
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
    fragment.appendChild(this.RenderDayCard(new Date(), false));
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

    if (dim) {
      card.setAttribute("dim", "");
    }

    return card;
  }
}

customElements.define("hl-calendar", CalendarView);
