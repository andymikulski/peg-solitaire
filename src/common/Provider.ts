export class Provider {
  static directory: { [serviceName: string]: any } = {};

  static register(service: Service, instance: any) {
    if (Provider.directory.hasOwnProperty(service)) {
      throw new Error(`Provider already has a service '${service}' registered.`);
    }

    Provider.directory[service] = instance;
  }

  static lookup(service: Service): any {
    return Provider.directory[service];
  }
}

export enum Service {
  RNG,
  SOUND,
  PIPELINE,
  UI,
  GAME,
}