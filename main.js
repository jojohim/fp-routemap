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

function setEventListeners(){
  //SEARCH INPUT EL
  searchInput.addEventListener("keyup", checkSearch);
}

///////COLLECT SORTED / FILTERED LISTS

function buildList(){
  globalFilteredDest = filterByDestinationClicked(globalDestinations);
  globalFilteredDest = filterDestBySearch(globalFilteredDest);
  displayDestList(globalFilteredDest);
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
 copy.querySelector("[data-field=airport]").addEventListener("click", function(){
   clickDestination(destination);
 })

 document.querySelector("ul#destList").appendChild(copy);
}

function clickDestination(destination){
  console.log(destination);
  //IF globalFilteredDest array DOES NOT include isFromLocation = true THEN: 
    //set from location to true 
    destination.isFromLocation = true;
    //unhide departFrom article
    document.getElementById("departFrom").style.display = 'block';
    //set textContent of h1 to 'depart from <destination.airport + (destination.code)>
    document.querySelector("#departFrom h1").textContent = `Depart from ${destination.airport} (${destination.code})`;
    //build list 
    buildList();
  //IF A DESTINATION ALREADY HAS isFromLocation THEN / ELSE
    //set to location to true 
    //initialise result screen
}

function filterByDestinationClicked(destinations){
  const fromLocation = destinations.find(element => element.isFromLocation === true);

  
  if (checkIfHasFromDest(destinations) == true) {

    const fromLocation = destinations.find(element => element.isFromLocation === true);

    if (fromLocation.country == "Denmark" | fromLocation.country == "Iceland"){
    //return destinations only with greenlandic locations
    return destinations.filter(destination => destination.country == "Greenland")
    } else if (fromLocation.country == "Greenland"){
    console.log(fromLocation.airport);
    return destinations.filter(destination => destination.airport !== fromLocation.airport);
  }

}
  else{
    return destinations;
  }
}


function checkIfHasFromDest(destinations){
  if (destinations.some(e => e.isFromLocation === true)){
    return true; 
  } else {
    return false;
  }
}