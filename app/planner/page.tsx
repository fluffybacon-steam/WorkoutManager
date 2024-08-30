'use client';
import { useState, useEffect, useRef } from 'react';
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
    info: Array<string>;
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
    const [workoutDays, setWorkoutDays] = useState<Array<Workout | String> | null>(null);
    const [warmUps, setWarmUps] = useState<Object | null>(null);
    const [weakPoints, setWeakPoints] = useState<Object | null>(null);
    const [weakPointSelection, setWeakPointSelection] = useState<Array<string> | null>(null);
    
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


    //Save weakpoint exercises to state variables
    //NEED to save to sheet and localStorage as well
    useEffect(()=>{
        console.log("WQEFFFFFFFFF",);
        if(weakPointSelection && currentDay && workoutDays){
            let tempCurrentDay = currentDay;
            const exercises = tempCurrentDay.exercises;
            if(exercises){
                const updatedExercises = exercises.map(ex =>{
                    if (ex.primary.toLowerCase().includes("weak point") && ex.sub1 === ex.sub2) {
                        console.log('old',ex.primary);
                        const weakPoint = weakPointSelection.pop();
                        if(Array.isArray(weakPoint)) {
                            ex.primary = weakPoint[0];
                            ex.primary_vid = weakPoint[1];
                        } else {
                            ex.primary = weakPoint;
                        }
                        ex.sub1 = null;
                        ex.sub2 = null;
                        console.log('added weakpoint to updateEx',ex.primary);
                    }
                    return ex;
                });
                console.log('updatedExercises',updatedExercises);
                // tempWorkDays[index].exercises = updatedExercises;
                tempCurrentDay.exercises = updatedExercises;
                
                let index = workoutDays.findIndex(day => currentDay === day);
                let tempWorkDays = workoutDays;
                tempWorkDays[index] = tempCurrentDay;
                setCurrentDay(null);
                setWorkoutDays(tempWorkDays);
                // setCurrentDay(workoutDays[index]);
            }
            console.log('check work!',workoutDays,currentDay);
            //tempWorkDays.forEach((day,index)=>{
            //});
        }
    },[weakPointSelection])


    useEffect(() => {
        if (!currentDay && workoutDays?.length) {
            for (const day of workoutDays) {
                console.log('Looking for current day', day);
                if(typeof day == "string"){
                    continue;
                }
                if (!day.complete) {
                    console.log("Found it!");
                    setCurrentDay(day);
                    break;  // Exit the loop once the current day is found and set
                }
            }
        }
    }, [workoutDays, currentDay, setCurrentDay]);
    

    // Save exercise to state variables
    // ugly way to handle this but oh well. refactor later?
    // Add save to localStorage later
    const saveExerciseLocally = (reps: Array<number>, lbs: Array<number>, rowI: number) => {
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
                        console.log('Rendering <EX/>',exercise);
                        if(index == 0 && !currentDay.complete){
                            return (
                                <>
                                    <Warmups warmUps={warmUps} showWarmups={showWarmups}/>
                                    <Exercise saveExercise={saveExercise} key={(exercise.rowOrigin) ? exercise.rowOrigin + exercise.primary : index + exercise.primary} exercise={exercise}/>
                                </>
                            )
                        }
                        return (
                            <Exercise saveExercise={saveExercise} key={(exercise.rowOrigin) ? exercise.rowOrigin + exercise.primary : index + exercise.primary} exercise={exercise}/>
                        )
                    })
                    ) : (
                        <Blank currentDay={currentDay}/>
                    ) : 'Pick a day'
                } 
            </div>
            { currentDay ?
                <WeakPoints styles={styles} currentDay={currentDay} weakPoints={weakPoints} setWeakPointSelection={setWeakPointSelection}/>
                : null
            }
        </div>
    )
}

interface WeakPointsProps {
    currentDay: Workout;
    weakPoints: WeakPoint[];
    styles: { [key: string]: string }; 
    setWeakPointSelection: Dispatch<SetStateAction<any>>;
}

