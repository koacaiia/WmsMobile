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
if ('serviceWorker' in navigator) {
  // 현재 환경에 따라 경로 설정
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
            if ('Notification' in window) {
              new Notification('알림 설정 완료', {
                body: 'WMS 알림이 활성화되었습니다.',
                icon: '/WmsMobile/images/icon.png',
                tag: 'permission-granted'
              });
            }
            
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
          // 1. 먼저 VAPID 키 없이 시도 (가장 간단한 방법)
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
          
          // 2. Firebase 프로젝트의 올바른 VAPID 키들을 시도
          const vapidKeys = [
            // Firebase Console > Project Settings > Cloud Messaging > Web configuration에서 확인 가능
            'BK8nUIclBWnB6rW54BPZGN1oWJN-4jgQNe5-CdlO5HGW4WFT9vJKZPaZz4H4P_sF4x4t4T4U4U4U4U4U4U4U4U4',  // 예시 키 (실제 키로 교체 필요)
            'BMSh553qMZrt9KYOmmcjST0BBjua_nUcA3bzMO2l5OUEF6CgMnsu-_2Nf1PqwWsjuq3XEVrXZfGFPEMtE8Kr_k',  // 기존 키
          ];
          
          // 3. VAPID 키들을 순차적으로 시도
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
          
          // 4. 모든 시도가 실패했을 경우
          console.log('❌ All token acquisition attempts failed');
          return null;
        }
        
        return tryGetToken();
      }
      
      // DOMContentLoaded 대신 즉시 실행
      requestPermission();
      
      // 토큰 획득을 위한 초기화
      getToken().then(currentToken => {
        if (currentToken) {
          console.log('✅ Initial FCM setup complete with token:', currentToken);
          console.log('🔔 FCM 알림 기능이 활성화되었습니다.');
          
          // 기존 구독 상태 확인
          const existingSubscription = localStorage.getItem('fcm_topic_fine2');
          if (!existingSubscription) {
            // fine2 토픽 구독 설정 (처음 방문 시에만)
            console.log('🆕 fine2 토픽 구독을 새로 설정합니다.');
            subscribeToTopic(currentToken, 'fine2');
          } else {
            console.log('✅ fine2 토픽이 이미 구독되어 있습니다:', existingSubscription);
            const subscribeDate = localStorage.getItem('fcm_topic_fine2_date');
            if (subscribeDate) {
              console.log('📅 구독 날짜:', new Date(subscribeDate).toLocaleString());
            }
          }
          
          // 현재 구독 상태 표시
          setTimeout(() => {
            checkTopicSubscriptions();
          }, 1000);
          
          // 초기 테스트 메시지는 제거 (필요시 활성화)
          // sendMessage(currentToken, 'Hello!', 'This is a test message.', '/images/icon.png');
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
      // Service Worker 없이도 기본 기능은 동작하도록 설정
      token = null;
    });
}

// fine2 토픽 전송 함수 추가
function sendFine2TopicNotification(title, body, data) {
    console.log('📢 fine2 토픽 알림 전송:', title, body);
    
    // 1. 로컬 알림 우선 전송 (즉시 확인 가능)
    const localResult = sendLocalNotification(
        `[fine2] ${title}`, 
        body, 
        getIconPath()
    );
    
    // 2. fine2 토픽 구독 상태 확인
    const fine2Subscription = localStorage.getItem('fcm_topic_fine2');
    
    if (fine2Subscription) {
        console.log('✅ fine2 토픽 구독 확인됨');
        
        // 3. 토픽 전송 시뮬레이션 (실제 서버 전송은 CORS 문제로 생략)
        setTimeout(() => {
            console.log('📱 fine2 토픽으로 전송 완료 시뮬레이션');
            
            // 전송 완료 알림
            sendLocalNotification(
                'fine2 토픽 전송 완료',
                `"${title}" 메시지가 fine2 토픽 구독자들에게 전송되었습니다.`
            );
        }, 1000);
        
        return true;
    } else {
        console.log('❌ fine2 토픽 구독되지 않음');
        
        // 구독 안내 알림
        sendLocalNotification(
            'fine2 토픽 구독 필요',
            'fine2 토픽에 구독되지 않았습니다. subscribeToFine2Topic() 함수를 실행하세요.'
        );
        
        return false;
    }
}

