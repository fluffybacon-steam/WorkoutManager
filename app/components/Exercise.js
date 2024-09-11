'use client'
import { useEffect, useState, useRef} from 'react';
import styles from './exercise.module.scss';
import { CountdownCircleTimer } from 'react-countdown-circle-timer';
import { VidIcon } from './VidIcon';
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import {Draggable} from "gsap/all";
gsap.registerPlugin(useGSAP);
gsap.registerPlugin(Draggable);

export function Exercise({saveExercise, exercise}){
    const cardRef = useRef();
    const { contextSafe } = useGSAP({ scope: cardRef });

    useEffect(()=>{
        if(!cardRef.current){
            return
        }
        const offset = -cardRef.current.offsetWidth;
        let animation = gsap.timeline();
        animation.to(cardRef.current,{
            opacity:0,
            left:(offset*3),
            duration:0.8
        })
        animation.to(cardRef.current,{
            height: '0px',
            margin: '0',
            zIndex: '-100',
            duration:0.5
        }, '<=0.25');
        animation.pause();
        Draggable.create(cardRef.current, {
            type: "left",
            bounds: {minX: offset, maxX: 10},
            dragResistance: 0.1,
            trigger:  cardRef.current.querySelector('.drag-handle'),
            onDrag: function(e){
                const leftPos = parseFloat(cardRef.current.style.left);
                if(leftPos <= 0.6*offset){
                    this.SlideOffScreen = true;
                }   
            },
            onDragEnd: function () {
                if(this.SlideOffScreen){
                    saveExercise(reps,lbs,exercise.rowOrigin);
                    animation.play();
                } else {
                    gsap.to(cardRef.current,{
                        left:0
                    })
                }
            },
        });

        toggleCard(cardRef);

    },[cardRef])

    const restMinMax = parseTimeRange(exercise.rest);
    let defaultDuration;
    if(restMinMax){
        defaultDuration = restMinMax.min/2 + restMinMax.max/2;
    }
    
    const [key, resetTimer] = useState(0);
    const [timerState, setTimerState] = useState(false);
    const [timerDuration, setTimerDuration] = useState(null);

    //Load in recordedSet into state variables
    const [reps, setReps] = useState(exercise.recordedSets.map((set)=>{ return (set) ? parseFloat(set.split('x')[0]) : 0}));
    const [lbs, setLbs] = useState(exercise.recordedSets.map((set)=>{ return (set && set.includes('x')) ? parseFloat(set.split('x')[1]) : 0}));


    if(!exercise){
        return null
    }

    return(
        <div className={styles.card} ref={cardRef}>
            <div className="wrapper">
                <button className="expand" onClick={()=>{toggleCard(cardRef)}}>
                    <svg className="open" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M480-80 240-320l57-57 183 183 183-183 57 57L480-80ZM298-584l-58-56 240-240 240 240-58 56-182-182-182 182Z"/></svg>
                    <svg className="close" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m296-80-56-56 240-240 240 240-56 56-184-184L296-80Zm184-504L240-824l56-56 184 184 184-184 56 56-240 240Z"/></svg>
                </button>
                <Movements exercise={exercise} />
                <div className="rest-time">
                    <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="M360-840v-80h240v80H360Zm80 440h80v-240h-80v240Zm40 320q-74 0-139.5-28.5T226-186q-49-49-77.5-114.5T120-440q0-74 28.5-139.5T226-694q49-49 114.5-77.5T480-800q62 0 119 20t107 58l56-56 56 56-56 56q38 50 58 107t20 119q0 74-28.5 139.5T734-186q-49 49-114.5 77.5T480-80Zm0-80q116 0 198-82t82-198q0-116-82-198t-198-82q-116 0-198 82t-82 198q0 116 82 198t198 82Zm0-280Z"/></svg>
                    {restMinMax && (
                        <>
                            {Array.from({ length: 3 }, (_, index) => {
                                const buttonValue = restMinMax.min + ((restMinMax.max - restMinMax.min) / 2) * index;
                                return (
                                    <button 
                                        key={index} 
                                        onClick={() => {setTimerDuration(buttonValue.toFixed(1));setTimerState(true);}}
                                    >
                                        {convertTime(buttonValue.toFixed(1),true)}
                                    </button>
                                );
                            })}
                            {/* <button onClick={() => setTimerState(true)}>Start Timer</button> */}
                        </>
                    )}
                </div>
                <div className="timer-wrapper" hidden={!timerState}>
                    <CountdownCircleTimer
                        key={key}
                        colors={'var(--firstColor)'}
                        trailColor="white"
                        isPlaying={timerState}
                        duration={timerDuration ? timerDuration : defaultDuration}
                    >
                        {renderTime}
                    </CountdownCircleTimer>
                    <button onClick={()=>{
                        setTimerState(false);
                        resetTimer(prevKey => prevKey + 1);
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="currentColor"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
                    </button>
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
            <div className="drag-handle"></div>
        </div>
    )
}

const Table = ({ exercise, reps, setReps, lbs, setLbs }) => {
    const colorScale = {
        5.0: "#00FF00", // Bright green
        5.5: "#66CC00", // A more yellowish-green
        6.0: "#CCCC00", // Yellow-green
        6.5: "#FF9900", // Yellow-orange
        7.0: "#FF6600", // Orange
        7.5: "#FF3300", // Orange-red
        8.0: "#FF0000", // Red
        //Everything above 8.0 needs to be white font, everyhting below black
        8.5: "#CC0000", // Darker red
        9.0: "#990000", // Even darker red
        9.5: "#660000", // Very dark red
        10: "#330000"  // Almost black red
    };
    const demarcation = 8;

    const colorLegend = Object.entries(colorScale).sort(([a], [b]) => parseFloat(a) - parseFloat(b));
    let earlyRPEColor_num = convertRPEtoNum(exercise.earlySetRpe);
    const earlyRPEColor = colorScale?.[earlyRPEColor_num];
    let lastRPEColor_num = convertRPEtoNum(exercise.lastSetRpe);
    const lastRPEColor = colorScale?.[lastRPEColor_num];

    const lastSet_i = exercise.workingSets - 1;

    let repsRange = exercise.repRange.split(',');
    repsRange = (repsRange.length > 1) ? repsRange : Array(exercise.workingSets).fill(exercise.repRange);

    const handleInput = (i,value,type) => {
        let tempData;
        
        if(type == 'reps'){
            //Reps
            tempData = reps;
            tempData[i] = parseFloat(value);
            setReps(tempData);
        } else {
            //Lbs
            tempData = lbs;
            tempData[i] = parseFloat(value);
            setLbs(tempData);
        }
    }


    return (
        <div className="pseudo_table">
            <div className="cell warmup">
                <p>
                    Warm-up sets: {exercise.warmupSets}
                    </p>
            </div>
            {Array.from({ length: exercise.workingSets }, (_, i) => {
                let savedReps = (exercise?.recordedSets[i]) ? exercise?.recordedSets[i].split('x').map(num => parseFloat(num)) : null;
                savedReps = (savedReps) ? savedReps : [exercise?.recordedSets[i]];
                let bg_color = (i == lastSet_i) ? lastRPEColor : earlyRPEColor;
                let ft_color = (i == lastSet_i) 
                    ? (lastRPEColor_num >= demarcation) ? 'white' : 'black'
                    : (earlyRPEColor_num >= demarcation) ? 'white' : 'black';
                return (
                    <div 
                        className="cell set"
                        key={i} 
                        style={{
                            backgroundColor: bg_color, 
                            color: ft_color
                        }}
                    >
                        {((i == exercise.workingSets - 1) 
                            ? <span className='technique'>
                                <b>Last Set Tech:</b> {exercise.lastSetTech}
                            </span>
                            : null
                        )}
                        <span>Set #{i + 1}</span>
                        <label className='rep-range'>
                            <p>Range: {repsRange[i]}</p>
                        </label>
                        <label>
                            <p>Reps</p>
                            <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                defaultValue={savedReps[0]} 
                                onChange={(e)=>handleInput(i,e.target.value,'reps')}
                            />
                        </label>
                        <label>
                            <p>Lbs</p>
                            <input 
                                type="number" 
                                min="0" 
                                max="100" 
                                defaultValue={(savedReps.length == 2) ? savedReps[1] : null}
                                onChange={(e)=>handleInput(i,e.target.value,'lbs')}
                            />
                        </label>
                    </div>
                 )
            })}
            {/* <div 
                className="cell last-set-tech" 
                style={{backgroundColor: lastRPEColor}}
            >
                <b>Last Set Tech:</b> {exercise.lastSetTech}
            </div> */}
            <div className="cell color-legend">
                <p>RPE Scale</p>
                {colorLegend.map(([value, color]) => {
                    let ft_color = (value >= demarcation) ? 'white' : 'black';
                    return (
                        <div key={value} className="number" style={{ backgroundColor: color, color: ft_color }}>
                            {value}
                        </div>
                    )}
                )}
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
                    let result = (movement && video) ? [movement, video] : [movement, null];
                    result = (result[0]) ? result : false;
                    return result
                })
                .filter(Boolean);
    if(movements.length == 0){
        return ("coming soon")
    }
    
    return (
        <div className={'movements'}>
            {movements.map((movement, index)=>(
                <div key={index} className={'move'}  data-selected={selectedMove == index ? true : false}>
                    <h3 >
                        {movement[0]}
                    </h3>
                    {movement[1] && (
                        <a className={'link'} target="_blank" rel="nofollow" href={movement[1]}>
                            <VidIcon />
                        </a>
                    )}
                </div>
            ))}
            <div className={'selectors'}>
                {movements.map((_, index)=>(
                    <button key={index} className={(selectedMove == index) ? 'active' : ''} onClick={()=>{setSelectedMove(index)}}>{index+1}</button>
                ))}
            </div>
        </div>
    )
}

/** Takes in formatted string of minutes and seconds, returns minutes and seconds as float*/ 
function parseTimeRange(timeStr) {
    const cleanedStr = timeStr.replace(/~|\s|min/g, '');
    const [min, max] = cleanedStr.split('-').map(Number);
    if (isNaN(min) || isNaN(max)) {
        return null;
    }
    return { min: min * 60, max: max * 60 };
}

const renderTime = ({ remainingTime }) => {
    // Calculate minutes and seconds
    const {minutes, seconds } = convertTime(remainingTime);

    return (
        <div className="count">
            <div hidden={remainingTime > 0} className="timer">Get back to lifting!</div>
            <div className="value">
                {minutes > 0 ? `${minutes} min ` : ""}{seconds} sec
            </div>
        </div>
    );
  };

/** Takes in seconds, returns minutes and seconds. Return as float or formatted string */ 
const convertTime = (rawSecs, stringFlag = false) => {
    const minutes = Math.floor(rawSecs / 60);
    const seconds = Math.round(rawSecs % 60);
    if(stringFlag){
        return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`
    }
    return { minutes, seconds}
}

/** Takes in RPE string, return float */
function convertRPEtoNum(value) {
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

// function collapseCard(ref){
//     if(ref?.current){
//         const card = ref.current;
//         card.setAttribute('collapsed');
//     }
// }

/**Toggle whether card is collapsed for not */
function toggleCard(ref){
    if(ref?.current){
        const card = ref.current;
        console.log("card.getAttribute('collapsed')",(card.getAttribute('collapsed')));
        if(card.hasAttribute('collapsed')){
            //Expand
            card.removeAttribute('collapsed');
        } else {
            //Collapse
            card.setAttribute('collapsed','');
        }
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

