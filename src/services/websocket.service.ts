import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable()
export class WebsocketService {

  public wSocket: WebSocket;

  public initSocket(url: string): Observable<any> {
    this.wSocket = new WebSocket(url);

    return new Observable<any>(observer => {
      this.wSocket.onmessage = (event: MessageEvent) => observer.next(event);
      this.wSocket.onerror = (event: MessageEvent) => observer.error(event);
      this.wSocket.onclose = (event: CloseEvent) => observer.complete();

      // Callback invoked on unsubscribe
      return () => this.wSocket.close();
    });
  }

  public send(message: string): void {
    if (this.wSocket.readyState === WebSocket.OPEN) {
      this.wSocket.send(message);
    }
  }

}