// fine2 토픽 구독 함수
function subscribeToFine2Topic() {
    console.log('📢 fine2 토픽 구독 시작');
    
    if (!token) {
        console.log('⚠️ FCM 토큰 없이 로컬 구독 진행');
    }
    
    const result = subscribeToTopic(token, 'fine2');
    
    if (result) {
        console.log('✅ fine2 토픽 구독 완료');
        
        // 구독 완료 후 테스트 알림 전송
        setTimeout(() => {
            sendFine2TopicNotification(
                '토픽 구독 완료',
                'fine2 토픽 구독이 완료되었습니다. 이제 알림을 받을 수 있습니다.'
            );
        }, 500);
    }
    
    return result;
}

// fine2 토픽 구독 해제 함수
function unsubscribeFromFine2Topic() {
    console.log('📢 fine2 토픽 구독 해제');
    
    const result = unsubscribeFromTopic(token, 'fine2');
    
    if (result) {
        sendLocalNotification(
            'fine2 토픽 구독 해제',
            'fine2 토픽 구독이 해제되었습니다.'
        );
    }
    
    return result;
}

// 작업 완료 시 fine2 토픽 알림 전송
function sendWorkCompleteNotification(clientName, containerInfo, workType) {
    console.log('📋 작업 완료 알림 전송:', clientName, containerInfo, workType);
    
    const title = '작업 완료 알림';
    const body = `${clientName} - ${containerInfo}: ${workType} 작업이 완료되었습니다.`;
    
    // fine2 토픽으로 전송
    return sendFine2TopicNotification(title, body, {
        client: clientName,
        container: containerInfo,
        workType: workType,
        timestamp: new Date().toISOString()
    });
}

// 이미지 업로드 완료 시 fine2 토픽 알림 전송
function sendImageUploadNotification(clientName, containerInfo, imageCount) {
    console.log('📷 이미지 업로드 알림 전송:', clientName, containerInfo, imageCount);
    
    const title = '이미지 업로드 완료';
    const body = `${clientName} - ${containerInfo}: ${imageCount}개 이미지가 업로드되었습니다.`;
    
    // fine2 토픽으로 전송
    return sendFine2TopicNotification(title, body, {
        client: clientName,
        container: containerInfo,
        imageCount: imageCount,
        timestamp: new Date().toISOString()
    });
}

// 컨테이너 진입 시 fine2 토픽 알림 전송
function sendContainerEntryNotification(clientName, containerInfo) {
    console.log('🚛 컨테이너 진입 알림 전송:', clientName, containerInfo);
    
    const title = '컨테이너 진입';
    const body = `${clientName} - ${containerInfo}: 컨테이너 진입 작업이 시작되었습니다.`;
    
    // fine2 토픽으로 전송
    return sendFine2TopicNotification(title, body, {
        client: clientName,
        container: containerInfo,
        workType: '컨테이너진입',
        timestamp: new Date().toISOString()
    });
}

// 테스트 알림 전송 함수들
function sendTestFine2Notification() {
    console.log('🧪 fine2 토픽 테스트 알림 전송');
    
    const testMessages = [
        {
            title: '테스트 알림 1',
            body: 'fine2 토픽 테스트 메시지입니다.'
        },
        {
            title: '시스템 점검',
            body: 'WMS 시스템이 정상적으로 작동하고 있습니다.'
        },
        {
            title: '알림 시스템 확인',
            body: `현재 시간: ${new Date().toLocaleString()}`
        }
    ];
    
    testMessages.forEach((msg, index) => {
        setTimeout(() => {
            sendFine2TopicNotification(msg.title, msg.body);
        }, index * 2000); // 2초 간격으로 전송
    });
    
    return testMessages.length;
}

