from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from datetime import datetime, timedelta
import secrets
import os
import jwt

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))
CORS(app, supports_credentials=True, origins=['https://rigelistakip.vercel.app', 'http://localhost:5173'])

# Vercel için veritabanı yolu
DB_PATH = '/tmp/kayitlar.db'

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    conn.execute('''
        CREATE TABLE IF NOT EXISTS kayitlar (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bolum TEXT,
            teklif_no TEXT,
            musteri_ismi TEXT,
            teklif_tarihi TEXT,
            onay_tarihi TEXT,
            uretime_verilme_tarihi TEXT,
            uretim_numarasi TEXT,
            cam_siparis_tarihi TEXT,
            cam_siparis_numarasi TEXT,
            cam_adedi TEXT,
            uretim_planlama_tarihi TEXT,
            paketleme_tarihi TEXT,
            kasetleme_tarihi TEXT,
            sevk_tarihi TEXT,
            notlar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL
        )
    ''')
    
    # Varsayılan kullanıcılar ekle
    try:
        conn.execute("INSERT INTO users (username, password, role) VALUES ('admin', 'admin123', 'admin')")
        conn.execute("INSERT INTO users (username, password, role) VALUES ('user', 'user123', 'user')")
        conn.commit()
    except:
        pass
    
    # Örnek kayıtlar ekle
    try:
        conn.execute('''
            INSERT INTO kayitlar (
                bolum, teklif_no, musteri_ismi, teklif_tarihi, onay_tarihi,
                uretime_verilme_tarihi, uretim_numarasi, cam_siparis_tarihi,
                cam_siparis_numarasi, cam_adedi, uretim_planlama_tarihi,
                paketleme_tarihi, kasetleme_tarihi, sevk_tarihi, notlar
            ) VALUES 
            ('Üretim', 'TK-2025-001', 'ABC İnşaat Ltd.', '2025-01-15', '2025-01-20', '2025-01-25', 'UR-001', '2025-01-22', 'CS-001', '50', '2025-01-28', '2025-02-05', '2025-02-08', '2025-02-10', 'İlk sipariş, öncelikli'),
            ('Satış', 'TK-2025-002', 'XYZ Yapı A.Ş.', '2025-01-18', '2025-01-22', '2025-01-27', 'UR-002', '2025-01-25', 'CS-002', '75', '2025-02-01', '2025-02-08', '2025-02-12', '2025-02-15', 'Standart teslimat'),
            ('Proje', 'TK-2025-003', 'Mega Plaza AVM', '2025-01-20', '2025-01-25', '2025-02-01', 'UR-003', '2025-01-28', 'CS-003', '100', '2025-02-05', '2025-02-12', '2025-02-15', '2025-02-18', 'Büyük proje, dikkatli paketleme'),
            ('Üretim', 'TK-2025-004', 'Güneş Enerji Ltd.', '2025-01-22', '2025-01-28', '2025-02-03', 'UR-004', '2025-01-30', 'CS-004', '60', '2025-02-08', '2025-02-15', '2025-02-18', '2025-02-20', 'Özel cam tipi'),
            ('Satış', 'TK-2025-005', 'Yıldız Mobilya', '2025-01-25', '2025-02-01', '2025-02-05', 'UR-005', '2025-02-02', 'CS-005', '40', '2025-02-10', '2025-02-18', '2025-02-20', '2025-02-22', 'Acil teslimat gerekli')
        ''')
        conn.commit()
    except:
        pass
    
    conn.close()

# Veritabanını başlat
init_db()

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
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    conn = get_db()
    user = conn.execute('SELECT * FROM users WHERE username=? AND password=?', 
                       (username, password)).fetchone()
    conn.close()
    
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
    conn = get_db()
    kayitlar = conn.execute('SELECT * FROM kayitlar ORDER BY id DESC').fetchall()
    conn.close()
    return jsonify([dict(k) for k in kayitlar])