function WeakPoints({ styles, currentDay, weakPoints, setWeakPointSelection }: WeakPointsProps) {
    const dialogRef = useRef(null);
    const [selectedWeakPoint, setSelectedWeakPoint] = useState<WeakPoint | null>(null);
    const [selectedExerciseList, setSelectedExerciseList] = useState<Array<string>>([]);
    console.log('selectedWeakPoint',selectedWeakPoint);
    console.log('selectedExerciseList',selectedExerciseList);
    console.log(selectedExerciseList.includes('Cuffed Behind-The-Back Lateral Raise'));

    useEffect(() => {
        if (currentDay && currentDay?.exercises && dialogRef.current) {
            currentDay.exercises.forEach((ex: any) => {
                if (ex.primary.toLowerCase().includes("weak point") && ex.sub1 === ex.sub2) {
                    dialogRef.current.show();
                }
            });
        } 
    }, [currentDay]);

    const handleWeakPointChange = (selectedPoint: string) => {
        if (!selectedPoint) {
            return;
        }
        const weakPoint = weakPoints.find(point => point.point === selectedPoint);
        if(weakPoint){
            setSelectedWeakPoint(weakPoint);
        }
    };

    const handleExerciseSelect = (exercise: Array<string> | string) => {
        console.log('handleExerciseSelect',exercise)
        if(exercise == 'Pick one of the options above. Do not do all of them in one day!'){
            return;
        }
        setSelectedExerciseList(prevList => {
            if (prevList.includes(exercise)) {
                // If already selected, remove the exercise
                return prevList.filter(ex => ex !== exercise);
            } else if (prevList.length < 2) {
                // If less than 2 exercises are selected, add the new one
                return [...prevList, exercise];
            } else {
                // Otherwise, do nothing (limit to 2 selections)
                return prevList;
            }
        });
    };

    const setWeakPointExercise = () => {
        if (selectedExerciseList.length === 2) {
            setWeakPointSelection(selectedExerciseList);
            dialogRef.current.close();
            // Handle the selected exercises (e.g., save to state or API)
        } else {
            alert("Please select exactly two exercises.");
        }
    };

    if (!weakPoints || !currentDay) {
        return null;
    }

    console.log(weakPoints)
    return (
        <dialog className={styles.dialog} ref={dialogRef}>
            <div className="wrapper">
                <h2>Select a Weak Point</h2>
                <select 
                    onChange={(e) => handleWeakPointChange(e.target.value)} 
                    defaultValue={''}
                >
                    <option value="" disabled>Select a weak point</option>
                    {weakPoints.map((weakPoint, index) => {
                        return (
                            <option key={index} value={weakPoint.point}>
                                {weakPoint.point}
                            </option>
                        )
                    })}
                </select>

                {selectedWeakPoint && (
                    <>
                        <ol>
                            {selectedWeakPoint.exercises.map((exercise, index) => {
                                const exerciseName = Array.isArray(exercise) ? exercise[0] : exercise;
                                const isSelected = selectedExerciseList.some(selectedExercise => {
                                    const compare = Array.isArray(selectedExercise) ? selectedExercise[0] : selectedExercise;
                                    return compare == exerciseName;
                                });
                                return (
                                    <li 
                                        key={index} 
                                        onClick={() => handleExerciseSelect(exercise)}
                                        style={{ 
                                            cursor: 'pointer', 
                                            textDecoration: isSelected ? 'underline' : 'none' 
                                        }}
                                    >
                                        {Array.isArray(exercise) ? exercise[0] : exercise}
                                    </li>
                                )
                            })}
                        </ol>
                        {selectedWeakPoint.info.map((info,index)=>(
                            <p key={index} >{info}</p>
                        ))}

                        <div className="exercise-list">
                            {selectedExerciseList.map((ex,index)=>(
                                <div key={index}>{ Array.isArray(ex) ? ex[0] : ex}</div>
                            ))}
                        </div>

                        <button 
                            onClick={setWeakPointExercise} 
                            disabled={selectedExerciseList.length !== 2}
                            >
                            Confirm Selection
                        </button>
                    </>
                )}
            </div>
        </dialog>
    );
}

