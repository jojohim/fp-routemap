import './styles.scss';

window.addEventListener("load", function(){
  const pageLoader = document.querySelector(".loader");
  pageLoader.className += " hide";
})
window.addEventListener("DOMContentLoaded", start);

//HEADER FOR DESTINATION DATA
const apiKey = "61a623ce81b6874e24b2ea01";

const restdbHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "x-apikey": apiKey,
    "cache-control": "no-cache"
};

// ARRAYS 
let globalDestinations = [];
let globalFilteredDest = [];
let toFromLocations = [];
let globalRoutes = [];
let connectingDestination = {};

// Search Input
const searchInput = document.getElementById("searchbar");
let settings = {
  searchQuery: ""
}

async function start(){

  await(fetchData());
  await(handleSVGData());;
  setEventListeners();
  displayDestList(globalDestinations)
}

async function handleSVGData(){
  let svgMapResponse = await fetch("routes-and-airports.svg");
  let mySVGData = await svgMapResponse.text();
  document.getElementById("mapOverlay").innerHTML = mySVGData;

  // Hide labels and routes
  let labels = document.querySelectorAll('#mapOverlay svg #labels .label');
  const routes = document.querySelectorAll('#mapOverlay svg .route');
  addClassForEach(labels, 'hidden');
  addClassForEach(routes, 'hidden');
}

async function fetchData(){
    // Fetching data and drawing svg data
    const destinationsURL = "https://routemap-fa64.restdb.io/rest/destinations";
    let destResponseArray = await getAllDestinations(destinationsURL);
  
    const routesURL = "https://routemap-fa64.restdb.io/rest/routes"
    let routesResponseArray = await getAllRoutes(routesURL);
  
    // More setup (eventlistners, data parsing)
    handleRoutes(routesResponseArray);
    handleDest(destResponseArray);
}

function setEventListeners(){

  let labels = document.querySelectorAll('#mapOverlay svg #labels .label');
  const pins = document.querySelectorAll("#mapOverlay svg .pin");

  //BACK BUTTON EL
  document.querySelector("#notFoundWindow #backIcon").addEventListener("click", () =>{
    const fromLabel = document.querySelector(`svg #labels #${toFromLocations[1].airport}Label`);
    handleCloseElClicked(fromLabel);
  })

  //SEARCH INPUT EL
  searchInput.addEventListener("keyup", checkSearch);

  //PIN HOVER AND CLICK EL
  pins.forEach(pin => {
    pin.addEventListener("click", () => checkPin(pin));
    pin.addEventListener("mouseover", () => togglePinLabelVisibility(pin, true));
    pin.addEventListener("mouseleave", (e) => togglePinLabelVisibility(pin, false));
  })

  // CLEAR ALL ON CLICK EL
    const clearAllButtons = document.querySelectorAll('.clearAllButton');
    clearAllButtons.forEach(clearAllButton => {
      clearAllButton.addEventListener("click", clearSelection);
    })

  //CLOSE ELEMENT CLICK EL
    addClassForEach(labels, 'hidden');
    labels.forEach(label => {
    const closeElement = label.querySelector('.close');
    closeElement.addEventListener('click', ( )=> handleCloseElClicked(label));
  }); 

  //PRICE INFO ICON 
  const priceGraphWindow = document.querySelector("#priceGraphPopup")
  document.querySelector(".priceInfoIcon").addEventListener('click', () => {togglePopUpWindow(priceGraphWindow)});
}

function togglePopUpWindow(domEl){

  domEl.classList.remove("hidden");
  domEl.querySelector(".closeIcon").addEventListener("click", ()=> {
  domEl.classList.add("hidden");
  }) 
}

function addClassForEach(elements, className) {
  elements.forEach(element => element.classList.add(className));
}

function removeClassForEach(elements, className) {
  elements.forEach(element => element.classList.remove(className));
}



async function getAllRoutes(routesURL) {
  const response = await fetch(routesURL, {
    method: "get",
    headers: restdbHeaders,
  });
  const routesData = await response.json();
  return routesData;
}

function handleRoutes(routesResponseArray){
  routesResponseArray.forEach(route =>{
    //const routeObject = getRouteItems(route);
    globalRoutes.push(route);
  });
}

