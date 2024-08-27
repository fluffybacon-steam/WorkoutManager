'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {Warmups} from '../components/Warmups';
import { Calendar } from '../components/Calendar';
import {Exercise} from '../components/Exercise';
import {Blank} from '../components/Blank';
import styles from './page.module.scss';
import axios from 'axios';

interface Workout {
    day: string;
    complete: boolean;
    exercises: Array<any>;
}

interface sheetData {
    warmUps: Object;     
    weakPoints: Object;    
    workoutDays: Object;     
}

export default function Planner(){
    console.log("rendered Planner");
    const router = useRouter();
    const [workoutDays, setWorkoutDays] = useState<Object | null>(null);
    const [warmUps, setWarmUps] = useState<Object | null>(null);
    const [weakPoints, setWeakPoints] = useState<Object | null>(null);

    
    const [currentDay, setCurrentDay] = useState<Workout | null>(null);
    const [showWarmups, setShowWarmups] = useState<Boolean>(false);
    
    const assignWorkoutData = (sheetData: sheetData) => {
        console.log("assignWorkoutData");
        if(sheetData?.workoutDays){
            console.log('assigned1');
            setWorkoutDays(sheetData.workoutDays);
        }
        if(sheetData?.warmUps){
            console.log('assigned2');
            setWarmUps(sheetData.warmUps);
        }
        if(sheetData?.weakPoints){
            console.log('assigned3');
            setWeakPoints(sheetData.weakPoints);
        }
    }
    

    useEffect(() => {
        if(typeof window !== 'undefined' && (!workoutDays && !warmUps && !weakPoints)){
            const sheetDataString = window.localStorage.getItem('sheetData');
            let sheetData: sheetData;
            if (sheetDataString) {
                sheetData = JSON.parse(sheetDataString);
                assignWorkoutData(sheetData);
            } else {
                router.push('/');
            }
        }
    }, []);
    
    useEffect(() => {
        const checkHash = () => {
            if (window.location.hash === '#warmups') {
                setShowWarmups(true);
            } else {
                setShowWarmups(false);
            }
        };
        checkHash();
        window.addEventListener('hashchange', checkHash);
        return () => {
            window.removeEventListener('hashchange', checkHash);
        };
    }, []);

    useEffect(()=>{
        
    },[currentDay]);
    
    return(
        <div className={styles.planner}>
            <Calendar styles={styles} workoutDays={workoutDays} setCurrentDay={setCurrentDay} currentDay={currentDay}/>
            <div className={styles.exercises}>
                { currentDay ? 
                    currentDay?.exercises ? (
                    currentDay.exercises.map((exercise, index) => {
                        if(index == 0 && !currentDay.complete){
                            return (
                                <>
                                    <Warmups warmUps={warmUps} showWarmups={showWarmups}/>
                                    <Exercise key={index} exercise={exercise}/>
                                </>
                            )
                        }
                        return (
                            <Exercise key={index} exercise={exercise}/>
                        )
                    })
                    ) : (
                        <Blank  />
                    ) : 'Pick a day'
                } 
            </div>
        </div>
    )
}