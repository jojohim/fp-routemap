import './styles.scss';

window.addEventListener("DOMContentLoaded", start);

let globalDestinations = [];
let globalFilteredDest = [];

// Search Input
const searchInput = document.getElementById("searchbar");

//Settings for filtering and sorting 

let settings = {
  searchQuery: ""
}

async function start(){
  const destinationsURL = "https://routemap-fa64.restdb.io/rest/destinations";
  let destResponseArray = await getDestinations(destinationsURL);
  handleDest(destResponseArray);
  displayDestList(globalDestinations);
  setEventListeners();
}

///////COLLECT SORTED / FILTERED LISTS

function buildList(){
  globalFilteredDest = filterDestBySearch(globalDestinations);
  displayDestList(globalFilteredDest);
}


function setEventListeners(){
  //SEARCH INPUT EL
  searchInput.addEventListener("keyup", checkSearch);
  //DESTINATION CLICKED EL
  document.querySelector(".destName").addEventListener("click", checkDest)

}

function checkDest(event){
console.log(event)
}

function checkSearch(){
  settings.searchQuery = searchInput.value;
  buildList();
}

function filterDestBySearch(destinations) {
  return destinations.filter(function(destination) {
    return (
      destination.airport.toLowerCase().includes(settings.searchQuery.toLowerCase())
    );
});
}
//HEADER FOR DESTINATION DATA
const apiKey = "61a623ce81b6874e24b2ea01";

const destinationsHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "x-apikey": apiKey,
    "cache-control": "no-cache"
};

//GET DESTINATIONS DATA

async function getDestinations(destinationsURL) {
  const response = await fetch(destinationsURL, {
      method: "get",
      headers: destinationsHeaders,
  });
  const destinationsData = await response.json();
  return destinationsData;
}

//HANDLE DESTINATIONS
function handleDest(destResponseArray){
  destResponseArray.forEach(destination =>{
    const destinationObject = getItems(destination);
    globalDestinations.push(destinationObject);
  });
}

function getItems(destination){

return{
  airport: destination.airport,
  code: destination.code,
  country: destination.country,
  type: destination.type,
  isFromLocation: false,
  isToLocation: false,
}
}

function displayDestList(destinations){
  document.querySelector("ul#destList").innerHTML = "";
  destinations.forEach(displayDest);
}

function displayDest(destination){
 const copy = document.querySelector("template#destTemplate").content.cloneNode(true);
 copy.querySelector("[data-field=airport]").textContent = `${destination.airport}` ;
 document.querySelector("ul#destList").appendChild(copy);

}
