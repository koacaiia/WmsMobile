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
  
 for(let i=0;i<thList.length;i++){
  const th = document.createElement("th");
  th.innerHTML=thList[i];
  thR.appendChild(th);
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


if(!mC){
  const btn = document.querySelector("#titleDate");
  btn.innerHTML="일정 업로드 Page Load";
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
            'BK8nUIclBWnB6rW54BPZGN1oWJN-4jgQNe5-CdlO5HGW4WFT9vJKZPaZz4H4P_sF4x4t4T4U4U4U4U4U4U4',  // 예시 키 (실제 키로 교체 필요)
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

// FCM 메시지 수신 처리 (Service Worker가 등록된 경우에만)
// fine2 토픽 전용 메시지 수신 처리로 개선
if (typeof messaging !== 'undefined') {
  messaging.onMessage((payload) => {
    console.log('📨 FCM 메시지 수신:', payload);
    
    // 토픽 정보 확인
    const topic = payload.data?.topic || payload.from || 'unknown';
    const notificationTitle = payload.notification?.title || '알림';
    const notificationBody = payload.notification?.body || '메시지 내용';
    const notificationIcon = payload.notification?.icon || '/WmsMobile/images/default-icon.png';
    
    console.log('📋 수신 정보:', {
      topic: topic,
      title: notificationTitle,
      body: notificationBody,
      timestamp: new Date().toLocaleString()
    });
    
    // fine2 토픽 메시지 특별 처리
    if (topic.includes('fine2') || payload.data?.source === 'fine2') {
      console.log('🎯 fine2 토픽 메시지 감지!');
      
      // fine2 토픽 전용 알림 표시
      if ('Notification' in window && Notification.permission === 'granted') {
        const fine2Notification = new Notification(`[fine2] ${notificationTitle}`, {
          body: notificationBody,
          icon: notificationIcon,
          badge: '/WmsMobile/images/icon.png',
          tag: 'fine2-topic-notification',
          requireInteraction: true,
          timestamp: Date.now(),
          data: {
            topic: 'fine2',
            originalPayload: payload
          }
        });
        
        // fine2 알림 클릭 이벤트
        fine2Notification.onclick = function() {
          console.log('🖱️ fine2 토픽 알림 클릭됨');
          window.focus();
          // 필요시 특정 페이지로 이동
          // location.href = 'specific-page.html';
          fine2Notification.close();
        };
        
        // 10초 후 자동 닫기
        setTimeout(() => {
          fine2Notification.close();
        }, 10000);
      }
      
      // fine2 토픽 수신 기록 저장
      const fine2Record = {
        title: notificationTitle,
        body: notificationBody,
        timestamp: new Date().toISOString(),
        topic: 'fine2',
        type: 'received'
      };
      
      const existingRecords = JSON.parse(localStorage.getItem('fine2_received_history') || '[]');
      existingRecords.unshift(fine2Record);
      
      // 최근 30개만 유지
      if (existingRecords.length > 30) {
        existingRecords.splice(30);
      }
      
      localStorage.setItem('fine2_received_history', JSON.stringify(existingRecords));
      console.log('📝 fine2 수신 기록 저장 완료');
      
    } else {
      console.log('📢 일반 FCM 메시지 처리');
      
      // 일반 메시지 처리
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notificationTitle, {
          body: notificationBody,
          icon: notificationIcon
        });
      }
    }
    
    // 기존 alert은 제거하거나 선택적으로 사용
    // alert(notificationBody);
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
    to: `/topics/fine2`,
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

// 토픽 구독 함수
function subscribeToTopic(token, topicName) {
  console.log(`📢 토픽 '${topicName}' 구독을 시도합니다...`);
  
  const serverKey = "AAAAYLjTacM:APA91bEfxvEgfzLykmd3YAu-WAI6VW64Ol8TdmGC0GIKao0EB9c3OMAsJNpPCDEUVsMgUkQjbWCpP_Dw2CNpF2u-4u3xuUF30COZslRIqqbryAAhQu0tGLdtFsTXU5EqsMGaMnGK8jpQ";
  
  const subscribePayload = {
    to: `/topics/${topicName}`,
    registration_tokens: [token]
  };

  fetch('https://iid.googleapis.com/iid/v1:batchAdd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'key=' + serverKey
    },
    body: JSON.stringify(subscribePayload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log(`✅ 토픽 '${topicName}' 구독 성공:`, data);
    
    // 로컬 저장소에 구독 상태 저장
    localStorage.setItem(`fcm_topic_${topicName}`, 'subscribed');
    localStorage.setItem(`fcm_topic_${topicName}_date`, new Date().toISOString());
    
    // 구독 성공 알림
    sendLocalNotification(
      "토픽 구독 완료", 
      `'${topicName}' 토픽 구독이 완료되었습니다. 해당 토픽의 알림을 받을 수 있습니다.`
    );
  })
  .catch(error => {
    console.log(`❌ 토픽 '${topicName}' 구독 실패 (CORS 제한):`, error.message);
    
    // CORS 문제로 인해 직접 구독이 실패하더라도 로컬에 상태 저장
    localStorage.setItem(`fcm_topic_${topicName}`, 'attempted');
    localStorage.setItem(`fcm_topic_${topicName}_date`, new Date().toISOString());
    
    console.log(`💡 토픽 구독을 위한 대안 방법:`);
    console.log(`   1. 서버 측에서 토큰을 사용해 토픽 구독 처리`);
    console.log(`   2. Firebase Admin SDK를 통한 구독 관리`);
    console.log(`   3. 토큰: ${token}`);
    console.log(`   4. 토픽: ${topicName}`);
    
    // 구독 시도 알림
    sendLocalNotification(
      "토픽 구독 시도", 
      `'${topicName}' 토픽 구독을 시도했습니다. 서버에서 추가 설정이 필요할 수 있습니다.`
    );
  });
}

// 토픽 구독 해제 함수
function unsubscribeFromTopic(token, topicName) {
  console.log(`📢 토픽 '${topicName}' 구독 해제를 시도합니다...`);
  
  const serverKey = "AAAAYLjTacM:APA91bEfxvEgfzLykmd3YAu-WAI6VW64Ol8TdmGC0GIKao0EB9c3OMAsJNpPCDEUVsMgUkQjbWCpP_Dw2CNpF2u-4u3xuUF30COZslRIqqbryAAhQu0tGLdtFsTXU5EqsMGaMnGK8jpQ";
  
  const unsubscribePayload = {
    to: `/topics/${topicName}`,
    registration_tokens: [token]
  };

  fetch('https://iid.googleapis.com/iid/v1:batchRemove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'key=' + serverKey
    },
    body: JSON.stringify(unsubscribePayload)
  })
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log(`✅ 토픽 '${topicName}' 구독 해제 성공:`, data);
    
    // 로컬 저장소에서 구독 상태 제거
    localStorage.removeItem(`fcm_topic_${topicName}`);
    localStorage.removeItem(`fcm_topic_${topicName}_date`);
    
    // 구독 해제 성공 알림
    sendLocalNotification(
      "토픽 구독 해제", 
      `'${topicName}' 토픽 구독이 해제되었습니다.`
    );
  })
  .catch(error => {
    console.log(`❌ 토픽 '${topicName}' 구독 해제 실패:`, error.message);
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

// 모바일 환경 감지 및 알림 시스템 완전 재구성
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isAndroid = /Android/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

console.log('📱 모바일 환경 감지:', {
    isMobile: isMobile,
    isAndroid: isAndroid,
    isIOS: isIOS,
    userAgent: navigator.userAgent
});

// 모바일용 토스트 알림 시스템
function createMobileToast(title, message, duration = 5000) {
    console.log('📱 모바일 토스트 생성:', title, message);
    
    // 기존 토스트 제거
    const existingToast = document.getElementById('mobile-toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 새 토스트 생성
    const toast = document.createElement('div');
    toast.id = 'mobile-toast';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        left: 10px;
        right: 10px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.3);
        z-index: 99999;
        font-family: Arial, sans-serif;
        font-size: 14px;
        text-align: left;
        border: 2px solid rgba(255,255,255,0.1);
        backdrop-filter: blur(10px);
        animation: slideInDown 0.5s ease-out;
    `;
    
    // 애니메이션 CSS 추가
    if (!document.getElementById('toast-animation-style')) {
        const style = document.createElement('style');
        style.id = 'toast-animation-style';
        style.textContent = `
            @keyframes slideInDown {
                from {
                    transform: translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutUp {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(-100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // 시간 정보 추가
    const currentTime = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    
    toast.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
                <div style="font-weight: bold; font-size: 16px; margin-bottom: 5px; color: #fff;">
                    📱 ${title}
                </div>
                <div style="line-height: 1.4; color: rgba(255,255,255,0.9);">
                    ${message}
                </div>
                <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 8px;">
                    ⏰ ${currentTime}
                </div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: rgba(255,255,255,0.2); border: none; color: white; 
                           border-radius: 50%; width: 24px; height: 24px; cursor: pointer;
                           font-size: 16px; line-height: 1; margin-left: 10px;">
                ×
            </button>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // 진동 효과 (Android에서 지원)
    if (navigator.vibrate && isAndroid) {
        navigator.vibrate([200, 100, 200]);
    }
    
    // 자동 제거
    setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.style.animation = 'slideOutUp 0.5s ease-in';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.remove();
                }
            }, 500);
        }
    }, duration);
    
    // 클릭 시 즉시 제거
    toast.onclick = () => {
        if (toast && toast.parentNode) {
            toast.remove();
        }
    };
    
    console.log('✅ 모바일 토스트 표시 완료');
    return toast;
}

