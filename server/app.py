from flask import Flask
from flask_cors import CORS
import os
from dotenv import load_dotenv
import traceback

from api.catalog_routes import catalog_bp
from api.vibe_routes import vibe_bp
from api.auth_routes import auth_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Configure app
    app.secret_key = os.urandom(24)
    
    # Enable CORS for the React app - allow all routes from localhost:3000
    CORS(app, 
         origins=["http://localhost:3000"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "OPTIONS"])
    
    # Register blueprints
    app.register_blueprint(catalog_bp)
    app.register_blueprint(vibe_bp)
    app.register_blueprint(auth_bp)
    
    @app.errorhandler(404)
    def not_found_error(error):
        return {"error": "Resource not found"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f"Internal error: {str(error)}")
        app.logger.error(traceback.format_exc())
        return {"error": "An unexpected error occurred"}, 500
    
    return app

app = create_app()

if __name__ == "__main__":
    app.run(port=5000, debug=True) 