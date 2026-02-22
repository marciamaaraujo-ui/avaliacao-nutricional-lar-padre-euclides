/* =====================================================
   SISTEMA DE GESTÃO NUTRICIONAL ILPI
   VERSÃO INSTITUCIONAL COMPLETA
===================================================== */

/* ================= BANCO DE DADOS ================= */

function obterBanco() {
    return JSON.parse(localStorage.getItem("bancoILPI")) || {};
}

function salvarBanco(banco) {
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

/* ================= FUNÇÕES AUXILIARES ================= */

function getNum(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    return parseFloat((el.value || "").replace(",", ".")) || 0;
}

/* ================= ICN ================= */

function calcularICN(mna, nrs, imc) {

    let scoreIMC = 0;
    if (imc < 22) scoreIMC = 0;
    else if (imc <= 27) scoreIMC = 1;
    else scoreIMC = 2;

    const icn = (mna * 0.4) + (nrs * 0.4) + (scoreIMC * 2);

    let classificacao = "Baixo Risco";
    if (icn < 8) classificacao = "Alto Risco Clínico";
    else if (icn < 13) classificacao = "Risco Moderado";

    return { icn: icn.toFixed(2), classificacao };
}

/* ================= SALVAR AVALIAÇÃO ================= */

function salvarAvaliacao(nome, dados) {

    if (!nome) return alert("Nome obrigatório.");

    const banco = obterBanco();

    if (!banco[nome]) {
        banco[nome] = {
            avaliacoes: [],
            exames: [],
            comorbidades: []
        };
    }

    banco[nome].avaliacoes.push(dados);
    salvarBanco(banco);
}

/* ================= INDICADORES INSTITUCIONAIS ================= */

function calcularIndicadoresILPI() {

    const banco = obterBanco();

    let total = 0;
    let alto = 0;
    let moderado = 0;
    let baixoPeso = 0;
    let somaIMC = 0;
    let totalIMC = 0;

    Object.keys(banco).forEach(nome => {

        const avs = banco[nome].avaliacoes;
        if (!avs || avs.length === 0) return;

        total++;

        const ultima = avs[avs.length - 1];

        const imc = parseFloat(ultima.imc) || 0;

        if (imc > 0) {
            somaIMC += imc;
            totalIMC++;
            if (imc < 22) baixoPeso++;
        }

        if (ultima.classificacaoICN === "Alto Risco Clínico") alto++;
        if (ultima.classificacaoICN === "Risco Moderado") moderado++;

    });

    return {
        total,
        alto,
        moderado,
        baixoPeso,
        mediaIMC: totalIMC > 0 ? somaIMC / totalIMC : 0
    };
}

/* ================= RELATÓRIO PDF INDIVIDUAL ================= */

function gerarPDFResidente(nome) {

    const banco = obterBanco();

    if (!banco[nome] || !banco[nome].avaliacoes.length) {
        alert("Sem avaliação registrada.");
        return;
    }

    const ultima = banco[nome].avaliacoes.slice(-1)[0];

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text("RELATÓRIO NUTRICIONAL INDIVIDUAL", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text("Residente: " + nome, 20, 40);
    doc.text("Data: " + (ultima.data || "-"), 20, 48);
    doc.text("IMC: " + (ultima.imc || "-"), 20, 56);
    doc.text("Classificação ICN: " + (ultima.classificacaoICN || "-"), 20, 64);

    doc.text("Diagnóstico (PES):", 20, 80);
    const texto = doc.splitTextToSize(ultima.parecerPES || "-", 170);
    doc.text(texto, 20, 88);

    doc.save("Relatorio_" + nome + ".pdf");
}

/* ================= EXPORTAR CSV ================= */

function exportarParaCSV() {

    const banco = obterBanco();
    let linhas = "Nome,Data,IMC,ICN,Classificação\n";

    Object.keys(banco).forEach(nome => {

        const avs = banco[nome].avaliacoes;
        if (!avs || avs.length === 0) return;

        const u = avs[avs.length - 1];

        linhas += `${nome},${u.data || ""},${u.imc || ""},${u.icn || ""},${u.classificacaoICN || ""}\n`;
    });

    const blob = new Blob([linhas], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "Indicadores_ILPI.csv";
    a.click();
}
