# Render.com Deployment Talimatları

## 1. Render.com'a Kaydol
https://render.com adresine git ve GitHub ile giriş yap.

## 2. New Web Service Oluştur
- Dashboard'da "New +" butonuna tıkla
- "Web Service" seç
- GitHub repository'ni seç: `is-takip-yazilimi`

## 3. Ayarları Yap

**Name**: `rigelistakip` (veya istediğin isim)

**Region**: `Frankfurt (EU Central)`

**Branch**: `main`

**Root Directory**: `backend`

**Runtime**: `Python 3`

**Build Command**:
```
pip install -r requirements.txt
```

**Start Command**:
```
gunicorn app:app
```

## 4. Environment Variables Ekle
"Advanced" butonuna tıkla ve şunları ekle:

- `SECRET_KEY`: `your-secret-key-here` (rastgele bir string)
- `DATABASE_PATH`: `/opt/render/project/data/kayitlar.db`

## 5. Persistent Disk Ekle (ÖNEMLİ!)
- "Add Disk" butonuna tıkla
- **Name**: `data`
- **Mount Path**: `/opt/render/project/data`
- **Size**: `1 GB` (ücretsiz)

## 6. Deploy Et
"Create Web Service" butonuna tıkla.

## 7. Frontend'i Güncelle
Deployment tamamlandıktan sonra, frontend'deki API URL'ini güncelle.

Render URL'in: `https://rigelistakip.onrender.com`

## Notlar
- İlk deployment 5-10 dakika sürebilir
- Ücretsiz plan: 750 saat/ay
- Uygulama 15 dakika kullanılmazsa uyur, ilk istekte uyanır (30 saniye sürer)
