export class ServiceProvider {
  static directory: { [serviceName: string]: any } = {};

  static register(service: Service, instance: any) {
    if (ServiceProvider.directory.hasOwnProperty(service)) {
      throw new Error(`Provider already has a service '${service}' registered.`);
    }

    ServiceProvider.directory[service] = instance;
  }

  static lookup(service: Service): any {
    return ServiceProvider.directory[service];
  }
}

export enum Service {
  RNG,
  SOUND,
  PIPELINE,
  UI,
  GAME,
}