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
if(firebase.apps.length==0){
  firebase.initializeApp(firebaseConfig);
}
else{firebase.app();}
// const doc =document.documentElement;
// function fullScreen(){
//   doc.requestFullscreen();
// }
// fullScreen();

const database_f = firebase.database();
const messaging = firebase.messaging();
const storage_f = firebase.storage();
const deptName = "WareHouseDept2";
// messaging.onBackgroundMessage(function(payload) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);
//   // Customize notification here
//   const notificationTitle = payload.notification.title;
//   const notificationOptions = {
//       body: payload.notification.body,
//       icon: '/icon.png'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
//   });
let ref;
let refFile;
let ioValue;
let upfileList;
let token;
let isUploading = false;
let modalTargetImage = null;
const mC = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isMobilePopupContext = ()=>{
  const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  return mC || navigator.maxTouchPoints > 0 || coarsePointer || window.innerWidth <= 900;
};
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
const dateSelect = document.querySelector("#dateSelect");
const tBodyIn=document.querySelector("#tBodyIn");
const tBodyOut=document.querySelector("#tBodyOut");
function dateChanged(){
    const d = dateSelect.value;
    titleDate.innerHTML = d;
    tBodyIn.replaceChildren();
    tBodyOut.replaceChildren();
    getData(d);
}
dateSelect.value=dateT(new Date());
titleDate.innerHTML = dateT(new Date());
// titleDate.innerHTML = "2024-09-24";

