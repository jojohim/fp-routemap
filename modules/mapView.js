
export function addLabel(destination){
    const labelId = `${destination.airport}Label`;
    const label = document.querySelector(`svg g #${labelId}`);
    label.classList.add("isActive");
  }

export function togglePinLabelVisibility(pin, show) {
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
