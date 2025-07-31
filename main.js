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
      try {
        if (typeof toastOn === 'function') {
          toastOn("사진 전송 없이 작업 완료 등록만 진행 합니다.");
        }
        
        // FCM 알림 전송 - 사진 없이 작업 완료 (안전하게)
        const h3List = document.querySelectorAll(".popTitleC");
        const clientName = h3List[0].innerHTML;
        const containerInfo = h3List[1].innerHTML;
        
        // 로컬 알림 우선 사용 (CORS 문제 회피)
        if (typeof sendLocalNotification === 'function') {
          const notificationSent = sendLocalNotification(
            "작업 완료 등록", 
            `${clientName} - ${containerInfo}: 사진 전송 없이 작업 완료 등록`,
            {
              client: clientName,
              container: containerInfo,
              hasImages: false,
              workType: ioValue === "InCargo" ? "컨테이너진입" : "작업완료"
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
      } catch (notificationError) {
        console.error('❌ 작업 완료 알림 전송 오류:', notificationError);
      }
    } else {
      // 이미지 업로드 처리 (Promise 오류 처리)
      try {
        for(let i=0;i<img.length;i++){
          const imgSrc = img[i].src;
          imgUrls.push(imgSrc);
        }
        const storageRef = storage_f.ref(refFile);
        
        // 각 이미지 업로드를 Promise로 처리
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
              
              const fileName = selectTr.cells[0].innerHTML+"_"+selectTr.cells[2].innerHTML+"_"+selectTr.cells[3].innerHTML+"_"+selectTr.cells[4].innerHTML+"_"+index+"_"+returnTime();
              const file = new File([blob], fileName, { type: blob.type });
              const fileRef = storageRef.child(fileName.replace("/","_"));
              
              return fileRef.put(file);
            })
            .then((snapshot) => {
              console.log(`✅ 파일 ${index + 1} 업로드 완료`);
              return snapshot;
            })
            .catch(error => {
              console.error(`❌ 파일 ${index + 1} 업로드 오류:`, error);
              return null; // 실패한 파일은 null 반환
            });
        });
        
        // 모든 업로드 완료 대기 (실패한 것들도 포함)
        Promise.allSettled(uploadPromises)
          .then((results) => {
            const successCount = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
            const failureCount = results.filter(result => result.status === 'rejected' || result.value === null).length;
            
            console.log(`✅ 이미지 업로드 완료: 성공 ${successCount}개, 실패 ${failureCount}개`);
            
            try {
              // FCM 알림 전송 - 모든 이미지 업로드 완료
              const clientName = h3List[0].innerHTML;
              const containerInfo = h3List[1].innerHTML;
              
              if (typeof sendLocalNotification === 'function') {
                sendLocalNotification(
                  "이미지 업로드 완료", 
                  `${clientName} - ${containerInfo}: ${successCount}개 이미지 Firebase 업로드 완료`
                );
              }
              
              if (typeof toastOn === 'function') {
                toastOn(successCount + " 파일 업로드 완료");
              }
              
            } catch (notificationError) {
              console.error('❌ 업로드 완료 알림 전송 오류:', notificationError);
            }
            
            // 이미지 목록 새로고침 (안전하게)
            try {
              refreshImageList();
            } catch (refreshError) {
              console.error('❌ 이미지 목록 새로고침 오류:', refreshError);
            }
          })
          .catch((error) => {
            console.error("❌ 이미지 업로드 Promise.allSettled 오류:", error);
            try {
              if (typeof toastOn === 'function') {
                toastOn("이미지 업로드 중 오류가 발생했습니다.", 5000);
              }
            } catch (toastError) {
              console.error('❌ 오류 토스트 메시지 실패:', toastError);
            }
          });
          
      } catch (uploadError) {
        console.error('❌ 이미지 업로드 준비 오류:', uploadError);
        try {
          if (typeof toastOn === 'function') {
            toastOn("이미지 업로드 준비 중 오류가 발생했습니다.", 5000);
          }
        } catch (toastError) {
          console.error('❌ 오류 토스트 메시지 실패:', toastError);
        }
      }
    }
    
    // 작업 상태 업데이트 (Promise 오류 처리)
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
          // FCM 알림 전송 - 작업 상태 업데이트 완료
          const clientName = h3List[0].innerHTML;
          const containerInfo = h3List[1].innerHTML;
          const workStatus = ioValue=="InCargo" ? "컨테이너진입" : "작업완료";
          
          if (typeof sendLocalNotification === 'function') {
            sendLocalNotification(
              "작업 상태 업데이트", 
              `${clientName} - ${containerInfo}: ${workStatus} 처리 완료`
            );
          }
        } catch (notificationError) {
          console.error('❌ 상태 업데이트 알림 전송 오류:', notificationError);
        }
      })
      .catch((error) => {
        console.error("❌ 작업 상태 업데이트 오류:", error);
        try {
          if (typeof toastOn === 'function') {
            toastOn("작업 상태 업데이트 실패", 5000);
          }
        } catch (toastError) {
          console.error('❌ 오류 토스트 메시지 실패:', toastError);
        }
      });
}

// 이미지 목록 새로고침 함수 (Promise 오류 처리)
function refreshImageList() {
  const fileTr = document.querySelector("#imgTr");
  fileTr.replaceChildren();
  
  let imgRef=ref.replace("DeptName","images").replaceAll("/",",");
  imgRef = imgRef.split(",");
  const io=imgRef[4];
  const dateArr = imgRef[2];
  imgRef[3]=dateArr;
  imgRef[2]=io;
  imgRef.splice(4,1);
  imgRef=imgRef.toString().replaceAll(",","/")+"/";
  
  storage_f.ref(imgRef).listAll()
    .then((res)=>{
      const imagePromises = res.items.map((itemRef) => {
        return itemRef.getDownloadURL()
          .then((url)=>{
            try {
              const td = document.createElement("td");
              const img = document.createElement("img");
              img.src=url;
              img.className="server-img";
              img.addEventListener("click", (e) => {
                try {
                  img.parentNode.classList.toggle("file-selected");
                } catch (clickError) {
                  console.error('❌ 이미지 클릭 처리 오류:', clickError);
                }
              });
              img.style.display="block";
              td.style="width:32.5vw;height:36vh;border:1px dashed red;border-radius:5px";
              img.style.width="100%";
              img.style.height="100%";
              img.style.objectFit = "scale-down";
              td.appendChild(img);
              fileTr.appendChild(td);
            } catch (domError) {
              console.error('❌ 이미지 DOM 처리 오류:', domError);
            }
          })
          .catch((urlError) => {
            console.error('❌ 이미지 URL 가져오기 오류:', urlError);
          });
      });
      
      return Promise.allSettled(imagePromises);
    })
    .then((results) => {
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      console.log(`✅ 이미지 목록 새로고침 완료: ${successCount}개 이미지 로드됨`);
    })
    .catch((error) => {
      console.error('❌ 이미지 목록 조회 오류:', error);
    });
}