# Local'de Çalıştırma Talimatları

## 1. Backend'i Başlat

Terminal 1'de:
```cmd
cd backend
pip install -r requirements.txt
python app.py
```

Backend http://localhost:5000 adresinde çalışacak.

## 2. Frontend'i Başlat

Terminal 2'de:
```cmd
cd frontend
npm install
npm run dev
```

Frontend http://localhost:3000 adresinde çalışacak.

## 3. Tarayıcıda Aç

http://localhost:3000 adresine git.

## Kullanıcı Bilgileri

- **Admin**: admin / admin123 (Tüm işlemler)
- **User**: user / user123 (Sadece not ekleme)

## Veritabanı

Veriler `backend/kayitlar.db` dosyasında SQLite olarak saklanır. Bu dosya kalıcıdır, veriler kaybolmaz.

## Not

Local'de çalışırken Vercel deployment'ından bağımsızsınız. İki ortam farklı veritabanları kullanır:
- Local: SQLite (backend/kayitlar.db)
- Vercel: Neon Postgres