@app.route('/api/kayitlar', methods=['POST'])
def create_kayit():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_data = verify_token(token)
    
    if not user_data or user_data['role'] != 'admin':
        return jsonify({'error': 'Yetkisiz işlem'}), 403
    
    data = request.json
    conn = get_db()
    cursor = conn.execute('''
        INSERT INTO kayitlar (
            bolum, teklif_no, musteri_ismi, teklif_tarihi, onay_tarihi,
            uretime_verilme_tarihi, uretim_numarasi, cam_siparis_tarihi,
            cam_siparis_numarasi, cam_adedi, uretim_planlama_tarihi,
            paketleme_tarihi, kasetleme_tarihi, sevk_tarihi, notlar
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        data.get('bolum'), data.get('teklif_no'), data.get('musteri_ismi'),
        data.get('teklif_tarihi'), data.get('onay_tarihi'), data.get('uretime_verilme_tarihi'),
        data.get('uretim_numarasi'), data.get('cam_siparis_tarihi'), data.get('cam_siparis_numarasi'),
        data.get('cam_adedi'), data.get('uretim_planlama_tarihi'), data.get('paketleme_tarihi'),
        data.get('kasetleme_tarihi'), data.get('sevk_tarihi'), data.get('notlar')
    ))
    conn.commit()
    kayit_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': kayit_id}), 201

@app.route('/api/kayitlar/<int:id>', methods=['PUT'])
def update_kayit(id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_data = verify_token(token)
    
    if not user_data:
        return jsonify({'error': 'Yetkisiz işlem'}), 403
    
    data = request.json
    conn = get_db()
    
    # Kullanıcı sadece not güncelleyebilir
    if user_data['role'] == 'user':
        kayit = conn.execute('SELECT notlar FROM kayitlar WHERE id=?', (id,)).fetchone()
        if kayit:
            eski_not = kayit['notlar'] or ''
            yeni_not = data.get('notlar', '')
            
            tarih = datetime.now().strftime('%Y-%m-%d %H:%M')
            not_ekleme = f"\n[{user_data['username']} - {tarih}]: {yeni_not}"
            
            guncel_not = eski_not + not_ekleme
            
            conn.execute('UPDATE kayitlar SET notlar=? WHERE id=?', (guncel_not, id))
            conn.commit()
            conn.close()
            return jsonify({'success': True})
    
    # Admin tüm alanları güncelleyebilir
    if user_data['role'] == 'admin':
        conn.execute('''
            UPDATE kayitlar SET
                bolum=?, teklif_no=?, musteri_ismi=?, teklif_tarihi=?, onay_tarihi=?,
                uretime_verilme_tarihi=?, uretim_numarasi=?, cam_siparis_tarihi=?,
                cam_siparis_numarasi=?, cam_adedi=?, uretim_planlama_tarihi=?,
                paketleme_tarihi=?, kasetleme_tarihi=?, sevk_tarihi=?, notlar=?
            WHERE id=?
        ''', (
            data.get('bolum'), data.get('teklif_no'), data.get('musteri_ismi'),
            data.get('teklif_tarihi'), data.get('onay_tarihi'), data.get('uretime_verilme_tarihi'),
            data.get('uretim_numarasi'), data.get('cam_siparis_tarihi'), data.get('cam_siparis_numarasi'),
            data.get('cam_adedi'), data.get('uretim_planlama_tarihi'), data.get('paketleme_tarihi'),
            data.get('kasetleme_tarihi'), data.get('sevk_tarihi'), data.get('notlar'), id
        ))
        conn.commit()
        conn.close()
        return jsonify({'success': True})
    
    conn.close()
    return jsonify({'error': 'Yetkisiz işlem'}), 403

@app.route('/api/kayitlar/<int:id>', methods=['DELETE'])
def delete_kayit(id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user_data = verify_token(token)
    
    if not user_data or user_data['role'] != 'admin':
        return jsonify({'error': 'Yetkisiz işlem'}), 403
    
    conn = get_db()
    conn.execute('DELETE FROM kayitlar WHERE id=?', (id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Vercel için handler
def handler(request):
    return app(request)
