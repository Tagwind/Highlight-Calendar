const template = document.createElement("template");
template.innerHTML = `
  <link rel="stylesheet" href="/static/css/baseStyleSheet.css">
  <link rel="stylesheet" href="/static/js/components/basic/card/card.css">
  <div class="card">
    <slot></slot>
  </div>
`;

class Card extends HTMLElement {
  connectedCallback() {
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }
}

customElements.define("hl-card", Card);
