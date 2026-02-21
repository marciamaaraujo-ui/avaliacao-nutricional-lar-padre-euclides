/* ==========================================================================
   1. GESTÃO DE DADOS (LocalStorage)
   ========================================================================== */
function obterBanco() { 
    return JSON.parse(localStorage.getItem("bancoILPI")) || {}; 
}

function salvarBanco(banco) { 
    localStorage.setItem("bancoILPI", JSON.stringify(banco)); 
}

function salvarAvaliacao(nome, avaliacao) {
    const banco = obterBanco();
    if (!banco[nome]) {
        banco[nome] = { perfil: {}, avaliacoes: [], exames: [], comorbidades: [] };
    }
    banco[nome].avaliacoes.push(avaliacao);
    salvarBanco(banco);
}

/* ==========================================================================
   2. FÓRMULAS ANTROPOMÉTRICAS E AJUSTES CIENTÍFICOS
   ========================================================================== */

/**
 * Cálculo automático da idade
 */
function calcularIdade(dataString) {
    if (!dataString) return 0;
    const nasc = new Date(dataString);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) {
        idade--;
    }
    return idade;
}

/**
 * Estimativa de Altura pela Altura do Joelho (AJ)
 */
function estimarAltura(aj, idade, sexo) {
    if (sexo === "M") return (64.19 - (0.04 * idade) + (2.02 * aj)) / 100;
    return (84.88 - (0.24 * idade) + (1.83 * aj)) / 100;
}

/**
 * Ajuste da Circunferência da Panturrilha (CP) p/ Idosos e Clínicos
 * Fonte: Prado et al. (2022) [cite_start][cite: 33, 48, 113-118]
 */
function ajustarCP(cp, imc) {
    if (imc < 25.0) return cp;           [cite_start]// Uso original [cite: 38, 39]
    if (imc <= 29.9) return cp - 3;      [cite_start]// [cite: 41, 114, 115]
    if (imc <= 39.9) return cp - 7;      [cite_start]// [cite: 44, 116, 117]
    return cp - 12;                      [cite_start]// [cite: 45, 118]
}

/**
 * Ajuste da Circunferência do Braço (CB) p/ Populações Idosas
 * Fonte: NHANES 1999-2006
 */
function ajustarCB(cb, imc, sexo) {
    if (imc < 25) return cb;             // Uso original
    if (imc < 30) return (sexo === "F") ? cb - 2 : cb - 3; //
    if (imc < 40) return (sexo === "F") ? cb - 6 : cb - 7; //
    return (sexo === "F") ? cb - 9 : cb - 10;            //
}

/* ==========================================================================
   3. PROTOCOLOS DE TRIAGEM (MNA, NRS, ICN)
   ========================================================================== */

function calcularSomaNRS(idade) {
    const status = parseFloat(document.getElementById("nrs_status").value) || 0;
    const gravidade = parseFloat(document.getElementById("nrs_gravidade").value) || 0;
    let total = status + gravidade;
    // NRS 2002: Adiciona 1 ponto para idade >= 70 anos
    return idade >= 70 ? total + 1 : total;
}

function calcularICN(mna, nrs, imc) {
    [cite_start]// Score IMC baseado em Lipschitz para idosos [cite: 77-80]
    let imcScore = (imc < 22) ? 2 : (imc <= 27 ? 1 : 0);
    return (Number(mna) * 0.4) + (Number(nrs) * 0.4) + (imcScore * 2);
}

function classificarICN(icn) {
    if (icn >= 13) return "Baixo Risco";
    if (icn >= 8) return "Risco Moderado";
    return "Alto Risco Clínico";
}

function gerarParecerPES(sIcn, imc, cpAdj, sexo, mna, nrs) {
    let P = sIcn.includes("Alto") ? "Desnutrição Proteico-Calórica (P)" : (sIcn.includes("Moderado") ? "Risco de desnutrição (P)" : "Estado nutricional preservado (P)");
    let E = "relacionado à institucionalização e senescência (E)";
    let S = `evidenciado por ICN: ${sIcn}, MNA: ${mna}pts, NRS: ${nrs}pts, IMC: ${imc.toFixed(2)}kg/m²`;
    
    [cite_start]// Pontos de corte CP: 34cm (M) e 33cm (F) [cite: 112, 141]
    const limite = (sexo === "M") ? 34 : 33; 
    if (cpAdj < limite) S += ` e baixa reserva muscular (CP ajustada: ${cpAdj.toFixed(1)}cm)`;
    
    return `${P}, ${E}, ${S} (S). Conduta: Suporte Nutricional conforme protocolo.`;
}

function getNum(id) { 
    const el = document.getElementById(id);
    return el ? parseFloat(el.value.replace(',', '.')) || 0 : 0; 
}
