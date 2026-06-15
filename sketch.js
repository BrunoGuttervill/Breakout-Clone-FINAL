class Bola {
  constructor(velocidade) {
    this.tamanho = 13;
    this.velocidadeBase = velocidade;
    this.resetar();
  }

  resetar() {
    this.pos = createVector(width / 2, height - 80);
    var angulo = random(-PI / 6, PI / 6) - PI / 2;
    this.vel = p5.Vector.fromAngle(angulo);
    this.vel.mult(this.velocidadeBase);
  }

  update() {
    this.pos.add(this.vel);
    if (this.pos.x <= this.tamanho / 2 || this.pos.x >= width - this.tamanho / 2) {
      this.vel.x *= -1;
      tocarSom('parede');
    }
    if (this.pos.y <= this.tamanho / 2) {
      this.vel.y *= -1;
      tocarSom('parede');
    }
  }

  draw() {
    fill(100, 180, 255, 60);
    noStroke();
    ellipse(this.pos.x + 3, this.pos.y + 3, this.tamanho + 4);
    fill(255);
    ellipse(this.pos.x, this.pos.y, this.tamanho);
  }

  caiu() {
    return this.pos.y > height + 20;
  }
}

class Raquete {
  constructor() {
    this.largura = 90;
    this.altura = 12;
    this.pos = createVector(width / 2 - this.largura / 2, height - 40);
    this.vel = 6;
    this.controleAtivo = 'mouse';
  }

  update() {
    if (keyIsDown(LEFT_ARROW) || keyIsDown(RIGHT_ARROW)) {
      this.controleAtivo = 'teclado';
    }
    if (this.controleAtivo === 'teclado') {
      if (keyIsDown(LEFT_ARROW))  this.pos.x -= this.vel;
      if (keyIsDown(RIGHT_ARROW)) this.pos.x += this.vel;
    } else {
      this.pos.x = mouseX - this.largura / 2;
    }
    this.pos.x = constrain(this.pos.x, 0, width - this.largura);
  }

  draw() {
    fill(0, 0, 0, 80);
    noStroke();
    rect(this.pos.x + 3, this.pos.y + 3, this.largura, this.altura, 6);
    fill(100, 180, 255);
    rect(this.pos.x, this.pos.y, this.largura, this.altura, 6);
    fill(255, 255, 255, 60);
    rect(this.pos.x + 5, this.pos.y + 2, this.largura - 10, 4, 3);
  }

  colideCom(bola) {
    return (
      bola.pos.y + bola.tamanho / 2 >= this.pos.y &&
      bola.pos.y - bola.tamanho / 2 <= this.pos.y + this.altura &&
      bola.pos.x >= this.pos.x &&
      bola.pos.x <= this.pos.x + this.largura
    );
  }
}

class Tijolo {
  constructor(x, y, cor, pontos, hitsNecessarios) {
    this.x = x;
    this.y = y;
    this.largura = 63;
    this.altura = 20;
    this.cor = cor;
    this.pontos = pontos;
    this.hitsNecessarios = hitsNecessarios;
    this.hitsRestantes = hitsNecessarios;
    this.ativo = true;
  }

  levarDano() {
    this.hitsRestantes--;
    if (this.hitsRestantes <= 0) {
      this.ativo = false;
      return true;
    }
    return false;
  }

  draw() {
    if (!this.ativo) return;

    var corAtual;
    if (this.hitsNecessarios > 1 && this.hitsRestantes < this.hitsNecessarios) {
      corAtual = lerpColor(this.cor, color(20, 20, 20), 0.5);
    } else {
      corAtual = this.cor;
    }

    fill(0, 0, 0, 80);
    noStroke();
    rect(this.x + 2, this.y + 2, this.largura, this.altura, 4);
    fill(corAtual);
    rect(this.x, this.y, this.largura, this.altura, 4);
    fill(255, 255, 255, 50);
    rect(this.x + 4, this.y + 2, this.largura - 8, 4, 2);

    if (this.hitsNecessarios > 1) {
      fill(255, 255, 255, 200);
      textAlign(CENTER);
      textSize(9);
      noStroke();
      text('■ ■', this.x + this.largura / 2, this.y + this.altura / 2 + 3);
    }
  }
}

class Particula {
  constructor(x, y, cor) {
    this.pos = createVector(x, y);
    this.vel = createVector(random(-4, 4), random(-5, -1));
    this.cor = cor;
    this.tamanho = random(4, 9);
    this.vida = 255;
    this.angulo = random(TWO_PI);
    this.velAngulo = random(-0.2, 0.2);
  }

