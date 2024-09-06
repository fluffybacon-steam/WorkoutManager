export function popup(message: string){
    if (typeof window === 'undefined') {
        return; // If window isn't defined, it means we are on the server, so do nothing
    }
    const popup = document.querySelector('.popup') as HTMLElement | null;
    console.log(window, document,popup);
    if(!popup){
        alert("No popup found?");
        return
    } 
    popup.innerHTML = message;
    popup.classList.add('active');
    setTimeout(()=>{
        popup.classList.remove('active');
    },5000);
} 

export function isLoading(state: Boolean){
    console.log("isLoading",state);
    if (typeof window === 'undefined') {
        return; // If window isn't defined, it means we are on the server, so do nothing
    }
    const loader = document.querySelector('#loader') as HTMLElement | null;
    console.log(window,loader);
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