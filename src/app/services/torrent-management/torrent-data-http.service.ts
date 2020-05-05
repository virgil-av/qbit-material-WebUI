import {Injectable} from '@angular/core';
import {ApplicationBuildInfo, MainData} from 'src/utils/Interfaces';
import {Observable} from 'rxjs';
// Utils
import * as http_config from '../../../assets/http_config.json';
import {IsDevEnv} from 'src/utils/Environment';
import {HttpClient} from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TorrentDataHTTPService {

  private http_endpoints: any;

  constructor(private http: HttpClient) {
    this.http_endpoints = http_config.endpoints;
  }

  /** Get all torrent data from server
   * @param RID The rid key for changelogs. Set to 0 if you want all data instead of changes from previous.
   */
  GetAllTorrentData(RID: number): Observable<MainData> {

    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.torrentList;
    const url = root + endpoint + `?rid=${RID}`;

    // Do not send cookies in dev mode
    const options = IsDevEnv() ? {} : {withCredentials: true};

    return this.http.get<MainData>(url, options);
  }

  /** Send batch of 1 or more torrents to server for enqueue.
   * @param files The files to upload.
   */
  async UploadNewTorrents(files: FileList[], destination: string): Promise<any> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.uploadTorrents;
    const url = root + endpoint;

    // Do not send cookies in dev mode
    const options = IsDevEnv() ? {} : {withCredentials: true, responseType: 'text', observe: 'response'};

    const result = await this.sendFiles(files, url, options, destination);
    return result;
  }

  /** Delete a torrent.
   * @param hashes The unique hash of the torrent.
   * @param deleteFromDisk If the files should be deleted as well (true),
   * or if they should persist (false).
   */
  DeleteTorrent(hashes: string[], deleteFromDisk: boolean): Observable<any> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.deleteTorrent;
    const url = root + endpoint;

    // body parameters
    const body = new FormData();
    body.append('hashes', hashes.join('|'));
    body.append('deleteFiles', `${deleteFromDisk}`);

    // Do not send cookies in dev mode
    const options = IsDevEnv() ? {} : {withCredentials: true};

    return this.http.post(url, body, options);
  }

  /** Pause given array of torrents
   * @param hashes The hashes of the torrents to pause.
   */
  PauseTorrents(hashes: string[]): Observable<any> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.pauseTorrents;
    const url = root + endpoint;

    return this.sendTorrentHashesPOST(url, hashes);
  }

  /** Resume the given array of torrents
   * @param hashes The hashes of the torrents to resume.
   */
  PlayTorrents(hashes: string[]): Observable<any> {

    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.playTorrents;
    const url = root + endpoint;

    return this.sendTorrentHashesPOST(url, hashes);
  }

  /** Force start the given torrents
   * @param hashes The hashes of the torrents to force start
   */
  ForceStartTorrents(hashes: string[]): Observable<any> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.forceStart;
    const url = root + endpoint;

    const body = new FormData();
    body.append('hashes', hashes.join('|'));
    body.append('value', 'true');

    return this.sendTorrentHashesPOST(url, hashes, null, body);
  }

  /** Increase the priority of given torrents
   * @param hashes The hashes of torrents to modify
   */
  IncreaseTorrentPriority(hashes: string[]): Observable<any> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.increasePrio;
    const url = root + endpoint;

    return this.sendTorrentHashesPOST(url, hashes);
  }

  /** Decrease the priority of given torrents
   * @param hashes The hashes of torrents to modify
   */
  DecreaseTorrentPriority(hashes: string[]): Observable<any> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.decreasePrio;
    const url = root + endpoint;

    return this.sendTorrentHashesPOST(url, hashes);
  }

  /** Give the torrents maximum possible priority
   * @param hashes The hashes of torrents to modify
   */
  SetMaximumPriority(hashes: string[]): Observable<any> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.maxPrio;
    const url = root + endpoint;

    return this.sendTorrentHashesPOST(url, hashes);
  }

  /** Given the torrents lowest possible priority
   * @param hashes The hashes of torrents to modify
   */
  SetMinimumPriority(hashes: string[]): Observable<any> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.minPrio;
    const url = root + endpoint;

    return this.sendTorrentHashesPOST(url, hashes);
  }

  async GetApplicationBuildInfo(): Promise<ApplicationBuildInfo> {
    const root = this.http_endpoints.root;
    const endpoint = this.http_endpoints.applicationVersion;
    const endpoint_2 = this.http_endpoints.apiVersion;
    const url = root + endpoint;
    const url_2 = root + endpoint_2;

    // Do not send cookies in dev mode
    const options = IsDevEnv() ? {responseType: 'text'} : {withCredentials: true, responseType: 'text'};

    // @ts-ignore It keeps complaining about the 'text' response type...won't allow any builds unless it's ignored
    const app_version = await this.http.get<string>(url, options).toPromise();

    // @ts-ignore It keeps complaining about the 'text' response type...won't allow any builds unless it's ignored
    const api_version = await this.http.get<string>(url_2, options).toPromise();

    return {appVersion: app_version, apiVersion: api_version};
  }

  /** Send a list of torrent hashes joined by "|" to a given endpoint
   * This functionality is used across many common actions
   * @param endpoint The endpoint to send a POST request to
   * @param options The options to pass in during POST request;
   * default is { withCredentials: true } if prod, { } otherwise
   * @param hashes List of torrent hashes to send
   * @param body The body to use; default is FormData with hashes joined by "|"
   */
  private sendTorrentHashesPOST(endpoint: string, hashes: string[], options?: any, body?: any): Observable<any> {

    // Do not send cookies in dev mode
    options = options || IsDevEnv() ? {} : {withCredentials: true};

    // body parameters
    if (!body) {
      body = new FormData();
      body.append('hashes', hashes.join('|'));
    }

    return this.http.post(endpoint, body, options);
  }

  /** Upload file(s) to server
   * @param files An array of File objects
   * @param endpoint The URL to send the files to
   * @param options Options to pass to POST request
   */
  private sendFiles(files: any, endpoint: string, options: any, savePath: string | void): Promise<any> {
    const formData = new FormData();

    if (savePath) {
      formData.append('savepath', savePath);
    }

    for (const file of files) {
      formData.append('torrents', file, file.name);
    }

    return this.http.post(endpoint, formData, options).toPromise();
  }
}