  update() {
    this.pos.add(this.vel);
    this.vel.y += 0.2;
    this.vel.mult(0.97);
    this.vida -= 10;
    this.angulo += this.velAngulo;
  }

  draw() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.angulo);
    fill(red(this.cor), green(this.cor), blue(this.cor), this.vida);
    noStroke();
    rect(-this.tamanho / 2, -this.tamanho / 2, this.tamanho, this.tamanho, 2);
    pop();
  }

  morreu() {
    return this.vida <= 0;
  }
}

var tela = 'menu';
var pontos = 0;
var vidas = 3;
var fase = 1;
var totalFases = 3;
var shake = 0;

var bola;
var raquete;
var tijolos = [];
var particulas = [];

var configFases = [
  { linhas: 4, velocidade: 4.0, filasResistentes: 0 },
  { linhas: 5, velocidade: 5.0, filasResistentes: 1 },
  { linhas: 6, velocidade: 5.8, filasResistentes: 2 }
];

var coresTijolos = [];  

var pontosPorLinha = [50, 40, 30, 20, 15, 10];
var audioCtx = null;

function setup() {
  var canvas = createCanvas(600, 520);
  canvas.elt.setAttribute('tabindex', '0');
  canvas.elt.focus();
  textFont('monospace');

  coresTijolos = [
    color(231, 76,  60),
    color(230, 126, 34),
    color(241, 196, 15),
    color(46,  204, 113),
    color(52,  152, 219),
    color(155, 89,  182)
  ];

  resetarFase();
}

function draw() {
  background(15);

  if (shake > 0) {
    translate(random(-shake, shake), random(-shake, shake));
    shake = max(0, shake - 1);
  }

  if      (tela === 'menu')       mostrarMenu();
  else if (tela === 'instrucoes') mostrarInstrucoes();
  else if (tela === 'sobre')      mostrarSobre();
  else if (tela === 'jogando')    jogar();
  else if (tela === 'pausado')    { desenharJogo(); mostrarPause(); }
  else if (tela === 'transicao')  mostrarTransicao();
  else if (tela === 'gameover')   mostrarGameOver();
  else if (tela === 'vitoria')    mostrarVitoria();
}
function resetarFase() {
  var config = configFases[fase - 1];
  vidas = 3;
  bola = new Bola(config.velocidade);
  raquete = new Raquete();
  particulas = [];
  criarTijolos(config);
}

function resetarJogo() {
  pontos = 0;
  vidas = 3;
  fase = 1;
  resetarFase();
}

function criarTijolos(config) {
  tijolos = [];
  var colunas = 8;
  var espH = 7;
  var espV = 6;
  var larguraTijolo = 63;
  var offsetX = (width - (colunas * (larguraTijolo + espH))) / 2 + espH / 2;
  var offsetY = 55;

  for (var linha = 0; linha < config.linhas; linha++) {
    var hitsNecessarios = (linha < config.filasResistentes) ? 2 : 1;
    var corIndex = linha % coresTijolos.length;
    var pontosDaLinha = pontosPorLinha[corIndex] * fase;

    for (var col = 0; col < colunas; col++) {
      var x = offsetX + col * (larguraTijolo + espH);
      var y = offsetY + linha * (20 + espV);
      tijolos.push(new Tijolo(x, y, coresTijolos[corIndex], pontosDaLinha, hitsNecessarios));
    }
  }
}

function jogar() {
  bola.update();
  raquete.update();
  verificarColisoes();
  atualizarParticulas();
  desenharJogo();

  var tijolosAtivos = tijolos.filter(function(t) { return t.ativo; }).length;
  if (tijolosAtivos === 0) {
    tocarSom('fase');
    tela = (fase >= totalFases) ? 'vitoria' : 'transicao';
  }

  if (bola.caiu()) {
    vidas--;
    shake = 10;
    tocarSom('vida');
    if (vidas <= 0) {
      tocarSom('gameover');
      tela = 'gameover';
    } else {
      bola.resetar();
      raquete = new Raquete();
    }
  }
}

