from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from datetime import datetime, timedelta
import secrets
import jwt
import json

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))
CORS(app, supports_credentials=True, origins=['*'])

# Basit JSON dosya tabanlı veritabanı (Vercel için)
DATA_FILE = '/tmp/data.json'

def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {
        'users': [
            {'id': 1, 'username': 'admin', 'password': 'admin123', 'role': 'admin'},
            {'id': 2, 'username': 'user', 'password': 'user123', 'role': 'user'}
        ],
        'kayitlar': [
            {
                'id': 1,
                'bolum': 'Üretim',
                'teklif_no': 'TK-2025-001',
                'musteri_ismi': 'ABC İnşaat Ltd.',
                'teklif_tarihi': '2025-01-15',
                'onay_tarihi': '2025-01-20',
                'uretime_verilme_tarihi': '2025-01-25',
                'uretim_numarasi': 'UR-001',
                'cam_siparis_tarihi': '2025-01-22',
                'cam_siparis_numarasi': 'CS-001',
                'cam_adedi': '50',
                'uretim_planlama_tarihi': '2025-01-28',
                'paketleme_tarihi': '2025-02-05',
                'kasetleme_tarihi': '2025-02-08',
                'sevk_tarihi': '2025-02-10',
                'notlar': 'İlk sipariş, öncelikli'
            },
            {
                'id': 2,
                'bolum': 'Satış',
                'teklif_no': 'TK-2025-002',
                'musteri_ismi': 'XYZ Yapı A.Ş.',
                'teklif_tarihi': '2025-01-18',
                'onay_tarihi': '2025-01-22',
                'uretime_verilme_tarihi': '2025-01-27',
                'uretim_numarasi': 'UR-002',
                'cam_siparis_tarihi': '2025-01-25',
                'cam_siparis_numarasi': 'CS-002',
                'cam_adedi': '75',
                'uretim_planlama_tarihi': '2025-02-01',
                'paketleme_tarihi': '2025-02-08',
                'kasetleme_tarihi': '2025-02-12',
                'sevk_tarihi': '2025-02-15',
                'notlar': 'Standart teslimat'
            }
        ],
        'next_id': 3
    }

def save_data(data):
    with open(DATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def create_token(user_id, username, role):
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, app.secret_key, algorithm='HS256')

def verify_token(token):
    try:
        payload = jwt.decode(token, app.secret_key, algorithms=['HS256'])
        return payload
    except:
        return None

@app.route('/api/login', methods=['POST'])
def login():
    data_store = load_data()
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    user = next((u for u in data_store['users'] if u['username'] == username and u['password'] == password), None)
    
    if user:
        token = create_token(user['id'], user['username'], user['role'])
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'username': user['username'],
                'role': user['role']
            }
        })
    
    return jsonify({'success': False, 'message': 'Kullanıcı adı veya şifre hatalı'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    return jsonify({'success': True})

@app.route('/api/me', methods=['GET'])
def get_current_user():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_data = verify_token(token)
    
    if user_data:
        return jsonify({
            'username': user_data['username'],
            'role': user_data['role']
        })
    return jsonify({'error': 'Not authenticated'}), 401

@app.route('/api/kayitlar', methods=['GET'])
def get_kayitlar():
    data_store = load_data()
    return jsonify(data_store['kayitlar'])

@app.route('/api/kayitlar', methods=['POST'])
def create_kayit():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_data = verify_token(token)
    
    if not user_data or user_data['role'] != 'admin':
        return jsonify({'error': 'Yetkisiz işlem'}), 403
    
    data_store = load_data()
    data = request.json
    
    new_kayit = {
        'id': data_store['next_id'],
        'bolum': data.get('bolum'),
        'teklif_no': data.get('teklif_no'),
        'musteri_ismi': data.get('musteri_ismi'),
        'teklif_tarihi': data.get('teklif_tarihi'),
        'onay_tarihi': data.get('onay_tarihi'),
        'uretime_verilme_tarihi': data.get('uretime_verilme_tarihi'),
        'uretim_numarasi': data.get('uretim_numarasi'),
        'cam_siparis_tarihi': data.get('cam_siparis_tarihi'),
        'cam_siparis_numarasi': data.get('cam_siparis_numarasi'),
        'cam_adedi': data.get('cam_adedi'),
        'uretim_planlama_tarihi': data.get('uretim_planlama_tarihi'),
        'paketleme_tarihi': data.get('paketleme_tarihi'),
        'kasetleme_tarihi': data.get('kasetleme_tarihi'),
        'sevk_tarihi': data.get('sevk_tarihi'),
        'notlar': data.get('notlar')
    }
    
    data_store['kayitlar'].insert(0, new_kayit)
    data_store['next_id'] += 1
    save_data(data_store)
    
    return jsonify({'id': new_kayit['id']}), 201

@app.route('/api/kayitlar/<int:id>', methods=['PUT'])
def update_kayit(id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_data = verify_token(token)
    
    if not user_data:
        return jsonify({'error': 'Yetkisiz işlem'}), 403
    
    data_store = load_data()
    data = request.json
    
    kayit = next((k for k in data_store['kayitlar'] if k['id'] == id), None)
    if not kayit:
        return jsonify({'error': 'Kayıt bulunamadı'}), 404
    
    # Kullanıcı sadece not güncelleyebilir
    if user_data['role'] == 'user':
        eski_not = kayit.get('notlar', '')
        yeni_not = data.get('notlar', '')
        
        tarih = datetime.now().strftime('%Y-%m-%d %H:%M')
        not_ekleme = f"\n[{user_data['username']} - {tarih}]: {yeni_not}"
        
        kayit['notlar'] = eski_not + not_ekleme
        save_data(data_store)
        return jsonify({'success': True})
    
    # Admin tüm alanları güncelleyebilir
    if user_data['role'] == 'admin':
        kayit.update({
            'bolum': data.get('bolum'),
            'teklif_no': data.get('teklif_no'),
            'musteri_ismi': data.get('musteri_ismi'),
            'teklif_tarihi': data.get('teklif_tarihi'),
            'onay_tarihi': data.get('onay_tarihi'),
            'uretime_verilme_tarihi': data.get('uretime_verilme_tarihi'),
            'uretim_numarasi': data.get('uretim_numarasi'),
            'cam_siparis_tarihi': data.get('cam_siparis_tarihi'),
            'cam_siparis_numarasi': data.get('cam_siparis_numarasi'),
            'cam_adedi': data.get('cam_adedi'),
            'uretim_planlama_tarihi': data.get('uretim_planlama_tarihi'),
            'paketleme_tarihi': data.get('paketleme_tarihi'),
            'kasetleme_tarihi': data.get('kasetleme_tarihi'),
            'sevk_tarihi': data.get('sevk_tarihi'),
            'notlar': data.get('notlar')
        })
        save_data(data_store)
        return jsonify({'success': True})
    
    return jsonify({'error': 'Yetkisiz işlem'}), 403

@app.route('/api/kayitlar/<int:id>', methods=['DELETE'])
def delete_kayit(id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_data = verify_token(token)
    
    if not user_data or user_data['role'] != 'admin':
        return jsonify({'error': 'Yetkisiz işlem'}), 403
    
    data_store = load_data()
    data_store['kayitlar'] = [k for k in data_store['kayitlar'] if k['id'] != id]
    save_data(data_store)
    return jsonify({'success': True})
