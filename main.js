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
  //HOVER OVER EL 
//  pins.addEventListener("mouseover", pinEventCheck);
//  pins.addEventListener("mouseout", pinEventCheck)
}

//function pinEventCheck(e){
//  const clickedDest = e.srcElement.id.slice(0, -3);
//  if(e.type === "mouseover"){
//  document.querySelector(`svg g #${clickedDest}Label`).classList.remove("hidden");
//} else if (e.type === "mouseout"){
//  document.querySelector(`svg g #${clickedDest}Label`).classList.add("hidden");
//} else if(e.type === "click"){
//  checkPin(e);
//}
//}

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
    //set from location to true & save as from location
    destination.isFromLocation = true;
    toFromLocations.push(destination);

    changeScreenView(destination);
    buildList();
    addLabel(destination);
  } 
    //IF A DESTINATION ALREADY HAS isFromLocation THEN / ELSE
    //set to location to true 
    //initialise result screen
  else {
    destination.isToLocation = true;
    toFromLocations.push(destination);


    addLabel(destination);
  }
}

function changeScreenView(destination){
      //unhide departFrom article & change 'travelling from' to 'travelling to'
      document.getElementById("departFrom").classList.remove("hidden");
      document.getElementById("listTitle").textContent = "I'm travelling to:";
      //set textContent of h1 to 'depart from <destination.airport + (destination.code)>
      document.querySelector("#departFrom h1").textContent = `Depart from ${makeUpperCase(destination.airport)} (${destination.code})`;
}

function addLabel(destination){

  console.log(`#${destination.airport}Label`);
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