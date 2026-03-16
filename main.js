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
}
else{firebase.app();}
// const doc =document.documentElement;
// function fullScreen(){
//   doc.requestFullscreen();
// }
// fullScreen();

const database_f = firebase.database();
const messaging = firebase.messaging();
const storage_f = firebase.storage();
const deptName = "WareHouseDept2";
const notificationIconUrl = new URL("images/icon.png", window.location.href).toString();
const defaultRelayEndpoint = "https://asia-southeast1-fine-bondedwarehouse.cloudfunctions.net/sendFcmRelay";
const defaultRelayApiKey = "REPLACE_WITH_RELAY_API_KEY";
function normalizeNotificationIconUrl(rawIconUrl){
  const value = String(rawIconUrl || "").trim();
  if (!value) {
    return notificationIconUrl;
  }
  if (value.startsWith("/images/")) {
    return new URL("WmsMobile" + value, window.location.origin + "/").toString();
  }
  if (value.startsWith("images/")) {
    return new URL(value, window.location.href).toString();
  }
  return value;
}
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
let refLegacyFile;
let ioValue;
let upfileList;
let token;
let userName = "";
let isUploading = false;
let modalTargetImage = null;
let filePickerPending = false;
let isScheduleMode = false;
let isScheduleProcessing = false;
let messagingSwRegistration = null;
let messagingSwRegistrationPromise = null;
const messagingSwVersion = "20260311-1";
const userNameStorageKey = "wmsUserName";
const mC = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isMobilePopupContext = ()=>{
  const coarsePointer = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
  return mC || navigator.maxTouchPoints > 0 || coarsePointer || window.innerWidth <= 900;
};
function syncUserNameFromStorage(){
  try {
    userName = (localStorage.getItem(userNameStorageKey) || "").trim();
  } catch (e) {
    userName = "";
  }
  window.userName = userName;
}
function getDeviceTokenRootRef(){
  return "DeptName/" + deptName + "/DeviceTokens";
}
function normalizeDeviceTokenKey(value){
  return String(value || "").trim().replace(/[.#$\[\]\/]/g, "_");
}
function registerDeviceToken(currentToken){
  const safeToken = String(currentToken || "").trim();
  if (!safeToken) {
    return Promise.resolve(false);
  }
  const tokenKey = normalizeDeviceTokenKey(safeToken);
  if (!tokenKey) {
    return Promise.resolve(false);
  }

  const payload = {
    token: safeToken,
    userName: userName || "",
    userAgent: navigator.userAgent || "",
    updatedAt: new Date().toISOString()
  };
  return database_f.ref(getDeviceTokenRootRef() + "/" + tokenKey).set(payload)
    .then(()=>true)
    .catch((error)=>{
      console.error("토큰 저장 실패:", error);
      return false;
    });
}
function getRelayConfig(){
  let relayEndpoint = defaultRelayEndpoint;
  let relayApiKey = defaultRelayApiKey;
  try {
    relayEndpoint = (window.FCM_RELAY_ENDPOINT || defaultRelayEndpoint || "").trim();
  } catch (error) {
    console.error("Relay endpoint 확인 실패:", error);
    relayEndpoint = (window.FCM_RELAY_ENDPOINT || "").trim();
  }
  try {
    relayApiKey = (window.FCM_RELAY_API_KEY || defaultRelayApiKey || "").trim();
  } catch (error) {
    console.error("Relay API Key 확인 실패:", error);
    relayApiKey = (window.FCM_RELAY_API_KEY || defaultRelayApiKey || "").trim();
  }
  return { relayEndpoint, relayApiKey };
}
function ensureRelayApiKeyConfigured(){
  return getRelayConfig();
}
function getRelayEndpointCandidates(){
  const candidates = [];
  try {
    candidates.push((window.FCM_RELAY_ENDPOINT || "").trim());
  } catch (error) {
    console.error("FCM_RELAY_ENDPOINT 확인 실패:", error);
  }
  try {
    candidates.push((localStorage.getItem("fcmRelayEndpoint") || "").trim());
  } catch (error) {
    console.error("fcmRelayEndpoint 로드 실패:", error);
  }
  candidates.push(defaultRelayEndpoint);
  return Array.from(new Set(candidates.filter((item)=>!!item)));
}
function saveWorkingRelayEndpoint(endpoint){
  if (!endpoint) {
    return;
  }
  try {
    localStorage.setItem("fcmRelayEndpoint", endpoint);
  } catch (error) {
    console.error("fcmRelayEndpoint 저장 실패:", error);
  }
}
async function postRelayWithFallback(messagePayload, relayApiKey){
  const endpoints = getRelayEndpointCandidates();
  if (!endpoints.length) {
    throw new Error("FCM relay endpoint not configured");
  }

  let lastError = null;
  for (let i = 0; i < endpoints.length; i++) {
    const endpoint = endpoints[i];
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": relayApiKey
        },
        body: JSON.stringify(messagePayload)
      });
      const data = await response.json().catch(()=>({}));
      if (response.ok) {
        saveWorkingRelayEndpoint(endpoint);
        data.endpoint = endpoint;
        return data;
      }

      const errorMessage = data.error || ("Relay request failed: " + response.status);
      // 인증/요청 형식 오류는 endpoint fallback을 해도 해결되지 않으므로 즉시 종료
      if (response.status === 400 || response.status === 401 || response.status === 403) {
        throw new Error(errorMessage);
      }
      lastError = new Error(errorMessage);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Relay request failed");
}
async function getRegisteredDeviceTokens(){
  const snapshot = await database_f.ref(getDeviceTokenRootRef()).get().catch((error)=>{
    throw new Error("기기 토큰 목록 조회 실패(권한/네트워크 확인): " + (error && error.message ? error.message : "unknown"));
  });
  if (!snapshot || !snapshot.exists()) {
    return token ? [token] : [];
  }

  const raw = snapshot.val() || {};
  const values = Object.values(raw);
  const list = values
    .map((item)=> item && item.token ? String(item.token).trim() : "")
    .filter((item)=> item.length > 0);

  if (token) {
    list.push(String(token).trim());
  }
  return Array.from(new Set(list));
}
function updateUserRegButtonLabel(){
  const userBtn = document.querySelector("#logData");
  if (!userBtn) {
    return;
  }
  userBtn.textContent = userName ? userName : "User";
}
function userReg(){
  const currentName = userName || "";
  const inputName = prompt("사용자 이름을 입력하세요.", currentName);
  if (inputName === null) {
    return;
  }
  const nextName = inputName.trim();
  userName = nextName;
  window.userName = userName;
  try {
    if (nextName) {
      localStorage.setItem(userNameStorageKey, nextName);
    } else {
      localStorage.removeItem(userNameStorageKey);
    }
  } catch (e) {
    console.log(e);
  }
  updateUserRegButtonLabel();
  toastOn(nextName ? "사용자명 저장 완료" : "사용자명 초기화 완료");
}
function ensureUserNameOnStartup(){
  syncUserNameFromStorage();
  while (!userName) {
    const inputName = prompt("최초 1회 사용자 이름을 입력하세요.", "");
    if (inputName === null) {
      alert("사용자 이름 입력 후 진행할 수 있습니다.");
      continue;
    }
    const nextName = inputName.trim();
    if (!nextName) {
      alert("사용자 이름을 입력해주세요.");
      continue;
    }
    userName = nextName;
    window.userName = userName;
    try {
      localStorage.setItem(userNameStorageKey, nextName);
    } catch (e) {
      console.log(e);
    }
  }
  updateUserRegButtonLabel();
}
window.userReg = userReg;
window.userName = userName;
syncUserNameFromStorage();
window.userName = userName;
updateUserRegButtonLabel();
function applyMobileTopButtonLabels(){
  const titleBtn = document.querySelector("#titleDate");
  const dateNextBtn = document.querySelector("#dateContents");
  const otherPltBtn = document.querySelector("#otherPlt");
  const otherEnFBtn = document.querySelector("#otherEnF");

  if (!titleBtn || !dateNextBtn || !otherPltBtn || !otherEnFBtn) {
    return;
  }

  if (isMobilePopupContext()) {
    titleBtn.textContent = "새로고침";
    dateNextBtn.textContent = "+1일";
    otherPltBtn.textContent = "Pallet";
    otherEnFBtn.textContent = "장비";
  }
}
function clearScheduleSelections(){
  document.querySelectorAll("#tBodyIn tr.schedule-selected, #tBodyOut tr.schedule-selected").forEach((row)=>{
    row.classList.remove("schedule-selected");
  });
  updateScheduleSelectionCounter();
}
function updateScheduleSelectionCounter(){
  const scheduleBtn = document.querySelector("#scheduleChange");
  if (!scheduleBtn) {
    return;
  }
  if (!isScheduleMode) {
    scheduleBtn.textContent = "일정변경";
    return;
  }
  const selectedCount = document.querySelectorAll("#tBodyIn tr.schedule-selected, #tBodyOut tr.schedule-selected").length;
  scheduleBtn.textContent = "선택완료(" + selectedCount + ")";
}
function toggleScheduleRowSelection(row){
  if (!row) {
    return;
  }
  row.classList.toggle("schedule-selected");
  updateScheduleSelectionCounter();
}
function setScheduleMode(enabled){
  isScheduleMode = !!enabled;
  clearScheduleSelections();
  const scheduleBtn = document.querySelector("#scheduleChange");
  if (scheduleBtn) {
    scheduleBtn.classList.toggle("active", isScheduleMode);
  }
  updateScheduleSelectionCounter();
  dateChanged();
}
function getSelectedScheduleItems(){
  const items = [];
  document.querySelectorAll("#tBodyIn tr.schedule-selected, #tBodyOut tr.schedule-selected").forEach((row)=>{
    if (!row.id) {
      return;
    }
    items.push({
      ref: row.id,
      io: row.closest("tbody") && row.closest("tbody").id === "tBodyOut" ? "outCargo" : "InCargo"
    });
  });
  return items;
}
function getTomorrowDateText(){
  const baseDate = new Date((dateSelect && dateSelect.value) ? dateSelect.value : dateT(new Date()));
  baseDate.setDate(baseDate.getDate() + 1);
  return dateT(baseDate);
}
function showScheduleModal(config){
  const modal = document.querySelector("#scheduleModal");
  const title = document.querySelector("#scheduleModalTitle");
  const body = document.querySelector("#scheduleModalBody");
  const actions = document.querySelector("#scheduleModalActions");
  if (!modal || !title || !body || !actions) {
    return Promise.resolve(null);
  }

  title.textContent = (config && config.title) || "작업";
  body.replaceChildren(document.createTextNode((config && config.bodyText) || ""));

  if (config && config.bodyNode) {
    body.replaceChildren(config.bodyNode);
  }

  actions.replaceChildren();
  const buttons = (config && config.buttons) || [];

  return new Promise((resolve)=>{
    let closed = false;
    const closeByBackdrop = (event)=>{
      if (event.target === modal) {
        cleanup(null);
      }
    };

    const cleanup = (result)=>{
      if (closed) {
        return;
      }
      closed = true;
      modal.removeEventListener("click", closeByBackdrop);
      modal.style.display = "none";
      actions.replaceChildren();
      resolve(result);
    };

    buttons.forEach((buttonConfig)=>{
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = buttonConfig.label;
      button.addEventListener("click", ()=>cleanup(buttonConfig.value));
      actions.appendChild(button);
    });

    modal.addEventListener("click", closeByBackdrop);
    modal.style.display = "block";
  });
}
async function pickTargetDateByModal(){
  const pickedMode = await showScheduleModal({
    title: "일정 변경",
    bodyText: "변경 날짜를 선택하세요.",
    buttons: [
      { label: "내일", value: "tomorrow" },
      { label: "날짜선택", value: "pick" },
      { label: "취소", value: "cancel" }
    ]
  });

  if (!pickedMode || pickedMode === "cancel") {
    return null;
  }
  if (pickedMode === "tomorrow") {
    return getTomorrowDateText();
  }

  const wrapper = document.createElement("div");
  const label = document.createElement("div");
  label.textContent = "변경할 날짜를 입력하세요.";
  label.style.marginBottom = "10px";
  const dateInput = document.createElement("input");
  dateInput.type = "date";
  dateInput.value = dateSelect.value || dateT(new Date());
  dateInput.style.width = "100%";
  wrapper.appendChild(label);
  wrapper.appendChild(dateInput);

  const dateResult = await showScheduleModal({
    title: "날짜 선택",
    bodyNode: wrapper,
    buttons: [
      { label: "확인", value: "ok" },
      { label: "취소", value: "cancel" }
    ]
  });
  if (dateResult !== "ok") {
    return null;
  }
  const trimmed = (dateInput.value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed) || isNaN(new Date(trimmed).getTime())) {
    toastOn("날짜 형식이 올바르지 않습니다.");
    return null;
  }
  return trimmed;
}
function buildMovedRef(oldRef, nextDate){
  const parts = (oldRef || "").split("/");
  const nextYear = nextDate.substring(0, 4);
  const nextMonth = nextDate.substring(5, 7);
  const nextDay = nextDate.substring(8, 10);

  if (parts.length >= 6 && parts[2] === "InCargo") {
    return parts.slice(0, 3).concat([nextYear, nextMonth, nextDay], parts.slice(6)).join("/");
  }

  if (parts.length >= 5 && parts[2] === "OutCargo") {
    return parts.slice(0, 3).concat([nextMonth + "월", nextDate], parts.slice(5)).join("/");
  }

  return "";
}
async function moveScheduleItemToDate(itemRef, nextDate){
  const oldRef = (itemRef || "").trim();
  const newRef = buildMovedRef(oldRef, nextDate);
  if (!oldRef || !newRef || oldRef === newRef) {
    return { status: "skipped", ref: oldRef };
  }

  const snapshot = await database_f.ref(oldRef).get();
  if (!snapshot.exists()) {
    return { status: "missing", ref: oldRef };
  }

  const payload = snapshot.val();
  if (payload && typeof payload === "object") {
    if (Object.prototype.hasOwnProperty.call(payload, "refValue")) {
      payload.refValue = newRef;
    }
    if (Object.prototype.hasOwnProperty.call(payload, "keyValue")) {
      payload.keyValue = newRef;
    }
  }

  await database_f.ref(newRef).set(payload);
  await database_f.ref(oldRef).remove();
  return { status: "moved", from: oldRef, to: newRef };
}
async function removeScheduleItem(itemRef){
  const targetRef = (itemRef || "").trim();
  if (!targetRef) {
    return { status: "skipped", ref: targetRef };
  }
  await database_f.ref(targetRef).remove();
  return { status: "removed", ref: targetRef };
}
async function scheduleChange(){
  if (isScheduleProcessing) {
    toastOn("일정 변경 작업 진행중입니다.");
    return;
  }

  if (!isScheduleMode) {
    setScheduleMode(true);
    toastOn("선택 모드: 빨간 항목 제외, 다중 선택 가능", 2500);
    return;
  }

  const selectedItems = getSelectedScheduleItems();
  if (selectedItems.length === 0) {
    toastOn("선택된 항목이 없습니다.");
    return;
  }

  const action = await showScheduleModal({
    title: "선택 작업",
    bodyText: selectedItems.length + "개 항목 선택됨",
    buttons: [
      { label: "항목 일정 변경", value: "move" },
      { label: "삭제", value: "delete" },
      { label: "취소", value: "cancel" }
    ]
  });
  if (!action || action === "cancel") {
    setScheduleMode(false);
    toastOn("선택 모드 종료");
    return;
  }

  try {
    isScheduleProcessing = true;

    if (action === "move") {
      const nextDate = await pickTargetDateByModal();
      if (!nextDate) {
        return;
      }
      const moveConfirm = await showScheduleModal({
        title: "일정 변경 확인",
        bodyText: selectedItems.length + "건을 " + nextDate + " 일정으로 변경합니다.",
        buttons: [
          { label: "확인", value: "ok" },
          { label: "취소", value: "cancel" }
        ]
      });
      if (moveConfirm !== "ok") {
        return;
      }

      await Promise.all(selectedItems.map((item)=>moveScheduleItemToDate(item.ref, nextDate)));
      toastOn("일정 변경 완료: " + selectedItems.length + "건", 2500);
      setScheduleMode(false);
      return;
    }

    if (action === "delete") {
      const refListText = selectedItems.map((item, index)=>(index + 1) + ". " + item.ref).join("\n");
      const removeConfirm = await showScheduleModal({
        title: "삭제 확인",
        bodyText: "아래 경로 데이터를 삭제합니다.\n\n" + refListText,
        buttons: [
          { label: "삭제", value: "ok" },
          { label: "취소", value: "cancel" }
        ]
      });
      if (removeConfirm !== "ok") {
        return;
      }
      await Promise.all(selectedItems.map((item)=>removeScheduleItem(item.ref)));
      toastOn("삭제 완료: " + selectedItems.length + "건", 2500);
      setScheduleMode(false);
      return;
    }
  } catch (error) {
    console.error("scheduleChange error:", error);
    toastOn("작업 중 오류가 발생했습니다.");
  } finally {
    isScheduleProcessing = false;
  }
}
window.scheduleChange = scheduleChange;
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
ensureUserNameOnStartup();
function isRedStyledRow(row){
  if (!row) {
    return false;
  }
  const inlineStyle = (row.getAttribute("style") || "").toLowerCase();
  return row.style.color === "red" || inlineStyle.includes("color:red");
}
function updateMainInWatermarkStatus(){
  const mainIn = document.querySelector("#mainIn");
  if (!mainIn) {
    return;
  }
  const rows = Array.from(document.querySelectorAll("#tBodyIn tr"));
  const isComplete = rows.length > 0 && rows.every((row)=>isRedStyledRow(row));
  mainIn.classList.toggle("in-complete", isComplete);
}
function updateMainOutWatermarkStatus(){
  const mainOut = document.querySelector("#mainOut");
  if (!mainOut) {
    return;
  }
  const rows = Array.from(document.querySelectorAll("#tBodyOut tr"));
  const isComplete = rows.length > 0 && rows.every((row)=>isRedStyledRow(row));
  mainOut.classList.toggle("out-complete", isComplete);
}
function renderMainInSpecSummary(summaryByConsignee){
  const mainIn = document.querySelector("#mainIn");
  const watermarkHost = document.querySelector("#tableIn");
  if (!mainIn || !watermarkHost) {
    return;
  }

  const escapeSvgText = (value)=>String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

  const keys = Object.keys(summaryByConsignee || {});
  const grand = { "40FT": 0, "20FT": 0, "LcL": 0 };
  const consigneeLines = keys.map((consignee)=>{
    const info = summaryByConsignee[consignee] || {};
    const ft40ByConsignee = Number(info["40FT"] || 0);
    const ft20ByConsignee = Number(info["20FT"] || 0);
    const lclByConsignee = Number(info["LcL"] || 0);

    grand["40FT"] += ft40ByConsignee;
    grand["20FT"] += ft20ByConsignee;
    grand["LcL"] += lclByConsignee;

    const parts = [];
    if (ft40ByConsignee > 0) {
      parts.push("40FT:" + ft40ByConsignee);
    }
    if (ft20ByConsignee > 0) {
      parts.push("20FT:" + ft20ByConsignee);
    }
    if (lclByConsignee > 0) {
      parts.push("LCL:" + lclByConsignee);
    }
    if (parts.length === 0) {
      return "";
    }
    return consignee + " " + parts.join(" ");
  }).filter((line)=>line);

  const ft40 = grand["40FT"];
  const ft20 = grand["20FT"];
  const lcl = grand["LcL"];
  const total = ft40 + ft20 + lcl;
  const totalParts = [];
  if (ft40 > 0) {
    totalParts.push("40FT:" + ft40);
  }
  if (ft20 > 0) {
    totalParts.push("20FT:" + ft20);
  }
  if (lcl > 0) {
    totalParts.push("LCL:" + lcl);
  }
  if (total > 0) {
    totalParts.push("합계:" + total);
  }
  const totalLine = totalParts.length > 0 ? "총합계 " + totalParts.join(" ") : "";
  const detailLine = consigneeLines.concat(totalLine ? [totalLine] : []).join(" | ");

  const isInComplete = mainIn.classList.contains("in-complete");
  const title = isInComplete ? "입고 완료" : "입고";
  const titleOpacity = isInComplete ? 0.32 : 0.72;
  const titleBlur = isInComplete ? 1.9 : 0.6;
  const titleEscaped = escapeSvgText(title);
  const detailEscaped = escapeSvgText(detailLine);
  const detailTextSvg = detailEscaped
    ? "<text x='50%' y='72%' text-anchor='middle' dominant-baseline='middle' font-size='34' font-family='Malgun Gothic, Segoe UI, sans-serif' font-weight='900' fill='#000000' fill-opacity='0.5' filter='url(#d)'>" + detailEscaped + "</text>"
    : "";

  const svgMarkup = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1600 420'><defs><filter id='b'><feGaussianBlur stdDeviation='" + titleBlur + "'/></filter><filter id='d'><feGaussianBlur stdDeviation='0.9'/></filter></defs><text x='50%' y='46%' text-anchor='middle' dominant-baseline='middle' font-size='195' font-family='Malgun Gothic, Segoe UI, sans-serif' font-weight='900' fill='#000000' fill-opacity='" + titleOpacity + "' filter='url(#b)'>" + titleEscaped + "</text>" + detailTextSvg + "</svg>";

  watermarkHost.style.backgroundImage = "url(\"data:image/svg+xml," + encodeURIComponent(svgMarkup) + "\")";
}
function dateChanged(){
    const d = dateSelect.value;
    titleDate.innerHTML = d;
    tBodyIn.replaceChildren();
    tBodyOut.replaceChildren();
    updateMainInWatermarkStatus();
    renderMainInSpecSummary({});
    updateMainOutWatermarkStatus();
    getData(d);
}
dateSelect.value=dateT(new Date());
titleDate.innerHTML = dateT(new Date());
// titleDate.innerHTML = "2024-09-24";

