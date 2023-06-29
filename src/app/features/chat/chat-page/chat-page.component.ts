import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  TemplateRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import {
  ChannelActionsContext,
  ChannelPreviewContext,
  ChannelService,
  ChatClientService,
  CustomTemplatesService,
  StreamI18nService,
} from 'stream-chat-angular';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../auth/auth.service';
import { Observable, switchMap, map, catchError, of, from } from 'rxjs';
@Component({
  selector: 'app-chat-page',
  templateUrl: './chat-page.component.html',
  styleUrls: ['./chat-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPageComponent implements OnInit, AfterViewInit {
  chatIsReady$!: Observable<boolean>;

  @ViewChild('channelsActionsTemplate')
  private channelsActionsTemplate!: TemplateRef<ChannelActionsContext>;

  @ViewChild('channelPreview')
  private channelPreview!: TemplateRef<ChannelPreviewContext>;

  constructor(
    private chatService: ChatClientService,
    private channelService: ChannelService,
    private streamI18nService: StreamI18nService,
    private auth: AuthService,
    private customTemplatesService: CustomTemplatesService
  ) {}

  ngOnInit(): void {
    this.streamI18nService.setTranslation();
    this.chatIsReady$ = this.auth.getStreamToken().pipe(
      switchMap((streamToken) =>
        this.chatService.init(
          environment.stream.key,
          this.auth.getCurrentUser().uid,
          streamToken
        )
      ),
      switchMap(() =>
        this.channelService.init({
          type: 'messaging',
          members: { $in: [this.auth.getCurrentUser().uid] },
        })
      ),
      map(() => true),
      catchError(() => of(false))
    );
  }

  ngAfterViewInit(): void {
    this.customTemplatesService.channelPreviewTemplate$.next(
      this.channelPreview
    );
    this.customTemplatesService.channelActionsTemplate$.next(
      this.channelsActionsTemplate
    );
  }

  onCreate(name: string) {
    const dasherizedName = name.replace(/\s+/g, '-').toLocaleLowerCase();
    const channel = this.chatService.chatClient.channel(
      'messaging',
      dasherizedName,

      {
        name,
        members: [this.auth.getCurrentUser().uid],
      }
    );
    from(channel.create());
  }
}
