const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="/static/css/baseStyleSheet.css">
  <link rel="stylesheet" href="/static/js/components/complex/calendarday/calendarday.css">
  <hl-card class="card">
    <div class="content"></div>
  </hl-card>
`;

class DayCard extends HTMLElement {
  static get observedAttributes() {
    return ["date", "dim", "empty"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.content = this.shadowRoot.querySelector(".content");
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback() {
    this.render();
  }

  render() {
    const date = this.getAttribute("date");
    const empty = this.hasAttribute("empty");

    this.content.innerHTML = empty
      ? `<div class="day-header"></div>`
      : `
        <div class="day-header">${date}</div>
        <div class="events">
          <slot></slot>
        </div>
      `;
  }
}

customElements.define("hl-day-card", DayCard);
