const fs = require('fs');
const path = require('path');

async function testUpload() {
  const FormData = require('formdata-node').FormData;
  const { File } = require('fetch-blob/file');
  const fetch = require('node-fetch');

  const formData = new FormData();
  formData.append('title', 'Test PDF');
  formData.append('description', 'Test Description');
  formData.append('price', '1000');
  formData.append('isActive', 'true');
  
  // Create a dummy PDF
  const pdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n');
  const pdfFile = new File([pdfBuffer], 'test.pdf', { type: 'application/pdf' });
  formData.append('pdfFile', pdfFile);

  try {
    const res = await fetch('http://localhost:3000/api/admin/marketplace', {
      method: 'POST',
      body: formData,
      headers: {
        'Cookie': 'next-auth.session-token=mocked-for-now' // This won't work easily if auth is strictly checked
      }
    });
    
    console.log(res.status);
    console.log(await res.text());
  } catch (err) {
    console.error(err);
  }
}

testUpload();