function verificarColisoes() {
  if (raquete.colideCom(bola)) {
    bola.vel.y = -abs(bola.vel.y);
    var centro = raquete.pos.x + raquete.largura / 2;
    var diferenca = (bola.pos.x - centro) / (raquete.largura / 2);
    bola.vel.x = diferenca * bola.velocidadeBase * 1.2;
    bola.vel.setMag(bola.velocidadeBase);
    tocarSom('raquete');
  }

  var colidiuEsseFrame = false;

  for (var i = 0; i < tijolos.length; i++) {
    var t = tijolos[i];
    if (!t.ativo || colidiuEsseFrame) continue;

    if (
      bola.pos.x + bola.tamanho / 2 > t.x &&
      bola.pos.x - bola.tamanho / 2 < t.x + t.largura &&
      bola.pos.y + bola.tamanho / 2 > t.y &&
      bola.pos.y - bola.tamanho / 2 < t.y + t.altura
    ) {
      var sobEsquerda = (bola.pos.x + bola.tamanho / 2) - t.x;
      var sobDireita  = (t.x + t.largura) - (bola.pos.x - bola.tamanho / 2);
      var sobCima     = (bola.pos.y + bola.tamanho / 2) - t.y;
      var sobBaixo    = (t.y + t.altura) - (bola.pos.y - bola.tamanho / 2);

      var menorSob = min(sobEsquerda, sobDireita, sobCima, sobBaixo);

      if (menorSob === sobCima || menorSob === sobBaixo) {
        bola.vel.y *= -1; 
      } else {
        bola.vel.x *= -1; 
      }

      colidiuEsseFrame = true;

      var destruido = t.levarDano();
      tocarSom('tijolo');

      if (destruido) {
        pontos += t.pontos;
        for (var p = 0; p < 8; p++) {
          particulas.push(new Particula(t.x + t.largura / 2, t.y + t.altura / 2, t.cor));
        }
      }
    }
  }
}

function atualizarParticulas() {
  for (var i = particulas.length - 1; i >= 0; i--) {
    particulas[i].update();
    if (particulas[i].morreu()) {
      particulas.splice(i, 1);
    }
  }
}

function desenharJogo() {
  for (var i = 0; i < tijolos.length; i++) tijolos[i].draw();
  for (var i = 0; i < particulas.length; i++) particulas[i].draw();
  raquete.draw();
  bola.draw();
  desenharHUD();
}

function desenharHUD() {
  stroke(40); strokeWeight(1);
  line(0, 30, width, 30);
  noStroke();

  fill(255); textSize(14);
  textAlign(LEFT);
  text('PONTOS: ' + pontos, 12, 22);
  textAlign(CENTER);
  text('FASE ' + fase + ' / ' + totalFases, width / 2, 22);

  fill(231, 76, 60);
  textAlign(RIGHT);
  var coracoes = '';
  for (var i = 0; i < vidas; i++) coracoes += '♥ ';
  text(coracoes, width - 10, 22);
}
function mostrarMenu() {
  textAlign(CENTER);
  fill(100, 180, 255);
  textSize(52);
  text('BREAKOUT', width / 2, 115);
  fill(241, 196, 15);
  textSize(24);
  text('P  L  U  S', width / 2, 150);
  fill(160);
  textSize(14);
  text('Destrua todos os tijolos antes de perder suas vidas!', width / 2, 190);

  desenharBotao('▶  JOGAR',      width / 2, 265, 210, 44, color(41, 128, 185));
  desenharBotao('?  INSTRUCOES', width / 2, 325, 210, 44, color(39, 174, 96));
  desenharBotao('i  SOBRE',      width / 2, 385, 210, 44, color(80, 80, 80));

  fill(80); textSize(13);
  text('ou pressione ENTER para jogar', width / 2, 450);
}

function mostrarInstrucoes() {
  textAlign(CENTER);
  fill(255); textSize(28);
  text('INSTRUCOES', width / 2, 65);
  stroke(50); strokeWeight(1);
  line(60, 80, width - 60, 80);
  noStroke();

  var x = 70; var y = 115; var esp = 28;
  textAlign(LEFT);
  fill(100, 180, 255); textSize(14); text('CONTROLES', x, y);
  fill(200); textSize(13);
  text('Mouse ou <- ->   Mover raquete', x, y + esp);
  text('ENTER            Iniciar jogo', x, y + esp * 2);
  text('P                Pausar / Continuar', x, y + esp * 3);
  text('R                Jogar de novo', x, y + esp * 4);
  text('M                Voltar ao menu', x, y + esp * 5);

  y = 325;
  fill(100, 180, 255); textSize(14); text('TIJOLOS', x, y);
  fill(200); textSize(13);
  text('Tijolo normal    - 1 acerto para destruir', x, y + esp);
  text('Tijolo com |__|  - 2 acertos (resistente)', x, y + esp * 2);

  y = 415;
  fill(100, 180, 255); textSize(14); text('PROGRESSAO', x, y);
  fill(200); textSize(13);
  text('3 fases no total - cada fase e mais rapida', x, y + esp);
  text('Pontos por tijolo aumentam a cada fase', x, y + esp * 2);

  desenharBotao('<- VOLTAR', width / 2, 492, 180, 38, color(80, 80, 80));
}

