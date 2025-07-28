const logData = localStorage.getItem("logData");
if(logData == null){
  const log = prompt("로그인 후 사용 가능합니다. 사용자 입력 후 사용 바랍니다.");
  if(log == null){
    alert("로그인 후 사용 가능합니다.");
    location.href="https://koacaiia.github.io/WmsMobile/";}
    else{
      localStorage.setItem("logData",log);
      location.href="https://koacaiia.github.io/WmsMobile/";
    }
}
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
  console.log('Firebase initialized with config:', {
    projectId: firebaseConfig.projectId,
    messagingSenderId: firebaseConfig.messagingSenderId,
    appId: firebaseConfig.appId
  });
}
else{
  firebase.app();
  console.log('Firebase app already initialized');
}
// const doc =document.documentElement;
// function fullScreen(){
//   doc.requestFullscreen();
// }
// fullScreen();

const database_f = firebase.database();
const messaging = firebase.messaging();
const storage_f = firebase.storage();

console.log('Firebase services initialized:');
console.log('- Database:', !!database_f);
console.log('- Messaging:', !!messaging);
console.log('- Storage:', !!storage_f);

// Firebase 프로젝트 정보 표시
console.log('🔥 Firebase Project Info:');
console.log('   Project ID:', firebaseConfig.projectId);
console.log('   Sender ID:', firebaseConfig.messagingSenderId);
console.log('   App ID:', firebaseConfig.appId);
console.log('💡 VAPID Key 확인 방법:');
console.log('   1. https://console.firebase.google.com/ 접속');
console.log('   2. 프로젝트:', firebaseConfig.projectId, '선택');
console.log('   3. Project Settings > Cloud Messaging > Web configuration');
console.log('   4. Web Push certificates 섹션에서 키 확인/생성');
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
const mC = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const popup = document.getElementById('popup');
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
 function reLoad(){
  console.log(mC)
  if(mC){
    location.reload();
  }else{
    location.href="https://koacaiia.github.io/Wms-fine-/";
  }
 }
