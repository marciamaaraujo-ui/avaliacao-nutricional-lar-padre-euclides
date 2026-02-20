/* ============================================================
   LÓGICA DO DIAGNÓSTICO PES AUTOMÁTICO
   ============================================================ */
function gerarParecerPES(statusIcn, imc, cpAdj, mna, nrs, sexo) {
    let P = ""; // Problema
    let E = "relacionado à senescência e possível redução da ingesta alimentar"; // Etiologia padrão para ILPI
    let S = `evidenciado por ICN de ${statusIcn}, IMC de ${imc.toFixed(2)} kg/m²`; // Sinais/Sintomas

    // Definição do Problema (P)
    if (statusIcn.includes("Alto Risco")) {
        P = "Desnutrição proteico-calórica ou Risco Nutricional Grave (P)";
    } else if (statusIcn.includes("Moderado")) {
        P = "Risco de desnutrição moderado (P)";
    } else {
        P = "Estado nutricional preservado (P)";
        E = "relacionado à manutenção de hábitos saudáveis";
    }

    // Adição de Sarcopenia aos Sinais (S)
    let sarcopenia = "";
    if ((sexo === "F" && cpAdj < 33) || (sexo === "M" && cpAdj < 34)) {
        sarcopenia = ` e provável redução de massa muscular (CP ajustada: ${cpAdj.toFixed(1)} cm)`;
    }

    return `${P}, ${E} (E), ${S}${sarcopenia} (S). Conduta: Iniciar/Manter monitoramento e suporte conforme protocolo do Lar Padre Euclides.`;
}

/* ============================================================
   FÓRMULAS E BANCO DE DADOS (Inalterados)
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

function calcularICN(mna, nrs, imc) {
    let imcScore = (imc < 22) ? 2 : (imc <= 27 ? 1 : 0);
    return (Number(mna) * 0.4) + (Number(nrs) * 0.4) + (imcScore * 2);
}

function classificarICN(icn) {
    if (icn >= 18) return "Estado Normal"; // Ajuste de lógica conforme score máximo
    if (icn >= 12) return "Risco Moderado";
    return "Alto Risco Clínico";
}

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
