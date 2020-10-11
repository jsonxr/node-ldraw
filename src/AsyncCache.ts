export type AsyncFunction<T> = () => Promise<T | null>;
type CallbackFunction<T> = (err: any, value: T | null | undefined) => void;

class Defered<T> {
  public value: T | undefined | null;
  private listeners: CallbackFunction<T>[] | null = [];

  constructor(value?: T | null) {
    this.value = value;
  }

  public async execute(fn: AsyncFunction<T>) {
    let error: any;
    try {
      const v = await fn();
      this.value = v;
    } catch (err) {
      this.value = null;
      error = err;
    }

    // Notify interested listeners
    this.listeners!.forEach(cb => cb(error, this.value));
    this.listeners = [];
  }

  public async onComplete() {
    if (this.value || this.value === null) {
      return this.value;
    }

    // This allows many files to await this download
    return new Promise<any>((resolve, reject) => {
      this.listeners!.push((err: any) => {
        if (err) {
          return reject(err);
        }
        resolve(this.value);
      })
    })
  }

}

export class AsyncCache<T> {
  private list: Record<string, Defered<T>> = {}

  public set(key: string, value: Defered<T> | T): void {
    const o: any = value;
    if (typeof o.execute === 'function') {
      this.list[key] = value as Defered<T>;
    } else {
      this.list[key] = new Defered(o as T);
    }
  }

  public async get(key: string, fn: AsyncFunction<T>): Promise<T | null> {
    let d: Defered<T> | undefined = this.list[key];

    // If there isn't a download yet, create one
    if (!d) {
      d = new Defered<T>();
      d.execute(fn);
      this.set(key, d);
    }

    return d.onComplete();
  }
}