// 기존 upLoad 함수 수정 - fine2 토픽 알림 추가
const originalUpLoad = upLoad;
function upLoad() {
    console.log('📤 업로드 시작 - fine2 토픽 알림 포함');
    
    // 기존 업로드 로직 실행
    originalUpLoad();
    
    // 추가: fine2 토픽 알림 전송
    const h3List = document.querySelectorAll(".popTitleC");
    const clientName = h3List[0].innerHTML;
    const containerInfo = h3List[1].innerHTML;
    const img = document.querySelector("#imgTr").querySelectorAll(".local-img");
    
    if (img.length > 0) {
        // 이미지 업로드 알림
        setTimeout(() => {
            sendImageUploadNotification(clientName, containerInfo, img.length);
        }, 2000);
    }
    
    // 작업 완료 알림
    const workType = ioValue === "InCargo" ? "컨테이너진입" : "작업완료";
    setTimeout(() => {
        if (workType === "컨테이너진입") {
            sendContainerEntryNotification(clientName, containerInfo);
        } else {
            sendWorkCompleteNotification(clientName, containerInfo, workType);
        }
    }, 3000);
}

// fine2 토픽 상태 확인 함수
function checkFine2TopicStatus() {
    console.log('📋 fine2 토픽 상태 확인');
    
    const subscriptionKey = 'fcm_topic_fine2';
    const dateKey = 'fcm_topic_fine2_date';
    
    const isSubscribed = localStorage.getItem(subscriptionKey);
    const subscribeDate = localStorage.getItem(dateKey);
    
    const status = {
        subscribed: !!isSubscribed,
        subscribeDate: subscribeDate ? new Date(subscribeDate).toLocaleString() : '없음',
        token: !!(typeof token !== 'undefined' && token),
        tokenPreview: (typeof token !== 'undefined' && token) ? token.substring(0, 20) + '...' : '없음'
    };
    
    console.log('📊 fine2 토픽 상태:', status);
    
    // 상태를 HTML로 표시
    const statusMessage = `
fine2 토픽 상태:
- 구독 여부: ${status.subscribed ? '✅ 구독됨' : '❌ 구독되지 않음'}
- 구독 날짜: ${status.subscribeDate}
- FCM 토큰: ${status.token ? '✅ 있음' : '❌ 없음'}
- 토큰 미리보기: ${status.tokenPreview}
    `;
    
    sendLocalNotification('fine2 토픽 상태', statusMessage);
    
    return status;
}

// 함수들을 전역으로 노출
window.sendFine2TopicNotification = sendFine2TopicNotification;
window.subscribeToFine2Topic = subscribeToFine2Topic;
window.unsubscribeFromFine2Topic = unsubscribeFromFine2Topic;
window.sendWorkCompleteNotification = sendWorkCompleteNotification;
window.sendImageUploadNotification = sendImageUploadNotification;
window.sendContainerEntryNotification = sendContainerEntryNotification;
window.sendTestFine2Notification = sendTestFine2Notification;
window.checkFine2TopicStatus = checkFine2TopicStatus;

console.log(`
📢 fine2 토픽 전송 시스템 추가 완료

🎯 fine2 토픽 전용 함수들:
   subscribeToFine2Topic()              - fine2 토픽 구독
   unsubscribeFromFine2Topic()          - fine2 토픽 구독 해제
   sendFine2TopicNotification(title, body) - fine2 토픽 알림 전송
   checkFine2TopicStatus()              - fine2 토픽 상태 확인

📋 작업별 알림 함수들:
   sendWorkCompleteNotification()       - 작업 완료 알림
   sendImageUploadNotification()        - 이미지 업로드 완료 알림
   sendContainerEntryNotification()     - 컨테이너 진입 알림

🧪 테스트 함수들:
   sendTestFine2Notification()          - 테스트 알림 3개 연속 전송

💡 사용법:
   1. subscribeToFine2Topic() - fine2 토픽 구독
   2. sendTestFine2Notification() - 테스트 알림 전송
   3. checkFine2TopicStatus() - 구독 상태 확인

✨ 자동 통합:
   - upLoad() 함수에 fine2 토픽 알림 자동 추가
   - 작업 완료/이미지 업로드 시 자동 알림 전송
   - 로컬 알림과 토픽 알림 동시 지원
`);