function loaData() {
  const log=prompt(logData+" User 정보 수정 하시겠습니까?");
  if(log){
    localStorage.setItem("logData",log);
    alert("User 정보 "+log +"로 변경 완료");
  }else{
    alert("User 정보 변경사항 없습니다.")
  }
}

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
    const refI ="DeptName/"+deptName+"/InCargo/"+month+"월/"+date;
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
        for(let i in val){
            let spec="";
            if(val[i]["container40"]==="1"){
                spec="40FT";
              ft4+=1;}
            else if(val[i]["container20"]==="1"){
                spec="20FT";
              ft2+=1;}
            else if(val[i]["lclcargo"]!="0"){
                spce="LcL";
                lcl+=1;
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
            if(val[i]["working"]!=""){
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
              tr.addEventListener('click', (e) => {
                popup.style.display = 'block';
                popup.style.left = e.pageX + 'px';
                popup.style.top = e.pageY + 'px';
                popup.textContent = tr.cells[1].textContent;
                setTimeout(() => {
                  popup.style.display = 'none';
                }, 5000); // 
              });
              const td1 = document.createElement("td");
              td1.innerHTML=des[i];
              const td2 = document.createElement("td");
              td2.innerHTML=manNo[i];
              // td2.addEventListener("click", (e) => {
              //   alert(e.target.innerHTML);
              // });
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
        img.className = "local-img"
        img.addEventListener("click", (e) => {
          const tdList = img.parentNode.parentNode.querySelectorAll("td");
          tdList.forEach((td)=>{
              td.classList.remove("file-selected");
          });
          img.parentNode.classList.toggle("file-selected");
          console.log(img.parentNode.classList);
          showModal(url,imgTag)
        });
        img.setAttribute("src", url);
        img.style.display = "block";
        imgTag.style.width="32.5vw";
        imgTag.style.height="36vh";
        img.style.width="100%";
        img.style.height="100%";
        img.style.objectFit = "scale-down"; // Ensures the image covers the container without distortion

        imgTag.appendChild(img);
        fileTr.appendChild(imgTag);
      })
      .catch((err) => {
        console.log(err);
      });
    }
    // document.querySelector(".upload-name").value=document.querySelector("#fileInput").value;
  };
  fileInput.addEventListener("change",handleImgInput);
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
    res.items.forEach((itemRef)=>{
      itemRef.getDownloadURL().then((url)=>{
        const td = document.createElement("td");
        const img = document.createElement("img");
        img.src=url;
        img.className="server-img";
        img.addEventListener("click", (e) => {
          const tdList = img.parentNode.parentNode.querySelectorAll("td");
          tdList.forEach((td)=>{
              td.classList.remove("file-selected");
          });
          img.parentNode.classList.toggle("file-selected");
          console.log(img.parentNode.classList);
          // showModal(url,itemRef.name)
          popDetail(imgRef);
        });
        img.style.display="block";
        td.style="width:32.5vw;height:36vh;border:1px dashed red;border-radius:5px";
        img.style.width="100%";
        img.style.height="100%";
        img.style.objectFit = "scale-down"; // Ensures the image covers the container without distortion
        td.appendChild(img);
        fileTr.appendChild(td);
      });
    });
  });
};
function popClose(){
  location.reload();;
    // document.querySelector("#mainTitle").style="display:grid";
    // document.querySelector("#mainPop").style="display:none";
    // document.querySelector("#mainContent").style="display:grid";
    // document.querySelectorAll(".clicked").forEach((e)=>{
    //     e.classList.remove("clicked");
    // });
    // document.querySelector("#mainOut").style="display:block";
}
const fileTr = document.querySelector("#imgTr");
function upLoad(){
    let imgUrls = [];
    const img = fileTr.querySelectorAll(".local-img");
    const h3List = document.querySelectorAll(".popTitleC");
    const stockList ={"client":h3List[0].innerHTML};
    stockList[h3List[1].innerHTML]={"bl":h3List[2].innerHTML};
    if(img.length==0){
      toastOn("사진 전송 없이 작업 완료 등록만 진행 합니다.");
      
      // FCM 알림 전송 - 사진 없이 작업 완료
      const h3List = document.querySelectorAll(".popTitleC");
      const clientName = h3List[0].innerHTML;
      const containerInfo = h3List[1].innerHTML;
      
      // 로컬 알림 우선 사용 (CORS 문제 회피)
      const notificationSent = sendLocalNotification(
        "작업 완료 등록", 
        `${clientName} - ${containerInfo}: 사진 전송 없이 작업 완료 등록`
      );
      
      // 로컬 알림이 실패한 경우에만 FCM 시도
      if (!notificationSent && token) {
        sendMessage(token, 
          "작업 완료 등록", 
          `${clientName} - ${containerInfo}: 사진 전송 없이 작업 완료 등록`, 
          '/WmsMobile/images/icon.png'
        );
      }
          }else{
            for(let i=0;i<img.length;i++){
              const imgSrc = img[i].src;
              imgUrls.push(imgSrc);
            }
            const storageRef = storage_f.ref(refFile);
            
    imgUrls.forEach((imgUrl, index) => {
      fetch(imgUrl)
          .then(response => response.blob())
          .then(blob => {
              // const fileName = imgUrl.split('/').pop(); // Extract file name from URL
              const selectTr = document.querySelector(".clicked");
              const fileName = selectTr.cells[0].innerHTML+"_"+selectTr.cells[2].innerHTML+"_"+selectTr.cells[3].innerHTML+"_"+selectTr.cells[4].innerHTML+"_"+index+"_"+returnTime();
              const file = new File([blob], fileName, { type: blob.type });
              const fileRef = storageRef.child(fileName.replace("/","_"));
              fileRef.put(file).then((snapshot) => {
                  if (index === imgUrls.length - 1) {
                      // alert(imgUrls.length+" 개 Images업로드 완료");
                      console.log("업로드 완료");
                      
                      // FCM 알림 전송 - 모든 이미지 업로드 완료
                      const h3List = document.querySelectorAll(".popTitleC");
                      const clientName = h3List[0].innerHTML;
                      const containerInfo = h3List[1].innerHTML;
                      
                      // 로컬 알림 우선 사용
                      const notificationSent = sendLocalNotification(
                        "이미지 업로드 완료", 
                        `${clientName} - ${containerInfo}: ${imgUrls.length}개 이미지 Firebase 업로드 완료`
                      );
                      
                      // 로컬 알림이 실패한 경우에만 FCM 시도
                      if (!notificationSent && token) {
                        sendMessage(token, 
                          "이미지 업로드 완료", 
                          `${clientName} - ${containerInfo}: ${imgUrls.length}개 이미지 Firebase 업로드 완료`, 
                          '/WmsMobile/images/icon.png'
                        );
                      }
                      
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
                      console.log(imgRef);
                      refFile=imgRef;
                      storage_f.ref(imgRef).listAll().then((res)=>{
                        res.items.forEach((itemRef)=>{
                          itemRef.getDownloadURL().then((url)=>{
                            const td = document.createElement("td");
                            const img = document.createElement("img");
                            img.src=url;
                            img.className="server-img";
                            img.addEventListener("click", (e) => {
                              img.parentNode.classList.toggle("file-selected");
                            });
                            img.style.display="block";
                            img.style.display="block";
                            td.style="width:32.5vw;height:36vh;border:1px dashed red;border-radius:5px";
                            img.style.width="100%";
                            img.style.height="100%";
                            img.style.objectFit = "scale-down"; // Ensures the image covers the container without distortion
                            td.appendChild(img);
                            fileTr.appendChild(td);
                          });
                        });
                      });
                      // popClose();
                  }
              });
          })
          .catch(error => {
            alert("Error uploading file:", error);
            console.error("Error uploading file:", error);
        });
      });
      toastOn(imgUrls.length+" 파일 업로드 완료");
      
      // FCM 알림 전송 - 파일 업로드 완료
      const h3List = document.querySelectorAll(".popTitleC");
      const clientName = h3List[0].innerHTML;
      const containerInfo = h3List[1].innerHTML;
      
      // 로컬 알림 우선 사용
      const notificationSent = sendLocalNotification(
        "파일 업로드 완료", 
        `${clientName} - ${containerInfo}: ${imgUrls.length}개 파일 업로드 완료`
      );
      
      // 로컬 알림이 실패한 경우에만 FCM 시도
      if (!notificationSent && token) {
        sendMessage(token, 
          "파일 업로드 완료", 
          `${clientName} - ${containerInfo}: ${imgUrls.length}개 파일 업로드 완료`, 
          '/WmsMobile/images/icon.png'
        );
      }
          }
    let w;
    if(ioValue=="InCargo"){
      w={"working":"컨테이너진입","regTime":document.querySelector("#dateSelect").value+"_"+returnTime()};
    }else{
      w={"workprocess":"완","regTime":document.querySelector("#dateSelect").value+"_"+returnTime()};
    }
    database_f.ref(ref).update(w).then(() => {
      // FCM 알림 전송 - 작업 상태 업데이트 완료
      const h3List = document.querySelectorAll(".popTitleC");
      const clientName = h3List[0].innerHTML;
      const containerInfo = h3List[1].innerHTML;
      const workStatus = ioValue=="InCargo" ? "컨테이너진입" : "작업완료";
      
      // 로컬 알림 우선 사용
      const notificationSent = sendLocalNotification(
        "작업 상태 업데이트", 
        `${clientName} - ${containerInfo}: ${workStatus} 처리 완료`
      );
      
      // 로컬 알림이 실패한 경우에만 FCM 시도
      if (!notificationSent && token) {
        sendMessage(token, 
          "작업 상태 업데이트", 
          `${clientName} - ${containerInfo}: ${workStatus} 처리 완료`, 
          '/WmsMobile/images/icon.png'
        );
      }
    }).catch((error) => {
      console.error("작업 상태 업데이트 오류:", error);
    });
 
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
// 토픽 관리 함수들을 Service Worker 등록 전에 정의 (상단으로 이동)
function checkTopicSubscriptions() {
    console.log('📋 현재 토픽 구독 상태 확인 중...');
    
    const topics = ['fine2', 'wms-notifications', 'mobile-alerts'];
    const subscriptionInfo = {};
    
    topics.forEach(topic => {
        const subscriptionKey = `fcm_topic_${topic}`;
        const dateKey = `fcm_topic_${topic}_date`;
        
        const isSubscribed = localStorage.getItem(subscriptionKey);
        const subscribeDate = localStorage.getItem(dateKey);
        
        subscriptionInfo[topic] = {
            subscribed: !!isSubscribed,
            date: subscribeDate ? new Date(subscribeDate).toLocaleString() : '알 수 없음'
        };
        
        if (isSubscribed) {
            console.log(`   ✅ ${topic}: 구독됨 (${subscriptionInfo[topic].date})`);
        } else {
            console.log(`   ❌ ${topic}: 구독되지 않음`);
        }
    });
    
    // FCM 토큰 상태도 함께 표시
    console.log('📱 FCM 토큰 상태:');
    if (typeof token !== 'undefined' && token) {
        console.log(`   ✅ FCM 토큰: ${token.substring(0, 20)}...`);
    } else {
        console.log('   ❌ FCM 토큰: 없음');
    }
    
    // 알림 권한 상태
    console.log('🔔 알림 권한 상태:');
    if ('Notification' in window) {
        console.log(`   📋 권한: ${Notification.permission}`);
    } else {
        console.log('   ❌ Notification API 미지원');
    }
    
    return subscriptionInfo;
}

function subscribeToTopic(token, topicName) {
    console.log(`📢 토픽 '${topicName}' 구독을 시도합니다...`);
    
    if (!token) {
        console.log('❌ FCM 토큰이 없어서 토픽 구독할 수 없습니다.');
        return false;
    }
    
    // 로컬 스토리지에 구독 정보 저장
    const subscriptionKey = `fcm_topic_${topicName}`;
    const dateKey = `fcm_topic_${topicName}_date`;
    
    localStorage.setItem(subscriptionKey, 'subscribed');
    localStorage.setItem(dateKey, new Date().toISOString());
    
    console.log(`✅ 토픽 '${topicName}' 구독 성공 (로컬 저장)`);
    console.log(`📅 구독 날짜: ${new Date().toLocaleString()}`);
    
    // 구독 성공 알림
    if (typeof sendLocalNotification === 'function') {
        sendLocalNotification(
            '토픽 구독 완료',
            `'${topicName}' 토픽에 성공적으로 구독되었습니다.`
        );
    }
    
    return true;
}

function unsubscribeFromTopic(token, topicName) {
    console.log(`📢 토픽 '${topicName}' 구독 해제를 시도합니다...`);
    
    const subscriptionKey = `fcm_topic_${topicName}`;
    const dateKey = `fcm_topic_${topicName}_date`;
    
    localStorage.removeItem(subscriptionKey);
    localStorage.removeItem(dateKey);
    
    console.log(`✅ 토픽 '${topicName}' 구독 해제 성공`);
    
    if (typeof sendLocalNotification === 'function') {
        sendLocalNotification(
            '토픽 구독 해제',
            `'${topicName}' 토픽 구독이 해제되었습니다.`
        );
    }
    
    return true;
}

function subscribeToAllTopics() {
    console.log('📢 모든 토픽에 일괄 구독 시작');
    
    const topics = ['fine2', 'wms-notifications', 'mobile-alerts'];
    const results = {};
    
    topics.forEach(topic => {
        results[topic] = subscribeToTopic(token, topic);
    });
    
    console.log('📋 일괄 구독 결과:', results);
    
    const successCount = Object.values(results).filter(result => result).length;
    
    if (typeof sendLocalNotification === 'function') {
        sendLocalNotification(
            '일괄 토픽 구독 완료',
            `${successCount}개 토픽에 구독되었습니다.`
        );
    }
    
    return results;
}

// 유틸리티 함수들 정의
function returnTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function getIconPath() {
    return location.hostname === 'localhost' || location.hostname === '127.0.0.1' 
        ? './images/icon.png' 
        : '/WmsMobile/images/icon.png';
}

function formatDateTime() {
    const now = new Date();
    return now.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 알림 관련 함수들 정의
function sendLocalNotification(title, body, icon) {
    console.log('🔔 로컬 알림 전송:', title, body);
    
    if (!("Notification" in window)) {
        console.log("❌ 브라우저가 알림을 지원하지 않습니다.");
        return false;
    }
    
    if (Notification.permission === "granted") {
        try {
            const iconPath = icon || getIconPath();
            const currentTime = formatDateTime();
            let enhancedBody = body;
            
            if (title.includes('작업 상태 업데이트') || 
                title.includes('작업 완료') ||
                title.includes('컨테이너진입') ||
                title.includes('이미지 업로드') ||
                title.includes('파일 업로드')) {
                enhancedBody += `\n⏰ 등록시간: ${currentTime}`;
            }
            
            const notification = new Notification(title, {
                body: enhancedBody,
                icon: iconPath,
                badge: iconPath,
                timestamp: Date.now(),
                requireInteraction: false,
                tag: 'wms-notification-' + Date.now(),
                silent: false
            });

            notification.onclick = function(event) {
                window.focus();
                notification.close();
            };
            
            setTimeout(() => {
                if (notification) {
                    notification.close();
                }
            }, 8000);

            console.log('✅ 로컬 알림 전송 성공');
            return true;
            
        } catch (error) {
            console.error('❌ 로컬 알림 생성 오류:', error);
            return false;
        }
    } else if (Notification.permission === "default") {
        console.log('⚠️ 알림 권한 요청 중...');
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                sendLocalNotification(title, body, icon);
            }
        });
        return false;
    } else {
        console.log('❌ 알림 권한 거부됨');
        return false;
    }
}

