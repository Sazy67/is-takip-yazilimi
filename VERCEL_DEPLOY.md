# Vercel'de Tek Seferde Yayınlama

## Neden Tek Vercel?

Evet, frontend + backend ayrı olduğu için normalde 2 yere deploy edilir. Ama Vercel Serverless Functions ile her ikisini birlikte yayınlayabiliriz!

## Hazırlık Tamamlandı ✅

Gerekli dosyalar oluşturuldu:
- `api/index.py` - Backend (Serverless Function)
- `vercel.json` - Vercel yapılandırması
- `requirements.txt` - Python bağımlılıkları

## Adım 1: GitHub'a Yükleyin

```bash
git init
git add .
git commit -m "Vercel deploy hazır"
git branch -M main
git remote add origin https://github.com/[KULLANICI-ADINIZ]/is-takip-yazilimi.git
git push -u origin main
```

## Adım 2: Vercel'de Deploy

### 2.1 Vercel Hesabı
1. https://vercel.com adresine gidin
2. "Sign Up" ile GitHub hesabınızla giriş yapın

### 2.2 Proje Oluşturma
1. Dashboard'da "Add New..." > "Project"
2. GitHub repository'nizi seçin ("is-takip-yazilimi")
3. "Import" butonuna tıklayın

### 2.3 Ayarlar
Vercel otomatik algılayacak, ama kontrol edin:
- **Framework Preset**: Vite
- **Root Directory**: `./` (boş bırakın)
- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/dist`

### 2.4 Environment Variables
"Environment Variables" bölümüne ekleyin:
- **Key**: `SECRET_KEY`
- **Value**: `[rastgele-güvenli-anahtar-buraya]` (örn: `my-super-secret-key-12345`)

### 2.5 Deploy
"Deploy" butonuna tıklayın!

## Adım 3: Test

Deploy tamamlandıktan sonra (2-3 dakika):
1. Vercel size bir URL verecek: `https://[PROJE-ADI].vercel.app`
2. Bu URL'i açın
3. Login ekranında:
   - Admin: `admin` / `admin123`
   - User: `user` / `user123`

## ✅ Tamamlandı!

Tek bir Vercel projesi ile hem frontend hem backend yayında!

---

## Nasıl Çalışıyor?

### Frontend
- `frontend/` klasörü static site olarak build edilir
- Vite ile optimize edilir
- CDN üzerinden hızlı servis edilir

### Backend
- `api/index.py` Serverless Function olarak çalışır
- Her API isteği için otomatik ölçeklenir
- `/api/*` route'ları backend'e yönlendirilir

### Veritabanı
- SQLite `/tmp` klasöründe çalışır
- **UYARI**: Serverless fonksiyonlar her çalıştığında sıfırlanabilir
- Kalıcı veri için Vercel Postgres kullanın (ücretsiz plan var)

---

## Güncelleme

Kod değişikliklerini yayınlamak için:
```bash
git add .
git commit -m "Güncelleme mesajı"
git push
```

Vercel otomatik olarak yeniden deploy edecek!

---

## Önemli Notlar

### Ücretsiz Plan Limitleri
- 100 GB bandwidth/ay
- 100 GB-saat serverless function execution/ay
- Unlimited projeler

### Veritabanı Sorunu
SQLite geçici olduğu için veriler kaybolabilir. Çözüm:

**Vercel Postgres (Ücretsiz):**
1. Vercel Dashboard > Storage > Create Database
2. Postgres seçin
3. Environment variables otomatik eklenir
4. `api/index.py` dosyasını PostgreSQL kullanacak şekilde güncelleyin

### Custom Domain
Ücretsiz planda custom domain ekleyebilirsiniz:
1. Project Settings > Domains
2. Domain adınızı ekleyin
3. DNS ayarlarını yapın

---

## Sorun Giderme

### Build Hatası
```bash
# Yerel olarak test edin
cd frontend
npm install
npm run build
```

### API Çalışmıyor
- Vercel Dashboard > Functions sekmesinden logları kontrol edin
- `/api/kayitlar` endpoint'ini test edin

### CORS Hatası
`api/index.py` dosyasında CORS ayarları zaten yapılandırılmış.

---

## Avantajlar

✅ Tek yerden yönetim
✅ Otomatik HTTPS
✅ Global CDN
✅ Otomatik ölçeklendirme
✅ Ücretsiz
✅ Kolay güncelleme (git push)

---

## Destek

Sorularınız için: support@kamsis-software.com
