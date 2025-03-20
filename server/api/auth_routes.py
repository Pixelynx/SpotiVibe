from flask import Blueprint, jsonify, request, redirect, session
from services.spotify_api import get_spotify_oauth

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/api/login')
def login():
    sp_oauth = get_spotify_oauth()
    auth_url = sp_oauth.get_authorize_url()
    return jsonify({"auth_url": auth_url})

@auth_bp.route('/api/callback')
def callback():
    sp_oauth = get_spotify_oauth()
    session.clear()
    code = request.args.get('code')
    token_info = sp_oauth.get_access_token(code)
    session["token_info"] = token_info
    return redirect('/')

@auth_bp.route('/api/auth_status')
def auth_status():
    if 'token_info' in session:
        return jsonify({'authenticated': True})
    return jsonify({'authenticated': False}) 