function handleCloseElClicked(label){

  const pins = document.querySelectorAll("#mapOverlay svg .pin");
  const routes = document.querySelectorAll('.route');
  const locationToRemove = label.id.split('Label')[0];

  addClassForEach(routes, 'hidden');
  label.classList.remove('isActive')
  label.classList.add("hidden");

  toFromLocations = toFromLocations.filter(location => location.airport !== locationToRemove);
  const remainingLocation = toFromLocations[0];
  
  if (toFromLocations.length > 0) {

    updateRemainingLocation(remainingLocation);
    removeClassForEach(pins, 'hidden');

  } else {
    clearSelection();
  }
}

function updateRemainingLocation(location){

  toFromLocations = [
    {
      ...location,
      isFromLocation: true,
      isToLocation: false
    }
  ]
  updateScreens();
}


function togglePinLabelVisibility(pin, show) {
  const pinId = pin.id;
  const labelId = `#${pinId.split('Pin')[0]}Label`;
  const label = document.querySelector(labelId);
  const isActive = label.classList.contains('isActive');

  if (isActive) {
    return;
  }
  if (show) {
    document.querySelector(labelId).classList.remove('hidden');
  } else {
    document.querySelector(labelId).classList.add('hidden');
  }
}

function checkPin(pin){
  const clickedDest = pin.id.slice(0, -3);
  const destinationInArray = globalDestinations.find(({airport}) => airport === clickedDest);
  clickDestination(destinationInArray)
}

/////// COLLECT SORTED / FILTERED LISTS
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

//GET DESTINATIONS DATA

async function getAllDestinations(destinationsURL) {
  const response = await fetch(destinationsURL, {
      method: "get",
      headers: restdbHeaders,
  });
  const destinationsData = await response.json();
  return destinationsData;
}

