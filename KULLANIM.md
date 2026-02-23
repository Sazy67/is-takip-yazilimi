# İş Takip Yazılımı - Kullanım Kılavuzu

## Başlatma

**BASLA.bat** dosyasına çift tıklayın.

Uygulama otomatik olarak:
1. Frontend'i build edecek
2. Backend'i başlatacak
3. http://localhost:5000 adresinde çalışacak

## Kullanıcı Bilgileri

- **Admin**: `admin` / `admin123` (Tüm yetkiler)
- **User**: `user` / `user123` (Sadece not ekleyebilir)

## Özellikler

### Admin Kullanıcısı
- Yeni kayıt ekleme
- Kayıt düzenleme
- Kayıt silme
- Not ekleme

### User Kullanıcısı
- Kayıtları görüntüleme
- Kayıtlara not ekleme (kullanıcı adı ve tarih ile)

## Veritabanı

Veriler `backend/kayitlar.db` dosyasında saklanır.
Bu dosya silinmediği sürece veriler kalıcıdır.

## Yedekleme

Verileri yedeklemek için `backend/kayitlar.db` dosyasını kopyalayın.

## Sorun Giderme

### Port 5000 kullanımda hatası
Başka bir uygulama 5000 portunu kullanıyorsa:
1. `backend/app.py` dosyasını açın
2. Son satırda `port=5000` yerine `port=8000` yazın
3. Uygulamayı tekrar başlatın

### Frontend build hatası
```
cd frontend
npm install
npm run build
```

## Sistem Gereksinimleri

- Python 3.8+
- Node.js 16+
- Windows Server 2012 veya üzeri

## Destek

Sorun yaşarsanız `backend/kayitlar.db` dosyasını yedekleyin ve uygulamayı yeniden başlatın.
