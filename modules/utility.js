//FUNCTIONS CALLED IN MULTIPLE FUNCTIONS TO FIX SOMETHING // REUSABLE FUNCTIONS

export function togglePopUpWindow(domEl){
    domEl.classList.remove("hidden");
    domEl.querySelector(".closeIcon").addEventListener("click", ()=> {
    domEl.classList.add("hidden");
    }) 
  }
  
export function addClassForEach(elements, className) {
    elements.forEach(element => element.classList.add(className));
  }
  
export function removeClassForEach(elements, className) {
    elements.forEach(element => element.classList.remove(className));
  }

export function makeUpperCase(item){
    const fixedItem = item.charAt(0).toUpperCase() + item.slice(1);
    return fixedItem;
  }
  
export function getSum(elements){
    //takes array to calculate sum
    const reducer = (accumulator, curr) => accumulator + curr;
    return elements.reduce(reducer);
  }

export function checkIfHasFromDest(destinations){
    return destinations.some(e => e.isFromLocation === true)
  }