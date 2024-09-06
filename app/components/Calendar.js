'use client'
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from './calendar.module.scss';

export function Calendar({workoutDays, setCurrentDay, currentDay}){
    const router = useRouter();
    const calRef = useRef(null)

    if(workoutDays == null){
        return (
            <p style={{padding:'20px'}}>
                Loading...
            </p>
        );
    }

    const selectDay = (index,key) => {
        console.log('selectDay',index,key);
        if(index !== key){
            alert("Something went very wrong");
        }
        router.push('#workout_'+key);
        setCurrentDay(workoutDays[index]);
    }
    
    return(
        <div className={styles.calendar} ref={calRef}>
            {workoutDays.map((day,index)=>{
                const text = (day.day) ? day.day : day;
                return (
                    <button 
                        key={day.key} 
                        data-complete={day?.complete}
                        onClick={()=>{selectDay(index,day.key);}} 
                        className={(day == currentDay) ? `day current` : `day`}
                        id={'workout_'+day.key}
                    >
                        {text}
                    </button>
                )
            })}
        </div>
    )
}