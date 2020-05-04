import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Torrent, TorrentContents } from 'src/utils/Interfaces';
import { UnitsHelperService } from '../services/units-helper.service';
import { PrettyPrintTorrentDataService } from '../services/pretty-print-torrent-data.service';
import { ThemeService } from '../services/theme.service';
import { Observable } from 'rxjs';
import { TorrentDataStoreService } from '../services/torrent-management/torrent-data-store.service';
import { NetworkConnectionInformationService } from '../services/network/network-connection-information.service';

@Component({
  selector: 'app-torrent-info-dialog',
  templateUrl: './torrent-info-dialog.component.html',
  styleUrls: ['./torrent-info-dialog.component.css']
})
export class TorrentInfoDialogComponent implements OnInit {

  public torrent: Torrent = null;
  public torrentContents: TorrentContents = null;
  public isDarkTheme: Observable<boolean>;

  private REFRESH_INTERVAL: any;

  constructor(@Inject(MAT_DIALOG_DATA) data: any, private units_helper: UnitsHelperService,
              private pp: PrettyPrintTorrentDataService, private theme: ThemeService, private data_store: TorrentDataStoreService,
              private network_info: NetworkConnectionInformationService) {
    this.torrent = data.torrent;
  }

  ngOnInit(): void {
    this.isDarkTheme = this.theme.getThemeSubscription();

    this.REFRESH_INTERVAL = setInterval(() => {
      this.data_store.GetTorrentContents(this.torrent).subscribe(res => {
        this.torrentContents = res;
        console.log(res);
      })
    }, this.network_info.get_recommended_torrent_refresh_interval());
  }

  ngOnDestroy(): void {
    if(this.REFRESH_INTERVAL) { clearInterval(this.REFRESH_INTERVAL) }
  }

  added_on(): string {
    return this.units_helper.GetDateString(this.torrent.added_on);
  }

  completed_on(): string {
    return this.pp.pretty_print_completed_on(this.torrent.completion_on);
  }

  last_activity(): string {
    return this.pp.pretty_print_completed_on(this.torrent.last_activity)
  }

  total_size(): string {
    return this.units_helper.GetFileSizeString(this.torrent.total_size);
  }

  downloaded(): string {
    return this.units_helper.GetFileSizeString(this.torrent.downloaded);
  }

  state(): string {
    return this.pp.pretty_print_status(this.torrent.state);
  }

}
