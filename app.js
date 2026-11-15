(() => {
  const S = window.SITE || {};
  const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const celular = matchMedia("(max-width: 760px)").matches;


  /* ── Rolagem que toca o vídeo ─────────────────────────────────────────── */
  const cine = document.querySelector(".cine");
  const canvas = cine && cine.querySelector(".cine-canvas");
  if (cine && canvas && S.frames && S.frames.total) {
    const ctx = canvas.getContext("2d");
    const total = S.frames.total;
    const padrao = celular ? S.frames.mobile : S.frames.desktop;
    const src = (i) => padrao.replace("{n}", String(i + 1).padStart(4, "0"));
    const quadros = new Array(total);
    const momentos = [...cine.querySelectorAll(".momento")];
    let alvo = 0, atual = 0, desenhado = -1;

    const carregar = (i) => {
      if (quadros[i]) return quadros[i];
      const img = new Image();
      img.decoding = "async";
      img.src = src(i);
      img.onload = () => { if (Math.round(atual) === i || desenhado === -1) desenhar(i, true); };
      return (quadros[i] = img);
    };

    // Carrega em passadas (1 a cada 8, depois 1 a cada 4…) para cobrir o filme inteiro cedo
    carregar(0);
    if (!reduzir) {
      const fila = [];
      for (const passo of [8, 4, 2, 1]) for (let i = 0; i < total; i += passo) if (!fila.includes(i)) fila.push(i);
      let k = 0;
      const lote = () => { for (let n = 0; n < 6 && k < fila.length; n++) carregar(fila[k++]); if (k < fila.length) setTimeout(lote, 40); };
      lote();
    }

    const pronto = (i) => quadros[i] && quadros[i].complete && quadros[i].naturalWidth;
    const maisProximo = (i) => {
      for (let d = 0; d < total; d++) {
        if (pronto(i - d)) return i - d;
        if (pronto(i + d)) return i + d;
      }
      return -1;
    };

    const ajustar = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * dpr);
      canvas.height = Math.round(canvas.clientHeight * dpr);
      desenhado = -1;
      desenhar(Math.round(atual), true);
    };

    function desenhar(i, forcar) {
      const j = maisProximo(i);
      if (j < 0 || (j === desenhado && !forcar)) return;
      const img = quadros[j];
      const cw = canvas.width, ch = canvas.height;
      const escala = Math.max(cw / img.naturalWidth, ch / img.naturalHeight); // "cover"
      const w = img.naturalWidth * escala, h = img.naturalHeight * escala;
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      desenhado = j;
    }

    const progresso = () => {
      const r = cine.getBoundingClientRect();
      const curso = cine.offsetHeight - innerHeight;
      return Math.min(1, Math.max(0, -r.top / (curso || 1)));
    };

    const atualizarMomentos = (p) => {
      for (const m of momentos) {
        const de = parseFloat(m.dataset.de || 0), ate = parseFloat(m.dataset.ate || 1);
        m.classList.toggle("ativo", p >= de && (p < ate || (ate >= 1 && p >= 1)));
      }
      cine.classList.toggle("andou", p > 0.02);
    };

    const quadro = () => {
      alvo = progresso() * (total - 1);
      atual += (alvo - atual) * 0.18; // suaviza: sensação de filme, não de slide
      if (Math.abs(alvo - atual) < 0.05) atual = alvo;
      desenhar(Math.round(atual));
      atualizarMomentos(atual / (total - 1));
      requestAnimationFrame(quadro);
    };

    addEventListener("resize", ajustar);
    ajustar();
    if (reduzir) atualizarMomentos(0);
    else requestAnimationFrame(quadro);
  }

  /* ── Parallax leve nas artes ──────────────────────────────────────────── */
  const artes = reduzir ? [] : [...document.querySelectorAll(".arte")];
  if (artes.length) {
    const mover = () => {
      for (const a of artes) {
        const r = a.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) continue;
        const c = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        a.style.transform = `translate3d(0, ${Math.max(-30, Math.min(30, c * -40)).toFixed(1)}px, 0)`;
      }
    };
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    mover();
  }

  /* ── Portfólio e depoimentos (vêm do config.js; campos vazios não aparecem) ── */
  const esc = (t) => String(t || "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const tem = (t) => String(t || "").trim().length > 0;
  const depoimentos = (S.depoimentos || []).filter((d) => tem(d.texto));

  const boxCasos = document.querySelector("[data-portfolio]");
  const casos = (S.portfolio || []).filter((c) => tem(c.projeto));
  if (boxCasos) {
    if (!casos.length) document.getElementById("portfolio")?.remove();
    boxCasos.innerHTML = casos.map((c) => {
      const campos = [["Conceito", c.conceito], ["Significado", c.significado], ["Resultado", c.resultado]].filter(([, v]) => tem(v));
      const imgs = (c.imagens || []).filter(tem);
      const fala = depoimentos.find((d) => tem(d.cliente) && d.cliente.trim().toLowerCase() === c.projeto.trim().toLowerCase());
      return `<article class="painel caso revelar${imgs.length ? " com-imagens" : ""}">
        <div>
          ${tem(c.tipo) ? `<span class="caso-tipo">${esc(c.tipo)}</span>` : ""}
          <h3>${esc(c.projeto)}</h3>
          ${campos.length ? `<dl>${campos.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join("")}</dl>` : ""}
          ${fala ? `<blockquote>“${esc(fala.texto)}”</blockquote>` : ""}
        </div>
        ${imgs.length ? `<div class="caso-galeria">${imgs.map((f, i) => `<img src="assets/portfolio/${esc(f)}" alt="${esc(c.projeto)}, imagem ${i + 1} do projeto" loading="lazy">`).join("")}</div>` : ""}
      </article>`;
    }).join("");
  }

  // Depoimento já citado num estudo de caso não se repete na seção de depoimentos
  const nomesCasos = new Set(casos.map((c) => c.projeto.trim().toLowerCase()));
  const soltos = depoimentos.filter((d) => !nomesCasos.has(String(d.cliente || "").trim().toLowerCase()));
  const boxDepo = document.querySelector("[data-depoimentos]");
  if (boxDepo) {
    if (!soltos.length) document.querySelector("[data-secao-depoimentos]")?.remove();
    boxDepo.innerHTML = soltos.map((d) => `<figure class="painel depo revelar">
      <blockquote>${esc(d.texto)}</blockquote>
      <figcaption>${tem(d.cliente) ? `<strong>${esc(d.cliente)}</strong>` : ""}${tem(d.detalhe) ? esc(d.detalhe) : ""}</figcaption>
    </figure>`).join("");
  }

  // Renumera os rótulos (01, 02…) caso alguma seção tenha saído por estar vazia
  document.querySelectorAll("main .rotulo").forEach((r, i) => {
    r.textContent = r.textContent.replace(/^\d+/, String(i + 1).padStart(2, "0"));
  });

  /* ── Método ─────────────────────────────────────────────────────────────
     Computador: a seção fica parada e a rodinha do mouse desliza os cartões.
     Celular/toque: os cartões deslizam com o dedo, na horizontal. */
  const metodo = document.querySelector(".metodo");
  if (metodo) {
    const trilho = metodo.querySelector(".metodo-trilho");
    const janela = metodo.querySelector(".metodo-janela");
    const etapas = [...metodo.querySelectorAll(".etapa")];
    const barra = metodo.querySelector(".metodo-progresso");
    const modoToque = matchMedia("(max-width: 860px), (hover: none) and (pointer: coarse)");
    let dist = 0;
    const marcar = (p) => {
      if (barra) barra.style.setProperty("--p", p.toFixed(3));
      const ativa = Math.round(p * (etapas.length - 1));
      etapas.forEach((e, i) => e.classList.toggle("ativa", i === ativa));
    };
    const guiado = () => metodo.classList.contains("metodo--guiado");
    const mover = () => {
      if (!guiado()) return;
      const andado = -metodo.getBoundingClientRect().top;
      const p = Math.min(1, Math.max(0, andado / (dist || 1)));
      trilho.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      marcar(p);
    };
    // Altura da seção = uma tela + o quanto o trilho precisa andar + uma pausa no último cartão
    const medir = () => {
      const usarGuiado = !reduzir && !modoToque.matches;
      metodo.classList.toggle("metodo--guiado", usarGuiado);
      if (usarGuiado) {
        dist = Math.max(0, trilho.scrollWidth - innerWidth);
        metodo.style.height = `${Math.round(innerHeight + dist * 1.15 + innerHeight * 0.3)}px`;
        mover();
      } else {
        metodo.style.height = "";
        trilho.style.transform = "";
        aoDeslizar();
      }
    };
    // No modo toque, a barra e o cartão em destaque acompanham o dedo
    const aoDeslizar = () => {
      if (guiado()) return;
      const max = janela.scrollWidth - janela.clientWidth;
      marcar(max > 0 ? janela.scrollLeft / max : 0);
    };
    janela.addEventListener("scroll", () => requestAnimationFrame(aoDeslizar), { passive: true });
    addEventListener("scroll", () => requestAnimationFrame(mover), { passive: true });
    addEventListener("resize", medir);
    addEventListener("load", medir);
    if (modoToque.addEventListener) modoToque.addEventListener("change", medir);
    if (document.fonts) document.fonts.ready.then(medir);
    medir();
  }

  /* ── Topo, revelar e ano ──────────────────────────────────────────────── */
  const topo = document.querySelector(".topo");
  const whats = document.querySelector(".whats");
  let formNaTela = false; // o botão flutuante se recolhe para não cobrir o "Enviar"
  const aoRolar = () => {
    topo && topo.classList.toggle("rolou", scrollY > 40);
    whats && whats.classList.toggle("visivel", scrollY > innerHeight * 0.6 && !formNaTela);
  };
  const formEl = document.querySelector(".form");
  if (formEl) new IntersectionObserver(([e]) => { formNaTela = e.isIntersecting; aoRolar(); }).observe(formEl);
  addEventListener("scroll", aoRolar, { passive: true });
  aoRolar();

  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visto"); io.unobserve(e.target); }
  }), { threshold: 0.18 });
  document.querySelectorAll(".revelar").forEach((el) => io.observe(el));
  document.querySelectorAll("[data-ano]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ── WhatsApp ─────────────────────────────────────────────────────────── */
  if (whats && S.whatsapp) {
    const num = String(S.whatsapp.numero || "").replace(/\D/g, "");
    whats.href = `https://wa.me/${num}?text=${encodeURIComponent(S.whatsapp.mensagem || "")}`;
    document.querySelectorAll("[data-whats-link]").forEach((a) => { a.href = whats.href; a.target = "_blank"; a.rel = "noopener"; });
  }

  /* ── Formulário → e-mail ──────────────────────────────────────────────── */
  const form = document.querySelector(".form");
  if (form && S.contato) {
    const status = form.querySelector(".form-status");
    const botao = form.querySelector("button[type=submit]");
    const avisar = (txt, tipo) => { status.textContent = txt; status.className = `form-status campo--inteiro ${tipo || ""}`; };

    form.addEventListener("submit", async (ev) => {
      ev.preventDefault();
      if (form.elements._honey.value) return; // robô
      let valido = true;
      form.querySelectorAll("[required]").forEach((c) => {
        const ok = c.type === "email" ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.value) : c.value.trim().length > 1;
        c.closest(".campo").classList.toggle("erro", !ok);
        if (!ok) valido = false;
      });
      if (!valido) return avisar("Confira os campos destacados.", "falha");

      const dados = Object.fromEntries(new FormData(form));
      delete dados._honey;
      const assunto = S.contato.assunto || `Novo contato pelo site ${S.nome || ""}`;
      let url, corpo;
      if (S.contato.web3formsChave) {
        url = "https://api.web3forms.com/submit";
        corpo = { access_key: S.contato.web3formsChave, subject: assunto, from_name: S.nome, ...dados };
      } else {
        url = `https://formsubmit.co/ajax/${encodeURIComponent(S.contato.email)}`;
        corpo = { _subject: assunto, _template: "table", _captcha: "false", ...dados };
      }

      botao.disabled = true;
      avisar("Enviando…");
      try {
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(corpo),
        });
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j.success === false || j.success === "false") throw new Error(j.message || r.status);
        form.reset();
        avisar("Recebemos seu contato. Em breve falamos com você.", "ok");
      } catch (e) {
        console.warn("Falha no envio do formulário:", e);
        avisar("Não foi possível enviar agora. Chame a gente no WhatsApp.", "falha");
      } finally {
        botao.disabled = false;
      }
    });
  }
})();
