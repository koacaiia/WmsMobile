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
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  }
  
  // Example usage
const ref = getQueryParam('ref');
let count=0;

// document.querySelector('#imageTitle').innerHTML = ref;
const fileTr = document.querySelector("#imgTr");
loadImage(count);
function loadImage(c){
  
  count=c;
  storage_f.ref(ref).listAll().then((res)=>{
    res.items[count].getDownloadURL().then((url)=>{
       fileTr.replaceChildren();
        const td = document.createElement("td");
        const img = document.createElement("img");
        img.src=url;
        img.className="profile-img";
        img.addEventListener("click", (e) => {
          img.parentNode.classList.toggle("file-selected");
        });
        img.style.display="block";
        // img.style.width="100px";
        // img.style.height="100px";
        td.appendChild(img);
        fileTr.appendChild(td);
  })
}).catch((error)=>{
  toastOn("Last image");
});;
}

function btn(e){
  let c;
  if(e.id=="preImg"){
    if(count>0){
      c=count-1
    }else{
      toastOn("No more images");
      return;
    }}else if(e.id=="nextImg"){
      c=count+1;
    }else if(e.id=="saveImg"){
      saveImg();
      return;
    }else if(e.id=="homeBtn"){
      window.location.href = "index.html";
      return;
    }
  loadImage(c);
}
function toastOn(msg){
  console.log(msg);
  const toastMessage = document.createElement("div");
  toastMessage.id="tost_message_img";
  toastMessage.innerHTML = msg; 
  toastMessage.classList.add('active');
  document.body.appendChild(toastMessage);
  setTimeout(function(){
      toastMessage.classList.remove('active');
  },2000);
}
function saveImg(){
  storage_f.ref(ref).listAll().then((res)=>{
    res.items.forEach((itemRef)=>{
      itemRef.getDownloadURL().then((url)=>{

        fetch(url)
        .then(response => response.blob())
        .then(blob => {
          console.log(blob);
          const fileName = itemRef.name; // Use the item reference name as the file name
          saveAs(blob, fileName); // Use FileSaver.js to save the file
        })
        .catch(error => {
          toastOn("Error fetching the file");
          console.error('Error fetching the file:', error);
        });
      });
    });
  });
}