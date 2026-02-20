/* ============================================================
   FÓRMULAS E AJUSTES ANTROPOMÉTRICOS
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

/* ============================================================
   LÓGICA DE UNIFICAÇÃO MNA & NRS-2002
   ============================================================ */

function sincronizarProtocolos(imc, perdaPeso, tempoPerda, ingesta) {
    // Sincronizar MNA Questão F (IMC)
    let mnaF = 0;
    if (imc >= 23) mnaF = 3;
    else if (imc >= 21) mnaF = 2;
    else if (imc >= 19) mnaF = 1;
    document.getElementById("mna_f").value = mnaF;

    // Sincronizar NRS-2002 Status Nutricional
    let nrsStatus = 0;
    if (perdaPeso > 5) {
        if (tempoPerda <= 1) nrsStatus = 3;
        else if (tempoPerda <= 2) nrsStatus = 2;
        else if (tempoPerda <= 3) nrsStatus = 1;
    }
    document.getElementById("nrs_status").value = nrsStatus;
}

function calcularSomaMNA() {
    const ids = ["mna_a","mna_b","mna_c","mna_d","mna_e","mna_f","mna_g","mna_h","mna_i","mna_j","mna_k","mna_l","mna_m","mna_n","mna_o","mna_p","mna_q","mna_r"];
    return ids.reduce((soma, id) => soma + (parseFloat(document.getElementById(id).value) || 0), 0);
}

function calcularSomaNRS(idade) {
    const total = (parseFloat(document.getElementById("nrs_status").value) || 0) + (parseFloat(document.getElementById("nrs_gravidade").value) || 0);
    return idade >= 70 ? total + 1 : total;
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

function gerarParecerPES(mnaTotal, nrsTotal, sIcn, imc, cpAdj, sexo) {
    let P = sIcn.includes("Alto") ? "Desnutrição Proteico-Calórica (P)" : (sIcn.includes("Moderado") ? "Risco de desnutrição (P)" : "Estado nutricional preservado (P)");
    let E = "relacionado à institucionalização e senescência (E)";
    let S = `evidenciado por MNA de ${mnaTotal} pts, NRS de ${nrsTotal} pts, IMC de ${imc.toFixed(2)}kg/m²`;
    if ((sexo === "F" && cpAdj < 33) || (sexo === "M" && cpAdj < 34)) S += ` e baixa reserva muscular (CP ajustada: ${cpAdj.toFixed(1)}cm)`;
    return `${P}, ${E}, ${S} (S). Conduta: Suporte Nutricional conforme protocolo ILPI.`;
}

/* ============================================================
   UTILITÁRIOS E BANCO DE DADOS
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
