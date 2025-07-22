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
// if ('serviceWorker' in navigator) {
//   navigator.serviceWorker.register('/WmsMobile/firebase-messaging-sw.js')
//     .then((registration) => {
//       console.log('Service Worker registered with scope:', registration.scope);
//       function requestPermission(){
//         Notification.requestPermission().then((permission)=>{
//           if(permission =="granted"){
//             console.log("Notification Permission Granted");
//             getToken();
//           }else{
//             console.log("Unable to get Permission to Notify.")
//           }
//         });
//         if(!("Notification" in window)){
//           console.log("This browser does not support notifications.");
//         }
//       }
      
//       function getToken() {
//         return messaging.getToken({ vapidKey: 'BMSh5U53qMZrt9KYOmmcjST0BBjua_nUcA3bzMO2l5OUEF6CgMnsu-_2Nf1PqwWsjuq3XEVrXZfGFPEMtE8Kr_k' }) // Replace with your actual VAPID key
//           .then(currentToken => {
//             if (currentToken) {
//               token = currentToken;
//               return currentToken;
//             } else {
//               console.log('No registration token available. Request permission to generate one.');
//               return null;
//             }
//           })
//           .catch(err => {
//             console.log('An error occurred while retrieving token. ', err);
//             return null;
//           });
//       }
//       document.addEventListener('DOMContentLoaded', () => {
//         requestPermission();
      
//         // Example: Send a message after getting the token
//         getToken().then(token => {
//           if (token) {
//             sendMessage(token, 'Hello!', 'This is a test message.', '/images/icon.png');
//           }
//         });
//       });
//     })
//     .catch((err) => {
//       console.error('Service Worker registration failed:', err);
//     });
// }

// FCM 메시지 수신 처리 (Service Worker가 등록된 경우에만)
if (typeof messaging !== 'undefined') {
  messaging.onMessage((payload) => {
    console.log('Message received. ', payload);
    // Customize notification here
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
         icon: payload.notification.icon || '/WmsMobile/images/default-icon.png'
    };
    console.log(notificationTitle,notificationOptions);
    
    // 브라우저 알림 표시
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notificationTitle, notificationOptions);
    }
    
    // 추가 알림 (선택사항)
    alert(payload.notification.body);
  });
}

// Call requestPermission on page load

function sendMessage(token, title, body, icon) {
  // 로컬 브라우저 알림을 우선적으로 사용 (CORS 문제 회피)
  console.log('📢 알림 전송:', title, '-', body);
  
  // 1. 로컬 브라우저 알림 시도
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body: body,
      icon: icon || '/WmsMobile/images/default-icon.png',
      requireInteraction: true,
      tag: 'wms-notification',
      badge: icon || '/WmsMobile/images/default-icon.png',
      timestamp: Date.now(),
      silent: false
    });
    console.log('✅ Local notification sent:', title);
    
    // 로컬 알림이 성공하면 FCM 시도하지 않음 (CORS 문제 때문에)
    return;
  }
  
  // 2. 토큰이 없거나 브라우저 알림이 불가능한 경우
  if (!token) {
    console.log('❌ FCM token not available and browser notifications not supported.');
    console.log('� 콘솔 알림:', title, '-', body);
    return;
  }
  
  // 3. FCM 서버 호출 (CORS 문제로 인해 실패할 가능성 높음)
  console.log('⚠️ Attempting FCM server call (may fail due to CORS)...');
  
  const fcmEndpoint = 'https://fcm.googleapis.com/fcm/send';
  const serverKey = "AAAAYLjTacM:APA91bEfxvEgfzLykmd3YAu-WAI6VW64Ol8TdmGC0GIKao0EB9c3OMAsJNpPCDEUVsMgUkQjbWCpP_Dw2CNpF2u-4u3xuUF30COZslRIqqbryAAhQu0tGLdtFsTXU5EqsMGaMnGK8jpQ";

  const messagePayload = {
    to: token,
    notification: {
      title: title,
      body: body,
      icon: icon || '/WmsMobile/images/default-icon.png'
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
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('✅ FCM message sent successfully:', data);
    if (data.failure > 0) {
      console.warn('⚠️ Some messages failed to send:', data.results);
    }
  })
  .catch(error => {
    console.log('❌ FCM server call failed (expected due to CORS):', error.message);
    
    // FCM 실패 시 로컬 알림으로 재시도 (이미 위에서 시도했지만, 권한이 늦게 부여된 경우를 대비)
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: body,
        icon: icon || '/WmsMobile/images/default-icon.png',
        requireInteraction: true,
        tag: 'wms-notification-fallback'
      });
      console.log('✅ Fallback local notification sent:', title);
    } else {
      console.log('📝 알림 내용 (브라우저 알림 불가):', title, '-', body);
    }
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

// Example usage (주석 처리 - 필요시 활성화)
// sendMessageToServer('Hello!', token);

// CORS 문제 없는 로컬 전용 알림 함수
function sendLocalNotification(title, body, icon) {
  console.log('📱 Local notification:', title, '-', body);
  
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: body,
      icon: icon || '/WmsMobile/images/icon.png',
      badge: '/WmsMobile/images/icon.png',
      requireInteraction: true,
      tag: 'wms-local-notification',
      timestamp: Date.now(),
      silent: false
      // actions는 일반 브라우저 알림에서 지원되지 않음 (Service Worker 전용)
    });
    
    // 알림 클릭 이벤트
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
    
    // 5초 후 자동 닫기
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    console.log('✅ Local notification displayed:', title);
    return true;
  } else {
    console.log('❌ Local notification not available');
    console.log('📝 알림 내용:', title, '-', body);
    return false;
  }
}

