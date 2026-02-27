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
            <div class="calendar-avatar">This will be avatars</div>
            <div class="calendar-controls">Left namej right View</div>
        </div>
    </div>
    `;

    // Cache reference
    this.header = this.shadowRoot.querySelector(".header-container");
  }
}

customElements.define("hl-header-bar", HeaderBar);
