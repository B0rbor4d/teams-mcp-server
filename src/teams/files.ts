import type { Client } from '@microsoft/microsoft-graph-client';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  webUrl: string;
  downloadUrl?: string;
  createdDateTime: string;
  lastModifiedDateTime: string;
  createdBy: string;
  folder?: boolean;
}

export class FilesService {
  constructor(private client: Client) {}

  /**
   * Listet Dateien in einem Teams-Kanal auf
   */
  async listChannelFiles(teamId: string, channelId: string): Promise<FileItem[]> {
    try {
      // Zugriff auf den Dokumente-Ordner des Kanals
      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/filesFolder/children`)
        .get();

      return response.value.map((item: any) => ({
        id: item.id,
        name: item.name,
        size: item.size || 0,
        webUrl: item.webUrl,
        downloadUrl: item['@microsoft.graph.downloadUrl'],
        createdDateTime: item.createdDateTime,
        lastModifiedDateTime: item.lastModifiedDateTime,
        createdBy: item.createdBy?.user?.displayName || 'Unknown',
        folder: !!item.folder,
      }));
    } catch (error) {
      console.error('Error listing channel files:', error);
      throw new Error(`Failed to list channel files: ${error}`);
    }
  }

  /**
   * Lädt eine Datei aus einem Teams-Kanal herunter
   */
  async downloadChannelFile(
    teamId: string,
    channelId: string,
    fileId: string
  ): Promise<{ content: Buffer; fileName: string; mimeType: string }> {
    try {
      // Datei-Informationen abrufen
      const fileInfo = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/filesFolder/children/${fileId}`)
        .get();

      const downloadUrl = fileInfo['@microsoft.graph.downloadUrl'];

      if (!downloadUrl) {
        throw new Error('No download URL available for this file');
      }

      // Datei herunterladen
      const response = await fetch(downloadUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      return {
        content: buffer,
        fileName: fileInfo.name,
        mimeType: fileInfo.file?.mimeType || 'application/octet-stream',
      };
    } catch (error) {
      console.error('Error downloading file:', error);
      throw new Error(`Failed to download file: ${error}`);
    }
  }

  /**
   * Lädt eine Datei in einen Teams-Kanal hoch
   */
  async uploadChannelFile(
    teamId: string,
    channelId: string,
    fileName: string,
    content: Buffer | string
  ): Promise<FileItem> {
    try {
      const buffer = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;

      // Datei hochladen
      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/filesFolder/children/${fileName}/content`)
        .put(buffer);

      return {
        id: response.id,
        name: response.name,
        size: response.size || 0,
        webUrl: response.webUrl,
        downloadUrl: response['@microsoft.graph.downloadUrl'],
        createdDateTime: response.createdDateTime,
        lastModifiedDateTime: response.lastModifiedDateTime,
        createdBy: response.createdBy?.user?.displayName || 'Me',
        folder: false,
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error(`Failed to upload file: ${error}`);
    }
  }

  /**
   * Löscht eine Datei aus einem Teams-Kanal
   */
  async deleteChannelFile(
    teamId: string,
    channelId: string,
    fileId: string
  ): Promise<void> {
    try {
      await this.client
        .api(`/teams/${teamId}/channels/${channelId}/filesFolder/children/${fileId}`)
        .delete();
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error(`Failed to delete file: ${error}`);
    }
  }

  /**
   * Erstellt einen Ordner in einem Teams-Kanal
   */
  async createChannelFolder(
    teamId: string,
    channelId: string,
    folderName: string
  ): Promise<FileItem> {
    try {
      const folderData = {
        name: folderName,
        folder: {},
        '@microsoft.graph.conflictBehavior': 'rename',
      };

      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/filesFolder/children`)
        .post(folderData);

      return {
        id: response.id,
        name: response.name,
        size: 0,
        webUrl: response.webUrl,
        createdDateTime: response.createdDateTime,
        lastModifiedDateTime: response.lastModifiedDateTime,
        createdBy: response.createdBy?.user?.displayName || 'Me',
        folder: true,
      };
    } catch (error) {
      console.error('Error creating folder:', error);
      throw new Error(`Failed to create folder: ${error}`);
    }
  }

  /**
   * Sucht Dateien in einem Teams-Kanal
   */
  async searchChannelFiles(
    teamId: string,
    channelId: string,
    query: string
  ): Promise<FileItem[]> {
    try {
      const allFiles = await this.listChannelFiles(teamId, channelId);

      // Einfache Suche im Dateinamen
      return allFiles.filter((file) =>
        file.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching files:', error);
      throw new Error(`Failed to search files: ${error}`);
    }
  }

  /**
   * Holt Datei-Metadaten
   */
  async getFileMetadata(
    teamId: string,
    channelId: string,
    fileId: string
  ): Promise<FileItem> {
    try {
      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/filesFolder/children/${fileId}`)
        .get();

      return {
        id: response.id,
        name: response.name,
        size: response.size || 0,
        webUrl: response.webUrl,
        downloadUrl: response['@microsoft.graph.downloadUrl'],
        createdDateTime: response.createdDateTime,
        lastModifiedDateTime: response.lastModifiedDateTime,
        createdBy: response.createdBy?.user?.displayName || 'Unknown',
        folder: !!response.folder,
      };
    } catch (error) {
      console.error('Error getting file metadata:', error);
      throw new Error(`Failed to get file metadata: ${error}`);
    }
  }

  /**
   * Teilt eine Datei und generiert einen Freigabe-Link
   */
  async shareChannelFile(
    teamId: string,
    channelId: string,
    fileId: string,
    scope: 'anonymous' | 'organization' = 'organization'
  ): Promise<{ link: string; type: string }> {
    try {
      const shareData = {
        type: scope === 'anonymous' ? 'view' : 'edit',
        scope: scope,
      };

      const response = await this.client
        .api(`/teams/${teamId}/channels/${channelId}/filesFolder/children/${fileId}/createLink`)
        .post(shareData);

      return {
        link: response.link?.webUrl || response.webUrl,
        type: response.type,
      };
    } catch (error) {
      console.error('Error sharing file:', error);
      throw new Error(`Failed to share file: ${error}`);
    }
  }
}
