import { DependencySingleton } from "./abstract/DependencySingleton";
import { InjectionTargetType } from "./abstract/InjectionTargetType";
import { PlacesService } from "./logic/PlacesService";
import { FSSearchAPI } from "./apis/foursquare/FSSearchAPI";
import { PlacesView } from "./view/PlaceView";
import { AuthType, HTTPMethod, PayloadContentType } from "./apis/API";
import { DependencyScheme } from "./DependencyScheme";
import { PlacesCacheService } from "./logic/PlacesCacheService";
import { PlacesMathService } from "./logic/PlacesMathService";

export const DependencyContainer: DependencyContainerType = {

  instancesCache: {}, // actually initialized instances

  getDependenciesFor(target: DependencySingleton): Record<string, DependencySingleton> {
    const depsType = target.targetType === InjectionTargetType.View ? 'views': 'services';
    const depsListOfType = DependencyConfig.dependencies[depsType];
    const targetName = target.constructor.name;
    const targetDepsList = depsListOfType[targetName];
    if (!targetDepsList) // why not 'return {}? Because I want to ensure all targets are listed in this file
      throw new ReferenceError(`Dependency injection target '${targetName}' is missing in 'dependencies' map`);
    /*
      targetDepsList = { 'dep1': dep1_class, 'dep2': dep2_class }
    */
    const depsConstructors  = Object.values(targetDepsList);
    const targetDepInstancesMap: Record<string, DependencySingleton> = {};
    for (const depCtor of depsConstructors) {
      targetDepInstancesMap[depCtor.name] = this.bootstrapInstance(depCtor);
      // let depInstance = this.instancesCache[depName];
      // if (!depInstance) {
      //   const instanceScheme = this.instancesSchemes[depName];
      //   if (!instanceScheme)
      //     throw new ReferenceError(`The scheme for dependency '${depName}' of '${targetName}' is missing`);
      //   depInstance = instanceScheme.bootstrapDependency();
      // }
      // targetDepInstancesMap[depName] = depInstance;
    }
    return targetDepInstancesMap;
  },

  bootstrapInstance<T extends DependencySingleton>(ctor: new(...args: any[]) => T): T {
    const ctorName = ctor.name;
    let instanceFromCache = this.instancesCache[ctorName];
    if (!instanceFromCache) {
      const scheme = DependencyConfig.instancesSchemes[ctorName];
      if (!scheme)
        throw new ReferenceError(`The scheme for '${ctorName}' is missing`);
      instanceFromCache = scheme.bootstrapDependency();
    }
    return instanceFromCache as T;
  },
};
(window as any).DependencyContainer = DependencyContainer;

const DependencyConfig: DependencyConfigType = { // dependency map and schemes preconfig
  dependencies: { 
    views: {
      PlacesView: {
        PlacesService,
      },
    },
    services: {
      PlacesService: {
        FSSearchAPI,
        PlacesCacheService,
      },
      FSSearchAPI: {
        PlacesMathService,
      },
      PlacesCacheService: {
        PlacesMathService,
      },
      PlacesMathService: {},
    },
  },
  instancesSchemes: { // instances preconfigured schemes and ctors // TODO: staticm methods on ctors
    PlacesMathService: new DependencyScheme<typeof PlacesMathService>(PlacesMathService, []),
    FSSearchAPI: new DependencyScheme<typeof FSSearchAPI>(FSSearchAPI, [{
      auth: AuthType.key,
      key: "fsq3h4BEyJeFMtuQn+DbFHiC+ZlKwH9RdhEh22ONKWNsgcI=",
      requestPayloadFormat: PayloadContentType.urlencoded,
      responsePayloadFormat: PayloadContentType.json,
      uri: "https://api.foursquare.com/v3/places/search",
      method: HTTPMethod.GET,
    }]),
    PlacesService: new DependencyScheme<typeof PlacesService>(PlacesService, []),
    PlacesView: new DependencyScheme<typeof PlacesView>(PlacesView, [
      document.querySelector("#closestPlace")!,
      document.getElementById("placesSection")!
    ]),
    PlacesCacheService: new DependencyScheme<typeof PlacesCacheService>(PlacesCacheService, [{
      cacheMaxSize: 100,
      currentSize: 0,
      cache: {},
    }]),
  },
}


type DependencyList = { [target: string]: { [dependency: string]: DependencyConstructor }};

// check libraries (DI)
type DependencyConfigType = {
  dependencies: {
    views: DependencyList,
    services: DependencyList,
  },
  instancesSchemes: Record<string, DependencyScheme<DependencyConstructor>>,
};

type DependencyContainerType = {
  instancesCache: Record<string, DependencySingleton>,
  // a way to access dependant instances (or create them)
  getDependenciesFor: (target: DependencySingleton) => Record<string, DependencySingleton>;
  // a way to access instances independently (or create them) (needed for 'main.ts', mainly)
  bootstrapInstance<T extends DependencySingleton>(ctor: new(...args: any[]) => T): T;
}

export type DependencyConstructor = new (...args: any[]) => DependencySingleton;