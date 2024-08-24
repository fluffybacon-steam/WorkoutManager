'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Calendar } from './components/Calendar';
import {Exercise} from './components/Exercise';
import {Blank} from './components/Blank';
import { getCookie } from 'cookies-next';
import styles from './page.module.scss';

export default function Home() {
    const router = useRouter();
    const [userSheetUrl, setUserSheetUrl] = useState<string>('');

    const fetchAuth = async () => {
      console.log('fetchAuth');
      // const savedSheetUrl =  window.localStorage.getItem("sheetUrl");

      if(userSheetUrl) {
        window.localStorage.setItem("sheetUrl",userSheetUrl);
      } else {
        alert("No sheet url given");
      }

      const savedCredentials = window.localStorage.getItem("ga_credentials");
      if(savedCredentials && savedCredentials != 'undefined'){
        console.log("use saved cred");
        //Old credentials exist, use thoses
        console.log('Use saved credentials to fetch');
        const credentials = await axios.get(`/api/fetchAuth`, {
            params: {
              savedCredentials : savedCredentials,
            }
            }).then((res)=>{
              return res.data.credentials;
            }).catch((err)=>{
              console.log('Failed to use saved creds',err);
              return false;
            });

        if(credentials){
          //Grab sheet using creds, then redirect to /planner
          const sheetData = await axios.get('/api/fetchSheet',{
              params: {
                credentials : credentials,
                sheetUrl : userSheetUrl
              }
            }).then((res)=>{
              return res.data.sheetData;
            }).catch((err)=>{
              console.log('Failed to fetch sheet',err);
              return false;
            })
          if(sheetData){
            window.localStorage.setItem("sheetData",sheetData);
            router.push('/planner');
          }
        } else {
          alert("Error: No OAuth2 credentials founds");
        }

      } else {
        // Get user consent
        console.log('Fetch user consent');

        axios.get(`/api/fetchAuth`
          ).then((res)=>{
            router.push(res.data.auth_url, undefined)
          }).catch((err)=>{
            if(err.response.data.auth_url){
              router.push(err.response.data.auth_url, undefined)
            }
            console.log('Failed to consent',err);
          })
      }
    };

    const clearCache = () =>{
      localStorage.removeItem("ga_credentials")
      localStorage.removeItem("sheetData")
      localStorage.removeItem("sheetUrl")
    }

    return (
        <div className={styles.home}>
            <h2>Login into Google</h2>
            <h3>Instructions:</h3>
              <ol>
                <li>Upload your worksheet spreadsheet to your Google Drive.</li>
                <li>Save spreadsheet as a Google Sheet. Under File, click Save as a Google Sheet.</li>
                <li>Paste the URL of the Google sheet below.</li>
              </ol>
            <input
                type="text"
                value={userSheetUrl}
                onChange={(e) => setUserSheetUrl(e.target.value)}
                placeholder="Enter Google Sheets URL"
            />
            <button disabled={(userSheetUrl == '')} onClick={fetchAuth}>Load Workout</button>
            <button  onClick={()=>{clearCache}}>Clear cached data</button>
        </div>
    );
}
