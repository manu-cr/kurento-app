import { ElementRef, Injectable, OnDestroy, Output } from '@angular/core';
import * as kurentoUtils from 'kurento-utils';
import { BehaviorSubject, Subscription } from 'rxjs';

import { WebsocketService } from './websocket.service';

export interface KurentoServiceConfig {
  cameraId: number;
  webSocketUrl: string;
  videoComponent: ElementRef;
}

export enum VideoStatus {
  Loading,
  Play,
  Stop
}

@Injectable()
export class KurentoService implements OnDestroy {

  @Output()
  public status: BehaviorSubject<VideoStatus> = new BehaviorSubject(VideoStatus.Stop);

  protected cameraId: number;
  protected webSocketUrl: string;
  protected video: any;
  protected webRtcPeer: any;
  protected wsSubscription: Subscription;

  constructor(protected wsService: WebsocketService) { }

  public ngOnDestroy(): void {
    this.wsSubscription.unsubscribe();
  }

  public configure(config: KurentoServiceConfig): void {
    this.cameraId = config.cameraId;
    this.webSocketUrl = config.webSocketUrl;
    this.video = config.videoComponent.nativeElement;
    this.wsSubscription = this.wsService.initSocket(this.webSocketUrl).subscribe(
      message => {
        const parsedMessage = JSON.parse(message.data);

        switch (parsedMessage.id) {
          case 'startResponse':
            this.startResponse(parsedMessage);
            break;
          case 'error':
            if (this.status.getValue() === VideoStatus.Loading) {
              this.status.next(VideoStatus.Stop);
            }
            console.error('Error message from server: ' + parsedMessage.message);
            break;
          case 'playEnd':
            this.playEnd();
            break;
          case 'videoInfo':
            console.info('Video info: ', parsedMessage);
            break;
          case 'iceCandidate':
            this.webRtcPeer.addIceCandidate(parsedMessage.candidate, error => {
              if (error) {
                return console.error('Error adding candidate: ' + error);
              }
            });
            break;
          default:
            if (this.status.getValue() === VideoStatus.Loading) {
              this.status.next(VideoStatus.Stop);
            }
            console.error('Unrecognized message', parsedMessage);
        }

      },
      error => console.error(error)
    );
    // this.wsService.ready.subscribe(() => this.start());
  }

  public start(): void {
    this.status.next(VideoStatus.Loading);

    const options = {
      remoteVideo: this.video,
      onicecandidate: candidate => {
        const message = {
          id: 'onIceCandidate',
          candidate: candidate
        };
        this.sendMessage(message);
      }
    };

    this.webRtcPeer = new kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options,
      error => {
        if (error) {
          return console.error(error);
        }
        this.webRtcPeer.generateOffer((a, b) => this.onOffer(a, b));
      });
  }

  public onOffer(error, offerSdp): void {
    if (error) {
      return console.error('Error generating the offer');
    }

    const message = {
      id: 'start',
      sdpOffer: offerSdp,
      videourl: this.cameraId
    };
    this.sendMessage(message);
  }

  public sendMessage(message): void {
    const jsonMessage = JSON.stringify(message);
    this.wsService.send(jsonMessage);
  }

  public startResponse(message): void {
    // this.status.next(VideoStatus.Play);
    // console.log('SDP answer received from server. Processing ...');
    this.webRtcPeer.processAnswer(message.sdpAnswer, error => {
      if (error) {
        return console.error(error);
      }
    });
  }

  public playEnd(): void {
    this.status.next(VideoStatus.Stop);
  }

}
