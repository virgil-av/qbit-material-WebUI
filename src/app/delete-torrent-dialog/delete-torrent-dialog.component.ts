import {Component, Inject, OnInit} from '@angular/core';
// Material UI Components
import {MatCheckboxChange} from '@angular/material/checkbox';
// Helpers
import {TorrentDataHTTPService} from '../services/torrent-management/torrent-data-http.service';
import {Torrent} from 'src/utils/Interfaces';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ThemeService} from '../services/theme.service';
import {Observable} from 'rxjs';

@Component({
  selector: 'app-delete-torrent-dialog',
  templateUrl: './delete-torrent-dialog.component.html',
  styleUrls: ['./delete-torrent-dialog.component.css']
})

export class DeleteTorrentDialogComponent implements OnInit {

  public torrentsToDelete: Torrent[];
  public deleteFilesOnDisk = false;
  public isLoading = false;
  public isDarkTheme: Observable<boolean>;
  private attemptedDelete = false;  // Keep track of whether any deletes were attempted

  constructor(private dialogRef: MatDialogRef<DeleteTorrentDialogComponent>,
              private TorrentService: TorrentDataHTTPService, @Inject(MAT_DIALOG_DATA) data,
              private theme: ThemeService) {
    this.torrentsToDelete = data.torrent;
  }

  ngOnInit(): void {
    this.isDarkTheme = this.theme.getThemeSubscription();
    console.log(this.torrentsToDelete);
  }

  updateDeleteFilesFromDisk(event: MatCheckboxChange): void {
    this.deleteFilesOnDisk = event.checked;
  }

  /** Delete a torrent
   * @param tor: The torrent in question.
   */
  handleTorrentDelete(): void {
    this.isLoading = true;
    this.attemptedDelete = true;

    this.TorrentService.DeleteTorrent(this.torrentsToDelete.map((elem) => elem.hash), this.deleteFilesOnDisk)
      .subscribe(
        (res: any) => {
          console.log(res);
          this.finishCallback(res);

        },
        (error: any) => {
          console.error(error);
          this.finishCallback(error);

        });
  }

  finishCallback(resp: any): void {
    console.log(resp);
    this.dialogRef.close({attemptedDelete: this.attemptedDelete});
  }
}
