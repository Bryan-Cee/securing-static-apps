require('dotenv').config({ path: '.env' });

const express = require('express');
const { BlobServiceClient } = require('@azure/storage-blob');

const app = express();
const port = 3000;

// Replace these values with your storage account and private endpoint details
const accountName = process.env.STORAGE_ACCOUNT_NAME;
const accountKey = process.env.STORAGE_ACCOUNT_KEY;
const containerName = process.env.CONTAINER_NAME;
const privateEndpointIP = process.env.PRIVATE_ENDPOINT_IP;

// Create a BlobServiceClient to interact with the Blob service
const blobServiceClient = new BlobServiceClient(
  `https://${privateEndpointIP}?${accountKey}`
);

// Function to get blob content
async function getBlobContent(blobName) {
  const containerClient = blobServiceClient.getContainerClient(containerName);
  const blobClient = containerClient.getBlobClient(blobName);

  const response = await blobClient.download();
  return await streamToBuffer(response.readableStreamBody);
}

// Function to convert stream to buffer
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', (data) => {
      chunks.push(data instanceof Buffer ? data : Buffer.from(data));
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}

// Define route to fetch and display blob content
app.get('/:blobName', async (req, res) => {
  const blobName = req.params.blobName;
  console.log(blobName);

  try {
    const content = await getBlobContent(blobName);
    res.send(`<div style="border: 1px solid; font-weight: bolder;
	padding: 15px 10px 15px 1.5em;
	background-repeat: no-repeat;
	background-position: 10px center;
	max-width: 460px;
	color: #D8000C;
	background-color: #FFBABA;
	background-image: url('https://i.imgur.com/GnyDvKN.png');">Error fetching blob --> ${blobName}: </div>\n
  ${content.toString()}`);
  } catch (error) {
    res.status(500).send(
      `<div style="border: 1px solid; font-weight: bolder;
	padding: 15px 10px 15px 1.5em;
	background-repeat: no-repeat;
	background-position: 10px center;
	max-width: 460px;
	color: #D8000C;
	background-color: #FFBABA;
	background-image: url('https://i.imgur.com/GnyDvKN.png');">Error fetching blob --> ${blobName}: </div><div><pre style="background: #f4f4f4;
    border: 1px solid #ddd;
    border-left: 3px solid #f36d33;
    color: #666;
    page-break-inside: avoid;
    font-family: monospace;
    font-size: 15px;
    line-height: 1.6;
    margin-bottom: 1.6em;
    max-width: 100%;
    overflow: auto;
    padding: 1em 1.5em;
    display: block;
    word-wrap: break-word;"><code>${error.message}</code></pre></div>`
    );
  }
});

// Start the Express server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
