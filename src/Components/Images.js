import axios from 'axios';
import 'bootstrap-icons/font/bootstrap-icons.css';
import React, { useEffect, useState } from 'react';

function Images() {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [visibleMenuIndex, setVisibleMenuIndex] = useState(null);
  const [storageInfo, setStorageInfo] = useState({
    usedPercentage: 0,
    usedStorage: '0GB',
    totalStorage: '512GB',
  });

  const totalStorageGB = 512;

  const getStorageUsed = (files) => files.reduce((total, file) => total + file.size, 0);

  const updateStorageInfo = (files) => {
    const usedStorageBytes = getStorageUsed(files);
    const usedStorageGB = usedStorageBytes / (1024 * 1024 * 1024); // Convert bytes to GB
    const usedPercentage = (usedStorageGB / totalStorageGB) * 100;

    setStorageInfo({
      usedPercentage: usedPercentage.toFixed(2),
      usedStorage: `${usedStorageGB.toFixed(2)}GB`,
      totalStorage: `${totalStorageGB}GB`,
    });
  };

  const handleFileUpload = async (event) => {
    // const files = Array.from(event.target.files).filter(file => file.type.startsWith("image/"));
    
    // Prepare the form data to send to the backend
    const files = []
    const formData = new FormData();
    files.forEach(file => {
      formData.append("file", file);
    });

    try {
      // Assuming you're uploading files to the server and getting a response with image URLs
      // Replace the API endpoint and logic according to your backend
      const response = await axios.post('http://localhost:9000/upload-images', formData);
      // Assuming response contains uploaded file data with URLs
      const fileUrls = response.data.files; // Replace with the actual field that contains the uploaded files

      // Update the uploaded files state with the newly uploaded files
      setUploadedFiles((prevFiles) => [...fileUrls, ...prevFiles]);
      updateStorageInfo([...uploadedFiles, ...fileUrls]); // Update storage information
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  // Fetch the images when the component mounts
 

    
  useEffect(() => {
    updateStorageInfo(uploadedFiles); // Update storage info whenever uploadedFiles change
  }, [uploadedFiles]);

  const handleMenuToggle = (index) => {
    setVisibleMenuIndex(visibleMenuIndex === index ? null : index); // Toggle visibility
  };

  const handleDeleteFile = async (index) => {
    const fileToDelete = uploadedFiles[index];
  
    // First, we need to delete the file from Cloudinary
    try {
      const { public_id } = fileToDelete;  // Assume public_id is stored when the file is uploaded
      alert(public_id);  // Debugging step to show public_id
      

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
  
        setVisibleMenuIndex(null); // Close the delete menu after deletion
      } else {
        console.error('File deletion failed:', response.data);
        alert('File not deleted. Please try again later.'); // Inform user about failure
      }
  
    } catch (error) {
      console.error('Error deleting file from Cloudinary:', error);
    }
  };
  

  const fileTypeImages = {
    image: '/images/ImageLogo.svg',
  };

  const getFileTypeImage = () => fileTypeImages.image;

  const GoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  const GoToImages = () => {
    window.location.href = '/images';
  };

  const GoToVidoes = () => {
    window.location.href = '/videos';
  };

  const GoToOthers = () => {
    window.location.href = '/others';
  };

  const GoToDocuments = () => {
    window.location.href = '/documents';
  };

  const LogOut = () => {
    sessionStorage.setItem("loginId", "false");
    window.location.href = '/';
  };


    const [totalImageStorage, setTotalImageStorage] = useState(0); 
    const fetchDocuments = async () => {
      try {
        // Fetch the file data from the backend
        const response = await axios.get('http://localhost:9000/api/fetchFiles');
        
        // Debugging step to inspect the response
        console.log('Fetched files:', response.data);
    
        // Ensure the response contains files
        const fileUrls = response.data?.files?.length
        ? response.data.files.map((file) => ({
            url: file.secure_url,        // Use the secure_url from the backend
            public_id: file.public_id,  // Store the public_id for later operations like delete
            name: file.display_name || file.secure_url.split('/').pop(),
            size: file.bytes ? file.bytes : 0, // Default to 0 if size is missing
            type: file.type,
        }))
        : [];
  
  
          const imageFiles = fileUrls.filter((file) => 
            file.url.toLowerCase().endsWith('.jpg') || file.url.toLowerCase().endsWith('.png')
          );
      
        // Update state with the fetched file data
        setUploadedFiles(imageFiles);
    
        console.log("Updated file URLs:", imageFiles);
      } catch (error) {
        console.error('Error fetching files:', error);
        setUploadedFiles([]); // Reset files in case of an error
      }
    };

     const [searchQuery, setSearchQuery] = useState('');
      
        const [previousFiles, setPreviousFiles] = useState(uploadedFiles);
      
        useEffect(() => {
          if (searchQuery === '') {
            setPreviousFiles(uploadedFiles); // Store the current files if the search is cleared
          }
      
        }, [uploadedFiles]);
  
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
    
        

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    if (uploadedFiles && uploadedFiles.length > 0) {
      const urls = uploadedFiles.map(file => ({ url: file.url }));
      setUploadedFiles(urls);
    }
  }, []);


