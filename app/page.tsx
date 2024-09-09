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
    hideCloseButton: true,
    title: "Welcome to Workout Planner",
    target: 'body',
    content: (
      <>
      <p style={{textWrap:'pretty'}}>Here you can load your favorite spreadsheet program into a user friendly UI.</p>
      <br/>
      <p style={{textWrap:'pretty'}}>This app was developed with <a style={{textDecoration:'underline'}}href='https://jeffnippard.com/' target='_blank'>Jeff Nippard’s programs</a> in mind, 
      but you can always download the source from GitHub and modify it for your own spreadsheet program.</p>
      <br/>
      <p>I am always looking to improve! Please leave any feedback you have <a style={{textDecoration:'underline'}} href='https://www.reddit.com/user/FluffyBacon_steam/'>here</a>.</p>
      <br/>
      <p><b>Legal disclaimer:</b> I am not associated with Jeff Nippard and receive no financial gain from the use of app nor the purchase of any Nippard’s programs. This is fan/passion project.</p>
      </>
    ),
    disableBeacon: true,
    disableOverlay: true,
    placement: 'top-center' as const,
  },
  {
    title:'Follow these instructions',
    target: 'body ol',
    content: (
      <p style={{textWrap:'pretty'}}>Before you can begin, you will need to upload your spreadsheet to your Google Drive.</p>
    ),
    placement: 'auto' as const,
  },
  {
    target: 'body input',
    content: (
      <p style={{textWrap:'pretty'}}>Enter the URL of your Google Spreadsheet here</p>
    ),
    placement: 'auto' as const,
  },
  {
    target: 'body button:nth-child(8)',
    content: (
      <p style={{textWrap:'pretty'}}>Click here to login to Google and retrieve the program sheet</p>
    ),
    placement: 'auto' as const,
  },
  {
    target: 'body button:nth-child(7)',
    content: (
      <p style={{textWrap:'pretty'}}>After your first login, your program will be retained in memory and can be loaded from here (no internet required)</p>
    ),
    placement: 'auto' as const,
  },
  { 
    target: 'header > label.planner',
    content: (
      <p style={{textWrap:'pretty'}}>You can either load your spreadsheet on this page now, or continue the demo on the Planner page</p>
    ),
    // disableOverlay: true,
    placementBeacon: 'top' as const,
    placement: 'bottom-start' as const,
  },
]

export default function Home() {
    const router = useRouter();
    const [userSheetUrl, setUserSheetUrl] = useState<string>('');
    const [sheetData, setSheetData] = useState<string>('');

    const [firstTime, setFirstTime] = useState<boolean>(false);
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    const fetchAuth = async () => {
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
        const credentials = await axios.post(`/api/fetchAuth`, {savedCredentialsStr}
            ).then((res)=>{
              return res.data.credentials;
            }).catch((err)=>{
              console.log('Failed to use saved creds',err);
              return false;
            });

        if(credentials){
          window.localStorage.setItem("ga_credentials",JSON.stringify(credentials));
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

    const clearCacheOAuth = () =>{
      window.localStorage.removeItem("ga_credentials");
      popup("Cleared saved OAuth credentials");
    }

    const clearCache = () =>{
      window.localStorage.removeItem("ga_credentials");
      window.localStorage.removeItem("sheetData");
      window.localStorage.removeItem("sheetUrl");
      window.localStorage.removeItem("demoComplete");
      window.localStorage.removeItem("demoPlannerComplete");
      setUserSheetUrl('');
      setSheetData('');
      popup("Cleared data cache");
    }

    useEffect(()=>{
      const sheetUrl = window.localStorage.getItem('sheetUrl');
      const sheetDataJson = window.localStorage.getItem('sheetData');
      if(sheetUrl){
        setUserSheetUrl(sheetUrl);
      }
      if(sheetDataJson){
        setSheetData(sheetDataJson);
      }

      const demo = window.localStorage.getItem('demoComplete');
      if (demo != "1") {
        setFirstTime(true); // If demo is complete, firstTime should be false
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
        window.localStorage.setItem('demoComplete','1');
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
            <br/>
            <h3>First Time Setup Instructions:</h3>
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
            <button onClick={clearCacheOAuth}>Clear OAuth Login</button>
            <button onClick={clearCache}>Clear Everything ⚠️</button>
        </div>
    );
}
