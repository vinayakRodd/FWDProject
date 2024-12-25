

const express = require('express')
const cors = require('cors')
const bp = require('body-parser')
const myDb = require('./MongoDb')
const App = new express()
const PORT = 9000
const path = require('path')
const multer = require('multer');
const { v2: cloudinary } = require('cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const si = require('systeminformation');
const nodemailer = require('nodemailer');
// const { Dropbox } = require('dropbox');
const fs = require('fs')
const { default: axios } = require('axios')
App.use(cors({"origin":"*"}))




App.use(bp.json());
App.use(express.urlencoded({ extended: false }));

App.get('/api/storage', async (req, res) => {
    try {
        const diskData = await si.fsSize();
        const total = (diskData[0].size / (1024 ** 3)).toFixed(0); // Convert to GB
        const used = (diskData[0].used / (1024 ** 3)).toFixed(0);  // Convert to GB
        const usedPercentage = Math.round((used / total) * 100);

        res.json({
            usedPercentage,
            usedStorage: `${used}GB`,
            totalStorage: `${total}GB`
        });
    } catch (error) {
        console.error('Error fetching disk usage:', error);
        res.status(500).send('Error fetching disk usage');
    }
});

App.post("/api/login", async (req, resp) => {
    var EmailId = req.body.EmailId
    var Password = req.body.Password

    console.log(EmailId)
    console.log(Password)

    const LoginCollection = myDb.collection("Login")

    var result = await LoginCollection.find({ EmailId: EmailId, Password: Password }).toArray()

    console.log(result)
    resp.send(result)
});


cloudinary.config({
    cloud_name: 'dgiag7tpe',  // Replace with your Cloudinary Cloud Name
    api_key: '769674479623524',        // Replace with your Cloudinary API Key
    api_secret: 'W0EuoZ9gOBmyaE92muQQ6xW403U'   // Replace with your Cloudinary API Secret
});

App.get("/api/documents", async (req, res) => {
  try {
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dgiag7tpe/resources/search`;

    const response = await axios.post(
      cloudinaryUrl,
      {
        expression: "folder:uploads/", // Broader query to fetch everything in the folder
        max_results: 100,
      },
      {
        auth: {
          username: '769674479623524',
          password: 'W0EuoZ9gOBmyaE92muQQ6xW403U',
        },
      }
    );

    console.log(response.data); // Debug response
    const documents = response.data.resources.map((file) => ({
      name: file.public_id.split("/").pop(),
      size: file.bytes,
      url: file.secure_url,
      type: file.format,
    }));

    res.status(200).json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to fetch documents" });
  }
});

App.get("/api/images", async (req, res) => {
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dgiag7tpe/resources/search`;
  
      const response = await axios.post(
        cloudinaryUrl,
        {
          expression: "folder:uploads/", // Broader query to fetch everything in the folder
          max_results: 100,
        },
        {
          auth: {
            username: '769674479623524',
            password: 'W0EuoZ9gOBmyaE92muQQ6xW403U',
          },
        }
      );
  

      // Debugging the response
      console.log(response.data);
  
      // Define the image formats you want to filter by
      const validImageFormats = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff'];
  
      // Filter images based on the format
      const imageDocuments = response.data.resources
        .filter((file) => validImageFormats.includes(file.format))  // Only include valid image formats
        .map((file) => ({
          name: file.public_id.split("/").pop(),
          size: file.bytes,
          url: file.secure_url,
          type: file.format,
        }));
  
      res.status(200).json(imageDocuments);  // Return only image files
    } catch (error) {
      console.error("Error fetching documents:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });

  App.get("/api/videos", async (req, res) => {
    try {
      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/dgiag7tpe/resources/search`;
  
      const response = await axios.post(
        cloudinaryUrl,
        {
          expression: "folder:uploads/",  // Query to fetch everything in the folder
          max_results: 100,
        },
        {
          auth: {
            username: '769674479623524',
            password: 'W0EuoZ9gOBmyaE92muQQ6xW403U',
          },
        }
      );
  
      // Debugging the response
      console.log(response.data);
  
      // Define the valid video formats you want to filter by
      const validVideoFormats = ['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv'];
  
      // Filter videos based on the format
      const videoDocuments = response.data.resources
        .filter((file) => validVideoFormats.includes(file.format)) // Only include valid video formats
        .map((file) => ({
          name: file.public_id.split("/").pop(),  // Extract the file name from the public_id
          size: file.bytes,                       // File size in bytes
          url: file.secure_url,                   // Secure URL of the file
          type: file.format,                      // File format (e.g., 'mp4', 'avi')
        }));

        
      // Return only the video files
      res.status(200).json(videoDocuments);
    } catch (error) {
      console.error("Error fetching documents:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to fetch documents" });
    }
  });
  


const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Folder in Cloudinary
    allowed_formats: ['jpg', 'png', 'pdf'], // Allowed file formats
    public_id: (req, file) => {
      // Extract the file extension from the original file
      const extname = path.extname(file.originalname); // Get the extension, e.g., .pdf
      const basename = path.basename(file.originalname, extname); // Get the base filename (without extension)

      // Now create a unique file name using the basename without adding the extension again
      return Date.now() + '-' + basename + extname;  // Ensure extension is not added twice
    }
  }
});


App.get('/api/fetchFiles', async (req, res) => {
  try {
    let allResources = [];
    let nextCursor = null;

    do {
      // Fetch resources with pagination
      const result = await cloudinary.api.resources({
        type: 'upload',
        prefix: 'uploads/',
        max_results: 100,
        next_cursor: nextCursor,
      });

      // Directly use the resources without altering the URLs unnecessarily
      const sanitizedResources = result.resources.map(file => ({
        public_id: file.public_id, // Use the public_id as-is
        secure_url: file.secure_url, // Use the correct URL provided by Cloudinary
        format: file.format, // Ensure the format is available
        bytes: file.bytes, // Add file size info (optional)
        created_at: file.created_at, // Add timestamp (optional)
      }));

      // Add sanitized resources to the main array
      allResources = allResources.concat(sanitizedResources);

      // Get the next cursor for pagination
      nextCursor = result.next_cursor;
    } while (nextCursor);

    // If files are found, return them; otherwise, return a message
    if (allResources.length > 0) {
      res.status(200).json({ success: true, files: allResources });
    } else {
      res.status(200).json({ success: false, message: 'No resources found' });
    }
  } catch (error) {
    console.error('Error fetching files:', error);
    res.status(500).json({ success: false, message: 'Error fetching files', error });
  }
});


// App.get('/api/fetchFiles', async (req, res) => {
//     try {
//       let allResources = [];
//       let nextCursor = null;
  
//       do {
//         // Fetch resources with pagination
//         const result = await cloudinary.api.resources({
//           type: 'upload',
//           prefix: 'uploads/',
//           max_results: 100,
//           next_cursor: nextCursor,
//         });
  
//         // Directly use the resources without altering the URLs unnecessarily
//         const sanitizedResources = result.resources.map(file => ({
//           public_id: file.public_id, // Use the public_id as-is
//           secure_url: file.secure_url, // Use the correct URL provided by Cloudinary
//           format: file.format, // Ensure the format is available
//           bytes: file.bytes, // Add file size info (optional)
//           created_at: file.created_at, // Add timestamp (optional)
//         }));
  
//         // Add sanitized resources to the main array
//         allResources = allResources.concat(sanitizedResources);
  
//         // Get the next cursor for pagination
//         nextCursor = result.next_cursor;
//       } while (nextCursor);
  
//       if (allResources.length > 0) {
//         res.status(200).json(allResources);
//       } else {
//         res.status(200).json({ message: 'No resources found' });
//       }
//     } catch (error) {
//       console.error('Error fetching files:', error);
//       res.status(500).json({ message: 'Error fetching files', error });
//     }
//   });
  






const upload = multer({ storage: storage });

App.post('/api/fileUpload', upload.array('files'), async (req, res) => {
  console.log('Request received at:', new Date());
  console.log('Files received:', req.files); // Log received files

  try {
    const fileUrls = [];
    const publicIds = [];  // This will store the public_ids of the uploaded files
    const uploadedFiles = new Set(); // To hold unique combinations of name and size

    for (const file of req.files) {
      console.log(`Processing file: ${file.originalname}`);

      // Determine the file's resource type based on MIME type
      let resourceType = 'auto'; // Default type
      if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.mimetype.startsWith('image/')) {
        resourceType = 'image';
      } else if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
        resourceType = 'raw'; // Treat ZIP files as raw files
      } else {
        console.log(`Unsupported file type: ${file.mimetype}`);
        return res.status(400).json({ message: `Unsupported file type: ${file.mimetype}` });
      }

      console.log(`Resource type for ${file.originalname}: ${resourceType}`);

      // Check for duplicate based on name and size
      const fileKey = `${file.originalname}_${file.size}`;
      console.log('Checking for duplicate:', fileKey);

      if (uploadedFiles.has(fileKey)) {
        console.log(`Skipping duplicate file: ${file.originalname} (Key: ${fileKey})`);
        continue; // Skip duplicate file
      }

      uploadedFiles.add(fileKey);
      console.log(`File added to the set: ${file.originalname} (Key: ${fileKey})`);

      // Define a clean public_id
      const cleanFileName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
      const uniquePublicId = `uploads/${cleanFileName}_${Date.now()}`; // Ensure unique name

      try {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type, // Use the determined resource type
          folder: 'uploads/', // Optional: Organize files into a specific folder
          public_id: uniquePublicId, // Use the unique public_id
          overwrite: true, // Prevent overwriting of existing files with the same public_id
        });

        console.log(`Upload successful: ${result.secure_url}`);
        fileUrls.push(result.secure_url);
        publicIds.push(result.public_id);  // Save the public_id from Cloudinary
      } catch (uploadError) {
        console.error(`Failed to upload ${file.originalname}:`, uploadError);
        return res.status(500).json({ message: `Error uploading ${file.originalname}`, error: uploadError });
      }
    }

    // If all files are processed successfully, return file URLs and public_ids
    res.status(200).json({
      success: true,
      fileUrls,      // Array of file URLs from Cloudinary
      public_ids: publicIds  // Array of public_ids from Cloudinary
    });
  } catch (error) {
    console.error('Error processing files:', error);
    res.status(500).json({ message: 'Error processing files', error });
  }
});


// App.post('/api/fileUpload', upload.array('files'), async (req, res) => {
//   console.log('Request received at:', new Date());
//   console.log('Files received:', req.files); // Log received files

//   try {
//     const fileUrls = [];
//     const uploadedFiles = new Set(); // This will hold the unique combinations of name and size

//     for (const file of req.files) {
//       console.log(`Processing file: ${file.originalname}`);

//       // Determine the file's resource type based on MIME type
//       let resourceType = 'auto'; // Default type
//       if (file.mimetype.startsWith('video/')) {
//         resourceType = 'video';
//       } else if (file.mimetype.startsWith('image/')) {
//         resourceType = 'image';
//       } else if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
//         resourceType = 'raw'; // Treat ZIP files as raw files
//       } else {
//         console.log(`Unsupported file type: ${file.mimetype}`);
//         res.status(400).json({ message: `Unsupported file type: ${file.mimetype}` });
//         return; // Exit early for unsupported file types
//       }

//       console.log(`Resource type for ${file.originalname}: ${resourceType}`);

//       // Create a unique key using the file name and size
//       const fileKey = `${file.originalname}_${file.size}`;
//       console.log('Checking for duplicate:', fileKey);

//       // Check if file is a duplicate (based on name and size)
//       if (uploadedFiles.has(fileKey)) {
//         console.log(`Skipping duplicate file: ${file.originalname} (Key: ${fileKey})`);
//         continue;
//       }

//       // Add the file key to the set to mark it as uploaded
//       uploadedFiles.add(fileKey);
//       console.log(`File added to the set: ${file.originalname} (Key: ${fileKey})`);

//       // Define a clean public_id by removing problematic extensions and paths
//       const cleanFileName = file.originalname.replace(/\.[^/.]+$/, ""); // Remove extension
//       const uniquePublicId = `uploads/${cleanFileName}_${Date.now()}`; // Ensure unique name

//       try {
//         const result = await cloudinary.uploader.upload(file.path, {
//           resource_type, // Use the determined resource type
//           folder: 'uploads/', // Optional, organize files into folders
//           public_id: uniquePublicId,
//           overwrite: true, // Ensure no duplicate files overwrite the same public_id
//         });

//         console.log(`Upload successful: ${result.secure_url}`);
//         fileUrls.push(result.secure_url);
//       } catch (uploadError) {
//         console.error(`Failed to upload ${file.originalname}:`, uploadError);
//         res.status(500).json({ message: `Error uploading ${file.originalname}`, error: uploadError });
//         return; // Exit early if any file fails to upload
//       }
//     }

//     // If all files are processed successfully
//     res.status(200).json({ success: true, fileUrls });
//   } catch (error) {
//     console.error('Error processing files:', error);
//     res.status(500).json({ message: 'Error processing files', error });
//   }
// });



App.post('/api/deleteFile', async (req, res) => {
  console.log("Request received:", req.body);

  // Extract public_id from the 'data' object in the request body
  const { public_id } = req.body.data;

  if (!public_id) {
      return res.status(400).json({ success: false, message: 'public_id is required' });
  }

  try {
      const result = await cloudinary.uploader.destroy(public_id);
      console.log("Cloudinary delete result:", result);

      if (result.result === 'ok') {
          return res.status(200).json({ success: true, message: 'File deleted successfully from Cloudinary' });
      } else {
          return res.status(400).json({ success: false, message: 'Failed to delete file from Cloudinary' });
      }
  } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
      return res.status(500).json({ success: false, message: 'Error occurred while deleting the file' });
  }
});




const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service provider
  auth: {
      user: 'roddvinayak709@gmail.com', // Your email address
      pass: 'uldi fppa qinq nblw', // Your email password or app-specific password
  },
});


App.post("/api/register", async (req, resp) => {
    const { EmailId, Password, ConfirmPassword } = req.body;

    console.log(EmailId);
    console.log(Password);
    console.log(ConfirmPassword);

    if (ConfirmPassword === Password) {
        const LoginCollection = myDb.collection("Login");

        // Check if the email already exists
        const result = await LoginCollection.find({ EmailId: EmailId }).toArray();

        if (result.length === 0) {
            // Generate a 6-digit OTP
            const otp = Math.floor(100000 + Math.random() * 900000);

            // Save OTP and email to a temporary collection (or directly in the user document)
            await myDb.collection("TempOTPs").insertOne({
                EmailId: EmailId,
                otp: otp,
                createdAt: new Date(),
            });

            // Send OTP to the user's email
            const mailOptions = {
                from: 'roddvinayak709@gmail.com',
                to: EmailId,
                subject: 'Your OTP for Registration',
                text: `Your OTP is ${otp}. It is valid for 10 minutes.`,
            };

            try {
                await transporter.sendMail(mailOptions);
                return resp.send({ otp: otp, message: 2 }); // Indicate that OTP was sent
                
            } catch (error) {
                console.error('Error sending email:', error);
                return resp.send({ message: -2 }); // Indicate email sending failed
            }
        } else {
            return resp.send({ message: -1 }); // Email already registered
        }
    }

    resp.send({ message: 0 }); // Passwords do not match
});

App.post("/api/loginOTP", async (req, res) => {
    var OTP = req.body.OTP
    var newOTP = parseInt(OTP, 10)

    console.log("OTP sent from FrontEnd = " + OTP)

    const TempOtpCollection = myDb.collection("TempOTPs")

    var result = await TempOtpCollection.find({ otp: newOTP }).toArray()

    console.log(result)
    res.send(result)
});



App.post("/api/registerUserCredentials", async (req, res) => {

  var EmailId = req.body.EmailId
  var Password = req.body.Password

  console.log(EmailId)
  console.log(Password)

  const LoginCollection = myDb.collection("Login")

  await LoginCollection.insertOne({ EmailId:EmailId,Password:Password })

});


App.listen(PORT, (err) => {
    if (err) console.log(err);
    else console.log("Server Running at port " + PORT);
});
