import { Observable, Subject } from 'rxjs';
import { singleton } from 'tsyringe';

export class NetworkStat {
  constructor(
    public readonly bytesIn: number,
    public readonly bytesOut: number
  ) {}

  public formatIn(): string {
    return `${this.formatBytes(this.bytesIn)}/s`;
  }

  public formatOut(): string {
    return `${this.formatBytes(this.bytesOut)}/s`;
  }

  public formatBytes(bytes: number, decimals = 2): string {
    if (bytes === 0) {
      return '0 B';
    }
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(dm)) + ' ' + sizes[i];
  }
}

@singleton()
export class Stats {
  private bytesIn = 0;
  private bytesOut = 0;

  private netStats = new Subject<NetworkStat>();

  public start(): void {
    setInterval(() => this.update(), 1000);
  }

  public recordIn(bytes: number): void {
    this.bytesIn += bytes;
  }

  public recordOut(bytes: number): void {
    this.bytesOut += bytes;
  }

  public getNetStats(): Observable<NetworkStat> {
    return this.netStats.asObservable();
  }

  private update(): void {
    this.netStats.next(new NetworkStat(this.bytesIn, this.bytesOut));
    this.bytesIn = 0;
    this.bytesOut = 0;
  }
}
