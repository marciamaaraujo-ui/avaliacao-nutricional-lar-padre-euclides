/* ============================================================
   SISTEMA ILPI - MOTOR CLÍNICO PROFISSIONAL
   Versão Hospitalar Blindada para Produção
============================================================ */

/* =========================
   CONFIGURAÇÃO DO BANCO
========================= */

const DB_KEY = "bancoILPI";

function obterBanco() {
    try {
        const data = localStorage.getItem(DB_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        console.error("Erro ao carregar banco:", e);
        return {};
    }
}

function salvarBanco(banco) {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(banco));
    } catch (e) {
        console.error("Erro ao salvar banco:", e);
    }
}

function garantirPaciente(nome) {
    const banco = obterBanco();

    if (!banco[nome]) {
        banco[nome] = {
            perfil: {},
            avaliacoes: [],
            exames: [],
            comorbidades: []
        };
        salvarBanco(banco);
    }

    return banco;
}

/* =========================
   UTILITÁRIOS SEGUROS
========================= */

function numeroSeguro(valor) {
    if (valor === undefined || valor === null || valor === "") return 0;
    const n = parseFloat(valor.toString().replace(",", "."));
    return isNaN(n) ? 0 : n;
}

function arred(n, casas = 2) {
    return isNaN(n) ? 0 : Number(n.toFixed(casas));
}

function calcularIdade(dataString) {
    if (!dataString) return 0;
    const nasc = new Date(dataString);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    const m = hoje.getMonth() - nasc.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
    return idade;
}

function calcularIMC(peso, altura) {
    if (!peso || !altura || altura <= 0) return 0;
    return peso / (altura * altura);
}

/* =========================
   ANTROPOMETRIA
========================= */

function estimarAltura(aj, idade, sexo) {
    if (!aj || !idade) return 0;

    let estatura = 0;

    if (sexo === "M") {
        estatura = (64.19 - (0.04 * idade)) + (2.02 * aj);
    } else if (sexo === "F") {
        estatura = (84.88 - (0.24 * idade)) + (1.83 * aj);
    } else {
        return 0;
    }

    return estatura / 100;
}

function ajustarCP(cp, imc) {
    if (!cp || !imc) return cp;

    if (imc < 25) return cp;
    if (imc <= 29.9) return cp - 3;
    if (imc <= 39.9) return cp - 7;
    return cp - 12;
}

function ajustarCB(cb, imc, sexo) {
    if (!cb || !imc) return cb;

    if (imc < 25) return cb;

    if (imc <= 29.9)
        return sexo === "F" ? cb - 2 : cb - 3;

    if (imc <= 39.9)
        return sexo === "F" ? cb - 6 : cb - 7;

    return sexo === "F" ? cb - 9 : cb - 10;
}

/* =========================
   CLASSIFICAÇÕES
========================= */

function classificarICN(valor) {
    if (valor >= 13) return "Baixo Risco";
    if (valor >= 8) return "Risco Moderado";
    return "Alto Risco Clínico";
}

function classificarMNA(score) {
    if (score >= 24) return "Estado Nutricional Adequado";
    if (score >= 17) return "Risco de Desnutrição";
    return "Desnutrição";
}

/* =========================
   GERADOR PROFISSIONAL PES
========================= */

function gerarPES(dados) {

    const { classificacaoICN, imc, cpAdj, sexo } = dados;

    const problema =
        classificacaoICN === "Alto Risco Clínico"
            ? "Desnutrição"
            : "Risco de desnutrição";

    const etiologia =
        "relacionado à institucionalização e possível ingestão alimentar inadequada";

    let sinais =
        `evidenciado por IMC ${arred(imc)} kg/m²`;

    const limiteCP = sexo === "M" ? 34 : 33;

    if (cpAdj && cpAdj < limiteCP) {
        sinais += `, redução de massa muscular (CP ajustada ${arred(cpAdj)} cm)`;
    }

    return `${problema} relacionado a ${etiologia}, ${sinais}.`;
}

/* =========================
   MOTOR DE AVALIAÇÃO COMPLETA
========================= */

function realizarAvaliacaoCompleta(nomePaciente, entrada) {

    if (!nomePaciente) {
        console.warn("Nome do paciente não informado.");
        return null;
    }

    const banco = garantirPaciente(nomePaciente);

    const peso = numeroSeguro(entrada.peso);
    const altura = numeroSeguro(entrada.altura);
    const icn = numeroSeguro(entrada.icn);
    const cp = numeroSeguro(entrada.cp);
    const cb = numeroSeguro(entrada.cb);
    const mnaScore = numeroSeguro(entrada.mnaScore);
    const sexo = entrada.sexo || "F";

    const imc = calcularIMC(peso, altura);

    const cpAdj = ajustarCP(cp, imc);
    const cbAdj = ajustarCB(cb, imc, sexo);

    const classificacaoICN = classificarICN(icn);
    const classificacaoMNA = classificarMNA(mnaScore);

    const parecerPES = gerarPES({
        classificacaoICN,
        imc,
        cpAdj,
        sexo
    });

    const avaliacao = {
        data: new Date().toISOString(),
        peso,
        altura,
        imc: arred(imc),
        icn,
        classificacaoICN,
        mnaScore,
        classificacaoMNA,
        cp,
        cpAjustada: arred(cpAdj),
        cb,
        cbAjustada: arred(cbAdj),
        parecerPES
    };

    banco[nomePaciente].avaliacoes.push(avaliacao);
    salvarBanco(banco);

    return avaliacao;
}

/* =========================
   DASHBOARD EPIDEMIOLÓGICO
========================= */

function gerarIndicadoresILPI() {

    const banco = obterBanco();
    let total = 0;
    let altoRisco = 0;
    let riscoModerado = 0;

    Object.values(banco).forEach(paciente => {
        if (paciente.avaliacoes.length > 0) {
            total++;
            const ultima = paciente.avaliacoes[paciente.avaliacoes.length - 1];

            if (ultima.classificacaoICN === "Alto Risco Clínico") altoRisco++;
            if (ultima.classificacaoICN === "Risco Moderado") riscoModerado++;
        }
    });

    return {
        totalAvaliados: total,
        altoRisco,
        riscoModerado,
        percentualAltoRisco: total ? arred((altoRisco / total) * 100) : 0
    };
}
