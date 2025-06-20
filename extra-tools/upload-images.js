const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
  cloud_name: "dfvn15vyq",
  api_key: "614946512696654",
  api_secret: "PYN8eleTB2vp4jYQ9Zlq-XcbA74"
});

const folderName = 'mau_nau_tay'
// Function to upload a single image
const uploadImage = async (filePath) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `shop-keepe/${folderName}`, // This will create a folder in Cloudinary
      resource_type: "auto"
    });
    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error(`Error uploading ${filePath}:`, error);
    return null;
  }
};

// Function to get all image files from a directory
const getImageFiles = (dirPath) => {
  const files = fs.readdirSync(dirPath);
  return files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
  });
};

// Main function to upload all images
const uploadAllImages = async (folderPath) => {
  try {
    const imageFiles = getImageFiles(folderPath);
    console.log(`Found ${imageFiles.length} images to upload`);

    const uploadPromises = imageFiles.map(file => {
      const filePath = path.join(folderPath, file);
      return uploadImage(filePath);
    });

    const results = await Promise.all(uploadPromises);
    const successfulUploads = results.filter(result => result !== null);

    console.log(`Successfully uploaded ${successfulUploads.length} images`);
    return successfulUploads;
  } catch (error) {
    console.error('Error in upload process:', error);
    return [];
  }
};

// Execute the upload
const folderPath = `./extra-tools/${folderName}`; // Change this to your image folder path
uploadAllImages(folderPath)
  .then(results => {
    console.log('Uploaded images:', JSON.stringify(results));
  })
  .catch(error => {
    console.error('Error:', error);
  }); 