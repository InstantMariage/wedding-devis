#!/usr/bin/env python3
"""
Génère les icônes PWA pour Wedding Devis Pro.
Fond rose #F06292, initiales DM en blanc, style luxe.
Aucune dépendance externe — utilise uniquement zlib + struct.
"""
import zlib, struct, math

# ── Encodeur PNG minimal ─────────────────────────────────────────────────────

def _chunk(t, d):
    c = t + d
    return struct.pack('>I', len(d)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

def save_png(path, buf, w, h):
    """buf = bytearray de taille w*h*3, ordre RGB scanline par scanline."""
    rows = bytearray()
    for y in range(h):
        rows += b'\x00'
        rows += buf[y * w * 3:(y + 1) * w * 3]
    with open(path, 'wb') as f:
        f.write(b'\x89PNG\r\n\x1a\n')
        f.write(_chunk(b'IHDR', struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)))
        f.write(_chunk(b'IDAT', zlib.compress(bytes(rows), 6)))
        f.write(_chunk(b'IEND', b''))

# ── Primitives de dessin ─────────────────────────────────────────────────────

def set_px(buf, w, x, y, r, g, b, alpha=1.0):
    if x < 0 or y < 0 or x >= w or y >= w:
        return
    idx = (y * w + x) * 3
    if alpha >= 1.0:
        buf[idx], buf[idx+1], buf[idx+2] = r, g, b
    else:
        buf[idx]   = int(buf[idx]   * (1 - alpha) + r * alpha)
        buf[idx+1] = int(buf[idx+1] * (1 - alpha) + g * alpha)
        buf[idx+2] = int(buf[idx+2] * (1 - alpha) + b * alpha)

def draw_segment(buf, w, x0, y0, x1, y1, sw, r, g, b):
    """Segment antialiasé d'épaisseur sw."""
    dx, dy = x1 - x0, y1 - y0
    length = math.sqrt(dx*dx + dy*dy)
    if length < 0.01:
        return
    # bounding box
    pad = sw + 1
    bx0 = max(0, int(min(x0, x1) - pad))
    bx1 = min(w - 1, int(max(x0, x1) + pad))
    by0 = max(0, int(min(y0, y1) - pad))
    by1 = min(w - 1, int(max(y0, y1) + pad))
    for py in range(by0, by1 + 1):
        for px in range(bx0, bx1 + 1):
            qx, qy = px - x0, py - y0
            t = max(0.0, min(1.0, (qx*dx + qy*dy) / (dx*dx + dy*dy)))
            ex = x0 + t*dx - px
            ey = y0 + t*dy - py
            dist = math.sqrt(ex*ex + ey*ey)
            cov = max(0.0, min(1.0, sw/2 - dist + 0.8))
            if cov > 0:
                set_px(buf, w, px, py, r, g, b, cov)

def draw_arc(buf, w, cx, cy, rx, ry, a1, a2, sw, r, g, b, steps=200):
    """Arc elliptique antialiasé."""
    prev = None
    for i in range(steps + 1):
        t = a1 + (a2 - a1) * i / steps
        x = cx + rx * math.cos(t)
        y = cy + ry * math.sin(t)
        if prev:
            draw_segment(buf, w, prev[0], prev[1], x, y, sw, r, g, b)
        prev = (x, y)

# ── Construction de l'icône ──────────────────────────────────────────────────

def make_icon(size):
    buf = bytearray(size * size * 3)

    # Couleurs
    P1 = (240, 98, 146)   # #F06292
    P2 = (212, 72, 120)   # #D44878 – dégradé bas
    W  = (255, 255, 255)

    corner_r = size * 0.175

    # ── Fond dégradé avec coins arrondis ────────────────────────────────────
    for y in range(size):
        fy = y / (size - 1)
        rr = int(P1[0] + (P2[0] - P1[0]) * fy)
        gg = int(P1[1] + (P2[1] - P1[1]) * fy)
        bb = int(P1[2] + (P2[2] - P1[2]) * fy)

        # Éclat lumineux haut-gauche
        glow_y = size * 0.25
        gy_dist = abs(y - glow_y)

        for x in range(size):
            # Masque coins arrondis (distance au coin le plus proche)
            dx = min(x, size - 1 - x)
            dy = min(y, size - 1 - y)
            in_shape = True
            if dx < corner_r and dy < corner_r:
                dist = math.sqrt((corner_r - dx)**2 + (corner_r - dy)**2)
                in_shape = dist <= corner_r

            if not in_shape:
                # Fond blanc (sera transparent dans le contexte PWA)
                set_px(buf, size, x, y, 255, 255, 255)
                continue

            # Éclat
            glow_x = size * 0.3
            gd = math.sqrt((x - glow_x)**2 + (y - glow_y)**2)
            gs = max(0.0, 1.0 - gd / (size * 0.5)) * 0.20
            pr = min(255, int(rr + (255 - rr) * gs))
            pg = min(255, int(gg + (255 - gg) * gs))
            pb = min(255, int(bb + (255 - bb) * gs))
            set_px(buf, size, x, y, pr, pg, pb)

    # ── Paramètres typographiques ────────────────────────────────────────────
    sw = max(2.0, size * 0.038)      # épaisseur du trait
    lh = size * 0.44                  # hauteur des lettres
    top = size / 2 - lh / 2
    bot = size / 2 + lh / 2
    lw = size * 0.18                  # largeur d'une lettre

    # D centré à gauche, M centré à droite
    D_cx = size * 0.345
    M_cx = size * 0.655

    # ── Lettre D ────────────────────────────────────────────────────────────
    D_x0 = D_cx - lw / 2
    D_x1 = D_cx + lw / 2

    # Barre verticale gauche
    draw_segment(buf, size, D_x0, top, D_x0, bot, sw, *W)
    # Barre haute (jointure)
    draw_segment(buf, size, D_x0, top, D_x0 + lw * 0.45, top, sw, *W)
    # Barre basse (jointure)
    draw_segment(buf, size, D_x0, bot, D_x0 + lw * 0.45, bot, sw, *W)
    # Demi-cercle (côté droit du D)
    arc_cx = D_x0 + lw * 0.08
    arc_cy = size / 2
    arc_rx = lw * 0.85
    arc_ry = lh / 2
    draw_arc(buf, size, arc_cx, arc_cy, arc_rx, arc_ry,
             -math.pi/2, math.pi/2, sw, *W, steps=250)

    # ── Lettre M ────────────────────────────────────────────────────────────
    M_x0 = M_cx - lw / 2
    M_x1 = M_cx + lw / 2
    mid_y = top + lh * 0.44          # pointe du V central (pas jusqu'en bas)

    # Barre verticale gauche
    draw_segment(buf, size, M_x0, top, M_x0, bot, sw, *W)
    # Barre verticale droite
    draw_segment(buf, size, M_x1, top, M_x1, bot, sw, *W)
    # Diagonale gauche (haut-gauche → creux central)
    draw_segment(buf, size, M_x0, top, M_cx, mid_y, sw, *W)
    # Diagonale droite (creux central → haut-droit)
    draw_segment(buf, size, M_cx, mid_y, M_x1, top, sw, *W)

    return buf

# ── Export ───────────────────────────────────────────────────────────────────

for size, name in [(512, 'icon-512x512.png'), (192, 'icon-192x192.png')]:
    print(f'Génération {size}×{size}…', end=' ', flush=True)
    pix = make_icon(size)
    save_png(f'/Users/casanerojewelry/wedding-devis/public/icons/{name}', pix, size, size)
    print(f'✓  →  public/icons/{name}')

print('\nDone.')
