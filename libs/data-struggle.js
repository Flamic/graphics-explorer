const dbName = "graphics-explorer";
const dbVersion = 1;
const fileStoreName = "files";
const redirectedFileKey = "redirected-file";

function parseJsonOrRedirect(fileData) {
  const loc = location.href.split(/[\/\\]+/);

  try {
    const data = JSON.parse(fileData);
    
    switch (data.type) {
      case "fractal":
      case "color-scheme":
      case "transformations":
        break;
      default:
        return null;
    }

    if (!loc || loc.length < 2 || loc[loc.length - 2] == data.type) return data;

    loc[loc.length - 2] = data.type;
    setRedirectedFile(fileData);
    //sessionStorage.setItem("content", fileData);
    location.href = loc.join("/");
  } catch (e) {
    console.error("Parsing error", e, "JSON: " + fileData);
    alert("Incorrect file data!");
    /*if (e instanceof QuotaExceededError) {
      alert(
        "File is too large. Unfortunately you cannot upload large files from a page of another type. " +
          "Click 'GO' button and you will be redirected to related type page. Then try to upload file again. Good luck ^w^"
      );
      location.href = loc.join("/");
    } else {
      console.log("Parsing error: " + e);
      alert("Incorrect file data!");
    }*/
  }
  return null;
}

async function uploadFromStorage(uploadCallback) {
  //const content = sessionStorage.getItem("content");
  const content = await getRedirectedFile();
  console.log(content);
  if (content) {
    uploadCallback(content);
    //sessionStorage.removeItem("content");
  }
  /*switch(content.type) {
    case 'fractal':
    case 'color-scheme':
    case 'transformations':
      uploadCallback(content);
      sessionStorage.removeItem('content');
  }*/
}

function setRedirectedFile(data) {
  const openRequest = indexedDB.open(dbName, dbVersion);

  openRequest.onupgradeneeded = () => upgradeDatabase(openRequest.result);

  openRequest.onerror = () => {
    throw new Error(openRequest.error);
  };

  openRequest.onsuccess = () => {
    const db = openRequest.result;
    const transaction = db.transaction(fileStoreName, "readwrite");
    const request = transaction.objectStore(fileStoreName).put(data, 1);

    request.onsuccess = () => {
      console.log("Redirected file added to store", request.result);
    };

    request.onerror = function() {
      throw new Error(request.error);
    };
  };
}

function getRedirectedFile() {
  const openRequest = indexedDB.open(dbName, dbVersion);

  openRequest.onupgradeneeded = () => upgradeDatabase(openRequest.result);

  return new Promise((resolve, reject) => {
    openRequest.onerror = () =>
      reject(openRequest.error);

    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction(fileStoreName, "readwrite");
      const store = transaction.objectStore(fileStoreName);
      const request = store.get(1);

      request.onsuccess = () =>
        resolve(request.result);
      
      request.onerror = () =>
        reject(request.error);

      //store.delete(1);
    }
  });
}

function upgradeDatabase(db) {
  console.log(db.version);
  switch (db.version) {
    case 0:
    case 1:
      db.createObjectStore(fileStoreName);
      console.log('File store was created!');
  }
}
