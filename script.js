
"use strict";

const $ = id => document.getElementById(id);
const canvas = $("tela");
const ctx = canvas.getContext("2d");

const nomes = [
  "Primeiro Passo",
  "Ponte da Coragem",
  "Floresta da Persistência",
  "Labirinto das Escolhas",
  "Ritmo da Confiança",
  "Cidade dos Sonhos",
  "Salto da Superação",
  "Caverna da Calma",
  "Circuito da Disciplina",
  "Jardim da Gratidão",
  "Caminho da Empatia",
  "Ventos da Mudança",
  "Labirinto do Propósito",
  "Corrida da Esperança",
  "Cume das Conquistas"
];

const perguntas = [
  ["O que ajuda a começar um sonho?",
    ["Esperar sempre", "Dar o primeiro passo", "Desistir"], 1],
  ["Coragem significa...",
    ["Agir apesar do medo", "Nunca sentir medo", "Evitar tudo"], 0],
  ["Quando algo dá errado, devemos...",
    ["Desistir", "Culpar os outros", "Aprender e tentar"], 2],
  ["Uma boa escolha considera...",
    ["Consequências", "Só a pressa", "A opinião de todos"], 0],
  ["A confiança cresce com...",
    ["Prática e aprendizado", "Comparações", "Desânimo"], 0],
  ["Para alcançar objetivos é importante...",
    ["Planejamento", "Sorte apenas", "Não agir"], 0],
  ["Superação envolve...",
    ["Persistência", "Perfeição", "Nunca errar"], 0],
  ["Em momentos difíceis ajuda...",
    ["Agir sem pensar", "Manter a calma", "Ignorar tudo"], 1],
  ["Disciplina é...",
    ["Praticar com constância", "Fazer só quando quiser", "Desistir"], 0],
  ["Gratidão significa...",
    ["Reconhecer coisas boas", "Ignorar conquistas", "Exigir sempre"], 0],
  ["Empatia é...",
    ["Compreender o outro", "Julgar rapidamente", "Pensar só em si"], 0],
  ["Mudanças podem trazer...",
    ["Aprendizado", "Somente problemas", "Nenhuma oportunidade"], 0],
  ["Ter propósito significa...",
    ["Ter direção e valores", "Nunca mudar", "Imitar os outros"], 0],
  ["Esperança deve ser acompanhada de...",
    ["Ações", "Espera infinita", "Desistência"], 0],
  ["Uma conquista representa...",
    ["Esforço e aprendizado", "Fim de todo desafio", "Superioridade"], 0]
];

// PERSONAGENS CORRIGIDOS
const avatares = [
  "Explorador", "Exploradora", "Aventureiro",
  "Astronauta", "Piloto", "Ninja",
  "Herói", "Heroína"
];

const coresAvatares = [
  "#36d6ff", "#ff78b7", "#ffc857", "#a98bff",
  "#5be3a2", "#f07878", "#ff964f", "#d88bff"
];

let avatar = 0;
let nome = "Aventureiro";
let fase = 0;
let estrelas = 0;
let vidas = 3;
let ativo = false;
let pausado = false;
let perguntando = false;
let ultimoTempo = 0;
let tempo = 0;
let audio = null;
let obstaculos = [];
let moedas = [];
let portal = {};
let cam = 0;
let invulneravel = 0;

const teclas = {
  left: false,
  right: false,
  up: false,
  down: false
};

const jogador = {
  x: 40, y: 350, w: 34, h: 48,
  vx: 0, vy: 0, chao: false
};

const W = 900;
const H = 500;
const piso = 440;

