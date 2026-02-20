/* ============================================================
   FÓRMULAS DE CLASSIFICAÇÃO (MNA e NRS conforme anexos)
   ============================================================ */

function classificarMNA(mna) {
    if (mna >= 24) return "Estado Nutricional Normal";
    if (mna >= 17) return "Risco de Desnutrição";
    return "Desnutrido";
}

function classificarNRS(nrs) {
    return nrs >= 3 ? "Risco Nutricional" : "Sem Risco Nutricional";
}

function classificarIMC(imc) {
    if (imc < 22) return "Desnutrição";
    if (imc <= 27) return "Eutrofia";
    return "Excesso de Peso";
}

/* ============================================================
   ANTROPOMETRIA E AJUSTES (Prado et al. 2022)
   ============================================================ */

function estimarAltura(aj, idade, sexo) {
    // Fórmulas de Chumlea
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

/* ============================================================
   ICN E DIAGNÓSTICO PES AUTOMÁTICO
   ============================================================ */

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
    let P = ""; 
    let E = "relacionado à senescência e institucionalização"; 
    let S = `evidenciado por MNA: ${sMna}, NRS: ${sNrs}, IMC: ${imc.toFixed(2)}kg/m²`; 

    if (sIcn === "Alto Risco Clínico") P = "Desnutrição Proteico-Calórica (P)";
    else if (sIcn === "Risco Moderado") P = "Risco Nutricional Moderado (P)";
    else P = "Estado Nutricional Preservado (P)";

    let sarcopenia = "";
    if ((sexo === "F" && cpAdj < 33) || (sexo === "M" && cpAdj < 34)) {
        sarcopenia = ` e sinais de redução de reserva muscular (CP ajustada: ${cpAdj.toFixed(1)}cm)`;
    }

    return `${P}, ${E} (E), ${S}${sarcopenia} (S). Conduta: Iniciar/Manter suporte conforme protocolo ILPI.`;
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

function getNum(id) { return parseFloat(document.getElementById(id).value.replace(',', '.')) || 0; }
