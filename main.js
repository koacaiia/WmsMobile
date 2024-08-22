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
let ref;
let refFile;
let ioValue;
let upfileList;
let token;
const mC = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
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
    }).catch((e)=>{});
    database_f.ref(refI).get().then((snapshot)=>{
        const val=snapshot.val();
        for(let i in val){
            let spec="";
            if(val[i]["container40"]==="1"){
                spec="40FT";}
            else if(val[i]["container20"]==="1"){
                spec="20FT";}
            else if(val[i]["lclcargo"]!="0"){
                spce="LcL";
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
                document.querySelector("#mainOut").style="display:none";
                ref=tr.id;
                ioValue="InCargo";
                popUp();
            });
            if(val[i]["working"]!=""){
                tr.style="color:red;";}
        }
    }).
    catch((e)=>{
        alert(e);
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
                document.querySelector("#mainIn").style="display:none";
                ref=tr.id;
                ioValue="outCargo";
                popUp();
            });
            if(val[i]["workprocess"]!="미"){
              tr.style="color:red;";}
        }
    }).catch((e)=>{
        alert(e);
    });
    
}
getData(titleDate.innerHTML);
function popUp(){
    const pop = document.querySelector("#mainPop");
    pop.style="display:grid;grid-template-rows:4vh 44vh;height:48vh";
    const mainDiv = document.querySelector("#mainPopDiv");
    // mainDiv.replaceChildren();
    const fileInput = document.querySelector("#fileInput");
    const imageDetail = document.querySelector("#imgBtn");
    imageDetail.addEventListener("click",(e)=>{
      popDetail(refFile);
    });
    const table= document.querySelector("#popInfoTable");
    const thead = document.querySelector("#popInfoTableThead");
    const tr = document.querySelector("#popInfoTableTr");
    tr.replaceChildren();
    let thList;
    const tBody = document.querySelector("#popInfoTableTbody");
    const fileTr = document.querySelector("#imgTr");
    fileTr.replaceChildren();
    if(ioValue=="InCargo"){
      thList=["관리번호","품명","PLT","EA","비고"];
      database_f.ref(ref).get().then((snapshot)=>{
          const val = snapshot.val();
          const container = val["container"];
          database_f.ref(ref).parent.get().then((snapshot)=>{
              const val = snapshot.val();
              for(let i in val){
              const cont = val[i]["container"];
              if(container==cont){
                  const tr = document.createElement("tr");
                  const td1 = document.createElement("td");
                  td1.innerHTML=val[i]["bl"];
                  const td2 = document.createElement("td");
                  td2.innerHTML=val[i]["description"];
                  const td3 = document.createElement("td");
                  td3.innerHTML=val[i]["Pqty"];
                  const td4 = document.createElement("td");
                  td4.innerHTML=val[i]["incargo"];
                  const td5 = document.createElement("td");
                  td5.innerHTML=val[i]["remark"];
                  tr.appendChild(td1);
                  tr.appendChild(td2);
                  tr.appendChild(td3);
                  tr.appendChild(td4);
                  tr.appendChild(td5);
                  tBody.appendChild(tr);
              }}
          }).catch((e)=>{
              console.log(e)});
  
      }).catch((e)=>{});
  }else if(ioValue=="outCargo"){
    thList=["품명","관리번호","PLT","EA","비고"];
     database_f.ref(ref).get().then((snapshot)=>{
          const val = snapshot.val();
          const des=val["description"].split(",");
          const manNo=val["managementNo"].split(",");
          const pQty = val["pltQty"].split(",");
          const eQty = val["eaQty"].split(",");
          // const remark = val["remark"].split(",");
          for(let i=0;i<des.length;i++){
              const tr = document.createElement("tr");
              const td1 = document.createElement("td");
              td1.innerHTML=des[i];
              const td2 = document.createElement("td");
              td2.innerHTML=manNo[i];
              const td3 = document.createElement("td");
              td3.innerHTML=pQty[i];
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
  
      }).catch((e)=>{});

  }
  thList.forEach((e)=>{
    const th = document.createElement("th");
    th.innerHTML=e;
    tr.appendChild(th);
 });
  thead.appendChild(tr);
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
      console.log(width,height);
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
      console.log(width,height,maxSize);
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
        img.style.height="95%";
        imgTag.appendChild(img);
        fileTr.appendChild(imgTag);
      })
      .then(() => {
        // const img = document.querySelector(".profile-img");
        // img.onload = () => {
        //   const widthDiff = (img.clientWidth - imgTag.offsetWidth);
        //   console.log(img.clientHeight,imgTag.offsetHeight);
        //   const heightDiff = (img.clientHeight - imgTag.offsetHeight) ;
        //   img.style.transform = `translate( -${widthDiff}px , -${heightDiff}px)`;
        // };
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
        img.className="profile-img";
        img.addEventListener("click", (e) => {
          img.parentNode.classList.toggle("file-selected");
        });
        img.style.display="block";
        img.style.width="100%";
        img.style.height="95%";
        td.appendChild(img);
        fileTr.appendChild(td);
      });
    });
  });
};
function popClose(){
    document.querySelector("#mainPop").style="display:none";
    document.querySelector("#mainIn").style="display:block";
    document.querySelector("#mainOut").style="display:block";
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
    const storageRef = storage_f.ref(refFile);
    imgUrls.forEach((imgUrl, index) => {
      fetch(imgUrl)
          .then(response => response.blob())
          .then(blob => {
              // const fileName = imgUrl.split('/').pop(); // Extract file name from URL
              const selectTr = document.querySelector(".clicked");
              const fileName = selectTr.cells[0].innerHTML+"_"+selectTr.cells[2].innerHTML+"_"+selectTr.cells[3].innerHTML+"_"+selectTr.cells[4].innerHTML+"_"+index+"_"+returnTime();
              const file = new File([blob], fileName, { type: blob.type });
              const fileRef = storageRef.child(fileName);
              fileRef.put(file).then((snapshot) => {
                  if (index === imgUrls.length - 1) {
                      console.log("업로드 완료");
                  }
              });
          })
          .catch(error => {
            console.error("Error uploading file:", error);
        });
      });
  
    let w;
    if(ioValue=="InCargo"){
      w={"working":"컨테이너진입"}
    }else{
      w={"workprocess":"완"}
    }

    database_f.ref(ref).update(w);
    toastOn(imgUrls.length+" 파일 업로드 완료");
    popUp();
}


