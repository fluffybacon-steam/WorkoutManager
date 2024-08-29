'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {Warmups} from '../components/Warmups';
import { Calendar } from '../components/Calendar';
import {Exercise} from '../components/Exercise';
import {Blank} from '../components/Blank';
import styles from './page.module.scss';
import axios from 'axios';

interface WeakPoint {
    point: string;
    exercises: Array<string | [string, string]>;
}

interface Workout {
    day: string;
    complete: boolean;
    exercises: Array<any>;
}

interface sheetData {
    warmUps: Object;     
    weakPoints: Object;    
    workoutDays: Array<Workout>;     
}

export default function Planner(){
    console.log("rendered Planner");
    const router = useRouter();
    const [workoutDays, setWorkoutDays] = useState<Array<Workout> | null>(null);
    const [warmUps, setWarmUps] = useState<Object | null>(null);
    const [weakPoints, setWeakPoints] = useState<Object | null>(null);
    
    const [currentDay, setCurrentDay] = useState<Workout | null>(null);
    const [showWarmups, setShowWarmups] = useState<Boolean>(false);
    
    //assign sheetData to component state variables
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
    
    // Look for saved sheetData; else go back to home;
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

    useEffect(()=>{
        if(currentDay?.complete){
            setShowWarmups(true);
        } else {
            setShowWarmups(false);
        }
    },[currentDay])

    // Save exercise to state variables
    // ugly way to handle this but oh well. refactor later?
    // Add save to localStorage later
    const saveExerciseLocally = (reps: Array<number>, lbs: Array<number>,rowI: number) => {
        if(!workoutDays){
            return
        }
        console.log('saveExerciseLocally',workoutDays);
        const recordedSets = reps.map((rep, index) => `${rep} x ${lbs[index]}`);
        console.log(recordedSets);
        let tempWorkDays = workoutDays;
        tempWorkDays.forEach((day,index)=>{
            const exercises = day.exercises;
            if(exercises){
                const updatedExercises = exercises.map(exercise =>{
                    if(exercise.rowOrigin === rowI){
                        return {...exercise, recordedSets: recordedSets }
                    }
                    return exercise;
                });
                tempWorkDays[index].exercises = updatedExercises;
            }
        });
        setWorkoutDays(tempWorkDays);
    }

    const saveExercise = async (reps: Array<number>, lbs: Array<number>, rowI: number) =>{
        //Save exercise to spreadsheet
        const savedCredentialsStr = window.localStorage.getItem("ga_credentials");
        const sheetUrl = window.localStorage.getItem("sheetUrl");
        const popup = document.querySelector('.popup');
        console.log('popuo!',popup);
        let popup_message = "Error: No OAuth2 credentials or Sheet found";
        if(savedCredentialsStr && sheetUrl){
            console.log('savedCred before fetchAuth', savedCredentialsStr);
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
                popup_message = await axios.post(`/api/saveExercise`, { 
                        credentials,
                        reps,
                        lbs,
                        rowI,
                        sheetUrl
                    }).then((res)=>{
                        console.log(res);
                        console.log("saveExerciseLocally b",workoutDays);
                        saveExerciseLocally(reps,lbs,rowI);
                        console.log("saveExerciseLocally a",workoutDays);
                        return "Saved exercise";
                    }).catch((err)=>{
                        console.log(err);
                        return "Error: Unable to save exercise";
                    });
            } else {
                popup_message = "Error: OAuth2 credentials failed";
            }
        } else {
            popup_message = "Error: Could not save exercise as either credentials or sheet url are not saved";
        }
        if(popup){
            console.log(popup_message);
            popup.innerHTML = popup_message;
            popup.classList.add('active');
            setTimeout(()=>{
                popup.classList.remove('active');
            },5000);
        }
    }
    
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
                                    <Exercise saveExercise={saveExercise} key={(exercise.rowOrigin) ? exercise.rowOrigin : index} exercise={exercise}/>
                                </>
                            )
                        }
                        return (
                            <Exercise saveExercise={saveExercise} key={(exercise.rowOrigin) ? exercise.rowOrigin : index} exercise={exercise}/>
                        )
                    })
                    ) : (
                        <Blank currentDay={currentDay}/>
                    ) : 'Pick a day'
                } 
            </div>
            {/* { currentDay ?
                <WeakPoints currentDay={currentDay} weakPoints={weakPoints}/>
                : null
            } */}
        </div>
    )
}

interface WeakPointsProps {
    currentDay: Workout;
    weakPoints: WeakPoint[];
}

function WeakPoints({ currentDay, weakPoints }: WeakPointsProps) {
    const [showDialog, setShowDialog] = useState(false);
    const [selectedWeakPoint, setSelectedWeakPoint] = useState(null);
    const [selectedExercises, setSelectedExercises] = useState([]);

    useEffect(()=>{
        if(currentDay && currentDay?.exercises){
            currentDay.exercises.forEach((ex: any)=>{
                if(ex.primary.toLowerCase().includes("weak point") && ex.sub1 == ex.sub2){
                    setShowDialog(true);
                    console.log(weakPoints);
                }
            })
        }
    },[currentDay])

    // const handleWeakPointChange = (event: Event) => {
    //     const selectedPoint = event?.target?.value;
    //     setSelectedWeakPoint(selectedPoint);

    //     const weakPointData = weakPoints.find(point => point.point === selectedPoint);
    //     if (weakPointData) {
    //         setSelectedExercises(weakPointData?.exercises);
    //     } else {
    //         setSelectedExercises([]);
    //     }
    // };

    if(!weakPoints || !currentDay){
        return null
    }


    return (
        <dialog open={showDialog}>
            <h2>Select a Weak Point</h2>
            <select 
            // onChange={handleWeakPointChange} 
            value={selectedWeakPoint || ''}>
                <option value="" disabled>Select a weak point</option>
                {weakPoints.map((weakPoint, index) => (
                    <option key={index} value={weakPoint.point}>
                        {weakPoint.point}
                    </option>
                ))}
            </select>

            {selectedWeakPoint && (
                <>
                    <h3>Exercises for {selectedWeakPoint}</h3>
                    <ul>
                        {selectedExercises.map((exercise, index) => (
                            <li key={index}>
                                {Array.isArray(exercise) ? (
                                    <>
                                        <a href={exercise[1]} target="_blank" rel="noopener noreferrer">
                                            {exercise[0]}
                                        </a>
                                    </>
                                ) : (
                                    exercise
                                )}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </dialog>
    )
}