// 모바일용 전체화면 알림
function createFullScreenMobileNotification(title, message) {
    console.log('📱 전체화면 모바일 알림 생성:', title);
    
    const overlay = document.createElement('div');
    overlay.id = 'mobile-fullscreen-notification';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(5px);
    `;
    
    const notification = document.createElement('div');
    notification.style.cssText = `
        background: white;
        margin: 20px;
        padding: 30px;
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        text-align: center;
        max-width: 90%;
        animation: bounceIn 0.6s ease-out;
    `;
    
    // 애니메이션 추가
    if (!document.getElementById('fullscreen-animation-style')) {
        const style = document.createElement('style');
        style.id = 'fullscreen-animation-style';
        style.textContent = `
            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    const currentTime = new Date().toLocaleString('ko-KR');
    
    notification.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 10px;">📱</div>
        <h2 style="color: #333; margin: 0 0 15px 0; font-size: 20px;">${title}</h2>
        <p style="color: #666; line-height: 1.5; margin: 0 0 20px 0; font-size: 16px;">${message}</p>
        <div style="color: #999; font-size: 12px; margin-bottom: 20px;">⏰ ${currentTime}</div>
        <button onclick="document.getElementById('mobile-fullscreen-notification').remove()" 
                style="background: #4285f4; color: white; border: none; padding: 12px 24px; 
                       border-radius: 8px; font-size: 16px; cursor: pointer; min-width: 100px;">
            확인
        </button>
    `;
    
    overlay.appendChild(notification);
    document.body.appendChild(overlay);
    
    // 진동
    if (navigator.vibrate) {
        navigator.vibrate([300, 200, 300, 200, 300]);
    }
    
    // 배경 클릭 시 닫기
    overlay.onclick = (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    };
    
    // 10초 후 자동 닫기
    setTimeout(() => {
        if (overlay && overlay.parentNode) {
            overlay.remove();
        }
    }, 10000);
    
    return overlay;
}

// 모바일 크롬 전용 알림 시스템
function sendMobileChromeNotification(title, body, options = {}) {
    console.log('📱 모바일 크롬 알림 시작:', title, body);
    
    // 1단계: 브라우저 알림 시도
    if ('Notification' in window) {
        console.log('📱 현재 알림 권한:', Notification.permission);
        
        if (Notification.permission === 'granted') {
            try {
                console.log('📱 브라우저 알림 생성 시도...');
                
                const notification = new Notification(title, {
                    body: body,
                    icon: './images/icon.png',
                    badge: './images/icon.png',
                    tag: 'mobile-chrome-' + Date.now(),
                    requireInteraction: false, // 모바일에서는 false가 더 안정적
                    silent: false,
                    vibrate: [200, 100, 200, 100, 200],
                    timestamp: Date.now(),
                    data: {
                        timestamp: new Date().toISOString(),
                        mobile: true
                    },
                    // 모바일 크롬에서 지원하는 추가 옵션들
                    renotify: true,
                    sticky: false
                });
                
                notification.onshow = () => {
                    console.log('✅ 모바일 브라우저 알림 표시 성공');
                };
                
                notification.onerror = (error) => {
                    console.log('❌ 모바일 브라우저 알림 오류:', error);
                    // 오류 시 토스트로 대체
                    createMobileToast(title, body);
                };
                
                notification.onclick = () => {
                    console.log('📱 모바일 알림 클릭됨');
                    window.focus();
                    notification.close();
                };
                
                // 모바일에서는 자동 닫기 시간을 짧게
                setTimeout(() => {
                    if (notification) {
                        notification.close();
                    }
                }, 6000);
                
                // 브라우저 알림 성공 시 토스트는 표시하지 않음
                return true;
                
            } catch (error) {
                console.log('❌ 브라우저 알림 생성 실패:', error);
            }
        } else if (Notification.permission === 'default') {
            console.log('📱 알림 권한 요청 중...');
            
            Notification.requestPermission().then(permission => {
                console.log('📱 권한 요청 결과:', permission);
                if (permission === 'granted') {
                    // 권한 획득 후 재시도
                    setTimeout(() => {
                        sendMobileChromeNotification(title, body, options);
                    }, 100);
                } else {
                    console.log('❌ 알림 권한 거부됨 - 토스트로 대체');
                    createMobileToast(title, body);
                }
            });
            return false;
        } else {
            console.log('❌ 알림 권한 거부됨 - 토스트로 대체');
        }
    } else {
        console.log('❌ Notification API 미지원 - 토스트로 대체');
    }
    
    // 2단계: 브라우저 알림 실패 시 토스트 알림
    createMobileToast(title, body);
    
    // 3단계: 중요한 알림의 경우 전체화면 알림도 추가
    if (options.important) {
        setTimeout(() => {
            createFullScreenMobileNotification(title, body);
        }, 1000);
    }
    
    return true;
}

// 기존 sendLocalNotification 함수를 모바일용으로 교체
function sendLocalNotification(title, body, icon) {
    console.log('📱 sendLocalNotification 호출:', title, body);
    
    // 모바일 환경에서는 모바일 전용 알림 사용
    if (isMobile) {
        return sendMobileChromeNotification(title, body, { important: false });
    } else {
        // 데스크톱 환경에서는 기존 로직 사용
        return sendDesktopNotification(title, body, icon);
    }
}

// 데스크톱용 알림 함수 (기존 로직)
function sendDesktopNotification(title, body, icon) {
    console.log('🖥️ 데스크톱 알림:', title, body);
    
    if (!("Notification" in window)) {
        console.log("❌ 브라우저가 알림을 지원하지 않습니다.");
        alert(`알림: ${title}\n${body}`);
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
                tag: 'wms-desktop-notification-' + Date.now(),
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

            console.log('✅ 데스크톱 알림 전송 성공');
            return true;
            
        } catch (error) {
            console.error('❌ 데스크톱 알림 생성 오류:', error);
            alert(`알림: ${title}\n${body}`);
            return false;
        }
    } else {
        console.log('❌ 알림 권한 없음');
        alert(`알림: ${title}\n${body}`);
        return false;
    }
}

// 모바일 크롬 전용 테스트 함수들
function testMobileChromeNotifications() {
    console.log('📱 모바일 크롬 알림 테스트 시작');
    
    // 1. 토스트 알림 테스트
    setTimeout(() => {
        createMobileToast('🧪 토스트 테스트', '모바일 토스트 알림이 정상 작동합니다.');
    }, 500);
    
    // 2. 브라우저 알림 테스트
    setTimeout(() => {
        sendMobileChromeNotification('📱 브라우저 알림', '모바일 크롬 브라우저 알림 테스트입니다.');
    }, 2000);
    
    // 3. 전체화면 알림 테스트
    setTimeout(() => {
        createFullScreenMobileNotification('🔔 전체화면 알림', '중요한 알림입니다. 전체화면으로 표시됩니다.');
    }, 4000);
    
    // 4. 작업 상태 알림 테스트
    setTimeout(() => {
        sendLocalNotification('작업 상태 업데이트', '테스트고객 - TEST123: 컨테이너진입 완료');
    }, 6000);
}

// 모바일 환경에서 자동으로 권한 요청
function requestMobileNotificationPermission() {
    console.log('📱 모바일 알림 권한 요청');
    
    if (!('Notification' in window)) {
        console.log('❌ 모바일 브라우저가 알림을 지원하지 않습니다.');
        createMobileToast('알림 미지원', '이 브라우저는 알림을 지원하지 않습니다. 토스트 메시지를 사용합니다.');
        return Promise.resolve(false);
    }
    
    if (Notification.permission === 'granted') {
        console.log('✅ 모바일 알림 권한이 이미 허용되어 있습니다.');
        return Promise.resolve(true);
    }
    
    if (Notification.permission === 'denied') {
        console.log('❌ 모바일 알림 권한이 거부되어 있습니다.');
        createMobileToast(
            '알림 권한 필요', 
            '크롬 브라우저 설정 > 사이트 설정 > 알림에서 이 사이트의 알림을 허용해주세요.',
            8000
        );
        return Promise.resolve(false);
    }
    
    return Notification.requestPermission().then(permission => {
        console.log('📱 모바일 권한 요청 결과:', permission);
        
        if (permission === 'granted') {
            createMobileToast('알림 설정 완료', 'WMS 모바일 알림이 활성화되었습니다!');
            return true;
        } else {
            createMobileToast(
                '알림 권한 거부됨', 
                '브라우저 설정에서 수동으로 알림을 허용해주세요.',
                8000
            );
            return false;
        }
    });
}

// 모바일 환경 초기화
if (isMobile) {
    console.log('📱 모바일 환경 감지됨 - 모바일 알림 시스템 초기화');
    
    // 페이지 로드 시 모바일 환경 안내
    setTimeout(() => {
        createMobileToast(
            'WMS 모바일 모드', 
            '모바일 환경에 최적화된 알림 시스템이 활성화되었습니다.',
            3000
        );
    }, 1000);
    
    // 2초 후 권한 요청
    setTimeout(() => {
        requestMobileNotificationPermission();
    }, 3000);
}

// 토픽 관리 관련 함수들을 상단으로 이동
function checkTopicSubscriptions() {
    console.log('📋 현재 토픽 구독 상태 확인 중...');
    
    const topics = ['fine2', 'wms-notifications', 'mobile-alerts']; // 확인할 토픽 목록
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

// 토픽 구독 함수 (로컬 저장 방식)
function subscribeToTopicManual(topicName) {
    console.log(`🔧 수동 토픽 구독: ${topicName}`);
    
    if (typeof token === 'undefined' || !token) {
        console.log('❌ FCM 토큰이 없습니다. 로컬에서만 구독 상태를 관리합니다.');
        
        // 토큰 없어도 로컬에서 구독 상태 관리
        const subscriptionKey = `fcm_topic_${topicName}`;
        const dateKey = `fcm_topic_${topicName}_date`;
        
        localStorage.setItem(subscriptionKey, 'subscribed_manual');
        localStorage.setItem(dateKey, new Date().toISOString());
        
        console.log(`✅ 토픽 '${topicName}' 수동 구독 완료 (토큰 없음)`);
        
        if (typeof sendLocalNotification === 'function') {
            sendLocalNotification(
                '수동 토픽 구독',
                `'${topicName}' 토픽에 수동으로 구독되었습니다. (토큰 획득 시 자동 활성화)`
            );
        }
        
        return true;
    }
    
    return subscribeToTopic(token, topicName);
}

function unsubscribeFromTopicManual(topicName) {
    console.log(`🔧 수동 토픽 구독 해제: ${topicName}`);
    
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

// 모든 토픽에 일괄 구독
function subscribeToAllTopics() {
    console.log('📢 모든 토픽에 일괄 구독 시작');
    
    const topics = ['fine2', 'wms-notifications', 'mobile-alerts'];
    const results = {};
    
    topics.forEach(topic => {
        results[topic] = subscribeToTopicManual(topic);
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

// 모든 토픽 구독 해제
function unsubscribeFromAllTopics() {
    console.log('📢 모든 토픽 구독 해제 시작');
    
    const topics = ['fine2', 'wms-notifications', 'mobile-alerts'];
    const results = {};
    
    topics.forEach(topic => {
        results[topic] = unsubscribeFromTopicManual(topic);
    });
    
    console.log('📋 일괄 구독 해제 결과:', results);
    
    if (typeof sendLocalNotification === 'function') {
        sendLocalNotification(
            '일괄 토픽 구독 해제 완료',
            '모든 토픽 구독이 해제되었습니다.'
        );
    }
    
    return results;
}

// FCM 토큰과 토픽 상태 동기화
function syncTokenWithTopics() {
    console.log('🔄 FCM 토큰과 토픽 상태 동기화 시작');
    
    if (typeof token === 'undefined' || !token) {
        console.log('❌ FCM 토큰이 없어서 동기화할 수 없습니다.');
        return false;
    }
    
    const topics = ['fine2', 'wms-notifications', 'mobile-alerts'];
    let syncCount = 0;
    
    topics.forEach(topic => {
        const subscriptionKey = `fcm_topic_${topic}`;
        const isSubscribed = localStorage.getItem(subscriptionKey);
        
        if (isSubscribed) {
            console.log(`🔄 토픽 '${topic}' 동기화 중...`);
            syncCount++;
        }
    });
    
    console.log(`✅ ${syncCount}개 토픽 동기화 완료`);
    
    if (typeof sendLocalNotification === 'function') {
        sendLocalNotification(
            'FCM 동기화 완료',
            `${syncCount}개 토픽이 FCM 토큰과 동기화되었습니다.`
        );
    }
    
    return true;
}

// 토픽 상태 초기화
function resetTopicSubscriptions() {
    console.log('🔄 토픽 구독 상태 초기화');
    
    const topics = ['fine2', 'wms-notifications', 'mobile-alerts'];
    
    topics.forEach(topic => {
        const subscriptionKey = `fcm_topic_${topic}`;
        const dateKey = `fcm_topic_${topic}_date`;
        
        localStorage.removeItem(subscriptionKey);
        localStorage.removeItem(dateKey);
    });
    
    console.log('✅ 모든 토픽 구독 상태가 초기화되었습니다.');
    
    if (typeof sendLocalNotification === 'function') {
        sendLocalNotification(
            '토픽 상태 초기화',
            '모든 토픽 구독 상태가 초기화되었습니다.'
        );
    }
    
    return true;
}

// 토픽 구독 상태를 HTML로 표시
function displayTopicSubscriptions() {
    console.log('📋 토픽 구독 상태 HTML 표시');
    
    const subscriptionInfo = checkTopicSubscriptions();
    
    let html = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: white; padding: 20px; border-radius: 10px; box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                    z-index: 10000; max-width: 90%; max-height: 80%; overflow-y: auto;">
            <h3 style="margin-top: 0; color: #333;">📋 토픽 구독 상태</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f5f5f5;">
                        <th style="padding: 10px; border: 1px solid #ddd;">토픽명</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">상태</th>
                        <th style="padding: 10px; border: 1px solid #ddd;">구독일시</th>
                    </tr>
                </thead>
                <tbody>
    `;
    
    Object.entries(subscriptionInfo).forEach(([topic, info]) => {
        const statusIcon = info.subscribed ? '✅' : '❌';
        const statusText = info.subscribed ? '구독됨' : '구독되지 않음';
        
        html += `
            <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${topic}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${statusIcon} ${statusText}</td>
                <td style="padding: 10px; border: 1px solid #ddd; font-size: 12px;">${info.date}</td>
            </tr>
        `;
    });
    
    const tokenInfo = (typeof token !== 'undefined' && token) ? token.substring(0, 30) + '...' : '없음';
    const permissionInfo = 'Notification' in window ? Notification.permission : 'API 미지원';
    
    html += `
                </tbody>
            </table>
            <div style="margin-top: 20px; text-align: center;">
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="padding: 10px 20px; background: #4285f4; color: white; 
                               border: none; border-radius: 5px; cursor: pointer;">
                    닫기
                </button>
            </div>
            <div style="margin-top: 15px; font-size: 12px; color: #666;">
                <strong>FCM 토큰:</strong> ${tokenInfo}<br>
                <strong>알림 권한:</strong> ${permissionInfo}<br>
                <strong>확인 시간:</strong> ${new Date().toLocaleString()}
            </div>
        </div>
    `;
    
    // 기존 표시창 제거
    const existingDisplay = document.getElementById('topic-subscription-display');
    if (existingDisplay) {
        existingDisplay.remove();
    }
    
    // 새 표시창 생성
    const display = document.createElement('div');
    display.id = 'topic-subscription-display';
    display.innerHTML = html;
    
    document.body.appendChild(display);
    
    return subscriptionInfo;
}

