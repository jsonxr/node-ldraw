export type AsyncFunction<T> = () => Promise<T | null>;
type CallbackFunction<T> = (err: any, value: T | null) => void;

class Defered<T> {
  public value: T | null = null;
  private listeners: CallbackFunction<T>[] | null = [];

  public async execute(fn: AsyncFunction<T>) {
    let error: any;
    try {
      this.value = await fn();
    } catch (err) {
      error = err;
    }

    // Notify interested listeners
    this.listeners?.forEach(cb => cb(error, this.value));
    this.listeners = null;
  }

  public async onComplete() {
    if (this.value) {
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

  public async get(key: string, fn: AsyncFunction<T>) {
    let d: Defered<T> | undefined = this.list[key];

    // If there isn't a download yet, create one
    if (!d) {
      d = new Defered<T>();
      d.execute(fn);
      this.list[name] = d;
    }

    return d.onComplete();
  }
}
