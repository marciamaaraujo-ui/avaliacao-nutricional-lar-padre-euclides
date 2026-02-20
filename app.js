/* ============================================================
   LÓGICA DE PONTUAÇÃO AUTOMÁTICA - MNA & NRS-2002
   ============================================================ */

function calcularSomaMNA() {
    // Triagem (A-F)
    const a = getNum("mna_a");
    const b = getNum("mna_b");
    const c = getNum("mna_c");
    const d = getNum("mna_d");
    const e = getNum("mna_e");
    const f = getNum("mna_f"); // Pontos baseados no IMC

    // Avaliação Global (G-R)
    const g = getNum("mna_g");
    const h = getNum("mna_h");
    const i = getNum("mna_i");
    const j = getNum("mna_j");
    const k = getNum("mna_k");
    const l = getNum("mna_l");
    const m = getNum("mna_m");
    const n = getNum("mna_n");
    const o = getNum("mna_o");
    const p = getNum("mna_p");
    const q = getNum("mna_q");
    const r = getNum("mna_r");

    return a + b + c + d + e + f + g + h + i + j + k + l + m + n + o + p + q + r;
}

function calcularSomaNRS(idade) {
    const status = getNum("nrs_status");
    const gravidade = getNum("nrs_gravidade");
    let total = status + gravidade;
    if (idade >= 70) total += 1;
    return total;
}

/* ============================================================
   FÓRMULAS ANTROPOMÉTRICAS E AJUSTES
   ============================================================ */

function estimarAltura(aj, idade, sexo) {
    if (sexo === "M") return (64.19 - (0.04 * idade) + (2.02 * aj)) / 100;
    return (84.88 - (0.24 * idade) + (1.83 * aj)) / 100;
}

function ajustarCP(cp, imc) {
    if (imc < 25) return cp;
    if (imc < 30) return cp - 3;
    if (imc < 40) return cp - 7;
    return cp - 12;
}

function ajustarCB(cb, imc, sexo) {
    if (imc < 25) return cb; 
    if (imc < 30) return (sexo === "F") ? cb - 2 : cb - 3; 
    if (imc < 40) return (sexo === "F") ? cb - 6 : cb - 7;
    return (sexo === "F") ? cb - 9 : cb - 10;
}

function classificarIMC(imc) {
    if (imc < 22) return "Desnutrição";
    if (imc <= 27) return "Eutrofia";
    return "Excesso de Peso";
}

function classificarMNA(total) {
    if (total >= 24) return "Estado Nutricional Normal";
    if (total >= 17) return "Risco de Desnutrição";
    return "Desnutrido";
}

function classificarNRS(total) {
    return total >= 3 ? "Risco Nutricional" : "Sem Risco Nutricional";
}

function calcularICN(mna, nrs, imc) {
    let imcScore = (imc < 22) ? 2 : (imc <= 27 ? 1 : 0);
    return (Number(mna) * 0.4) + (Number(nrs) * 0.4) + (imcScore * 2);
}

function classificarICN(icn) {
    if (icn >= 13) return "Baixo Risco";
    if (icn >= 8) return "Risco Moderado";
    return "Alto Risco Clínico";
}

function gerarParecerPES(sMna, sNrs, sIcn, imc, cpAdj, sexo) {
    let P = (sIcn === "Alto Risco Clínico") ? "Desnutrição Proteico-Calórica (P)" : (sIcn === "Risco Moderado" ? "Risco de desnutrição (P)" : "Estado nutricional preservado (P)");
    let E = "relacionado à senescência e possivel redução da ingesta alimentar (E)";
    let S = `evidenciado por MNA: ${sMna}, NRS: ${sNrs}, IMC: ${imc.toFixed(2)}kg/m²`;
    if ((sexo === "F" && cpAdj < 33) || (sexo === "M" && cpAdj < 34)) S += ` e baixa reserva muscular (CP ajustada: ${cpAdj.toFixed(1)}cm)`;
    return `${P}, ${E}, ${S} (S). Conduta: Suporte Nutricional conforme protocolo do Lar.`;
}

/* ============================================================
   BANCO DE DADOS E UTILITÁRIOS
   ============================================================ */
function obterBanco() { return JSON.parse(localStorage.getItem("bancoILPI")) || {}; }
function salvarBanco(banco) { localStorage.setItem("bancoILPI", JSON.stringify(banco)); }
function salvarAvaliacao(nome, avaliacao) {
    const banco = obterBanco();
    if (!banco[nome]) banco[nome] = { avaliacoes: [], exames: [] };
    banco[nome].avaliacoes.push(avaliacao);
    salvarBanco(banco);
}
function calcularIdade(data) {
    if (!data) return 0;
    const nasc = new Date(data);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() == nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
}
function getNum(id) {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value.replace(',', '.')) || 0 : 0;
}
