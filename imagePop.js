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
console.log(ref);
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
        img.style.height="85vh";
        img.style.objectFit="contain";
        // img.style.width="100px";
        // img.style.height="100px";
        td.appendChild(img);
        fileTr.appendChild(td);
  })
}).catch((error)=>{
  toastOn("Last image",error);
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
    if(!res.items || res.items.length===0){
      toastOn("No images to save");
      return;
    }

    // Build timestamp folder name: DD_MM_YYYY_HH_mm_ss
    const pad = (n)=>String(n).padStart(2,'0');
    const d = new Date();
    const folderName = `${d.getFullYear()}년${pad(d.getMonth()+1)}월${pad(d.getDate())}일${pad(d.getHours())}시${pad(d.getMinutes())}분${pad(d.getSeconds())}초`;

    // Create zip and add a folder inside it
    const zip = new JSZip();
    const folder = zip.folder(folderName);

    // Fetch all blobs and add to zip
    const fetchPromises = res.items.map((itemRef)=>{
      return itemRef.getDownloadURL().then((url)=>{
        return fetch(url).then(response => {
          if(!response.ok) throw new Error('Network response not ok for ' + itemRef.name);
          return response.blob();
        }).then(blob => {
          // Add blob to zip under the folder with original name
          folder.file(itemRef.name, blob);
        }).catch(err => {
          console.error('Error fetching', itemRef.name, err);
        });
      }).catch(err=>{
        console.error('Error getting download URL for', itemRef.name, err);
      });
    });

    Promise.all(fetchPromises).then(()=>{
      // Generate the zip (DEFLATE compression) and trigger download
      zip.generateAsync({type:'blob', compression: 'DEFLATE'}).then((content)=>{
        const zipName = `${folderName}.zip`;
        saveAs(content, zipName);
      }).catch(err=>{
        console.error('Error generating zip', err);
        toastOn('Error creating zip');
      });
    }).catch(err=>{
      console.error('Error preparing files', err);
      toastOn('Error preparing files for download');
    });

  }).catch(err=>{
    console.error('Error listing storage ref', err);
    toastOn('Error listing files1');
  });
}