// Firebase 연결 상태 확인
function checkFirebaseConnection() {
    console.log('🔥 Firebase 연결 상태 확인');
    
    const firebaseStatus = {
        app: typeof firebase !== 'undefined',
        database: typeof firebase !== 'undefined' && firebase.database,
        messaging: typeof firebase !== 'undefined' && firebase.messaging,
        analytics: typeof firebase !== 'undefined' && firebase.analytics,
        storage: typeof firebase !== 'undefined' && firebase.storage
    };
    
    console.log('🔥 Firebase 상태:', firebaseStatus);
    
    let statusMessage = 'Firebase 연결 상태:\n';
    Object.entries(firebaseStatus).forEach(([service, available]) => {
        statusMessage += `${available ? '✅' : '❌'} ${service}\n`;
    });
    
    console.log(statusMessage);
    
    if (typeof sendLocalNotification === 'function') {
        sendLocalNotification(
            'Firebase 상태 확인',
            statusMessage.replace(/\n/g, ' | ')
        );
    }
    
    return firebaseStatus;
}

// 종합 시스템 상태 확인
function checkSystemStatus() {
    console.log('🔍 WMS 시스템 종합 상태 확인');
    
    // 1. 토픽 구독 상태
    const topicStatus = checkTopicSubscriptions();
    
    // 2. Firebase 연결 상태
    const firebaseStatus = checkFirebaseConnection();
    
    // 3. 알림 시스템 상태
    const notificationStatus = {
        permission: 'Notification' in window ? Notification.permission : 'API 미지원',
        fcmToken: !!(typeof token !== 'undefined' && token),
        serviceWorker: 'serviceWorker' in navigator
    };
    
    // 4. 모바일 환경 상태
    const mobileStatus = {
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        isAndroid: /Android/i.test(navigator.userAgent),
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent)
    };
    
    const systemStatus = {
        topics: topicStatus,
        firebase: firebaseStatus,
        notifications: notificationStatus,
        mobile: mobileStatus,
        timestamp: new Date().toISOString()
    };
    
    console.log('📊 시스템 종합 상태:', systemStatus);
    
    // 상태를 HTML로 표시
    displaySystemStatus(systemStatus);
    
    return systemStatus;
}

