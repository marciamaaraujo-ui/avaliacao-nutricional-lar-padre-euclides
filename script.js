function calcularTudo(){

let peso=parseFloat(document.getElementById("peso").value);
let altura=parseFloat(document.getElementById("altura").value);
let pesoHab=parseFloat(document.getElementById("pesoHab").value);
let idade=parseInt(document.getElementById("idade").value);

if(peso && altura){
    let imc=peso/(altura*altura);
    document.getElementById("imc").value=imc.toFixed(2);

    if(imc<22) document.getElementById("classImc").value="Baixo peso (idoso)";
    else if(imc<=27) document.getElementById("classImc").value="Eutrofia";
    else document.getElementById("classImc").value="Sobrepeso";
}

if(peso && pesoHab){
    let perda=((pesoHab-peso)/pesoHab)*100;
    document.getElementById("perda").value=perda.toFixed(1)+"%";
}

let tri=parseFloat(document.getElementById("mnaTriagem").value)||0;
let glob=parseFloat(document.getElementById("mnaGlobal").value)||0;
let mna=tri+glob;

document.getElementById("mnaTotal").value=mna;

if(mna>=24) document.getElementById("mnaClass").value="Estado Normal";
else if(mna>=17) document.getElementById("mnaClass").value="Risco de Desnutrição";
else document.getElementById("mnaClass").value="Desnutrição";

let nutri=parseInt(document.getElementById("nrsNutri").value)||0;
let grav=parseInt(document.getElementById("nrsGrav").value)||0;
let nrs=nutri+grav;
if(idade>=70) nrs+=1;

document.getElementById("nrsTotal").value=nrs;

if(nrs>=3) document.getElementById("nrsClass").value="Risco Nutricional";
else document.getElementById("nrsClass").value="Sem Risco";

gerarParecer();
}

function gerarParecer(){

let mna=document.getElementById("mnaClass").value;
let nrs=document.getElementById("nrsClass").value;
let texto="";

if(mna=="Estado Normal" && nrs=="Sem Risco"){
texto="Estado nutricional preservado. Manter monitoramento trimestral.";
}
else if(mna=="Risco de Desnutrição" && nrs=="Risco Nutricional"){
texto="Risco nutricional confirmado por MNA e NRS. Iniciar intervenção imediata.";
}
else if(mna=="Desnutrição"){
texto="Desnutrição instalada. Indica-se plano intensivo com reavaliação semanal.";
}
else{
texto="Resultados divergentes. Reavaliar parâmetros clínicos.";
}

document.getElementById("parecer").value=texto;
}

function salvarRegistro(){

let registro={
nome:document.getElementById("nome").value,
data:document.getElementById("data").value,
peso:document.getElementById("peso").value,
imc:document.getElementById("imc").value,
mna:document.getElementById("mnaTotal").value,
nrs:document.getElementById("nrsTotal").value
};

let lista=JSON.parse(localStorage.getItem("avaliacoes"))||[];
lista.push(registro);
localStorage.setItem("avaliacoes",JSON.stringify(lista));

alert("Avaliação salva com sucesso!");
}
