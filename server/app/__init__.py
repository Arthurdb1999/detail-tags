from flask import Flask, request, jsonify
from flask_cors import CORS

def create_app(test_config=None):

    app = Flask(__name__, instance_relative_config=True)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:3000"], "send_wildcard": "False"}})

    from app import routes
    app.register_blueprint(routes.bp)
    
    return app


