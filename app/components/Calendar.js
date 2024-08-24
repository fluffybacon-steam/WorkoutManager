'use client'
import { useState } from 'react';

export function Calendar({styles, workoutDays, setCurrentDay, currentDay}){
    console.log("rendered Calendar",workoutDays);
    if(workoutDays == null){
        return 'Loading...';
    }

    const selectDay = (index) => {
        console.log('selectDay');
        setCurrentDay(workoutDays[index]);
    }

    return(
        <div className={styles.calendar}>
            {workoutDays.map((day,index)=>{
                return (
                    <button key={index} 
                    onClick={()=>{selectDay(index);}} 
                    className={(currentDay == day) ? `${styles.day} ${styles.current}` : `${styles.day}`}>
                        {day.day}
                    </button>
                )
            })}
        </div>
    )
}