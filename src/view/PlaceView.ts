import { UserPlacementRecord } from "./UserPlacementRecord.ts";
import { Place, PlaceErrorMessage, PlacesContext } from "../logic/PlacesContext.ts";
import { precompleteConfig } from "./precompleteConfig.ts";
import { View } from "../abstract/View.ts";
import { PlacesService } from "../logic/PlacesService.ts";


export class PlacesView extends View {
  constructor(
    closestPlaceParent: HTMLElement,
    nearbyPlacesParent: HTMLElement,
  ) {
    super([
      {
        parent: closestPlaceParent,
        fragment: new DocumentFragment(),
      },
      {
        parent: nearbyPlacesParent,
        fragment: new DocumentFragment(),
      },
    ]);
  }

  private placesService = this.getDependency<PlacesService>(PlacesService);

  async updatePlaces(viewParams: UserPlacementRecord) {
    const closestComponent = this.closestPlace;
    const nearbyComponent = this.nearbyPlaces;

    const ctx = await this.placesService.updatePlacesContext(viewParams);
    this.applyPlacesContext(ctx);

    this.render(closestComponent);
    this.render(nearbyComponent);
  }

  private applyPlacesContext(ctx: PlacesContext) {
    const { fragment: closestPlaceFragment } = this.closestPlace;
    const { fragment: nearbyPlacesFragment } = this.nearbyPlaces;

    // View changes on elements depending on 'ctx';
    const closestParagraph = document.createElement('p');
    if (!(ctx.searchMessage === PlaceErrorMessage.ok)) {
      closestParagraph.innerText  = ctx.searchMessage;
      closestPlaceFragment.replaceChildren(closestParagraph);
    } else {
      const [closestPlace, ...nearbyPlaces] = ctx.places;
      if (closestPlace) {
        const userInPlace = 
          closestPlace.distanceMeters && 
          (closestPlace.distanceMeters <= precompleteConfig.botRadiusLimit);
        closestParagraph.innerText = userInPlace ? 'You are in\n' : 'Nearest place of interest is\n';
        const closestPlaceArticle: HTMLElement = this.createPlaceArticle(closestPlace);
        closestPlaceFragment.replaceChildren(closestParagraph, closestPlaceArticle);
      }
      if (nearbyPlaces) {
        const placeArticles: HTMLElement[] = [];
        for (const place of nearbyPlaces) {
          placeArticles.push(this.createPlaceArticle(place));
        }
        nearbyPlacesFragment.replaceChildren(...placeArticles);
      }
    }
  }

  private createPlaceArticle(place: Place): HTMLElement {
    const placeArticle = document.createElement('article');
    this.formatPlaceHeader(placeArticle, place);
    this.formatPlaceRating(placeArticle, place);
    this.formatPlaceLocation(placeArticle, place);
    this.formatPlaceCategories(placeArticle, place);
    this.formatPlaceDescription(placeArticle, place);
    // this.prepareCopyClipboardLinks(placeArticle, place); can be implemented later
    return placeArticle;
  }

  private formatPlaceHeader(target: HTMLElement, place: Place) {
    const heading = document.createElement('h2');
    const headingTokens: string[] = [place.name];
    if (place.distanceMeters) {
      headingTokens.push(` (${place.distanceMeters} m)`);
    }
    heading.innerText = headingTokens.join('');
    target.appendChild(heading);
  }

  private formatPlaceRating(target: HTMLElement, place: Place) {
    let actualRating = place.ratingOutOfTen;
    if (actualRating) {
      const ratingParagraph = document.createElement("p");
      ratingParagraph.innerText = `${actualRating}/${precompleteConfig.maxRatingOfTen}`;
      target.appendChild(ratingParagraph);
    }
  }

  private formatPlaceLocation(target: HTMLElement, place: Place) {
    const locationParagraph = document.createElement("p");
    const locationTokens = ["<strong>Location</strong>: "];
    const address = place.address;
    const latitude = place.latitude;
    const longtitude = place.longtitude;
    if (address) {
      locationTokens.push(address);
    } else if (latitude && longtitude) {
      locationTokens.push(`<${latitude},${longtitude}>`);
    } else {
      locationTokens.push("<unknown>");
    }
    locationParagraph.innerHTML = locationTokens.join('');
    target.appendChild(locationParagraph);
  }

  private formatPlaceCategories(target: HTMLElement, place: Place) {
    const categories = place.categories;
    if (categories.length <= 0) return;
    const categoryList = document.createElement("ul");
    for (const category of categories) {
      const categoryItem = document.createElement("li");
      categoryItem.className = "category-item";
      categoryItem.style.setProperty(
        "--category-background",
        `url(\"${category.categoryIconURL}\")`,
      );
      categoryItem.innerHTML = `<em>${category.title}</em>`;
      categoryList.appendChild(categoryItem);
    }
    target.appendChild(categoryList);
  }

  private formatPlaceDescription(target: HTMLElement, place: Place) {
    const description = place.description;
    if (!description) return;
    const descriptionParagraph = document.createElement("p");
    const firstSentence = description.slice(0, description.indexOf("."));
    descriptionParagraph.innerText = firstSentence;
    target.appendChild(descriptionParagraph);
  }

  // private prepareCopyClipboardLinks(placeArticle, place);

  get closestPlace() {
    return this.getComponent(0);
  }

  get nearbyPlaces() {
    return this.getComponent(1);
  }
}
