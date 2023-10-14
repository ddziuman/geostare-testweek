import "./styles/default.css";
import "./styles/custom.css";
import { enforceMinMax } from "./validators/enforceMinMax.ts";
import { PlacesView } from "./view/PlaceView.ts";
import { UserPlacementRecord } from "./view/UserPlacementRecord.ts";

const llInputs = document.querySelectorAll<HTMLInputElement>(".coords");
llInputs.forEach((input) => input.addEventListener("input", enforceMinMax));

const placesSection = document.getElementById("placesSection"); // for debugging
// Представление --> Логика, возвращающая данные (Сервис) --> источник данных (FS API)
// Бизнес-логику продумать под нашу бизнес-логику под формат бизнес-логики (мапить API? адаптеры?)

const llForm = document.querySelector<HTMLFormElement>("#llForm");
const closestPlaceDiv = document.querySelector<HTMLElement>("#closestPlace");

if (llForm && closestPlaceDiv && placesSection) {
  const placesView = new PlacesView(closestPlaceDiv, placesSection);

  llForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(llForm);
    const viewParams: UserPlacementRecord = {
      latitude: formData.get("lat")!.toString(),
      longtitude: formData.get("long")!.toString(),
    };
    await placesView.updatePlaces(viewParams);
  });
}

// Examples:41.87810, -87.629800
//          41.87234, -87.677876

/* Geo constraints: 
  latitude:   [-90, +90] °
  longtitude: [-180, +180]*/