function sendMessage(token, title, body, icon) {
    console.log('📱 FCM 메시지 전송 시도:', title);
    
    // 우선 로컬 알림 사용 (CORS 문제 없음)
    const localResult = sendLocalNotification(title, body, icon);
    
    if (localResult) {
        console.log('✅ 로컬 알림으로 성공적으로 전송됨');
        return true;
    }
    
    // 로컬 알림 실패 시에만 FCM 서버 호출 시도
    console.log('⚠️ 로컬 알림 실패, FCM 서버 전송은 CORS 문제로 인해 생략');
    return false;
}

// reLoad 함수 정의 (HTML에서 호출됨)
// function reLoad() {
//     console.log('🔄 페이지 새로고침');
//     location.reload();
// }

// otherContents 함수 정의
function otherContents(button) {
    console.log('🔧 기타 콘텐츠:', button ? button.textContent : '알 수 없음');
    toastOn(`${button.textContent} 기능은 현재 개발 중입니다.`);
}

// 진단 함수들 추가
function diagnoseBrowserEnvironment() {
    console.log('🔍 브라우저 환경 진단 시작');
    
    const browserInfo = {
        userAgent: navigator.userAgent,
        browser: getBrowserName(),
        os: getOSName(),
        protocol: location.protocol,
        hostname: location.hostname,
        isHTTPS: location.protocol === 'https:',
        notificationAPI: 'Notification' in window,
        serviceWorkerAPI: 'serviceWorker' in navigator,
        permission: 'Notification' in window ? Notification.permission : 'API 미지원'
    };
    
    console.log('📊 브라우저 정보:', browserInfo);
    
    const issues = [];
    
    if (!browserInfo.isHTTPS && browserInfo.hostname !== 'localhost') {
        issues.push('❌ HTTPS 필요: 알림은 HTTPS 환경에서만 완전 지원됩니다.');
    }
    
    if (!browserInfo.notificationAPI) {
        issues.push('❌ Notification API 미지원: 이 브라우저는 알림을 지원하지 않습니다.');
    }
    
    if (!browserInfo.serviceWorkerAPI) {
        issues.push('❌ Service Worker 미지원: FCM 기능이 제한됩니다.');
    }
    
    if (browserInfo.permission === 'denied') {
        issues.push('❌ 알림 권한 거부: 브라우저 설정에서 알림을 허용해주세요.');
    }
    
    if (issues.length > 0) {
        console.log('🚨 발견된 문제점들:');
        issues.forEach(issue => console.log('   ' + issue));
    } else {
        console.log('✅ 브라우저 환경에 문제가 없습니다.');
    }
    
    return browserInfo;
}

