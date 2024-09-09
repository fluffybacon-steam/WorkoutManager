'use client';
import { useState, useEffect, useRef, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import {Warmups} from '../components/Warmups';
import { Calendar } from '../components/Calendar';
import {Exercise} from '../components/Exercise';
import {Blank} from '../components/Blank';
import styles from './page.module.scss';
import Joyride from 'react-joyride';
import { CallBackProps, ACTIONS, EVENTS, STATUS, ORIGIN } from 'react-joyride';
import {popup,isLoading} from '../utils/helpers';

const steps = [
  {
    hideCloseButton: true,
    title:'The Planner',
    target: 'body',
    content: (
        <>
        <p style={{textWrap:'pretty'}}>Here is where you will follow your program and track your workouts. There are two sections to the planner:</p>
        <br/>
        <ol style={{textAlign:'left',margin:'10px'}}>
            <li><b>Calendar Slider</b>
                <ul>
                    <li>Shows all the workout days in your program</li>
                </ul>
            </li>
            <br/>
            <li><b>Exercises Cards</b>
                <ul>
                    <li>These cards show up directly below the selected calendar day. Each card provides information as well as fields to log your sets</li>
                </ul>
            </li>
        </ol>
        </>
    ),
    placement: 'center' as const,
    disableBeacon: true,
  },
  {
    disableBeacon: true,
    disableOverlayClose: true,
    hideCloseButton: true,
    hideFooter: true,
    spotlightClicks: true,
    styles: {
        options: {
            zIndex: 10000,
        },
    },
    target: '#workout_0',
    content: "To get started, select your workout. The first day is a good place to start our program",
    placement: 'top' as const,
  },
  {
    disableOverlayClose: true,
    target: '.day.current',
    content: 'Once selected, your exercises for the day will populate below',
    placement: 'bottom' as const,
  },
  {
    disableBeacon: true,
    disableOverlayClose: true,
    spotlightClicks: true,
    hideCloseButton: true,
    hideFooter: false,
    target: 'div:has(.drag-handle):first-child',
    content: 'Expand the card to view it',
    placement: 'top-end' as const,
    styles: {
        options: {
            zIndex: 10000,
        },
    },
  },
  {
    disableOverlayClose: true,
    target: 'div:has(.drag-handle):first-child .drag-handle',
    content: 'Once an exercise has been completed, you can drag it off the screen to save the sets',
    placement: 'top-end' as const,
    styles: {
        options: {
            zIndex: 10000,
        },
    },
  },
  {
    disableOverlayClose: true,
    target: 'header label:nth-child(4)',
    content: "Do not forget to occasionally back up your data to your Google Spreadsheet for safe keeping",
    placement: 'right' as const,
  },
  {
    disableOverlayClose: true,
    target: 'body',
    content: (
        <p>That concludes the tour.<br/>May your gains be great!</p>
    ),
    placement: 'center' as const,
  },
]

const demoWorkoutDays: Array<Workout> = [
    {
        key: 0,
        day:"Shoulders Day",
        complete:false,
        exercises:[
            {
                primary : "Pushups",
                sub1 : "Substitute Exercise #2",
                sub2 : "Substitute Exercise #2",
                lastSetTech : "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                warmupSets : "1-2",
                workingSets : 3,
                repRange : "12,10,8",
                rowOrigin : 10000,
                recordedSets : [null,null,null,null],
                earlySetRpe : "~7-8",
                lastSetRpe : "~8-9",
                rest : "~2-3 min",
                notes : "Duis nulla justo, elementum sit amet elementum sit amet, rhoncus a nibh. Nunc pretium purus et ipsum lacinia viverra",
                primary_vid : "https ://www.youtube.com/watch?v=dQw4w9WgXcQ",
                sub1_vid : "",
                sub2_vid : ""
            },
            {
                primary : "Backflips",
                sub1 : "Substitute Exercise #2",
                sub2 : "Substitute Exercise #2",
                lastSetTech : "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                warmupSets : "1-2",
                workingSets : 3,
                repRange : "12,10,8",
                rowOrigin : 10000,
                recordedSets : [null,null,null,null],
                earlySetRpe : "~8-9",
                lastSetRpe : "10",
                rest : "~1-2 min",
                notes : "Duis nulla justo, elementum sit amet elementum sit amet, rhoncus a nibh. Nunc pretium purus et ipsum lacinia viverra",
                primary_vid : "https ://www.youtube.com/watch?v=dQw4w9WgXcQ",
                sub1_vid : "",
                sub2_vid : ""
            }
        ]
    },
    {
        key: 1,
        day:"Knees Day",
        complete:false,
        exercises:[
            {
                primary : "Car Flips",
                sub1 : "Substitute Exercise #2",
                sub2 : "Substitute Exercise #2",
                lastSetTech : "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                warmupSets : "1-2",
                workingSets : 3,
                repRange : "12,10,8",
                rowOrigin : 10000,
                recordedSets : [null,null,null,null],
                earlySetRpe : "~7-8",
                lastSetRpe : "~8-9",
                rest : "~2-3 min",
                notes : "Duis nulla justo, elementum sit amet elementum sit amet, rhoncus a nibh. Nunc pretium purus et ipsum lacinia viverra",
                primary_vid : "https ://www.youtube.com/watch?v=dQw4w9WgXcQ",
                sub1_vid : "",
                sub2_vid : ""
            },
            {
                primary : "Knee Crushers",
                sub1 : "Substitute Exercise #2",
                sub2 : "Substitute Exercise #2",
                lastSetTech : "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                warmupSets : "1-2",
                workingSets : 3,
                repRange : "12,10,8",
                rowOrigin : 10000,
                recordedSets : [null,null,null,null],
                earlySetRpe : "~8-9",
                lastSetRpe : "10",
                rest : "~1-2 min",
                notes : "Duis nulla justo, elementum sit amet elementum sit amet, rhoncus a nibh. Nunc pretium purus et ipsum lacinia viverra",
                primary_vid : "https ://www.youtube.com/watch?v=dQw4w9WgXcQ",
                sub1_vid : "",
                sub2_vid : ""
            }
        ]
    },
    {
        key: 2,
        day:"Toes Day",
        complete:false,
        exercises:[
            {
                primary : "Big Toe Press",
                sub1 : "Substitute Exercise #2",
                sub2 : "Substitute Exercise #2",
                lastSetTech : "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                warmupSets : "1-2",
                workingSets : 3,
                repRange : "12,10,8",
                rowOrigin : 10000,
                recordedSets : [null,null,null,null],
                earlySetRpe : "~7-8",
                lastSetRpe : "~8-9",
                rest : "~2-3 min",
                notes : "Duis nulla justo, elementum sit amet elementum sit amet, rhoncus a nibh. Nunc pretium purus et ipsum lacinia viverra",
                primary_vid : "https ://www.youtube.com/watch?v=dQw4w9WgXcQ",
                sub1_vid : "",
                sub2_vid : ""
            },
            {
                primary : "Pinky Toe Curl",
                sub1 : "Substitute Exercise #2",
                sub2 : "Substitute Exercise #2",
                lastSetTech : "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
                warmupSets : "1-2",
                workingSets : 3,
                repRange : "12,10,8",
                rowOrigin : 10000,
                recordedSets : [null,null,null,null],
                earlySetRpe : "~8-9",
                lastSetRpe : "10",
                rest : "~1-2 min",
                notes : "Duis nulla justo, elementum sit amet elementum sit amet, rhoncus a nibh. Nunc pretium purus et ipsum lacinia viverra",
                primary_vid : "https ://www.youtube.com/watch?v=dQw4w9WgXcQ",
                sub1_vid : "",
                sub2_vid : ""
            }
        ]
    },
    {
        key: 3,
        day:"Rest Day",
        complete:false,
        exercises:[]
    }
]

interface WeakPoint {
    point: string;
    exercises: Array<string | [string, string]>;
    info: Array<string>;
}

interface Workout {
    day: string;
    complete: boolean;
    exercises: Array<any>;
    key: number;
}

interface sheetData {
    warmUps: Object;     
    weakPoints: WeakPoint[] | null;    
    workoutDays: Array<Workout>;     
}

export default function Planner(){
    const router = useRouter();
    const [initializing, isInitializing] = useState<boolean>(true);
    const [workoutDays, setWorkoutDays] = useState<Array<Workout> | null>(null);
    const [warmUps, setWarmUps] = useState<Object | null>(null);
    const [weakPoints, setWeakPoints] = useState<WeakPoint[] | null>(null);
    const [weakPointSelection, setWeakPointSelection] = useState<Array<string> | null>(null);
    
    const [currentDay, setCurrentDay] = useState<Workout | null>(null);
    const currentDayRef = useRef<HTMLElement | null>(null);
    const [hash, setHash] = useState('');
    const [showWarmups, setShowWarmups] = useState<Boolean>(false);

    const [firstTime, setFirstTime] = useState<boolean>(false);
    const [run, setRun] = useState(false);
    const [stepIndex, setStepIndex] = useState(0);

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { action, index, status, type } = data;
        console.log(action, index, status,type);
    
        if (status == 'finished') {
          window.localStorage.setItem('demoPlannerComplete','1');
        }
    
        if (type === EVENTS.STEP_AFTER || type === EVENTS.TARGET_NOT_FOUND) {
            console.log(EVENTS);
          // Update state to advance the tour
          setStepIndex(index + (action === ACTIONS.PREV ? -1 : 1));
        } else if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
          // You need to set our running state to false, so we can restart if we click start again.
          setRun(false);
        }
    
      };

    //assign sheetData to component state variables
    const assignWorkoutData = (sheetData: sheetData) => {
        if(sheetData?.workoutDays){
            const processedWorkoutDays = processWorkoutDays(sheetData.workoutDays);
            setWorkoutDays(processedWorkoutDays);
        }
        if(sheetData?.warmUps){
            setWarmUps(sheetData.warmUps);
        }
        if(sheetData?.weakPoints){
            setWeakPoints(sheetData.weakPoints);
        }
        isInitializing(false);
    }

    useEffect(() => {
        const handleHashChange = () => {
          setHash(window.location.hash);
        };

        handleHashChange();
        window.addEventListener('hashchange', handleHashChange);
        return () => {
          window.removeEventListener('hashchange', handleHashChange);
        };
      }, [router]);
    
    // Look for saved sheetData; else go back to home;
    useEffect(() => {
        if(typeof window !== 'undefined' && (!workoutDays && !warmUps && !weakPoints)){
            isLoading(false);
            const demo = window.localStorage.getItem('demoPlannerComplete');
            if (demo != "1") {
                //Play onboarding?
                console.log("play onboarding");
                if(workoutDays == null){
                    setWorkoutDays(demoWorkoutDays);
                }
                setFirstTime(true);
                setRun(true);
            } else {
                setFirstTime(false);


                //Loading workout plan
                const sheetDataString = window.localStorage.getItem('sheetData');
                let sheetData: sheetData;
                if (sheetDataString) {
                    sheetData = JSON.parse(sheetDataString);
                    assignWorkoutData(sheetData);
                }
                if(!sheetDataString && !workoutDays) {
                    console.log(workoutDays);
                    popup("Error: No sheet data detected. <br/> Return to the home page and login",true);
                    return
                }
        
            }     
        }

    }, []);

    useEffect(()=>{
        if(weakPointSelection && currentDay && workoutDays){
            const updatedDay = saveWeakPointsToDay(weakPointSelection, currentDay);
            updateWorkoutDay(updatedDay);
        }
    },[weakPointSelection])

    useEffect(() => {
        if(firstTime && currentDay){
            setStepIndex(prevStep => prevStep + 1);
        }
        if(currentDay){
            if(!currentDay?.complete){
                setShowWarmups(true);
            } else {
                setShowWarmups(false);
            }
        }
        if(currentDayRef.current){
            console.log(currentDay);
            currentDayRef.current.scrollIntoView();
        }
    }, [currentDay]);

    useEffect(()=>{
        //Everytime workoutDay changes, save changes to local Storage
        if(workoutDays != null && !initializing){
            saveStatetoLocalStorage(workoutDays);
        }
        
        //If no currentDay set, find one
        //Don't run when demo is happening
        if(workoutDays != null && currentDay == null && !run){
            const foundDay = findCurrentDay(hash, workoutDays)
            setCurrentDay(foundDay);
        }
    },[workoutDays])

    //save changed day to workouts/planner array
    const updateWorkoutDay = (day: Workout) =>{
        setWorkoutDays(prevWorkoutDays => {
            if (!prevWorkoutDays) {
                return null;
            }
            const newWorkoutDays = [...prevWorkoutDays];
            newWorkoutDays[day.key] = day;
            return newWorkoutDays;
        });
    }

    //Save weakpoint/exercise selections to day
    const saveWeakPointsToDay = (points: Array<string | Array<string>>, day: Workout) =>{
        let tempCurrentDay = day;
        const updatedExercises = tempCurrentDay.exercises.map(exercise =>{
            if (exercise.primary.toLowerCase().includes("weak point") && exercise.sub1 === exercise.sub2) {
                const weakPoint = points.pop();
                if(Array.isArray(weakPoint)) {
                    exercise.primary = weakPoint[0];
                    exercise.primary_vid = weakPoint[1];
                } else {
                    exercise.primary = weakPoint;
                }
                exercise.sub1 = null;
                exercise.sub2 = null;
            }
            return exercise;
        });
        tempCurrentDay.exercises = updatedExercises;
        return tempCurrentDay
    }

    // Save exercise reps/lbs to day
    const saveRepsToExercise = (reps: Array<number>, lbs: Array<number>, rowI: number, day: Workout | null = currentDay) => {
        const key = day?.key;
        if(typeof key == "undefined" || !workoutDays){
            popup("Error: Unable to save exercise due to invalid key or workoutDays",true);
            return
        }
        let tempWorkDays = workoutDays;
        const recordedSets = reps.map((rep, index) => `${rep} x ${lbs[index]}`);

        const dayToUpdate = tempWorkDays[key];
        if (dayToUpdate) {
            let lastExercise_updated_key;
            dayToUpdate.exercises = dayToUpdate.exercises.map((exercise,index) => {
                if (exercise.rowOrigin === rowI) {
                    lastExercise_updated_key = index;
                    return { ...exercise, recordedSets: recordedSets };
                }
                return exercise;
            });
            updateWorkoutDay(dayToUpdate);
            if(lastExercise_updated_key === (dayToUpdate.exercises.length - 1)){
                dayToUpdate.complete = true;
                popup("Workout complete. Enjoy today!");
            } else {
                popup("Exercise successfuly saved");
            }
        } else {
            popup("Error: Unable to save exercise",true);
        }
    }

    
    return(
        <div className={styles.planner}>
            {firstTime && (
              <Joyride
                run={run}
                steps={steps}
                stepIndex={stepIndex}
                callback={handleJoyrideCallback}
                continuous={true}
                disableScrollParentFix={true}
              />
            )}
            <Calendar workoutDays={workoutDays} setCurrentDay={setCurrentDay} currentDay={currentDay} currentDayRef={currentDayRef}/>
            <div className={styles.exercises}>
                { currentDay 
                    ? currentDay?.exercises.length != 0 
                            ?   
                                currentDay.exercises.map((exercise, index) => {
                                    if(index == 0 && !currentDay.complete){
                                        return (
                                            <Fragment key={currentDay.day + '-fragment'}>
                                                <Warmups key={currentDay.day+'warmup'} warmUps={warmUps} showWarmups={showWarmups}/>
                                                <Exercise key={(exercise.rowOrigin) ? exercise.rowOrigin + exercise.primary : index + exercise.primary} saveExercise={saveRepsToExercise} exercise={exercise}/>
                                            </Fragment>
                                        )
                                    }
                                    return (
                                        <Exercise key={(exercise.rowOrigin) ? exercise.rowOrigin + exercise.primary : index + exercise.primary} saveExercise={saveRepsToExercise} exercise={exercise}/>
                                    )
                                })
                            : (
                                <Blank key={currentDay.day} currentDay={currentDay} setCurrentDay={setCurrentDay} updateWorkoutDay={updateWorkoutDay}/>
                            ) 
                    : ''
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
    currentDay: Workout | null;
    weakPoints: WeakPoint[] | null;
    styles: { [key: string]: string }; 
    setWeakPointSelection: any;
}

function WeakPoints({ styles, currentDay, weakPoints, setWeakPointSelection }: WeakPointsProps) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [selectedWeakPoint, setSelectedWeakPoint] = useState<WeakPoint | null>(null);
    const [selectedExerciseList, setSelectedExerciseList] = useState<Array<string | string[]>>([]);

    useEffect(() => {
        if (currentDay && currentDay?.exercises && dialogRef.current) {
            currentDay.exercises.forEach((ex: any) => {
                if (ex.primary.toLowerCase().includes("weak point") && ex.sub1 === ex.sub2) {
                    if(dialogRef.current){
                        dialogRef.current.show();
                    }
                }
            });
        } 
    }, [currentDay]);

    const handleWeakPointChange = (selectedPoint: string) => {
        if (!selectedPoint || !weakPoints) {
            return;
        }
        const weakPoint = weakPoints.find(point => point.point === selectedPoint);
        if(weakPoint){
            setSelectedWeakPoint(weakPoint);
        }
    };

    const handleExerciseSelect = (exercise: Array<string> | string) => {
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
            if(dialogRef.current){
                dialogRef.current.close();
            }
            // Handle the selected exercises (e.g., save to state or API)
        } else {
            alert("Please select exactly two exercises.");
        }
    };

    if (!weakPoints || !currentDay) {
        return null;
    }

    return (
        <dialog className={styles.dialog} ref={dialogRef}>
            <div className="wrapper">
                <button onClick={()=>{
                    if(dialogRef.current){
                        dialogRef.current.close()
                    }
                }}>X</button>
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

function processWorkoutDays(workoutDays: Array<Workout>): Array<Workout>{
    const updatedWorkoutDays = [...workoutDays];

    for (let i = 1; i < updatedWorkoutDays.length - 1; i++) {
        const prevDay = updatedWorkoutDays[i - 1];
        const currentDay = updatedWorkoutDays[i];
        const nextDay = updatedWorkoutDays[i + 1];
        if (!currentDay.complete && prevDay.complete && nextDay.complete && currentDay.exercises.length == 0) {
            updatedWorkoutDays[i].complete = true;
        }
    }

    return updatedWorkoutDays;
}

function saveStatetoLocalStorage(workoutDays: Array<Workout>): void{
    const sheetDataString = window.localStorage.getItem('sheetData');
    if (sheetDataString) {
        const sheetData: sheetData = JSON.parse(sheetDataString);
        const localWorkoutDays = sheetData.workoutDays;
        sheetData.workoutDays = workoutDays;
        window.localStorage.setItem('sheetData',JSON.stringify(sheetData));
        return;
    }
    alert("Error: No local sheet found in memory?");
}

function findCurrentDay(hash: string,workoutDays: Array<Workout>): Workout | null{
    console.log('findCurrentDay');
    const dayFromUrl: RegExpMatchArray | null = hash.match(/\d+/);
    if (dayFromUrl) {
        console.log('dayFromUrl',dayFromUrl)
        const dayIndex: number = parseInt(dayFromUrl[0], 10); // Convert the string to a number
        if (!isNaN(dayIndex) && dayIndex >= 0 && dayIndex < workoutDays.length) { // Ensure it's a valid index
            console.log('dayFromUrl',workoutDays[dayIndex],dayIndex,hash);
            if (!workoutDays[dayIndex].complete){
                return workoutDays[dayIndex];
            } else {
                return findCurrentDay('',workoutDays);
            }
        }
    } else {
        console.log('find currentDay');
        for (let i = 0; i < workoutDays.length; i++) {
            const workout: Workout = workoutDays[i];
            if (!workout.complete) {
                const nextWorkout: Workout =  workoutDays[i+1];
                //check to see if its a rest day
                if(workout.exercises.length == 0 && nextWorkout.complete){
                    continue
                }
                return workout;
            }
        }
    }
    return null
}