function getData(date){
    const year = date.substring(0,4);
    const month=date.substring(5,7);
    const refI ="DeptName/"+deptName+"/InCargo/"+year+"/"+month+"/"+date.substring(8,10);
    const refO ="DeptName/"+deptName+"/OutCargo/"+month+"월/"+date;
    const refOs ="DeptName/"+deptName+"/Os/"+year+"/"+month+"월/"+date;
    database_f.ref(refOs).get().then((snapshot)=>{
      const val = snapshot.val();
      if(val==null){
        document.querySelector("#osMo").value=0;
        document.querySelector("#osWf").value=0;
        document.querySelector("#osWo").value=0;
        document.querySelector("#osRe").value="";
      }else{
        document.querySelector("#osMo").value=val["osM"];
        document.querySelector("#osWf").value=val["osWf"];
        document.querySelector("#osWo").value=val["osWo"];
        document.querySelector("#osRe").value=val["osR"];
      }
    }).catch((e)=>{console.log(e)});
    database_f.ref(refI).get().then((snapshot)=>{
        const val=snapshot.val();
        let ft4=0;
        let ft2=0;
        let lcl=0;
        
        // leaf nodes 추출 함수
        const getLeafNodes = (obj, path = '') => {
            let leafNodes = {};
            for(let key in obj){
                if(obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])){
                    // 객체인 경우 재귀 호출
                    Object.assign(leafNodes, getLeafNodes(obj[key], path + key + '/'));
                } else {
                    // leaf node인 경우
                    if(!leafNodes[path]){
                        leafNodes[path] = {};
                    }
                }
            }
            // 최하위 객체들을 반환
            if(Object.keys(leafNodes).length === 0 && path === ''){
                return obj;
            }
            return leafNodes;
        };
        
        // leaf nodes의 부모 객체들을 추출
        const extractLeafParents = (obj) => {
            let result = {};
            const traverse = (current, path = []) => {
                let hasNonObjectChild = false;
                for(let key in current){
                    if(current[key] !== null && typeof current[key] === 'object' && !Array.isArray(current[key])){
                        traverse(current[key], [...path, key]);
                    } else {
                        hasNonObjectChild = true;
                    }
                }
                if(hasNonObjectChild && path.length > 0){
                    result[path.join('/')] = current;
                }
            };
            traverse(obj);
            return result;
        };
        
        const leafData = extractLeafParents(val) || {};
        
        for(let i in leafData){
            const item = leafData[i];
            let spec="";
            if(item["container40"]==="1"){
                spec="40FT";
              ft4+=1;}
            else if(item["container20"]==="1"){
                spec="20FT";
              ft2+=1;}
            else if(item["lclcargo"]!="0"){
                spec="LcL";
                lcl+=1;
            }else{
             continue
            }
            const tr = document.createElement("tr");
            tr.id=item["refValue"] || refI + "/" + i;
            const td1 = document.createElement("td");
            td1.innerHTML=item["consignee"];
            const td2 = document.createElement("td");
            td2.innerHTML=item["container"];
            const td3 = document.createElement("td");
            td3.innerHTML=item["Pqty"]||item["qtyPlt"];
            const td4 = document.createElement("td");
            td4.innerHTML=spec;
            const td5 = document.createElement("td");
            td5.innerHTML=item["description"];
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            tBodyIn.appendChild(tr);
            tr.addEventListener("click",(e)=>{
                const trList = document.querySelectorAll("#tBodyIn tr");
                trList.forEach((e)=>{
                  if(e.classList.contains("clicked")){
                       e.classList.remove("clicked");}
                });
                e.target.parentNode.classList.toggle("clicked");
                // document.querySelector("#mainOut").style="display:none";
                ref=tr.id;
                ioValue="InCargo";
                popUp();
            });
            if(item["working"]!=""){
                tr.style="color:red;";}
        }
        toastOn("40FT:"+ft4+"   20FT:"+ft2+"    LCL:"+lcl,4000);
    }).
    catch((e)=>{
      console.log(e);
        // alert(e);
    });

    database_f.ref(refO).get().then((snapshot)=>{
        const val=snapshot.val();
        for(let i in val){
            const tr = document.createElement("tr");
            tr.id=val[i]["keyValue"];
            let des = val[i]["description"];
            let manNo = val[i]["managementNo"];
            if(des.includes(",")){
              des = des.substring(0,des.indexOf(",")+1).replace(",","_외");
              manNo = manNo.substring(0,manNo.indexOf(",")+1).replace(",","_외");
            }
            const td1 = document.createElement("td");
            td1.innerHTML=val[i]["consigneeName"];
            const td2 = document.createElement("td");
            td2.innerHTML=val[i]["outwarehouse"];
            const td3 = document.createElement("td");
            td3.innerHTML=des;
            const td4 = document.createElement("td");
            td4.innerHTML=manNo;
            const td5 = document.createElement("td");
            td5.innerHTML=val[i]["totalQty"];
            const td6 = document.createElement("td");
            td6.innerHTML=val[i]["totalEa"];
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            tr.appendChild(td6);
            tBodyOut.appendChild(tr);
            tr.addEventListener("click",(e)=>{
                const trList = document.querySelectorAll("#tBodyOut tr");
                trList.forEach((e)=>{
                  if(e.classList.contains("clicked")){
                    e.classList.remove("clicked");}
                });
                e.target.parentNode.classList.toggle("clicked");
                // document.querySelector("#mainIn").style="display:none";
                ref=tr.id;
                ioValue="outCargo";
                popUp();
            });
            if(val[i]["workprocess"]!="미"){
              tr.style="color:red;";}
        }
    }).catch((e)=>{
      console.log(e);
        // alert(e);
    });
    
}
getData(titleDate.innerHTML);
async function compressImageBlobToMaxBytes(blob, maxBytes){
  try{
    if (!blob || blob.size <= maxBytes) {
      return blob;
    }

    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let quality = 0.9;
    let scale = 1;
    let resultBlob = blob;

    const canvasToBlob = (qualityValue) => {
      return new Promise((resolve) => {
        canvas.toBlob((generatedBlob) => {
          resolve(generatedBlob);
        }, "image/jpeg", qualityValue);
      });
    };

    for (let attempt = 0; attempt < 14; attempt++) {
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const compressedBlob = await canvasToBlob(quality);
      if (compressedBlob) {
        resultBlob = compressedBlob;
      }

      if (resultBlob.size <= maxBytes) {
        URL.revokeObjectURL(objectUrl);
        return resultBlob;
      }

      if (quality > 0.45) {
        quality -= 0.1;
      } else {
        scale *= 0.85;
      }
    }

    URL.revokeObjectURL(objectUrl);
    return resultBlob;
  }catch(error){
    console.error("이미지 압축 오류:", error);
    return blob;
  }
}
function setUploadProgress(percent){
  const uploadAction = document.querySelector("#btnUploadAction");
  const uploadActionText = document.querySelector("#btnUploadActionText");
  if (!uploadAction || !uploadActionText) {
    return;
  }
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  uploadAction.style.backgroundImage = "linear-gradient(to right, #2f8f2f " + safePercent + "%, #1713dd " + safePercent + "%)";
  uploadActionText.textContent = "업로드 중... " + safePercent + "%";
}
function resetUploadProgress(){
  const uploadAction = document.querySelector("#btnUploadAction");
  const uploadActionText = document.querySelector("#btnUploadActionText");
  if (!uploadAction || !uploadActionText) {
    return;
  }
  uploadAction.style.backgroundImage = "none";
  uploadActionText.textContent = "사진등록";
}
function setUploadActionDisabled(disabled){
  const uploadAction = document.querySelector("#btnUploadAction");
  if (!uploadAction) {
    return;
  }
  if (disabled) {
    uploadAction.classList.add("upload-disabled");
  } else {
    uploadAction.classList.remove("upload-disabled");
  }
}
function setUploadActionMode(mode, label){
  const uploadAction = document.querySelector("#btnUploadAction");
  const uploadActionText = document.querySelector("#btnUploadActionText");
  if (!uploadAction || !uploadActionText) {
    return;
  }
  uploadAction.dataset.mode = mode || "register";
  uploadActionText.textContent = label || "사진등록";
}
function tryOpenFilePicker(isAutoOpen){
  const fileInput = document.querySelector("#fileInput");
  if (!fileInput) {
    return;
  }
  fileInput.click();
  if (isAutoOpen) {
    setTimeout(() => {
      const mainPop = document.querySelector("#mainPop");
      const isOpen = mainPop && mainPop.style.display !== "none";
      const noSelection = !fileInput.files || fileInput.files.length === 0;
      if (isOpen && noSelection) {
        toastOn("자동 파일창이 차단되면 아래 사진등록 버튼을 눌러주세요.", 2500);
      }
    }, 350);
  }
}
function popUp(){
    const mainTitle = document.querySelector("#mainTitle");
    mainTitle.style="display:none";
    const mainContent = document.querySelector("#mainContent");
    mainContent.style="display:none";
    const pop = document.querySelector("#mainPop");
    pop.style="display:grid";
    const mainDiv = document.querySelector("#mainPopDiv");
    // mainDiv.replaceChildren();
    const fileInput = document.querySelector("#fileInput");
    if (fileInput) {
      fileInput.value = "";
    }
    isUploading = false;
    setUploadActionDisabled(false);
    resetUploadProgress();
   
    const table= document.querySelector("#popInfoTable");
    const thR = table.querySelectorAll("tr")[0];
    thR.style.height="3vh";
    thR.replaceChildren();
    let thList;
    const tBody = table.querySelectorAll("tbody")[0];
    tBody.replaceChildren();
    const fileTr = document.querySelector("#imgTr");
    fileTr.replaceChildren();
    const h3List = document.querySelectorAll(".popTitleC");
    for(let i=0;i<h3List.length;i++){
      h3List[i].innerHTML="";
    }
    if(ioValue=="InCargo"){
      thList=["품명","PLT","EA","비고",];
      database_f.ref(ref).get().then((snapshot)=>{
          const val = snapshot.val();
          const container = val["container"];
          const regTime = val["regTime"];
          if(regTime !=undefined){
            document.querySelector("#regTime").innerHTML=regTime;
          }
          h3List[0].innerHTML=val["consignee"];
          h3List[1].innerHTML=val["container"];
          h3List[2].innerHTML=val["bl"];
          h3List[2].style.fontSize="x-small";
          database_f.ref(ref).parent.get().then((snapshot)=>{
              const val = snapshot.val();
              for(let i in val){
              const cont = val[i]["container"];
              if(container==cont){
                const regTime = val[i]["regTime"];
                if(regTime !=undefined){
                  document.querySelector("#regTime").innerHTML=regTime;
                }
                  const tr = document.createElement("tr");
                  const td2 = document.createElement("td");
                  td2.innerHTML=val[i]["description"];
                  const td3 = document.createElement("td");
                  td3.innerHTML=val[i]["Pqty"];
                  const td4 = document.createElement("td");
                  td4.innerHTML=val[i]["incargo"];
                  const td5 = document.createElement("td");
                  td5.innerHTML=val[i]["remark"];
                  tr.appendChild(td2);
                  tr.appendChild(td3);
                  tr.appendChild(td4);
                  tr.appendChild(td5);
                  tBody.appendChild(tr);
              }}
              tBody.querySelectorAll("tr").forEach((tr)=>{
                tr.style.height="6vh";
              });
          }).catch((e)=>{
              console.log(e)});
  
      }).catch((e)=>{});
  }else if(ioValue=="outCargo"){
    thList=["품명","관리번호","PLT","EA","비고"];
     database_f.ref(ref).get().then((snapshot)=>{
          const val = snapshot.val();
          const regTime = val["regTime"];
          if(regTime !=undefined){
            document.querySelector("#regTime").innerHTML=regTime;
          }
          const des=val["description"].split(",");
          const manNo=val["managementNo"].split(",");
          const pQty = val["pltQty"].split(",");
          const eQty = val["eaQty"].split(",");
          h3List[0].innerHTML=val["consigneeName"];
          h3List[1].innerHTML=val["outwarehouse"];
          // const remark = val["remark"].split(" ,");
          let totalPlt=0;
          for(let i=0;i<des.length;i++){
            
              const tr = document.createElement("tr");
              const td1 = document.createElement("td");
              td1.innerHTML=des[i];
              const td2 = document.createElement("td");
              td2.innerHTML=manNo[i];
              const td3 = document.createElement("td");
              td3.innerHTML=pQty[i];
              totalPlt+=parseInt(pQty[i]);
              const td4 = document.createElement("td");
              td4.innerHTML=eQty[i];
              // const td5 = document.createElement("td");
              // td5.innerHTML=remark[i];
              tr.appendChild(td1);
              tr.appendChild(td2);
              tr.appendChild(td3);
              tr.appendChild(td4);
              // tr.appendChild(td5);
              tBody.appendChild(tr);
          }
          tBody.querySelectorAll("tr").forEach((tr)=>{
            tr.style.height="6vh";
          });
          h3List[2].innerHTML="총출고 "+totalPlt+" PLT";
          h3List[2].style="font-size:large;margin-top:3%;color:red;";
      }).catch((e)=>{});
  }
  
//   thList.forEach((e)=>{
//     const th = document.createElement("th");
//     th.innerHTML=e;
//     tr.appendChild(th);
//  });
 for(let i=0;i<thList.length;i++){
  const th = document.createElement("th");
  th.innerHTML=thList[i];
  thR.appendChild(th);
 }
//  for(let i=4;i<thList.length;i++){
//   const th = document.createElement("th");
//   th.innerHTML=thList[i];
//   thR1.appendChild(th);
//  }
  // thead.appendChild(tr);
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
    const uploadActionText = document.querySelector("#btnUploadActionText");
    if (uploadActionText) {
      uploadActionText.textContent = e.target.files.length > 0 ? "사진 업로드" : "사진등록";
    }
    for(let i=0;i<e.target.files.length;i++){
    const config = {
      file: e.target.files[i],
      maxSize: 1500,
    };
    const originalFileName = e.target.files[i].name;
    const imgTag = document.createElement("div");
    imgTag.className = "image-card";
    resizeImage(config)
      .then((resizedImage) => {
        const url = window.URL.createObjectURL(resizedImage);
        const img = document.createElement("img");
        img.className = "local-img"
        img.dataset.fileName = originalFileName;
        if (mC) {
          bindMobileImageDeleteEvents(img);
        } else {
          img.addEventListener("click", () => {
            showModal(img);
          });
        }
        img.setAttribute("src", url);
        img.style.display = "block";
        imgTag.appendChild(img);
        fileTr.appendChild(imgTag);
      })
      .catch((err) => {
        console.log(err);
      });
    }
    // document.querySelector(".upload-name").value=document.querySelector("#fileInput").value;
  };
  fileInput.onchange = handleImgInput;
  fileTr.replaceChildren();
  let imgRef=ref.replace("DeptName","images").replaceAll("/",",");
  // imgRef.replace("/",",");
  imgRef = imgRef.split(",");
  const io=imgRef[4];
  const dateArr = imgRef[2];
  imgRef[3]=dateArr;
  imgRef[2]=io;
  imgRef.splice(4,1);
  imgRef=imgRef.toString().replaceAll(",","/")+"/";
  refFile=imgRef;
  storage_f.ref(imgRef).listAll().then((res)=>{
    const hasServerImages = res.items && res.items.length > 0;
    if (isMobilePopupContext()) {
      if (!hasServerImages) {
        setUploadActionMode("register", "사진등록");
        setTimeout(() => {
          const mainPop = document.querySelector("#mainPop");
          if (mainPop && mainPop.style.display !== "none") {
            tryOpenFilePicker(true);
          }
        }, 0);
        return;
      }
      setUploadActionMode("check", "사진확인");
      return;
    }
    loadServerImages(imgRef);
  });
};
const fileTr = document.querySelector("#imgTr");
function loadServerImages(imageRef){
  if (!imageRef) {
    return Promise.resolve();
  }
  fileTr.replaceChildren();
  return storage_f.ref(imageRef).listAll().then((res)=>{
    const downloadPromises = res.items.map((itemRef)=>{
      return itemRef.getDownloadURL().then((url)=>{
        const td = document.createElement("div");
        td.className = "image-card";
        const img = document.createElement("img");
        img.src = url;
        img.className = "server-img";
        img.dataset.fileName = itemRef.name;
        img.dataset.serverPath = itemRef.fullPath;
        bindServerImageEvents(img, itemRef.fullPath);
        img.style.display = "block";
        td.appendChild(img);
        fileTr.appendChild(td);
      });
    });
    return Promise.all(downloadPromises);
  });
}
function handleUploadAction(){
  if (isUploading) {
    toastOn("업로드 진행중입니다.");
    return;
  }
  const uploadAction = document.querySelector("#btnUploadAction");
  if (isMobilePopupContext() && uploadAction && uploadAction.dataset.mode === "check") {
    loadServerImages(refFile).then(()=>{
      setUploadActionMode("register", "사진추가등록");
    }).catch((error)=>{
      console.error("서버 이미지 로드 오류:", error);
      toastOn("사진 로드 실패");
    });
    return;
  }
  const fileInput = document.querySelector("#fileInput");
  const hasSelectedFiles = fileInput && fileInput.files && fileInput.files.length > 0;
  if(!hasSelectedFiles){
    tryOpenFilePicker(false);
    return;
  }
  const proceedUpload = confirm("선택한 사진을 업로드할까요?\n취소를 누르면 파일을 다시 선택합니다.");
  if(proceedUpload){
    upLoad();
  }else{
    tryOpenFilePicker(false);
  }
}
async function upLoad(){
    let imgUrls = [];
    const img = fileTr.querySelectorAll(".local-img");
    const h3List = document.querySelectorAll(".popTitleC");
    const stockList ={"client":h3List[0].innerHTML};
    stockList[h3List[1].innerHTML]={"bl":h3List[2].innerHTML};
    if(img.length==0){
      toastOn("사진 전송 없이 작업 완료 등록만 진행 합니다.");
          }else{
            isUploading = true;
            setUploadActionDisabled(true);
            for(let i=0;i<img.length;i++){
              const imgSrc = img[i].src;
              imgUrls.push(imgSrc);
            }
            const storageRef = storage_f.ref(refFile);
            try{
              const blobs = await Promise.all(
                imgUrls.map((imgUrl) => fetch(imgUrl).then(response => response.blob()))
              );
              const uploadBlobs = await Promise.all(
                blobs.map((blob) => compressImageBlobToMaxBytes(blob, 100 * 1024))
              );
              const totalBytes = uploadBlobs.reduce((sum, blob)=>sum + blob.size, 0);
              const uploadedBytesByFile = {};
              setUploadProgress(0);

              const uploadPromises = uploadBlobs.map((blob, index)=>{
                const selectTr = document.querySelector(".clicked");
                const fileName = selectTr.cells[0].innerHTML+"_"+selectTr.cells[2].innerHTML+"_"+selectTr.cells[3].innerHTML+"_"+selectTr.cells[4].innerHTML+"_"+index+"_"+returnTime();
                const file = new File([blob], fileName, { type: blob.type });
                const fileRef = storageRef.child(fileName.replace("/","_"));
                const uploadTask = fileRef.put(file);

                return new Promise((resolve, reject)=>{
                  uploadTask.on("state_changed", (snapshot)=>{
                    uploadedBytesByFile[index] = snapshot.bytesTransferred;
                    const uploadedTotal = Object.values(uploadedBytesByFile).reduce((sum, value)=>sum + value, 0);
                    const percent = totalBytes > 0 ? (uploadedTotal / totalBytes) * 100 : 100;
                    setUploadProgress(percent);
                  }, (error)=>{
                    reject(error);
                  }, ()=>{
                    uploadedBytesByFile[index] = file.size;
                    const uploadedTotal = Object.values(uploadedBytesByFile).reduce((sum, value)=>sum + value, 0);
                    const percent = totalBytes > 0 ? (uploadedTotal / totalBytes) * 100 : 100;
                    setUploadProgress(percent);
                    resolve();
                  });
                });
              });

              await Promise.all(uploadPromises);
              setUploadProgress(100);

              console.log("업로드 완료");
              loadServerImages(refFile);
              toastOn(imgUrls.length+" 파일 업로드 완료");
            }catch(error){
              alert("Error uploading file:", error);
              console.error("Error uploading file:", error);
            }finally{
              isUploading = false;
              setUploadActionDisabled(false);
            }
          }
    let w;
    if(ioValue=="InCargo"){
      w={"working":"컨테이너진입","regTime":returnTime()};
    }else{
      w={"workprocess":"완","regTime":returnTime()};
    }
    database_f.ref(ref).update(w);
    const fileInput = document.querySelector("#fileInput");
    if (fileInput) {
      fileInput.value = "";
    }
    resetUploadProgress();
 
}