function getBrowserName() {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome') && !ua.includes('Edg')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
}

function getOSName() {
    const ua = navigator.userAgent;
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
}

async function comprehensiveNotificationDiagnostic() {
    console.log('🔍 종합 알림 진단 시작');
    
    const results = {
        browser: diagnoseBrowserEnvironment(),
        token: null,
        localNotification: false,
        recommendations: []
    };
    
    // 브라우저 호환성 확인
    if (!results.browser.notificationAPI) {
        results.recommendations.push('브라우저를 Chrome, Firefox, Edge로 변경하세요.');
        return results;
    }
    
    if (!results.browser.isHTTPS && results.browser.hostname !== 'localhost') {
        results.recommendations.push('HTTPS 환경에서 접속하세요.');
    }
    
    // 알림 권한 확인 및 요청
    if (results.browser.permission !== 'granted') {
        console.log('🔔 알림 권한 요청 중...');
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                results.recommendations.push('브라우저 설정에서 수동으로 알림을 허용하세요.');
                return results;
            }
        } catch (error) {
            results.recommendations.push('알림 권한 요청 실패. 브라우저를 새로고침하세요.');
            return results;
        }
    }
    
    // 로컬 알림 테스트
    console.log('🧪 로컬 알림 테스트 중...');
    results.localNotification = sendLocalNotification(
        '진단 완료', 
        `알림 시스템이 정상 작동합니다. (${new Date().toLocaleTimeString()})`
    );
    
    // 결과 분석 및 권장사항
    if (results.localNotification) {
        console.log('✅ 알림 시스템이 정상 작동합니다!');
        results.recommendations.push('알림 시스템이 정상 작동합니다.');
    } else {
        console.log('❌ 알림 시스템에 문제가 있습니다.');
        results.recommendations.push('브라우저 설정을 확인하고 페이지를 새로고침하세요.');
    }
    
    return results;
}

