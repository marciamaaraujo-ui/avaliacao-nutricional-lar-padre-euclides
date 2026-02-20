/* =========================
   BANCO CENTRAL
========================= */
function obterBanco() {
    return JSON.parse(localStorage.getItem("bancoILPI")) || {};
}

function salvarBanco(banco) {
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

/* =========================
   CÁLCULOS E CLASSIFICAÇÕES
========================= */
function calcularIdade(data) {
    if (!data) return 0;
    const nasc = new Date(data);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || 
       (hoje.getMonth() == nasc.getMonth() && hoje.getDate() < nasc.getDate())) {
        idade--;
    }
    return idade;
}

function classificarIMC(imc) {
    if (imc < 22) return "Desnutrição";
    if (imc <= 27) return "Eutrofia";
    return "Excesso de Peso";
}

function calcularICN(mna, nrs, imc) {
    mna = Number(mna) || 0;
    nrs = Number(nrs) || 0;
    imc = Number(imc) || 0;
    let imcScore = 0;
    if (imc < 22) imcScore = 2;
    else if (imc <= 27) imcScore = 1;

    // Sua fórmula: (MNA * 0.4) + (NRS * 0.4) + (imcScore * 2)
    return (mna * 0.4) + (nrs * 0.4) + (imcScore * 2);
}

function classificarICN(icn) {
    if (icn >= 6) return "Alto Risco Clínico";
    if (icn >= 3) return "Risco Moderado";
    return "Baixo Risco";
}

/* =========================
   SALVAMENTO INTEGRADO
========================= */
function salvarAvaliacao(nome, avaliacao) {
    const banco = obterBanco();
    if (!banco[nome]) {
        banco[nome] = { avaliacoes: [], exames: [] };
    }
    banco[nome].avaliacoes.push(avaliacao);
    salvarBanco(banco);
}

// Auxiliar para pegar números de inputs
function getNum(id) {
    let val = document.getElementById(id).value.replace(',', '.');
    return parseFloat(val) || 0;
}
