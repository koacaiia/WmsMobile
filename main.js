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

// Add event listeners for dynamic font adjustment
document.addEventListener('DOMContentLoaded', () => {
  // Adjust font sizes when page loads
  setTimeout(() => adjustPopTitleFontSize(), 100);
  
  // Adjust on window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => adjustPopTitleFontSize(), 100);
  });
  
  // Monitor popup visibility changes
  const popup = document.querySelector('#mainPop');
  if (popup) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          if (popup.style.display !== 'none') {
            setTimeout(() => adjustPopTitleFontSize(), 50);
          }
        }
      });
    });
    observer.observe(popup, { attributes: true, attributeFilter: ['style'] });
  }
});
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

// getData 함수의 Promise 오류 처리 개선 (기존 함수 교체)
function getData(date){
    const year = date.substring(0,4);
    const month=date.substring(5,7);
    const refI ="DeptName/"+deptName+"/InCargo/"+month+"월/"+date;
    const refO ="DeptName/"+deptName+"/OutCargo/"+month+"월/"+date;
    const refOs ="DeptName/"+deptName+"/Os/"+year+"/"+month+"월/"+date;
    
    // Os 데이터 조회 (Promise 오류 처리)
    database_f.ref(refOs).get()
      .then((snapshot)=>{
        const val = snapshot.val();
        try {
          if(val==null){
            document.querySelector("#osMo").value=0;
            document.querySelector("#osWf").value=0;
            document.querySelector("#osWo").value=0;
            document.querySelector("#osRe").value="";
          }else{
            document.querySelector("#osMo").value=val["osM"] || 0;
            document.querySelector("#osWf").value=val["osWf"] || 0;
            document.querySelector("#osWo").value=val["osWo"] || 0;
            document.querySelector("#osRe").value=val["osR"] || "";
          }
        } catch (domError) {
          console.error('❌ Os DOM 요소 접근 오류:', domError);
        }
      })
      .catch((e)=>{
        console.error('❌ Os 데이터 조회 오류:', e);
        // 오류 시 기본값 설정
        try {
          document.querySelector("#osMo").value=0;
          document.querySelector("#osWf").value=0;
          document.querySelector("#osWo").value=0;
          document.querySelector("#osRe").value="";
        } catch (domError) {
          console.error('❌ Os DOM 요소 접근 오류:', domError);
        }
      });
    
    // InCargo 데이터 조회 (Promise 오류 처리)
    database_f.ref(refI).get()
      .then((snapshot)=>{
        const val=snapshot.val();
        let ft4=0;
        let ft2=0;
        let lcl=0;
        
        try {
          if (val) {
            for(let i in val){
              try {
                let spec="";
                if(val[i]["container40"]==="1"){
                  spec="40FT";
                  ft4+=1;
                }
                else if(val[i]["container20"]==="1"){
                  spec="20FT";
                  ft2+=1;
                }
                else if(val[i]["lclcargo"]!="0"){
                  spec="LcL";
                  lcl+=1;
                }else{
                 continue
                }
                
                const tr = document.createElement("tr");
                tr.id=val[i]["refValue"];
                const td1 = document.createElement("td");
                td1.innerHTML=val[i]["consignee"] || "";
                const td2 = document.createElement("td");
                td2.innerHTML=val[i]["container"] || "";
                const td3 = document.createElement("td");
                td3.innerHTML=val[i]["Pqty"] || "";
                const td4 = document.createElement("td");
                td4.innerHTML=spec;
                const td5 = document.createElement("td");
                td5.innerHTML=val[i]["description"] || "";
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                tr.appendChild(td5);
                tBodyIn.appendChild(tr);
                
                tr.addEventListener("click",(e)=>{
                  try {
                    const trList = document.querySelectorAll("#tBodyIn tr");
                    trList.forEach((e)=>{
                      if(e.classList.contains("clicked")){
                           e.classList.remove("clicked");}
                    });
                    e.target.parentNode.classList.toggle("clicked");
                    ref=tr.id;
                    ioValue="InCargo";
                    popUp();
                  } catch (clickError) {
                    console.error('❌ InCargo 행 클릭 처리 오류:', clickError);
                  }
                });
                
                if(val[i]["working"]!=""){
                  tr.style="color:red;";}
                
              } catch (rowError) {
                console.error('❌ InCargo 행 처리 오류:', rowError);
                continue; // 다음 행 계속 처리
              }
            }
          }
          
          try {
            if (typeof toastOn === 'function') {
              toastOn("40FT:"+ft4+"   20FT:"+ft2+"    LCL:"+lcl, 4000);
            }
          } catch (toastError) {
            console.error('❌ 토스트 메시지 오류:', toastError);
          }
          
        } catch (processError) {
          console.error('❌ InCargo 데이터 처리 오류:', processError);
        }
      })
      .catch((e)=>{
        console.error('❌ InCargo 데이터 조회 오류:', e);
        try {
          if (typeof toastOn === 'function') {
            toastOn('InCargo 데이터 로드 실패', 3000);
          }
        } catch (toastError) {
          console.error('❌ 오류 토스트 메시지 실패:', toastError);
        }
      });

    // OutCargo 데이터 조회 (Promise 오류 처리)
    database_f.ref(refO).get()
      .then((snapshot)=>{
        const val=snapshot.val();
        
        try {
          if (val) {
            for(let i in val){
              try {
                const tr = document.createElement("tr");
                tr.id=val[i]["keyValue"];
                let des = val[i]["description"] || "";
                let manNo = val[i]["managementNo"] || "";
                
                if(des.includes(",")){
                  des = des.substring(0,des.indexOf(",")+1).replace(",","_외");
                  manNo = manNo.substring(0,manNo.indexOf(",")+1).replace(",","_외");
                }
                
                const td1 = document.createElement("td");
                td1.innerHTML=val[i]["consigneeName"] || "";
                const td2 = document.createElement("td");
                td2.innerHTML=val[i]["outwarehouse"] || "";
                const td3 = document.createElement("td");
                td3.innerHTML=des;
                const td4 = document.createElement("td");
                td4.innerHTML=manNo;
                const td5 = document.createElement("td");
                td5.innerHTML=val[i]["totalQty"] || "";
                const td6 = document.createElement("td");
                td6.innerHTML=val[i]["totalEa"] || "";
                tr.appendChild(td1);
                tr.appendChild(td2);
                tr.appendChild(td3);
                tr.appendChild(td4);
                tr.appendChild(td5);
                tr.appendChild(td6);
                tBodyOut.appendChild(tr);
                
                tr.addEventListener("click",(e)=>{
                  try {
                    const trList = document.querySelectorAll("#tBodyOut tr");
                    trList.forEach((e)=>{
                      if(e.classList.contains("clicked")){
                        e.classList.remove("clicked");}
                    });
                    e.target.parentNode.classList.toggle("clicked");
                    ref=tr.id;
                    ioValue="outCargo";
                    popUp();
                  } catch (clickError) {
                    console.error('❌ OutCargo 행 클릭 처리 오류:', clickError);
                  }
                });
                
                if(val[i]["workprocess"]!="미"){
                  tr.style="color:red;";}
                
              } catch (rowError) {
                console.error('❌ OutCargo 행 처리 오류:', rowError);
                continue; // 다음 행 계속 처리
              }
            }
          }
        } catch (processError) {
          console.error('❌ OutCargo 데이터 처리 오류:', processError);
        }
      })
      .catch((e)=>{
        console.error('❌ OutCargo 데이터 조회 오류:', e);
        try {
          if (typeof toastOn === 'function') {
            toastOn('OutCargo 데이터 로드 실패', 3000);
          }
        } catch (toastError) {
          console.error('❌ 오류 토스트 메시지 실패:', toastError);
        }
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
          
          // Adjust font sizes to fit containers
          setTimeout(() => adjustPopTitleFontSize(), 10);
          console.log(h3List)
          h3List[4].innerHTML="보세운송 차량번호";
          const sealNo = document.querySelector("#sealNo");
          sealNo.innerHTML=(val["count"] || "미등록");
          const cargoNoInput = document.querySelector("#cargoNo");
          cargoNoInput.value = val["cargoNo"] ;
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
          // Adjust font sizes to fit containers
          setTimeout(() => adjustPopTitleFontSize(), 10);
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
          h3List[2].style="font-size:large;color:red;";
          document.querySelectorAll("#popTitle div")[1].remove();
          document.querySelector("#popTitle").style="grid-template-rows:3fr 7fr";
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
  // toastOn 함수 안전 호출
 
  let imgUrls = [];
  const img = fileTr.querySelectorAll(".local-img");
  const h3List = document.querySelectorAll(".popTitleC");
  const stockList ={"client":h3List[0].innerHTML};
  stockList[h3List[1].innerHTML]={"bl":h3List[2].innerHTML};
  if(img.length==0){
    try {
      // toastOn 함수 안전 호출
      try {
        toastOn("사진 전송 없이 작업 완료 등록만 진행 합니다.");
      } catch (toastError) {
        console.log("📱 사진 전송 없이 작업 완료 등록만 진행 합니다.");
      }
      
      // FCM 알림 전송 - 사진 없이 작업 완료 (안전하게)
      const clientName = h3List[0].innerHTML;
      const containerInfo = h3List[1].innerHTML;
      const workType = ioValue === "InCargo" ? "컨테이너진입" : "작업완료";
      
      // 모바일 환경에서는 간단한 확인 메시지
      if (mC) {
        console.log('📱 Mobile - 작업 완료:', `${clientName} - ${containerInfo}`);
      } else {
        // 로컬 알림 우선 사용 (CORS 문제 회피)
        if (typeof sendLocalNotification === 'function') {
          const notificationSent = sendLocalNotification(
            "작업 완료 등록", 
            `${clientName} - ${containerInfo}: 사진 전송 없이 작업 완료 등록`,
            {
              client: clientName,
              container: containerInfo,
              hasImages: false,
              workType: workType
            }
          );
          
          // 로컬 알림이 실패한 경우에만 FCM 시도
          if (!notificationSent && token && typeof sendMessage === 'function') {
            try {
              sendMessage(token, 
                "작업 완료 등록", 
                `${clientName} - ${containerInfo}: 사진 전송 없이 작업 완료 등록`, 
                '/WmsMobile/images/icon.png'
              );
            } catch (fcmError) {
              console.log('⚠️ FCM 메시지 전송 실패:', fcmError);
            }
          }
        }
      }
      
      // fine2 토픽으로 메시지 전송 (사진 없는 경우)
      sendWorkCompletionToFine2(clientName, containerInfo, workType);
      
    } catch (notificationError) {
      console.error('❌ 작업 완료 알림 전송 오류:', notificationError);
    }
  } else {
    // 이미지 업로드 처리 - 프로그레스바 표시
    try {
      console.log('📤 이미지 업로드 시작 - 프로그레스바 표시');
      
      // 프로그레스바 강제 표시 (테스트용)
      showProgressBar();
      for(let i=0;i<img.length;i++){
        const imgSrc = img[i].src;
        imgUrls.push(imgSrc);
      }
      const storageRef = storage_f.ref(refFile);
      
      if (mC) {
        uploadImagesSequentially(imgUrls, storageRef, h3List);
      } else {
        uploadImagesParallel(imgUrls, storageRef, h3List);
      }
        
    } catch (uploadError) {
      console.error('❌ 이미지 업로드 준비 오류:', uploadError);
      hideProgressBar();
      try {
        toastOn("이미지 업로드 준비 중 오류가 발생했습니다.", 5000);
      } catch (toastError) {
        console.log("❌ 이미지 업로드 준비 중 오류가 발생했습니다.");
      }
    }
  }
  
  // 작업 상태 업데이트
  let w;
  if(ioValue=="InCargo"){
    w={"working":"컨테이너진입","regTime":document.querySelector("#dateSelect").value+"_"+returnTime()};
  }else{
    w={"workprocess":"완","regTime":document.querySelector("#dateSelect").value+"_"+returnTime()};
  }
  
  database_f.ref(ref).update(w)
    .then(() => {
      console.log("✅ 작업 상태 업데이트 완료");
      
      try {
        const clientName = h3List[0].innerHTML;
        const containerInfo = h3List[1].innerHTML;
        const workStatus = ioValue=="InCargo" ? "컨테이너진입" : "작업완료";
        
        if (mC) {
          console.log('📱 Mobile - 상태 업데이트:', `${clientName} - ${containerInfo}: ${workStatus}`);
        } else if (typeof sendLocalNotification === 'function') {
          sendLocalNotification(
            "작업 상태 업데이트", 
            `${clientName} - ${containerInfo}: ${workStatus} 처리 완료`
          );
        }
        
        // fine2 토픽으로 상태 업데이트 알림 전송
        sendWorkCompletionToFine2(clientName, containerInfo, workStatus);
        
      } catch (notificationError) {
        console.error('❌ 상태 업데이트 알림 전송 오류:', notificationError);
      }
    })
    .catch((error) => {
      console.error("❌ 작업 상태 업데이트 오류:", error);
      try {
        toastOn("작업 상태 업데이트 실패", 5000);
      } catch (toastError) {
        console.log("❌ 작업 상태 업데이트 실패");
      }
    });
}

// 모바일용 순차 업로드 함수 수정 - fine2 토픽 전송 추가
function uploadImagesSequentially(imgUrls, storageRef, h3List) {
  let successCount = 0;
  let failureCount = 0;
  const total = imgUrls.length;
  
  const uploadNext = (index) => {
    if (index >= imgUrls.length) {
      // 모든 업로드 완료
      console.log(`✅ 순차 이미지 업로드 완료: 성공 ${successCount}개, 실패 ${failureCount}개`);
      
      // 프로그레스바 완료 후 숨기기
      updateProgress(total, total);
      hideProgressBar();
      
      // 성공/실패에 따른 토스트 메시지
      if (failureCount === 0) {
        setTimeout(() => {
          toastOn(`✅ ${successCount}개 파일 업로드 완료!`, 3000);
        }, 2500);
      } else {
        setTimeout(() => {
          toastOn(`⚠️ ${successCount}개 성공, ${failureCount}개 실패`, 4000);
        }, 2500);
      }
      
      // fine2 토픽으로 이미지 업로드 완료 알림
      const clientName = h3List[0].innerHTML;
      const containerInfo = h3List[1].innerHTML;
      const workType = ioValue === "InCargo" ? "컨테이너진입" : "작업완료";
      
      sendMessageToFine2Topic(
        'WMS 이미지 업로드 완료',
        `${clientName} - ${containerInfo}: ${successCount}개 이미지 업로드 완료`,
        {
          client: clientName,
          container: containerInfo,
          workType: workType,
          uploadedCount: successCount,
          failedCount: failureCount,
          hasImages: true
        }
      );
      
      setTimeout(() => {
        refreshImageList();
      }, 1000);
      
      return;
    }
    
    // 프로그레스바 업데이트
    updateProgress(index, total);
    
    const imgUrl = imgUrls[index];
    console.log(`🔄 Uploading image ${index + 1}/${imgUrls.length}`);
    
    fetch(imgUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const selectTr = document.querySelector(".clicked");
        if (!selectTr) {
          throw new Error('선택된 행이 없습니다.');
        }
        
        const fileName = generateFileName(selectTr, index);
        const file = new File([blob], fileName, { type: blob.type });
        const fileRef = storageRef.child(fileName.replace("/","_"));
        
        return fileRef.put(file);
      })
      .then((snapshot) => {
        console.log(`✅ 파일 ${index + 1} 업로드 완료`);
        successCount++;
        
        // 완료된 파일 프로그레스바 업데이트
        updateProgress(index + 1, total);
        
        // 다음 파일 업로드
        setTimeout(() => uploadNext(index + 1), 500);
      })
      .catch(error => {
        console.error(`❌ 파일 ${index + 1} 업로드 오류:`, error);
        failureCount++;
        
        // 실패해도 프로그레스바 업데이트
        updateProgress(index + 1, total);
        
        // 실패해도 다음 파일 계속 업로드
        setTimeout(() => uploadNext(index + 1), 500);
      });
  };
  
  // 첫 번째 파일부터 시작
  uploadNext(0);
}

// 데스크톱용 병렬 업로드 함수 수정 - fine2 토픽 전송 추가
function uploadImagesParallel(imgUrls, storageRef, h3List) {
  const total = imgUrls.length;
  let completedCount = 0;
  
  const uploadPromises = imgUrls.map((imgUrl, index) => {
    return fetch(imgUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
      })
      .then(blob => {
        const selectTr = document.querySelector(".clicked");
        if (!selectTr) {
          throw new Error('선택된 행이 없습니다.');
        }
        
        const fileName = generateFileName(selectTr, index);
        const file = new File([blob], fileName, { type: blob.type });
        const fileRef = storageRef.child(fileName.replace("/","_"));
        console.log("🔄 병렬 업로드 시작:", fileName);
        return fileRef.put(file);
      })
      .then((snapshot) => {
        console.log(`✅ 파일 ${index + 1} 업로드 완료`);
        completedCount++;
        updateProgress(completedCount, total);
        return snapshot;
      })
      .catch(error => {
        console.error(`❌ 파일 ${index + 1} 업로드 오류:`, error);
        completedCount++;
        updateProgress(completedCount, total);
        return null;
      });
  });
  
  Promise.allSettled(uploadPromises)
    .then((results) => {
      const successCount = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
      const failureCount = results.filter(result => result.status === 'rejected' || result.value === null).length;
      
      console.log(`✅ 병렬 이미지 업로드 완료: 성공 ${successCount}개, 실패 ${failureCount}개`);
      
      hideProgressBar();
      
      try {
        toastOn(successCount + " 파일 업로드 완료");
      } catch (toastError) {
        console.log(`✅ ${successCount} 파일 업로드 완료`);
      }
      
      // fine2 토픽으로 이미지 업로드 완료 알림
      const clientName = h3List[0].innerHTML;
      const containerInfo = h3List[1].innerHTML;
      const workType = ioValue === "InCargo" ? "컨테이너진입" : "작업완료";
      
      sendMessageToFine2Topic(
        'WMS 이미지 업로드 완료',
        `${clientName} - ${containerInfo}: ${successCount}개 이미지 업로드 완료`,
        {
          client: clientName,
          container: containerInfo,
          workType: workType,
          uploadedCount: successCount,
          failedCount: failureCount,
          hasImages: true
        }
      );
      
      setTimeout(() => {
        refreshImageList();
      }, 1000);
    })
    .catch((error) => {
      console.error("❌ 이미지 업로드 Promise.allSettled 오류:", error);
      hideProgressBar();
    });
}

