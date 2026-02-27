from flask import Flask, render_template, request, jsonify
from datetime import datetime
import uuid

app = Flask(__name__)

EVENTS = [{
  "id": "evt_123",
  "title": "Soccer Practice",
  "date": "2026-02-23",
  "time": "5:30 PM",
  "source": "google",   
  "color": "#4285F4",
  "allDay": False
}]

@app.route('/')
def shell():
    return render_template('index.html.jinja')

@app.route('/view/calendar')
def view_calendar():
    return render_template('views/calendar.html')

@app.route('/view/rewards')
def view_rewards():
    return "<h3>Rewards program</h3><p>points: 5</p>"

@app.route('/view/settings')
def view_settings():
    return "<h3>System Settings</h3><button>Restart Pi</button>"


# Database API 
@app.route("/api/events")
def get_events():
    return jsonify(EVENTS)

@app.route("/api/events", methods=["POST"])
def create_event():
    data = request.json
    event = {
        "id": str(uuid.uuid4()),
        "title": data["title"],
        "start": data["start"],  # ISO string
        "end": data["end"]
    }
    EVENTS.append(event)
    return jsonify(event)


if __name__ == '__main__':
    app.run(debug=True)