// DESENHO DO PERSONAGEM
function desenharPersonagem(x, y, indice, escala = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(escala, escala);

  const cor = coresAvatares[indice];

  // Pernas
  ctx.fillStyle = "#17213e";
  ctx.fillRect(7, 32, 9, 16);
  ctx.fillRect(20, 32, 9, 16);

  // Corpo
  ctx.fillStyle = cor;
  ctx.fillRect(4, 16, 28, 20);

  // Braços
  ctx.fillRect(-2, 18, 6, 17);
  ctx.fillRect(32, 18, 6, 17);

  // Cabeça
  ctx.fillStyle = "#f1bc8f";
  ctx.beginPath();
  ctx.arc(18, 9, 12, 0, Math.PI * 2);
  ctx.fill();

  // Cabelo ou capacete
  ctx.fillStyle = indice === 3 || indice === 4
    ? "#d8eaff" : "#24304e";
  ctx.fillRect(7, -3, 22, 7);

  // Olhos
  ctx.fillStyle = "#18213a";
  ctx.fillRect(12, 9, 3, 3);
  ctx.fillRect(22, 9, 3, 3);

  // Detalhes diferentes por avatar
  if (indice === 5) {
    ctx.fillStyle = "#26314c";
    ctx.fillRect(7, 5, 22, 9);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(12, 9, 3, 2);
    ctx.fillRect(22, 9, 3, 2);
  }

  if (indice === 3 || indice === 4) {
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.strokeRect(3, -5, 30, 30);
  }

  if (indice === 6 || indice === 7) {
    ctx.fillStyle = "#ffd84d";
    ctx.beginPath();
    ctx.moveTo(18, 19);
    ctx.lineTo(23, 27);
    ctx.lineTo(18, 34);
    ctx.lineTo(13, 27);
    ctx.fill();
  }

  ctx.restore();
}

// SELEÇÃO DOS AVATARES
avatares.forEach((a, i) => {
  const b = document.createElement("button");
  b.className = "avatar" + (i === 0 ? " ativo" : "");
  b.textContent = a;
  b.style.fontSize = "11px";
  b.style.padding = "5px";
  b.style.overflowWrap = "anywhere";

  b.onclick = () => {
    avatar = i;
    document.querySelectorAll(".avatar").forEach(
      el => el.classList.remove("ativo")
    );
    b.classList.add("ativo");
  };

  $("avatares").appendChild(b);
});

// EFEITOS SONOROS
function som(freq = 440, dur = .12) {
  try {
    audio ||= new (window.AudioContext ||
      window.webkitAudioContext)();

    if (audio.state === "suspended") audio.resume();

    const osc = audio.createOscillator();
    const gain = audio.createGain();

    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(.055, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      .001, audio.currentTime + dur
    );

    osc.connect(gain).connect(audio.destination);
    osc.start();
    osc.stop(audio.currentTime + dur);
  } catch (e) {}
}

function colisao(a, b) {
  return a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y;
}

// INICIALIZAÇÃO DAS FASES
function iniciarFase() {
  tempo = 0;
  cam = 0;
  invulneravel = 0;
  perguntando = false;
  pausado = false;

  jogador.x = 40;
  jogador.y = piso - jogador.h;
  jogador.vx = 0;
  jogador.vy = 0;
  jogador.chao = true;

  obstaculos = [];
  moedas = [];

  const comprimento = 2100 + fase * 130;

  for (let i = 0; i < 8 + fase; i++) {
    const x = 260 + i * (145 + (fase % 3) * 20);
    const tipo = (i + fase) % 4;

    obstaculos.push({
      x,
      y: tipo === 1 ? piso - 100 : piso - 34,
      w: tipo === 1 ? 80 : 38,
      h: tipo === 1 ? 18 : 34,
      tipo,
      origem: x
    });
  }

  for (let i = 0; i < 15 + fase; i++) {
    moedas.push({
      x: 160 + i * 125,
      y: piso - 90 - (i % 3) * 35,
      w: 22,
      h: 22,
      pega: false
    });
  }

  portal = {
    x: comprimento,
    y: piso - 105,
    w: 65,
    h: 105
  };

  $("mundo").textContent =
    `Mundo ${fase + 1}: ${nomes[fase]}`;

  const estilos = [
    "Plataformas e saltos",
    "Desvie dos obstáculos",
    "Colete estrelas",
    "Encontre o portal",
    "Supere o percurso"
  ];

  $("objetivo").textContent =
    estilos[fase % 5] + " • Alcance o portal luminoso";

  $("pausar").textContent = "⏸ PAUSAR";
  atualizarPainel();
}

