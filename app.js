/* ============================================================
   GESTÃO DO BANCO DE DADOS (bancoILPI)
   ============================================================ */
function obterBanco() {
    return JSON.parse(localStorage.getItem("bancoILPI")) || {};
}

function salvarBanco(banco) {
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

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

/* ============================================================
   FÓRMULAS ANTROPOMÉTRICAS E CLÍNICAS
   ============================================================ */
function calcularIdade(data) {
    if (!data) return 0;
    const nasc = new Date(data);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() == nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
}

// Estimativa de Estatura - Chumlea
function estimarAltura(aj, idade, sexo) {
    if (sexo === "M") return (64.19 - (0.04 * idade) + (2.02 * aj)) / 100;
    return (84.88 - (0.24 * idade) + (1.83 * aj)) / 100;
}

// Ajuste de CP (Circ. Panturrilha) - Prado et al. (2022)
function ajustarCP(cp, imc) {
    if (imc < 25) return cp;
    if (imc < 30) return cp - 3;
    if (imc < 40) return cp - 7;
    return cp - 12;
}

// Ajuste de CB (Circ. Braço) - Prado et al. (2022)
function ajustarCB(cb, imc, sexo) {
    if (imc < 25) return cb;
    if (imc < 30) return (sexo === "F") ? cb - 2 : cb - 3;
    if (imc < 40) return (sexo === "F") ? cb - 6 : cb - 7;
    return (sexo === "F") ? cb - 9 : cb - 10;
}

function classificarIMC(imc) {
    if (imc < 22) return "Desnutrição (Idoso)";
    if (imc <= 27) return "Eutrofia";
    return "Excesso de Peso";
}

function calcularICN(mna, nrs, imc) {
    let imcScore = (imc < 22) ? 2 : (imc <= 27 ? 1 : 0);
    return (Number(mna) * 0.4) + (Number(nrs) * 0.4) + (imcScore * 2);
}

function classificarICN(icn) {
    if (icn >= 6) return "Alto Risco Clínico";
    if (icn >= 3) return "Risco Moderado";
    return "Baixo Risco";
}

function getNum(id) {
    return parseFloat(document.getElementById(id).value.replace(',', '.')) || 0;
}
2. index.html (Formulário de Avaliação Nutricional)
Inclui os novos campos de Altura do Joelho e Circunferências com cálculos automáticos.

HTML
<!DOCTYPE html>
<html lang="pt-pt">
<head>
    <meta charset="UTF-8">
    <title>Avaliação Nutricional - Lar Padre Euclides</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="navbar">
        <a href="index.html"><img src="logo.png" height="40"></a>
        <a href="index.html">Nova Avaliação</a>
        <a href="dashboard.html">Dashboard</a>
        <a href="exames-laboratoriais.html">Exames</a>
        <a href="ficha-completa.html">Ficha Clínica</a>
    </div>

    <div class="container">
        <header><h1>Nova Avaliação Nutricional</h1></header>

        <section>
            <h3>1. Identificação</h3>
            <div class="grid">
                <input type="text" id="nome" placeholder="Nome do Residente" required>
                <select id="sexo" onchange="executarCalculos()">
                    <option value="F">Feminino</option>
                    <option value="M">Masculino</option>
                </select>
                <input type="date" id="dataNasc" onchange="atualizarIdade()">
                <input type="text" id="idade" readonly placeholder="Idade">
            </div>
        </section>

        <section>
            <h3>2. Antropometria e Estimativas</h3>
            <div class="grid">
                <input type="number" id="peso" placeholder="Peso Atual (kg)" oninput="executarCalculos()">
                <input type="number" id="altura" placeholder="Altura Real (m)" oninput="executarCalculos()">
                <input type="number" id="altJoelho" placeholder="Alt. Joelho (cm)" oninput="executarCalculos()">
            </div>
            <div class="grid-results" style="margin-top:10px;">
                <div>IMC: <input type="text" id="imc" readonly></div>
                <div>Classificação: <input type="text" id="classImc" readonly></div>
                <div>Alt. Estimada: <input type="text" id="altEstimada" readonly></div>
            </div>
        </section>

        <section>
            <h3>3. Composição Muscular (Ajustada por IMC)</h3>
            <div class="grid">
                <input type="number" id="circBraco" placeholder="CB (cm)" oninput="executarCalculos()">
                <input type="number" id="circPanturrilha" placeholder="CP (cm)" oninput="executarCalculos()">
            </div>
            <div class="grid-results" style="margin-top:10px;">
                <div>CB Ajustada: <input type="text" id="cbAjustada" readonly></div>
                <div>CP Ajustada: <input type="text" id="cpAjustada" readonly></div>
            </div>
            <p style="font-size:0.8rem; color:gray;">*Ajuste baseado em Prado et al. (2022) para idosos.</p>
        </section>

        <section>
            <h3>4. Triagens e ICN</h3>
            <div class="grid">
                <input type="number" id="mna" placeholder="Score MNA (0-30)" oninput="executarCalculos()">
                <input type="number" id="nrs" placeholder="Score NRS (0-7)" oninput="executarCalculos()">
                <input type="text" id="icn" readonly placeholder="ICN">
                <input type="text" id="classIcn" readonly placeholder="Risco">
            </div>
        </section>

        <textarea id="parecer" rows="4" placeholder="Parecer e conduta técnica..."></textarea>
        <button class="btn-save" style="margin-top:20px;" onclick="processarSalvamento()">💾 Salvar no Prontuário</button>
    </div>

    <script src="app.js"></script>
    <script>
        function atualizarIdade() {
            document.getElementById("idade").value = calcularIdade(document.getElementById("dataNasc").value) + " anos";
            executarCalculos();
        }

        function executarCalculos() {
            let peso = getNum("peso");
            let altura = getNum("altura");
            const aj = getNum("altJoelho");
            const idade = parseInt(document.getElementById("idade").value) || 0;
            const sexo = document.getElementById("sexo").value;

            if (altura === 0 && aj > 0 && idade > 0) {
                altura = estimarAltura(aj, idade, sexo);
                document.getElementById("altEstimada").value = altura.toFixed(2) + " m";
            }

            if (peso > 0 && altura > 0) {
                const imcVal = peso / (altura * altura);
                document.getElementById("imc").value = imcVal.toFixed(2);
                document.getElementById("classImc").value = classificarIMC(imcVal);

                const cpAdj = ajustarCP(getNum("circPanturrilha"), imcVal);
                const cbAdj = ajustarCB(getNum("circBraco"), imcVal, sexo);
                
                document.getElementById("cpAjustada").value = cpAdj.toFixed(1) + " cm";
                document.getElementById("cbAjustada").value = cbAdj.toFixed(1) + " cm";

                const icnVal = calcularICN(getNum("mna"), getNum("nrs"), imcVal);
                document.getElementById("icn").value = icnVal.toFixed(1);
                document.getElementById("classIcn").value = classificarICN(icnVal);
            }
        }

        function processarSalvamento() {
            const nome = document.getElementById("nome").value;
            if (!nome) return alert("Nome obrigatório!");
            
            const aval = {
                data: new Date().toISOString().split('T')[0],
                idade: document.getElementById("idade").value,
                peso: getNum("peso"),
                altura: document.getElementById("altura").value || document.getElementById("altEstimada").value,
                imc: document.getElementById("imc").value,
                cpAjustada: document.getElementById("cpAjustada").value,
                icn: document.getElementById("icn").value,
                classIcn: document.getElementById("classIcn").value,
                parecer: document.getElementById("parecer").value
            };
            salvarAvaliacao(nome, aval);
            alert("Avaliação guardada!");
        }
    </script>
</body>
</html>
