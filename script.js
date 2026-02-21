/* ===============================
   UTILITÁRIO SEGURO
================================ */

function getNum(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const val = el.value ? el.value.replace(',', '.') : "";
    const n = parseFloat(val);
    return isNaN(n) ? 0 : n;
}

/* ===============================
   MOTOR PRINCIPAL
================================ */

function calcularTudo() {

    const peso = getNum("peso");
    const altura = getNum("altura");
    const pesoHab = getNum("pesoHab");
    const idade = parseInt(document.getElementById("idade").value) || 0;

    /* ================= IMC ================= */

    if (peso > 0 && altura > 0) {
        const imc = peso / (altura * altura);
        document.getElementById("imc").value = imc.toFixed(2);

        let classeImc = "";

        if (imc < 22) classeImc = "Baixo peso";
        else if (imc < 27) classeImc = "Eutrofia";
        else if (imc < 30) classeImc = "Sobrepeso";
        else classeImc = "Obesidade";

        document.getElementById("classImc").value = classeImc;

    } else {
        document.getElementById("imc").value = "";
        document.getElementById("classImc").value = "";
    }

    /* ================= PERDA DE PESO ================= */

    if (peso > 0 && pesoHab > 0) {

        const perda = ((pesoHab - peso) / pesoHab) * 100;
        let classPerda = "";

        if (perda > 10) classPerda = "Grave";
        else if (perda >= 5) classPerda = "Moderada";
        else classPerda = "Leve";

        document.getElementById("perda").value =
            perda.toFixed(1) + "% (" + classPerda + ")";

    } else {
        document.getElementById("perda").value = "";
    }

    /* ================= MNA ================= */

    const mnaTri = getNum("mnaTriagem");
    const mnaGlob = getNum("mnaGlobal");

    let mnaTotal = mnaTri + mnaGlob;
    document.getElementById("mnaTotal").value = mnaTotal;

    let mnaClass = "";

    if (mnaTotal >= 24) mnaClass = "Estado Normal";
    else if (mnaTotal >= 17) mnaClass = "Risco de Desnutrição";
    else mnaClass = "Desnutrição";

    document.getElementById("mnaClass").value = mnaClass;

    /* ================= NRS-2002 ================= */

    let nrsNutri = Math.min(getNum("nrsNutri"), 3);
    let nrsGrav = Math.min(getNum("nrsGrav"), 3);

    let nrsTotal = nrsNutri + nrsGrav;

    if (idade >= 70) nrsTotal += 1;

    document.getElementById("nrsTotal").value = nrsTotal;

    let nrsClass = (nrsTotal >= 3)
        ? "Risco Nutricional"
        : "Sem Risco";

    document.getElementById("nrsClass").value = nrsClass;

    gerarParecerAutomatico(mnaClass, nrsClass);
}

/* ===============================
   PARECER AUTOMÁTICO
================================ */

function gerarParecerAutomatico(mna, nrs) {

    let texto = "";

    if (mna === "Estado Normal" && nrs === "Sem Risco") {
        texto =
        "Residente apresenta estado nutricional preservado. Recomenda-se monitoramento trimestral.";

    } else if (mna === "Desnutrição" ||
              (mna === "Risco de Desnutrição" && nrs === "Risco Nutricional")) {

        texto =
        "Alerta clínico: risco ou desnutrição estabelecida. Indicar intervenção nutricional imediata, suplementação oral e reavaliação em 7 dias.";

    } else {
        texto =
        "Vigilância nutricional necessária. Reavaliar em 15 dias.";
    }

    document.getElementById("parecer").value = texto;
}

/* ===============================
   GERAR PDF PROFISSIONAL
================================ */

async function gerarPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const nome = document.getElementById("nome").value || "Paciente";

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("AVALIAÇÃO NUTRICIONAL", 105, 20, { align: "center" });

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");

    let y = 40;

    function linha(txt) {
        doc.text(txt, 20, y);
        y += 8;
    }

    linha(`Residente: ${nome}`);
    linha(`Data: ${document.getElementById("data").value}`);
    linha(`IMC: ${document.getElementById("imc").value} (${document.getElementById("classImc").value})`);
    linha(`MNA: ${document.getElementById("mnaTotal").value} - ${document.getElementById("mnaClass").value}`);
    linha(`NRS-2002: ${document.getElementById("nrsTotal").value} - ${document.getElementById("nrsClass").value}`);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Conduta:", 20, y);
    y += 8;

    doc.setFont("helvetica", "normal");

    const texto = doc.splitTextToSize(
        document.getElementById("parecer").value,
        170
    );

    doc.text(texto, 20, y);

    doc.save(`Avaliacao_${nome}.pdf`);
}

/* ===============================
   SALVAR REGISTRO
================================ */

function salvarRegistro() {

    const nome = document.getElementById("nome").value;
    if (!nome) return alert("Preencha o nome!");

    const registro = {
        nome,
        data: document.getElementById("data").value,
        imc: document.getElementById("imc").value,
        mna: document.getElementById("mnaTotal").value,
        nrs: document.getElementById("nrsTotal").value,
        parecer: document.getElementById("parecer").value
    };

    const lista = JSON.parse(localStorage.getItem("avaliacoes")) || [];
    lista.push(registro);
    localStorage.setItem("avaliacoes", JSON.stringify(lista));

    alert("Avaliação salva com sucesso!");

    document.getElementById("formAvaliacao").reset();
}
