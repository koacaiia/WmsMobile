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
firebase.initializeApp(firebaseConfig);
const database_f = firebase.database();
const messaging = firebase.messaging();
const storage_f = firebase.storage();
const deptName = "WareHouseDept2";
const dateT = (d)=>{
    let result_date;
    try{
    let result_month = d.getMonth()+1;
    let result_day =d.getDate();
    if(result_month<10){
        result_month ="0"+result_month;
    };
    if(result_day <10){
        result_day ="0"+result_day;
    };
    result_date = d.getFullYear()+"-"+result_month+"-"+result_day;
    return result_date;
    }catch(e){
    return result_date ="미정";
    }
};

const titleDate = document.querySelector("#titleDate");
titleDate.innerHTML = dateT(new Date());
function getData(date){
    const month=date.substring(5,7);
    const refI ="DeptName/"+deptName+"/InCargo/"+month+"월/"+date;
    const refO ="DeptName/"+deptName+"/OutCargo/"+month+"월/"+date;
    database_f.ref(refI).get().then((snapshot)=>{
        const val=snapshot.val();
        for(let i in val){
            let spec="";
            if(val[i]["container40"]==="1"){
                spec="40FT";}
            else if(val[i]["container20"]==="1"){
                spec="20FT";}
            else if(val[i]["lclcargo"]!="0"){
                spce="LcL";
            }else{
             continue
            }
            const tr = document.createElement("tr");
            tr.id=val[i]["refValue"];
            const td1 = document.createElement("td");
            td1.innerHTML=val[i]["consignee"];
            const td2 = document.createElement("td");
            td2.innerHTML=val[i]["container"];
            const td3 = document.createElement("td");
            td3.innerHTML=val[i]["Pqty"];
            const td4 = document.createElement("td");
            td4.innerHTML=spec;
            const td5 = document.createElement("td");
            td5.innerHTML=val[i]["description"];
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            const trH= document.createElement("tr");
            document.querySelector("#tBodyIn").appendChild(tr);
            tr.addEventListener("click",(e)=>{
                const trList = document.querySelectorAll("#tBodyIn tr");
                trList.forEach((e)=>{
                    e.classList.remove("clicked");
                });
                e.target.parentNode.classList.toggle("clicked");
                document.querySelector("#mainOut").style="display:none";
                popUp(tr.id,"InCargo");
            });
        }
        
    }).
    catch((e)=>{
        alert(e);
    });

    database_f.ref(refO).get().then((snapshot)=>{
        const val=snapshot.val();
        for(let i in val){
            const tr = document.createElement("tr");
            tr.id=val[i]["keyValue"];
            const td1 = document.createElement("td");
            td1.innerHTML=val[i]["consigneeName"];
            const td2 = document.createElement("td");
            td2.innerHTML=val[i]["description"];
            const td3 = document.createElement("td");
            td3.innerHTML=val[i]["managementNo"];
            const td4 = document.createElement("td");
            td4.innerHTML=val[i]["totalQty"];
            const td5 = document.createElement("td");
            td5.innerHTML=val[i]["totalEa"];
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            const trH= document.createElement("tr");
            document.querySelector("#tBodyOut").appendChild(tr);
            tr.addEventListener("click",(e)=>{
                const trList = document.querySelectorAll("#tBodyOut tr");
                trList.forEach((e)=>{
                    e.classList.remove("clicked");
                });
                e.target.parentNode.classList.toggle("clicked");
                document.querySelector("#mainIn").style="display:none";
                popUp(tr.id);
            });
        }
    }).catch((e)=>{
        alert(e);
    });
    
}
getData(titleDate.innerHTML);
function popUp(ref,ioValue){
    const pop = document.querySelector("#mainPop");
    pop.style="display:block";
    database_f.ref(ref).get().then((snapshot)=>{
        const val = snapshot.val();
        const container = val["container"];
        console.log(container,val);
        database_f.ref(ref).parent.get().then((snapshot)=>{
            const val = snapshot.val();
            console.log(val);
        }).catch((e)=>{
            console.log(e)});

    }).catch((e)=>{});
    
};
function popClose(){
    document.querySelector("#mainPop").style="display:none";
    document.querySelector("#mainIn").style="display:block";
    document.querySelector("#mainOut").style="display:block";
    document.querySelector("#mainPop").innerHTML="";
}

