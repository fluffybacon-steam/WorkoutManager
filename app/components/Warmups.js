import { useState, useEffect} from 'react';
import { VidIcon } from './VidIcon.js';
import styles from './warmups.module.scss'

export function Warmups({warmUps, showWarmups}) {
    if(!warmUps){
        return null;
    }

    return(
        <div className={showWarmups ? `${styles.wrapper} ${styles.visible}` : `${styles.wrapper}` }>
            <button onClick={()=>{ router.back()}}>X</button>
            <table>
                <thead>
                <tr>
                    <th scope="col">Reps/Time</th>
                    <th scope="col">Movement</th>
                </tr>
                </thead>
                <tbody>
                    {warmUps.map((warmup,index)=>{
                    return (
                        <tr key={index}>
                            <td>{warmup[0]}</td>
                            <td>
                                <span>
                                    {warmup[1]}
                                </span>
                                {warmup[2] ? 
                                    <a href={warmup[2]} rel='nofollow' target='_blank'>
                                        <VidIcon /> 
                                    </a>
                                : ''}
                            </td>
                        </tr>
                    )
                    })} 
                </tbody>
            </table> 
        </div>
    )
}