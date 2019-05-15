import { AfterViewInit, Component, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
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

  protected loadingSub: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public loading$ = this.loadingSub.asObservable();

  @ViewChild('video')
  protected video: ElementRef;

  constructor(
    protected kurentoService: KurentoService
  ) { }

  public ngAfterViewInit(): void {
    this.kurentoService.configure(this.video.nativeElement);
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