function mostrarSobre() {
  textAlign(CENTER);
  fill(255); textSize(28);
  text('SOBRE', width / 2, 65);
  stroke(50); strokeWeight(1);
  line(60, 80, width - 60, 80);
  noStroke();

  fill(100, 180, 255); textSize(14);
  text('AUTOR', width / 2, 125);
  fill(255); textSize(20);
  text('Bruno Guttervill', width / 2, 158);

  fill(160); textSize(13);
  text('Trabalho final - Web Development: HTML5 Canvas & Games', width / 2, 240);

  fill(100, 180, 255); textSize(14);
  text('SOBRE O JOGO', width / 2, 295);
  fill(160); textSize(13);
  text('Clone do classico Breakout com 3 fases progressivas,', width / 2, 325);
  text('particulas, sons procedurais, tijolos resistentes', width / 2, 348);
  text('e efeito de screen shake.', width / 2, 371);

  fill(100, 180, 255); textSize(14);
  text('TECNOLOGIAS', width / 2, 415);
  fill(160); textSize(13);
  text('p5.js  |  JavaScript  |  Web Audio API', width / 2, 440);

  desenharBotao('<- VOLTAR', width / 2, 490, 180, 38, color(80, 80, 80));
}

function mostrarPause() {
  fill(0, 0, 0, 170);
  rect(0, 0, width, height);
  textAlign(CENTER);
  fill(255); textSize(46);
  text('PAUSADO', width / 2, 200);
  fill(160); textSize(15);
  text('Pressione P para continuar', width / 2, 248);
  desenharBotao('> CONTINUAR  (P)', width / 2, 305, 220, 44, color(41, 128, 185));
  desenharBotao('  MENU  (M)',       width / 2, 365, 220, 44, color(80, 80, 80));
}

function mostrarTransicao() {
  textAlign(CENTER);
  fill(46, 204, 113); textSize(42);
  text('FASE ' + fase + ' COMPLETA!', width / 2, 165);
  fill(255); textSize(20);
  text('Pontuacao: ' + pontos, width / 2, 225);
  fill(160); textSize(15);
  text('Proxima: Fase ' + (fase + 1) + ' de ' + totalFases, width / 2, 270);
  text('A bola ficara mais rapida!', width / 2, 298);
  fill(241, 196, 15); textSize(13);
  text('Tijolos resistentes aparecem nas primeiras linhas', width / 2, 330);
  desenharBotao('PROXIMA FASE ->', width / 2, 385, 230, 44, color(41, 128, 185));
}

function mostrarGameOver() {
  textAlign(CENTER);
  fill(231, 76, 60); textSize(50);
  text('GAME OVER', width / 2, 165);
  fill(255); textSize(22);
  text('Pontuacao final: ' + pontos, width / 2, 225);
  fill(160); textSize(15);
  text('Voce chegou ate a fase ' + fase + ' de ' + totalFases, width / 2, 262);
  desenharBotao('JOGAR DE NOVO  (R)', width / 2, 330, 255, 44, color(41, 128, 185));
  desenharBotao('MENU INICIAL  (M)',  width / 2, 390, 255, 44, color(80, 80, 80));
}

function mostrarVitoria() {
  textAlign(CENTER);
  fill(241, 196, 15); textSize(46);
  text('VOCE GANHOU!', width / 2, 148);
  fill(255); textSize(18);
  text('Parabens! Voce zerou o jogo!', width / 2, 195);
  fill(255); textSize(26);
  text('Pontuacao final: ' + pontos, width / 2, 248);
  fill(241, 196, 15); textSize(38);
  text('*  *  *', width / 2, 305);
  desenharBotao('JOGAR DE NOVO  (R)', width / 2, 375, 255, 44, color(41, 128, 185));
  desenharBotao('MENU INICIAL  (M)',  width / 2, 435, 255, 44, color(80, 80, 80));
}
function desenharBotao(texto, cx, cy, larg, alt, cor) {
  noStroke();
  fill(0, 0, 0, 80);
  rect(cx - larg / 2 + 3, cy - alt / 2 + 3, larg, alt, 8);
  fill(cor);
  rect(cx - larg / 2, cy - alt / 2, larg, alt, 8);
  fill(255, 255, 255, 35);
  rect(cx - larg / 2 + 5, cy - alt / 2 + 4, larg - 10, alt / 2 - 4, 6);
  fill(255);
  textAlign(CENTER);
  textSize(14);
  text(texto, cx, cy + 5);
}