const [totalUsedSpace, setTotalUsedSpace] = useState(0);

// Calculate total space whenever uploadedFiles changes
useEffect(() => {
  const totalSize = uploadedFiles.reduce((acc, file) => acc + (file.size || 0), 0); // Use 0 if size is undefined
  setTotalUsedSpace(totalSize / (1024 * 1024)); // Convert to MB
}, [uploadedFiles]);

  
  return (
    <div className='flex flex-col h-[1000px] gap-5'>
      {localStorage.getItem("loginId") ? (
        <div>
          {/* Header section */}
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
  {/* Upload Button */}
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

          {/* Main Content */}
          <div className='flex flex-row gap-20 mt-[50px]'>
          <div className='flex flex-row gap-20 mt-[50px]'>
            {/* Sidebar */}
            <div className='flex flex-col justify-center items-center gap-12'>

<div className="flex items-center ml-[40px]">
      <div className="relative inline-block">
        <img  src='/images/Dashboard.svg' className=' absolute left-4 top-1/2 transform -translate-y-1/2' height={30} width={30} />
        <button onClick={ GoToDashboard} className="bg-[#FA7275] h-[53px] w-[156px] cursor-pointer font-medium shadow-custom-blue rounded-full text-white pl-8">
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
  </div>

            {/* Images Content */}
            <div className='bg-[#F2F4F8] w-[1127px] h-[752px] flex flex-col gap-5 rounded-3xl'>
              <h1 className='text-5xl font-bold ml-[50px] mt-[40px]'>Images</h1>
              
          
            
              <p className='text-2xl font-medium ml-[50px]'>
                  Total Space Used by Documents: {totalUsedSpace.toFixed(2)} MB
              </p>

              <div className='flex flex-row w-[1070px] overflow-y-scroll h-[700px] mt-[20px] ml-[50px] flex-wrap gap-5'>
                {uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className='flex flex-col gap-3 w-[240px] h-[180px] bg-white rounded-3xl p-4 shadow-md relative'
                    >
                      <div className='flex flex-row gap-3'>
                        <img
                          onClick={() => window.open(file.url, "_blank")}
                          src={getFileTypeImage(file)}
                          alt="file type"
                          className="w-20 cursor-pointer h-20"
                        />
                        <div className="relative inline-block mt-4 w-[150px] h-[50px]">
                          <div onClick={() => handleMenuToggle(index)} className="relative">
                            <div className="absolute top-2 right-2 flex flex-col cursor-pointer">
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
                                onClick={() => handleDeleteFile(index)}
                              >
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-lg font-semibold truncate w-full" title={file.name}>{file.name}</p>
                      <p className="text-sm text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xl ml-4 text-gray-500">No images uploaded yet.</p>
                )}
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

export default Images;

