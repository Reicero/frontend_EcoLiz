from pathlib import Path
from datetime import datetime
import re

files = [
    Path("src/pages/Login.tsx"),
    Path("src/components/layout/Footer.tsx"),
    Path("src/components/layout/Navbar.tsx"),
]

for path in files:
    text = path.read_text(encoding="utf-8")
    original = text

    backup = path.with_suffix(path.suffix + ".bak-logo-clean-" + datetime.now().strftime("%Y%m%d-%H%M%S"))
    backup.write_text(original, encoding="utf-8")

    # Enlève le fond blanc autour du logo sur la page login
    text = text.replace(
        'className="inline-block bg-white p-2.5 rounded-xl mb-16"',
        'className="inline-block mb-16"'
    )

    # Enlève le fond blanc autour du logo dans le footer
    text = text.replace(
        'className="bg-white inline-flex p-2 rounded-xl mb-5"',
        'className="inline-flex mb-5"'
    )

    # Agrandit le logo dans la navbar
    text = re.sub(
        r'(src="/logo\.png"\s+alt="EcoLiz"\s+className=")[^"]*(")',
        r'\1h-16 w-auto object-contain bg-transparent drop-shadow-sm\2',
        text
    )

    path.write_text(text, encoding="utf-8")

print("✅ Logo nettoyé : fond blanc retiré et taille augmentée")
