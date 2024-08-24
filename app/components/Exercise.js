'use client'
import { useEffect, useState} from 'react';
import styles from './exercise.module.scss';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { VidIcon } from './VidIcon';
import axios from 'axios';

export function Exercise({exercise}){
    const restMinMax = parseTimeRange(exercise.rest);
    const defaultDuration = restMinMax.min/2 + restMinMax.max/2;
    
    const [key, resetTimer] = useState(0);
    const [timerState, setTimerState] = useState(false);
    const [timerDuration, setTimerDuration] = useState(null);

    const [reps, setReps] = useState([]);
    const [lbs, setLbs] = useState([]);
    
    useEffect(()=>{
        console.log('useEffect exercise',exercise);
    },[]);

    useEffect(()=>{
        console.log(reps,lbs);
    },[reps,lbs]);

    const saveExercise = async () =>{
        const savedCreds = window.localStorage.getItem("ga_credentials");
        const sheetUrl = window.localStorage.getItem("sheetUrl");
        if(savedCreds && sheetUrl){
            const credentials = await axios.get(`/api/fetchAuth`, { 
                params: {
                    savedCredentials : savedCreds,
                  }
                }).then((res)=>{
                  return res.data.credentials;
                }).catch((err)=>{
                  console.log('Failed to use saved creds',err,err.response.data?.auth_url);
                  if(err.response.status == 307){
                    // router.replace(err.response.data?.auth_url);
                  }
                });
            if(credentials){
                axios.post(`/api/saveExercise`, { credentials
                    }).then((res)=>{
                        console.log(res);
                        alert("Saved exercise!");
                    }).catch((err)=>{
                        console.log(err);
                        alert("Error: Unable to save exercise");
                    });
            } else {
                alert("Error: No OAuth2 credentials found");
            }
        } else {
            alert("Error: Could not save exercise as either credentials or sheet url are not saved");
        }
    }

    if(!exercise){
        return null
    }

    return(
        <div className={styles.card}>
            <button style={{flexBasis: '100%',height:'50px'}} onClick={()=>saveExercise()}>Save this exercise</button>
            <Movements exercise={exercise} />
            <div className="rest-time">
                {exercise.rest}
                {restMinMax && (
                    <>
                    <input 
                        onChange={(e) => setTimerDuration(e.target.value)} 
                        type="range" 
                        id="timer" name="timer" 
                        min={restMinMax.min} max={restMinMax.max} 
                        step={0.1}
                    ></input>
                    <button onClick={()=>{ setTimerState(true) }}>Start Timer</button>
                    </>
                )}
            </div>
            <div className="timer-wrapper" hidden={!timerState}>
                <CountdownCircleTimer
                    key={key}
                    isPlaying={timerState}
                    duration={timerDuration ? timerDuration : defaultDuration}
                    colors={'#228ded'}
                >
                    {renderTime}
                </CountdownCircleTimer>
                <button onClick={()=>{
                    setTimerState(false);
                    resetTimer(prevKey => prevKey + 1);
                }}>X</button>
            </div>
            <div className="notes">
                <b>Notes:</b> {exercise.notes}
            </div>
            <Table 
                exercise={exercise}
                reps={reps}
                setReps={setReps}
                lbs={lbs}
                setLbs={setLbs} 
            />
        </div>
    )
}

