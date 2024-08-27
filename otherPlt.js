const firebaseConfig = {
    apiKey: "AIzaSyDLzmZyt5nZwCk98iZ6wi01y7Jxio1ppZQ",
    authDomain: "fine-bondedwarehouse.firebaseapp.com",
    databaseURL: "https://fine-bondedwarehouse-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "fine-bondedwarehouse",
    storageBucket: "fine-bondedwarehouse.appspot.com",
    messagingSenderId: "415417723331",
    appId: "1:415417723331:web:15212f190062886281b576",
    measurementId: "G-SWBR4359JQ"
};
console.log("plt")
firebase.initializeApp(firebaseConfig);
const database_f = firebase.database();
const messaging = firebase.messaging();
const storage_f = firebase.storage();
const deptName = "WareHouseDept2";
let pltData={};
const selClient = document.getElementById("pltClient");
    database_f.ref("DeptName/"+deptName+"/PltManagement").get().then((snapshot)=>{
            const value = snapshot.val();
            pltData=value;
            console.log(pltData);
            for(let c in value){
                const option = document.createElement("option");
                option.innerHTML=c;
                selClient.appendChild(option);
    }
    });
    function pltClient(){
        const clientValue= selClient.value;
        const pltType = document.getElementById("pltType");
            pltType.replaceChildren();
            const op=document.createElement("option");
            op.innerHTML="Type선택";
            pltType.appendChild(op);
            for(let c in pltData[clientValue]){
                const option = document.createElement("option");
                option.innerHTML=c;
                pltType.appendChild(option);
            }
        document.querySelector("#pltClientInput").value=clientValue;    
        
    }
    function pltType(){
        document.querySelector("#pltTypeInput").value=document.getElementById("pltType").value;
        pltDataTable();
     }
    
     function pltReg(){
         const date= document.getElementById("pltDate");
         const inQty=document.getElementById("pltIn");
         const outQty=document.getElementById("pltOut");
         const remark=document.getElementById("pltNote");
         const confirmPlt = confirm("입고수량 : "+inQty.value+"\n"+"출고수량 : "+outQty.value+"\n"+"재고수량 : "+remark.value+"\n"+"위 내용으로 등록 하시겠습니까?");
         if(confirmPlt){
             const client = document.getElementById("pltClient").value;
             const time = new Date().getTime();
             const type = document.getElementById("pltType").value;
             const refPath = "DeptName/"+deptName+"/PltManagement/"+client+"/"+type+"/"+date.value+"_"+time;
             const pltValue = {"date":date.value,"inQty":inQty.value,"outQty":outQty.value,"remark":remark.value,"refPath":refPath};
             database_f.ref(refPath).update(pltValue).then(()=>{
                 alert("Plt 현황이 등록 되었습니다.");
                 pltDataTable();
                 inQty.value=null;
                 outQty.value=null;
                 remark.value=null;
             }).catch((e)=>{
                 console.error(e);
             });
         }
     }
     
     function pltDataTable(){
         const tbody=document.getElementById("pltTableTbody");
         tbody.replaceChildren();
         const client = document.getElementById("pltClientInput").value;
         const type = document.getElementById("pltTypeInput").value;
         database_f.ref("DeptName/"+deptName+"/PltManagement/"+client+"/"+type).get().then((snapshot)=>{
             let value = snapshot.val();
             let values = Object.values(value);
             values=values.sort(function(a,b){
                 return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
             });
             console.log(values,value);
             let totalIn=0;
             let totalOut=0;
             for(let p in values){
                 const tr = document.createElement("tr");
                 console.log(values[p]);
                 tbody.appendChild(tr);
                 const pltTh =["date","inQty","outQty","stockQty","remark"];
                 if(values[p]["inQty"]==""){
                     values[p]["inQty"]=0;
                 }
                 if(values[p]["outQty"]==""){
                     values[p]["outQty"]=0;
                 }
                 totalIn = totalIn+parseInt(values[p]["inQty"]);
                 totalOut = totalOut+parseInt(values[p]["outQty"]);
                 for(let t in pltTh){
                     const td = document.createElement("td");
                    //  remove(totalIn,totalOut,pltTh[t]);
                     if(pltTh[t]=="stockQty"){
                        //  remove("stockQty",parseInt(totalIn)-parseInt(totalOut));
                         td.innerHTML=parseInt(totalIn)-parseInt(totalOut);
                     }else{
                         td.innerHTML=values[p][pltTh[t]];
                         if(values[p][pltTh[t]]==undefined){
                             td.innerHTML="";
                         }
                     }
                     
                     tr.appendChild(td);
                 }
             }
            
         });
     }    