function atualizarPainel() {
  $("pontos").innerHTML =
    `⭐ ${estrelas} &nbsp; ❤️ ${vidas}<br>` +
    `Fase ${fase + 1}/15`;
}

// VIDAS
function perderVida() {
  if (perguntando || invulneravel > 0) return;

  vidas--;
  som(180, .25);
  atualizarPainel();

  if (vidas <= 0) {
    ativo = false;

    mostrarModal(
      "Fim da tentativa",
      "Persistir também é recomeçar. Tente novamente!",
      "RECOMEÇAR",
      () => {
        fase = 0;
        vidas = 3;
        estrelas = 0;
        ativo = true;
        iniciarFase();
      }
    );
  } else {
    jogador.x = Math.max(40, jogador.x - 170);
    jogador.y = piso - jogador.h;
    jogador.vx = 0;
    jogador.vy = 0;
    invulneravel = 1.5;
  }
}

// JANELAS
function mostrarModal(titulo, texto, botao, acao) {
  $("tituloModal").textContent = titulo;
  $("textoModal").textContent = texto;
  $("respostas").innerHTML = "";
  $("continuar").textContent = botao;
  $("continuar").classList.remove("escondido");

  $("continuar").onclick = () => {
    $("modal").classList.add("escondido");
    acao();
  };

  $("modal").classList.remove("escondido");
}

// PERGUNTAS MOTIVACIONAIS
function fazerPergunta() {
  if (perguntando) return;
  perguntando = true;

  const p = perguntas[fase];

  $("tituloModal").textContent = "DESAFIO MOTIVACIONAL";
  $("textoModal").textContent = p[0];
  $("respostas").innerHTML = "";
  $("continuar").classList.add("escondido");

  p[1].forEach((resposta, i) => {
    const b = document.createElement("button");
    b.textContent =
      String.fromCharCode(65 + i) + ") " + resposta;

    b.onclick = () => {
      if (i === p[2]) {
        som(700, .2);
        estrelas += 10;
        atualizarPainel();
        $("modal").classList.add("escondido");
        perguntando = false;
        proximaFase();
      } else {
        som(220, .2);
        b.disabled = true;
        b.style.opacity = ".35";
        $("textoModal").textContent =
          "Tente novamente! " + p[0];
      }
    };

    $("respostas").appendChild(b);
  });

  $("modal").classList.remove("escondido");
}

// PROGRESSÃO
function proximaFase() {
  fase++;

  if (fase >= 15) {
    ativo = false;

    mostrarModal(
      "JORNADA CONCLUÍDA!",
      `${nome}, você superou os 15 mundos! ` +
      `Pontuação final: ${estrelas} estrelas.`,
      "JOGAR NOVAMENTE",
      () => {
        fase = 0;
        estrelas = 0;
        vidas = 3;
        ativo = true;
        iniciarFase();
      }
    );
  } else {
    iniciarFase();
  }
}