if(mC){
  
  // document.querySelector("#titleDate").style="display:none";
  // toastOn("모바일 환경에서 접속 됩니다.1");
  
  // const osRe = document.querySelector("#osRe");
  // osRe.classList.add("mobile");
  // osRe.classList.remove("osInput");
}else{
  const btn = document.querySelector("#titleDate");
  btn.innerHTML="일정 업로드 Page Load";
  // td.forEach((e)=>{
  //   console.log(e);
  //   e.style.fontSize="small";
  // });
  }
function toastOn(msg,t){
  if(t == null){
    t=2000;
  }
  const toastMessage = document.createElement("div");
  toastMessage.id="tost_message";
  toastMessage.innerHTML = msg; 
  toastMessage.classList.add('active');
  document.body.appendChild(toastMessage);
  setTimeout(function(){
      toastMessage.classList.remove('active');
  },t);
}

function dateNext(){
  const d = new Date(dateSelect.value);
  if(d.getDay()===5){
    d.setDate(d.getDate()+3);
    toastOn("다음주 월요일 로 지정 됩니다.")
  }else if(d.getDay()===6){
    d.setDate(d.getDate()+2);
    toastOn("다음주 월요일 로 지정 됩니다.")
  }else{
    d.setDate(d.getDate()+1);
  }
  dateSelect.value=dateT(d);
  dateChanged();
}
function osSubmit(){
  const date = document.querySelector("#dateSelect").value;
  const year = date.substring(0,4);
  const month= date.substring(5,7);
  const refOs ="DeptName/"+deptName+"/Os/"+year+"/"+month+"월/"+date;
  const osM= document.querySelector("#osMo").value;
  const osWf = document.querySelector("#osWf").value;
  const osWo = document.querySelector("#osWo").value;
  const osR = document.querySelector("#osRe").value;
  const osObject={"osM":osM,"osWf":osWf,"osWo":osWo,"osR":osR};
  database_f.ref(refOs).update(osObject).then((e)=>{
    toastOn(osObject);
  }).catch((e)=>{});
}
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/WmsMobile/firebase-messaging-sw.js').then((registration)=>{
    console.log('Service Worker 등록 완료:', registration.scope);
  }).catch((error)=>{
    console.error('Service Worker 등록 실패:', error);
  });
  function requestPermission(){
    Notification.requestPermission().then((permission)=> {
      if(permission == "granted"){
        console.log("Notification Permission Granted");
        getToken();
      } else {
        console.log("Unable to get Permission to Notify.");
      }
    });
    if(!("Notification" in window)){
      console.log("This browser does not support notifications.");
    }
  }
  
  function getToken() {
    // VAPID 키를 사용하여 토큰 요청 (GitHub Pages 호환)
    return messaging.getToken({ vapidKey: 'BMSh5U53qMZrt9KYOmmcjST0BBjua_nUcA3bzMO2l5OUEF6CgMnsu-_2Nf1PqwWsjuq3XEVrXZfGFPEMtE8Kr_k' })
      .then(currentToken => {
        if (currentToken) {
          token = currentToken;
          console.log('FCM Token received:', currentToken);
          return currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
          return null;
        }
      })
      .catch(err => {
        console.error('FCM 토큰 획득 오류:', err);
        return null;
      });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    requestPermission();
  
    // Example: Send a message after getting the token
    getToken().then(token => {
      if (token) {
        console.log('FCM Token:', token);
        // sendMessage(token, 'Hello!', 'This is a test message.', '/images/icon.png');
      }
    });
  });
}

messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
      body: payload.notification.body,
       icon: payload.notification.icon || '/images/default-icon.png'
  };
  console.log(notificationTitle,notificationOptions);
  new Notification(notificationTitle, notificationOptions);
  alert(payload.notification.body);
});

// Call requestPermission on page load

function sendMessage(token, title, body, icon) {
  const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';
  const serverKey = "AAAAYLjTacM:APA91bEfxvEgfzLykmd3YAu-WAI6VW64Ol8TdmGC0GIKao0EB9c3OMAsJNpPCDEUVsMgUkQjbWCpP_Dw2CNpF2u-4u3xuUF30COZslRIqqbryAAhQu0tGLdtFsTXU5EqsMGaMnGK8jpQ"; // Replace with your actual server key

  const messagePayload = {
    to: token,
    notification: {
      title: title,
      body: body,
      icon: icon || '/images/default-icon.png'
    }
  };

  fetch(fcmEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'key=' + serverKey
    },
    body: JSON.stringify(messagePayload)
  })
  .then(response => response.json())
  .then(data => {
    console.log('Message sent successfully:', data);
  })
  .catch(error => {
    console.error('Error sending message:', error);
  });
}
async function sendMessageToServer(message, token) {
  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', { // Your server's endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, token }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log('Notification request sent to server.');
  } catch (error) {
    console.error('Error sending notification request:', error);
  }
}
// // Example usage
// sendMessageToServer('Hello!', token);
 function reLoad(){
  if(mC){
    location.reload();
  }else{
    location.href="https://koacaiia.github.io/Wms-fine-/";
  }
 }

