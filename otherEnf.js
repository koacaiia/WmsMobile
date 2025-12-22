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
const inputContents = document.querySelector('#inputContents');
const eNfTableTbody = document.querySelector("#eNfTableTbody");
const inputList = inputContents.querySelectorAll('input');

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
            const enfDivB =document.createElement("tr");
            const enfDivA =document.createElement("tr");
            eNfTableTbody.appendChild(enfRow);
            eNfTableTbody.appendChild(enfDivB);
            eNfTableTbody.appendChild(enfDivA);
            enfRow.addEventListener('click',(e)=>{
                // removeSelected();
                enfRow.classList.toggle('file-selected');
                eNfReg(enfValue[key]);

            });
        }
    }).catch((error)=>{console.log(error)});
    // getImgData();

}
getEnfData();

function eNfReg(enfValue){
    inputList.forEach((input)=>{input.value=""});
    const keyValue=["name","checkContent","checkAskDate","checkDate","purchaseOrderCreationDate","purchaseOrderContent","purchaseOrderAmount","purchaseOrderPaymentDate","actionDate","realAmount","remark"];
    pop.classList.toggle('popUp');
    if(enfValue!=undefined){
        inputList.forEach((input,index)=>{
          input.value=enfValue[keyValue[index]]});
    }
    getImgData();   
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
function getImgData(){
    const imgRef = storage_f.ref("DeptName/"+deptName+"/EquipNFacility/"+eNfTableTbody.querySelectorAll('.file-selected')[0].id);
    imgRef.listAll().then((res)=>{
        res.items.forEach((itemRef)=>{
            itemRef.getDownloadURL().then((url)=>{
                const imgName = itemRef.name.split("_");
                const imgTag = document.querySelector(`#${imgName[1]}`);
                imgTag.src=url;
                imgTag.className="server-img";
            });
        });
    });
}
function imgUpLoad(e){
    const imgRef = eNfTableTbody.querySelectorAll('.file-selected')[0].id;
    let putUpRef;
    if(e.target.id=="imgBbtn"){
        putUpRef ="Before";}
    else if(e.target.id=="imgAbtn"){
        putUpRef ="After";
    }
    const upRef = storage_f.ref("DeptName/"+deptName+"/EquipNFacility/"+imgRef+"/"+putUpRef);
    upRef.put(upfileList[0]).then(()=>{
        alert("이미지 업로드 완료");
        getImgData();
    }).catch((error)=>{console.log(error)});
}

const resizeImage = (settings) => {
    const file = settings.file;
    const maxSize = settings.maxSize;
    const reader = new FileReader();
    const image = new Image();
    const canvas = document.createElement("canvas");
  
    const dataURItoBlob = (dataURI) => {
      const bytes =
        dataURI.split(",")[0].indexOf("base64") >= 0
          ? atob(dataURI.split(",")[1])
          : unescape(dataURI.split(",")[1]);
      const mime = dataURI.split(",")[0].split(":")[1].split(";")[0];
      const max = bytes.length;
      const ia = new Uint8Array(max);
      for (let i = 0; i < max; i++) ia[i] = bytes.charCodeAt(i);
      return new Blob([ia], { type: mime });
    };
  
    const resize = () => {
      let width = image.width;
      let height = image.height;
      if (width > height) {
        if (width > maxSize) {
          height *= maxSize / width;
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width *= maxSize / height;
          height = maxSize;
        }
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(image, 0, 0, width, height);
      const dataUrl = canvas.toDataURL("image/jpeg");
      return dataURItoBlob(dataUrl);
    };
  
    return new Promise((ok, no) => {
      if (!file) {
        return;
      }
      if (!file.type.match(/image.*/)) {
        no(new Error("Not an image"));
        return;
      }
      reader.onload = (readerEvent) => {
        image.onload = () => {
          return ok(resize());
        };
        image.src = readerEvent.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImgInput = (e) => {
    const fileTr = document.querySelector("#imgBeforeTr");
    fileTr.replaceChildren();
    upfileList = e.target.files;
    for(let i=0;i<e.target.files.length;i++){
    const config = {
      file: e.target.files[i],
      maxSize: 1500,
    };
    const imgTag = document.createElement("td");
    resizeImage(config)
      .then((resizedImage) => {
        const url = window.URL.createObjectURL(resizedImage);
        const img = document.createElement("img");
        img.className = "local-img";
        img.addEventListener("click", (e) => {
          img.parentNode.classList.toggle("file-selected");
        });
        img.setAttribute("src", url);
        img.style.display = "block";
        img.style.width="100%";
        img.style.height="22vh";
        imgTag.appendChild(img);
        fileTr.appendChild(imgTag);
      })
      .then(() => {
      })
      .catch((err) => {
        console.log(err);
      });
    }
  };

  document.querySelectorAll(".fileInput input").forEach((input)=>{
    input.addEventListener("change",handleImgInput);
  });