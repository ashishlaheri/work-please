const express = require('express');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const port = process.env.PORT || 3000;

// Connect to Azure Storage
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'uploads';
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient(containerName);

app.use(express.static('public'));
app.use(express.json());

// Upload endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
  const blobName = req.file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.uploadFile(req.file.path);

  res.send('File uploaded successfully to Azure Storage!');
});

// List files
app.get('/files', async (req, res) => {
  let fileList = [];
  for await (const blob of containerClient.listBlobsFlat()) {
    fileList.push(blob.name);
  }
  res.json(fileList);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
