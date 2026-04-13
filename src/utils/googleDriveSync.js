export const FOLDER_NAME = "LifePlannerOS_Data";
export const FILE_NAME = "planer_os_data.json";

// We'll use standard fetch with the Bearer token acquired from @react-oauth/google

export const findOrCreateDataFile = async (accessToken) => {
  const headers = { Authorization: `Bearer ${accessToken}` };
  
  // 1. Search for the file in the specific appDataFolder
  const q = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive`;
  
  const res = await fetch(searchUrl, { headers });
  const data = await res.json();

  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // 2. If not found, create it
  const metadata = {
    name: FILE_NAME,
    mimeType: 'application/json'
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob(['{}'], { type: 'application/json' }));

  const createRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}` },
    body: form
  });
  
  const fileData = await createRes.json();
  return fileData.id;
};

export const downloadData = async (accessToken, fileId) => {
  const headers = { Authorization: `Bearer ${accessToken}` };
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, { headers });
  return await res.json();
};

export const uploadData = async (accessToken, fileId, jsonData) => {
  const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(jsonData)
  });
  return await res.json();
};