function clicouBotao(cx, cy, larg, alt) {
  return (
    mouseX > cx - larg / 2 && mouseX < cx + larg / 2 &&
    mouseY > cy - alt / 2  && mouseY < cy + alt / 2
  );
}
function keyPressed() {
  iniciarAudio();

  if (key === 'p' || key === 'P') {
    if      (tela === 'jogando') tela = 'pausado';
    else if (tela === 'pausado') tela = 'jogando';
  }

  if (keyCode === ENTER) {
    if (tela === 'menu')      { resetarJogo(); tela = 'jogando'; }
    if (tela === 'transicao') { fase++; resetarFase(); tela = 'jogando'; }
  }

  if ((key === 'r' || key === 'R') && (tela === 'gameover' || tela === 'vitoria')) {
    resetarJogo(); tela = 'jogando';
  }

  if ((key === 'm' || key === 'M') && (tela === 'gameover' || tela === 'vitoria' || tela === 'pausado')) {
    resetarJogo(); tela = 'menu';
  }
}
function mousePressed() {
  iniciarAudio();

  if (tela === 'menu') {
    if (clicouBotao(width / 2, 265, 210, 44)) { resetarJogo(); tela = 'jogando'; }
    if (clicouBotao(width / 2, 325, 210, 44)) tela = 'instrucoes';
    if (clicouBotao(width / 2, 385, 210, 44)) tela = 'sobre';
  }
  else if (tela === 'instrucoes') {
    if (clicouBotao(width / 2, 492, 180, 38)) tela = 'menu';
  }
  else if (tela === 'sobre') {
    if (clicouBotao(width / 2, 490, 180, 38)) tela = 'menu';
  }
  else if (tela === 'pausado') {
    if (clicouBotao(width / 2, 305, 220, 44)) tela = 'jogando';
    if (clicouBotao(width / 2, 365, 220, 44)) { resetarJogo(); tela = 'menu'; }
  }
  else if (tela === 'transicao') {
    if (clicouBotao(width / 2, 385, 230, 44)) { fase++; resetarFase(); tela = 'jogando'; }
  }
  else if (tela === 'gameover') {
    if (clicouBotao(width / 2, 330, 255, 44)) { resetarJogo(); tela = 'jogando'; }
    if (clicouBotao(width / 2, 390, 255, 44)) { resetarJogo(); tela = 'menu'; }
  }
  else if (tela === 'vitoria') {
    if (clicouBotao(width / 2, 375, 255, 44)) { resetarJogo(); tela = 'jogando'; }
    if (clicouBotao(width / 2, 435, 255, 44)) { resetarJogo(); tela = 'menu'; }
  }
}

function mouseMoved() {
  if (raquete) raquete.controleAtivo = 'mouse';
}
function iniciarAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function tocarSom(tipo) {
  if (!audioCtx) return;

  var osc  = audioCtx.createOscillator();
  var gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  var t = audioCtx.currentTime;

  switch (tipo) {
    case 'tijolo':
      osc.frequency.setValueAtTime(660, t);
      osc.frequency.exponentialRampToValueAtTime(1320, t + 0.08);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
      osc.start(t); osc.stop(t + 0.1);
      break;
    case 'raquete':
      osc.frequency.setValueAtTime(330, t);
      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);
      osc.start(t); osc.stop(t + 0.08);
      break;
    case 'parede':
      osc.frequency.setValueAtTime(220, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
      osc.start(t); osc.stop(t + 0.05);
      break;
    case 'vida':
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.4);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      osc.start(t); osc.stop(t + 0.4);
      break;
    case 'fase':
      osc.type = 'square';
      osc.frequency.setValueAtTime(523, t);
      osc.frequency.setValueAtTime(659, t + 0.12);
      osc.frequency.setValueAtTime(784, t + 0.24);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.5);
      osc.start(t); osc.stop(t + 0.5);
      break;
    case 'gameover':
      osc.frequency.setValueAtTime(330, t);
      osc.frequency.exponentialRampToValueAtTime(55, t + 1.0);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
      osc.start(t); osc.stop(t + 1.0);
      break;
  }
}