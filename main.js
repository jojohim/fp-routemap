import './styles.scss';

window.addEventListener("load", function(){
  const loader = document.querySelector(".loader");
  loader.className += " hide";
})
window.addEventListener("DOMContentLoaded", start);

//ARRAYS 
let globalDestinations = [];
let globalFilteredDest = [];
let toFromLocations = [];
let globalRoutes = [];

// Search Input
const searchInput = document.getElementById("searchbar");

let settings = {
  searchQuery: ""
}

async function start(){
  const destinationsURL = "https://routemap-fa64.restdb.io/rest/destinations";
  let destResponseArray = await getDestinations(destinationsURL);

  let svgMapResponse = await fetch("routes-and-airports.svg");
  let mySVGData = await svgMapResponse.text();
  document.getElementById("mapOverlay").innerHTML = mySVGData;

  let labels =document.querySelectorAll('#mapOverlay svg #labels .label');
  labels.forEach(label =>{
  label.classList.add("hidden");


  })

  handleDest(destResponseArray);
  displayDestList(globalDestinations);
  setEventListeners();
}

function setEventListeners(){
  //SEARCH INPUT EL
  searchInput.addEventListener("keyup", checkSearch);
  //CLICK ON PIN EL
  const pins = document.querySelector("#mapOverlay svg #pins");
  pins.addEventListener("click", checkPin);

}


function checkPin(e){
  console.log(e)
  console.log(e.srcElement.id);
  const clickedDest = e.srcElement.id.slice(0, -3);
  const destinationInArray = globalDestinations.find(({airport}) => airport === clickedDest);
  clickDestination(destinationInArray)
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
  connectsTo: destination.connectsTo, 
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

 const upperCasedDest = makeUpperCase(destination.airport);
 copy.querySelector("[data-field=airport]").textContent = `${upperCasedDest} (${destination.code})` ;
 copy.querySelector("[data-field=airport]").addEventListener("click", function(){
   clickDestination(destination);
 })

 document.querySelector("ul#destList").appendChild(copy);
}

function makeUpperCase(item){
  const fixedItem = item.charAt(0).toUpperCase() + item.slice(1);
  return fixedItem;
}

function clickDestination(destination){

  //IF globalFilteredDest array DOES NOT include isFromLocation = true THEN: 
  if (globalFilteredDest.length === 0){
    document.getElementById("textContainer").classList.add("changeScreen");
    destination.isFromLocation = true;
    toFromLocations.push(destination);
  } else {
    destination.isToLocation = true;
    toFromLocations.push(destination);
  }

  setTimeout(function() {
    showScreen(destination);
    buildList();
    addLabel(destination);
  }, 500);
}

function showScreen(destination){
  console.log(destination);
if (destination.isFromLocation == true){
        //code to be executed after 1 second
        document.getElementById("departFrom").classList.remove("hidden");
        document.getElementById("listTitle").textContent = "I'm travelling to:";
        document.querySelector("#departFrom h1").textContent = `Depart from ${makeUpperCase(destination.airport)} (${destination.code})`;
} else if (destination.isToLocation == true){
  document.getElementById("textContainer").classList.remove("changeScreen");
  document.getElementById("textContainer").classList.add("hidden");
}
    
}

function addLabel(destination){

  document.querySelector(`svg g #${destination.airport}Label`).classList.remove("hidden");
}

function filterByDestinationClicked(destinations){
  //reset search input
  
  if (checkIfHasFromDest(destinations) == true) {

    const fromLocation = destinations.find(element => element.isFromLocation === true);

    if (fromLocation.country == "Denmark" | fromLocation.country == "Iceland"){
    //return destinations only with greenlandic locations
    return destinations.filter(destination => destination.country == "Greenland")
    } else if (fromLocation.country == "Greenland"){
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