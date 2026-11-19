"""把 backup/images 內選用的圖片縮小後存入 assets/img（只需在更換圖片時執行一次）。
用法：python tools/prepare-images.py
"""
import os
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "..", "backup", "images")
OUT = os.path.join(HERE, "..", "assets", "img")
os.makedirs(OUT, exist_ok=True)

# 新檔名 -> 備份內的原檔名
PHOTOS = {
    "building-dedication.jpg": "1666839021558--14a---Building-Dedication-original.jpg",
    "building-dedication-warm.jpg": "1666838992410--14a---Building-Dedication.jpg",
    # 以下兩張是裁剪圖：只保留建築及禮堂，裁走人群（原因見 docs/圖片來源.md）
    "church-building.jpg": "1666838960784--13---15th-Anniversary.JPG",
    "church-interior.jpg": "1666839032114--14b---20th-Anniversary-Combined-Service.jpg",
    "anniversary-20.jpg": "1666839032114--14b---20th-Anniversary-Combined-Service.jpg",
    "english-service.jpg": "1666838988015--12---English-Service.JPG",
    "mandarin-service.jpg": "1666838079025--9---Mandarin-Service.JPG",
    "gwenand-place.jpg": "1666837060189--4---10-Gwenand-Place.jpg",
    "dana-place.jpg": "1666837097145--5---10-Dana-Place.jpg",
    "stm-1998.jpg": "1666837848688-18671412_1464405080246300_1607153443957729516_o.jpg",
    "stm-3.jpg": "1666837856775-Picture1.jpg",
    "stm-4.jpg": "1666837862103-Picture3.jpg",
    "vanuatu-1.jpg": "1666838350988-Vanuatu-STM-2.jpg",
    "vanuatu-2.jpg": "1666838378578-Vanuatu-STM.jpg",
    "commissioning-2001.jpg": "1666838058649--8a---Commissioning-Joseph-and-Sharon.jpg",
    "commissioning-2005.jpg": "1666838069918--8b---Commissioning-Gary-and-Serah.JPG",
    "commissioning-2014.jpg": "1666838078552--8c---Commissioning-James-Che.JPG",
    "anniversary-10.jpg": "1666838592729--10---10th-Anniversary-Combined-Service.jpg",
    "building-2005-1.jpg": "1666838596567-DSCF2113.JPG",
    "building-2005-2.jpg": "1666838600050-DSCF2184.JPG",
    "building-2005-3.jpg": "1666838603551-DSCF2202.JPG",
    "building-2005-4.jpg": "1666838609385-DSCF2203.JPG",
    "building-2005-5.jpg": "1666838614456-DSCF2348.JPG",
    "building-2005-6.jpg": "1666838621309-DSCF2349.JPG",
    "building-2005-7.jpg": "1666838627847-DSCF2356.JPG",
    "building-2005-8.jpg": "1666838631964-DSCF2357.JPG",
    "team-et-wong.jpg": "1667105555685-312468836_1727536490952906_4546230051328704202_n.jpg",
    "team-mureen-wong.jpg": "1677380724078-Rev.-Mureen.JPG",
    "team-manuel-lam.jpg": "1741256380290-HWC--31-.JPG",
    "team-ernest-kwok.jpg": "1667110362583-WhatsApp-Image-2022-10-30-at-6.15.42-PM.jpeg",
    "team-herman-yeung.jpg": "1707732653912-20230114-Herman_jpg.jpg",
    "team-stanley-yu.jpg": "1667105538629-313493398_810828453682069_2842558384896277486_n.jpg",
    "auckland-skyline.jpg": "1667036250916-unsplash-image-CSCoasDuU2U.jpg",
    "taking-notes.jpg": "1667035008582-unsplash-image-Hb6uWq0i4MI.jpg",
    "auckland-view.jpg": "1667203142186-unsplash-image-CCyUntKmGMU.jpg",
}
MAXW = {"team-": 700}
# 同工相片統一尺寸：人像在畫面內太小的，先裁剪（左、上、右、下，以原圖比例計）
CROPS = {"team-manuel-lam.jpg": (0.22, 0.42, 0.78, 1.0),
         "church-building.jpg": (0.0, 0.0, 1.0, 0.56),
         "church-interior.jpg": (0.0, 0.0, 1.0, 0.58)}

for new, old in PHOTOS.items():
    im = ImageOps.exif_transpose(Image.open(os.path.join(SRC, old))).convert("RGB")
    if new in CROPS:
        l, t, r, b = CROPS[new]
        im = im.crop((round(im.width * l), round(im.height * t), round(im.width * r), round(im.height * b)))
    maxw = next((v for k, v in MAXW.items() if new.startswith(k)), 1500)
    if im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, new), "JPEG", quality=80, optimize=True, progressive=True)

# 堂徽：原圖是黑底白線，轉成透明底的白色版及深色版
logo = Image.open(os.path.join(SRC, "1667036157772-download--1-.png")).convert("L")
for name, rgb in (("logo-white.png", (255, 255, 255)), ("logo-dark.png", (31, 36, 48))):
    out = Image.new("RGBA", logo.size, rgb + (0,))
    out.putalpha(logo)
    out.save(os.path.join(OUT, name))

# 年度主題圖（現有網站入口頁的圖片）
for new, old in (("theme-words.png", "1e60b6b6-Screenshot-2026-05-04-at-11.12.08-AM.png"),
                 ("theme-mark.png", "464f9b81-Screenshot-2026-05-04-at-11.11.03-AM.png")):
    im = Image.open(os.path.join(SRC, old)).convert("RGB")
    if im.width > 800:
        im = im.resize((800, round(im.height * 800 / im.width)), Image.LANCZOS)
    im.save(os.path.join(OUT, new), optimize=True)

# 清除 assets/img 內不在上面清單的舊檔案（例如已移除的相片），不要只是不引用
keep = set(PHOTOS) | {"logo-white.png", "logo-dark.png", "theme-words.png", "theme-mark.png"}
for f in os.listdir(OUT):
    if f not in keep:
        os.remove(os.path.join(OUT, f))
        print("removed", f)

total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
print(len(os.listdir(OUT)), "files", total // 1024, "KB")
