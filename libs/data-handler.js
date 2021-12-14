const dbName = "graphics-explorer";
const dbVersion = 1;
const fileStoreName = "files";
const redirectedFileKey = "redirected-file";

async function parseJsonOrRedirect(fileData) {
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
    await setRedirectedFile(fileData);
    //await new Promise((r) => setTimeout(r, 3000));
    //console.log(await getRedirectedFile(fileData));
    //await setRedirectedFile(fileData);
    //debugger;
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
  try {
    const content = await getRedirectedFile();
    if (content) {
      uploadCallback(content);
    }
  } catch (e) {
    console.error(e);
  }
}

function setRedirectedFile(data) {
  const openRequest = indexedDB.open(dbName, dbVersion);

  openRequest.onupgradeneeded = () => upgradeDatabase(openRequest.result);

  openRequest.onerror = () => {
    throw new Error(openRequest.error);
  };

  return new Promise((resolve, reject) => {
    openRequest.onsuccess = () => {
      const db = openRequest.result;
      const transaction = db.transaction(fileStoreName, "readwrite");
      const request = transaction.objectStore(fileStoreName).put(data, 1);
      let res;

      request.onsuccess = () => {
        res = request.result;
        console.log("Redirected file added to store with key " + res);
      };

      transaction.oncomplete = () => {
        db.close();
        if (res) resolve(res);
        else reject(request.error);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    };
  });
}

// openRequest = indexedDB.open(dbName, dbVersion);
// openRequest.onsuccess = () => {
//   const db = openRequest.result;
//   const transaction = db.transaction(fileStoreName, "readonly");
//   let request = transaction.objectStore(fileStoreName).get(1);

//   request.onsuccess = () => {
//     console.log(request.result);
//   }

//   openRequest.onerror = () => console.log(openRequest.error);
// };

function getRedirectedFile() {
  const openRequest = indexedDB.open(dbName, dbVersion);

  openRequest.onupgradeneeded = () => upgradeDatabase(openRequest.result);

  return new Promise((resolve, reject) => {
    openRequest.onerror = () => reject(openRequest.error);

    openRequest.onsuccess = () => {
      let res;
      let completed = false;
      const db = openRequest.result;
      const transaction = db.transaction(fileStoreName, "readonly");
      let request = transaction.objectStore(fileStoreName).get(1);

      request.onsuccess = () => {
        completed = true;
        res = request.result;
        db.transaction(fileStoreName, "readwrite")
          .objectStore(fileStoreName)
          .delete(1);
      };

      transaction.oncomplete = () => {
        db.close();
        if (completed) resolve(res);
        else reject(request.error);
      };

      transaction.onerror = () => {
        reject(transaction.error);
      };
    };
  });
}

function upgradeDatabase(db) {
  console.log(db.version);
  switch (db.version) {
    case 0:
    case 1:
      db.createObjectStore(fileStoreName);
      console.log("File store was created!");
  }
}
