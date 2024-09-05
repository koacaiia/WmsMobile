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
const pop = document.querySelector('#contentsEnf');
const eNfTableTbody = document.querySelector("#eNfTableTbody");
const inputList = pop.querySelectorAll('input');

function getEnfData(){
    eNfTableTbody.replaceChildren();
    database_f.ref("DeptName/"+deptName+"/EquipNFacility").get().then((snapshot)=>{
        const enfValue = snapshot.val();
        let progress="";
        let pD="";
        for(const key in enfValue){
            const v = enfValue[key];
            
            if(v.actionDate!=""){progress="점검완료",pD=v.actionDate;}else if(v.purchaseOrderPaymentDate!=""){progress="구매발주서 결재",pD=v.purchaseOrderPaymentDate;}else if(v.purchaseOrderCreationDate!=""){progress="구매발주서 작성",pD=v.purchaseOrderCreationDate;}else if(v.checkDate!=""){progress="점검진행",pD=v.checkDate;}else if(v.checkAskDate!=""){progress="점검요청",pD=v.checkAskDate;}else{progress="미정";}

            const enfRow = document.createElement('tr');
            enfRow.innerHTML = `<td>${enfValue[key].name}</td><td>${enfValue[key].checkContent}</td><td>${pD}</td><td>${progress}</td><td>${enfValue[key].purchaseOrderAmount}</td><td>${enfValue[key].realAmount}</td><td>${enfValue[key].remark}</td>`;
            enfRow.id=enfValue[key].keyValue;
            eNfTableTbody.appendChild(enfRow);
            enfRow.addEventListener('click',(e)=>{
                removeSelected();
                enfRow.classList.toggle('file-selected');
                eNfReg(enfValue[key]);

            });
        }
    }).catch((error)=>{console.log(error)});

}
getEnfData();

function eNfReg(enfValue){
    inputList.forEach((input)=>{input.value=""});
    const keyValue=["name","checkContent","checkAskDate","checkDate","purchaseOrderCreationDate","purchaseOrderContent","purchaseOrderAmount","purchaseOrderPaymentDate","actionDate","realAmount","remark"];
    pop.classList.toggle('popUp');
    if(enfValue!=undefined){
        inputList.forEach((input,index)=>{input.value=enfValue[keyValue[index]]});
    }
}
function enfSubmit(){
 const baseRef="DeptName/"+deptName+"/EquipNFacility";
 const detailRef =inputList[2].value+"_"+inputList[0].value+"_"+inputList[1].value;
 const upValue = {"name":inputList[0].value,"checkContent":inputList[1].value,"checkAskDate":inputList[2].value,"checkDate":inputList[3].value,"purchaseOrderCreationDate":inputList[4].value,"purchaseOrderAmount":inputList[6].value,"purchaseOrderPaymentDate":inputList[7].value,"actionDate":inputList[8].value,"realAmount":inputList[9].value,"remark":inputList[10].value,"keyValue":baseRef+"/"+detailRef,"purchaseOrderContent":inputList[5].value};
 database_f.ref(baseRef+"/"+detailRef).set(upValue).then(()=>
    {alert(detailRef+"건에 대한 진행상황 업데이트 되었습니다.")
    inputList.forEach((input)=>{input.value=""});
    eNfReg();
     }
 ).catch((error)=>{console.log(error)});
 removeSelected();
 getEnfData();
}

function removeSelected(){
    const selected = document.querySelectorAll('.file-selected');
    selected.forEach((select)=>{
        select.classList.toggle('file-selected');
    });
}
function enfClose(){
    pop.classList.toggle('popUp');
    removeSelected();
}