from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

user     = os.getenv('PGUSER')
pw       = os.getenv('PGPASSWORD')
host     = os.getenv('PGHOST')
port     = os.getenv('PGPORT', '5432')
database = os.getenv('PGDATABASE')

app.config['SQLALCHEMY_DATABASE_URI'] = (
    f'postgresql+pg8000://{user}:{pw}@{host}:{port}/{database}'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class Task(db.Model):
    id   = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(256), nullable=False)
    done = db.Column(db.Boolean, default=False)

with app.app_context():
    db.create_all()

@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.order_by(Task.id).all()
    return jsonify([{'id': t.id, 'text': t.text, 'done': t.done} for t in tasks])

@app.route('/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    if not data or 'text' not in data:
        return jsonify({'error': 'Text is required'}), 400
    new = Task(text=data['text'])
    db.session.add(new)
    db.session.commit()
    return jsonify({'id': new.id, 'text': new.text, 'done': new.done}), 201

@app.route('/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    task = Task.query.get_or_404(task_id)
    if 'text' in data:
        task.text = data['text']
    if 'done' in data:
        task.done = data['done']
    db.session.commit()
    return jsonify({'id': task.id, 'text': task.text, 'done': task.done})

@app.route('/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return jsonify({'result': True})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