// MOVIMENTAÇÃO
function atualizar(dt) {
  if (!ativo || pausado || perguntando) return;

  tempo += dt;
  invulneravel = Math.max(0, invulneravel - dt);

  const velocidade = 4.3 + fase * .12;

  jogador.vx = 0;

  if (teclas.left) jogador.vx = -velocidade;
  if (teclas.right) jogador.vx = velocidade;

  if ([1, 4, 8, 13].includes(fase)) {
    jogador.vx += 1.4;
  }

  if (teclas.up && jogador.chao) {
    jogador.vy = -12.8;
    jogador.chao = false;
    som(350, .08);
  }

  const yAnterior = jogador.y + jogador.h;

  jogador.vy += .55;
  jogador.x += jogador.vx;
  jogador.y += jogador.vy;

  jogador.chao = false;

  if (jogador.y + jogador.h >= piso) {
    jogador.y = piso - jogador.h;
    jogador.vy = 0;
    jogador.chao = true;
  }

  jogador.x = Math.max(0, jogador.x);

  obstaculos.forEach(o => {
    if (o.tipo === 2) {
      o.x = o.origem +
        Math.sin(tempo * 2 + o.origem) * 30;
    }

    if (colisao(jogador, o)) {
      if (
        o.tipo === 1 &&
        jogador.vy >= 0 &&
        yAnterior <= o.y + 12
      ) {
        jogador.y = o.y - jogador.h;
        jogador.vy = 0;
        jogador.chao = true;
      } else {
        perderVida();
      }
    }
  });

  moedas.forEach(m => {
    if (!m.pega && colisao(jogador, m)) {
      m.pega = true;
      estrelas++;
      som(650 + Math.random() * 180, .08);
      atualizarPainel();
    }
  });

  if (colisao(jogador, portal)) {
    fazerPergunta();
  }

  cam = Math.max(0, jogador.x - 230);
}

// DESENHO DO CENÁRIO
function desenhar() {
  const paletas = [
    ["#102f52", "#25699b"],
    ["#2a2457", "#6852a5"],
    ["#123e3b", "#26765d"],
    ["#32284c", "#765b9b"],
    ["#3d2746", "#a54f75"]
  ];

  const cores = paletas[fase % 5];

  const fundo = ctx.createLinearGradient(0, 0, 0, H);
  fundo.addColorStop(0, cores[0]);
  fundo.addColorStop(1, cores[1]);

  ctx.fillStyle = fundo;
  ctx.fillRect(0, 0, W, H);

  // Céu
  ctx.fillStyle = "#ffffff88";

  for (let i = 0; i < 45; i++) {
    const x = (i * 197 - cam * .12) % W;
    const y = (i * 73) % 310;
    ctx.fillRect((x + W) % W, y, 2, 2);
  }

  // Montanhas
  for (let i = 0; i < 12; i++) {
    const x = i * 180 - (cam * .25) % 180;

    ctx.fillStyle = "#091b3880";
    ctx.beginPath();
    ctx.moveTo(x - 90, piso);
    ctx.lineTo(x + 65, 190 + (i % 3) * 40);
    ctx.lineTo(x + 230, piso);
    ctx.fill();
  }

  ctx.save();
  ctx.translate(-cam, 0);

  // Piso
  ctx.fillStyle = "#132d37";
  ctx.fillRect(cam, piso, W + 100, 60);

  ctx.fillStyle = "#49b8b1";
  ctx.fillRect(cam, piso, W + 100, 5);

  // Obstáculos
  obstaculos.forEach(o => {
    if (o.x + o.w < cam || o.x > cam + W) return;

    ctx.fillStyle =
      o.tipo === 1 ? "#51c6c1" : "#f16b86";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 12;
    ctx.fillRect(o.x, o.y, o.w, o.h);
    ctx.shadowBlur = 0;
  });

  // Estrelas
  moedas.forEach(m => {
    if (m.pega) return;

    ctx.fillStyle = "#ffe077";
    ctx.shadowColor = "#ffe077";
    ctx.shadowBlur = 15;
    ctx.font = "25px Arial";
    ctx.fillText("★", m.x, m.y + 22);
    ctx.shadowBlur = 0;
  });

  // Portal
  ctx.strokeStyle = "#73f7ff";
  ctx.lineWidth = 7;
  ctx.shadowColor = "#73f7ff";
  ctx.shadowBlur = 25;
  ctx.strokeRect(
    portal.x, portal.y, portal.w, portal.h
  );
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#73f7ff33";
  ctx.fillRect(
    portal.x, portal.y, portal.w, portal.h
  );

  // Sombra do personagem
  ctx.fillStyle = "#0005";
  ctx.beginPath();
  ctx.ellipse(
    jogador.x + 17, piso + 3,
    22, 6, 0, 0, Math.PI * 2
  );
  ctx.fill();

  // PERSONAGEM CORRIGIDO
  if (
    invulneravel <= 0 ||
    Math.floor(tempo * 12) % 2 === 0
  ) {
    desenharPersonagem(
      jogador.x,
      jogador.y,
      avatar
    );
  }

  ctx.restore();

  // Progresso
  const progresso =
    Math.min(1, jogador.x / portal.x);

  ctx.fillStyle = "#ffffff30";
  ctx.fillRect(20, 20, 220, 10);

  ctx.fillStyle = "#67e5ff";
  ctx.fillRect(20, 20, 220 * progresso, 10);

  ctx.fillStyle = "white";
  ctx.font = "15px Arial";
  ctx.fillText(
    `${Math.floor(progresso * 100)}%`,
    250, 30
  );

  if (pausado) {
    ctx.fillStyle = "#0009";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "white";
    ctx.font = "bold 46px Arial";
    ctx.textAlign = "center";
    ctx.fillText("PAUSADO", W / 2, H / 2);
    ctx.textAlign = "left";
  }
}

