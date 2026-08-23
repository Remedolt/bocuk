# Zombi Bükücü

**Oyna:** [https://remedolt.github.io/zombi/](https://remedolt.github.io/zombi/)

Tarayıcıda çalışan, **Three.js** ve **Vite** ile yazılmış birinci şahıs zombi hayatta kalma oyunu. Harici 3D modellere ihtiyaç duymaz; sokak, silah ve zombiler prosedürel geometriyle üretilir. İstersen `public/models/` altına `.glb` bırakarak modelleri değiştirebilirsin.

![stack](https://img.shields.io/badge/Three.js-0.180-black) ![vite](https://img.shields.io/badge/Vite-6-646cff) ![license](https://img.shields.io/badge/license-MIT-green)

## Özellikler

- Pointer lock FPS kontrolleri: WASD, koşma, zıplama, nişan (sağ tık)
- Raycast vuruş sistemi ve **2.5× kafa vuruşu**
- Namlu alevi, mermi izi, geri tepme, **R** ile şarjör değiştirme
- Yürüyen / Koşucu / Canavar zombiler, takip ve saldırı
- Dalga sistemi, artan can/hız, ilk yardım çantası
- Gündüz şehir sokağı, güneş ışığı, sisli ufuk
- HUD: can, mermi, puan, dalga, mini harita, hedef kilit, isabet işareti
- Web Audio ile üretilmiş ses efektleri (dosya gerekmez)
- Ölünce skor ekranı ve Enter ile yeniden başlama

## Gereksinimler

- Node.js 18+
- Modern bir tarayıcı (Chrome, Edge, Firefox)

## Kurulum

```bash
git clone https://github.com/Remedolt/zombi.git
cd zombi
npm install
npm run dev
```

| `npm run dev` | **OYNA** — tarayıcı fare kilidi isteyecektir. |

### Üretim derlemesi

```bash
npm run build
npm run preview
```

`dist/` klasörü GitHub Pages veya herhangi bir statik host'a yüklenebilir. `vite.config.js` içinde `base: './'` ayarı göreli yollar içindir.

## Kontroller

| Tuş | Aksiyon |
| --- | --- |
| `W A S D` | Hareket |
| Fare | Bakış / nişan |
| Sol tık | Ateş |
| Sağ tık | Nişangah |
| `Shift` | Koşma |
| `Boşluk` | Zıplama |
| `R` | Şarjör değiştir |
| `H` | İlk yardım kullan (+48 can) |
| `E` | Yakındaki ilk yardımı al |
| `ESC` | Fareyi serbest bırak |
| `Enter` | Ölünce yeniden başlat |

## Mimari

```
zombie-survival/
├── index.html          # Canvas + HUD + menü
├── style.css           # HUD stilleri
├── package.json
├── vite.config.js
├── public/models/      # Opsiyonel glTF
└── src/
    ├── main.js         # Sahne, döngü, oyun durumları
    ├── constants.js    # Denge değerleri
    ├── Player.js       # PointerLock, hareket, can
    ├── Weapon.js       # Ateş, geri tepme, şarjör, namlu
    ├── Zombie.js       # Yapay zeka, isabet, ölüm
    ├── WaveManager.js  # Spawn ve dalga akışı
    ├── World.js        # Şehir, ışık, çarpışma
    ├── UI.js           # HUD + mini harita
    ├── Sound.js        # Ses efektleri
    └── Assets.js       # Opsiyonel GLB yükleme
```

## Oynanış notları

- 1. dalga yürüyenlerle başlar. 3. dalgadan itibaren koşucu, 6. dalgadan itibaren canavar karışır.
- Her dalgada zombi canı ve hasarı artar. Ekranda en fazla 18 canlı zombi tutulur.
- Kafa vuruşu `KAFA VURUŞU!` metni, isabet işareti ve kan sıçraması üretir.
- Can bitince ulaşılan dalga, puan ve leş sayısı gösterilir.

## Özel modeller

`public/models/zombie.glb` ve `public/models/weapon.glb` dosyaları varsa otomatik yüklenir. Yoksa placeholder modeller kullanılır. Ayrıntı: `public/models/README.md`.

## GitHub Pages

Canlı site: [https://remedolt.github.io/zombi/](https://remedolt.github.io/zombi/)

`main` dalına her push, GitHub Actions ile `dist/` derleyip Pages'e yayınlar. `node_modules/` ve `dist/` `.gitignore` içindedir.

## Lisans

MIT
