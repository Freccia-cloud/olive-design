/*
  CONFIGURAÇÃO DO SITE OLIVE DESIGN
  Edite só o que está entre aspas. Salve o arquivo e recarregue a página.
*/
window.SITE = {
  nome: "Olive Design",

  whatsapp: {
    numero: "5548988481634", // só dígitos: 55 + DDD + número
    mensagem: "Olá, Olive! Vi o site da Olive Design e quero conversar sobre a identidade visual da minha marca.",
  },

  contato: {
    email: "desenvolvimento.olv@gmail.com",
    // Opcional: chave do Web3Forms (https://web3forms.com). Se vazio, usa FormSubmit.
    web3formsChave: "",
    assunto: "Novo contato pelo site Olive Design",
  },

  frames: {
    total: 128,
    desktop: "assets/frames/desktop/f_{n}.webp",
    mobile: "assets/frames/mobile/f_{n}.webp",
  },

  /*
    DEPOIMENTOS
    Preencha "texto" e "cliente". Depoimento com texto vazio não aparece no site.
    Para incluir mais, copie uma linha { ... }, inteira, e cole abaixo.
  */
  depoimentos: [
    { texto: "O resultado ficou ainda mais bonito do que eu imaginava e representa perfeitamente a essência da nossa marca.", cliente: "Casa Santos", detalhe: "Identidade visual" },
    { texto: "", cliente: "", detalhe: "" },
    { texto: "", cliente: "", detalhe: "" },
    { texto: "", cliente: "", detalhe: "" },
    { texto: "", cliente: "", detalhe: "" },
  ],

  /*
    PORTFÓLIO (estudos de caso)
    Campos vazios não aparecem. Imagens: coloque os arquivos em site/assets/portfolio/
    e escreva o nome deles na lista "imagens", ex.: ["casa-santos-1.webp", "casa-santos-2.webp"].
    Use imagens com fundo escuro ou mockups; a primeira aparece maior.
  */
  portfolio: [
    {
      projeto: "Casa Santos",
      tipo: "Identidade visual estratégica",
      conceito: "",
      significado: "",
      resultado: "",
      imagens: [],
    },
  ],
};
