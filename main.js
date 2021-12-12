import './styles.scss';

window.addEventListener("load", function(){
  const pageLoader = document.querySelector(".loader");
  pageLoader.className += " hide";
})
window.addEventListener("DOMContentLoaded", start);

// ARRAYS 
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

  await(fetchData());
  await(handleSVGData());

  displayDestList(globalDestinations);
  setEventListeners();
}

async function handleSVGData(){
  let svgMapResponse = await fetch("routes-and-airports.svg");
  let mySVGData = await svgMapResponse.text();
  document.getElementById("mapOverlay").innerHTML = mySVGData;

  // Hide labels and routes
  let labels = document.querySelectorAll('#mapOverlay svg #labels .label');
  const routes = document.querySelectorAll('#mapOverlay svg .route');
  hideElements(labels);
  hideElements(routes);

}

async function fetchData(){
    // Fetching data and drawing svg data
    const destinationsURL = "https://routemap-fa64.restdb.io/rest/destinations";
    let destResponseArray = await getDestinations(destinationsURL);
  
    const routesURL = "https://routemap-fa64.restdb.io/rest/routes"
    let routesResponseArray = await getRoutes(routesURL);
  
    // More setup (eventlistners, data parsing)
    handleRoutes(routesResponseArray);
    handleDest(destResponseArray);
}


function setEventListeners(){
  //SEARCH INPUT EL
  searchInput.addEventListener("keyup", checkSearch);
  //PIN HOVER AND CLICK EL
  const pins = document.querySelectorAll("#mapOverlay svg #pins .pin");
  pins.forEach(pin => {
    pin.addEventListener("click", () => checkPin(pin));
    pin.addEventListener("mouseover", () => togglePinLabelVisibility(pin, true));
    pin.addEventListener("mouseleave", (e) => togglePinLabelVisibility(pin, false));
  })
    // CLEAR ALL ON CLICK EL
    const resultScreen = document.querySelector('#resultScreen');
    const closeIcon = resultScreen.querySelector('img');
    closeIcon.addEventListener('click', () => clearSelection());

    //CLOSE ELEMENT CLICK EL
    let labels = document.querySelectorAll('#mapOverlay svg #labels .label');
  labels.forEach(label => {
    label.classList.add("hidden");

    const closeElement = label.querySelector('.close');
    closeElement.addEventListener('click', ( )=> handleCloseElClicked(label));
  }); 
}

function hideElements(elements) {
  elements.forEach(element => element.classList.add('hidden'));
}

async function getRoutes(routesURL) {
  const response = await fetch(routesURL, {
    method: "get",
    headers: restdbHeaders,
  });
  const routesData = await response.json();
  return routesData;
}

function handleRoutes(routesResponseArray){
  routesResponseArray.forEach(route =>{
    const routeObject = getRouteItems(route);
    globalRoutes.push(routeObject);
  });
}

function getRouteItems(route){
  return {
    routeName: route.route,
    airline: route.airline,
    capacity: route.capacity,
    machine: route.machine,
    price: route.price,
    duration: route.duration,
    availability: route.availability,
    luggage: route.luggage,
    entertainment: route.entertainment,
    food: route.food,
  }
}

function handleCloseElClicked(label){

  // Hide all routes
  const routes = document.querySelectorAll('.route');
  hideElements(routes);

  // Hide element/label that is clicked 
  // + Remove element from toFromLocations list
  label.classList.remove('isActive')
  label.classList.add("hidden");

  const locationToRemove = label.id.split('Label')[0];
  toFromLocations = toFromLocations.filter(location => location.airport !== locationToRemove);

  if (toFromLocations.length > 0) {
    const remainingLocation = toFromLocations[0];
    // always make remaining location From location
    toFromLocations = [
      {
        ...remainingLocation,
        isFromLocation: true,
        isToLocation: false
      }
    ]
      // If your list of toFromLocations === 0 you should show all the pins
  // (show the pins that have been filtered out by country)
  const pins = document.querySelectorAll('#mapOverlay svg .pin');
  pins.forEach(pin => {
    pin.classList.remove('hidden');
  });

  //update Screenn
    updateScreen();
//else if toFroLocation doesn't contain from then: / i.e. if remaining location is To location
  } else {
    clearSelection();
  }

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
//HEADER FOR DESTINATION DATA
const apiKey = "61a623ce81b6874e24b2ea01";

const restdbHeaders = {
    "Content-Type": "application/json; charset=utf-8",
    "x-apikey": apiKey,
    "cache-control": "no-cache"
};

//GET DESTINATIONS DATA

async function getDestinations(destinationsURL) {
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
    const destinationObject = getItems(destination);
    globalDestinations.push(destinationObject);
  });
}

