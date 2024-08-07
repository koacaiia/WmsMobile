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
    const month=date.substring(5,7);
    const refI ="DeptName/"+deptName+"/InCargo/"+month+"월/"+date;
    const refO ="DeptName/"+deptName+"/OutCargo/"+month+"월/"+date;
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
    pop.style="display:block";
    const mainDiv = document.querySelector("#mainPopDiv");
    mainDiv.replaceChildren();
    const fileDiv = document.createElement("div");
    const fileInput = document.createElement("input");
    fileInput.type="file";
    fileInput.id="fileInput";
    fileInput.multiple="multiple";
    const table= document.createElement("table");
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    let thList;
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
                  table.appendChild(tr);
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
              table.appendChild(tr);
          }
  
      }).catch((e)=>{});

  }
  thList.forEach((e)=>{
    const th = document.createElement("th");
    th.innerHTML=e;
    tr.appendChild(th);
 });
  thead.appendChild(tr);
  table.appendChild(thead);
  mainDiv.appendChild(table);
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
    const fileTr = document.querySelector("#popFileTr");
    fileTr.replaceChildren();
    upfileList = e.target.files;
    for(let i=0;i<e.target.files.length;i++){
    const config = {
      file: e.target.files[i],
      maxSize: 150,
    };
    const imgTag = document.createElement("td");
    resizeImage(config)
      .then((resizedImage) => {
        const url = window.URL.createObjectURL(resizedImage);
        const img = document.createElement("img");
        img.setAttribute("src", url);
        img.className = "profile-img";
        img.style.display = "block";
        imgTag.appendChild(img);
        fileTr.appendChild(imgTag);
      })
      .then(() => {
        const img = document.querySelector(".profile-img");
        img.onload = () => {
          const widthDiff = (img.clientWidth - imgTag.offsetWidth) / 2;
          const heightDiff = (img.clientHeight - imgTag.offsetHeight) / 2;
          img.style.transform = `translate( -${widthDiff}px , -${heightDiff}px)`;
        };
      })
      .catch((err) => {
        console.log(err);
      });
    }
  };
  fileInput.addEventListener("change",handleImgInput);
  const fileTable = document.createElement("table");
  const fileTr = document.createElement("tr");
  fileTr.id="popFileTr";
  fileTable.appendChild(fileTr);
  fileDiv.appendChild(fileInput);
  fileDiv.appendChild(fileTable);
  fileDiv.style="display:grid;grid-template-rows:1fr 8fr";
  mainDiv.appendChild(fileDiv);
  mainDiv.style="display:grid;grid-template-rows:40fr 60fr";
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
        img.style.display="block";
        img.style.width="100px";
        img.style.height="100px";
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
    const fileTr = document.querySelector("#popFileTr");
    fileTr.replaceChildren();
    const file = fileInput.files;
    const storageRef = storage_f.ref(refFile);
    for(let i=0;i<file.length;i++){
        const fileRef = storageRef.child(file[i].name);
        fileRef.put(file[i]).then((snapshot)=>{
            if( i==file.length-1){
                console.log("업로드 완료");
                
            }
        });
    }
    let w;
    if(ioValue=="InCargo"){
      w={"working":"컨테이너진입"}
    }else{
      w={"workprocess":"완"}
    }

    database_f.ref(ref).update(w);
    toastOn(file.length+" 파일 업로드 완료");
    popUp();
    // storage_f.ref(refFile).listAll().then((res)=>{
    //   res.items.forEach((refFile)=>{
    //     refFile.getDownloadURL().then((url)=>{
    //       const td = document.createElement("td");
    //       const img = document.createElement("img");
    //       img.src=url;
    //       img.className="profile-img";
    //       img.style.display="block";
    //       img.style.width="100px";
    //       img.style.height="100px";
    //       td.appendChild(img);
    //       fileTr.appendChild(td);
    //     });
    //   });
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
  },1500);
}