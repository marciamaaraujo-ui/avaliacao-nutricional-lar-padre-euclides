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
 * Estatura Estimada (Chumlea et al., 1985)
 */
function estimarAltura(aj, idade, sexo) {
    let estaturaCm = 0;
    if (sexo === "M") {
        estaturaCm = (64.19 - (0.04 * idade)) + (2.02 * aj);
    } else {
        estaturaCm = (84.88 - (0.24 * idade)) + (1.83 * aj);
    }
    return estaturaCm / 100; // Converte para metros
}

/**
 * Ajuste da Circunferência da Panturrilha (CP) 
 * Fonte: Prado et al. (2022)
 */
function ajustarCP(cp, imc) {
    if (imc < 25.0) return cp;
    if (imc <= 29.9) return cp - 3;
    if (imc <= 39.9) return cp - 7;
    return cp - 12;
}

/**
 * Ajuste da Circunferência do Braço (CB)
 * Fonte: NHANES 1999-2006
 */
function ajustarCB(cb, imc, sexo) {
    if (imc < 25.0) return cb;
    if (imc <= 29.9) return (sexo === "F") ? cb - 2 : cb - 3;
    if (imc <= 39.9) return (sexo === "F") ? cb - 6 : cb - 7;
    return (sexo === "F") ? cb - 9 : cb - 10;
}

/* ==========================================================================
   3. PROTOCOLOS DE TRIAGEM
   ========================================================================== */

function calcularSomaMNA() {
    const ids = ["mna_a", "mna_b", "mna_f"]; // IDs dos selects visíveis
    let soma = 0;
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) soma += parseFloat(el.value) || 0;
    });
    return soma;
}

function calcularSomaNRS(idade) {
    // NRS 2002 simplificado: +1 ponto para idade >= 70
    return idade >= 70 ? 1 : 0;
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

function gerarParecerPES(sIcn, imc, cpAdj, sexo, mna, nrs) {
    let P = sIcn.includes("Alto") ? "Desnutrição (P)" : "Risco de desnutrição (P)";
    let E = "relacionado à institucionalização (E)";
    let S = `evidenciado por ICN: ${sIcn}, IMC: ${imc.toFixed(2)}kg/m²`;
    const limite = (sexo === "M") ? 34 : 33;
    if (cpAdj < limite) S += ` e baixa reserva muscular (CP Adj: ${cpAdj.toFixed(1)}cm)`;
    return `${P}, ${E}, ${S} (S).`;
}

function getNum(id) { 
    const el = document.getElementById(id);
    if (!el) return 0;
    return parseFloat(el.value.replace(',', '.')) || 0; 
}
