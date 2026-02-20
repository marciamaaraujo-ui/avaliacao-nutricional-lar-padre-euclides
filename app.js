/* BANCO DE DADOS */
function obterBanco() { return JSON.parse(localStorage.getItem("bancoILPI")) || {}; }
function salvarBanco(banco) { localStorage.setItem("bancoILPI", JSON.stringify(banco)); }

function salvarAvaliacao(nome, avaliacao) {
    const banco = obterBanco();
    if (!banco[nome]) banco[nome] = { avaliacoes: [], exames: [] };
    banco[nome].avaliacoes.push(avaliacao);
    salvarBanco(banco);
}

function salvarExame(nome, exame) {
    const banco = obterBanco();
    if (!banco[nome]) banco[nome] = { avaliacoes: [], exames: [] };
    banco[nome].exames.push(exame);
    salvarBanco(banco);
}

/* FÓRMULAS */
function calcularIdade(data) {
    if (!data) return 0;
    const nasc = new Date(data);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() == nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
}

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

function gerarParecerPES(sIcn, imc, cpAdj, sexo, mna, nrs) {
    let P = sIcn.includes("Alto") ? "Desnutrição Proteico-Calórica (P)" : (sIcn.includes("Moderado") ? "Risco de desnutrição (P)" : "Estado nutricional preservado (P)");
    let E = "relacionado à institucionalização e senescência (E)";
    let S = `evidenciado por ICN: ${sIcn}, MNA: ${mna}pts, NRS: ${nrs}pts, IMC: ${imc.toFixed(2)}kg/m²`;
    if ((sexo === "F" && cpAdj < 33) || (sexo === "M" && cpAdj < 34)) S += ` e baixa reserva muscular (CP ajustada: ${cpAdj.toFixed(1)}cm)`;
    return `${P}, ${E}, ${S} (S). Conduta: Suporte Nutricional conforme protocolo do Lar.`;
}

function getNum(id) { return parseFloat(document.getElementById(id).value.replace(',', '.')) || 0; }
