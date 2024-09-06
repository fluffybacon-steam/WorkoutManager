'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import {popup, isLoading} from './utils/helpers';
import styles from './page.module.scss';
import Joyride from 'react-joyride';
import {CallBackProps, ACTIONS, EVENTS, STATUS, ORIGIN } from 'react-joyride';

const steps = [
  {
    target: 'body h1',
    content: 'Welcome to my workout planner. Here you can load your spreadsheet program into a more user friendly UI',
    disableBeacon: true,
    placement: 'auto' as const,
  },
  {
    target: 'body ol',
    content: 'Before you can begin, you will need to upload your spreadsheet to your Google Drive. Follow these instructions',
    placement: 'auto' as const,
  },
  {
    target: 'body input',
    content: 'Enter the URL of your Google Spreadsheet here',
    placement: 'auto' as const,
  },
  {
    target: 'body button:nth-child(7)',
    content: 'Once you are sign-in, your workouts will be saved locally and be accessible from the Planner (no internet required).',
    placement: 'auto' as const,
  },
]

export default function Home() {
    const router = useRouter();
    const [userSheetUrl, setUserSheetUrl] = useState<string>('');
    const [sheetData, setSheetData] = useState<string>('');

    const [firstTime, setFirstTime] = useState<boolean>(true);
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    const fetchAuth = async () => {
      console.log('fetchAuth');
      isLoading(true);
      // const savedSheetUrl =  window.localStorage.getItem("sheetUrl");

      if(userSheetUrl) {
        window.localStorage.setItem("sheetUrl",userSheetUrl);
      } else {
        alert("Error: No sheet url given");
      }

      const savedCredentialsStr = window.localStorage.getItem("ga_credentials");
      if(savedCredentialsStr && savedCredentialsStr != 'undefined'){
        //Old credentials exist, use thoses
        console.log('Use saved credentials to fetch',savedCredentialsStr);
        const credentials = await axios.post(`/api/fetchAuth`, {savedCredentialsStr}
            ).then((res)=>{
              return res.data.credentials;
            }).catch((err)=>{
              console.log('Failed to use saved creds',err);
              return false;
            });

        if(credentials){
          console.log('credentials',credentials);
          window.localStorage.setItem("ga_credentials",JSON.stringify(credentials));
          console.log('credentials',JSON.stringify(credentials));
          //Grab sheet using creds, then redirect to /planner
          const sheetData = await axios.get('/api/fetchSheet',{
              params: {
                credentials : JSON.stringify(credentials),
                sheetUrl : userSheetUrl
              }
            }).then((res)=>{
              return res.data.sheetData;
            }).catch((err)=>{
              console.log('Failed to fetch sheet',err);
              return false;
            })
          if(sheetData){
            window.localStorage.setItem("sheetData",JSON.stringify(sheetData));
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
      window.localStorage.removeItem("ga_credentials");
      window.localStorage.removeItem("sheetData");
      window.localStorage.removeItem("sheetUrl");
      window.localStorage.removeItem("demoComplete");
      setUserSheetUrl('');
      popup("Cleared data cache");
    }

    useEffect(()=>{
      const sheetUrl = window.localStorage.getItem('sheetUrl');
      const sheetDataJson = window.localStorage.getItem('sheetData');
      console.log(sheetUrl);
      if(sheetUrl){
        setUserSheetUrl(sheetUrl);
      }
      if(sheetDataJson){
        setSheetData(sheetDataJson);
      }

      const demo = window.localStorage.getItem('demoComplete');
      if (demo) {
        setFirstTime(false); // If demo is complete, firstTime should be false
      } else {
        setFirstTime(true); // If no demoComplete, set firstTime to true
        setRun(true); // Start the tour
      }
    },[])

    const handleJoyrideCallback = (data: CallBackProps) => {
      const { action, index, origin, status, type } = data;
  
      if (action === ACTIONS.CLOSE && origin === ORIGIN.KEYBOARD) {
        window.localStorage.setItem('demoComplete','1');
      }
  
      if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
        // Update state to advance the tour
        setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
      } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
        // You need to set our running state to false, so we can restart if we click start again.
        setRun(false);
      }
    };

    return (
        <div className={styles.home}>
            {firstTime && (
              <Joyride
                run={run}
                steps={steps}
                stepIndex={stepIndex}
                callback={handleJoyrideCallback}
                continuous={true}
              />
            )}
            <h2>Login into Google</h2>
            <h3>Instructions:</h3>
              <ol>
                <li>Upload your worksheet spreadsheet to your Google Drive.</li>
                <li>Save spreadsheet as a Google Sheet. 
                  <ul>
                    <li>
                    Under File, click Save as a Google Sheet.
                    </li>
                  </ul>
                </li>
                <li>Paste the URL of the Google sheet below.</li>
              </ol>
            <input
                type="text"
                defaultValue={userSheetUrl}
                onChange={(e) => setUserSheetUrl(e.target.value)}
                placeholder="Enter Google Sheets URL"
            />
            <button disabled={(sheetData == '')} onClick={()=>{router.push('/planner');}}>Load workouts from local memory</button>
            <button disabled={(userSheetUrl == '')} onClick={fetchAuth}>Load workouts from sheet (overwrites local data)</button>
            <button onClick={clearCache}>Clear cached data</button>
        </div>
    );
}
