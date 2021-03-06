import './scss/styles.scss';
import {globalDestinations, globalRoutes, fetchData} from './modules/getData.js';
import {filterDestBySearch, settings, filterListByDest} from './modules/listFilters.js';
import {addClassForEach, removeClassForEach, togglePopUpWindow, makeUpperCase, getSum, checkIfHasFromDest} from './modules/utility.js';
import {resultLoadAnimation, findMachineImage, addAirlineButton, addIcons, getImageSize} from './modules/resultsScreen.js';
import {addLabel, togglePinLabelVisibility} from './modules/mapView.js';

"use strict";

window.addEventListener("load", function(){
  const pageLoader = document.querySelector(".loader");
  pageLoader.className += " hide";
})
window.addEventListener("DOMContentLoaded", start);

// ARRAYS 
let globalFilteredDest = [];
let toFromLocations = [];
let connectingDestination = {};

// Search Input
const searchInput = document.getElementById("searchbar");

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

function setEventListeners(){

  const priceGraphWindow = document.querySelector("#priceGraphPopup")

  //Multiline eventlisteners
  setBackEventListener();
  setPinsEventListener();
  setLabelsEventListener();
  setClearAllEventListener();

  //single line eventlisteners
  document.querySelector(".priceInfoIcon").addEventListener('click', () => {togglePopUpWindow(priceGraphWindow)});
  searchInput.addEventListener("keyup", checkSearch);
}

function setBackEventListener(){
  document.querySelector("#notFoundWindow #backIcon").addEventListener("click", () =>{
    const fromLabel = document.querySelector(`svg #labels #${toFromLocations[1].airport}Label`);
    handleCloseElClicked(fromLabel);
  })
}

function setClearAllEventListener(){
  // CLEAR ALL ON CLICK EL
  const clearAllButtons = document.querySelectorAll('.clearAllButton');
  clearAllButtons.forEach(clearAllButton => {
    clearAllButton.addEventListener("click", clearSelection);
  })
}

function setLabelsEventListener(){
  let labels = document.querySelectorAll('#mapOverlay svg #labels .label');

  addClassForEach(labels, 'hidden');
  labels.forEach(label => {
  const closeElement = label.querySelector('.close');
  closeElement.addEventListener('click', ( )=> handleCloseElClicked(label));
}); 
}

function setPinsEventListener(){
  const pins = document.querySelectorAll("#mapOverlay svg .pin");

  pins.forEach(pin => {
    pin.addEventListener("click", () => checkPin(pin));
    pin.addEventListener("mouseover", () => togglePinLabelVisibility(pin, true));
    pin.addEventListener("mouseleave", (e) => togglePinLabelVisibility(pin, false));
  })
}
function handleCloseElClicked(label){

  const pins = document.querySelectorAll("#mapOverlay svg .pin");
  const routes = document.querySelectorAll('.route');
  const locationToRemove = label.id.split('Label')[0];

  //hide label and routes
  addClassForEach(routes, 'hidden');
  label.classList.remove('isActive')
  label.classList.add("hidden");

  //filter out clicked 
  toFromLocations = toFromLocations.filter(location => location.airport !== locationToRemove);
  const remainingLocation = toFromLocations[0];
  
  if (toFromLocations.length > 0) {
    toFromLocations = [];
    updateToFromLocations(true, remainingLocation);
    removeClassForEach(pins, 'hidden');
    updateScreens();
  } else {
    clearSelection();
  }
}

