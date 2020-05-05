import {Injectable} from '@angular/core';
import {TorrentDataStoreService} from '../torrent-management/torrent-data-store.service';
import {FileSystemService} from './file-system.service';
import TreeNode from './TreeNode';
import {Torrent} from 'src/utils/Interfaces';

@Injectable({
  providedIn: 'root'
})
export class FileDirectoryExplorerService {

  public isFileSystemLoaded = false;
  private directories: string[] = [];
  private root: TreeNode = null;

  constructor(private data_store: TorrentDataStoreService, private fs: FileSystemService) {
    this.getData();
  }

  public getFileSystem(): TreeNode {
    return this.fs.getFileSystem();
  }

  private async getData(): Promise<void> {
    const data = await this.data_store.GetTorrentData(0);   // Need all torrents, so we use RID=0
    this.updateDirectories(data.torrents);
  }

  /** Callback for when data in data_store is updated */
  private async updateDirectories(torrents: Torrent[]): Promise<void> {

    // Need to extract all unique save paths from list of torrents
    const set_of_dir = new Set<string>();

    torrents.forEach((elem: Torrent) => {
      set_of_dir.add(elem.save_path);
    });

    this.fs.populateFileSystem([...set_of_dir]);

    // console.log("\n**Printing File System **")
    // this.fs.printFileSystem();
    // console.log("**End of File System **\n")

    this.isFileSystemLoaded = true;
  }
}