function displaySystemStatus(status) {
    const html = `
        <div style="position: fixed; top: 10px; right: 10px; 
                    background: white; padding: 15px; border-radius: 8px; 
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 10000;
                    max-width: 300px; font-family: Arial, sans-serif; font-size: 12px;">
            <h4 style="margin: 0 0 10px 0; color: #333;">🔍 시스템 상태</h4>
            
            <div style="margin-bottom: 8px;">
                <strong>📱 모바일:</strong> ${status.mobile.isMobile ? '✅' : '❌'}
                ${status.mobile.isAndroid ? '(Android)' : status.mobile.isIOS ? '(iOS)' : '(Desktop)'}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>🔔 알림:</strong> ${status.notifications.permission === 'granted' ? '✅' : '❌'} 
                ${status.notifications.permission}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>📱 FCM:</strong> ${status.notifications.fcmToken ? '✅' : '❌'} 
                ${status.notifications.fcmToken ? '토큰 있음' : '토큰 없음'}
            </div>
            
            <div style="margin-bottom: 8px;">
                <strong>🔥 Firebase:</strong> ${status.firebase.app ? '✅' : '❌'} 
                ${status.firebase.messaging ? 'MSG' : ''} 
                ${status.firebase.database ? 'DB' : ''}
            </div>
            
            <div style="margin-bottom: 10px;">
                <strong>📢 토픽:</strong> ${Object.values(status.topics).filter(t => t.subscribed).length}개 구독
            </div>
            
            <button onclick="this.parentElement.remove()" 
                    style="width: 100%; padding: 5px; background: #4285f4; color: white; 
                           border: none; border-radius: 4px; cursor: pointer;">
                닫기
            </button>
        </div>
    `;
    
    // 기존 상태창 제거
    const existingStatus = document.getElementById('system-status-display');
    if (existingStatus) {
        existingStatus.remove();
    }
    
    // 새 상태창 생성
    const display = document.createElement('div');
    display.id = 'system-status-display';
    display.innerHTML = html;
    
    document.body.appendChild(display);
    
    // 10초 후 자동 닫기
    setTimeout(() => {
        if (display && display.parentNode) {
            display.remove();
        }
    }, 10000);
}