// LOOP DO JOGO
function loop(t) {
  const dt = Math.min((t - ultimoTempo) / 1000, .04);
  ultimoTempo = t;

  atualizar(dt || 0);
  desenhar();

  requestAnimationFrame(loop);
}

// BOTÃO INICIAR
$("iniciar").onclick = () => {
  nome = $("nome").value.trim() || "Aventureiro";
  fase = 0;
  vidas = 3;
  estrelas = 0;
  ativo = true;

  $("menu").classList.add("escondido");
  $("jogo").classList.remove("escondido");

  iniciarFase();
  som(550, .15);
};

// PAUSA
function alternarPausa() {
  if (!ativo || perguntando) return;

  pausado = !pausado;

  $("pausar").textContent =
    pausado ? "▶ RETOMAR" : "⏸ PAUSAR";
}

$("pausar").onclick = alternarPausa;

// TECLADO
const mapa = {
  ArrowLeft: "left",
  ArrowRight: "right",
  ArrowUp: "up",
  ArrowDown: "down",
  a: "left",
  d: "right",
  w: "up",
  s: "down",
  " ": "up"
};

document.addEventListener("keydown", e => {
  if (e.target.tagName === "INPUT") return;

  const tecla = e.key.length === 1
    ? e.key.toLowerCase() : e.key;

  if (mapa[tecla]) {
    e.preventDefault();
    teclas[mapa[tecla]] = true;
  }

  if (tecla === "p" && !e.repeat) {
    alternarPausa();
  }
});

document.addEventListener("keyup", e => {
  const tecla = e.key.length === 1
    ? e.key.toLowerCase() : e.key;

  if (mapa[tecla]) {
    teclas[mapa[tecla]] = false;
  }
});

// BOTÕES PARA CELULAR
document.querySelectorAll(
  "[data-controle]"
).forEach(b => {
  const k = b.dataset.controle;

  b.addEventListener("pointerdown", e => {
    e.preventDefault();
    teclas[k] = true;

    try {
      b.setPointerCapture(e.pointerId);
    } catch (err) {}
  });

  [
    "pointerup",
    "pointercancel",
    "lostpointercapture"
  ].forEach(evento => {
    b.addEventListener(evento, () => {
      teclas[k] = false;
    });
  });
});

window.addEventListener("blur", () => {
  Object.keys(teclas).forEach(
    k => teclas[k] = false
  );

  if (ativo && !perguntando) {
    pausado = true;
    $("pausar").textContent = "▶ RETOMAR";
  }
});

requestAnimationFrame(loop);
