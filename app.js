/* =========================
   BANCO CENTRAL
========================= */

function obterBanco(){
    return JSON.parse(localStorage.getItem("bancoILPI")) || {};
}

function salvarBanco(banco){
    localStorage.setItem("bancoILPI", JSON.stringify(banco));
}

/* =========================
   IDADE
========================= */

function calcularIdade(data){
    if(!data) return 0;
    const nasc = new Date(data);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if(hoje.getMonth() < nasc.getMonth() ||
      (hoje.getMonth() == nasc.getMonth() && hoje.getDate() < nasc.getDate())){
        idade--;
    }
    return idade;
}

/* =========================
   IMC IDOSO
========================= */

function classificarIMC(imc){
    if(imc < 22) return "Desnutrição";
    if(imc <= 27) return "Eutrofia";
    return "Excesso de Peso";
}

/* =========================
   ICN
========================= */

function calcularICN(mna,nrs,imc){

    mna = Number(mna) || 0;
    nrs = Number(nrs) || 0;
    imc = Number(imc) || 0;

    let imcScore = 0;

    if(imc < 22) imcScore = 2;
    else if(imc <= 27) imcScore = 1;

    return (mna*0.4) + (nrs*0.4) + (imcScore*2);
}

function classificarICN(icn){
    if(icn >= 6) return "Alto Risco Clínico";
    if(icn >= 3) return "Risco Moderado";
    return "Baixo Risco";
}

/* =========================
   SALVAR AVALIAÇÃO
========================= */

function salvarAvaliacao(nome,avaliacao){

    const banco = obterBanco();

    if(!banco[nome]){
        banco[nome] = {
            avaliacoes: [],
            exames: []
        };
    }

    banco[nome].avaliacoes.push(avaliacao);
    salvarBanco(banco);
}

/* =========================
   SALVAR EXAME
========================= */

function salvarExame(nome,exame){

    const banco = obterBanco();

    if(!banco[nome]){
        banco[nome] = {
            avaliacoes: [],
            exames: []
        };
    }

    banco[nome].exames.push(exame);
    salvarBanco(banco);
}
