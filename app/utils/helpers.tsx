export function popup(message: string, error: boolean = false){
    if (typeof window === 'undefined') {
        return; // If window isn't defined, it means we are on the server, so do nothing
    }
    const popup = document.querySelector('.popup') as HTMLElement | null;
    if(!popup){
        alert("No popup found?");
        return
    } 
    popup.innerHTML = message;
    popup.classList.add('active');
    if(error){
        popup.style.setProperty("--accentColor",'red');
    } else {
        popup.style.setProperty("--accentColor",'');
    }
    setTimeout(()=>{
        popup.classList.remove('active');
    },5000);
} 

export function isLoading(state: Boolean){
    if (typeof window === 'undefined') {
        return; // If window isn't defined, it means we are on the server, so do nothing
    }
    const loader = document.querySelector('#loader') as HTMLElement | null;
    if(!loader){
        alert("No popup found?");
        return
    } 
    if(state){
        loader.style.display = '';
    } else {
        loader.style.display = 'none';
    }
} 