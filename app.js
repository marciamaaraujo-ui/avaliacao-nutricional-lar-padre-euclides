/* GESTÃO DE DADOS */
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

/* CÁLCULOS ANTROPOMÉTRICOS */
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

function estimarAltura(aj, idade, sexo) {
    let estaturaCm = 0;
    if (sexo === "M") {
        estaturaCm = (64.19 - (0.04 * idade)) + (2.02 * aj);
    } else {
        estaturaCm = (84.88 - (0.24 * idade)) + (1.83 * aj);
    }
    return estaturaCm / 100; // Retorna em metros
}

function ajustarCP(cp, imc) {
    if (imc < 25.0) return cp;
    if (imc <= 29.9) return cp - 3;
    if (imc <= 39.9) return cp - 7;
    return cp - 12;
}

function ajustarCB(cb, imc, sexo) {
    if (imc < 25.0) return cb;
    if (imc <= 29.9) return (sexo === "F") ? cb - 2 : cb - 3;
    if (imc <= 39.9) return (sexo === "F") ? cb - 6 : cb - 7;
    return (sexo === "F") ? cb - 9 : cb - 10;
}

/* LÓGICA MNA E DIAGNÓSTICO */
function classificarScoreIMC_MNA(imc) {
    if (imc < 19) return 0;
    if (imc < 21) return 1;
    if (imc < 23) return 2;
    return 3;
}

function calcularSomaMNA() {
    const ids = ["mna_a", "mna_b", "mna_f"];
    let soma = 0;
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) soma += parseFloat(el.value) || 0;
    });
    return soma;
}

function classificarICN(icn) {
    if (icn >= 13) return "Baixo Risco";
    if (icn >= 8) return "Risco Moderado";
    return "Alto Risco Clínico";
}

function gerarParecerPES(sIcn, imc, cpAdj, sexo, mna) {
    let P = sIcn.includes("Alto") ? "Desnutrição (P)" : "Risco de desnutrição (P)";
    let E = "relacionado à institucionalização (E)";
    let S = `evidenciado por ICN: ${sIcn}, IMC: ${imc.toFixed(2)}kg/m²`;
    const limite = (sexo === "M") ? 34 : 33;
    if (cpAdj < limite) S += ` e baixa massa muscular (CP Adj: ${cpAdj.toFixed(1)}cm)`;
    return P + ", " + E + ", " + S + " (S).";
}

function getNum(id) { 
    const el = document.getElementById(id);
    return el ? parseFloat(el.value.replace(',', '.')) || 0 : 0; 
}
