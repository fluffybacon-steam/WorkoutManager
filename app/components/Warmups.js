import { useRef, useEffect} from 'react';
import { VidIcon } from './VidIcon.js';
import styles from './warmups.module.scss';
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import {Draggable} from "gsap/all";
gsap.registerPlugin(useGSAP);
gsap.registerPlugin(Draggable);

export function Warmups({warmUps, showWarmups}) {
    const cardRef = useRef(null);
    const { contextSafe } = useGSAP({ scope: cardRef });

    useEffect(()=>{
        if(!cardRef.current){
            return
        }
        const offset = -cardRef.current.offsetWidth;
        Draggable.create(cardRef.current, {
            type: "left",
            bounds: {minX: offset, maxX: 10},
            dragResistance: 0.1,
            trigger:  cardRef.current.querySelector('.drag-handle'),
            onDrag: function(e){
                const leftPos = parseFloat(cardRef.current.style.left);
                if(leftPos <= 0.6*offset){
                    let animation = gsap.timeline();
                    animation.to(cardRef.current,{
                        opacity:0,
                        left:(offset*3),
                        duration:0.8
                    })
                    animation.to(cardRef.current,{
                        height: '0px',
                        zIndex: '-100',
                        duration:0.5
                    }, '<=0.25');
                    animation.play();
                }   
            },
            onDragEnd: function () {
                const leftPos = parseFloat(cardRef.current.style.left);
                if(leftPos <= 0.90*offset){
                    let animation = gsap.timeline();
                    animation.to(cardRef.current,{
                        opacity:0,
                        left:(offset*3),
                        duration:0.8
                    })
                    animation.to(cardRef.current,{
                        height: '0px',
                        zIndex: '-100',
                        duration:0.5
                    }, '<=0.25');
                    animation.play();
                } else {
                    gsap.to(cardRef.current,{
                        left:0
                    })
                }
            },
        });

    },[cardRef])

    if(!warmUps){
        return null;
    }

    return(
        <div className={showWarmups ? `${styles.wrapper} ${styles.visible}` : `${styles.wrapper}` } ref={cardRef}>
            <table>
                <thead>
                <tr>
                    <th scope="col">Set</th>
                    <th scope="col">Motion</th>
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
            <div className="drag-handle"></div>
        </div>
    )
}