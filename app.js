/* ==========================================================================
   1. GESTÃO DE DADOS (LocalStorage)
   ========================================================================== */
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

function salvarExame(nome, exame) {
    const banco = obterBanco();
    if (!banco[nome]) {
        banco[nome] = { perfil: {}, avaliacoes: [], exames: [], comorbidades: [] };
    }
    banco[nome].exames.push(exame);
    salvarBanco(banco);
}

/* ==========================================================================
   2. FÓRMULAS ANTROPOMÉTRICAS E AJUSTES CIENTÍFICOS
   ========================================================================== */

/**
 * Cálculo da idade cronológica
 */
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

/**
 * Estimativa de Altura pela Altura do Joelho (AJ)
 */
function estimarAltura(aj, idade, sexo) {
    if (sexo === "M") return (64.19 - (0.04 * idade) + (2.02 * aj)) / 100;
    return (84.88 - (0.24 * idade) + (1.83 * aj)) / 100;
}

/**
 * Ajuste da Circunferência da Panturrilha (CP) 
 * Baseado em Prado et al. (2022) para Populações Idosas/Clínicas
 */
function ajustarCP(cp, imc) {
    if (imc < 25.0) return cp;           // Sem ajuste para IMC < 25 [cite: 22, 38, 39, 48]
    if (imc <= 29.9) return cp - 3;      // IMC 25-29.9: -3 cm [cite: 23, 29, 34, 41, 48, 115]
    if (imc <= 39.9) return cp - 7;      // IMC 30-39.9: -7 cm [cite: 24, 30, 34, 42, 44, 48, 117]
    return cp - 12;                      // IMC >= 40: -12 cm [cite: 25, 31, 34, 43, 45, 48, 118]
}

/**
 * Ajuste da Circunferência do Braço (CB) 
 * Fonte: NHANES 1999-2006
 */
function ajustarCB(cb, imc, sexo) {
    if (imc < 25) return cb; 
    if (imc < 30) return (sexo === "F") ? cb - 2 : cb - 3; 
    if (imc < 40) return (sexo === "F") ? cb - 6 : cb - 7;
    return (sexo === "F") ? cb - 9 : cb - 10;
}

/* ==========================================================================
   3. PROTOCOLOS DE TRIAGEM E DIAGNÓSTICO (MNA, NRS, ICN)
   ========================================================================== */

function classificarIMC(imc) {
    if (imc < 22) return "Desnutrição"; // Critério Lipschitz [cite: 76-80]
    if (imc <= 27) return "Eutrofia";    // [cite: 78-79]
    return "Excesso de Peso";           // [cite: 80]
}

function calcularSomaMNA() {
    const ids = "abcdefghijklmnopqr".split("");
    return ids.reduce((soma, letra) => {
        const el = document.getElementById("mna_" + letra);
        return soma + (el ? parseFloat(el.value) || 0 : 0);
    }, 0);
}

function calcularSomaNRS(idade) {
    const status = parseFloat(document.getElementById("nrs_status").value) || 0;
    const gravidade = parseFloat(document.getElementById("nrs_gravidade").value) || 0;
    const total = status + gravidade;
    // NRS 2002: Adiciona 1 ponto para idade >= 70 anos
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

/**
 * Geração do Parecer Nutricional PES
 * Utiliza a CP ajustada e pontos de corte específicos (34M / 33F)
 */
function gerarParecerPES(sIcn, imc, cpAdj, sexo, mna, nrs) {
    let P = sIcn.includes("Alto") ? "Desnutrição Proteico-Calórica (P)" : (sIcn.includes("Moderado") ? "Risco de desnutrição (P)" : "Estado nutricional preservado (P)");
    let E = "relacionado à institucionalização e senescência (E)";
    let S = `evidenciado por ICN: ${sIcn}, MNA: ${mna}pts, NRS: ${nrs}pts, IMC: ${imc.toFixed(2)}kg/m²`;
    
    // Pontos de corte específicos: 34 cm para homens e 33 cm para mulheres 
    const limite = (sexo === "M") ? 34 : 33; 
    if (cpAdj < limite) {
        S += ` e baixa reserva muscular (CP ajustada: ${cpAdj.toFixed(1)}cm)`;
    }
    
    return `${P}, ${E}, ${S} (S). Conduta: Suporte Nutricional conforme protocolo do Lar.`;
}

/* ==========================================================================
   4. EXPORTAÇÃO E UTILITÁRIOS
   ========================================================================== */

function exportarParaCSV() {
    const banco = obterBanco();
    let csv = "\uFEFFNome;Sexo;Nascimento;Admissão;Peso;Altura;IMC;CP_Adj;ICN;Status;Parecer PES\n";
    
    Object.keys(banco).sort().forEach(nome => {
        const p = banco[nome].perfil || {};
        const avaliacoes = banco[nome].avaliacoes || [];
        const a = avaliacoes.length > 0 ? avaliacoes[avaliacoes.length - 1] : {}; 
        
        const parecerLimpo = (a.parecer || "").replace(/(\r\n|\n|\r|;)/gm, " ");

        csv += `${nome};${p.sexo || ""};${p.nasc || ""};${p.admissao || ""};${a.peso || ""};${a.altura || ""};${a.imc || ""};${a.cp_ajustada || ""};${a.icn || ""};${a.classIcn || ""};"${parecerLimpo}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Relatorio_Nutricional_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function getNum(id) { 
    const el = document.getElementById(id);
    return el ? parseFloat(el.value.replace(',', '.')) || 0 : 0; 
}