function popDetail(ref){
  location.href=`imagePop.html?ref=${encodeURIComponent(ref)}`;
}
function bindMobileImageDeleteEvents(imgTag, serverPath){
  if (!imgTag) {
    return;
  }
  let pressTimer = null;

  const removeCard = () => {
    const card = imgTag.closest(".image-card");
    if (card) {
      card.remove();
    }
  };

  const startPress = () => {
    if (isUploading) {
      return;
    }
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      const confirmMessage = serverPath
        ? "삭제 대상 서버 경로:\n" + serverPath + "\n\n해당 파일을 삭제하시겠습니까?"
        : "선택한 이미지를 삭제하시겠습니까?";
      const confirmDelete = confirm(confirmMessage);
      if (!confirmDelete) {
        return;
      }

      if (serverPath) {
        storage_f.ref(serverPath).delete().then(() => {
          removeCard();
          toastOn("서버 이미지 삭제 완료");
        }).catch((error) => {
          console.error("서버 이미지 삭제 오류:", error);
          toastOn("서버 이미지 삭제 실패");
        });
        return;
      }

      removeCard();
      toastOn("이미지 삭제 완료");
    }, 800);
  };

  const clearPress = () => {
    clearTimeout(pressTimer);
  };

  imgTag.addEventListener("mousedown", startPress);
  imgTag.addEventListener("touchstart", startPress, { passive: true });
  imgTag.addEventListener("mouseup", clearPress);
  imgTag.addEventListener("mouseleave", clearPress);
  imgTag.addEventListener("touchend", clearPress);
  imgTag.addEventListener("touchcancel", clearPress);
  imgTag.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  imgTag.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}
