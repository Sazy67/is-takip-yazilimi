# Kalıcı Veri Depolama Sorunu

Vercel'de `/tmp` klasörü her serverless function çağrısında sıfırlanıyor. Bu yüzden veriler kayboluyordu.

## Çözüm Seçenekleri:

1. **Vercel Postgres** (Önerilen - Ücretsiz)
   - 60 saat compute time/ay
   - 256 MB storage
   - Profesyonel çözüm

2. **Vercel Blob** (Dosya depolama)
   - 1 GB storage ücretsiz
   - JSON dosyası olarak saklanabilir

3. **Harici Veritabanı**
   - MongoDB Atlas (ücretsiz 512MB)
   - PlanetScale (ücretsiz MySQL)
   - Supabase (ücretsiz PostgreSQL)

## Şu Anki Durum:
JSON dosya tabanlı sistem kullanılıyor ama `/tmp` klasöründe olduğu için veriler kaybolacak.

## Yapılması Gereken:
Vercel dashboard'dan Postgres veya Blob storage eklemek gerekiyor.