const Table = ({ exercise, reps, setReps, lbs, setLbs }) => {
    console.log("Table loaded");
    const colorScale = {
        5.0:"#00FF00",
        5.5:"#1AE600",
        6.0:"#33CC00",
        6.5:"#4DB300",
        7.0:"#669900",
        7.5:"#808000",
        8.0:"#996600",
        8.5:"#B34D00",
        9.0:"#CC3300",
        9.5:"#E61A00",
        10:"#FF0000"
    };
    const colorLegend = Object.entries(colorScale).sort(([a], [b]) => parseFloat(a) - parseFloat(b));
    let earlyRPEColor = convertRPEtoNum(exercise.earlySetRpe);
    earlyRPEColor = colorScale?.[earlyRPEColor];
    let lateRPEColor = convertRPEtoNum(exercise.lateSetRpe);
    lateRPEColor = colorScale?.[lateRPEColor];
    const lastSet_i = exercise.workingSets - 1;



    const handleInput = (i,value,type) => {
        console.log("handleInput");
        let tempData;
        if(type == 'reps'){
            //Reps
            tempData = reps;
            tempData[i] = value;
            setReps(tempData);
        } else {
            //Lbs
            tempData = lbs;
            tempData[i] = value;
            setLbs(tempData);
        }
        console.log(reps,lbs)
    }


    return (
        <div className="pseudo_table">
            <div className="cell warmup">
                <span>Warm-up Sets</span>
                <p>{exercise.warmupSets}</p>
            </div>
            {Array.from({ length: exercise.workingSets }, (_, i) => {
                let savedReps = (exercise?.recordedSets[i]) ? exercise?.recordedSets[i].split('x') : null;
                savedReps = (savedReps) ? savedReps[0]: exercise?.recordedSets[i];
                return (
                    <div 
                        className="cell set"
                        key={i} 
                        style={{backgroundColor: ((i == lastSet_i) ? 'red' : 'orange')}}
                    >
                        <span>Set #{i + 1}</span>
                        {savedReps 
                            ?
                            <label>
                                <p>Reps/Lbs (Target:{exercise.repRange})</p>
                                <input 
                                    disabled={true}
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    value={savedReps} 
                                />
                            </label>
                            : 
                            <>
                            <label>
                                <p>Reps ({exercise.repRange})</p>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    defaultValue={0} 
                                    onChange={(e)=>handleInput(i,e.target.value,'reps')}
                                />
                            </label>
                            <label>
                                <p>Lbs</p>
                                <input 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    defaultValue={0}
                                    onChange={(e)=>handleInput(i,e.target.value,'lbs')}
                                />
                            </label>
                            </>
                        }
                    </div>
                 )
            })}
            <div 
                className="cell last-set-tech" 
                style={{backgroundColor: lateRPEColor}}
            >
                <b>Last Set Tech:</b> {exercise.lastSetTech}
            </div>
            <div className="cell color-legend">
                <p>RPE Scale</p>
                {colorLegend.map(([value, color]) => (
                    <div key={value} className="number" style={{ backgroundColor: color }}>
                        {value}
                    </div>
                ))}
            </div>
        </div>
    )
}

const Movements = ({exercise}) => {
    const [selectedMove, setSelectedMove] = useState(0);
    const movement_keys = ['primary', 'sub1', 'sub2'];
    const movements = movement_keys.map((prop) =>{
                    const movement = exercise?.[prop]; // Dynamically access the property
                    const video = exercise?.[prop + '_vid']; // Access another property like movements
                    return (movement && video) ? [movement, video] : false;
                })
                .filter(Boolean);
    
    return (
        <div className={'movements'}>
            {movements.map((movement, index)=>(
                <div key={index} className={'move'}  data-selected={selectedMove == index ? true : false}>
                    <h3 >
                        {movement[0]}
                        <a className={'link'} target="_blank" rel="nofollow" href={movement[1]}>
                            <VidIcon />
                        </a>
                    </h3>
                </div>
            ))}
            <div className={'selectors'}>
                {movements.map((_, index)=>(
                    <button key={index} onClick={()=>{setSelectedMove(index)}}>{index+1}</button>
                ))}
            </div>
        </div>
    )
}

function parseTimeRange(timeStr) {
    const cleanedStr = timeStr.replace(/~|\s|min/g, '');
    const [min, max] = cleanedStr.split('-').map(Number);
    if (isNaN(min) || isNaN(max)) {
        return null;
    }
    return { min: min * 60, max: max * 60 };
}

const renderTime = ({ remainingTime }) => {
    if (remainingTime === 0) {
        return <div className="timer">Too late...</div>;
    }

    // Calculate minutes and seconds
    const {minutes, seconds } = convertTime(remainingTime);

    return (
        <div className="count">
            <div className="value">
                {minutes > 0 ? `${minutes} min ` : ""}{seconds} sec
            </div>
        </div>
    );
  };

const convertTime = (rawSecs) => {
    const minutes = Math.floor(rawSecs / 60);
    const seconds = rawSecs % 60;
    return { minutes, seconds}
}

function convertRPEtoNum(value) {
    console.log('convertRPEtoNum',value);
    if(!value){
        return
    }
    value = value.replace('~', '');
    if (value.includes('-')) {
        const [min, max] = value.split('-').map(Number);
        return (min + max) / 2;
    } else {
        return parseFloat(value);
    }
}

// function generateColorScale() {
//     const startColor = [0, 255, 0];
//     const endColor = [255, 0, 0];  
//     const steps = 10; 
//     const colorScale = {};
//     for (let i = 0; i <= steps; i++) {
//         const t = i / steps;
//         const r = Math.round(startColor[0] + t * (endColor[0] - startColor[0]));
//         const g = Math.round(startColor[1] + t * (endColor[1] - startColor[1]));
//         const b = Math.round(startColor[2] + t * (endColor[2] - startColor[2]));

//         const hexColor = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
//         const value = 5 + i * 0.5;

//         colorScale[value.toFixed(1)] = hexColor;
//     }
//     return colorScale;
// }

