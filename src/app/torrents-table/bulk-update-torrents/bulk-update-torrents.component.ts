import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {RowSelectionService} from 'src/app/services/torrent-management/row-selection.service';

@Component({
  selector: 'app-bulk-update-torrents',
  templateUrl: './bulk-update-torrents.component.html',
  styleUrls: ['./bulk-update-torrents.component.css']
})
export class BulkUpdateTorrentsComponent implements OnInit {

  @Output() onChange: EventEmitter<string> = new EventEmitter<string>();

  public torrentsSelected: string[] = [];
  public canUserEdit = false;
  private loading = false;
  private actions: {
    'cancel': () => void,
    'delete': () => void,
    'pause': () => void,
    'play': () => void,
    'forceStart': () => void,
    'increasePrio': () => void,
    'decreasePrio': () => void,
    'maxPrio': () => void,
    'minPrio': () => void
  };

  constructor(private torrentsSelectedService: RowSelectionService) {

    // Assign all possible actions
    this.actions = {
      cancel: () => this.onChange.emit('cancel'),
      delete: () => this.onChange.emit('delete'),
      pause: () => this.onChange.emit('pause'),
      play: () => this.onChange.emit('play'),
      forceStart: () => this.onChange.emit('forceStart'),
      increasePrio: () => this.onChange.emit('increasePrio'),
      decreasePrio: () => this.onChange.emit('decreasePrio'),
      maxPrio: () => this.onChange.emit('maxPrio'),
      minPrio: () => this.onChange.emit('minPrio')
    };
  }

  ngOnInit(): void {

    // Update state when new torrents are selected/un-selected
    this.torrentsSelectedService
      .getTorrentsSelected()
      .subscribe((newTorrents: string[]) => {

        this.torrentsSelected = newTorrents;
        newTorrents.length === 0 ? this.canUserEdit = false : this.canUserEdit = true;
      });
  }

  /** Get appropriate message to display in snackbar */
  public getBulkEditMessage(): string {
    const numTorrentsSelected = this.torrentsSelected.length;

    return numTorrentsSelected === 0 ? `` : numTorrentsSelected === 1 ?
      `1 torrent selected.` : `${numTorrentsSelected} torrents selected.`;
  }

  public handleBulkActions(action: string): void {
    this.loading = true;
    this.actions[action]();
    this.loading = false;
  }

  public clearSelectedTorrents(): void {
    this.torrentsSelectedService.clearSelection();
  }

  public isLoading(): boolean {
    return this.loading;
  }

}
