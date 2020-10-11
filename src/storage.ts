
type StorableFunction = () => Promise<any>;

class Storage {
  async get(key: string, fn: StorableFunction) {
    let data: string | null = localStorage.getItem(key);
    if (data) {
      return JSON.parse(data);
    }

    const obj = await fn();
    if (obj) {
      localStorage.setItem(key, JSON.stringify(obj));
    }

    return obj;
  }
}

export const storage = new Storage();