function bindServerImageEvents(imgTag, serverPath){
  if (!imgTag) {
    return;
  }
  if (!mC) {
    imgTag.addEventListener("click", () => {
      showModal(imgTag);
    });
    return;
  }
  bindMobileImageDeleteEvents(imgTag, serverPath);
}
function downloadImageFromImgTag(imgTag){
  if (!imgTag || !imgTag.src) {
    return;
  }
  const src = imgTag.src;
  const fallbackName = "image_" + returnTime().replaceAll(":", "-") + ".jpg";
  const fileName = imgTag.dataset.fileName || fallbackName;
  fetch(src)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, fileName);
    })
    .catch((error)=>{
      console.error("이미지 다운로드 오류:", error);
      toastOn("이미지 다운로드 실패");
    });
}
function closeMainPop(){
  const mainTitle = document.querySelector("#mainTitle");
  const mainContent = document.querySelector("#mainContent");
  const mainPop = document.querySelector("#mainPop");
  const fileInput = document.querySelector("#fileInput");
  const fileTr = document.querySelector("#imgTr");

  mainTitle.style = "display:grid";
  mainContent.style = "display:grid";
  mainPop.style = "display:none";

  document.querySelectorAll(".clicked").forEach((row)=>{
    row.classList.remove("clicked");
  });

  if (fileInput) {
    fileInput.value = "";
  }
  if (fileTr) {
    fileTr.replaceChildren();
  }
  isUploading = false;
  setUploadActionDisabled(false);
  resetUploadProgress();
}
function returnTime(){
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  return formattedTime;
}
function otherContents(e){
  if(e.id==otherPlt){
    location.href=e.id+".html";
  }else{
    window.location.href="https://koacaiia.github.io/CargoStatus/stockList.html"
  }
  
}
function showModal(imgTag){
    if (!imgTag) {
      return;
    }
    modalTargetImage = imgTag;
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    modalImg.src = imgTag.src;
    modal.style.display = "block";
    modalImg.style ="object-fit:scale-down;width:100%;height:90%";
}
function fileRemove() {
  const targetImg = modalTargetImage;
  if (!targetImg) {
    closeModal();
    return;
  }
  const confirmRemove = confirm("파일을 삭제하시겠습니까?");
  if (!confirmRemove) {
    return;
  }

  const removeCard = () => {
    const card = targetImg.closest(".image-card");
    if (card) {
      card.remove();
    }
  };

  if (targetImg.classList.contains("server-img")) {
    const serverPath = targetImg.dataset.serverPath;
    const deletePromise = serverPath
      ? storage_f.ref(serverPath).delete()
      : firebase.storage().refFromURL(targetImg.src).delete();
    deletePromise.then(() => {
      removeCard();
      toastOn("이미지 삭제 완료");
      closeModal();
    }).catch((error) => {
      console.error("이미지 삭제 오류:", error);
      toastOn("이미지 삭제 실패");
    });
    return;
  }

  removeCard();
  toastOn("이미지 삭제 완료");
  closeModal();
}
function closeModal() {
  const modal = document.getElementById("imgModal");
  modalTargetImage = null;
  modal.style.display = "none";
}
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("imgModal");
  if (!modal) {
    return;
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });
});
function deleteImage() {
  const modalImg = document.getElementById("modalImg");
  const imgTag = modalImg.dataset.imgTag;
  console.log(imgTag);
  imgTag.remove();
  closeModal();
}
function saveImg() {
  if (!modalTargetImage) {
    closeModal();
    return;
  }
  downloadImageFromImgTag(modalTargetImage);
  closeModal();
  
}
//test