//HANDLE DESTINATIONS
function handleDest(destResponseArray){
  destResponseArray.forEach(destination =>{
    //const destinationObject = getItems(destination);
    globalDestinations.push(destination);
  });
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

function updateToFromLocations(isFromLocation, destination) {
    //IF globalFilteredDest array DOES NOT include isFromLocation = true THEN: 
  if (isFromLocation){
    document.getElementById("textContainer").classList.add("changeScreen");
  }

  toFromLocations.push({
    ...destination,
    isFromLocation,
    isToLocation: !isFromLocation
  });
}

function getRouteConnection(from, to) {
  let routes = [];

    // Step 1 (check for directRoute)

  const directRoute = globalRoutes.find(gRoute => {
    if (gRoute.routeName.includes(from) && gRoute.routeName.includes(to)) {
      return true;
    }
    return false;
  });

  if (directRoute) {
    routes = [directRoute]
    return routes;
  } 

  // Step 2 (check for connecting location)
  connectingDestination = globalDestinations.find(destination => {
    if (destination.connectsTo.includes(from) && destination.connectsTo.includes(to)) {
      return true
    }

    return false;
  });

  if (connectingDestination) {
    const connectingAirport = connectingDestination.airport;
    const firstRoute = globalRoutes.find(gRoute => {
      if (gRoute.routeName.includes(from) && gRoute.routeName.includes(connectingAirport)) {
        return true
      }
  
      return false;
    });

    const secondRoute = globalRoutes.find(gRoute => {
      if (gRoute.routeName.includes(connectingAirport) && gRoute.routeName.includes(to)) {
        return true
      }
  
      return false;
    });

    if (firstRoute && secondRoute) {
      routes = [firstRoute, secondRoute]
    }

  }

  return routes;
}

function showResultsScreen() {
  const resultsContainer = document.querySelector('#resultScreen');
  resultsContainer.classList.remove('hidden');
}

function updateRouteVisibility(shouldShowRoute) {
  if (!shouldShowRoute) {
    return;
  }

  const fromLocation = toFromLocations.find(location => location.isFromLocation).airport;
  const toLocation = toFromLocations.find(location => location.isToLocation).airport;
  const routes = getRouteConnection(fromLocation, toLocation);
  //routes.forEach(route => {
  //  selectedRoutes.push(route);
  //})

  if (routes.length > 0) {
    handleRoutesToShow(routes)

  } else {
    document.getElementById("notFoundWindow").classList.remove("hidden");

  }
}

function handleRoutesToShow(routes){

    populateResultScreen(routes);
    addAirlineButton(routes);
    addTransitDestinationToView(routes.length);

}

function addAirlineButton(routes){

  const agButton = document.getElementById("agButton");
  const iaButton = document.getElementById("iaButton");
  const containsAGRoute = routes.some(e => e.airline === "Air Greenland");
  const containsIARoute = routes.some(e => e.airline === "Icelandair");

  if (containsAGRoute && !containsIARoute){
    iaButton.classList.add("hidden");

  } else if (!containsAGRoute && containsIARoute){
    agButton.classList.add("hidden");

  } else if (containsAGRoute && containsIARoute){
    return;
  }

  //if routes contain Air Greenland as airline add agButton 
  //if routes contain AirIceland as airline add aiButton 
  //(MAKE SURE TO UNHIDE ALL WHEN RESET);

}

function populateResultScreen(routes){
  const fromLocation = toFromLocations.find(location => location.isFromLocation);
  const toLocation = toFromLocations.find(location => location.isToLocation);
  const routesPrices = [];
  const routeDurationMins = [];
  const routeDurationHrs = [];

  routes.forEach(route => {
    routesPrices.push(route.price);
    routeDurationMins.push(route.durationMins);
    routeDurationHrs.push(route.durationHrs);

    showRouteInfo(route);
    setTimeout(function() {
    const routeElement = document.querySelector(`#${route.routeName}`);
    routeElement.classList.remove('hidden');
    }, 2000);
  });

  //if totalMinutes more than 60 subtract 60 from minutes and add 1 hour to total hours
  let totalHrs =  getSum(routeDurationHrs);
  let totalMins = getSum(routeDurationMins);

  if (totalMins >= 60){
    totalHrs === totalHrs++;
    totalMins -= 60;
    console.log(totalHrs, totalMins)
  } 
  //display totalDuration
  document.getElementById("durationTotal").textContent = `${totalHrs}h ${totalMins}m`;
  
  //display price
  document.getElementById("priceFrom").textContent = `${getSum(routesPrices)} DKK `

  // add icon infront of 
  document.getElementById("fromLocationResult").classList.add(`${fromLocation.type}`);
  document.getElementById("toLocationResult").classList.add(`${toLocation.type}`);

  //Dispaly to and from 
  document.querySelector("#routeTitle h1").textContent = `From ${makeUpperCase(fromLocation.airport)} to ${makeUpperCase(toLocation.airport)}`
  document.querySelector("#fromLocationContainer h2").textContent = `Depart from ${makeUpperCase(fromLocation.airport)} (${fromLocation.code})`;
  document.querySelector("#toLocationContainer h2").textContent = `Arrive in ${makeUpperCase(toLocation.airport)} (${toLocation.code})`

}

function getSum(elements){

  //takes array to calculate sum
  const reducer = (accumulator, curr) => accumulator + curr;
  return elements.reduce(reducer);
}

function addTransitDestinationToView(routesLength){
  if (routesLength >= 2) {
    //get second route 
    const routeElements = document.getElementsByClassName("routeInfo")
    const secondRouteElement = routeElements[1];
    //create new text el
    const connectingDestinationText = document.createElement("h2");
    connectingDestinationText.textContent = `Transit in ${makeUpperCase(connectingDestination.airport)} (${connectingDestination.code})`;
    connectingDestinationText.classList.add(`${connectingDestination.type}`);
    connectingDestinationText.classList.add(`transitDestination`);
    //insert before second element
    const routesContainer = document.querySelector(".routeContainer");
    routesContainer.insertBefore(connectingDestinationText, secondRouteElement)
  } else {
    return;
  }
}

function showRouteInfo(route){

  const copy = document.querySelector("template#routeTemplate").content.cloneNode(true);

  copy.querySelector(".flightDuration").textContent = `${route.durationHrs}h ${route.durationMins}m`;
  copy.querySelector(".machineName").textContent = `${route.machine}`;
  copy.querySelector(".machineImg").src = findMachineImage(route.machine, route.airline);
  copy.querySelector(".capacity").textContent = `${route.capacity} passengers`;
  //Schedule popup
  copy.querySelector(".scheduleText").textContent = route.availability;
  copy.querySelector(".scheduleHeader").textContent = `Flight Schedule`;
  const scheduleWindow = copy.querySelector(".schedulePopupWindow");
  copy.querySelector(".scheduleInfoIcon").addEventListener('click', () => {togglePopUpWindow(scheduleWindow)});


  copy.querySelector(".food").textContent = `${route.food}`;
  copy.querySelector(".luggage").textContent = `${route.luggage}kg`;

  addIcons(route, copy)

}

function addIcons(route, copy){
  if (!route.entertainment){
    copy.querySelector(".entertainment").classList.add("hidden");
  } 
  if (!route.food){
    copy.querySelector(".food").classList.add("hidden");
  }
  if (!route.luggage){
    copy.querySelector(".luggage").classList.add("hidden");
  }

  document.querySelector(".routeContainer").appendChild(copy);
}

function findMachineImage(machine, airline){
  if (machine === "Dash 8-200" && airline === "Air Greenland"){
    return "machine-cutouts/dash8-ag.png";
  } else if (machine === "Dash 8-200" && airline === "Icelandair"){
    return "machine-cutouts/dash8-ia.png";
  } else if (machine === "Boeing 737 All Series" || machine === "Airbus A330-200"){
    return "machine-cutouts/airbus-ag.png";
  } else if (machine === "Bell 212 Helicopter"){
    return "machine-cutouts/bell-212-ag.png";
  } else if (machine === "Eurocopter Ec155"){
    return "machine-cutouts/eurocopter-ag.png";
  }

}
function clickDestination(destination){
  
  if (toFromLocations.includes(destination) || toFromLocations.length === 2) {
    return;
  } else {

  updateToFromLocations(toFromLocations.length === 0, destination);
  updateRouteVisibility(toFromLocations.length === 2);

  setTimeout(function() {
    updateScreens();
    buildList();
    addLabel(destination);
  }, 500);
}
}

function clearSelection() {

  toFromLocations = [];

  const pins = document.querySelectorAll("#mapOverlay svg .pin");
  const routes = document.querySelectorAll('.route');
  const labels = document.querySelectorAll('.label');
  const combinedElements = [...routes, ...labels];
  const activeLabels = document.querySelectorAll('.label.isActive');

  addClassForEach(combinedElements, 'hidden');
  removeClassForEach(pins, 'hidden');
  removeClassForEach(activeLabels, 'isActive');

  updateScreens();
  buildList();
}

function updateScreens() {

  if (toFromLocations.length <= 1){
    document.getElementById("resultScreen").classList.add("hidden");
    document.getElementById("textContainer").classList.remove("hidden");
    document.querySelector(".routeContainer").innerHTML = "";
    document.getElementById("notFoundWindow").classList.add("hidden");

    const btn = document.querySelectorAll(".btn");
    removeClassForEach(btn, 'hidden');
    updateScreenOne();

  } else if (toFromLocations.length === 2) {
      document.getElementById("resultLoaderScreen").classList.remove("hidden");
      document.getElementById("textContainer").classList.remove("changeScreen");
      document.getElementById("textContainer").classList.add("hidden");
      resultLoadAnimation();
      showResultsScreen();
  }
}

function updateScreenOne(){

  if (toFromLocations.length === 0) {
    document.getElementById("listTitle").textContent = "I'm travelling from:";
    document.getElementById("resultScreen").classList.add("hidden");
    document.querySelector("#departFrom h1").textContent = "";
    document.getElementById("departFrom").classList.add("hidden");
  }

  else if (toFromLocations.length === 1) {
    const fromLocation = toFromLocations.find(location => location.isFromLocation);
    document.getElementById("listTitle").textContent = "I'm travelling to:";
    document.getElementById("departFrom").classList.remove("hidden");
    document.querySelector("#departFrom h1").textContent = `Depart from ${makeUpperCase(fromLocation.airport)} (${fromLocation.code})`;
  }
}

function resultLoadAnimation(){
  setTimeout(function() {
    document.getElementById("resultLoaderScreen").classList.add("hidden");
  }, 2000);
}

function addLabel(destination){
  const labelId = `${destination.airport}Label`;
  const label = document.querySelector(`svg g #${labelId}`);
  label.classList.add("isActive");
}

function filterByDestinationClicked(destinations){
  //reset search input
  if (checkIfHasFromDest(toFromLocations)) {
    const fromLocation = toFromLocations.find(element => element.isFromLocation === true);
    if (fromLocation.country == "Denmark" || fromLocation.country == "Iceland"){
    destinations.forEach((destination) => {
      if (destination.country !== fromLocation.country && destination.country !== "Greenland") {
        const pinId = `#${destination.airport}Pin`;
        const pin = document.querySelector(pinId);
        pin.classList.add('hidden');
      }
    })
    // Return destinations only with greenlandic locations
    const filteredDestinations = destinations.filter(destination => destination.country == "Greenland")
    return filteredDestinations;
    } else if (fromLocation.country == "Greenland"){
      return destinations.filter(destination => destination.airport !== fromLocation.airport);
    }
  }
  else{
    return destinations;
  }
}

function checkIfHasFromDest(destinations){
  return destinations.some(e => e.isFromLocation === true)
}