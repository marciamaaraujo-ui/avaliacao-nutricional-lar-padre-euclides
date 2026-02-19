/* =========================
   UTILIDADES
========================= */

function calcularIdade(dataNasc){
    if(!dataNasc) return 0;

    const nasc=new Date(dataNasc);
    const hoje=new Date();
    let idade=hoje.getFullYear()-nasc.getFullYear();

    if(hoje.getMonth()<nasc.getMonth() ||
      (hoje.getMonth()==nasc.getMonth() && hoje.getDate()<nasc.getDate())){
        idade--;
    }
    return idade;
}

/* =========================
   IMC IDOSO
========================= */

function classificarIMCIdoso(imc){
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

    let imcScore=0;

    if(imc<22) imcScore=2;
    else if(imc<=27) imcScore=1;
    else imcScore=0;

    return (mna*0.4)+(nrs*0.4)+(imcScore*2);
}

function classificarICN(icn){

    if(icn >= 6) return "Alto Risco Clínico";
    if(icn >= 3) return "Risco Moderado";
    return "Baixo Risco";
}

/* =========================
   STORAGE
========================= */

function salvarRegistro(registro){

    const lista = JSON.parse(localStorage.getItem("avaliacoes")) || [];
    lista.push(registro);
    localStorage.setItem("avaliacoes", JSON.stringify(lista));
}

function obterRegistros(){
    return JSON.parse(localStorage.getItem("avaliacoes")) || [];
}
