'use client'
import { useRouter } from 'next/navigation'; // Import useRouter from next/navigation
import {popup, isLoading} from './utils/helpers';
import axios from 'axios';

export default function Navbar() {
    const router = useRouter();

    const syncSheetData = async () =>{
        if(typeof window == 'undefined'){
            return;
        }
        isLoading(true);
        const savedCredentialsStr = window.localStorage.getItem("ga_credentials");
        const sheetDataStr = window.localStorage.getItem("sheetData");
        const sheetUrl = window.localStorage.getItem("sheetUrl");
        let popup_message = "Error: No OAuth2 credentials or Sheet found";
        if(savedCredentialsStr && sheetUrl){
            const credentials = await axios.post(`/api/fetchAuth`, 
                { savedCredentialsStr}
                ).then((res)=>{
                  return res.data.credentials;
                }).catch((err)=>{
                  console.log('Failed to use saved creds',err,err.response.data?.auth_url);
                  if(err.response.status == 307){
                    // router.replace(err.response.data?.auth_url);
                  }
                });
            if(credentials){
                window.localStorage.setItem("ga_credentials",JSON.stringify(credentials));
                popup_message = await axios.post(`/api/saveData`, { 
                        credentials : credentials,
                        sheetDataStr: sheetDataStr,
                        sheetUrl: sheetUrl,
                    }).then((res)=>{
                        return "Successfully saved local data to Google Spreadsheet";
                    }).catch((err)=>{
                        console.log(err);
                        return "Error: Unable to save local data to Google Spreadsheet";
                    });
            } else {
                popup_message = "Error: OAuth2 credentials failed";
            }
        } else {
            popup_message = "Error: Could not save data as either OAuth2 credentials or sheet url are not set";
        }
        popup(popup_message);
        isLoading(false);
    }

    return (
    <>
        <label className="home">
            Home
            <button onClick={()=>{router.push('/')}}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M240-200h120v-240h240v240h120v-360L480-740 240-560v360Zm-80 80v-480l320-240 320 240v480H520v-240h-80v240H160Zm320-350Z"/></svg>
            </button>
        </label>
        <label className="planner">
            Planner
            <button onClick={()=>{router.push('/planner')}}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M200-80q-33 0-56.5-23.5T120-160v-560q0-33 23.5-56.5T200-800h40v-80h80v80h320v-80h80v80h40q33 0 56.5 23.5T840-720v560q0 33-23.5 56.5T760-80H200Zm0-80h560v-400H200v400Zm0-480h560v-80H200v80Zm0 0v-80 80Zm280 240q-17 0-28.5-11.5T440-440q0-17 11.5-28.5T480-480q17 0 28.5 11.5T520-440q0 17-11.5 28.5T480-400Zm-160 0q-17 0-28.5-11.5T280-440q0-17 11.5-28.5T320-480q17 0 28.5 11.5T360-440q0 17-11.5 28.5T320-400Zm320 0q-17 0-28.5-11.5T600-440q0-17 11.5-28.5T640-480q17 0 28.5 11.5T680-440q0 17-11.5 28.5T640-400ZM480-240q-17 0-28.5-11.5T440-280q0-17 11.5-28.5T480-320q17 0 28.5 11.5T520-280q0 17-11.5 28.5T480-240Zm-160 0q-17 0-28.5-11.5T280-280q0-17 11.5-28.5T320-320q17 0 28.5 11.5T360-280q0 17-11.5 28.5T320-240Zm320 0q-17 0-28.5-11.5T600-280q0-17 11.5-28.5T640-320q17 0 28.5 11.5T680-280q0 17-11.5 28.5T640-240Z"/></svg>
            </button>
        </label>
            <label className="save">
            Save to Google Spreadsheet
            <button onClick={()=>{syncSheetData()}}>
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#e8eaed"><path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/></svg>
            </button> 
        </label>
    </> 
    )
}