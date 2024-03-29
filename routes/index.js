// routes/blobRoutes.js
const express = require('express');
const router = express.Router();
const { BlobServiceClient } = require('@azure/storage-blob');

const containerName = process.env.CONTAINER_NAME;
const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerClient =
  BlobServiceClient.fromConnectionString(connectionString).getContainerClient(
    containerName
  );

async function getBlobContent(blobName) {
  const blobClient = containerClient.getBlobClient(
    decodeURIComponent(blobName)
  );

  const response = await blobClient.download();
  const contentType = response.contentType;
  return {
    content: await streamToBuffer(response.readableStreamBody),
    contentType,
  };
}

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

router.get('/:path(*)', async (req, res) => {
  const blobPath = req.params.path || '';

  try {
    const { content, contentType } = await getBlobContent(blobPath);
    res.type(contentType).send(content);
  } catch (error) {
    res.status(404).send(
      `<div style="border: 1px solid; font-weight: bolder;
	padding: 15px 10px 15px 1.5em;
	background-repeat: no-repeat;
	background-position: 10px center;
	max-width: 460px;
	color: #D8000C;">Error fetching blob: ${blobPath}</div><div><pre style="background: #f4f4f4;
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

module.exports = router;
