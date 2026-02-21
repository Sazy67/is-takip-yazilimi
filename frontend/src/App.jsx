import { useState, useEffect } from 'react'
import axios from 'axios'
import Login from './Login'
import logo from '../rigel-logo.png'
import './App.css'

axios.defaults.withCredentials = true

function App() {
  const [user, setUser] = useState(null)
  const [kayitlar, setKayitlar] = useState([])
  const [filteredKayitlar, setFilteredKayitlar] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notInput, setNotInput] = useState('')
  const [formData, setFormData] = useState({
    bolum: '',
    teklif_no: '',
    musteri_ismi: '',
    teklif_tarihi: '',
    onay_tarihi: '',
    uretime_verilme_tarihi: '',
    uretim_numarasi: '',
    cam_siparis_tarihi: '',
    cam_siparis_numarasi: '',
    cam_adedi: '',
    uretim_planlama_tarihi: '',
    paketleme_tarihi: '',
    kasetleme_tarihi: '',
    sevk_tarihi: '',
    notlar: ''
  })

  // Token'ı her istekte gönder
  useEffect(() => {
    const interceptor = axios.interceptors.request.use((config) => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    return () => {
      axios.interceptors.request.eject(interceptor)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await axios.get('/api/me')
      setUser(response.data)
      fetchKayitlar()
    } catch (error) {
      localStorage.removeItem('token')
      setLoading(false)
    }
  }

  const handleLogin = (userData) => {
    setUser(userData)
    fetchKayitlar()
  }

  const handleLogout = async () => {
    await axios.post('/api/logout')
    localStorage.removeItem('token')
    setUser(null)
    setKayitlar([])
  }

  const fetchKayitlar = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/kayitlar')
      setKayitlar(response.data)
      setFilteredKayitlar(response.data)
    } catch (error) {
      console.error('Kayıtlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await axios.put(`/api/kayitlar/${editingId}`, formData)
      } else {
        await axios.post('/api/kayitlar', formData)
      }
      resetForm()
      fetchKayitlar()
    } catch (error) {
      console.error('Kayıt kaydedilirken hata:', error)
    }
  }

  const handleEdit = (kayit) => {
    if (user.role === 'user') {
      // Kullanıcı sadece not ekleyebilir
      setEditingId(kayit.id)
      setNotInput('')
      setShowForm(true)
    } else {
      // Admin tüm alanları düzenleyebilir
      setFormData(kayit)
      setEditingId(kayit.id)
      setShowForm(true)
    }
  }

  const handleNotSubmit = async (e) => {
    e.preventDefault()
    if (!notInput.trim()) return

    try {
      await axios.put(`/api/kayitlar/${editingId}`, { notlar: notInput })
      setNotInput('')
      resetForm()
      fetchKayitlar()
    } catch (error) {
      console.error('Not eklenirken hata:', error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Silmek istediğinizden emin misiniz?')) {
      try {
        await axios.delete(`/api/kayitlar/${id}`)
        fetchKayitlar()
      } catch (error) {
        console.error('Kayıt silinirken hata:', error)
      }
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const resetForm = () => {
    setFormData({
      bolum: '', teklif_no: '', musteri_ismi: '', teklif_tarihi: '', onay_tarihi: '',
      uretime_verilme_tarihi: '', uretim_numarasi: '', cam_siparis_tarihi: '',
      cam_siparis_numarasi: '', cam_adedi: '', uretim_planlama_tarihi: '',
      paketleme_tarihi: '', kasetleme_tarihi: '', sevk_tarihi: '', notlar: ''
    })
    setShowForm(false)
    setEditingId(null)
  }

  const handleSearch = (e) => {
    const search = e.target.value.toLowerCase()
    const filtered = kayitlar.filter(kayit => 
      Object.values(kayit).some(val => 
        String(val).toLowerCase().includes(search)
      )
    )
    setFilteredKayitlar(filtered)
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="container">
      <div className="app-header">
        <div className="header-section">
          <div className="header-left">
            <img src={logo} alt="Rigel Logo" className="app-logo" />
            <h1>İş Takip Yazılımı</h1>
          </div>
          <div className="user-info">
            <div className="user-badge">
              {user.role === 'admin' ? 'Admin' : 'User'}
            </div>
            {user.role === 'admin' && (
              <button onClick={() => { setShowForm(true); setEditingId(null); }} className="btn btn-primary">
                + Yeni Kayıt
              </button>
            )}
            <button onClick={handleLogout} className="btn btn-secondary">
              Çıkış
            </button>
          </div>
        </div>
      </div>

      <div className="content-area">
          {showForm && user.role === 'user' && editingId && (
          <div className="form-section">
            <h2>Not Ekle</h2>
            <form onSubmit={handleNotSubmit}>
              <div className="form-group full-width">
                <label>Yeni Not</label>
                <textarea 
                  value={notInput} 
                  onChange={(e) => setNotInput(e.target.value)}
                  placeholder="Notunuzu yazın..."
                  required
                ></textarea>
              </div>
              <div>
                <button type="submit" className="btn btn-success">Not Ekle</button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        )}

          {showForm && user.role === 'admin' && (
          <div className="form-section">
            <h2>{editingId ? 'Kayıt Düzenle' : 'Yeni Kayıt'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Bölüm</label>
                  <input name="bolum" value={formData.bolum} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Teklif Numarası</label>
                  <input name="teklif_no" value={formData.teklif_no} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Müşteri İsmi</label>
                  <input name="musteri_ismi" value={formData.musteri_ismi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Teklif Tarihi</label>
                  <input type="date" name="teklif_tarihi" value={formData.teklif_tarihi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Onay Tarihi</label>
                  <input type="date" name="onay_tarihi" value={formData.onay_tarihi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Üretime Verilme Tarihi</label>
                  <input type="date" name="uretime_verilme_tarihi" value={formData.uretime_verilme_tarihi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Üretim Numarası</label>
                  <input name="uretim_numarasi" value={formData.uretim_numarasi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Cam Sipariş Tarihi</label>
                  <input type="date" name="cam_siparis_tarihi" value={formData.cam_siparis_tarihi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Cam Sipariş Numarası</label>
                  <input name="cam_siparis_numarasi" value={formData.cam_siparis_numarasi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Cam Adedi</label>
                  <input name="cam_adedi" value={formData.cam_adedi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Üretim Planlama Tarihi</label>
                  <input type="date" name="uretim_planlama_tarihi" value={formData.uretim_planlama_tarihi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Paketleme Tarihi</label>
                  <input type="date" name="paketleme_tarihi" value={formData.paketleme_tarihi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Kasetleme Tarihi</label>
                  <input type="date" name="kasetleme_tarihi" value={formData.kasetleme_tarihi} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Sevk Tarihi</label>
                  <input type="date" name="sevk_tarihi" value={formData.sevk_tarihi} onChange={handleChange} />
                </div>
                <div className="form-group full-width">
                  <label>Notlar</label>
                  <textarea name="notlar" value={formData.notlar} onChange={handleChange}></textarea>
                </div>
              </div>
              <div>
                <button type="submit" className="btn btn-success">Kaydet</button>
                <button type="button" onClick={resetForm} className="btn btn-secondary">İptal</button>
              </div>
            </form>
          </div>
        )}

        <input 
          type="text" 
          className="search-box" 
          placeholder="Ara..." 
          onChange={handleSearch}
        />

          <div className="table-container">
          {loading ? (
            <div className="loading">Yükleniyor...</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Bölüm</th>
                  <th>Teklif No</th>
                  <th>Müşteri</th>
                  <th>Teklif Tarihi</th>
                  <th>Onay Tarihi</th>
                  <th>Üretime Verilme</th>
                  <th>Üretim No</th>
                  <th>Cam Sipariş</th>
                  <th>Cam Sipariş No</th>
                  <th>Cam Adedi</th>
                  <th>Üretim Planlama</th>
                  <th>Paketleme</th>
                  <th>Kasetleme</th>
                  <th>Sevk</th>
                  <th>Notlar</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredKayitlar.length === 0 ? (
                  <tr>
                    <td colSpan="16" className="empty-state">
                      Henüz kayıt yok. "Yeni Kayıt Ekle" butonuna tıklayarak başlayın.
                    </td>
                  </tr>
                ) : (
                  filteredKayitlar.map(kayit => (
                    <tr key={kayit.id}>
                      <td>{kayit.bolum}</td>
                      <td>{kayit.teklif_no}</td>
                      <td>{kayit.musteri_ismi}</td>
                      <td>{kayit.teklif_tarihi}</td>
                      <td>{kayit.onay_tarihi}</td>
                      <td>{kayit.uretime_verilme_tarihi}</td>
                      <td>{kayit.uretim_numarasi}</td>
                      <td>{kayit.cam_siparis_tarihi}</td>
                      <td>{kayit.cam_siparis_numarasi}</td>
                      <td>{kayit.cam_adedi}</td>
                      <td>{kayit.uretim_planlama_tarihi}</td>
                      <td>{kayit.paketleme_tarihi}</td>
                      <td>{kayit.kasetleme_tarihi}</td>
                      <td>{kayit.sevk_tarihi}</td>
                      <td className="notlar-cell">{kayit.notlar}</td>
                      <td className="actions">
                        <button onClick={() => handleEdit(kayit)} className="btn btn-success">
                          {user.role === 'admin' ? 'Düzenle' : 'Not Ekle'}
                        </button>
                        {user.role === 'admin' && (
                          <button onClick={() => handleDelete(kayit.id)} className="btn btn-danger">
                            Sil
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <footer className="app-footer">
        © 2025 Kamsis@Software. Tüm hakları saklıdır.
      </footer>
    </div>
  )
}

export default App