if(mC){
  
  // document.querySelector("#titleDate").style="display:none";
  toastOn("모바일 환경에서 접속 됩니다.1");
  
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
function toastOn(msg){
  const toastMessage = document.createElement("div");
  toastMessage.id="tost_message";
  toastMessage.innerHTML = msg; 
  toastMessage.classList.add('active');
  document.body.appendChild(toastMessage);
  setTimeout(function(){
      toastMessage.classList.remove('active');
  },2000);
}
function fileRemove(){
  const fileInput = document.querySelector("#fileInput");
  const fileTr = document.querySelector("#popFileTr");
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
    // console.log(imgUrls);
    // fileInput.value = imgUrls.join(", ");
  }
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
  navigator.serviceWorker.register('/firebase-messaging-sw.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((err) => {
      console.error('Service Worker registration failed:', err);
    });
}
function requestPermission(){
  Notification.requestPermission().then((permission)=>{
    if(permission =="granted"){
      console.log("Notification Permission Granted");
      getToken();;
    }else{
      console.log("Unable to get Permission to Notify.")
    }
  });
  if(!("Notification" in window)){
    console.log("This browser does not support notifications.");
  }
}
function getToken() {
  return messaging.getToken({ vapidKey: 'BMSh5U53qMZrt9KYOmmcjST0BBjua_nUcA3bzMO2l5OUEF6CgMnsu-_2Nf1PqwWsjuq3XEVrXZfGFPEMtE8Kr_k' }) // Replace with your actual VAPID key
    .then(currentToken => {
      if (currentToken) {
        console.log('FCM token:', currentToken);
        token = currentToken;
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
        return null;
      }
    })
    .catch(err => {
      console.log('An error occurred while retrieving token. ', err);
      return null;
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
  // alert(payload.notification.body);
});

// Call requestPermission on page load
// document.addEventListener('DOMContentLoaded', () => {
//   requestPermission();
// });

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

// Example usage
document.addEventListener('DOMContentLoaded', () => {
  requestPermission();

  // Example: Send a message after getting the token
  getToken().then(token => {
    if (token) {
      sendMessage(token, 'Hello!', 'This is a test message.', '/images/icon.png');
    }
  });
});
 function reLoad(){
  console.log(mC);
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