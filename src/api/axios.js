import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers:{
    "Content-Type":"application/json"
  }
});


axiosInstance.interceptors.request.use(
(config)=>{

 const persist = JSON.parse(
   localStorage.getItem("persist:root")
 );

 if(persist){

   const auth = JSON.parse(persist.auth);

   if(auth.token){
     config.headers.Authorization =
     `Bearer ${auth.token}`;
   }

 }

 return config;

});


export default axiosInstance;