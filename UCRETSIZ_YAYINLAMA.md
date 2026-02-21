# Ücretsiz Yayınlama Seçenekleri

## Seçenek 1: Render.com (ÖNERİLEN - Tamamen Ücretsiz)

### Avantajlar
- ✅ Tamamen ücretsiz
- ✅ Hem frontend hem backend tek yerde
- ✅ Otomatik HTTPS
- ✅ Kolay kurulum

### Adımlar

#### 1. GitHub'a Yükleyin
```bash
git init
git add .
git commit -m "İlk commit"
git remote add origin https://github.com/[KULLANICI-ADINIZ]/is-takip-yazilimi.git
git push -u origin main
```

#### 2. Render.com Hesabı
1. https://render.com adresine gidin
2. "Get Started for Free" butonuna tıklayın
3. GitHub ile giriş yapın

#### 3. Backend Deploy (Web Service)
1. Dashboard'da "New +" > "Web Service"
2. GitHub repository'nizi seçin
3. Ayarlar:
   - **Name**: `is-takip-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
   - **Plan**: `Free`
4. Environment Variables ekleyin:
   - `PYTHON_VERSION` = `3.11.0`
5. "Create Web Service" butonuna tıklayın

Backend URL'iniz: `https://is-takip-backend.onrender.com`

#### 4. Frontend Ayarları

`frontend/src/App.jsx` ve `frontend/src/Login.jsx` dosyalarını güncelleyin:

**App.jsx:**
```javascript
import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './Login'
import logo from '../rigel-logo.png'
import './App.css'

axios.defaults.baseURL = 'https://is-takip-backend.onrender.com'
axios.defaults.withCredentials = true
```

**Login.jsx:**
```javascript
import { useState } from 'react'
import axios from 'axios'
import logo from '../rigel-logo.png'
import './Login.css'

axios.defaults.baseURL = 'https://is-takip-backend.onrender.com'
axios.defaults.withCredentials = true
```

#### 5. Backend CORS Güncellemesi

`backend/app.py` dosyasında:
```python
CORS(app, 
     supports_credentials=True,
     origins=['https://is-takip-frontend.onrender.com', 'http://localhost:5173'])
```

#### 6. Değişiklikleri Push
```bash
git add .
git commit -m "Render ayarları"
git push
```

#### 7. Frontend Deploy (Static Site)
1. Dashboard'da "New +" > "Static Site"
2. GitHub repository'nizi seçin
3. Ayarlar:
   - **Name**: `is-takip-frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. "Create Static Site" butonuna tıklayın

Frontend URL'iniz: `https://is-takip-frontend.onrender.com`

### ✅ Tamamlandı!
Uygulamanız şu adreste: `https://is-takip-frontend.onrender.com`

---

## Seçenek 2: PythonAnywhere + Netlify

### Backend: PythonAnywhere (Ücretsiz)

#### 1. PythonAnywhere Hesabı
1. https://www.pythonanywhere.com adresine gidin
2. "Start running Python online in less than a minute!" > "Create a Beginner account"

#### 2. Dosyaları Yükleyin
1. Dashboard > "Files" sekmesi
2. "Upload a file" ile backend dosyalarını yükleyin
3. Veya Git ile:
```bash
git clone https://github.com/[KULLANICI-ADINIZ]/is-takip-yazilimi.git
```

#### 3. Web App Oluşturun
1. "Web" sekmesi > "Add a new web app"
2. "Manual configuration" > "Python 3.10"
3. WSGI configuration file'ı düzenleyin:

```python
import sys
path = '/home/[KULLANICI-ADINIZ]/is-takip-yazilimi/backend'
if path not in sys.path:
    sys.path.append(path)

from app import app as application
```

4. "Reload" butonuna tıklayın

Backend URL: `https://[KULLANICI-ADINIZ].pythonanywhere.com`

### Frontend: Netlify (Ücretsiz)

#### 1. Netlify Hesabı
1. https://netlify.com adresine gidin
2. "Sign up" > GitHub ile giriş

#### 2. Frontend Ayarları
`frontend/src/App.jsx` ve `Login.jsx` dosyalarını güncelleyin:
```javascript
axios.defaults.baseURL = 'https://[KULLANICI-ADINIZ].pythonanywhere.com'
```

#### 3. Deploy
1. "Add new site" > "Import an existing project"
2. GitHub repository'nizi seçin
3. Ayarlar:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`
4. "Deploy site" butonuna tıklayın

Frontend URL: `https://[SITE-ADI].netlify.app`

---

## Seçenek 3: Vercel + Railway

### Backend: Railway (Ücretsiz $5 kredi/ay)

1. https://railway.app > "Start a New Project"
2. GitHub repository'nizi seçin
3. Root Directory: `backend`
4. Deploy

### Frontend: Vercel (Ücretsiz)

1. https://vercel.com > "Add New Project"
2. GitHub repository'nizi seçin
3. Root Directory: `frontend`
4. Framework: Vite
5. Deploy

---

## Önemli Notlar

### Ücretsiz Plan Sınırlamaları

**Render.com:**
- Web service 15 dakika hareketsizlikten sonra uyur
- İlk istek 30-60 saniye sürebilir
- 750 saat/ay ücretsiz

**PythonAnywhere:**
- Günde 100.000 istek
- 512 MB disk alanı
- Sadece HTTP (HTTPS yok)

**Netlify:**
- 100 GB bandwidth/ay
- 300 build dakikası/ay

**Railway:**
- $5 kredi/ay (yaklaşık 500 saat)
- Kredi bitince durdurulur

### Veritabanı Uyarısı
SQLite ücretsiz planlarda her deploy'da sıfırlanabilir. Kalıcı veri için:
- Render.com: PostgreSQL ekleyin (ücretsiz)
- Railway: PostgreSQL ekleyin (ücretsiz)

### Performans İpuçları
1. Render.com'da "Always On" özelliği yok (ücretli planda var)
2. İlk yüklenme yavaş olabilir (cold start)
3. Düzenli kullanımda hızlı çalışır

---

## Hızlı Başlangıç (Render.com)

```bash
# 1. GitHub'a yükle
git init
git add .
git commit -m "İlk commit"
git remote add origin [GITHUB-URL]
git push -u origin main

# 2. Render.com'da backend deploy et
# 3. Backend URL'ini frontend'e ekle
# 4. Git push
# 5. Render.com'da frontend deploy et
```

**Toplam Süre:** 10-15 dakika

---

## Destek

Sorularınız için: support@kamsis-software.com
