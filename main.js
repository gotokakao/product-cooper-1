class WeatherCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 300px;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 10px;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1), 0 6px 6px rgba(0, 0, 0, 0.1);
                    transition: transform 0.3s;
                }
                :host(:hover) {
                    transform: translateY(-5px);
                }
                .weather-icon {
                    width: 100px;
                    height: 100px;
                    margin: 0 auto;
                    position: relative;
                }
                .sun {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 50px;
                    height: 50px;
                    background-color: #ffc107;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    animation: pulse 2s infinite;
                }
                @keyframes pulse {
                    0% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                    100% { transform: translate(-50%, -50%) scale(1); }
                }
            </style>
            <h2>Seoul</h2>
            <div class="weather-icon">
                <div class="sun"></div>
            </div>
            <p>25°C</p>
            <p>Sunny</p>
        `;
    }
}

customElements.define('weather-card', WeatherCard);