function getData(date){
    const year = date.substring(0,4);
    const month=date.substring(5,7);
    const refI ="DeptName/"+deptName+"/InCargo/"+year+"/"+month+"/"+date.substring(8,10);
    const refO ="DeptName/"+deptName+"/OutCargo/"+month+"월/"+date;
    const refOs ="DeptName/"+deptName+"/sC/"+year+"/"+month+"/"+date.substring(8,10);
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
      const summaryByConsignee = {};
        
        // leaf nodes 추출 함수
        const getLeafNodes = (obj, path = '') => {
            let leafNodes = {};
            for(let key in obj){
                if(obj[key] !== null && typeof obj[key] === 'object' && !Array.isArray(obj[key])){
                    // 객체인 경우 재귀 호출
                    Object.assign(leafNodes, getLeafNodes(obj[key], path + key + '/'));
                } else {
                    // leaf node인 경우
                    if(!leafNodes[path]){
                        leafNodes[path] = {};
                    }
                }
            }
            // 최하위 객체들을 반환
            if(Object.keys(leafNodes).length === 0 && path === ''){
                return obj;
            }
            return leafNodes;
        };
        
        // leaf nodes의 부모 객체들을 추출
        const extractLeafParents = (obj) => {
            let result = {};
            const traverse = (current, path = []) => {
                let hasNonObjectChild = false;
                for(let key in current){
                    if(current[key] !== null && typeof current[key] === 'object' && !Array.isArray(current[key])){
                        traverse(current[key], [...path, key]);
                    } else {
                        hasNonObjectChild = true;
                    }
                }
                if(hasNonObjectChild && path.length > 0){
                    result[path.join('/')] = current;
                }
            };
            traverse(obj);
            return result;
        };
        
        const leafData = extractLeafParents(val) || {};
        
        for(let i in leafData){
            const item = leafData[i];
            let spec="";
            if(item["container40"]==="1"){
                spec="40FT";
              ft4+=1;}
            else if(item["container20"]==="1"){
                spec="20FT";
              ft2+=1;}
            else if(item["lclcargo"]!="0"){
                spec="LcL";
                lcl+=1;
            }else{
             continue
            }
            const tr = document.createElement("tr");
            tr.id=item["refValue"] || refI + "/" + i;
            const td1 = document.createElement("td");
            td1.innerHTML=item["consignee"];
            const td2 = document.createElement("td");
            td2.innerHTML=item["container"];
            const td3 = document.createElement("td");
            td3.innerHTML=item["Pqty"]||item["qtyPlt"];
            const td4 = document.createElement("td");
            td4.innerHTML=spec;
            const td5 = document.createElement("td");
            td5.innerHTML=item["description"];
            tr.appendChild(td1);
            tr.appendChild(td2);
            tr.appendChild(td3);
            tr.appendChild(td4);
            tr.appendChild(td5);
            const isWorkingDone = item["working"]!="";
            if (isScheduleMode && isWorkingDone) {
              continue;
            }
            tBodyIn.appendChild(tr);
            const consignee = String(item["consignee"] || "미지정").trim() || "미지정";
            if (!summaryByConsignee[consignee]) {
              summaryByConsignee[consignee] = { "40FT": 0, "20FT": 0, "LcL": 0 };
            }
            summaryByConsignee[consignee][spec] = Number(summaryByConsignee[consignee][spec] || 0) + 1;
            tr.addEventListener("click",(e)=>{
                const row = e.currentTarget;
                if (isScheduleMode) {
                  toggleScheduleRowSelection(row);
                  return;
                }
                const trList = document.querySelectorAll("#tBodyIn tr");
                trList.forEach((e)=>{
                  if(e.classList.contains("clicked")){
                       e.classList.remove("clicked");}
                });
                row.classList.toggle("clicked");
                // document.querySelector("#mainOut").style="display:none";
                ref=row.id;
                ioValue="InCargo";
                popUp();
            });
            if(isWorkingDone){
                tr.style="color:red;";}
        }
        moveRedRowsToBottom(tBodyIn);
        updateMainInWatermarkStatus();
        renderMainInSpecSummary(summaryByConsignee);
        // toastOn("40FT:"+ft4+"   20FT:"+ft2+"    LCL:"+lcl,4000);
    }).
    catch((e)=>{
      console.log(e);
      updateMainInWatermarkStatus();
      renderMainInSpecSummary({});
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
            const isWorkDone = val[i]["workprocess"]!="미";
            if (isScheduleMode && isWorkDone) {
              continue;
            }
            tBodyOut.appendChild(tr);
            tr.addEventListener("click",(e)=>{
                const row = e.currentTarget;
                if (isScheduleMode) {
                  toggleScheduleRowSelection(row);
                  return;
                }
                const trList = document.querySelectorAll("#tBodyOut tr");
                trList.forEach((e)=>{
                  if(e.classList.contains("clicked")){
                    e.classList.remove("clicked");}
                });
                row.classList.toggle("clicked");
                // document.querySelector("#mainIn").style="display:none";
                ref=row.id;
                ioValue="outCargo";
                popUp();
            });
            if(isWorkDone){
              tr.style="color:red;";}
        }
        moveRedRowsToBottom(tBodyOut);
        updateMainOutWatermarkStatus();
    }).catch((e)=>{
      console.log(e);
      updateMainOutWatermarkStatus();
        // alert(e);
    });
    
}
getData(titleDate.innerHTML);
async function compressImageBlobToMaxBytes(blob, maxBytes){
  try{
    if (!blob || blob.size <= maxBytes) {
      return blob;
    }

    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
      image.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    let quality = 0.9;
    let scale = 1;
    let resultBlob = blob;

    const canvasToBlob = (qualityValue) => {
      return new Promise((resolve) => {
        canvas.toBlob((generatedBlob) => {
          resolve(generatedBlob);
        }, "image/jpeg", qualityValue);
      });
    };

    for (let attempt = 0; attempt < 14; attempt++) {
      const width = Math.max(1, Math.round(image.width * scale));
      const height = Math.max(1, Math.round(image.height * scale));
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const compressedBlob = await canvasToBlob(quality);
      if (compressedBlob) {
        resultBlob = compressedBlob;
      }

      if (resultBlob.size <= maxBytes) {
        URL.revokeObjectURL(objectUrl);
        return resultBlob;
      }

      if (quality > 0.45) {
        quality -= 0.1;
      } else {
        scale *= 0.85;
      }
    }

    URL.revokeObjectURL(objectUrl);
    return resultBlob;
  }catch(error){
    console.error("이미지 압축 오류:", error);
    return blob;
  }
}
function setUploadProgress(percent){
  const uploadAction = document.querySelector("#btnUploadAction");
  const uploadActionText = document.querySelector("#btnUploadActionText");
  if (!uploadAction || !uploadActionText) {
    return;
  }
  const safePercent = Math.max(0, Math.min(100, Math.round(percent)));
  uploadAction.style.backgroundImage = "linear-gradient(to right, #2f8f2f " + safePercent + "%, #1713dd " + safePercent + "%)";
  uploadActionText.textContent = "업로드 중... " + safePercent + "%";
}
function resetUploadProgress(){
  const uploadAction = document.querySelector("#btnUploadAction");
  const uploadActionText = document.querySelector("#btnUploadActionText");
  if (!uploadAction || !uploadActionText) {
    return;
  }
  uploadAction.style.backgroundImage = "none";
  uploadActionText.textContent = "사진등록";
}
function setUploadActionDisabled(disabled){
  const uploadAction = document.querySelector("#btnUploadAction");
  if (!uploadAction) {
    return;
  }
  if (disabled) {
    uploadAction.classList.add("upload-disabled");
  } else {
    uploadAction.classList.remove("upload-disabled");
  }
}
function setUploadActionMode(mode, label){
  const uploadAction = document.querySelector("#btnUploadAction");
  const uploadActionText = document.querySelector("#btnUploadActionText");
  if (!uploadAction || !uploadActionText) {
    return;
  }
  uploadAction.dataset.mode = mode || "register";
  if (mode === "register-without-photo") {
    uploadAction.classList.add("no-photo-mode");
  } else {
    uploadAction.classList.remove("no-photo-mode");
  }
  uploadActionText.textContent = label || "사진등록";
}
function removeTableColumn(table, columnIndex){
  if (!table || columnIndex < 0) {
    return;
  }
  const rows = table.querySelectorAll("tr");
  rows.forEach((row)=>{
    if (row.cells && row.cells.length > columnIndex) {
      row.deleteCell(columnIndex);
    }
  });
}
function moveRedRowsToBottom(tBody){
  if (!tBody) {
    return;
  }

  const rows = Array.from(tBody.querySelectorAll("tr"));
  if (rows.length === 0) {
    return;
  }

  const normalRows = [];
  const redRows = [];
  rows.forEach((row)=>{
    const isRedRow = isRedStyledRow(row);
    if (isRedRow) {
      redRows.push(row);
    } else {
      normalRows.push(row);
    }
  });

  normalRows.concat(redRows).forEach((row)=>{
    tBody.appendChild(row);
  });
}
function adjustPopInfoTableLayout(){
  const table = document.querySelector("#popInfoTable");
  if (!table) {
    return;
  }

  const headerRow = table.querySelector("thead tr");
  const bodyRows = Array.from(table.querySelectorAll("tbody tr"));
  if (!headerRow) {
    return;
  }

  const headerCells = Array.from(headerRow.cells || []);
  const remarkIndex = headerCells.findIndex((cell)=>cell.textContent.trim() === "비고");
  if (remarkIndex >= 0) {
    const hasRemarkValue = bodyRows.some((row)=>{
      const remarkCell = row.cells[remarkIndex];
      return remarkCell && remarkCell.textContent.trim() !== "";
    });
    if (!hasRemarkValue) {
      removeTableColumn(table, remarkIndex);
    }
  }

  const latestHeader = table.querySelector("thead tr");
  const latestBodyRows = Array.from(table.querySelectorAll("tbody tr"));
  if (!latestHeader || latestBodyRows.length === 0) {
    return;
  }

  table.style.tableLayout = "auto";
  const columnCount = latestHeader.cells.length;
  if (columnCount === 0) {
    return;
  }

  const widthWeights = Array(columnCount).fill(4);
  latestBodyRows.forEach((row)=>{
    for (let index = 0; index < columnCount; index++) {
      const cell = row.cells[index];
      if (!cell) {
        continue;
      }
      const contentLength = cell.textContent.trim().length;
      widthWeights[index] = Math.max(widthWeights[index], Math.min(30, contentLength + 2));
    }
  });

  const totalWeight = widthWeights.reduce((sum, value)=>sum + value, 0) || 1;
  for (let index = 0; index < columnCount; index++) {
    const widthPercent = (widthWeights[index] / totalWeight) * 100;
    latestHeader.cells[index].style.width = widthPercent.toFixed(2) + "%";
    latestBodyRows.forEach((row)=>{
      if (row.cells[index]) {
        row.cells[index].style.width = widthPercent.toFixed(2) + "%";
      }
    });
  }
}
function handleFilePickerClosed(){
  filePickerPending = false;
  const mainPop = document.querySelector("#mainPop");
  if (!mainPop || mainPop.style.display === "none") {
    return;
  }
  const fileInput = document.querySelector("#fileInput");
  const hasSelectedFiles = fileInput && fileInput.files && fileInput.files.length > 0;
  const hasLocalImages = fileTr && fileTr.querySelectorAll(".local-img").length > 0;
  if (!hasSelectedFiles && !hasLocalImages) {
    setUploadActionMode("register-without-photo", "사진등록없이 등록");
  }
}
function tryOpenFilePicker(isAutoOpen){
  const fileInput = document.querySelector("#fileInput");
  if (!fileInput) {
    return;
  }
  filePickerPending = true;
  const focusHandler = () => {
    window.removeEventListener("focus", focusHandler, true);
    setTimeout(() => {
      if (filePickerPending) {
        handleFilePickerClosed();
      }
    }, 250);
  };
  window.addEventListener("focus", focusHandler, true);
  fileInput.click();
  if (isAutoOpen) {
    setTimeout(() => {
      const mainPop = document.querySelector("#mainPop");
      const isOpen = mainPop && mainPop.style.display !== "none";
      const noSelection = !fileInput.files || fileInput.files.length === 0;
      if (isOpen && noSelection) {
        toastOn("자동 파일창이 차단되면 아래 사진등록 버튼을 눌러주세요.", 2500);
      }
    }, 350);
  }
}
function buildImageStorageRef(dataRef){
  if (!dataRef) {
    return "";
  }

  const parts = dataRef.split("/");
  if (parts.length < 5) {
    return dataRef.replace("DeptName", "images") + "/";
  }

  const dept = parts[1];
  const cargoType = parts[2];

  if (cargoType === "InCargo") {
    const year = parts[3] || "";
    const month = parts[4] || "";
    const day = parts[5] || "";
    const rest = parts.slice(6);
    return ["images", dept, "InCargo", year, month, day].concat(rest).join("/") + "/";
  }

  if (cargoType === "OutCargo") {
    const date = parts[4] || "";
    const dateParts = date.split("-");
    const year = dateParts[0] || "";
    const month = dateParts[1] || "";
    const day = dateParts[2] || "";
    const rest = parts.slice(5);
    return ["images", dept, "OutCargo", year, month, day].concat(rest).join("/") + "/";
  }

  return buildLegacyImageStorageRef(dataRef);
}
function buildLegacyImageStorageRef(dataRef){
  if (!dataRef) {
    return "";
  }
  let imgRef = dataRef.replace("DeptName", "images").replaceAll("/", ",");
  imgRef = imgRef.split(",");
  const io = imgRef[4];
  const dateArr = imgRef[2];
  imgRef[3] = dateArr;
  imgRef[2] = io;
  imgRef.splice(4, 1);
  return imgRef.toString().replaceAll(",", "/") + "/";
}
async function getServerImageCount(primaryRef, fallbackRef){
  const primaryResult = await storage_f.ref(primaryRef).listAll().catch(()=>({ items: [] }));
  if (primaryResult.items && primaryResult.items.length > 0) {
    return primaryResult.items.length;
  }
  if (!fallbackRef || fallbackRef === primaryRef) {
    return 0;
  }
  const fallbackResult = await storage_f.ref(fallbackRef).listAll().catch(()=>({ items: [] }));
  return (fallbackResult.items && fallbackResult.items.length) || 0;
}
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
    if (fileInput) {
      fileInput.value = "";
    }
    filePickerPending = false;
    isUploading = false;
    setUploadActionDisabled(false);
    setUploadActionMode("register", "사진등록");
    resetUploadProgress();
   
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
      h3List[i].removeAttribute("style");
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
              adjustPopInfoTableLayout();
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
              const td1 = document.createElement("td");
              td1.innerHTML=des[i];
              const td2 = document.createElement("td");
              td2.innerHTML=manNo[i];
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
          h3List[2].style.color="red";
          adjustPopInfoTableLayout();
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
    filePickerPending = false;
    fileTr.replaceChildren();
    upfileList = e.target.files;
    if (e.target.files.length > 0) {
      setUploadActionMode("register", "사진 업로드");
    } else {
      setUploadActionMode("register-without-photo", "사진등록없이 등록");
    }
    for(let i=0;i<e.target.files.length;i++){
    const config = {
      file: e.target.files[i],
      maxSize: 1500,
    };
    const originalFileName = e.target.files[i].name;
    const imgTag = document.createElement("div");
    imgTag.className = "image-card";
    resizeImage(config)
      .then((resizedImage) => {
        const url = window.URL.createObjectURL(resizedImage);
        const img = document.createElement("img");
        img.className = "local-img"
        img.dataset.fileName = originalFileName;
        if (mC) {
          bindMobileImageDeleteEvents(img);
        } else {
          img.addEventListener("click", () => {
            showModal(img);
          });
        }
        img.setAttribute("src", url);
        img.style.display = "block";
        imgTag.appendChild(img);
        fileTr.appendChild(imgTag);
      })
      .catch((err) => {
        console.log(err);
      });
    }
    // document.querySelector(".upload-name").value=document.querySelector("#fileInput").value;
  };
  fileInput.onchange = handleImgInput;
  fileTr.replaceChildren();
  const imgRef = buildImageStorageRef(ref);
  const legacyImgRef = buildLegacyImageStorageRef(ref);
  refFile=imgRef;
  refLegacyFile=legacyImgRef;
  getServerImageCount(imgRef, legacyImgRef).then((imageCount)=>{
    if (isMobilePopupContext()) {
      if (imageCount === 0) {
        setUploadActionMode("register", "사진등록");
        setTimeout(() => {
          const mainPop = document.querySelector("#mainPop");
          if (mainPop && mainPop.style.display !== "none") {
            tryOpenFilePicker(true);
          }
        }, 0);
        return;
      }
      setUploadActionMode("check", imageCount + "개 사진확인");
      return;
    }
    loadServerImages(imgRef, legacyImgRef);
  });
};
const fileTr = document.querySelector("#imgTr");
function loadServerImages(imageRef, fallbackRef){
  if (!imageRef && !fallbackRef) {
    return Promise.resolve();
  }
  fileTr.replaceChildren();
  const primaryRef = imageRef || fallbackRef;
  const tryFallback = fallbackRef && fallbackRef !== primaryRef;
  return storage_f.ref(primaryRef).listAll().then((res)=>{
    let items = res.items || [];
    if (items.length > 0 || !tryFallback) {
      return { items };
    }
    return storage_f.ref(fallbackRef).listAll().then((fallbackRes)=>{
      return { items: fallbackRes.items || [] };
    });
  }).then((result)=>{
    const downloadPromises = result.items.map((itemRef)=>{
      return itemRef.getDownloadURL().then((url)=>{
        const td = document.createElement("div");
        td.className = "image-card";
        const img = document.createElement("img");
        img.src = url;
        img.className = "server-img";
        img.dataset.fileName = itemRef.name;
        img.dataset.serverPath = itemRef.fullPath;
        bindServerImageEvents(img, itemRef.fullPath);
        img.style.display = "block";
        td.appendChild(img);
        fileTr.appendChild(td);
      });
    });
    return Promise.all(downloadPromises);
  });
}
function handleUploadAction(){
  if (isUploading) {
    toastOn("업로드 진행중입니다.");
    return;
  }
  const uploadAction = document.querySelector("#btnUploadAction");
  if (uploadAction && uploadAction.dataset.mode === "register-without-photo") {
    upLoad();
    return;
  }
  if (isMobilePopupContext() && uploadAction && uploadAction.dataset.mode === "check") {
    loadServerImages(refFile, refLegacyFile).then(()=>{
      setUploadActionMode("register", "사진추가등록");
    }).catch((error)=>{
      console.error("서버 이미지 로드 오류:", error);
      toastOn("사진 로드 실패");
    });
    return;
  }
  const fileInput = document.querySelector("#fileInput");
  const hasSelectedFiles = fileInput && fileInput.files && fileInput.files.length > 0;
  if(!hasSelectedFiles){
    tryOpenFilePicker(false);
    return;
  }
  const proceedUpload = confirm("선택한 사진을 업로드할까요?\n취소를 누르면 파일을 다시 선택합니다.");
  if(proceedUpload){
    upLoad();
  }else{
    tryOpenFilePicker(false);
  }
}
async function upLoad(){
    let imgUrls = [];
    const img = fileTr.querySelectorAll(".local-img");
    const h3List = document.querySelectorAll(".popTitleC");
    const stockList ={"client":h3List[0].innerHTML};
    stockList[h3List[1].innerHTML]={"bl":h3List[2].innerHTML};
    if(img.length==0){
      toastOn("사진 전송 없이 작업 완료 등록만 진행 합니다.");
          }else{
            isUploading = true;
            setUploadActionDisabled(true);
            for(let i=0;i<img.length;i++){
              const imgSrc = img[i].src;
              imgUrls.push(imgSrc);
            }
            const storageRef = storage_f.ref(refFile);
            try{
              const blobs = await Promise.all(
                imgUrls.map((imgUrl) => fetch(imgUrl).then(response => response.blob()))
              );
              const uploadBlobs = await Promise.all(
                blobs.map((blob) => compressImageBlobToMaxBytes(blob, 100 * 1024))
              );
              const totalBytes = uploadBlobs.reduce((sum, blob)=>sum + blob.size, 0);
              const uploadedBytesByFile = {};
              setUploadProgress(0);

              const uploadPromises = uploadBlobs.map((blob, index)=>{
                const selectTr = document.querySelector(".clicked");
                const safeUserName = (userName || "anonymous").replace(/[\\/:*?"<>|\s]+/g, "_");
                const fileName = safeUserName+"_"+selectTr.cells[0].innerHTML+"_"+selectTr.cells[2].innerHTML+"_"+selectTr.cells[3].innerHTML+"_"+selectTr.cells[4].innerHTML+"_"+index+"_"+returnTime();
                const file = new File([blob], fileName, { type: blob.type });
                const fileRef = storageRef.child(fileName.replace("/","_"));
                const uploadTask = fileRef.put(file);

                return new Promise((resolve, reject)=>{
                  uploadTask.on("state_changed", (snapshot)=>{
                    uploadedBytesByFile[index] = snapshot.bytesTransferred;
                    const uploadedTotal = Object.values(uploadedBytesByFile).reduce((sum, value)=>sum + value, 0);
                    const percent = totalBytes > 0 ? (uploadedTotal / totalBytes) * 100 : 100;
                    setUploadProgress(percent);
                  }, (error)=>{
                    reject(error);
                  }, ()=>{
                    uploadedBytesByFile[index] = file.size;
                    const uploadedTotal = Object.values(uploadedBytesByFile).reduce((sum, value)=>sum + value, 0);
                    const percent = totalBytes > 0 ? (uploadedTotal / totalBytes) * 100 : 100;
                    setUploadProgress(percent);
                    resolve();
                  });
                });
              });

              await Promise.all(uploadPromises);
              setUploadProgress(100);

              console.log("업로드 완료");
              loadServerImages(refFile, refLegacyFile);
              toastOn(imgUrls.length+" 파일 업로드 완료");
            }catch(error){
              alert("Error uploading file:", error);
              console.error("Error uploading file:", error);
            }finally{
              isUploading = false;
              setUploadActionDisabled(false);
            }
          }
    let w;
    if(ioValue=="InCargo"){
      w={"working":"컨테이너진입","regTime":returnTime(),"userName":userName||""};
    }else{
      w={"workprocess":"완","regTime":returnTime(),"userName":userName||""};
    }
    database_f.ref(ref).update(w);
    const fileInput = document.querySelector("#fileInput");
    if (fileInput) {
      fileInput.value = "";
    }
    resetUploadProgress();
 
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
  const refOs ="DeptName/"+deptName+"/sC/"+year+"/"+month+"/"+date;
  const osM= document.querySelector("#osMo").value;
  const osWf = document.querySelector("#osWf").value;
  const osWo = document.querySelector("#osWo").value;
  const osR = document.querySelector("#osRe").value;
  const osObject={"osM":osM,"osWf":osWf,"osWo":osWo,"osR":osR};
  database_f.ref(refOs).update(osObject).then((e)=>{
    toastOn(osObject);
  }).catch((e)=>{});
}
function staffCheck(){
  const selectedDate = (document.querySelector("#dateSelect").value || dateT(new Date())).trim();
  const dateObj = new Date(selectedDate);
  if (isNaN(dateObj.getTime())) {
    toastOn("날짜 형식이 올바르지 않습니다.");
    return;
  }

  const year = String(dateObj.getFullYear());
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");

  const osM = document.querySelector("#osMo").value;
  const osWf = document.querySelector("#osWf").value;
  const osWo = document.querySelector("#osWo").value;
  const osR = document.querySelector("#osRe").value;

  const refOs = "/DeptName/" + deptName + "/sC/" + year + "/" + month + "/" + day;
  const sC = {"osM":osM, "osWf":osWf, "osWo":osWo, "osR":osR};

  database_f.ref(refOs).update(sC).then(()=>{
    toastOn("인력 정보 등록 완료");
  }).catch((error)=>{
    console.log(error);
    toastOn("인력 정보 등록 실패");
  });
}
window.staffCheck = staffCheck;
if ('serviceWorker' in navigator) {
  function ensureMessagingServiceWorker() {
    if (messagingSwRegistration) {
      return Promise.resolve(messagingSwRegistration);
    }
    if (messagingSwRegistrationPromise) {
      return messagingSwRegistrationPromise;
    }

    const swScriptUrl = new URL("firebase-messaging-sw.js?v=" + messagingSwVersion, window.location.href).toString();
    messagingSwRegistrationPromise = navigator.serviceWorker.register(swScriptUrl, { scope: "./" })
      .then((registration)=>{
        messagingSwRegistration = registration;
        console.log('Service Worker 등록 완료:', registration.scope);
        return registration;
      })
      .catch((error)=>{
        console.error('Service Worker 등록 실패:', error);
        return null;
      })
      .finally(()=>{
        messagingSwRegistrationPromise = null;
      });

    return messagingSwRegistrationPromise;
  }

  ensureMessagingServiceWorker();

  function requestPermission(){
    Notification.requestPermission().then((permission)=> {
      if(permission == "granted"){
        console.log("Notification Permission Granted");
        getToken();
      } else {
        console.log("Unable to get Permission to Notify.");
      }
    });
    if(!("Notification" in window)){
      console.log("This browser does not support notifications.");
    }
  }
  
  function getToken() {
    // GitHub Pages 하위 경로에서는 등록된 service worker를 명시해야 기본 경로 404를 피할 수 있습니다.
    return ensureMessagingServiceWorker().then((registration)=> {
      if (!registration) {
        throw new Error("Messaging Service Worker registration not available");
      }

      // compat SDK에서는 useServiceWorker 바인딩이 필요한 환경이 있어 명시적으로 연결합니다.
      if (typeof messaging.useServiceWorker === "function") {
        messaging.useServiceWorker(registration);
      }

      return messaging.getToken({
        vapidKey: 'BMSh5U53qMZrt9KYOmmcjST0BBjua_nUcA3bzMO2l5OUEF6CgMnsu-_2Nf1PqwWsjuq3XEVrXZfGFPEMtE8Kr_k',
        serviceWorkerRegistration: registration
      });
    })
      .then(currentToken => {
        if (currentToken) {
          token = currentToken;
          registerDeviceToken(currentToken).then((saved)=>{
            if (!saved) {
              toastOn("토큰 저장 실패: DB rules/네트워크 확인", 2600);
            }
          });
          console.log('FCM Token received:', currentToken);
          return currentToken;
        } else {
          console.log('No registration token available. Request permission to generate one.');
          return null;
        }
      })
      .catch(err => {
        console.error('FCM 토큰 획득 오류:', err);
        return null;
      });
  }
  
  document.addEventListener('DOMContentLoaded', () => {
    requestPermission();
  });
}

messaging.onMessage((payload) => {
  console.log('Message received. ', payload);
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
      body: payload.notification.body,
      icon: normalizeNotificationIconUrl(payload.notification.icon)
  };
  console.log(notificationTitle,notificationOptions);
  new Notification(notificationTitle, notificationOptions);
  alert(payload.notification.body);
});

// Call requestPermission on page load

function sendMessage(token, title, body, icon) {
  // Browser -> FCM direct calls are blocked by CORS and exposing serverKey is unsafe.
  // Use a relay endpoint (Cloud Function / backend API) instead.
  const { relayEndpoint, relayApiKey } = ensureRelayApiKeyConfigured();

  if (!relayEndpoint) {
    console.warn("FCM relay endpoint is not configured.");
    return Promise.reject(new Error("FCM relay endpoint not configured"));
  }
  if (!relayApiKey) {
    console.warn("FCM relay API key is not configured.");
    return Promise.reject(new Error("FCM relay API key not configured"));
  }

  const messagePayload = {
    to: token,
    notification: {
      title: title,
      body: body,
      icon: normalizeNotificationIconUrl(icon)
    }
  };

  return postRelayWithFallback(messagePayload, relayApiKey)
  .then(data => {
    console.log('Message sent successfully:', data);
  })
  .catch(error => {
    console.error('Error sending message:', error);
  });
}
async function sendMessageToAllDevices(title, body, icon){
  const { relayEndpoint, relayApiKey } = ensureRelayApiKeyConfigured();
  if (!relayEndpoint) {
    throw new Error("FCM relay endpoint not configured");
  }
  if (!relayApiKey) {
    throw new Error("FCM relay API key not configured");
  }

  const tokens = await getRegisteredDeviceTokens();
  console.log("등록된 FCM 토큰 수:", tokens.length);
  if (!tokens.length) {
    throw new Error("No registered device tokens");
  }

  const messagePayload = {
    tokens,
    notification: {
      title: title,
      body: body,
      icon: normalizeNotificationIconUrl(icon)
    }
  };

  const data = await postRelayWithFallback(messagePayload, relayApiKey);
  console.log("Broadcast sent:", data);
  return data;
}
window.fcmDebugStatus = async function fcmDebugStatus(){
  const config = ensureRelayApiKeyConfigured();
  const status = {
    hasCurrentToken: !!token,
    currentTokenPreview: token ? token.substring(0, 20) + "..." : "",
    relayConfigured: !!(config.relayEndpoint && config.relayApiKey),
    relayCandidates: getRelayEndpointCandidates().length,
    tokenCount: 0,
    error: ""
  };
  if (!status.relayConfigured) {
    status.error = "Relay endpoint/apiKey 미설정 (프롬프트에서 API Key 입력 필요)";
  }
  try {
    const list = await getRegisteredDeviceTokens();
    status.tokenCount = list.length;
  } catch (error) {
    status.error = error && error.message ? error.message : String(error);
  }
  console.log("FCM DEBUG:", status);
  return status;
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
function bindMobileImageDeleteEvents(imgTag, serverPath){
  if (!imgTag) {
    return;
  }
  let pressTimer = null;

  const removeCard = () => {
    const card = imgTag.closest(".image-card");
    if (card) {
      card.remove();
    }
  };

  const startPress = () => {
    if (isUploading) {
      return;
    }
    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      const confirmMessage = serverPath
        ? "삭제 대상 서버 경로:\n" + serverPath + "\n\n해당 파일을 삭제하시겠습니까?"
        : "선택한 이미지를 삭제하시겠습니까?";
      const confirmDelete = confirm(confirmMessage);
      if (!confirmDelete) {
        return;
      }

      if (serverPath) {
        storage_f.ref(serverPath).delete().then(() => {
          removeCard();
          toastOn("서버 이미지 삭제 완료");
        }).catch((error) => {
          console.error("서버 이미지 삭제 오류:", error);
          toastOn("서버 이미지 삭제 실패");
        });
        return;
      }

      removeCard();
      toastOn("이미지 삭제 완료");
    }, 800);
  };

  const clearPress = () => {
    clearTimeout(pressTimer);
  };

  imgTag.addEventListener("mousedown", startPress);
  imgTag.addEventListener("touchstart", startPress, { passive: true });
  imgTag.addEventListener("mouseup", clearPress);
  imgTag.addEventListener("mouseleave", clearPress);
  imgTag.addEventListener("touchend", clearPress);
  imgTag.addEventListener("touchcancel", clearPress);
  imgTag.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  imgTag.addEventListener("contextmenu", (e) => {
    e.preventDefault();
  });
}
function bindServerImageEvents(imgTag, serverPath){
  if (!imgTag) {
    return;
  }
  if (!mC) {
    imgTag.addEventListener("click", () => {
      showModal(imgTag);
    });
    return;
  }
  bindMobileImageDeleteEvents(imgTag, serverPath);
}
function downloadImageFromImgTag(imgTag){
  if (!imgTag || !imgTag.src) {
    return;
  }
  const src = imgTag.src;
  const fallbackName = "image_" + returnTime().replaceAll(":", "-") + ".jpg";
  const fileName = imgTag.dataset.fileName || fallbackName;
  fetch(src)
    .then(response => response.blob())
    .then(blob => {
      saveAs(blob, fileName);
    })
    .catch((error)=>{
      console.error("이미지 다운로드 오류:", error);
      toastOn("이미지 다운로드 실패");
    });
}
function closeMainPop(){
  const mainTitle = document.querySelector("#mainTitle");
  const mainContent = document.querySelector("#mainContent");
  const mainPop = document.querySelector("#mainPop");
  const fileInput = document.querySelector("#fileInput");
  const fileTr = document.querySelector("#imgTr");

  mainTitle.style = "display:grid";
  mainContent.style = "display:grid";
  mainPop.style = "display:none";

  document.querySelectorAll(".clicked").forEach((row)=>{
    row.classList.remove("clicked");
  });

  if (fileInput) {
    fileInput.value = "";
  }
  if (fileTr) {
    fileTr.replaceChildren();
  }
  isUploading = false;
  setUploadActionDisabled(false);
  resetUploadProgress();
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
  if(e.id==otherPlt){
    location.href=e.id+".html";
  }else{
    window.location.href="https://koacaiia.github.io/CargoStatus/stockList.html"
  }
  
}
async function test(){
  try {
    const title = "WMS Test";
    const body = "test 메시지 발송";
    const { relayEndpoint, relayApiKey } = ensureRelayApiKeyConfigured();
    if (!relayEndpoint || !relayApiKey) {
      // Relay 미설정 환경에서는 로컬 알림으로 테스트 가능하게 처리
      if (Notification.permission === "granted") {
        new Notification(title, { body, icon: notificationIconUrl });
      }
      toastOn("릴레이(endpoint/apiKey) 미설정: 로컬 알림으로 테스트했습니다.", 2500);
      return;
    }

    if (!token) {
      toastOn("현재 기기 토큰이 아직 없어도, 등록된 다른 기기들로 전송 시도합니다.", 2200);
    }
    const result = await sendMessageToAllDevices(title, body, notificationIconUrl);
    const successCount = Number(result && result.successCount ? result.successCount : 0);
    const failureCount = Number(result && result.failureCount ? result.failureCount : 0);
    const requested = Number(result && result.requested ? result.requested : (successCount + failureCount));
    if (requested < 2) {
      toastOn("대상 토큰이 " + requested + "개입니다. 다른 기기에서 앱 1회 접속/권한허용 필요", 3200);
    } else {
      toastOn("전체 전송 완료: 성공 " + successCount + " / 실패 " + failureCount, 2600);
    }
  } catch (error) {
    console.error("test FCM send error:", error);
    toastOn("test 발송 실패: " + (error && error.message ? error.message : "unknown"), 3200);
  }
}
window.test = test;
function showModal(imgTag){
    if (!imgTag) {
      return;
    }
    modalTargetImage = imgTag;
    const modal = document.getElementById("imgModal");
    const modalImg = document.getElementById("modalImg");
    modalImg.src = imgTag.src;
    modal.style.display = "block";
    modalImg.style ="object-fit:scale-down;width:100%;height:90%";
}
function fileRemove() {
  const targetImg = modalTargetImage;
  if (!targetImg) {
    closeModal();
    return;
  }
  const confirmRemove = confirm("파일을 삭제하시겠습니까?");
  if (!confirmRemove) {
    return;
  }

  const removeCard = () => {
    const card = targetImg.closest(".image-card");
    if (card) {
      card.remove();
    }
  };

  if (targetImg.classList.contains("server-img")) {
    const serverPath = targetImg.dataset.serverPath;
    const deletePromise = serverPath
      ? storage_f.ref(serverPath).delete()
      : firebase.storage().refFromURL(targetImg.src).delete();
    deletePromise.then(() => {
      removeCard();
      toastOn("이미지 삭제 완료");
      closeModal();
    }).catch((error) => {
      console.error("이미지 삭제 오류:", error);
      toastOn("이미지 삭제 실패");
    });
    return;
  }

  removeCard();
  toastOn("이미지 삭제 완료");
  closeModal();
}
function closeModal() {
  const modal = document.getElementById("imgModal");
  modalTargetImage = null;
  modal.style.display = "none";
}
function attachFcmDebugPanel(){
  if (document.querySelector("#fcmDebugPanel")) {
    return;
  }

  const panel = document.createElement("div");
  panel.id = "fcmDebugPanel";
  panel.style.position = "fixed";
  panel.style.right = "12px";
  panel.style.bottom = "12px";
  panel.style.zIndex = "9999";
  panel.style.display = "grid";
  panel.style.gap = "6px";

  const openBtn = document.createElement("button");
  openBtn.type = "button";
  openBtn.textContent = "FCM상태";
  openBtn.style.background = "#154077";
  openBtn.style.color = "#fff";
  openBtn.style.border = "0";
  openBtn.style.borderRadius = "10px";
  openBtn.style.padding = "8px 10px";
  openBtn.style.fontSize = "12px";
  openBtn.style.cursor = "pointer";

  const card = document.createElement("div");
  card.style.display = "none";
  card.style.width = "min(92vw, 320px)";
  card.style.maxHeight = "55vh";
  card.style.overflow = "auto";
  card.style.background = "#ffffff";
  card.style.border = "1px solid #d0d7de";
  card.style.borderRadius = "10px";
  card.style.boxShadow = "0 8px 24px rgba(0,0,0,0.16)";
  card.style.padding = "10px";

  const title = document.createElement("div");
  title.textContent = "FCM Debug";
  title.style.fontWeight = "700";
  title.style.marginBottom = "8px";

  const statusPre = document.createElement("pre");
  statusPre.style.whiteSpace = "pre-wrap";
  statusPre.style.wordBreak = "break-word";
  statusPre.style.margin = "0";
  statusPre.style.fontSize = "12px";
  statusPre.style.lineHeight = "1.35";
  statusPre.textContent = "로딩중...";

  const actions = document.createElement("div");
  actions.style.display = "grid";
  actions.style.gridTemplateColumns = "1fr 1fr";
  actions.style.gap = "6px";
  actions.style.marginTop = "8px";

  const refreshBtn = document.createElement("button");
  refreshBtn.type = "button";
  refreshBtn.textContent = "새로고침";
  refreshBtn.style.padding = "6px";
  refreshBtn.style.borderRadius = "8px";
  refreshBtn.style.border = "1px solid #bfc7d1";
  refreshBtn.style.background = "#f3f6fa";
  refreshBtn.style.cursor = "pointer";

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.textContent = "닫기";
  closeBtn.style.padding = "6px";
  closeBtn.style.borderRadius = "8px";
  closeBtn.style.border = "1px solid #bfc7d1";
  closeBtn.style.background = "#f3f6fa";
  closeBtn.style.cursor = "pointer";

  const refreshStatus = async ()=>{
    statusPre.textContent = "조회중...";
    try {
      const status = await window.fcmDebugStatus();
      statusPre.textContent = JSON.stringify(status, null, 2);
    } catch (error) {
      statusPre.textContent = "조회 실패: " + (error && error.message ? error.message : String(error));
    }
  };

  openBtn.addEventListener("click", ()=>{
    card.style.display = card.style.display === "none" ? "block" : "none";
    if (card.style.display === "block") {
      refreshStatus();
    }
  });
  refreshBtn.addEventListener("click", refreshStatus);
  closeBtn.addEventListener("click", ()=>{
    card.style.display = "none";
  });

  actions.appendChild(refreshBtn);
  actions.appendChild(closeBtn);
  card.appendChild(title);
  card.appendChild(statusPre);
  card.appendChild(actions);
  panel.appendChild(openBtn);
  panel.appendChild(card);
  document.body.appendChild(panel);
}
document.addEventListener("DOMContentLoaded", () => {
  applyMobileTopButtonLabels();
  const otherPltBtn = document.querySelector("#otherPlt");
  if (otherPltBtn) {
    otherPltBtn.addEventListener("click", test);
  }
  const modal = document.getElementById("imgModal");
  if (!modal) {
    return;
  }
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });

  if (isMobilePopupContext()) {
    setTimeout(()=>{
      window.scrollTo(0, 1);
    }, 250);
  }

  attachFcmDebugPanel();
});
function deleteImage() {
  const modalImg = document.getElementById("modalImg");
  const imgTag = modalImg.dataset.imgTag;
  console.log(imgTag);
  imgTag.remove();
  closeModal();
}
function saveImg() {
  if (!modalTargetImage) {
    closeModal();
    return;
  }
  downloadImageFromImgTag(modalTargetImage);
  closeModal();
  
}
//test