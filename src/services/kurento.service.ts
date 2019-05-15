import { Injectable, OnDestroy, Output } from '@angular/core';
import * as kurentoUtils from 'kurento-utils';
import { BehaviorSubject, Subscription } from 'rxjs';

import { WebsocketService } from './websocket.service';

export enum VideoStatus {
  Loading,
  Play,
  Stop
}

@Injectable()
export class KurentoService implements OnDestroy {

  // TODO: this must be configurable
  public CAMERA_ID: number = 3;
  public WEBSOCKET_URL: string = 'ws://10.7.0.42:9090/cameraViewer';

  @Output()
  public status: BehaviorSubject<VideoStatus> = new BehaviorSubject(VideoStatus.Stop);

  protected video: any;
  protected webRtcPeer: any;
  protected wsSubscription: Subscription;

  constructor(protected wsService: WebsocketService) { }

  public ngOnDestroy(): void {
    this.wsSubscription.unsubscribe();
  }

  public configure(video: any): void {
    this.video = video;
    this.wsSubscription = this.wsService.initSocket(this.WEBSOCKET_URL).subscribe(
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
      error => console.error(error),
      () => console.log('THE COMPLETITION!!!!!!!!!!!!!!!!!!!!!')
    );
  }

  public start(): void {

    this.status.next(VideoStatus.Loading);
    // Video and audio by default
    const userMediaConstraints = {
      audio: true,
      video: true
    };

    const options = {
      remoteVideo: this.video,
      onicecandidate: candidate => {
        console.log('Local candidate' + JSON.stringify(candidate));

        const message = {
          id: 'onIceCandidate',
          candidate: candidate
        };
        this.sendMessage(message);
      }
    };

    console.info('User media constraints ', userMediaConstraints);

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
    console.info('Invoking SDP offer callback function ' + location.host);

    const message = {
      id: 'start',
      sdpOffer: offerSdp,
      videourl: this.CAMERA_ID
    };
    this.sendMessage(message);
  }

  public sendMessage(message): void {
    const jsonMessage = JSON.stringify(message);
    console.log('Senging message: ' + jsonMessage);
    this.wsService.send(jsonMessage);
  }

  public startResponse(message): void {
    // this.status.next(VideoStatus.Play);
    console.log('SDP answer received from server. Processing ...');

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