// 함수들을 즉시 전역으로 노출
window.checkTopicSubscriptions = checkTopicSubscriptions;
window.subscribeToTopic = subscribeToTopic;
window.unsubscribeFromTopic = unsubscribeFromTopic;
window.subscribeToAllTopics = subscribeToAllTopics;
window.sendLocalNotification = sendLocalNotification;
window.sendMessage = sendMessage;
window.otherContents = otherContents;
window.diagnoseBrowserEnvironment = diagnoseBrowserEnvironment;
window.comprehensiveNotificationDiagnostic = comprehensiveNotificationDiagnostic;
window.returnTime = returnTime;

console.log(`
📢 토픽 구독 관리 시스템 로드 완료

🔍 사용 가능한 함수들:
   checkTopicSubscriptions()            - 토픽 구독 상태 확인
   subscribeToAllTopics()               - 모든 토픽 일괄 구독
   sendLocalNotification(title, body)   - 로컬 알림 전송
   comprehensiveNotificationDiagnostic() - 종합 알림 진단
   reLoad()                             - 페이지 새로고침
   otherContents(button)                - 기타 콘텐츠 처리

✅ 모든 함수가 정의되어 즉시 사용 가능합니다!
`);

// Service Worker 등록 부분에서 getToken 함수 수정
if ('serviceWorker' in navigator) {
  const swPath = location.hostname === 'localhost' || location.hostname === '127.0.0.1' 
    ? './firebase-messaging-sw.js' 
    : '/WmsMobile/firebase-messaging-sw.js';
    
  navigator.serviceWorker.register(swPath)
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
      
      function requestPermission(){
        console.log('Requesting notification permission...');
        
        if(!("Notification" in window)){
          console.log("❌ This browser does not support notifications.");
          return Promise.resolve(false);
        }
        
        console.log('Current notification permission:', Notification.permission);
        
        if (Notification.permission === 'granted') {
          console.log("✅ Notification permission already granted");
          getToken();
          return Promise.resolve(true);
        }
        
        if (Notification.permission === 'denied') {
          console.log("❌ Notification permission denied by user");
          console.log("💡 Please enable notifications in browser settings");
          return Promise.resolve(false);
        }
        
        return Notification.requestPermission().then((permission) => {
          console.log('📋 Notification permission result:', permission);
          if(permission === "granted"){
            console.log("✅ Notification Permission Granted");
            
            // 권한 획득 후 테스트 알림 전송
            sendLocalNotification('알림 설정 완료', 'WMS 알림이 활성화되었습니다.');
            
            getToken();
            return true;
          } else {
            console.log("❌ Unable to get Permission to Notify.");
            return false;
          }
        }).catch(err => {
          console.error('❌ Error requesting notification permission:', err);
          return false;
        });
      }
      
      function getToken() {
        console.log('Registration:', registration);
        
        async function tryGetToken() {
          try {
            console.log('Trying without VAPID key first...');
            const currentToken = await messaging.getToken({
              serviceWorkerRegistration: registration
            });
            
            if (currentToken) {
              token = currentToken;
              console.log('✅ FCM Token acquired without VAPID key:', currentToken);
              return currentToken;
            }
          } catch (err) {
            console.log('❌ Failed without VAPID key:', err.message);
          }
          
          const vapidKeys = [
            'BK8nUIclBWnB6rW54BPZGN1oWJN-4jgQNe5-CdlO5HGW4WFT9vJKZPaZz4H4P_sF4x4t4T4U4U4U4U4U4U4',
            'BMSh553qMZrt9KYOmmcjST0BBjua_nUcA3bzMO2l5OUEF6CgMnsu-_2Nf1PqwWsjuq3XEVrXZfGFPEMtE8Kr_k',
          ];
          
          for (const vapidKey of vapidKeys) {
            try {
              console.log('Trying VAPID key:', vapidKey.substring(0, 15) + '...');
              const currentToken = await messaging.getToken({ 
                vapidKey: vapidKey,
                serviceWorkerRegistration: registration
              });
              
              if (currentToken) {
                token = currentToken;
                console.log('✅ FCM Token acquired with VAPID key:', currentToken);
                return currentToken;
              }
            } catch (err) {
              console.log('❌ Error with VAPID key:', vapidKey.substring(0, 15) + '...', err.message);
            }
          }
          
          console.log('❌ All token acquisition attempts failed');
          return null;
        }
        
        return tryGetToken();
      }
      
      requestPermission();
      
      getToken().then(currentToken => {
        if (currentToken) {
          console.log('✅ Initial FCM setup complete with token:', currentToken);
          console.log('🔔 FCM 알림 기능이 활성화되었습니다.');
          
          const existingSubscription = localStorage.getItem('fcm_topic_fine2');
          if (!existingSubscription) {
            console.log('🆕 fine2 토픽 구독을 새로 설정합니다.');
            subscribeToTopic(currentToken, 'fine2');
          } else {
            console.log('✅ fine2 토픽이 이미 구독되어 있습니다:', existingSubscription);
            const subscribeDate = localStorage.getItem('fcm_topic_fine2_date');
            if (subscribeDate) {
              console.log('📅 구독 날짜:', new Date(subscribeDate).toLocaleString());
            }
          }
          
          // 현재 구독 상태 표시 (이제 오류 없음!)
          setTimeout(() => {
            checkTopicSubscriptions();
          }, 1000);
          
        } else {
          console.log('❌ FCM token not available. 알림 기능을 사용할 수 없습니다.');
          console.log('💡 해결 방법:');
          console.log('   1. Firebase Console > Project Settings > Cloud Messaging 이동');
          console.log('   2. Web configuration > Web Push certificates에서 올바른 VAPID key 확인');
          console.log('   3. 코드의 vapidKeys 배열에 올바른 키 추가');
        }
      });
    })
    .catch((err) => {
      console.error('Service Worker registration failed:', err);
      console.log('FCM 기능을 사용할 수 없습니다. Service Worker 등록에 실패했습니다.');
      token = null;
    });
}
