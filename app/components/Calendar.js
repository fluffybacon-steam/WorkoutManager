'use client'
import { useState, useRef } from 'react';

export function Calendar({styles, workoutDays, setCurrentDay, currentDay}){
    const calRef = useRef(null)
    if(workoutDays == null){
        return 'Loading...';
    }

    const selectDay = (index) => {
        console.log('selectDay');
        setCurrentDay(workoutDays[index]);
    }

    return(
        <div className={styles.calendar} ref={calRef}>
            {workoutDays.map((day,index)=>{
                const text = (day.day) ? day.day : day;
                return (
                    <button 
                        key={index} 
                        data-complete={day?.complete}
                        onClick={()=>{selectDay(index);}} 
                        className={(day == currentDay) ? `day current` : `day`}
                    >
                        {text}
                    </button>
                )
            })}
        </div>
    )
}