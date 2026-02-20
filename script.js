<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Avaliação Nutricional - Lar Padre Euclides</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</head>
<body>
    <div class="container">
        <header>
            <h1>Avaliação Nutricional</h1>
            <h2>Lar Padre Euclides</h2>
        </header>

        <form id="formAvaliacao">
            <section>
                <h3>Dados do Residente</h3>
                <div class="grid">
                    <input type="text" id="nome" placeholder="Nome Completo" required>
                    <input type="date" id="data" required>
                    <input type="number" id="idade" placeholder="Idade">
                </div>
            </section>

            <section>
                <h3>Antropometria</h3>
                <div class="grid">
                    <input type="text" id="peso" placeholder="Peso Atual (kg)" oninput="calcularTudo()">
                    <input type="text" id="altura" placeholder="Altura (m)" oninput="calcularTudo()">
                    <input type="text" id="pesoHab" placeholder="Peso Habitual (kg)" oninput="calcularTudo()">
                </div>
                <div class="grid-results">
                    <div>IMC: <input type="text" id="imc" readonly></div>
                    <div>Classif: <input type="text" id="classImc" readonly></div>
                    <div>Perda Peso: <input type="text" id="perda" readonly></div>
                </div>
            </section>

            <section>
                <h3>Protocolos de Triagem</h3>
                <div class="grid">
                    <div>
                        <label>MNA (Triagem + Global):</label>
                        <input type="number" id="mnaTriagem" placeholder="Pontos Triagem" oninput="calcularTudo()">
                        <input type="number" id="mnaGlobal" placeholder="Pontos Global" oninput="calcularTudo()">
                    </div>
                    <div>
                        <label>NRS-2002 (Nutri + Gravid):</label>
                        <input type="number" id="nrsNutri" placeholder="Escore Nutricional" oninput="calcularTudo()">
                        <input type="number" id="nrsGrav" placeholder="Gravidade Doença" oninput="calcularTudo()">
                    </div>
                </div>
                <div class="grid-results">
                    <div>MNA Total: <input type="text" id="mnaTotal" readonly></div>
                    <div>NRS Total: <input type="text" id="nrsTotal" readonly></div>
                </div>
            </section>

            <section>
                <h3>Conclusão Nutricional</h3>
                <div class="grid-results full">
                    <input type="text" id="mnaClass" readonly placeholder="Classificação MNA">
                    <input type="text" id="nrsClass" readonly placeholder="Classificação NRS">
                </div>
                <textarea id="parecer" rows="4" placeholder="Parecer e conduta nutricional..."></textarea>
            </section>

            <div class="actions">
                <button type="button" class="btn-save" onclick="salvarRegistro()">Salvar Avaliação</button>
                <button type="button" class="btn-pdf" onclick="gerarPDF()">Gerar Relatório PDF</button>
            </div>
        </form>
    </div>

    <script src="script.js"></script>
</body>
</html>
2. script.js
Este arquivo contém toda a inteligência do site.

JavaScript
// Função auxiliar para tratar números com vírgula e prevenir erros
function getNum(id) {
    let val = document.getElementById(id).value.replace(',', '.');
    return parseFloat(val) || 0;
}

function calcularTudo() {
    let peso = getNum("peso");
    let altura = getNum("altura");
    let pesoHab = getNum("pesoHab");
    let idade = parseInt(document.getElementById("idade").value) || 0;

    // 1. IMC para Idosos (OPAS/Saran)
    if (peso > 0 && altura > 0) {
        let imc = peso / (altura * altura);
        document.getElementById("imc").value = imc.toFixed(2);

        let classeImc = "";
        if (imc < 23) classeImc = "Baixo peso";
        else if (imc < 28) classeImc = "Eutrofia";
        else classeImc = "Sobrepeso";
        document.getElementById("classImc").value = classeImc;
    }

    // 2. Perda de Peso
    if (peso > 0 && pesoHab > 0) {
        let perda = ((pesoHab - peso) / pesoHab) * 100;
        document.getElementById("perda").value = perda.toFixed(1) + "%";
    }

    // 3. MNA
    let mnaTri = getNum("mnaTriagem");
    let mnaGlob = getNum("mnaGlobal");
    let mnaTotal = mnaTri + mnaGlob;
    document.getElementById("mnaTotal").value = mnaTotal;

    let mnaClass = "";
    if (mnaTotal >= 24) mnaClass = "Estado Normal";
    else if (mnaTotal >= 17) mnaClass = "Risco de Desnutrição";
    else mnaClass = "Desnutrição";
    document.getElementById("mnaClass").value = mnaClass;

    // 4. NRS-2002
    let nrsNutri = getNum("nrsNutri");
    let nrsGrav = getNum("nrsGrav");
    let nrsTotal = nrsNutri + nrsGrav;
    if (idade >= 70) nrsTotal += 1;
    document.getElementById("nrsTotal").value = nrsTotal;

    let nrsClass = (nrsTotal >= 3) ? "Risco Nutricional" : "Sem Risco";
    document.getElementById("nrsClass").value = nrsClass;

    gerarParecerAutomatico(mnaClass, nrsClass);
}

function gerarParecerAutomatico(mna, nrs) {
    let texto = "";
    if (mna === "Estado Normal" && nrs === "Sem Risco") {
        texto = "Residente apresenta estado nutricional preservado. Recomenda-se monitoramento trimestral.";
    } else if (mna === "Desnutrição" || (mna === "Risco de Desnutrição" && nrs === "Risco Nutricional")) {
        texto = "Alerta: Risco/Desnutrição identificado. Iniciar suplementação e monitorar aceitação alimentar.";
    } else {
        texto = "Vigilância nutricional necessária. Reavaliar em 15 dias.";
    }
    document.getElementById("parecer").value = texto;
}

async function gerarPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    const nome = document.getElementById("nome").value || "Paciente";
    
    doc.setFont("helvetica", "bold");
    doc.text("AVALIAÇÃO NUTRICIONAL - LAR PADRE EUCLIDES", 105, 20, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Residente: ${nome}`, 20, 40);
    doc.text(`Data: ${document.getElementById("data").value}`, 20, 48);
    doc.text(`IMC: ${document.getElementById("imc").value} (${document.getElementById("classImc").value})`, 20, 56);
    doc.text(`MNA Total: ${document.getElementById("mnaTotal").value} - ${document.getElementById("mnaClass").value}`, 20, 64);
    doc.text(`NRS-2002: ${document.getElementById("nrsTotal").value} - ${document.getElementById("nrsClass").value}`, 20, 72);
    
    doc.setFont("helvetica", "bold");
    doc.text("Conduta:", 20, 85);
    doc.setFont("helvetica", "normal");
    let splitText = doc.splitTextToSize(document.getElementById("parecer").value, 170);
    doc.text(splitText, 20, 93);
    
    doc.save(`Avaliacao_${nome}.pdf`);
}

function salvarRegistro() {
    let registro = {
        nome: document.getElementById("nome").value,
        data: document.getElementById("data").value,
        imc: document.getElementById("imc").value,
        parecer: document.getElementById("parecer").value
    };
    
    if(!registro.nome) return alert("Preencha o nome!");

    let lista = JSON.parse(localStorage.getItem("avaliacoes")) || [];
    lista.push(registro);
    localStorage.setItem("avaliacoes", JSON.stringify(lista));
    alert("Avaliação salva com sucesso!");
}
