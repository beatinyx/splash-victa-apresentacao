# Victa · splash e ícones do app

Apresentação interativa para o handoff da splash animada e dos ícones do app (iOS e Android).

```bash
node scripts/serve.js
```

Abra http://localhost:5174. Use as setas ←/→ para navegar, `1`–`8` para pular direto a uma tela e `Espaço` para tocar ou pausar a splash.

- `src/timeline.js` — animação da splash (copiada de `splash-victa`; é a mesma fonte que gera o Lottie)
- `assets/lottie/victa-splash.json` — Lottie da splash
- `assets/icons/` — ícones exportados do Figma (Victa · Design System › 10 - App assets)
- `src/app.js`, `src/styles.css` — a apresentação
