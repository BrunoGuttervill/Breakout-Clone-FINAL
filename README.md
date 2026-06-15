# 🎮 Breakout Plus

Clone do clássico Breakout com 3 fases progressivas, feito em p5.js e JavaScript. Inclui partículas, sons procedurais, tijolos resistentes, screen shake e sistema de pontuação por fase.

---

## 👤 Integrante

- Bruno Guttervill

---

## ▶️ Como executar

1. Baixe ou clone o repositório
2. Abra a pasta do projeto no VS Code
3. Instale a extensão **Live Server**
4. Clique com o botão direito no arquivo `index.html` e selecione **Open with Live Server**
5. O jogo abrirá automaticamente no navegador

> ⚠️ Não abra o `index.html` diretamente pelo navegador (clicando duas vezes) — use o Live Server para funcionar corretamente.

---

## 🕹️ Como jogar

O objetivo é destruir todos os tijolos da tela usando a bola e a raquete, sem deixar a bola cair. O jogo possui 3 fases com dificuldade progressiva.

### Controles

| Tecla / Ação | Função                            |
|--------------|-----------------------------------|
| Mouse        | Mover a raquete                   |
| ← →          | Mover a raquete                   |
| ENTER        | Iniciar jogo / Avançar fase       |
| P            | Pausar / Continuar                |
| R            | Jogar de novo (game over/vitória) |
| M            | Voltar ao menu                    |

### Regras

- Você começa com **3 vidas** por fase
- As vidas são **restauradas** a cada nova fase
- Se a bola cair, você perde uma vida
- Destrua todos os tijolos para avançar de fase
- Tijolos marcados com **■ ■** precisam de **2 acertos** para quebrar

---

## 📈 Pontuação

Os pontos variam por cor e multiplicam a cada fase:

| Cor         | Fase 1  | Fase 2  | Fase 3  |
|-------------|---------|---------|---------|
| 🔴 Vermelha | 50 pts  | 100 pts | 150 pts |
| 🟠 Laranja  | 40 pts  | 80 pts  | 120 pts |
| 🟡 Amarela  | 30 pts  | 60 pts  | 90 pts  |
| 🟢 Verde    | 20 pts  | 40 pts  | 60 pts  |
| 🔵 Azul     | 15 pts  | 30 pts  | 45 pts  |
| 🟣 Roxa     | 10 pts  | 20 pts  | 30 pts  |

---

## 🗂️ Arquivos

```
breakout-plus/
├── index.html   → Página principal do jogo
├── sketch.js    → Código do jogo em p5.js
└── README.md    → Este arquivo
```

---

## 🛠️ Tecnologias

- [p5.js](https://p5js.org/) v1.9.0
- JavaScript (ES6)
- Web Audio API
- HTML5
