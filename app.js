/* ============================================================
   FÓRMULAS DE AJUSTE - BASEADAS NOS ANEXOS
   ============================================================ */

// Estimativa de Altura (Chumlea)
function estimarAltura(aj, idade, sexo) {
    if (sexo === "M") return (64.19 - (0.04 * idade) + (2.02 * aj)) / 100;
    return (84.88 - (0.24 * idade) + (1.83 * aj)) / 100;
}

// Ajuste CP por IMC (Prado et al. 2022) [cite: 205, 214, 215, 285]
function ajustarCP(cp, imc) {
    if (imc < 25) return cp; // < 24.9: Sem ajuste [cite: 206, 211]
    if (imc < 30) return cp - 3; // 25-29.9: -3cm [cite: 206, 213, 286]
    if (imc < 40) return cp - 7; // 30-39.9: -7cm [cite: 214, 216, 288]
    return cp - 12; // >= 40: -12cm [cite: 215, 217, 290]
}

// Ajuste CB por IMC (NHANES / Prado) [cite: 326]
function ajustarCB(cb, imc, sexo) {
    if (imc < 25) return cb; 
    if (imc < 30) return (sexo === "F") ? cb - 2 : cb - 3; 
    if (imc < 40) return (sexo === "F") ? cb - 6 : cb - 7;
    return (sexo === "F") ? cb - 9 : cb - 10;
}

// Classificação IMC Idoso (Lipschitz)
function classificarIMC(imc) {
    if (imc < 22) return "Desnutrição";
    if (imc <= 27) return "Eutrofia";
    return "Excesso de Peso";
}

// Cálculo ICN Integrado
function calcularICN(mna, nrs, imc) {
    let imcScore = (imc < 22) ? 2 : (imc <= 27 ? 1 : 0);
    // Fórmula: (MNA * 0.4) + (NRS * 0.4) + (imcScore * 2)
    return (Number(mna) * 0.4) + (Number(nrs) * 0.4) + (imcScore * 2);
}

function classificarICN(icn) {
    if (icn >= 6) return "Alto Risco Clínico";
    if (icn >= 3) return "Risco Moderado";
    return "Baixo Risco";
}

/* ============================================================
   FUNÇÕES DE BANCO DE DADOS
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

function getNum(id) { return parseFloat(document.getElementById(id).value.replace(',', '.')) || 0; }