function updateToFromLocations(isFromLocation, location){

  toFromLocations.push({
    ...location,
    isFromLocation,
    isToLocation: !isFromLocation,
  });

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

function getRouteConnection(from, to) {

  let routes = [];
  connectingDestination = globalDestinations.find(destination => destination.connectsTo.includes(from) && destination.connectsTo.includes(to));
  const directRoute = checkForDirectRoute(from, to);

  if (directRoute) {
    routes = [directRoute]
  } else if(connectingDestination){
    const connectingAirport = connectingDestination.airport;
    const firstRoute = getConnectingRoute(from, connectingAirport);
    const secondRoute = getConnectingRoute(to, connectingAirport);
    routes = [firstRoute, secondRoute];
  } else {
    return routes;
  }
  return routes;
}

function checkForDirectRoute(from, to){
  const directRoute = globalRoutes.find(gRoute => gRoute.routeName.includes(from) && gRoute.routeName.includes(to));
  return directRoute;
}

function getConnectingRoute(location, connectingAirport){
 const connectingRoute = globalRoutes.find(gRoute => gRoute.routeName.includes(location) && gRoute.routeName.includes(connectingAirport));
 return connectingRoute;
}


function updateResultVisibility(shouldShowRoute) {
  if (!shouldShowRoute) {
    return;
  } else{
    findJourneyToShow();
    const resultsContainer = document.querySelector('#resultScreen');
    resultsContainer.classList.remove('hidden');
  }
}

function findJourneyToShow(){
  const fromLocation = toFromLocations.find(location => location.isFromLocation).airport;
  const toLocation = toFromLocations.find(location => location.isToLocation).airport;
  const routes = getRouteConnection(fromLocation, toLocation);

  if (routes.length > 0) {
    handleJourneyToShow(routes)

  } else {
    document.getElementById("notFoundWindow").classList.remove("hidden");
  }
}

function handleJourneyToShow(routes){

    handleSelectedRoutes(routes);
    populateJourneyHeader(routes);
    addAirlineButton(routes);
    addTransitDestinationToView(routes.length);

}

function populateJourneyHeader(routes){
  const routesPrices = [];
  const routeDurationMins = [];
  const routeDurationHrs = [];

  routes.forEach(route => {
    routesPrices.push(route.price);
    routeDurationMins.push(route.durationMins);
    routeDurationHrs.push(route.durationHrs);
  });

  //TOTAL PRICE AND DURATION
  getTotalRouteDuration(routeDurationHrs, routeDurationMins);
  document.getElementById("priceFrom").textContent = `${getSum(routesPrices)} DKK `

  //DISPLAY SELECTED FROM AND TO IN RESULTS
  const fromLocation = toFromLocations.find(location => location.isFromLocation);
  const toLocation = toFromLocations.find(location => location.isToLocation);
  showResultDests(fromLocation, toLocation);
}

function handleSelectedRoutes(routes){
    routes.forEach(route => {
      showRouteInfo(route);
     setTimeout(function() {
      const routeElement = document.querySelector(`#${route.routeName}`);
      routeElement.classList.remove('hidden');
      }, 2000);
    });
}

function showResultDests(fromLocation, toLocation){
  // add icon infront of selected dests
  document.getElementById("fromLocationResult").classList.add(`${fromLocation.type}`);
  document.getElementById("toLocationResult").classList.add(`${toLocation.type}`);
  //Dispaly to and from 
  document.querySelector("#routeTitle h1").textContent = `From ${makeUpperCase(fromLocation.airport)} to ${makeUpperCase(toLocation.airport)}`
  document.querySelector("#fromLocationContainer h2").textContent = `Depart from ${makeUpperCase(fromLocation.airport)} (${fromLocation.code})`;
  document.querySelector("#toLocationContainer h2").textContent = `Arrive in ${makeUpperCase(toLocation.airport)} (${toLocation.code})`
}

function getTotalRouteDuration(routeDurationHrs, routeDurationMins){
  let totalHrs =  getSum(routeDurationHrs);
  let totalMins = getSum(routeDurationMins);

  if (totalMins >= 60){
    totalHrs === totalHrs++;
    totalMins -= 60;
  } 
  //display totalDuration
  document.getElementById("durationTotal").textContent = `${totalHrs}h ${totalMins}m`;
}

function addTransitDestinationToView(routesLength){
  if (routesLength >= 2) {
    //get second route 
    const routeElements = document.getElementsByClassName("routeInfo");
    const secondRouteElement = routeElements[1];
    
    //create new text el
    const connectingDestinationText = document.createElement("h2");
    connectingDestinationText.textContent = `Transit in ${makeUpperCase(connectingDestination.airport)} (${connectingDestination.code})`;
    connectingDestinationText.classList.add(`${connectingDestination.type}`);
    connectingDestinationText.classList.add(`transitDestination`);
    //insert before second element
    const routesContainer = document.querySelector(".routeContainer");
    routesContainer.insertBefore(connectingDestinationText, secondRouteElement);
  } else {
    return;
  }
}

function showRouteInfo(route){

  const copy = document.querySelector("template#routeTemplate").content.cloneNode(true);
  const scheduleWindow = copy.querySelector(".schedulePopupWindow");
  const machineImage = copy.querySelector(".machineImg");

  copy.querySelector(".flightDuration").textContent = `${route.durationHrs}h ${route.durationMins}m`;
  copy.querySelector(".machineName").textContent = `${route.machine}`;
  copy.querySelector(".machineImg").src = findMachineImage(route.machine, route.airline);
  copy.querySelector(".capacity").textContent = `${route.capacity} passengers`;
  copy.querySelector(".scheduleText").textContent = route.availability;
  copy.querySelector(".scheduleHeader").textContent = `Flight Schedule`;
  copy.querySelector(".scheduleInfoIcon").addEventListener('click', () => {togglePopUpWindow(scheduleWindow)});
  copy.querySelector(".food").textContent = `${route.food}`;
  copy.querySelector(".luggage").textContent = `${route.luggage}kg`;

  getImageSize(route.machine, machineImage);
  addIcons(route, copy)

}


function clickDestination(destination){
  
  if (toFromLocations.includes(destination) || toFromLocations.length === 2)??{
    return;
  } else{
  updateToFromLocations(toFromLocations.length === 0, destination);
  updateResultVisibility(toFromLocations.length === 2);
  updateScreens();
  buildList();
  addLabel(destination);
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
  }
}

function updateScreenOne(){

  if (toFromLocations.length === 0) {
    document.getElementById("departFrom").classList.add("fadeIn");
    document.getElementById("listContainer").classList.add("fadeIn");
    document.getElementById("listTitle").textContent = "I'm travelling from:";
    document.querySelector("#departFrom h1").textContent = "";
    document.getElementById("departFrom").classList.add("hidden");
    document.getElementById("resultScreen").classList.add("hidden");
  }

  else if (toFromLocations.length === 1) {
    const fromLocation = toFromLocations.find(location => location.isFromLocation);
    document.getElementById("listTitle").textContent = "I'm travelling to:";
    document.getElementById("departFrom").classList.remove("hidden");
    document.querySelector("#departFrom h1").textContent = `Depart from ${makeUpperCase(fromLocation.airport)} (${fromLocation.code})`;
  }

}

function filterByDestinationClicked(destinations){
  //reset search input
  if (checkIfHasFromDest(toFromLocations)) {
    const fromLocation = toFromLocations.find(element => element.isFromLocation === true);
    return(filterListByDest(destinations, fromLocation));
  }
  else{
    return destinations;
  }
}
