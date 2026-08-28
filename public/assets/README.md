# Opsiyonel sprite'lar

Oyun bu klasördeki PNG'ler olmadan da tam çalışır; fallback olarak renkli primitifler çizilir.

Dosyayı buraya bırakman yeterli — kod tarafı `ctx.drawImage` ile bağlanır. Sprite'lar **yukarı bakan** (top-down) kabul edilir.

| Dosya | Yerine geçer |
| --- | --- |
| `player.png` | Oyuncu |
| `enemy.png` | Larva (dalga 1) |
| `enemy-runner.png` | Sıçrayan |
| `enemy-beetle.png` | Böcek |
| `enemy-wasp.png` | Eşekarısı |
| `enemy-tank.png` | Canavar |
| `enemy-spitter.png` | Tüküren |
| `weapon.png` | Yörünge silahları |
| `projectile.png` | Mermiler |
| `xp.png` | Materyal küresi |
| `floor.png` | Arena zemini (tileable) |

Önerilen: 64×64 veya 128×128, şeffaf arka plan. Kenney.nl / itch.io top-down 3D render paketleri veya Mixamo + Blender orthographic render uyumludur.
