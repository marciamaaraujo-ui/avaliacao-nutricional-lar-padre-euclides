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
 * Cálculo da idade cronológica
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
 * Estatura Estimada (Chumlea et al., 1985)
 * Homens: Estatura (cm) = [64,19 – (0,04 x idade)] + (2,02 x AJ)
 * Mulheres: Estatura (cm) = [84,88 – (0,24 x idade)] + (1,83 x AJ)
 */
function estimarAltura(aj, idade, sexo) {
    let estaturaCm = 0;
    if (sexo === "M") {
        estaturaCm = (64.19 - (0.04 * idade)) + (2.02 * aj);
    } else {
        estaturaCm = (84.88 - (0.24 * idade)) + (1.83 * aj);
    }
    return estaturaCm / 100; // Retorna o valor em metros
}

/**
 * Ajuste da Circunferência da Panturrilha (CP) 
 * Fonte: Prado et al. (2022) - Aging/Clinical Populations 
 */
function ajustarCP(cp, imc) {
    if (imc < 25.0) return cp;           // <18.5 e 18.5-24.9: Valor original [cite: 38, 39]
    if (imc <= 29.9) return cp - 3;      // 25-29.9: -3 cm [cite: 41]
    if (imc <= 39.9) return cp - 7;      // 30-39.9: -7 cm [cite: 44]
    return cp - 12;                      // >= 40: -12 cm [cite: 45]
}

/**
 * Ajuste da Circunferência do Braço (CB) 
 * Fonte: NHANES 1999-2006 (Aging/Clinical Populations)
 */
function ajustarCB(cb, imc, sexo) {
    if (imc < 25.0) return cb;           // <18.5 e 18.5-24.9: Valor original
    if (imc <= 29.9) return (sexo === "F") ? cb - 2 : cb - 3; 
    if (imc <= 39.9) return (sexo === "F") ? cb - 6 : cb - 7;
    return (sexo === "F") ? cb - 9 : cb - 10;
}

/* ==========================================================================
   3. PROTOCOLOS DE TRIAGEM (MNA, NRS, ICN)
   ========================================================================== */

function calcularSomaMNA() {
    // IDs dos campos MNA conforme o index.html
    const ids = ["mna_a", "mna_b", "mna_f"]; 
    let soma = 0;
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) soma += parseFloat(el.value) || 0;
    });
    return soma;
}

function calcularSomaNRS(idade) {
    const elStatus = document.getElementById("nrs_status");
    const elGrav = document.getElementById("nrs_gravidade");
    const status = elStatus ? parseFloat(elStatus.value) || 0 : 0;
    const gravidade = elGrav ? parseFloat(elGrav.value) || 0 : 0;
    let total = status + gravidade;
    // NRS 2002: +1 ponto para idade >= 70 anos
    return idade >= 70 ? total + 1 : total;
}

function calcularICN(mna, nrs, imc) {
    // Score IMC (Lipschitz): <22 = 2pts, 22-27 = 1pt, >27 = 0pts
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
    let S = `evidenciado por ICN: ${sIcn}, MNA triagem: ${mna}pts, NRS: ${nrs}pts, IMC: ${imc.toFixed(2)}kg/m²`;
    
    // Pontos de corte de massa muscular específicos para sexo: 34cm (M) e 33cm (F) [cite: 112]
    const limite = (sexo === "M") ? 34 : 33;
    if (cpAdj < limite) {
        S += ` e baixa reserva muscular (CP ajustada pelo IMC: ${cpAdj.toFixed(1)}cm)`;
    }
    
    return `${P}, ${E}, ${S} (S). Conduta: Suporte Nutricional conforme protocolo institucional.`;
}

function getNum(id) { 
    const el = document.getElementById(id);
    return el ? parseFloat(el.value.replace(',', '.')) || 0 : 0; 
}
