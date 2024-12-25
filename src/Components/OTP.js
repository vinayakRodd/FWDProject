import axios from 'axios'
import React, { useRef, useState } from 'react'
// import { useNavigate } from 'react-router-dom';
function OTP() {

    const getOTP = useRef("")


const[ErrorLogin,setErrorLogin] = useState(0)

const [LoginStatus,setLoginStatus] = useState(0)
const [UserRegisteredStatus,setUserRegisteredStatus] = useState(0)

const authenticateOTP = () =>{

    var myData = {OTP:getOTP.current.value}
    axios.post("http://localhost:9000/api/loginOTP",myData)
    .then(response=>{
        
        
        if((response.data[0].otp) == getOTP.current.value){
            
            alert(localStorage.getItem("EmailId"))
            var myData = {EmailId:localStorage.getItem("EmailId"),Password:localStorage.getItem("Password"),Folder:localStorage.getItem("EmailId")+localStorage.getItem("Password")}
            axios.post("http://localhost:9000/api/registerUserCredentials",myData)
            .then(response=>{

                setUserRegisteredStatus(1)
                setTimeout(()=>{
                    setUserRegisteredStatus(0)
                },1000)
                    
            })
            
            setLoginStatus(1)
            localStorage.setItem("loginId","true")
            setTimeout(()=>{
                setLoginStatus(0)
                
            },1000)

            setTimeout(()=>{

                window.location.href = '/dashboard';

            },1000)
            
        }

    })
    .catch(err=>{
        console.log(err)
        setErrorLogin(1)
        setTimeout(()=>{
            setErrorLogin(0)
        },1000)

    })
    
}


const SwitchToCreateAccount = () =>{


    window.location.href = '/'

}



  return (
    <div className='flex z-50 flex-row'>
        {UserRegisteredStatus ?
         <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
         <div className="shadow-custom-blue w-[300px] rounded-3xl bg-[#FA7275] h-[60px] flex items-center justify-center">
           <h1 className="text-white text-2xl text-center">User Registered</h1>
         </div>
       </div>:null}

        {LoginStatus ?
         <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
         <div className="shadow-custom-blue w-[300px] rounded-3xl bg-[#FA7275] h-[60px] flex items-center justify-center">
           <h1 className="text-white text-2xl text-center">Login Successful</h1>
         </div>
       </div>:null}

       {ErrorLogin ?
         <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
         <div className="shadow-custom-blue w-[400px] rounded-3xl bg-[#FA7275] h-[60px] flex items-center justify-center">
           <h1 className="text-white text-2xl text-center">Incorrect Email Id or Password</h1>
         </div>
       </div>:null}

      


        <div className='bg-[#FA7275]  h-[1024px] w-[580px]'>
            
            <div className='flex  flex-col justify-center items-center gap-20' >
                <img src="/images/StoreIt.svg" className='mt-[50px]' height={82} width={223} />
                <div className='flex flex-col'>
                    <p className='text-5xl font-bold text-white' >Manage Your Files</p>
                    <p className='text-5xl font-bold text-white' >the Best Way</p>
                </div>
                <div className='flex flex-col'>
                    <p className='text-lg  text-white' >Awesome, We have created perfect place for you to </p>
                    <p className='text-lg  text-white' >store all the documents</p>
                </div>

                <img src="/images/driveImage.svg" height={342} width={342} />
            </div>
        </div>

        <div>

                <div className='h-[628px] w-[580px] flex  flex-col mt-[250px] gap-10  ml-[150px]' >
                
                    
                   <h1 className='text-5xl font-bold text-left' >OTP Authentication</h1>

                    
                    

                    
                    <div className="bg-white shadow-custom-blue rounded-2xl w-[600px] h-[90px] p-4">
                        <h1 className="text-left mb-2">OTP</h1>
                        <input 
                            type="password"
                            
                            ref = {getOTP}
                            placeholder="Enter your OTP" 
                            className="w-full text-left border-none rounded focus:outline-none focus:ring-0" 
                            />
                    </div>


                    <button onClick={authenticateOTP} className='bg-[#FA7275] h-[60px] cursor-pointer w-[600px] font-medium mt-30px shadow-custom-blue rounded-full text-white' >Login</button>
                    
                    
                        <p className='text-center' >Dont have an account ? <span onClick={SwitchToCreateAccount} className='text-[#FA7275] cursor-pointer' >Create an account</span> </p>
               
                       </div>
        </div>
    </div>
  )
}

export default OTP
