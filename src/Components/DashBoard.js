

import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useEffect, useState } from 'react';
import CircularStorageDisplay from './CircularStorageDisplay';
import axios from 'axios';


function DashBoard() {

  const [uploadedFiles, setUploadedFiles] = useState([]);

  // State for storage information
  const [storageInfo, setStorageInfo] = useState({
    usedPercentage: 0,
    usedStorage: '0GB',
    totalStorage: '512GB',
  });

  // State for each file type's storage and last update date
  const [storageByType, setStorageByType] = useState({
    Documents: { size: 0, lastUpdate: null },
    Images: { size: 0, lastUpdate: null },
    Videos: { size: 0, lastUpdate: null },
    Others: { size: 0, lastUpdate: null },
  });

  const totalStorageGB = 512;

  const getStorageUsed = (files) => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  const updateStorageInfo = (files) => {
    const usedStorageBytes = getStorageUsed(files);
    const usedStorageGB = usedStorageBytes / (1024 * 1024 * 1024);
    const usedPercentage = (usedStorageGB / totalStorageGB) * 100;

    setStorageInfo({
      usedPercentage: usedPercentage.toFixed(2),
      usedStorage: `${usedStorageGB.toFixed(2)}GB`,
      totalStorage: `${totalStorageGB}GB`,
    });
  };

  // Function to categorize and update file storage by type
  const categorizeAndStoreFile = (file) => {
    const fileType = file.type;
    let typeKey;

    if (fileType.startsWith("image/")) {
      typeKey = "Images";
    } else if (fileType.startsWith("video/")) {
      typeKey = "Videos";
    } else if (fileType.startsWith("application/pdf") || fileType.startsWith("text/")) {
      typeKey = "Documents";
    } else {
      typeKey = "Others";
    }

    const currentDate = new Date().toLocaleDateString();

    setStorageByType((prev) => ({
      ...prev,
      [typeKey]: {
        size: prev[typeKey].size + file.size / (1024 * 1024 * 1024), // Convert bytes to GB
        lastUpdate: currentDate,
      },
    }));
  };


  const [loading,setLoading] = useState(true)
  const [fileSize,setFileSizes] = useState([])

  const fetchFiles = async () => {
    try {
      // Fetch the file data from the backend
      const response = await axios.get('http://localhost:9000/api/fetchFiles');
      
      // Debugging step to inspect the response
      console.log('Fetched files:', response.data);

      //
  
      // Ensure the response contains files
      const fileUrls = response.data?.files?.length
        ? response.data.files.map((file) => ({
            url: file.secure_url,        // Directly use the secure_url from the backend
            public_id: file.public_id,   // Store the public_id for later operations like delete
            name: file.display_name || file.secure_url.split('/').pop(),  // Use display_name if available
        }))
        : [];


      // Update state with the fetched file data
      setUploadedFiles(fileUrls);

      const AllFilesSize = response.data?.files?.length
      ? response.data.files.map((file) => ({
          url: file.secure_url,        // Use the secure_url from the backend
          public_id: file.public_id,  // Store the public_id for later operations like delete
          name: file.display_name || file.secure_url.split('/').pop(),
          size: file.size ? file.size : 0, // Default to 0 if size is missing
          type: file.type,
      }))
      : [];


      
      setFileSizes(AllFilesSize)
      console.log("FileSize: "+fileSize)
      calculateStorage(fileSize)
  
      console.log("Updated file URLs:", fileUrls);
    } catch (error) {
      console.error('Error fetching files:', error);
      setUploadedFiles([]); // Reset files in case of an error
    } finally {
      setLoading(false); // Stop loading after fetching
    }
  };

  useEffect(() => {
    fetchFiles(); // Call the fetchFiles function after the component mounts
    alert("Loading files..")
  }, []); // Empty

  const [isUploading, setIsUploading] = useState(false);

    const [documentsStorage, setDocumentsStorage] = useState(0); // in MB
  const [imagesStorage, setImagesStorage] = useState(0); // in MB
  const [videosStorage, setVideosStorage] = useState(0); // in MB
  const [othersStorage, setOthersStorage] = useState(0); // in MB

  const calculateStorage = (files) => {


    let docSize = 0;
    let imgSize = 0;
    let vidSize = 0;
    let otherSize = 0;


    files.map((file) => {
      const fileSizeMB = file.size / (1024 * 1024); // Convert bytes to MB
      if (file.name.toLowerCase().endsWith('.pdf') || file.type?.startsWith('text/')) {
        docSize += fileSizeMB;
      } else if (file.type?.startsWith('image/')) {
        imgSize += fileSizeMB;
      } else if (file.type?.startsWith('video/')) {
        vidSize += fileSizeMB;
      } else {
        otherSize += fileSizeMB;
      }
    });

    // Update the state variables
    setDocumentsStorage(docSize);
    setImagesStorage(imgSize);
    setVideosStorage(vidSize);
    setOthersStorage(otherSize);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  // const handleFileUpload = async (event) => {
  //   event.preventDefault();
  
  //   if (isUploading) {
  //     console.log("Upload already in progress.");
  //     return;
  //   }
  
  //   setIsUploading(true);
  //   console.log("Upload started.");
  
  //   const files = Array.from(event.target.files);
  //   if (files.length === 0) {
  //     console.log("No files selected.");
  //     setIsUploading(false);
  //     return;
  //   }
  
  //   setUploadedFiles((prevFiles) => [...fileUrls, ...prevFiles]);
  
  //   // Normalize the file names to handle small variations
  //   const normalizeFileName = (filename) => {
  //     return filename.trim().toLowerCase().replace(/\s+/g, '_');
  //   };
  
  //   // Filter out duplicate files based on name and size
  //   const uniqueFiles = [];
  //   files.forEach((file) => {
  //     const normalizedFileName = normalizeFileName(file.name);
  //     const isDuplicate = uploadedFiles.some(uploadedFile =>
  //       normalizeFileName(uploadedFile.name) === normalizedFileName && uploadedFile.size === file.size
  //     );
  
  //     if (!isDuplicate) {
  //       uniqueFiles.push(file);
  //     } else {
  //       console.log(`Skipping duplicate file: ${file.name}`);
  //     }
  //   });
  
  //   // Log files for debugging
  //   console.log("Files after filtering duplicates:", uniqueFiles);
  
  //   if (uniqueFiles.length === 0) {
  //     console.log("No unique files to upload.");
  //     setIsUploading(false);
  //     return;
  //   }
  
  //   // Map files to the file URLs
  //   const fileUrls = uniqueFiles.map((file) => ({
  //     name: file.name,
  //     url: URL.createObjectURL(file),
  //     size: file.size,
  //     type: file.type,
  //   }));
  
  //   // Add these unique files to the uploaded files state
  //   setUploadedFiles((prevFiles) => [...prevFiles, ...fileUrls]);
  
  //   // Categorize and store files locally
  //   fileUrls.forEach(categorizeAndStoreFile);
  
  //   const formData = new FormData();
  //   uniqueFiles.forEach((file) => {
  //     formData.append('files', file);
  //   });
  
  //   try {
  //     console.log("Sending files to the backend...");
  //     const response = await axios.post('http://localhost:9000/api/fileUpload', formData, {
  //       headers: { 'Content-Type': 'multipart/form-data' },
  //     });
  //     console.log('Files uploaded successfully', response.data);
  
  //     // Assuming response contains the file URLs and public_ids
  //     if (response.data.success) {
  //       const uploadedFileUrls = response.data.fileUrls; // Array of URLs from Cloudinary response
  //       const uploadedPublicIds = response.data.public_ids; // Array of public_ids from Cloudinary response
  
  //       // Map the uploaded files with URLs, public_ids, and other details
  //       const updatedFiles = uniqueFiles.map((file, index) => ({
  //         name: file.name,
  //         size: file.size,
  //         url: uploadedFileUrls[index],  // URL from Cloudinary response
  //         public_id: uploadedPublicIds[index],  // public_id from Cloudinary response
  //         type: file.type,
  //       }));
  
  //       // Add these updated files to the uploaded files state
  //       setUploadedFiles((prevFiles) => [...prevFiles, ...updatedFiles]);
  //     } else {
  //       console.error('Error uploading files:', response.data);
  //     }
  //   } catch (error) {
  //     console.error('Error uploading files:', error);
  //   } finally {
  //     setIsUploading(false);
  //     console.log("Upload complete.");
  //   }
  // };
  

  const handleFileUpload = async (event) => {
    event.preventDefault();
  
    if (isUploading) {
      console.log("Upload already in progress.");
      return;
    }
  
    setIsUploading(true);
    console.log("Upload started.");
  
    const files = Array.from(event.target.files);
    if (files.length === 0) {
      console.log("No files selected.");
      setIsUploading(false);
      return;
    }
  
    // Normalize the file names to handle small variations
    const normalizeFileName = (filename) => {
      return filename.trim().toLowerCase().replace(/\s+/g, '_');
    };
  
    // Filter out duplicate files based on name and size
    const uniqueFiles = [];
    const seenFileKeys = new Set();  // Use this to track file keys and avoid duplicates
  
    files.forEach((file) => {
      const normalizedFileName = normalizeFileName(file.name);
      const fileKey = `${normalizedFileName}_${file.size}`;
  
      if (!seenFileKeys.has(fileKey)) {
        uniqueFiles.push(file);
        seenFileKeys.add(fileKey); // Track the file key to avoid duplicates
      } else {
        console.log(`Skipping duplicate file: ${file.name}`);
      }
    });
  
    // Log files for debugging
    console.log("Files after filtering duplicates:", uniqueFiles);
  
    if (uniqueFiles.length === 0) {
      console.log("No unique files to upload.");
      setIsUploading(false);
      return;
    }
  
    // Immediately update uploadedFiles state with unique files before uploading
    setUploadedFiles(prevFiles => {
      const updatedFiles = uniqueFiles.map((file) => ({
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file), // You can use the URL.createObjectURL or leave it empty for now
        type: file.type,
        public_id: null, // Initially set public_id as null, which will be updated later
      }));
  
      return [...prevFiles, ...updatedFiles]; // Append new files to the existing state
    });
  
    // Prepare FormData with unique files
    const formData = new FormData();
    uniqueFiles.forEach((file) => {
      formData.append('files', file);
    });
  
    try {
      console.log("Sending files to the backend...");
      const response = await axios.post('http://localhost:9000/api/fileUpload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      console.log('Files uploaded successfully', response.data);
  
      // Assuming response contains the file URLs and public_ids
      if (response.data.success) {
        const uploadedFileUrls = response.data.fileUrls; // Array of URLs from Cloudinary response
        const uploadedPublicIds = response.data.public_ids; // Array of public_ids from Cloudinary response
  
        // Map the uploaded files with URLs, public_ids, and other details
        const updatedFiles = uniqueFiles.map((file, index) => ({
          name: file.name,
          size: file.size,
          url: uploadedFileUrls[index],  // URL from Cloudinary response
          public_id: uploadedPublicIds[index],  // public_id from Cloudinary response
          type: file.type,
        }));
  
        // Add these updated files to the uploaded files state
        setUploadedFiles(prevFiles => {
          return prevFiles.map(file => {
            const updatedFile = updatedFiles.find(f => f.name === file.name && f.size === file.size);
            return updatedFile ? updatedFile : file;
          });
        });
  
        console.log("State updated successfully:", updatedFiles);
      } else {
        console.error('Error uploading files:', response.data);
      }
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
      console.log("Upload complete.");
    }
  };
  
  
  

  const [searchQuery, setSearchQuery] = useState('');

  const [previousFiles, setPreviousFiles] = useState(uploadedFiles);

  useEffect(() => {
    if (searchQuery === '') {
      setPreviousFiles(uploadedFiles); // Store the current files if the search is cleared
    }

  }, [uploadedFiles]);

// Handle the search query change
const handleSearchChange = (event) => {
  const query = event.target.value.toLowerCase();
  setSearchQuery(query);
  

  const filteredFiles = searchQuery
  ? uploadedFiles.filter(file =>
      file.name.toLowerCase().includes(searchQuery)
    )
  : previousFiles;

setUploadedFiles(filteredFiles)

};


  


  const [visibleMenuIndex, setVisibleMenuIndex] = useState(null);

  const handleMenuToggle = (index) => {
    setVisibleMenuIndex(visibleMenuIndex === index ? null : index);
  };


  const handleDeleteFile = async (index) => {
    const fileToDelete = uploadedFiles[index];
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
  
    // First, we need to delete the file from Cloudinary
    try {
      const { public_id } = fileToDelete;  // Assume public_id is stored when the file is uploaded
      alert(public_id);  // Debugging step to show public_id
      
      // Send the public_id to the backend for deletion
      const response = await axios.post('http://localhost:9000/api/deleteFile', {
        data: { public_id },  // Send public_id inside a "data" object
      }, {
        headers: {
          'Content-Type': 'application/json',  // Ensure the header is set correctly
        }
      });
      
      if (response.data.success) {
        alert('File deleted successfully from Cloudinary:', response.data);

        const updatedFiles = uploadedFiles.filter(file => file.public_id !== public_id);

      // Update uploadedFiles state with the new array
        setUploadedFiles(updatedFiles);
  
        // After successful deletion from Cloudinary, update the storage state
        const typeKey = categorizeFileType(fileToDelete);
        setStorageByType((prev) => ({
          ...prev,
          [typeKey]: {
            size: prev[typeKey].size - fileToDelete.size / (1024 * 1024 * 1024), // Subtract GB
            lastUpdate: new Date().toLocaleDateString(),
          },

        }));

        

        // Update total storage info
        updateStorageInfo(newFiles);
  
        setVisibleMenuIndex(null); // Close the delete menu after deletion
      } else {
        console.error('File deletion failed:', response.data);
        alert('File not deleted. Please try again later.'); // Inform user about failure
      }
  
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
    }
  };
  

  
  const categorizeFileType = (file) => {
    const fileType = file.type;
    if (fileType.startsWith("image/")) {
      return "Images";
    } else if (fileType.startsWith("video/")) {
      return "Videos";
    } else if (fileType.startsWith("application/pdf") || fileType.startsWith("text/")) {
      return "Documents";
    } else {
      return "Others";
    }
  };

  const fileTypeImages = {
    pdf: '/images/DocLogo.svg',
    image: '/images/ImageLogo.svg',
    video: '/images/VideoLogo.svg',
    other: '/images/OtherLogo.svg',
  };

  const getFileTypeImage = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'pdf') return fileTypeImages.pdf;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) return fileTypeImages.image;
    if (['mp4', 'avi', 'mov'].includes(extension)) return fileTypeImages.video;
    return fileTypeImages.other;
  };

 
  const GoToDashboard = () =>{
    window.location.href = '/dashboard'
  }
  const GoToImages = () =>{
    window.location.href = '/images'
  }

  const GoToVidoes = () =>{
    window.location.href = '/videos'
  }

  const GoToOthers = () =>{
    window.location.href = '/others'
  }

  const GoToDocuments = () =>{
    window.location.href = '/documents'
  }

  const LogOut = ()=>{
    sessionStorage.setItem("loginId","false")
    window.location.href = '/'
  }

  
  

  return (
    <div className='flex flex-col h-[1000px] gap-5'>
      {localStorage.getItem("loginId") ? (
        <div>
          <div className="flex flex-row items-center gap-16 mt-[50px] w-full">
            <div className="flex flex-row gap-3 items-center">
              <i className="bi bi-database text-[#FA7275] ml-[70px]" style={{ fontSize: '50px' }}></i>
              <h1 className="text-[#FA7275] font-medium text-4xl">Storage</h1>
            </div>

            <div className="bg-white shadow-custom-blue rounded-full w-[300px] h-[50px] p-3 flex items-center">
              <input
                placeholder="Search"
                className="w-full text-left border-none rounded focus:outline-none focus:ring-0"
                value={searchQuery} // Set the search query as the value
                onChange={handleSearchChange}
              />
            </div>

            <div className='flex flex-row gap-4 ml-auto pr-[40px]'>

  <div onClick={() => document.getElementById('fileUpload').click()} className="relative inline-block">
    <i
      style={{ fontSize: '30px' }}
      className="bi bi-cloud-arrow-up-fill cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
    ></i>
    <button
      className="bg-[#FA7275] h-[53px] w-[136px] cursor-pointer font-medium shadow-custom-blue rounded-full text-white pl-8"
    >
      Upload
    </button>
    <input
      type="file"
      id="fileUpload"

      onChange={handleFileUpload}
      multiple
      style={{ display: 'none' }}
    />
  </div>

  {/* LogOut Button */}
  <div onClick={LogOut} className="relative inline-block self-end">

    <i
      style={{ fontSize: '30px' }}
      className="bi bi-box-arrow-left cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 text-white"
    ></i>
    <button
      className="bg-[#FA7275] h-[53px] w-[136px] cursor-pointer font-medium shadow-custom-blue rounded-full text-white pl-8"
    >
      LogOut
    </button>
  </div>
</div>
</div>
          <div className='flex flex-row gap-20 mt-[50px] mr-[40px]'>
          <div className='flex flex-col justify-center items-center gap-12'>

          <div className="flex items-center ml-[40px]">
                <div className="relative inline-block">
                  <img src='/images/Dashboard.svg' className=' absolute left-4 top-1/2 transform -translate-y-1/2' height={30} width={30} />
                  <button onClick={GoToDashboard} className="bg-[#FA7275] h-[53px] w-[156px] cursor-pointer font-medium shadow-custom-blue rounded-full text-white pl-8">
                  Dashboard
                  </button>
                </div>
              </div>

          <div className="flex items-center ml-[40px]">
                <div className="relative inline-block">
                  <img src='/images/Document.svg' className=' absolute left-4 top-1/2 transform -translate-y-1/2' height={30} width={30} />
                  <button onClick={GoToDocuments}  className="bg-[#FA7275] h-[53px] w-[156px] cursor-pointer font-medium shadow-custom-blue rounded-full text-white pl-8">
                  Document
                  </button>
                </div>
              </div>

              <div className="flex items-center ml-[40px]">
                <div className="relative inline-block">
                  <img src='/images/Images.svg' className=' absolute left-4 top-1/2 transform -translate-y-1/2' height={30} width={30} />
                  <button onClick={GoToImages} className="bg-[#FA7275] h-[53px] w-[156px] cursor-pointer font-medium shadow-custom-blue rounded-full text-white pl-8">
                  Images
                  </button>
                </div>
              </div>

              <div className="flex items-center ml-[40px]">
                <div className="relative inline-block">
                  <img src='/images/Video.svg' className=' absolute left-4 top-1/2 transform -translate-y-1/2' height={30} width={30} />
                  <button onClick={GoToVidoes} className="bg-[#FA7275] h-[53px] w-[156px] cursor-pointer font-medium shadow-custom-blue rounded-full text-white pl-8">
                  Video
                  </button>
                </div>
              </div>


            
          <div className="flex items-center ml-[40px]">
                <div className="relative inline-block">
                  <img src='/images/Other.svg' className=' absolute left-4 top-1/2 transform -translate-y-1/2' height={30} width={30} />
                  <button onClick={GoToOthers} className="bg-[#FA7275] h-[53px] w-[156px] cursor-pointer font-medium shadow-custom-blue rounded-full text-white pl-8">
                    Others
                  </button>
                </div>
              </div>
              <img src="/images/driveImage.svg" className='ml-[50px]' height={220} width={220} />
            </div>

            <div className='bg-[#F2F4F8] w-[1077px] h-[752px] flex flex-row gap-16 rounded-3xl'>
              

            <div className="h-[700px] w-full max-w-[970px] mt-[30px] mx-auto bg-white rounded-3xl">
  <h1 className="text-2xl text-center font-bold mt-[20px]">Recent Files Uploaded</h1>
  <div className="p-4 items-center justify-center">
    {uploadedFiles.length > 0 ? (
      <ul className="flex flex-col items-center max-h-[590px] gap-2 overflow-y-auto">
        {uploadedFiles.map((file, index) => (
          <div
            key={index}
            className="text-gray-700 flex rounded-lg w-full shadow-custom-blue max-w-[700px] h-[100px] flex-row gap-3 mt-2 p-2 bg-white "
          >
            {/* Dynamically set the image based on the file type */}
            <img
              src={getFileTypeImage(file)} // Set image based on file type
              className="ml-2 mt-2"
              height={70}
              width={70}
              alt="File Logo"
            />

            <a
              href={file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 cursor-pointer mt-6 w-full max-w-[170px] overflow-hidden text-ellipsis whitespace-nowrap hover:text-blue-700"
              title={file.name} // Tooltip to show full file name on hover
            >
              {file.name}
            </a>

            {/* Three Dots Menu */}
            <div className="relative inline-block mt-4 flex-grow">
              <div className="relative">
                {/* Make sure the parent container has relative positioning */}
                <div
                  className="absolute top-2 right-2 flex flex-col cursor-pointer"
                  onClick={() => handleMenuToggle(index)} // Pass index to toggle the specific menu
                >
                  <div className="w-2 h-2 border-2 border-[#A3B2C7] rounded-full mb-1"></div>
                  <div className="w-2 h-2 border-2 border-[#A3B2C7] rounded-full mb-1"></div>
                  <div className="w-2 h-2 border-2 border-[#A3B2C7] rounded-full mb-1"></div>
                </div>
              </div>

              {/* Menu (Delete option) */}
              {visibleMenuIndex === index && (
                <div className="absolute top-0 right-0 mt-8 w-[120px] bg-white shadow-md rounded-lg py-2 text-center">
                  <button
                    className="w-full text-red-500 hover:bg-gray-200 py-2 px-4 rounded-lg"
                    onClick={() => handleDeleteFile(index)} // Delete file on click
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-center mt-4">No files uploaded yet.</p>
    )}
  </div>
</div>

            </div>
          </div>
        </div>
      ) : (
        <div>ERROR Page 404 Found</div>
      )}
    </div>
  );
}

export default DashBoard;