// returnTime 함수 정의 (파일 상단에 추가)
function returnTime() {
  try {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  } catch (error) {
    console.error('❌ returnTime 함수 오류:', error);
    // 대체 방법으로 간단한 시간 반환
    return new Date().toLocaleTimeString('ko-KR', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

// toastOn 함수 정의 (이미 있다면 중복 제거)
function toastOn(message, duration = 3000) {
  try {
    // 기존 일반 토스트가 있으면 제거
    const existingToast = document.getElementById('toast');
    if (existingToast) {
      existingToast.remove();
    }
    
    // 프로그레스바 토스트가 있으면 일반 토스트는 아래쪽에 표시
    const progressToast = document.getElementById('progressToast');
    const topPosition = progressToast ? '120px' : '20px';
    
    // 토스트 요소 생성
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.style.cssText = `
      position: fixed !important;
      top: ${topPosition} !important;
      left: 50% !important;
      transform: translateX(-50%) !important;
      background-color: rgba(51, 51, 51, 0.9) !important;
      color: white !important;
      padding: 12px 24px !important;
      border-radius: 6px !important;
      z-index: 10000 !important;
      font-size: 14px !important;
      opacity: 0 !important;
      transition: opacity 0.3s ease !important;
      max-width: 90% !important;
      text-align: center !important;
      word-wrap: break-word !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2) !important;
    `;
    
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 애니메이션으로 나타나기
    setTimeout(() => {
      toast.style.opacity = '1';
    }, 100);
    
    // 지정된 시간 후 토스트 숨기기
    setTimeout(() => {
      toast.style.opacity = '0';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, duration);
    
    console.log('📱 Toast:', message);
    return true;
  } catch (error) {
    console.error('❌ Toast 함수 오류:', error);
    console.log('📱 Toast (fallback):', message);
    return false;
  }
}

// 토스트 형식 프로그레스바 표시 함수
function showProgressBar() {
  console.log('🔄 showProgressBar 함수 호출됨');
  
  // 기존 토스트나 프로그레스바가 있으면 제거
  const existingToast = document.getElementById('toast');
  const existingProgress = document.getElementById('progressToast');
  
  if (existingToast) {
    console.log('🗑️ 기존 토스트 제거');
    existingToast.remove();
  }
  if (existingProgress) {
    console.log('🗑️ 기존 프로그레스바 제거');
    existingProgress.remove();
  }

  // 토스트 형식 프로그레스바 생성
  const progressToast = document.createElement('div');
  progressToast.id = 'progressToast';
  progressToast.style.cssText = `
    position: fixed !important;
    top: 50px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    background-color: rgba(51, 51, 51, 0.95) !important;
    color: white !important;
    padding: 20px 30px !important;
    border-radius: 12px !important;
    z-index: 99999 !important;
    font-size: 16px !important;
    opacity: 0 !important;
    transition: opacity 0.3s ease !important;
    max-width: 90% !important;
    min-width: 320px !important;
    text-align: center !important;
    box-shadow: 0 8px 20px rgba(0,0,0,0.4) !important;
    backdrop-filter: blur(10px) !important;
    border: 2px solid rgba(255,255,255,0.1) !important;
  `;

  // 프로그레스바 텍스트
  const progressText = document.createElement('div');
  progressText.id = 'progressToastText';
  progressText.style.cssText = `
    margin-bottom: 15px !important;
    font-weight: bold !important;
    font-size: 16px !important;
    color: white !important;
  `;
  progressText.textContent = '이미지 업로드 중... 0%';

  // 프로그레스바 컨테이너
  const progressContainer = document.createElement('div');
  progressContainer.style.cssText = `
    background-color: rgba(255, 255, 255, 0.3) !important;
    border-radius: 15px !important;
    overflow: hidden !important;
    height: 12px !important;
    margin-bottom: 12px !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
  `;

  // 프로그레스바
  const progressBar = document.createElement('div');
  progressBar.id = 'progressToastBar';
  progressBar.style.cssText = `
    background: linear-gradient(90deg, #4CAF50, #45a049) !important;
    height: 100% !important;
    width: 0% !important;
    transition: width 0.5s ease !important;
    border-radius: 15px !important;
    box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3) !important;
  `;

  // 세부 정보 텍스트
  const detailText = document.createElement('div');
  detailText.id = 'progressToastDetail';
  detailText.style.cssText = `
    font-size: 13px !important;
    opacity: 0.9 !important;
    margin-top: 8px !important;
    color: #e0e0e0 !important;
  `;
  detailText.textContent = '준비 중...';

  // 요소들 조립
  progressContainer.appendChild(progressBar);
  progressToast.appendChild(progressText);
  progressToast.appendChild(progressContainer);
  progressToast.appendChild(detailText);
  
  // body에 직접 추가
  document.body.appendChild(progressToast);
  console.log('✅ 프로그레스바 DOM에 추가됨');

  // 강제로 reflow 발생시키기
  progressToast.offsetHeight;

  // 애니메이션으로 나타나기
  setTimeout(() => {
    progressToast.style.opacity = '1';
    console.log('✨ 프로그레스바 표시됨');
  }, 50);

  // 5초 후에도 안보이면 강제로 표시
  setTimeout(() => {
    if (progressToast && progressToast.style.opacity !== '1') {
      console.log('⚠️ 프로그레스바가 보이지 않음 - 강제 표시');
      progressToast.style.opacity = '1';
      progressToast.style.display = 'block';
    }
  }, 100);
}

// 토스트 형식 프로그레스바 업데이트 함수
function updateProgress(current, total) {
  console.log(`📊 Progress update: ${current}/${total}`);
  
  const progressBar = document.getElementById('progressToastBar');
  const progressText = document.getElementById('progressToastText');
  const detailText = document.getElementById('progressToastDetail');
  
  if (!progressBar || !progressText || !detailText) {
    console.log('❌ 프로그레스바 요소를 찾을 수 없음');
    return;
  }
  
  const percentage = Math.round((current / total) * 100);
  console.log(`📈 Progress: ${percentage}%`);
  
  // 프로그레스바 업데이트
  progressBar.style.width = percentage + '%';
  
  // 텍스트 업데이트
  progressText.textContent = `이미지 업로드 중... ${percentage}%`;
  detailText.textContent = `${current}/${total} 파일 처리됨`;
  
  // 색상 변화
  if (percentage === 100) {
    progressBar.style.background = 'linear-gradient(90deg, #2196F3, #1976D2) !important';
    progressText.textContent = '업로드 완료! 🎉';
    detailText.textContent = `총 ${total}개 파일 처리 완료`;
    console.log('🎉 업로드 완료!');
  }
}

// 토스트 형식 프로그레스바 숨기기 함수
function hideProgressBar() {
  console.log('🔄 hideProgressBar 함수 호출됨');
  
  const progressToast = document.getElementById('progressToast');
  
  if (progressToast) {
    console.log('✅ 프로그레스바 찾음 - 숨기기 시작');
    
    // 완료 메시지를 잠시 보여준 후 사라지기
    setTimeout(() => {
      console.log('👋 프로그레스바 페이드아웃 시작');
      progressToast.style.opacity = '0';
      
      // 애니메이션 완료 후 제거
      setTimeout(() => {
        if (progressToast.parentNode) {
          progressToast.remove();
          console.log('🗑️ 프로그레스바 DOM에서 제거됨');
        }
      }, 300);
    }, 2000); // 2초 후 사라지기 시작
  } else {
    console.log('❌ 프로그레스바를 찾을 수 없음');
  }
}

// 파일명 생성 함수
function generateFileName(selectTr, index) {
  try {
    if (!selectTr || !selectTr.cells || selectTr.cells.length < 5) {
      console.log('❌ selectTr이 없거나 셀이 부족함');
      return `image_${index}_${returnTime()}`;
    }
    
    const cell0 = selectTr.cells[0] ? selectTr.cells[0].innerHTML : 'unknown';
    const cell2 = selectTr.cells[2] ? selectTr.cells[2].innerHTML : 'unknown';
    const cell3 = selectTr.cells[3] ? selectTr.cells[3].innerHTML : 'unknown';
    const cell4 = selectTr.cells[4] ? selectTr.cells[4].innerHTML : 'unknown';
    
    return `${cell0}_${cell2}_${cell3}_${cell4}_${index}_${returnTime()}`;
  } catch (error) {
    console.error('❌ 파일명 생성 오류:', error);
    return `image_${index}_${returnTime()}`;
  }
}

// 이미지 목록 새로고침 함수
function refreshImageList() {
  const fileTr = document.querySelector("#imgTr");
  if (!fileTr || !refFile) {
    console.log('❌ fileTr 또는 refFile이 없습니다.');
    return;
  }

  // 기존 서버 이미지들만 제거 (local-img는 유지)
  const serverImages = fileTr.querySelectorAll("td img:not(.local-img)");
  serverImages.forEach(img => {
    if (img.parentNode) {
      img.parentNode.remove();
    }
  });

  console.log('🔄 서버 이미지 목록 새로고침 중...');
  
  // Firebase Storage에서 이미지 목록 다시 로드
  storage_f.ref(refFile).listAll()
    .then((res) => {
      console.log(`📁 서버에서 ${res.items.length}개 이미지 발견`);
      
      res.items.forEach((itemRef) => {
        itemRef.getDownloadURL().then((url) => {
          const td = document.createElement("td");
          const img = document.createElement("img");
          img.src = url;
          img.className = "server-img";
          img.addEventListener("click", (e) => {
            const tdList = img.parentNode.parentNode.querySelectorAll("td");
            tdList.forEach((td) => {
              td.classList.remove("file-selected");
            });
            img.parentNode.classList.toggle("file-selected");
            console.log(img.parentNode.classList);
            
            // popDetail 함수가 있는 경우에만 호출
            if (typeof popDetail === 'function') {
              popDetail(refFile);
            }
          });
          img.style.display = "block";
          td.style = "width:32.5vw;height:36vh;border:1px dashed red;border-radius:5px";
          img.style.width = "100%";
          img.style.height = "100%";
          img.style.objectFit = "scale-down";
          td.appendChild(img);
          fileTr.appendChild(td);
        }).catch((error) => {
          console.error('❌ 이미지 URL 가져오기 오류:', error);
        });
      });
    })
    .catch((error) => {
      console.error('❌ 이미지 목록 새로고침 오류:', error);
      try {
        toastOn("이미지 목록 새로고침 실패", 3000);
      } catch (toastError) {
        console.log("❌ 이미지 목록 새로고침 실패");
      }
    });
}

function reLoad(){
  if(mC){
    location.reload();
  }else{
    location.href="https://koacaiia.github.io/Wms-fine-/";
  }
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
  function popDetail(ref){
  location.href=`imagePop.html?ref=${encodeURIComponent(ref)}`;
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
function otherContents(e){
  if(e.id=="otherPlt"){
    location.href=e.id+".html";
  }else{
    window.location.href="https://koacaiia.github.io/CargoStatus/"
  }
}

// sendLocalNotification 함수 정의 추가
function sendLocalNotification(title, body, data = {}) {
  try {
    // 브라우저 알림 권한 확인
    if (!("Notification" in window)) {
      console.log("❌ 이 브라우저는 알림을 지원하지 않습니다.");
      return false;
    }

    if (Notification.permission === "granted") {
      // 알림 생성
      const notification = new Notification(title, {
        body: body,
        icon: '/WmsMobile/images/icon.png',
        badge: '/WmsMobile/images/icon.png',
        data: data,
        requireInteraction: true, // 사용자가 직접 닫을 때까지 유지
        silent: false,
        tag: 'wms-notification-' + Date.now()
      });

      notification.onclick = function(event) {
        console.log('🔔 알림 클릭됨:', event);
        event.preventDefault();
        window.focus(); // 브라우저 창 포커스
        notification.close();
      };

      notification.onshow = function() {
        console.log('✅ 알림 표시됨:', title);
      };

      notification.onerror = function(error) {
        console.error('❌ 알림 오류:', error);
      };

      return true;
    } else if (Notification.permission !== "denied") {
      // 권한 요청
      Notification.requestPermission().then(function(permission) {
        if (permission === "granted") {
          sendLocalNotification(title, body, data);
        } else {
          console.log("❌ 알림 권한이 거부되었습니다.");
        }
      });
      return false;
    } else {
      console.log("❌ 알림 권한이 차단되어 있습니다.");
      return false;
    }
  } catch (error) {
    console.error('❌ 로컬 알림 함수 오류:', error);
    return false;
  }
}

// 알림 권한 요청 함수
function requestNotificationPermission() {
  if ("Notification" in window) {
    if (Notification.permission === "default") {
      Notification.requestPermission().then(function(permission) {
        console.log('🔔 알림 권한:', permission);
        if (permission === "granted") {
          toastOn("알림 권한이 허용되었습니다.", 2000);
        } else {
          toastOn("알림 권한이 거부되었습니다.", 2000);
        }
      });
    } else {
      console.log('🔔 현재 알림 권한:', Notification.permission);
    }
  }
}


// sendMessage 함수 정의
function sendMessage(token, title, body, icon) {
  // 실제 구현에서는 서버 API를 통해 FCM 메시지 전송
  console.log('📤 FCM 메시지 전송 시도:', { token, title, body, icon });
  
  // 로컬 알림으로 대체 (테스트용)
  sendLocalNotification(title, body, { icon });
}

// fine2 토픽 구독 함수 추가
function subscribeToFine2Topic() {
  if (!messaging) {
    console.error('❌ Firebase messaging이 초기화되지 않았습니다.');
    return;
  }

  messaging.getToken().then((currentToken) => {
    if (currentToken) {
      console.log('✅ FCM 토큰:', currentToken);
      
      // fine2 토픽 구독 (클라이언트 측에서는 제한적, 실제로는 서버에서 처리)
      console.log('📢 fine2 토픽 구독 준비 완료');
      toastOn('fine2 토픽 알림 준비 완료', 2000);
      
    } else {
      console.log('❌ FCM 토큰을 가져올 수 없습니다.');
    }
  }).catch((err) => {
    console.error('❌ FCM 토큰 획득 오류:', err);
  });
}

// fine2 토픽으로 메시지 전송 함수 (서버 API 호출 시뮬레이션)
async function sendMessageToFine2Topic(title, body, data = {}) {
  try {
    const message = {
      to: '/topics/fine2',
      notification: {
        title: title,
        body: body
      },
      data: {
        topic: 'fine2',
        timestamp: new Date().toISOString(),
        client: data.client || '',
        container: data.container || '',
        workType: data.workType || '',
        ...data
      }
    };

    console.log('📤 fine2 토픽 메시지 전송 시도:', message);
    
    // 실제 서버 API 호출 대신 로컬 알림으로 시뮬레이션
    const success = sendLocalNotification(
      `[fine2] ${title}`,
      `📢 토픽 알림: ${body}`,
      message.data
    );
    
    if (success) {
      console.log('✅ fine2 토픽 메시지 전송 완료 (시뮬레이션)');
      return true;
    } else {
      console.error('❌ fine2 토픽 메시지 전송 실패');
      return false;
    }
  } catch (error) {
    console.error('❌ fine2 토픽 메시지 전송 오류:', error);
    return false;
  }
}

// 작업 완료 시 fine2 토픽으로 알림 전송
function sendWorkCompletionToFine2(clientName, containerInfo, workType) {
  const currentTime = new Date().toLocaleString('ko-KR');
  
  sendMessageToFine2Topic(
    'WMS 작업 완료 알림',
    `${clientName} - ${containerInfo}: ${workType} 처리 완료`,
    {
      client: clientName,
      container: containerInfo,
      workType: workType,
      timestamp: currentTime,
      department: deptName
    }
  );
}

// 테스트 함수들 추가
function testFine2Topic() {
  console.log('🧪 fine2 토픽 테스트 시작');
  
  sendWorkCompletionToFine2(
    'TEST CLIENT',
    'TEST123456',
    '테스트 작업완료'
  );
}

function testFine2ImageUpload() {
  console.log('🧪 fine2 이미지 업로드 토픽 테스트');
  
  sendMessageToFine2Topic(
    'WMS 이미지 업로드 완료',
    'TEST CLIENT - TEST123456: 3개 이미지 업로드 완료',
    {
      client: 'TEST CLIENT',
      container: 'TEST123456',
      workType: '테스트 작업완료',
      uploadedCount: 3,
      failedCount: 0,
      hasImages: true
    }
  );
}

// 콘솔에서 테스트할 수 있도록 전역 함수로 등록
window.testFine2Topic = testFine2Topic;
window.testFine2ImageUpload = testFine2ImageUpload;

// Firebase 메시징 초기화 함수 수정
function initializeFirebaseMessaging() {
  try {
    // fine2 토픽 구독
    subscribeToFine2Topic();
    
    // 포그라운드 메시지 수신 (fine2 토픽 메시지 감지)
    messaging.onMessage((payload) => {
      console.log('🔔 포그라운드 메시지 수신:', payload);
      
      // fine2 토픽 메시지 감지
      const fromTopic = payload.from || '';
      const isFine2 = (
        fromTopic.includes('fine2') ||
        fromTopic.includes('/topics/fine2') ||
        payload.data?.topic === 'fine2'
      );
      
      if (isFine2) {
        console.log('📢 fine2 토픽 메시지 감지');
        
        if (payload.notification) {
          sendLocalNotification(
            `[fine2] ${payload.notification.title}`,
            `📢 토픽: ${payload.notification.body}`,
            { ...payload.data, topic: 'fine2' }
          );
        }
      } else if (payload.notification) {
        sendLocalNotification(
          payload.notification.title,
          payload.notification.body,
          payload.data
        );
      }
    });

  } catch (error) {
    console.error('❌ Firebase 메시징 초기화 오류:', error);
  }
}

// 페이지 로드 시 초기화 (주석 해제)
document.addEventListener('DOMContentLoaded', function() {
  console.log('📱 WMS Mobile 앱 시작');
  
  // 알림 권한 요청
  requestNotificationPermission();
  
  // Firebase 메시징 초기화
  setTimeout(() => {
    initializeFirebaseMessaging();
  }, 1000);
  
  // 기존 토큰 확인
  const savedToken = localStorage.getItem('fcm-token');
  if (savedToken) {
    token = savedToken;
    console.log('💾 저장된 FCM 토큰 사용:', token);
  }
  
  console.log('📢 fine2 토픽 기능이 활성화되었습니다.');
  console.log('🧪 테스트 함수: testFine2Topic(), testFine2ImageUpload()');
});
function regCargoNo(){
  const cargoNO = document.querySelector("#cargoNo").value;
  database_f.ref(ref).update({"cargoNo": cargoNO}).then(() => {
    popUp()})
  }

// Dynamic font sizing for popTitleC elements
function adjustPopTitleFontSize() {
  const titleElements = document.querySelectorAll('.popTitleC');
  titleElements.forEach(element => {
    if (element.textContent.trim() === '') return; // Skip empty elements
    
    const container = element.parentElement || element;
    const containerWidth = container.offsetWidth - 10; // Account for padding
    const containerHeight = container.offsetHeight - 10;
    
    let fontSize = parseFloat(window.getComputedStyle(element).fontSize);
    const maxFontSize = containerHeight * 0.8; // Don't exceed 80% of container height
    
    // Start with a reasonable font size
    element.style.fontSize = Math.min(fontSize, maxFontSize) + 'px';
    
    // Reduce font size until text fits
    // while ((element.scrollWidth > containerWidth || element.scrollHeight > containerHeight) && fontSize > 10) {
    //   fontSize -= 1;
    //   element.style.fontSize = fontSize + 'px';
    // }
    
    // Increase font size if there's room
    while (element.scrollWidth < containerWidth && element.scrollHeight < containerHeight && fontSize < maxFontSize) {
      fontSize += 1;
      element.style.fontSize = fontSize + 'px';
      if (element.scrollWidth > containerWidth || element.scrollHeight > containerHeight) {
        fontSize -= 1;
        element.style.fontSize = fontSize + 'px';
        break;
      }
    }
  });
}