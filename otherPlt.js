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
let pltData={};
const fileInput = document.querySelector("#fileInput");
const fileTr = document.querySelector("#imgTr");
const reTr = document.querySelector("#reImgTr");
    // fileTr.replaceChildren();
const selClient = document.getElementById("pltClient");
const date = document.getElementById("pltDate");
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
date.value=dateT(new Date());
let imgFileRef;
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
         const inQty=document.getElementById("pltIn");
         const outQty=document.getElementById("pltOut");
         const remark=document.getElementById("pltNote");
         const client = document.getElementById("pltClientInput").value;
         const type = document.getElementById("pltTypeInput").value;
         if(client==""|| type==""){alert("Client와 Type을 선택해 주세요.");return;}
         const confirmPlt = confirm("입고수량 : "+inQty.value+"\n"+"출고수량 : "+outQty.value+"\n"+"비고 : "+remark.value+"\n"+"위 내용으로 등록 하시겠습니까?");
         if(confirmPlt){
             const refPath = "DeptName/"+deptName+"/PltManagement/"+client+"/"+type+"/"+date.value+"_"+returnTime()+"_I_"+inQty.value+"_O_"+outQty.value;
             const pltValue = {"date":date.value,"inQty":inQty.value,"outQty":outQty.value,"remark":remark.value,"refPath":refPath};
             database_f.ref(refPath).update(pltValue).then(()=>{
                 alert("Plt 현황이 등록 되었습니다.");
                 pltDataTable();
                 inQty.value=null;
                 outQty.value=null;
                 remark.value=null;
             }).catch((e)=>{
                alert(e);
                 console.error(e);
             });
            imgFileRef = refPath.replace("DeptName","images")
            popImgSub();
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
                 tr.id=values[p]["refPath"];
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
                     td.addEventListener("click",(e)=>{
                      reTr.replaceChildren();
                      const tr = e.target.parentNode;
                      tr.classList.toggle("file-selected");
                      imgFileRef = tr.id;
                      const resetDiv = document.querySelector("#popDataResetDiv");
                      resetDiv.classList.toggle("popUp");
                      const inputList = resetDiv.querySelectorAll("input");
                      database_f.ref(imgFileRef).get().then((snapshot)=>{
                          const value = snapshot.val();
                          inputList[0].value=value["date"];
                          inputList[1].value=value["inQty"];
                          inputList[2].value=value["outQty"];
                          inputList[3].value=value["remark"];
                      }).catch((e)=>{
                          console.error(e);
                      });
                      storage_f.ref(imgFileRef.replace("DeptName","images")).listAll().then((res)=>{
                        res.items.forEach((itemRef)=>{
                          itemRef.getDownloadURL().then((url)=>{
                            const td = document.createElement("td");
                            const img = document.createElement("img");
                            img.src=url;
                            img.className="profile-img";
                            img.addEventListener("click", (e) => {
                              // img.parentNode.classList.toggle("file-selected");
                              location.href=`imagePop.html?ref=${encodeURIComponent(imgFileRef.replace("DeptName","images"))}`;
                            });
                            img.style.display="block";
                            // img.style.width="100%";
                            img.style.height="22vh";
                            td.appendChild(img);
                            reTr.appendChild(td);
                          });
                        });
                      });    
                     });
                 }
             }
            
         });
     }
     function upLoad(){
        const fileInput = document.querySelector("#fileInput");
        const fileTr = document.querySelector("#imgTr");
        const imgUrls = [];  
        fileTr.querySelectorAll("td").forEach((td)=>{
        const img = td.querySelector("img");
        const imgSrc = img.src;
        imgUrls.push(imgSrc); 
        });
        const file = fileInput.files;
        const storageRef = storage_f.ref(imgFileRef);
        imgUrls.forEach((imgUrl, index) => {
          fetch(imgUrl)
              .then(response => response.blob())
              .then(blob => {
                  // const fileName = imgUrl.split('/').pop(); // Extract file name from URL
                  const selectTr = document.querySelector(".clicked");
                  const fileName = imgFileRef.split("/")[3]+"_"+imgFileRef.split("_")[4]+imgFileRef.split("_")[5]+"_"+index+returnTime();
                  const file = new File([blob], fileName, { type: blob.type });
                  const fileRef = storageRef.child(fileName);
                  fileRef.put(file).then((snapshot) => {
                      if (index === imgUrls.length - 1) {
                          console.log("업로드 완료");
                      }
                  });
                  popImgSub();
              })
              .catch(error => {
                console.error("Error uploading file:", error);
            });
          });
    }
    
    function returnTime(){
        const now = new Date();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        const formattedTime = `${hours}시${minutes}분${seconds}초`;
        return formattedTime;
      }
    function popImgSub(){
        const popReset =document.querySelector("#popDataResetDiv");
        if(!popReset.classList.contains("popUp")){
          popReset.classList.toggle("popUp");
        };
        const popDiv = document.querySelector("#popImgSubDiv");
        popDiv.classList.toggle("popUp");
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
            img.className = "profile-img";
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
      fileInput.addEventListener("change",handleImgInput);    

      function fileRemove(){
        const fileInput = document.querySelector("#fileInput");
        const fileTr = document.querySelector("#imgTr");
        let fileRemove = fileTr.querySelectorAll(".file-selected");
        const confirmRemove = confirm(fileRemove.length+" 개의 파일을 삭제하시겠습니까?");
        const imgUrls = []; 
        if(confirmRemove){
          for(let i=0;i<fileRemove.length;i++){
            fileRemove[i].remove();
          }
          fileTr.querySelectorAll("td").forEach((td)=>{
            const img = td.querySelector("img");
            const imgSrc = img.src;
            imgUrls.push(imgSrc);
          });
        }
      }
      function resetUpLoad(){
        const popReset =document.querySelector("#popDataResetDiv");
        if(!popReset.classList.contains("popUp")){
          popReset.classList.toggle("popUp");
        };
        const resetDiv = document.querySelector("#popDataResetDiv"); 
        const fileInputList  = resetDiv.querySelectorAll("input");

        const resetData={"date":fileInputList[0].value,"inQty":fileInputList[1].value,"outQty":fileInputList[2].value,"remark":fileInputList[3].value};
        database_f.ref(imgFileRef).update(resetData).then(()=>{
            alert("데이터가 수정 되었습니다.");
            pltDataTable();
        }).catch((e)=>{
            console.error(e);
        });

      }