function getItems(destination){

  return {
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
  console.log(`from:${from}, to:${to}`)
  console.table(globalRoutes);
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
  const connectingDestination = globalDestinations.find(destination => {
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

  if (routes.length > 0) {
    routes.forEach(route => {
      const routeElement = document.querySelector(`#${route.routeName}`);
      routeElement.classList.remove('hidden');
    });

      // Show the route information in the UI right sidebar
    showResultsScreen()

     // Show something went wrong in the UI
  } else {
    console.log('Too many transits');

  }
}

function clickDestination(destination){
  if (toFromLocations.includes(destination) || toFromLocations.length === 2) {
    return;
  }

  updateToFromLocations(toFromLocations.length === 0, destination);
  updateRouteVisibility(toFromLocations.length === 2);

  //code to be executed after 1 second
  setTimeout(function() {
    updateScreen();
    buildList();
    addLabel(destination);
  }, 500);
}

function clearSelection() {
  const routes = document.querySelectorAll('.route');
  const labels = document.querySelectorAll('.label');
  const combinedElements = [...routes, ...labels];
  hideElements(combinedElements);

  const activeLabels = document.querySelectorAll('.label.isActive');
  activeLabels.forEach(label => label.classList.remove('isActive'));

  const pins = document.querySelectorAll('#mapOverlay svg .pin');
  pins.forEach(pin => {
    pin.classList.remove('hidden');
  });

  toFromLocations = [];
  setTimeout(function() {
    document.getElementById("resultScreen").classList.add("hidden");
    document.getElementById("departFrom").classList.add("hidden");
    document.getElementById("textContainer").classList.remove("hidden");
  }, 500);

  buildList();
}

function updateScreen() {
  // 1 - NONE SELECTED
  if (toFromLocations.length === 0) {
    document.getElementById("listTitle").textContent = "I'm travelling from:";
    document.getElementById("resultScreen").classList.add("hidden");
    document.getElementById("textContainer").classList.remove("hidden");
    document.getElementById("departFrom").classList.add("hidden");
    document.querySelector("#departFrom h1").textContent = "";
  }

  // 2 - 1 SELECTED
  if (toFromLocations.length === 1) {
    const fromLocation = toFromLocations.find(location => location.isFromLocation);
    document.getElementById("departFrom").classList.remove("hidden");
    document.getElementById("textContainer").classList.remove("hidden");
    document.getElementById("resultScreen").classList.add("hidden");
    document.getElementById("listTitle").textContent = "I'm travelling to:";
    document.querySelector("#departFrom h1").textContent = `Depart from ${makeUpperCase(fromLocation.airport)} (${fromLocation.code})`;
  }

  // 3 - 2 SELECTED
  if (toFromLocations.length === 2) {
    document.getElementById("textContainer").classList.remove("changeScreen");
    document.getElementById("textContainer").classList.add("hidden");
    resultLoadAnimation();
  }
}

function resultLoadAnimation(){
  document.getElementById("resultLoaderScreen").classList.remove("hidden");

  setTimeout(function() {
    document.getElementById("resultLoaderScreen").classList.add("hidden");
  }, 1000);
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

    // Hide pins which are not from greenland or selected destination
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