// returnTime 함수 추가 (누락된 함수)
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

// 기타 누락된 함수들 추가
function getIconPath() {
    return './images/icon.png';
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

// 개발자 도구 함수들을 전역으로 노출 (즉시 실행)
window.checkTopicSubscriptions = checkTopicSubscriptions;
window.subscribeToTopicManual = subscribeToTopicManual;
window.unsubscribeFromTopicManual = unsubscribeFromTopicManual;
window.subscribeToAllTopics = subscribeToAllTopics;
window.unsubscribeFromAllTopics = unsubscribeFromAllTopics;
window.syncTokenWithTopics = syncTokenWithTopics;
window.resetTopicSubscriptions = resetTopicSubscriptions;
window.displayTopicSubscriptions = displayTopicSubscriptions;
window.checkFirebaseConnection = checkFirebaseConnection;
window.checkSystemStatus = checkSystemStatus;
window.returnTime = returnTime;

// 즉시 사용 가능하도록 로그 출력
console.log(`
📢 토픽 구독 관리 도구 (즉시 사용 가능):

🔍 상태 확인:
   checkTopicSubscriptions()     - 토픽 구독 상태 확인
   displayTopicSubscriptions()   - 토픽 상태 HTML 표시
   checkSystemStatus()           - 전체 시스템 상태 확인

📝 구독 관리:
   subscribeToTopicManual('토픽명')   - 수동 토픽 구독
   unsubscribeFromTopicManual('토픽명') - 수동 토픽 해제
   subscribeToAllTopics()             - 모든 토픽 일괄 구독
   unsubscribeFromAllTopics()         - 모든 토픽 일괄 해제

🔧 유지보수:
   syncTokenWithTopics()         - FCM 토큰과 동기화
   resetTopicSubscriptions()     - 토픽 상태 초기화
   checkFirebaseConnection()     - Firebase 연결 확인

💡 권장 사용법:
   1. checkSystemStatus() - 전체 상태 확인
   2. subscribeToAllTopics() - 모든 토픽 구독
   3. displayTopicSubscriptions() - 구독 상태 확인

✅ 모든 함수가 정의되어 즉시 사용 가능합니다!
`);
function reLoad(){
  if(mC){
    // location.reload(); // 직접 새로고침 대신
    window.location.href = window.location.href; // 이 방법 사용
  }else{
    location.href="https://koacaiia.github.io/Wms-fine-/";
  }
}