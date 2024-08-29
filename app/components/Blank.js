'use client'
const styles = {
    "--bkg" :'var(--primary)',
    "--border-radius": '10px',
    "--inputWidth": '100px',
    "--tableGap": '5px',
    background: 'var(--bkg)',
    border: '1px solid white',
    borderRadius: 'var(--border-radius)',
    padding: '20px',
    marginBottom: '20px',
    gap: '15px',
    display: 'flex',
    flexWrap: 'wrap',
    position: 'relative',
    textAlign: 'center',
    justifyContent: 'center'
};

export function Blank({currentDay}){
    console.log(currentDay);
    return(
        <div style={styles}>{currentDay}</div>
    )
}