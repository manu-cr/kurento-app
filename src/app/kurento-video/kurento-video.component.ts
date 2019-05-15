import { AfterViewInit, Component, ElementRef, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { KurentoService, VideoStatus } from '../../services/kurento.service';
import { WebsocketService } from '../../services/websocket.service';

@Component({
  selector: 'app-kurento-video',
  templateUrl: './kurento-video.component.html',
  styleUrls: ['./kurento-video.component.scss'],
  providers: [WebsocketService, KurentoService],
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class.app-kurento-video]': 'true'
  }
})
export class KurentoVideoComponent implements AfterViewInit {

  @Input('camera')
  public cameraId: number;
  @Input('websocket')
  public webSocketUrl: string;

  protected loadingSub: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loading$ = this.loadingSub.asObservable();

  @ViewChild('video')
  protected video: ElementRef;

  constructor(
    protected kurentoService: KurentoService
  ) { }

  public ngAfterViewInit(): void {
    this.kurentoService.configure({
      cameraId: this.cameraId,
      webSocketUrl: this.webSocketUrl,
      videoComponent: this.video
    });
    this.kurentoService.status.subscribe(status => {
      if (VideoStatus.Loading === status) {
        this.loadingSub.next(true);
      } else {
        this.loadingSub.next(false);
      }
    });
  }

  public play(): void {
    this.kurentoService.start();
  }

}
