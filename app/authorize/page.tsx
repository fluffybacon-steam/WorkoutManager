'use client';
import { useSearchParams } from 'next/navigation';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import styles from './page.module.scss';

function AuthorizeComponent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [statusText,setText] = useState('Loading authentication...');

    const fetchAuth = async (code: string,state: string) => {
        const credentials = await axios.get(`/api/setToken`,{ 
            params: {
                code: code,
                state: state
            } 
            }).then((res)=>{
                return res.data?.credentials;
            }).catch((err)=>{
                console.error('Failed to fetch Access token', err);
                return false
            });
        if(credentials){
            //Save credentials
            window.localStorage.setItem("ga_credentials",JSON.stringify(credentials));
            //Grab sheet using creds, then redirect to /planner
            const sheetUrl = window.localStorage.getItem("sheetUrl");
            if(!sheetUrl){
                alert('Error: No sheet url defined in localStorage');
                window.localStorage.removeItem("ga_credentials");
                router.push('/');
            }
            setText('Fetching data from sheet...');
            const sheetData = await axios.get('/api/fetchSheet',{
                params: {
                    credentials : JSON.stringify(credentials),
                    sheetUrl : sheetUrl
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
            } else{
                alert("Something went wrong while retrieving sheet. Did you make sure to save the spreadsheet as a Google Sheet?");
            }
        } else {
            alert("Error: Failed to generate credentials from auth code");
        }
    };
    
    const lookAtCodeState = () => {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        if(code && state){
            fetchAuth(code,state);
        }
    } 

    useEffect(()=>{
        lookAtCodeState()
    },[searchParams])

    return (
        <>
            <h2 className={styles.title}>{statusText}</h2>
        </>
    )
}

export default function Authorize() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthorizeComponent />
        </Suspense>
    );
}