// 개발자 도구에서 VAPID 키를 테스트하기 위한 헬퍼 함수
window.testVapidKey = async function(vapidKey) {
  if (!vapidKey) {
    console.log('❌ VAPID 키를 입력해주세요. 예: testVapidKey("BK8n...")');
    return;
  }
  
  try {
    console.log('🧪 Testing VAPID key:', vapidKey.substring(0, 15) + '...');
    
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        const testToken = await messaging.getToken({ 
          vapidKey: vapidKey,
          serviceWorkerRegistration: registration
        });
        
        if (testToken) {
          console.log('✅ VAPID 키가 유효합니다!');
          console.log('🔑 토큰:', testToken);
          token = testToken; // 전역 토큰 업데이트
          return testToken;
        }
      }
    }
  } catch (error) {
    console.log('❌ VAPID 키 테스트 실패:', error.message);
  }
  
  return null;
};

// Firebase Console 바로가기 함수
window.openFirebaseConsole = function() {
  const url = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/settings/cloudmessaging`;
  window.open(url, '_blank');
  console.log('🔥 Firebase Console이 새 탭에서 열립니다.');
  console.log('📍 Cloud Messaging 설정 페이지로 이동합니다.');
};

console.log('🛠️ 개발자 도구 사용 가능한 함수:');
console.log('   - testVapidKey("새로운_VAPID_키") : VAPID 키 테스트');
console.log('   - openFirebaseConsole() : Firebase Console 열기');
console.log('   - testLocalNotification() : 로컬 알림 테스트');
console.log('   - checkNotificationPermission() : 알림 권한 상태 확인');

// 알림 테스트 함수
window.testLocalNotification = function() {
  return sendLocalNotification(
    "테스트 알림", 
    "로컬 브라우저 알림이 정상적으로 작동합니다."
  );
};

// 알림 권한 상태 확인 함수
window.checkNotificationPermission = function() {
  if (!('Notification' in window)) {
    console.log('❌ 브라우저가 알림을 지원하지 않습니다.');
    return false;
  }
  
  console.log('📋 알림 권한 상태:', Notification.permission);
  
  switch(Notification.permission) {
    case 'granted':
      console.log('✅ 알림 권한이 허용되었습니다.');
      return true;
    case 'denied':
      console.log('❌ 알림 권한이 거부되었습니다.');
      console.log('💡 브라우저 설정에서 알림을 허용해주세요.');
      return false;
    case 'default':
      console.log('⚠️ 알림 권한이 아직 요청되지 않았습니다.');
      console.log('💡 페이지를 새로고침하면 권한 요청이 나타납니다.');
      return false;
    default:
      console.log('❓ 알 수 없는 알림 권한 상태:', Notification.permission);
      return false;
  }
};

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
function returnTime(){
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const formattedTime = `${hours}:${minutes}:${seconds}`;
  return formattedTime;
}
function otherContents(e){
  if(e.id=="otherPlt"){
    location.href=e.id+".html";
  }else{
    window.location.href="https://koacaiia.github.io/CargoStatus/"
  }
  
}
function showModal(url,imgTag){
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    modalImg.src = url;
    modal.style.display = "block";
    modalImg.style ="object-fit:scale-down;width:100%;height:90%";
    modalImg.dataset.imgTag = imgTag;
    
}
function fileRemove() {
  const fileTr = document.querySelector("#imgTr");
  const confirmRemove = confirm("파일을 삭제하시겠습니까?");
  const imgUrls = [];

  if (confirmRemove) {
    fileTr.querySelectorAll("td.file-selected").forEach((td) => {
      const img = td.querySelector("img");
      const imgSrc = img.src;
      if (img.classList.contains("local-img")) {
        imgUrls.push(imgSrc);
      } else {
        const storageRef = firebase.storage().refFromURL(imgSrc);
        storageRef.delete().then(() => {
          console.log("이미지 삭제 완료:", imgSrc);
        }).catch((error) => {
          console.error("이미지 삭제 오류:", error);
        });
      }
      td.remove(); // td 요소 제거
    });
  }
  closeModal();
}
function closeModal() {
  const modal = document.getElementById("imgModal");
  const tdList = document.querySelectorAll("#imgTr td");
  tdList.forEach((td)=>{
    td.classList.remove("file-selected");
  });
  modal.style.display = "none";
}
function deleteImage() {
  const modalImg = document.getElementById("modalImg");
  const imgTag = modalImg.dataset.imgTag;
  console.log(imgTag);
  imgTag.remove();
  closeModal();
}
function saveImg() {
  const modalImg = document.getElementById("modalImg");
  const url = modalImg.src;
  fetch(url)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, modalImg.dataset.imgTag);
    })
    .catch(error => {
      console.error("Error saving image:", error);
    });
  closeModal();
  
}
function popSaveAll(){
  const fileTr = document.querySelector("#imgTr");
  const img = fileTr.querySelectorAll(".server-img");
  const imgUrls = [];
  for(let i=0;i<img.length;i++){
    const imgSrc = img[i].src;
    imgUrls.push(imgSrc);
  }
  imgUrls.forEach((imgUrl, index) => {
    fetch(imgUrl)
        .then(response => response.blob())
        .then(blob => {
            const fileName = "SaveAll_"+index+"_"+returnTime();
            const file = new File([blob], fileName, { type: blob.type });
            saveAs(file, fileName);
        })
        .catch(error => {
          alert("Error uploading file:", error);
          console.error("Error uploading file:", error);
      });
    });

}